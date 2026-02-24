# CI/CD Pipeline Documentation

This document explains the GitHub Actions CI/CD setup for Quantum-Shield-NFT.

## Overview

We use **GitHub Actions** for continuous integration and deployment with three main workflows:

1. **CI Pipeline** (`.github/workflows/ci.yml`) - Runs on every push/PR
2. **Production Deployment** (`.github/workflows/deploy.yml`) - Deploys to Vercel on main branch
3. **Preview Deployment** (`.github/workflows/preview.yml`) - Creates preview URLs for PRs
4. **Security Scan** (`.github/workflows/security-scan.yml`) - Weekly security audits

---

## CI Pipeline (`ci.yml`)

**Triggers:**
- Push to `main`, `develop`, `feature/**` branches
- Pull requests to `main`, `develop`
- Manual trigger via GitHub UI

**Jobs:**

### 1. Lint & Format (2 minutes)
- Runs ESLint on all TypeScript files
- Checks Prettier formatting
- Fails build if violations found

```bash
npm run lint
npm run format:check
```

### 2. TypeScript Type Check (1 minute)
- Compiles TypeScript without emitting files
- Verifies type safety across codebase

```bash
npm run typecheck
```

### 3. Build Frontend (3 minutes)
- Builds Next.js 15 production bundle
- Analyzes build size
- Uploads build artifacts (retained 7 days)

```bash
cd web && npm ci && npm run build
```

**Build artifacts:**
- Path: `web/.next`
- Retention: 7 days
- Used by deployment workflows

### 4. Build Backend (2 minutes)
- Compiles backend TypeScript
- Verifies no compilation errors

```bash
npx tsc --project tsconfig.json --noEmit
```

### 5. Dependency Audit (1 minute)
- Runs `npm audit` on root and frontend
- Checks for high/critical vulnerabilities
- Continues even if vulnerabilities found (logs for review)

```bash
npm audit --audit-level=high
```

### 6. CI Summary
- Aggregates all job results
- Fails if any critical job failed
- Provides summary of pipeline status

**Total CI Time:** ~9 minutes per run

---

## Production Deployment (`deploy.yml`)

**Triggers:**
- Push to `main` branch
- Manual trigger via GitHub UI

**Process:**

1. **Build** (3 minutes)
   - Install dependencies
   - Build Next.js app with production config
   - Environment variables injected from secrets

2. **Deploy to Vercel** (1 minute)
   - Uploads build to Vercel
   - Uses `--prod` flag (production deployment)
   - Invalidates CDN cache

**Environment Variables Required:**

```bash
VERCEL_TOKEN=<your-vercel-token>
VERCEL_ORG_ID=<your-org-id>
VERCEL_PROJECT_ID=<your-project-id>
NEXT_PUBLIC_API_URL=<backend-api-url>
```

**To set secrets:**

```bash
# Navigate to GitHub repo
# Settings → Secrets and variables → Actions → New repository secret

# Add each secret:
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
NEXT_PUBLIC_API_URL
```

**Production URL:** https://quantum-shield-nft.vercel.app

---

## Preview Deployment (`preview.yml`)

**Triggers:**
- Pull request opened, updated, or reopened

**Process:**

1. **Build** (3 minutes)
   - Same as production build
   - Uses test environment variables

2. **Deploy to Vercel Preview** (1 minute)
   - Creates unique preview URL per PR
   - Example: `https://quantum-shield-nft-git-feature-<hash>.vercel.app`

3. **Comment on PR** (5 seconds)
   - Posts preview URL as comment
   - Updates on each new commit

**PR Comment Example:**

```markdown
## Preview Deployment Ready!

🚀 Preview URL: https://quantum-shield-nft-git-feature-abc123.vercel.app

✅ Build passed - ready for review
```

---

## Security Scan (`security-scan.yml`)

**Triggers:**
- Weekly schedule (every Monday at 9 AM UTC)
- Manual trigger via GitHub UI

**Jobs:**

1. **npm audit** - Dependency vulnerabilities
2. **Secret scanning** - Leaked credentials check
3. **Snyk scan** - Third-party security analysis
4. **Dependency review** - License compliance
5. **CodeQL analysis** - Static code analysis

See `.github/workflows/security-scan.yml` for details.

---

## Free Tier Limits

**GitHub Actions Free Tier:**
- **Public repos:** Unlimited minutes ✅
- **Private repos:** 500 minutes/month (currently unused)

**Current Usage:**
- CI pipeline: 9 minutes/run
- Deployment: 4 minutes/run
- Estimated: ~100 runs/month = 1,300 minutes/month

**Status:** Well within free tier (public repo = unlimited)

---

## Scaling Strategy

### Year 1 (Current)
- ✅ GitHub-hosted runners (free, unlimited for public repos)
- ✅ Vercel free tier (hobby plan)
- ✅ No infrastructure costs

### Year 2 (If private repo needed)
- Add **self-hosted runner** ($5/month VPS)
- Unlimited CI minutes
- Still $0 GitHub Actions cost

### Year 3+ (Enterprise scale)
- Multiple self-hosted runners (load balancing)
- Kubernetes deployment (if needed)
- Still using GitHub Actions orchestration

**Key:** Self-hosted runners eliminate GitHub minute charges while keeping same workflows.

---

## Self-Hosted Runner Setup

**When to add:**
- Repo becomes private (500 min/month limit)
- Need faster builds (self-hosted = more CPU)
- Want zero CI costs

**Setup ($5/month DigitalOcean VPS):**

```bash
# 1. Create VPS (2GB RAM, 1 CPU)
# 2. SSH into VPS
ssh root@your-vps-ip

# 3. Install runner
cd /opt
mkdir actions-runner && cd actions-runner
curl -o actions-runner-linux.tar.gz \
  -L https://github.com/actions/runner/releases/download/v2.311.0/actions-runner-linux-x64-2.311.0.tar.gz
tar xzf actions-runner-linux.tar.gz

# 4. Configure runner
./config.sh --url https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT \
  --token <YOUR_TOKEN_FROM_GITHUB>

# 5. Install as service
sudo ./svc.sh install
sudo ./svc.sh start

# 6. Update workflows
# Change: runs-on: ubuntu-latest
# To:     runs-on: self-hosted
```

**Result:** Unlimited CI minutes for $5/month.

---

## Troubleshooting

### Build fails: "npm ci: command not found"
- **Cause:** Node.js not installed on runner
- **Fix:** Check `uses: actions/setup-node@v4` step exists

### Deploy fails: "VERCEL_TOKEN not found"
- **Cause:** Secrets not configured
- **Fix:** Add secrets in GitHub Settings → Secrets → Actions

### Tests fail on CI but pass locally
- **Cause:** Missing environment variables
- **Fix:** Add variables to workflow `env:` block

### Build times too slow
- **Option 1:** Add caching (already enabled via `cache: 'npm'`)
- **Option 2:** Use self-hosted runner (faster hardware)
- **Option 3:** Parallelize jobs (already done)

---

## Monitoring

**View pipeline status:**
- GitHub repo → Actions tab
- See all workflow runs, logs, artifacts

**Email notifications:**
- GitHub sends email on workflow failure
- Configure in: Settings → Notifications

**Slack integration (optional):**
```yaml
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

---

## Best Practices

### ✅ Do:
- Keep workflows fast (< 10 minutes total)
- Cache dependencies (`cache: 'npm'`)
- Run jobs in parallel where possible
- Use `continue-on-error: true` for non-critical jobs
- Set `concurrency` to cancel outdated runs

### ❌ Don't:
- Store secrets in code (use GitHub Secrets)
- Use `latest` tags (pin versions: `@v4`)
- Retry flaky tests (fix root cause)
- Skip CI checks (defeats the purpose)

---

## Cost Breakdown

| Service | Tier | Cost | Usage |
|---------|------|------|-------|
| **GitHub Actions** | Public repo | $0/month | Unlimited minutes |
| **Vercel** | Hobby | $0/month | 100GB bandwidth, 6,000 build minutes |
| **Total** | | **$0/month** | Currently |

**If scaling needed:**
| Service | Tier | Cost | Capacity |
|---------|------|------|----------|
| **Self-hosted runner** | VPS | $5/month | Unlimited CI minutes |
| **Vercel Pro** | (if needed) | $20/month | 1TB bandwidth, unlimited builds |
| **Total** | | **$25/month** | For high-traffic scenarios |

---

## Next Steps

### Immediate:
- ✅ CI pipeline configured
- ⏳ Add Vercel secrets (user action required)
- ⏳ Test deployment workflow

### Phase 5 (Task #17):
- Configure Jest for unit tests
- Add test coverage reporting
- Integrate Codecov

### Phase 6:
- Add E2E tests with Playwright
- Add integration tests
- Add performance benchmarks

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Vercel Deployment Guide](https://vercel.com/docs/deployments/git)
- [Next.js CI/CD Best Practices](https://nextjs.org/docs/deployment)
- [Self-Hosted Runners Guide](https://docs.github.com/en/actions/hosting-your-own-runners)
