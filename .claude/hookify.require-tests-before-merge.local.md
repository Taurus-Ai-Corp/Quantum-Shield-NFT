---
name: require-tests-before-merge
enabled: true
event: bash
action: warn
pattern: git\s+(push|merge)\s+.*\s+(main|master|develop)
---

⚠️ **PRE-MERGE VERIFICATION REQUIRED**

You're about to push/merge to a protected branch.

**Checklist before merging:**

**Code Quality:**
- [ ] TypeScript compiles: `npm run typecheck`
- [ ] Linter passes: `npm run lint`
- [ ] Formatter check: `npm run format:check`

**Testing:**
- [ ] All tests pass: `npm run test:all`
- [ ] Coverage maintained: >80% backend, >75% frontend
- [ ] E2E tests pass: `npm run test:e2e`
- [ ] Integration tests pass: `npm run test:integration`

**Security:**
- [ ] No secrets in code (checked with `git diff`)
- [ ] Dependencies audited: `npm audit --audit-level=moderate`
- [ ] No new high/critical vulnerabilities

**Code Review:**
- [ ] PR approved by at least 1 reviewer
- [ ] All review comments addressed
- [ ] CI/CD checks passing (GitHub Actions)

**Documentation:**
- [ ] README updated (if public API changed)
- [ ] CHANGELOG updated (version bump entry)
- [ ] Inline comments added for complex logic

**Quick verification:**
```bash
npm run typecheck && npm run lint && npm test
```

**If all checks pass:** Proceed with merge ✅
**If any checks fail:** Fix issues first, then retry ❌

**Bypassing this check is NOT recommended** - it exists to prevent broken main branch.
