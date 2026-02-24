# E2E Tests - Quantum-Shield-NFT

End-to-end tests using Playwright to verify complete user journeys and system integration.

## Overview

These tests simulate real user interactions with the Quantum-Shield-NFT platform, covering:

1. **Landing Page** - User entry points and information architecture
2. **Wallet Connection** - Hedera wallet integration via HashConnect
3. **Shield Creation Flow** - Core business process of quantum-protecting NFT assets

## Test Coverage

### 01-landing.spec.ts (10 tests)
- ✅ Landing page loads successfully
- ✅ Hero section with CTA displayed
- ✅ Key features section visible
- ✅ Navigation links functional
- ✅ Responsive on mobile viewport
- ✅ SEO meta tags present
- ✅ No console errors
- ✅ Accessibility landmarks
- ✅ Footer with links
- ✅ Dashboard route navigation

### 02-wallet-connection.spec.ts (10 tests)
- ✅ Connect wallet button displayed
- ✅ Wallet connection modal appears
- ✅ Modal closes on cancel
- ✅ Wallet address displayed after connection
- ✅ Disconnect option when connected
- ✅ Network selection (testnet/mainnet)
- ✅ Connection persists across reloads
- ✅ Network badge displayed
- ✅ Connection errors handled gracefully
- ✅ Wallet balance display (optional)

### 03-shield-flow.spec.ts (11 tests)
- ✅ Shield creation form displayed
- ✅ Required field validation
- ✅ Form fills with valid data
- ✅ Successful shield creation (mocked API)
- ✅ Shield ID displayed after creation
- ✅ Quantum signature information shown
- ✅ Hedera transaction proof displayed
- ✅ API errors handled gracefully
- ✅ Submit button disabled during creation
- ✅ Loading indicator during creation
- ✅ Navigation to view shield after creation

**Total: 31 E2E tests**

## Running Tests

### Prerequisites

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Install Playwright browsers:**
   ```bash
   npx playwright install chromium
   ```

3. **Start development server:**
   ```bash
   npm run dev:web
   # Server should be running on http://localhost:3000
   ```

### Test Commands

**Run all E2E tests:**
```bash
npm run test:e2e
```

**Run with UI mode (interactive):**
```bash
npm run test:e2e:ui
```

**Run in headed mode (see browser):**
```bash
npm run test:e2e:headed
```

**Debug tests:**
```bash
npm run test:e2e:debug
```

**View test report:**
```bash
npm run test:e2e:report
```

**Run specific test file:**
```bash
npx playwright test tests/e2e/01-landing.spec.ts
```

**Run tests in specific browser:**
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit
```

## Test Environment

### Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL:** `http://localhost:3000` (configurable via `PLAYWRIGHT_BASE_URL`)
- **Browser:** Chromium (default)
- **Viewport:** 1280x720
- **Timeout:** 60 seconds per test
- **Retries:** 2 on CI, 0 locally
- **Parallel:** Yes (unless CI)

### Environment Variables

Optional environment variables for testing:

```bash
# Custom base URL
PLAYWRIGHT_BASE_URL=http://localhost:3100

# Enable/disable headless mode
PLAYWRIGHT_HEADLESS=false

# CI mode (affects retries and parallelization)
CI=true
```

## Test Helpers

Located in `tests/e2e/fixtures/test-helpers.ts`:

### Navigation Helpers
- `waitForPageLoad(page)` - Wait for page fully loaded
- `clickAndWaitForNavigation(page, selector)` - Click and navigate

### Form Helpers
- `fillAndVerify(page, selector, value)` - Fill form field and verify
- `verifyElementWithText(page, selector, text)` - Verify element contains text

### API Helpers
- `waitForAPIResponse(page, urlPattern)` - Wait for API call
- `mockAPIRoute(page, route, response, status)` - Mock API endpoint

### Wallet Helpers
- `mockHederaWallet(page)` - Mock HashConnect wallet

### Debugging Helpers
- `takeTimestampedScreenshot(page, name)` - Save screenshot with timestamp
- `verifyNoConsoleErrors(page)` - Check for console errors

### Test Data
- `testData.validAsset` - Valid asset metadata
- `testData.invalidAsset` - Invalid asset data
- `testData.mockShieldResult` - Mock shield creation response

## Writing New Tests

### Test Structure

```typescript
import { test, expect } from '@playwright/test';
import { waitForPageLoad, mockHederaWallet } from './fixtures/test-helpers';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    const button = page.getByRole('button', { name: /click me/i });
    await button.click();

    // Assertions
    await expect(button).toBeVisible();
  });
});
```

### Best Practices

1. **Use Semantic Selectors:**
   ```typescript
   // ✅ Good - Semantic, accessible
   page.getByRole('button', { name: /submit/i })
   page.getByLabel(/email/i)
   page.getByText(/welcome/i)

   // ❌ Bad - Fragile
   page.locator('#submit-btn-123')
   page.locator('.btn.primary')
   ```

2. **Wait for Elements:**
   ```typescript
   // ✅ Good - Explicit wait
   await expect(element).toBeVisible({ timeout: 5000 });

   // ❌ Bad - No wait
   expect(await element.isVisible()).toBe(true);
   ```

3. **Mock External Dependencies:**
   ```typescript
   // Mock Hedera wallet
   await mockHederaWallet(page);

   // Mock API endpoints
   await mockAPIRoute(page, '**/api/v1/shield', mockData);
   ```

4. **Use Test Data:**
   ```typescript
   // ✅ Good - Reusable test data
   await fillForm(page, testData.validAsset);

   // ❌ Bad - Hardcoded data
   await page.fill('input[name="name"]', 'Test Asset #123');
   ```

5. **Clean Up After Tests:**
   ```typescript
   test.afterEach(async ({ page }) => {
     // Clear session storage
     await page.evaluate(() => sessionStorage.clear());
   });
   ```

## CI/CD Integration

E2E tests run automatically in GitHub Actions on:
- Pull requests
- Push to main branch

See `.github/workflows/test.yml` for configuration.

### CI Environment

CI runs tests with:
- Retries: 2 attempts per test
- Workers: 1 (sequential)
- Headless: true
- Screenshots: On failure
- Video: On failure

## Debugging Failed Tests

### 1. View HTML Report
```bash
npm run test:e2e:report
```

### 2. Run in Debug Mode
```bash
npm run test:e2e:debug
```

### 3. Run in Headed Mode
```bash
npm run test:e2e:headed
```

### 4. Check Screenshots
Failed test screenshots are saved to:
```
playwright-report/screenshots/
```

### 5. Check Videos
Failed test videos are saved to:
```
test-results/
```

## Common Issues

### Issue: Tests timeout

**Solution:**
- Increase timeout in `playwright.config.ts`
- Check if dev server is running (`npm run dev:web`)
- Verify base URL is correct

### Issue: Tests fail on CI but pass locally

**Solution:**
- Run tests with CI mode: `CI=true npm run test:e2e`
- Check for race conditions
- Verify environment variables are set

### Issue: Wallet connection tests fail

**Solution:**
- Verify `mockHederaWallet()` is called in `beforeEach`
- Check if HashConnect library is loaded
- Mock network requests if needed

### Issue: Elements not found

**Solution:**
- Use `await expect(element).toBeVisible()` instead of `isVisible()`
- Add explicit waits: `await page.waitForSelector(selector)`
- Check if element selector is correct

## Test Maintenance

### When to Update Tests

- ✅ New features added
- ✅ UI changes significantly
- ✅ API endpoints change
- ✅ Test data needs updating
- ✅ Selectors break due to markup changes

### Monthly Checklist

- [ ] Review and update test data
- [ ] Check for flaky tests
- [ ] Update Playwright to latest version
- [ ] Review test coverage gaps
- [ ] Clean up outdated tests

## Resources

- **Playwright Docs:** https://playwright.dev
- **Best Practices:** https://playwright.dev/docs/best-practices
- **API Reference:** https://playwright.dev/docs/api/class-test
- **Debugging Guide:** https://playwright.dev/docs/debug

---

**Last Updated:** 2026-02-23
**Test Count:** 31 E2E tests
**Coverage:** Landing, Wallet, Shield Creation
