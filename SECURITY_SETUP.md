# Security Setup Guide

## 🔒 Automated Security Infrastructure

This project includes comprehensive security automation:

### 1. Dependabot (GitHub)
**Status:** ✅ Configured  
**File:** `.github/dependabot.yml`

**Features:**
- Weekly dependency updates (Mondays @ 9 AM)
- Grouped PRs for minor/patch updates
- Security updates get individual PRs
- Ignores breaking changes for critical packages

**Action Required:**
- None! Dependabot runs automatically on GitHub

---

### 2. Pre-commit Hooks
**Status:** ⚠️ Requires Installation  
**File:** `.pre-commit-config.yaml`

**Features:**
- Secret scanning (detect-secrets)
- Private key detection
- TypeScript type checking
- ESLint auto-fix
- npm security audit
- Prevents commits to main/master

**Installation:**
```bash
# Install pre-commit framework
pip install pre-commit

# Install hooks
pre-commit install

# Test (optional)
pre-commit run --all-files
```

**Usage:**
Hooks run automatically on `git commit`. To bypass (NOT recommended):
```bash
git commit --no-verify
```

---

### 3. Snyk Vulnerability Scanning
**Status:** ⚠️ Requires API Token  
**Files:** `.snyk`, `.github/workflows/security-scan.yml`

**Features:**
- Continuous vulnerability monitoring
- High-severity threshold
- Known issue suppression (Hedera SDK)
- Weekly scheduled scans
- PR checks

**Setup:**
```bash
# 1. Sign up for Snyk (free tier available)
https://snyk.io/signup

# 2. Get API token
https://app.snyk.io/account

# 3. Add to GitHub Secrets
# Repository → Settings → Secrets → Actions → New secret
# Name: SNYK_TOKEN
# Value: <your-snyk-token>

# 4. Test locally (optional)
npm install -g snyk
snyk auth
snyk test --severity-threshold=high
```

---

### 4. GitHub Actions Security Workflow
**Status:** ✅ Configured  
**File:** `.github/workflows/security-scan.yml`

**Jobs:**
1. **npm-audit** - Dependency vulnerability scanning
2. **secret-scan** - detect-secrets baseline verification
3. **snyk-scan** - Snyk comprehensive security analysis
4. **dependency-review** - PR-only dependency license/vulnerability checks
5. **codeql-analysis** - GitHub Advanced Security code scanning

**Triggers:**
- Push to main/develop/feature branches
- Pull requests
- Weekly schedule (Mondays @ 9 AM UTC)
- Manual dispatch

---

## 📊 Current Security Status

### Vulnerabilities (as of 2026-02-22)
```
Critical:  0 ✅
High:     27 ⚠️  (mostly Hedera SDK transitive dependencies)
Moderate:  4
Low:       6
```

### Risk Assessment
**Overall Risk: LOW-MODERATE**

**High-severity issues:**
1. **minimatch ReDoS** (ESLint dependency)
   - Risk: Low (dev dependency only)
   - Fix: Requires ESLint v10 upgrade (breaking change)
   - Mitigation: Not exposed to user input

2. **bn.js infinite loop** (Hedera SDK → cryptography → bn.js)
   - Risk: Low (controlled Hedera SDK usage)
   - Fix: Waiting for Hedera SDK update
   - Mitigation: No direct user input to bn.js operations

### Recommendations
✅ **Immediate:**
- [x] Run `npm audit fix` (completed)
- [x] Set up Dependabot (completed)
- [x] Configure pre-commit hooks (needs installation)
- [x] Set up Snyk monitoring (needs API token)

⏳ **Next 30 days:**
- [ ] Monitor Hedera SDK releases for bn.js patch
- [ ] Review ESLint v10 migration path
- [ ] Enable GitHub Advanced Security (CodeQL)
- [ ] Configure SAST scanning in CI

📌 **Ongoing:**
- Weekly Dependabot PRs
- Automated security scans on every PR
- Monthly security review meetings

---

## 🛡️ Security Best Practices

### Environment Variables
```bash
# NEVER commit these files
.env
.env.local
.env.production
*.key
*.pem
credentials.json

# Already in .gitignore ✅
```

### API Keys
```typescript
// ❌ WRONG
const apiKey = 'sk_test_...'

// ✅ CORRECT
const apiKey = process.env.PINECONE_API_KEY!
```

### Secrets Management
**Development:**
- Use `.env.local` (gitignored)
- Copy from `.env.example`

**Production (Vercel):**
- Store in Vercel Environment Variables
- Never hardcode in code

**CI/CD (GitHub Actions):**
- Store in GitHub Secrets
- Access via `${{ secrets.SECRET_NAME }}`

---

## 📞 Support

**Security Issues:**
- Report via GitHub Security Advisories
- Email: security@taurusai.io (for sensitive disclosures)

**General Questions:**
- GitHub Issues
- Email: admin@taurusai.io

---

**Last Updated:** 2026-02-22  
**Next Review:** 2026-03-22
