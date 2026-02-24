---
name: warn-deployment-config
enabled: true
event: file
action: warn
conditions:
  - field: file_path
    operator: regex_match
    pattern: (vercel\.json|\.github/workflows/deploy|Dockerfile|docker-compose)
  - field: new_text
    operator: regex_match
    pattern: (production|mainnet|--prod)
---

⚠️ **PRODUCTION DEPLOYMENT CONFIGURATION CHANGE**

You're modifying production deployment configuration.

**Files that trigger this warning:**
- `vercel.json` - Vercel deployment config
- `.github/workflows/deploy*.yml` - GitHub Actions deployment
- `Dockerfile` - Docker container config
- `docker-compose.yml` - Multi-container setup

**Important checks before deploying to production:**

**Environment:**
- [ ] Production environment variables set correctly
- [ ] Hedera MAINNET credentials (not testnet)
- [ ] Database connection to production DB
- [ ] API keys for production services

**Security:**
- [ ] HTTPS enforced
- [ ] Security headers configured
- [ ] Rate limiting enabled
- [ ] CORS whitelist (not wildcard)
- [ ] Secrets in environment variables (not code)

**Testing:**
- [ ] All tests pass on staging
- [ ] E2E tests pass on preview deployment
- [ ] Load testing completed (if high traffic expected)
- [ ] Rollback plan documented

**Monitoring:**
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring (Vercel Analytics)
- [ ] Uptime monitoring configured
- [ ] Alert notifications set up

**Deployment checklist:**
```bash
# 1. Verify build
npm run build

# 2. Test locally
npm run start

# 3. Deploy to preview first
vercel

# 4. Smoke test preview
curl https://preview-url.vercel.app/api/health

# 5. Deploy to production (if preview looks good)
vercel --prod
```

**Remember:** Production deployments affect real users. Test thoroughly!
