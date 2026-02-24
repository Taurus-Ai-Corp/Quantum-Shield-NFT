# CI/CD Setup Guide - Quick Start

Follow these steps to activate the CI/CD pipeline for Quantum-Shield-NFT.

---

## Prerequisites

- [x] GitHub repository created
- [x] Vercel account created
- [ ] Vercel CLI installed (optional, for token generation)

---

## Step 1: Get Vercel Credentials

### Option A: Using Vercel Dashboard (Recommended)

1. **Get Vercel Token:**
   - Go to https://vercel.com/account/tokens
   - Click "Create Token"
   - Name: "GitHub Actions"
   - Scope: "Full Account"
   - Copy the token (shown once!)

2. **Get Vercel Org ID:**
   - Go to https://vercel.com/account
   - Look for "Your ID" or "Organization ID"
   - Copy the ID (starts with `team_...` or `user_...`)

3. **Get Project ID:**
   - Go to https://vercel.com/your-org/quantum-shield-nft
   - Settings → General → Project ID
   - Copy the ID

### Option B: Using Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Link project (run in ./web directory)
cd web
vercel link

# Get credentials
cat .vercel/project.json
# Output shows: projectId, orgId
```

---

## Step 2: Add GitHub Secrets

1. **Navigate to Repository Settings:**
   ```
   https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/settings/secrets/actions
   ```

2. **Click "New repository secret"**

3. **Add these 4 secrets:**

   | Name | Value | Example |
   |------|-------|---------|
   | `VERCEL_TOKEN` | Token from Step 1 | `AbC123XyZ...` |
   | `VERCEL_ORG_ID` | Org ID from Step 1 | `team_abc123` or `user_xyz789` |
   | `VERCEL_PROJECT_ID` | Project ID from Step 1 | `prj_abc123xyz` |
   | `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api.quantum-shield-nft.com` |

   **For development/testing:**
   - Use `http://localhost:3200` for `NEXT_PUBLIC_API_URL`

---

## Step 3: Verify Workflows

1. **Check workflows are committed:**
   ```bash
   git status
   # Should show:
   # .github/workflows/ci.yml
   # .github/workflows/deploy.yml
   # .github/workflows/preview.yml
   # docs/CICD.md
   # docs/CICD_SETUP_GUIDE.md
   ```

2. **Commit and push:**
   ```bash
   git add .github/workflows/*.yml docs/CICD*.md
   git commit -m "feat: add GitHub Actions CI/CD pipeline

   - CI pipeline: lint, typecheck, build frontend/backend
   - Deploy workflow: production deployment to Vercel
   - Preview workflow: PR preview deployments
   - Documentation: CICD.md setup guide

   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>"
   git push origin feature/fullstack-web3-saas
   ```

3. **Watch first run:**
   - Go to: https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/actions
   - CI pipeline should start automatically
   - Expected duration: ~9 minutes

---

## Step 4: Test Deployment (Optional)

### Test Preview Deployment

1. **Create a Pull Request:**
   ```bash
   # From your feature branch
   gh pr create --title "feat: add CI/CD pipeline" \
     --body "Testing preview deployment"
   ```

2. **Wait for preview workflow** (~4 minutes)

3. **Check PR comments:**
   - Bot should comment with preview URL
   - Example: `https://quantum-shield-nft-git-feature-abc123.vercel.app`

4. **Visit preview URL:**
   - Frontend should load
   - Verify landing page, dashboard, wallet connect

### Test Production Deployment

1. **Merge PR to main:**
   ```bash
   gh pr merge --squash
   ```

2. **Deploy workflow triggers automatically**

3. **Visit production URL:**
   - https://quantum-shield-nft.vercel.app
   - Should show latest version

---

## Step 5: Verify Pipeline Status

### Green Build Badge

1. **Check Actions tab:**
   - All jobs should show green checkmarks ✅
   - If any fail, click for logs

2. **Add status badge to README (optional):**
   ```markdown
   ![CI Pipeline](https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/actions/workflows/ci.yml/badge.svg)
   ```

### Expected Results

**CI Pipeline:**
- ✅ Lint & Format: ~2 minutes
- ✅ TypeScript Check: ~1 minute
- ✅ Build Frontend: ~3 minutes
- ✅ Build Backend: ~2 minutes
- ✅ Dependency Audit: ~1 minute

**Total:** ~9 minutes per run

---

## Troubleshooting

### Issue: "VERCEL_TOKEN not found"

**Solution:**
1. Verify secret name is exactly `VERCEL_TOKEN` (case-sensitive)
2. Check secret is in "Actions" secrets (not "Dependabot" or "Codespaces")
3. Re-run workflow after adding secret

### Issue: "npm ci: lockfile version mismatch"

**Solution:**
```bash
# Regenerate package-lock.json
rm package-lock.json web/package-lock.json
npm install
cd web && npm install
git add package-lock.json web/package-lock.json
git commit -m "fix: regenerate lockfiles"
```

### Issue: Build fails but works locally

**Solution:**
1. Check environment variables in workflow
2. Verify Node.js version matches (20.x)
3. Try: `npm ci` instead of `npm install` locally

### Issue: Deployment succeeds but site shows 404

**Solution:**
1. Check `working-directory: ./web` in deploy.yml
2. Verify Next.js build output in `.next/` directory
3. Check Vercel build logs in Vercel dashboard

---

## Advanced Configuration

### Add Test Coverage

```yaml
# Add to ci.yml after typecheck job
test:
  name: Unit Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npm test -- --coverage
    - uses: codecov/codecov-action@v4
      with:
        files: ./coverage/coverage-final.json
```

### Add Slack Notifications

```yaml
# Add to end of any job
- name: Notify Slack
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
  if: always()
```

### Add E2E Tests

```yaml
# Add to ci.yml
e2e:
  name: E2E Tests
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: '20'
        cache: 'npm'
    - run: npm ci
    - run: npx playwright install --with-deps
    - run: npm run test:e2e
```

---

## Monitoring

### GitHub Actions Dashboard

- **View runs:** https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/actions
- **Filter by workflow:** Click workflow name in sidebar
- **View logs:** Click any run → Click job → Expand steps

### Email Notifications

- **Default:** GitHub emails on failure
- **Configure:** Settings → Notifications → Actions

### Cost Monitoring

- **Free tier status:** Settings → Billing → Actions
- **Current usage:** View minutes consumed (public repos = unlimited)

---

## Next Steps

- [ ] **Task #17:** Configure Jest for unit tests
- [ ] **Task #18:** Add E2E tests with Playwright
- [ ] **Task #19:** Add integration tests
- [ ] **Task #21:** Deploy to Vercel production (after testing)

---

## Support

**Documentation:**
- Main guide: `docs/CICD.md`
- GitHub Actions: https://docs.github.com/en/actions
- Vercel Deployments: https://vercel.com/docs/deployments/git

**Issues:**
- Create issue: https://github.com/Taurus-Ai-Corp/Quantum-Shield-NFT/issues
- Tag: `ci-cd`, `deployment`
