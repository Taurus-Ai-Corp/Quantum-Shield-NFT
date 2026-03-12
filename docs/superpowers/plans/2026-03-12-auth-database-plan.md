# Auth + Database Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable user registration, login (email + GitHub), and persistent storage via Neon PostgreSQL so the dashboard can display real data.

**Architecture:** Hybrid read/write split. Next.js API routes read from Prisma directly. Writes (shield creation) proxy to Fastify where ML-DSA crypto lives. NextAuth v5 with JWT strategy for stateless Vercel deployment.

**Tech Stack:** NextAuth v5 (beta.30), Prisma 6, Neon PostgreSQL, bcryptjs, Fastify 5

**Spec:** `docs/superpowers/specs/2026-03-12-auth-database-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `web/prisma/schema.prisma` | Database schema (7 models, 4 enums) |
| `web/src/lib/prisma.ts` | Prisma client singleton (hot-reload safe) |
| `web/src/types/next-auth.d.ts` | Augment Session type with `user.id` |
| `web/src/app/api/auth/[...nextauth]/route.ts` | NextAuth GET + POST handler |
| `web/src/app/api/auth/register/route.ts` | User registration endpoint |
| `web/src/app/api/shields/route.ts` | List user's shields (Prisma read) |
| `web/src/app/api/shield/create/route.ts` | Proxy shield creation to Fastify |
| `web/src/app/(auth)/login/page.tsx` | Login form (credentials + GitHub) |
| `web/src/app/(auth)/register/page.tsx` | Registration form |
| `web/src/components/providers/session-provider.tsx` | Client wrapper for SessionProvider |
| `web/src/app/(auth)/layout.tsx` | Auth pages layout with SessionProvider |
| `web/src/app/(dashboard)/user-nav.tsx` | User name display + sign out button |
| `web/.env.local.example` | Environment variable template |
| `src/api/middleware/auth.ts` | Fastify service auth + API key middleware |

### Modified Files

| File | Change |
|------|--------|
| `web/package.json` | Add 8 dependencies |
| `web/src/auth.ts` | Full rewrite: empty providers → Credentials + GitHub |
| `web/src/middleware.ts` | Already correct, no changes needed |
| `web/src/app/(dashboard)/layout.tsx` | Wrap with Providers, add user nav |
| `web/src/app/layout.tsx` | No changes needed (server component, no providers here) |

---

## Chunk 1: Database Foundation

### Task 1: Install Dependencies

**Files:**
- Modify: `web/package.json`

- [ ] **Step 1: Install production dependencies**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npm install @prisma/client @auth/prisma-adapter @neondatabase/serverless @prisma/adapter-neon bcryptjs
```

- [ ] **Step 2: Install dev dependencies**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npm install -D prisma @types/bcryptjs
```

- [ ] **Step 3: Verify installation**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx prisma --version
```

Expected: Prisma version 6.x.x output

- [ ] **Step 4: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/package.json web/package-lock.json
git commit -m "chore: add Prisma, NextAuth adapter, Neon, bcryptjs dependencies

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 2: Create Prisma Schema

**Files:**
- Create: `web/prisma/schema.prisma`

- [ ] **Step 1: Create the schema file**

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

// ─── NextAuth Models ───────────────────────────

model User {
  id             String    @id @default(cuid())
  name           String?
  email          String    @unique
  emailVerified  DateTime?
  hashedPassword String?
  image          String?
  role           UserRole  @default(USER)
  apiKey         String?   @unique

  accounts       Account[]
  sessions       Session[]
  shields        Shield[]

  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}

enum UserRole {
  USER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

// ─── Domain Models ─────────────────────────────

model Shield {
  id                    String        @id @default(cuid())
  shieldId              String        @unique
  assetId               String
  assetType             AssetType
  name                  String
  description           String?
  metadata              Json?
  owner                 String
  category              String?

  integrityHash         String
  signatureAlgorithm    String        @default("ML-DSA-65")
  publicKey             String?
  signature             String?

  hederaTopicId         String?
  hederaTransactionId   String?
  hederaStatus          HederaStatus  @default(PENDING)

  status                ShieldStatus  @default(ACTIVE)

  userId                String
  user                  User          @relation(fields: [userId], references: [id])

  provenanceEvents      ProvenanceEvent[]
  complianceRecords     ComplianceRecord[]

  createdAt             DateTime      @default(now())
  updatedAt             DateTime      @updatedAt

  @@index([userId])
  @@index([assetId])
}

enum AssetType {
  NFT
  IP
  DOCUMENT
  DATA
}

enum ShieldStatus {
  ACTIVE
  REVOKED
  MIGRATING
  EXPIRED
}

enum HederaStatus {
  PENDING
  ANCHORED
  FAILED
}

model ProvenanceEvent {
  id          String   @id @default(cuid())
  shieldId    String
  eventType   String
  actor       String
  description String?
  txHash      String?

  shield      Shield   @relation(fields: [shieldId], references: [id], onDelete: Cascade)

  createdAt   DateTime @default(now())

  @@index([shieldId])
}

model ComplianceRecord {
  id        String   @id @default(cuid())
  shieldId  String
  standard  String
  status    String
  score     Float?
  details   Json?

  shield    Shield   @relation(fields: [shieldId], references: [id], onDelete: Cascade)

  checkedAt DateTime @default(now())

  @@index([shieldId])
}
```

- [ ] **Step 2: Validate schema syntax**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx prisma validate
```

Expected: "The schema at `prisma/schema.prisma` is valid"

- [ ] **Step 3: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/prisma/schema.prisma
git commit -m "feat(db): add Prisma schema with 7 models and 4 enums

NextAuth models (User, Account, Session, VerificationToken) plus
domain models (Shield, ProvenanceEvent, ComplianceRecord) for
Neon PostgreSQL.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 3: Create Prisma Client Singleton

**Files:**
- Create: `web/src/lib/prisma.ts`

- [ ] **Step 1: Write the singleton**

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env['NODE_ENV'] === 'development' ? ['query'] : [],
  });

if (process.env['NODE_ENV'] !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/lib/prisma.ts
git commit -m "feat(db): add Prisma client singleton with hot-reload guard

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 4: Create NextAuth Type Extension

**Files:**
- Create: `web/src/types/next-auth.d.ts`

- [ ] **Step 1: Write the type augmentation**

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/types/next-auth.d.ts
git commit -m "feat(auth): add NextAuth session type augmentation for user.id

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 5: Create .env.local Template

**Files:**
- Create: `web/.env.local.example`

- [ ] **Step 1: Write the env template**

```bash
# Neon Database (get from https://console.neon.tech)
DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/quantum-shield?sslmode=require&connection_limit=5"
DIRECT_DATABASE_URL="postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/quantum-shield?sslmode=require"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-48"
NEXTAUTH_URL="http://localhost:3000"

# GitHub OAuth (get from https://github.com/settings/developers)
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# Internal Bridge (Next.js → Fastify)
INTERNAL_SERVICE_TOKEN="generate-with-openssl-rand-base64-48"
FASTIFY_API_URL="http://localhost:3200"
```

- [ ] **Step 2: Verify .gitignore includes .env.local**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
grep -q ".env.local" .gitignore && echo "OK" || echo "MISSING - add it"
```

Expected: "OK"

- [ ] **Step 3: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/.env.local.example
git commit -m "chore: add .env.local.example with Neon, NextAuth, GitHub vars

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 2: Auth Configuration

### Task 6: Rewrite auth.ts with Credentials + GitHub

**Files:**
- Modify: `web/src/auth.ts` (full rewrite)

- [ ] **Step 1: Write the auth configuration**

Replace the entire contents of `web/src/auth.ts` with:

```typescript
import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import GitHub from 'next-auth/providers/github';
import { PrismaAdapter } from '@auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './lib/prisma';

export const authConfig: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt',
    maxAge: 86400, // 24 hours
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  providers: [
    GitHub({
      clientId: process.env['GITHUB_CLIENT_ID']!,
      clientSecret: process.env['GITHUB_CLIENT_SECRET']!,
    }),

    Credentials({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user?.hashedPassword) return null;

        const valid = await bcrypt.compare(
          credentials.password as string,
          user.hashedPassword
        );

        if (!valid) return null;

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },

    async authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isProtected = nextUrl.pathname.startsWith('/dashboard');

      if (isProtected && !isLoggedIn) {
        return Response.redirect(new URL('/login', nextUrl));
      }
      return true;
    },
  },
};

export const { handlers, auth, signIn, signOut } = NextAuth(authConfig);
```

- [ ] **Step 2: Verify middleware.ts is correct (no changes needed)**

Current `web/src/middleware.ts`:
```typescript
import { auth } from './auth';

export default auth;

export const config = {
  matcher: ['/dashboard/:path*'],
};
```

This is already correct. The `auth` export from NextAuth v5 acts as middleware. No changes needed.

- [ ] **Step 3: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/auth.ts
git commit -m "feat(auth): rewrite auth.ts with Credentials + GitHub providers

JWT strategy (24h maxAge), PrismaAdapter, bcrypt password
validation, route protection for /dashboard/*.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 7: Create NextAuth API Route Handler

**Files:**
- Create: `web/src/app/api/auth/[...nextauth]/route.ts`

- [ ] **Step 1: Write the route handler**

```typescript
import { handlers } from '@/auth';

export const { GET, POST } = handlers;
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/api/auth/\[...nextauth\]/route.ts
git commit -m "feat(auth): add NextAuth API route handler

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 8: Create Registration API Endpoint

**Files:**
- Create: `web/src/app/api/auth/register/route.ts`

- [ ] **Step 1: Write the registration endpoint**

```typescript
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Email and password (min 8 characters) required' },
        { status: 400 }
      );
    }

    if (typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json(
        { error: 'Valid email required' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Generic response for both paths to prevent email enumeration
    const genericResponse = { message: 'Account created successfully' };

    if (existing) {
      return NextResponse.json(genericResponse, { status: 201 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const apiKey = `qsnft_${crypto.randomBytes(32).toString('hex')}`;

    await prisma.user.create({
      data: {
        name: typeof name === 'string' ? name.trim() : null,
        email: email.toLowerCase().trim(),
        hashedPassword,
        apiKey,
      },
    });

    return NextResponse.json(genericResponse, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: 'Registration failed. Please try again.' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/api/auth/register/route.ts
git commit -m "feat(auth): add registration endpoint with bcrypt + API key generation

Generic response on duplicate email to prevent enumeration.
Generates qsnft_ prefixed API key for external Fastify access.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 3: Auth UI Pages

### Task 9a: Create Auth Layout with SessionProvider

**Files:**
- Create: `web/src/app/(auth)/layout.tsx`

- [ ] **Step 1: Write the auth layout**

The auth pages use `signIn` from `next-auth/react` which needs SessionProvider context. Create a layout wrapper for the `(auth)` route group:

```tsx
import { Providers } from '@/components/providers/session-provider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Providers>{children}</Providers>;
}
```

Note: The `Providers` component is created in Chunk 4 (Task 11). If implementing sequentially, create `web/src/components/providers/session-provider.tsx` first (move Task 11 before this task), or create it inline here and delete the duplicate later.

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/\(auth\)/layout.tsx
git commit -m "feat(auth): add auth layout with SessionProvider wrapper

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 9b: Create Login Page

**Files:**
- Create: `web/src/app/(auth)/login/page.tsx`

- [ ] **Step 1: Write the login page**

```tsx
'use client';

import { Suspense, useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Shield, Github, Loader2 } from 'lucide-react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';

  async function handleCredentialsLogin(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await signIn('credentials', {
      email,
      password,
      callbackUrl,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      setError('Invalid email or password');
    } else if (result?.url) {
      window.location.href = result.url;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-display font-bold">Quantum-Shield</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Sign in to your account</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl })}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Sign in'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

// Wrap in Suspense for useSearchParams (required by Next.js 15)
export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/\(auth\)/login/page.tsx
git commit -m "feat(auth): add login page with credentials + GitHub OAuth

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 10: Create Registration Page

**Files:**
- Create: `web/src/app/(auth)/register/page.tsx`

- [ ] **Step 1: Write the registration page**

```tsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Shield, Github, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email,
        password,
        callbackUrl: '/dashboard',
        redirect: false,
      });

      if (result?.error) {
        // Account may already exist (anti-enumeration: server returns same 201 for both)
        setError('Account may already exist. Try signing in instead.');
        setLoading(false);
        return;
      }

      if (result?.url) {
        window.location.href = result.url;
      } else {
        setLoading(false);
      }
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <Shield className="w-8 h-8 text-primary" />
            <span className="text-2xl font-display font-bold">Quantum-Shield</span>
          </Link>
          <p className="mt-2 text-muted-foreground">Create your account</p>
        </div>

        <div className="rounded-lg border border-border bg-card p-6 space-y-6">
          <button
            type="button"
            onClick={() => signIn('github', { callbackUrl: '/dashboard' })}
            className="w-full flex items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors"
          >
            <Github className="w-4 h-4" />
            Continue with GitHub
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-1.5">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Your name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-1.5">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-1.5">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="Min 8 characters"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-md bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mx-auto" />
              ) : (
                'Create account'
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/\(auth\)/register/page.tsx
git commit -m "feat(auth): add registration page with auto-login after signup

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 4: Dashboard Session Integration

### Task 11: Create Session Provider Wrapper

**Files:**
- Create: `web/src/components/providers/session-provider.tsx`

- [ ] **Step 1: Write the provider component**

```tsx
'use client';

import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/components/providers/session-provider.tsx
git commit -m "feat(auth): add SessionProvider client wrapper component

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 12: Update Dashboard Layout with Session + User Nav

**Files:**
- Modify: `web/src/app/(dashboard)/layout.tsx`

- [ ] **Step 1: Rewrite the dashboard layout**

Replace the entire contents of `web/src/app/(dashboard)/layout.tsx` with:

```tsx
import Link from 'next/link';
import { Shield, Home, FileText, Globe, BarChart3, Settings } from 'lucide-react';
import { WalletConnect } from '@/components/wallet/WalletConnect';
import { Providers } from '@/components/providers/session-provider';
import { UserNav } from './user-nav';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Shield Asset', href: '/dashboard/shield', icon: Shield },
  { name: 'Marketplace', href: '/dashboard/marketplace', icon: Globe },
  { name: 'Provenance', href: '/dashboard/provenance', icon: FileText },
  { name: 'Compliance', href: '/dashboard/compliance', icon: BarChart3 },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <div className="min-h-screen bg-background">
        {/* Top Navigation */}
        <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="container mx-auto flex h-16 items-center px-4 sm:px-6 lg:px-8">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              <Shield className="w-6 h-6 text-primary" />
              <span>Quantum-Shield NFT</span>
            </Link>

            <nav className="ml-auto flex items-center gap-4">
              <WalletConnect />
              <UserNav />
              <button className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9">
                <Settings className="w-4 h-4" />
              </button>
            </nav>
          </div>
        </header>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex gap-8">
            {/* Sidebar Navigation */}
            <aside className="hidden lg:block w-64 shrink-0">
              <nav className="space-y-1">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors"
                    >
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  );
                })}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0">{children}</main>
          </div>
        </div>
      </div>
    </Providers>
  );
}
```

- [ ] **Step 2: Create UserNav component**

Create `web/src/app/(dashboard)/user-nav.tsx`:

```tsx
'use client';

import { useSession, signOut } from 'next-auth/react';
import { LogOut, User } from 'lucide-react';

export function UserNav() {
  const { data: session } = useSession();

  if (!session?.user) return null;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground hidden sm:inline">
        {session.user.name || session.user.email}
      </span>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground h-9 w-9"
        aria-label="Sign out"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/\(dashboard\)/layout.tsx web/src/app/\(dashboard\)/user-nav.tsx
git commit -m "feat(auth): add SessionProvider + UserNav to dashboard layout

Wraps dashboard in Providers (client component), adds user
name display + sign out button in header nav.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 5: API Routes (Read + Write Bridge)

### Task 13: Create Shields List API Route (Read Path)

**Files:**
- Create: `web/src/app/api/shields/route.ts`

- [ ] **Step 1: Write the shields list endpoint**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const shields = await prisma.shield.findMany({
      where: { userId: session.user.id },
      include: {
        provenanceEvents: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ shields, total: shields.length });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load shields' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/api/shields/route.ts
git commit -m "feat(api): add shields list endpoint (Prisma direct read)

Reads shields for authenticated user, filtered by userId.
Includes last 5 provenance events per shield.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

### Task 14: Create Shield Create API Route (Write Proxy)

**Files:**
- Create: `web/src/app/api/shield/create/route.ts`

- [ ] **Step 1: Write the shield creation proxy**

```typescript
import { NextResponse } from 'next/server';
import { auth } from '@/auth';

const FASTIFY_URL = process.env['FASTIFY_API_URL'] || 'http://localhost:3200';
const SERVICE_TOKEN = process.env['INTERNAL_SERVICE_TOKEN'];

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!SERVICE_TOKEN) {
    return NextResponse.json(
      { error: 'Service configuration error' },
      { status: 500 }
    );
  }

  const body = await req.json();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const response = await fetch(`${FASTIFY_URL}/api/v1/shield`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Service-Token': SERVICE_TOKEN,
        'X-User-Id': session.user.id,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Shield service is temporarily unavailable. Please try again.' },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create shield. Please try again.' },
      { status: 502 }
    );
  }
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add web/src/app/api/shield/create/route.ts
git commit -m "feat(api): add shield creation proxy to Fastify

Validates NextAuth session, forwards to Fastify with service
token + userId. 5-second timeout with 502 on failure.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 6: Fastify Auth Middleware

### Task 15: Create Fastify Auth Middleware

**Files:**
- Create: `src/api/middleware/auth.ts`

- [ ] **Step 1: Write the auth middleware**

```typescript
import { createHash, timingSafeEqual } from 'node:crypto';
import type { FastifyRequest, FastifyReply } from 'fastify';

const SERVICE_TOKEN = process.env['INTERNAL_SERVICE_TOKEN'] || '';

function safeCompare(a: string, b: string): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') return false;
  // Hash both values to fixed length to prevent length-based timing leaks
  const hashA = createHash('sha256').update(a).digest();
  const hashB = createHash('sha256').update(b).digest();
  return timingSafeEqual(hashA, hashB);
}

declare module 'fastify' {
  interface FastifyRequest {
    userId?: string;
  }
}

/**
 * Internal auth: Next.js → Fastify via shared service token
 */
export async function requireServiceAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const token = request.headers['x-service-token'] as string;
  const userId = request.headers['x-user-id'] as string;

  if (!token || !SERVICE_TOKEN || !safeCompare(token, SERVICE_TOKEN)) {
    return reply.code(401).send({ error: 'Invalid service token' });
  }

  if (!userId) {
    return reply.code(401).send({ error: 'Missing user context' });
  }

  request.userId = userId;
}

/**
 * External auth: CLI/SDK → Fastify via per-user API key
 * Note: Requires Prisma client — import lazily to avoid circular deps
 */
export async function requireApiKey(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const apiKey = request.headers['x-api-key'] as string;

  if (!apiKey) {
    return reply.code(401).send({ error: 'API key required (X-API-Key header)' });
  }

  // Dynamic import to avoid requiring Prisma at module load
  // Path: src/api/middleware/ -> src/api/ -> src/ -> project root -> web/src/lib/prisma
  const { prisma } = await import('../../../web/src/lib/prisma');

  const user = await prisma.user.findUnique({
    where: { apiKey },
    select: { id: true, role: true },
  });

  if (!user) {
    return reply.code(401).send({ error: 'Invalid API key' });
  }

  request.userId = user.id;
}

/**
 * Combined auth: accepts either service token OR API key
 */
export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const serviceToken = request.headers['x-service-token'] as string;

  if (serviceToken) {
    return requireServiceAuth(request, reply);
  }

  return requireApiKey(request, reply);
}
```

- [ ] **Step 2: Commit**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git add src/api/middleware/auth.ts
git commit -m "feat(api): add Fastify auth middleware (service token + API key)

Two auth paths: internal service token for Next.js proxy,
per-user API key for external CLI/SDK access. Combined
requireAuth handler accepts either.

Co-Authored-By: E.Fdz <taurus_ai@Effins-MacBook-Pro.local>
Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
```

---

## Chunk 7: Verification + Database Push

### Task 16: Generate Prisma Client and Push Schema

- [ ] **Step 1: Create a .env.local with your Neon credentials**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
# Copy the example and fill in real Neon credentials
cp .env.local.example .env.local
# Edit .env.local with your Neon connection strings
```

Note: You need a Neon project first. Create one at https://console.neon.tech if you haven't.

- [ ] **Step 2: Generate Prisma client**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx prisma generate
```

Expected: "Generated Prisma Client"

- [ ] **Step 3: Push schema to Neon (development)**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx prisma db push
```

Expected: "Your database is now in sync with your Prisma schema"

- [ ] **Step 4: Verify type-checking passes**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx tsc --noEmit
```

Expected: No errors

- [ ] **Step 5: Run existing tests to check for regressions**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npm test
```

Expected: All existing tests pass

---

### Task 17: Smoke Test the Auth Flow

- [ ] **Step 1: Start the dev server**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npm run dev
```

- [ ] **Step 2: Verify login page loads**

Open http://localhost:3000/login — should see the login form with GitHub button and email/password fields.

- [ ] **Step 3: Verify registration page loads**

Open http://localhost:3000/register — should see the registration form.

- [ ] **Step 4: Verify dashboard redirects to login**

Open http://localhost:3000/dashboard — should redirect to /login (unauthenticated).

- [ ] **Step 5: Test registration flow**

Register a test user via the form. Should auto-login and redirect to /dashboard.

- [ ] **Step 6: Verify user in database**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT/web
npx prisma studio
```

Open Prisma Studio (browser). Check the User table has the new user with hashedPassword and apiKey fields populated.

- [ ] **Step 7: Test sign out**

Click the sign-out button in the dashboard header. Should redirect to /login.

---

### Task 18: Final Commit + Summary

- [ ] **Step 1: Ensure all files are committed**

```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
git status
```

If any uncommitted files remain, stage and commit them.

- [ ] **Step 2: Verify the complete file list**

Run and confirm these files exist:
```bash
cd /Users/taurus_ai/Desktop/TAURUS_AI_SAAS/products/Quantum-Shield-NFT
ls -la web/prisma/schema.prisma
ls -la web/src/lib/prisma.ts
ls -la web/src/types/next-auth.d.ts
ls -la web/src/auth.ts
ls -la web/src/middleware.ts
ls -la web/src/app/api/auth/\[...nextauth\]/route.ts
ls -la web/src/app/api/auth/register/route.ts
ls -la web/src/app/api/shields/route.ts
ls -la web/src/app/api/shield/create/route.ts
ls -la web/src/app/\(auth\)/layout.tsx
ls -la web/src/app/\(auth\)/login/page.tsx
ls -la web/src/app/\(auth\)/register/page.tsx
ls -la web/src/app/\(dashboard\)/layout.tsx
ls -la web/src/app/\(dashboard\)/user-nav.tsx
ls -la web/src/components/providers/session-provider.tsx
ls -la src/api/middleware/auth.ts
ls -la web/.env.local.example
```

All 17 files should exist.

---

## Success Criteria Checklist

After completing all tasks, verify:

- [ ] A new user can register with email + password
- [ ] An existing user can log in with credentials
- [ ] GitHub OAuth login works (requires GITHUB_CLIENT_ID/SECRET)
- [ ] `/dashboard` redirects to `/login` when unauthenticated
- [ ] Dashboard shows logged-in user's name in the header
- [ ] Sign out works and redirects to `/login`
- [ ] `GET /api/shields` returns shields for the authenticated user only
- [ ] `POST /api/shield/create` proxies to Fastify with service auth
- [ ] `npx prisma db push` creates all 7 tables in Neon
- [ ] `npx tsc --noEmit` passes with no errors
- [ ] `npm test` passes with no regressions
