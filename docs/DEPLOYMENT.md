# Quantum-Shield-NFT Deployment Guide

## Overview

This guide covers deploying the Quantum-Shield-NFT platform to production using Vercel (frontend) and Docker (backend).

---

## Frontend Deployment (Vercel)

### Prerequisites

1. **Vercel Account:** Sign up at https://vercel.com
2. **Vercel CLI:** Install globally
   ```bash
   npm install -g vercel
   ```
3. **GitHub Repository:** Connected to Vercel for automatic deployments

### Initial Setup

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Link Project:**
   ```bash
   cd web
   vercel link
   ```

3. **Configure Environment Variables:**

   Set these in Vercel Dashboard → Project Settings → Environment Variables:

   **Required:**
   - `NEXT_PUBLIC_API_URL` - Backend API URL (e.g., https://api.quantum-shield.com)
   - `NEXT_PUBLIC_HEDERA_NETWORK` - `testnet` or `mainnet`
   - `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`
   - `NEXTAUTH_URL` - Production URL (e.g., https://quantum-shield-nft.vercel.app)

   **Optional:**
   - `NEXT_PUBLIC_HASHCONNECT_APP_NAME` - App name for HashConnect
   - `NEXT_PUBLIC_HASHCONNECT_APP_DESCRIPTION` - App description
   - `NEXT_PUBLIC_HASHCONNECT_ICON_URL` - App icon URL

4. **Deploy:**

   **Production:**
   ```bash
   vercel --prod
   ```

   **Preview:**
   ```bash
   vercel
   ```

### Automatic Deployments

Vercel automatically deploys on:
- **Production:** Push to `main` branch
- **Preview:** Pull requests and other branches

### Build Settings

Vercel automatically detects Next.js projects. Verify these settings:

- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`
- **Development Command:** `npm run dev`

### Domain Configuration

1. **Add Custom Domain:**
   - Vercel Dashboard → Project → Settings → Domains
   - Add domain: `quantum-shield-nft.com`
   - Follow DNS configuration instructions

2. **SSL Certificate:**
   - Automatically provisioned by Vercel
   - HTTPS enforced by default

---

## Backend Deployment (Docker)

### Prerequisites

1. **Docker:** Install Docker Engine
2. **Docker Hub Account:** For image hosting (or use private registry)

### Build Docker Image

```bash
# From project root
docker build -t quantum-shield-nft-api:latest .

# Tag for registry
docker tag quantum-shield-nft-api:latest username/quantum-shield-nft-api:latest

# Push to registry
docker push username/quantum-shield-nft-api:latest
```

### Deploy to VPS

1. **SSH to server:**
   ```bash
   ssh user@your-server.com
   ```

2. **Create environment file:**
   ```bash
   cat > .env << 'EOF'
   HEDERA_NETWORK=testnet
   HEDERA_OPERATOR_ID=0.0.xxxxx
   HEDERA_OPERATOR_KEY=302e...
   SHIELD_API_PORT=3200
   MIGRATION_STATE=HYBRID_SIGN
   MLDSA_LEVEL=ML-DSA-65
   PINECONE_API_KEY=your-key
   ANTHROPIC_API_KEY=your-key
   EOF
   ```

3. **Run container:**
   ```bash
   docker run -d \
     --name quantum-shield-api \
     --env-file .env \
     -p 3200:3200 \
     --restart unless-stopped \
     username/quantum-shield-nft-api:latest
   ```

4. **Verify health:**
   ```bash
   curl http://localhost:3200/api/v1/health
   ```

### Docker Compose (Recommended)

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  api:
    image: username/quantum-shield-nft-api:latest
    container_name: quantum-shield-api
    ports:
      - "3200:3200"
    env_file:
      - .env
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3200/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 40s
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"

  nginx:
    image: nginx:alpine
    container_name: quantum-shield-nginx
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - ./ssl:/etc/nginx/ssl:ro
    depends_on:
      - api
    restart: unless-stopped
```

Deploy:
```bash
docker-compose up -d
```

---

## Environment-Specific Configuration

### Development

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3200
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXTAUTH_SECRET=dev-secret-32-chars-minimum
NEXTAUTH_URL=http://localhost:3000
```

**Backend (.env):**
```env
HEDERA_NETWORK=testnet
HEDERA_OPERATOR_ID=0.0.xxxxx
HEDERA_OPERATOR_KEY=302e...
SHIELD_API_PORT=3200
MIGRATION_STATE=HYBRID_SIGN
```

### Staging

**Frontend (Vercel Env Vars - Preview):**
```env
NEXT_PUBLIC_API_URL=https://staging-api.quantum-shield.com
NEXT_PUBLIC_HEDERA_NETWORK=testnet
NEXTAUTH_SECRET=<staging-secret>
NEXTAUTH_URL=https://staging.quantum-shield-nft.vercel.app
```

**Backend:**
- Same as development, but with staging Hedera account
- Enable rate limiting
- Enable request logging

### Production

**Frontend (Vercel Env Vars - Production):**
```env
NEXT_PUBLIC_API_URL=https://api.quantum-shield.com
NEXT_PUBLIC_HEDERA_NETWORK=mainnet
NEXTAUTH_SECRET=<production-secret>
NEXTAUTH_URL=https://quantum-shield-nft.com
```

**Backend:**
- Use mainnet Hedera account
- Enable strict rate limiting (1000 req/hour)
- Enable comprehensive logging
- Enable Sentry error tracking
- Use production database

---

## CI/CD Pipeline (GitHub Actions)

Already configured in `.github/workflows/`:

1. **test.yml** - Runs on PR, validates code quality
2. **deploy-preview.yml** - Creates Vercel preview on PR
3. **deploy-production.yml** - Deploys to production on merge to main

**Manual Trigger:**
```bash
# Trigger production deployment
gh workflow run deploy-production.yml
```

---

## Health Checks

### Frontend

```bash
curl https://quantum-shield-nft.vercel.app
# Should return 200 OK with landing page
```

### Backend

```bash
curl https://api.quantum-shield.com/api/v1/health
# Response: {"status":"healthy","timestamp":"..."}
```

### Full System Check

```bash
# Run all health checks
npm run health
```

---

## Monitoring

### Vercel Analytics

- Automatically enabled on Vercel deployment
- View at: Vercel Dashboard → Project → Analytics

### Logs

**Frontend (Vercel):**
```bash
vercel logs quantum-shield-nft --follow
```

**Backend (Docker):**
```bash
docker logs -f quantum-shield-api
```

### Error Tracking

**Optional: Sentry Integration**

1. Create Sentry project
2. Add environment variables:
   ```env
   NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
   SENTRY_AUTH_TOKEN=...
   ```
3. Errors automatically reported to Sentry

---

## Rollback Procedure

### Frontend (Vercel)

1. Go to Vercel Dashboard → Project → Deployments
2. Find previous successful deployment
3. Click "Promote to Production"

Or via CLI:
```bash
vercel rollback
```

### Backend (Docker)

```bash
# Rollback to previous image version
docker pull username/quantum-shield-nft-api:previous-tag
docker stop quantum-shield-api
docker rm quantum-shield-api
docker run -d \
  --name quantum-shield-api \
  --env-file .env \
  -p 3200:3200 \
  --restart unless-stopped \
  username/quantum-shield-nft-api:previous-tag
```

---

## Security Checklist

Before deploying to production:

- [ ] All environment variables are set correctly
- [ ] Secrets are stored securely (not in code)
- [ ] HTTPS is enforced
- [ ] Security headers are configured (see `vercel.json`)
- [ ] Rate limiting is enabled
- [ ] CORS is properly configured
- [ ] Hedera operator key is secure
- [ ] Database credentials are rotated
- [ ] Backup strategy is in place
- [ ] Monitoring and alerting configured

---

## Troubleshooting

### Build Failures

**Issue:** `npm run build` fails on Vercel

**Solution:**
1. Check Vercel build logs
2. Verify environment variables are set
3. Test build locally: `npm run build`
4. Check for missing dependencies

### API Connection Issues

**Issue:** Frontend can't connect to backend

**Solution:**
1. Verify `NEXT_PUBLIC_API_URL` is correct
2. Check CORS configuration in backend
3. Verify backend health: `curl https://api.quantum-shield.com/api/v1/health`
4. Check network/firewall rules

### Hedera Connection Issues

**Issue:** Can't connect to Hedera network

**Solution:**
1. Verify `HEDERA_OPERATOR_ID` and `HEDERA_OPERATOR_KEY` are correct
2. Check Hedera account balance (needs HBAR for transactions)
3. Verify network is accessible (testnet vs mainnet)
4. Check Hedera status: https://status.hedera.com

---

## Support

For deployment issues:
- GitHub Issues: https://github.com/taurus-ai-corp/quantum-shield-nft/issues
- Email: support@taurusai.io
- Documentation: https://docs.quantum-shield-nft.com

---

**Last Updated:** 2026-02-23
**Version:** 1.0.0
