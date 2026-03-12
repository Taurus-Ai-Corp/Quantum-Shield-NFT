# Spec 1: Auth + Database — Quantum Shield NFT

**Date**: 2026-03-12
**Status**: Approved (brainstorming complete)
**Scope**: Authentication, database schema, API auth bridge
**Part of**: Full MVP Sprint (Spec 1 of 6)

---

## Context

Quantum Shield NFT scored 3/10 on production readiness. The #1 blocker is authentication — `web/src/auth.ts` has `providers: []`, meaning nobody can log in. The dashboard has well-built UI shells but all data is hardcoded. The Fastify API uses in-memory `Map` storage.

This spec delivers the foundation that all other specs depend on:
- Users can register and log in
- Data persists in PostgreSQL
- Dashboard reads come from the database
- Shield creation writes go through Fastify (where crypto logic lives)

## Decisions Made

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Auth providers | Credentials + GitHub OAuth | Email/password for enterprise, GitHub for devs |
| Database | Neon (serverless PostgreSQL) | Auto-scales to zero, great Vercel integration, free tier |
| ORM | Prisma with `@prisma/adapter-neon` | Consistent with gridera project, type-safe |
| Session strategy | JWT | Vercel serverless functions are stateless; avoids DB round-trip per request |
| Architecture | Hybrid | Reads via Next.js API routes (Prisma direct), writes via Fastify (crypto/Hedera logic) |
| API auth (internal) | Shared service token | Next.js → Fastify communication, never exposed to browser |
| API auth (external) | Per-user API key | For SDK/CLI users calling Fastify directly |

## Build Sequence (Full MVP Sprint)

| Spec | Subsystem | Depends On |
|------|-----------|------------|
| **1 (this)** | Auth + Database | — (foundation) |
| 2 | API Wiring | Spec 1 |
| 3 | Wallet Bridge (Hedera HTS/HCS) | Spec 2 |
| 4 | Dashboard + Shield UX | Specs 1-3 |
| 5 | CI/CD Pipeline | Independent |
| 6 | Error Monitoring + Production | Specs 1-5 |

---

## 1. Database Schema

Prisma schema with 7 models: 4 for NextAuth, 3 for domain logic.

**Location**: `web/prisma/schema.prisma`

```prisma
datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_DATABASE_URL")
}

generator client {
  provider        = "prisma-client-js"
  previewFeatures = ["driverAdapters"]
}
```

### NextAuth Models

| Model | Purpose |
|-------|---------|
| `User` | Core user record. `hashedPassword` (null for OAuth-only), `apiKey` (for Fastify API access), `role` enum (USER/ADMIN) |
| `Account` | OAuth provider accounts (GitHub). Linked to User via `userId` |
| `Session` | Server-side sessions. `sessionToken` unique |
| `VerificationToken` | Email verification tokens. Compound unique on `[identifier, token]` |

### Domain Models

| Model | Purpose | Key Fields |
|-------|---------|------------|
| `Shield` | Core shield records (replaces in-memory Map) | `shieldId` (public QS-xxx), `assetId`, `assetType` enum, `name`, `description?`, `metadata` Json?, `owner`, `category?`, `integrityHash`, `signatureAlgorithm` (default ML-DSA-65), `publicKey?`, `signature?`, `hederaTopicId?`, `hederaTransactionId?`, `hederaStatus` enum (PENDING/ANCHORED/FAILED), `status` enum (ACTIVE/REVOKED/MIGRATING/EXPIRED), `userId` FK, `createdAt`, `updatedAt` |
| `ProvenanceEvent` | Shield history chain | `shieldId` FK, `eventType` (CREATED/TRANSFERRED/VERIFIED/MIGRATED), `actor`, `description?`, `txHash?`, `createdAt` |
| `ComplianceRecord` | Compliance check results | `shieldId` FK, `standard` (NIST_FIPS_203/204, EU_AI_ACT), `status`, `score?`, `details` Json?, `checkedAt` |

### Enums

- `UserRole`: USER, ADMIN
- `AssetType`: NFT, IP, DOCUMENT, DATA
- `ShieldStatus`: ACTIVE, REVOKED, MIGRATING, EXPIRED
- `HederaStatus`: PENDING, ANCHORED, FAILED

### Indexes

- `Shield`: `@@index([userId])`, `@@index([assetId])`
- `ProvenanceEvent`: `@@index([shieldId])`
- `ComplianceRecord`: `@@index([shieldId])`

### Design Notes

- `directUrl` is Neon-specific: Prisma Migrate needs a direct (non-pooled) connection for DDL operations
- `apiKey` on User enables hybrid auth — dashboard uses NextAuth sessions, external API uses per-user keys
- `HederaStatus.PENDING` allows shields to exist before blockchain anchoring completes (async pattern for Spec 3)
- `metadata` and `details` use Prisma `Json` type for flexible schema-less data
- `AssetType` enum uses uppercase (NFT, IP, DOCUMENT, DATA); the proxy layer maps from lowercase API input
- Neon free tier: 5 concurrent pooled connections, 1 direct. Add `?connection_limit=5` to `DATABASE_URL`

### Migration Strategy

- Development: use `npx prisma db push` for rapid iteration (no migration files)
- Pre-production: switch to `npx prisma migrate dev --name init_auth_and_shields` for versioned migrations
- Never use `db push` in production

---

## 2. Auth Configuration

**Location**: `web/src/auth.ts`

### Providers

1. **Credentials**: Email + password. Validates against `user.hashedPassword` using `bcrypt.compare()`. Returns `null` on invalid credentials (NextAuth convention).

2. **GitHub OAuth**: Standard OAuth flow via `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`. Uses `PrismaAdapter` to auto-create User + Account records on first login.

### Session Strategy

JWT-based (`strategy: 'jwt'`). The `jwt` callback attaches `user.id` to the token. The `session` callback copies `token.id` to `session.user.id`.

Rationale: Vercel serverless functions are stateless — JWT avoids a DB round-trip on every request. Trade-off: can't revoke sessions server-side (acceptable for MVP).

### Route Protection

The `authorized` callback checks protected paths under the `(dashboard)` route group: `/dashboard`, `/dashboard/shield`, `/dashboard/verify`, `/dashboard/compliance`. Unauthenticated users are redirected to `/login`.

The `middleware.ts` exports the auth middleware with matcher `'/dashboard/:path*'` which covers all dashboard sub-routes.

### Session Configuration

JWT `maxAge` set to 24 hours (86400 seconds) to limit session lifetime. Silent refresh via NextAuth's built-in token rotation.

### Registration

`POST /api/auth/register` endpoint:
1. Validates email + password (min 8 chars)
2. Checks for existing user (409 if duplicate)
3. Hashes password with `bcrypt.hash(password, 12)` (12 rounds)
4. Generates API key: `qsnft_` + 32 random bytes (hex)
5. Creates user via Prisma
6. Returns `{ id, name, email }` (no password/key in response)

### Prisma Singleton

`web/src/lib/prisma.ts` uses the `globalForPrisma` pattern to prevent connection exhaustion during Next.js hot-reloads in development.

### Type Extension

`web/src/types/next-auth.d.ts` augments the NextAuth `Session` type to include `user.id: string`.

---

## 3. API Auth Bridge

### Architecture

```
Browser → Next.js (Vercel) → Prisma (reads)
Browser → Next.js (Vercel) → Fastify (writes/crypto)
CLI/SDK → Fastify (direct, API key)
```

### Two Auth Paths into Fastify

#### Path 1: Internal (Next.js → Fastify)

- Next.js API routes add `X-Service-Token` and `X-User-Id` headers
- Fastify `requireServiceAuth` middleware validates the shared `INTERNAL_SERVICE_TOKEN` using `crypto.timingSafeEqual()`
- The `X-User-Id` is trusted because the service token proves the request came from the authenticated Next.js layer

#### Path 2: External (CLI/SDK → Fastify)

- Client sends `X-API-Key` header
- Fastify `requireApiKey` middleware looks up the key in the database
- Returns the associated `user.id` and `role`
- Used by: CLI tools, SDK integrations, third-party developers

### Proxy Pattern (Dashboard Writes)

Next.js API route (e.g., `POST /api/shield/create`):
1. Validates NextAuth session (`auth()`)
2. Forwards request body to Fastify with service token + user ID
3. Returns Fastify's response to the browser

This keeps ML-DSA signing and Hedera logic in Fastify (single source of truth) while the browser only talks to Next.js.

### Read Pattern (Dashboard Reads)

Next.js API route (e.g., `GET /api/shields`):
1. Validates NextAuth session
2. Queries Prisma directly (no Fastify round-trip)
3. Filters by `userId` (users only see their own shields)

Rationale: Prisma queries from Next.js are ~5ms to Neon vs ~50ms routing through Fastify.

---

## 4. File Structure

### New Files (8)

| File | Purpose |
|------|---------|
| `web/prisma/schema.prisma` | Full database schema |
| `web/src/lib/prisma.ts` | Prisma client singleton |
| `web/src/types/next-auth.d.ts` | Session type augmentation |
| `web/src/app/api/auth/[...nextauth]/route.ts` | NextAuth GET + POST handlers |
| `web/src/app/api/auth/register/route.ts` | User registration |
| `web/src/app/api/shields/route.ts` | List user shields (Prisma direct) |
| `web/src/app/api/shield/create/route.ts` | Create shield (proxy to Fastify) |
| `src/api/middleware/auth.ts` | Service auth + API key middleware |

### Modified Files (7)

| File | Change |
|------|--------|
| `web/package.json` | Add dependencies |
| `web/src/auth.ts` | Full rewrite (Credentials + GitHub) |
| `web/src/middleware.ts` | Rewrite with path matcher |
| `web/src/app/(auth)/login/page.tsx` | Credentials form + GitHub button |
| `web/src/app/(auth)/register/page.tsx` | Registration form |
| `web/src/app/(dashboard)/layout.tsx` | Add `Providers` client wrapper component (SessionProvider), update header to show session user info |
| `src/api/server.ts` | Add Prisma, service auth path |

### New Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| `@prisma/client` | ^6.x | Database ORM |
| `@auth/prisma-adapter` | ^2.x | NextAuth ↔ Prisma bridge |
| `@neondatabase/serverless` | ^0.10.x | Neon WebSocket driver |
| `@prisma/adapter-neon` | ^6.x | Prisma ↔ Neon adapter |
| `bcryptjs` | ^2.4.3 | Password hashing |
| `@types/bcryptjs` | ^2.4.6 | TypeScript types |
| `next-auth` | ^5.0.0-beta.30 | Auth framework (v5, match existing) |
| `prisma` (dev) | ^6.x | Prisma CLI for migrations |

---

## 5. Environment Variables

| Variable | Example | Where Used |
|----------|---------|------------|
| `DATABASE_URL` | `postgresql://...@ep-xxx.neon.tech/quantum-shield?sslmode=require` | Prisma (pooled) |
| `DIRECT_DATABASE_URL` | `postgresql://...@ep-xxx.neon.tech/quantum-shield?sslmode=require` | Prisma Migrate (direct) |
| `NEXTAUTH_SECRET` | 64-char random | NextAuth JWT signing |
| `NEXTAUTH_URL` | `http://localhost:3000` | NextAuth callback URLs |
| `GITHUB_CLIENT_ID` | From GitHub Developer Settings | GitHub OAuth |
| `GITHUB_CLIENT_SECRET` | From GitHub Developer Settings | GitHub OAuth |
| `INTERNAL_SERVICE_TOKEN` | 64-char random | Next.js → Fastify bridge |
| `FASTIFY_API_URL` | `http://localhost:3200` | Fastify API base URL |

---

## 6. Security Considerations

- Passwords hashed with bcrypt (12 rounds) — never stored in plaintext
- API keys prefixed `qsnft_` for secret scanner detection
- Service token validated with `crypto.timingSafeEqual()` to prevent timing attacks
- Registration returns generic message on duplicate email to prevent email enumeration (no 409)
- Dashboard queries filtered by `userId` — users cannot access other users' shields
- JWT tokens are httpOnly cookies (NextAuth default) — not accessible to JavaScript
- JWT `maxAge`: 24 hours (limits session window)
- GitHub OAuth state parameter prevents CSRF (NextAuth handles this)
- Registration endpoint uses NextAuth CSRF token (`getCsrfToken()`) for protection
- Proxy to Fastify uses 5-second timeout; returns 502 on failure with user-friendly message

### Table Write Ownership

| Table                                      | Write Owner                      | Rationale                                |
|--------------------------------------------|----------------------------------|------------------------------------------|
| User, Account, Session, VerificationToken  | Next.js (NextAuth + registration)| Auth is owned by Next.js                 |
| Shield, ProvenanceEvent, ComplianceRecord  | Fastify (via service auth)       | Crypto/blockchain logic lives in Fastify |

Neither service writes to the other's tables to prevent data races.

---

## 7. Out of Scope (Deferred to Later Specs)

- Email verification flow (Spec 4)
- Password reset (Spec 4)
- Rate limiting on registration (Spec 5)
- Admin panel for user management (Spec 4)
- Web3 wallet auth / HashPack (Spec 3)
- API key rotation / revocation endpoint (Spec 4)
- Session revocation / token blocklist (post-MVP)
- 2FA / MFA (post-MVP)
- Database seeding (`prisma/seed.ts`) (Spec 4)
- Password strength beyond min 8 chars (post-MVP, use zxcvbn)

---

## 8. Success Criteria

1. A new user can register with email + password
2. An existing user can log in with credentials or GitHub
3. Protected routes redirect to `/login` when unauthenticated
4. Dashboard shows real user data from Neon PostgreSQL
5. Shield creation via dashboard proxies to Fastify and persists to DB
6. External API access works with per-user API keys
7. `npx prisma migrate dev` creates clean migration files
8. All existing tests continue to pass
