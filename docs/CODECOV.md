# Codecov Integration

Quantum-Shield-NFT uses [Codecov](https://codecov.io) for continuous code coverage monitoring and reporting.

## Overview

Codecov automatically tracks test coverage for:
- **Backend** - TypeScript/JavaScript source in `src/`
- **Frontend** - Next.js React components in `web/src/`

Coverage reports are generated on every PR and push to main/develop branches.

## Setup

### 1. Codecov Account

**For repository maintainers:**

1. Visit [codecov.io](https://codecov.io) and sign in with GitHub
2. Add the `Quantum-Shield-NFT` repository
3. Copy the upload token from repository settings

### 2. GitHub Secret

Add `CODECOV_TOKEN` to repository secrets:

1. Go to GitHub repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Name: `CODECOV_TOKEN`
4. Value: Token from Codecov dashboard
5. Click "Add secret"

### 3. Verify Integration

After adding the secret, the next PR or push will automatically:
- Run tests with coverage
- Upload coverage to Codecov
- Comment coverage diff on PRs
- Display coverage badge in README

## Coverage Thresholds

**Backend (`src/`):**
- Target: 80% (branches, functions, lines, statements)
- Configured in `jest.config.ts`

**Frontend (`web/src/`):**
- Target: 75% (branches, functions, lines, statements)
- Configured in `web/jest.config.ts`

**Codecov status checks:**
- **Project coverage:** Must not decrease by more than 1%
- **Patch coverage:** New code must have 80% coverage (5% threshold)
- **Changes coverage:** Modified code must maintain coverage

## Workflow

### Automatic Coverage Upload

GitHub Actions workflow `.github/workflows/test.yml` automatically:

1. Runs backend tests (`npm test`)
2. Runs frontend tests (`npm run test:web`)
3. Generates coverage reports (`npm run test:coverage`)
4. Uploads backend coverage (`./coverage/coverage-final.json`)
5. Uploads frontend coverage (`./web/coverage/coverage-final.json`)

**No manual steps required!**

### Local Coverage Reports

Generate coverage locally:

```bash
# Backend coverage
npm run test:coverage

# Frontend coverage
cd web && npm run test:coverage

# View HTML reports
open coverage/lcov-report/index.html
open web/coverage/lcov-report/index.html
```

## Codecov Dashboard

Visit the [Codecov dashboard](https://app.codecov.io/gh/Taurus-Ai-Corp/Quantum-Shield-NFT) to:

- View overall coverage trends
- Compare coverage between branches
- Drill down to file-level coverage
- Review coverage sunburst diagrams
- Download coverage reports

## PR Comments

Codecov automatically comments on pull requests with:

```
📊 Coverage Report

Merging #123 into main will change coverage by +0.15% 🎉

Coverage: 82.35% (target: 80%)
Files changed: 5
Lines added: 42
Lines covered: 38 (90.48%)

| Flag | Coverage | Δ |
|------|----------|---|
| backend | 84.12% | +0.20% ↑ |
| frontend | 78.45% | +0.10% ↑ |

View full report: https://codecov.io/...
```

## Configuration

**File:** `codecov.yml`

Key settings:
- **Precision:** 2 decimal places
- **Range:** 70-100% (yellow to green gradient)
- **Project target:** Auto (maintains current coverage)
- **Patch target:** 80% (new code must be well-tested)
- **Flags:** Separate tracking for backend/frontend

**Ignored paths:**
- Test files (`**/*.test.ts`, `**/*.spec.ts`)
- Type definitions (`**/*.d.ts`)
- Build outputs (`dist/`, `build/`, `.next/`)
- Demo files (`demos/**`)
- Node modules

## Coverage Badge

Add this badge to README.md:

```markdown
[![codecov](https://codecov.io/gh/Taurus-Ai-Corp/Quantum-Shield-NFT/branch/main/graph/badge.svg?token=YOUR_TOKEN)](https://codecov.io/gh/Taurus-Ai-Corp/Quantum-Shield-NFT)
```

**Current status:**

![Coverage](https://codecov.io/gh/Taurus-Ai-Corp/Quantum-Shield-NFT/branch/main/graph/badge.svg)

## Troubleshooting

### Issue: Coverage not uploading

**Cause:** Missing `CODECOV_TOKEN` secret

**Solution:**
1. Verify secret exists in repository settings
2. Check workflow logs for upload errors
3. Ensure token is valid (regenerate if expired)

### Issue: Coverage decreasing on PR

**Cause:** New code not sufficiently tested

**Solution:**
1. Add tests for new functionality
2. Ensure new code paths are covered
3. Check `coverage/lcov-report/index.html` for gaps

### Issue: Coverage report incomplete

**Cause:** Tests not generating coverage data

**Solution:**
1. Verify `jest.config.ts` has `collectCoverageFrom` configured
2. Ensure `--coverage` flag used when running tests
3. Check `coverage/coverage-final.json` exists

### Issue: Codecov comment not appearing

**Cause:** Permissions issue or wrong token

**Solution:**
1. Verify `CODECOV_TOKEN` is correct
2. Check GitHub Actions has write permissions
3. Ensure PR is from same repository (not fork)

## Best Practices

### 1. Write Tests Before Code (TDD)

```bash
# 1. Write failing test
npm test -- --watch

# 2. Write minimal code to pass test
# 3. Refactor
# 4. Check coverage
npm run test:coverage
```

### 2. Target High-Value Coverage

Prioritize testing:
- ✅ Business logic (shield creation, verification)
- ✅ Security-critical code (quantum crypto, wallet integration)
- ✅ Error handling (API errors, validation)
- ⏭️  Simple getters/setters (low value)

### 3. Use Coverage as a Guide, Not a Goal

- 80% coverage with good tests > 100% coverage with weak tests
- Focus on testing behavior, not lines of code
- Don't write tests just to increase coverage percentage

### 4. Review Coverage Diffs

Before merging PRs:
- Check Codecov comment for coverage changes
- Investigate any significant decreases
- Ensure new code has tests

## Integration with CI/CD

Codecov integrates with the full CI/CD pipeline:

```
PR opened → GitHub Actions runs tests
         → Coverage generated
         → Upload to Codecov
         → Codecov analyzes diff
         → Comment posted on PR
         → Status checks updated
         → Merge blocked if coverage too low
```

## Resources

- **Codecov Docs:** https://docs.codecov.io
- **Jest Coverage:** https://jestjs.io/docs/cli#--coverageboolean
- **GitHub Actions:** https://docs.github.com/en/actions
- **Coverage Best Practices:** https://kentcdodds.com/blog/how-to-know-what-to-test

---

**Last Updated:** 2026-02-23
**Coverage Target:** Backend 80%, Frontend 75%
**Status:** ✅ Configured and active
