import { Page, expect } from '@playwright/test';

/**
 * Test Helpers for Quantum-Shield-NFT E2E Tests
 */

/**
 * Wait for page to be fully loaded
 */
export async function waitForPageLoad(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
}

/**
 * Take a screenshot with timestamp
 */
export async function takeTimestampedScreenshot(
  page: Page,
  name: string
): Promise<void> {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `playwright-report/screenshots/${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Wait for API response
 */
export async function waitForAPIResponse(
  page: Page,
  urlPattern: string | RegExp,
  timeout = 10000
): Promise<void> {
  await page.waitForResponse(
    (response) => {
      const url = response.url();
      if (typeof urlPattern === 'string') {
        return url.includes(urlPattern);
      }
      return urlPattern.test(url);
    },
    { timeout }
  );
}

/**
 * Mock Hedera wallet connection
 */
export async function mockHederaWallet(page: Page): Promise<void> {
  await page.addInitScript(() => {
    // Mock HashConnect
    (window as any).hashconnect = {
      connect: async () => ({
        accountId: '0.0.12345',
        network: 'testnet',
      }),
      disconnect: async () => {},
      getState: () => ({
        isConnected: true,
        accountId: '0.0.12345',
        network: 'testnet',
      }),
    };
  });
}

/**
 * Fill form field and verify
 */
export async function fillAndVerify(
  page: Page,
  selector: string,
  value: string
): Promise<void> {
  await page.fill(selector, value);
  await expect(page.locator(selector)).toHaveValue(value);
}

/**
 * Click button and wait for navigation
 */
export async function clickAndWaitForNavigation(
  page: Page,
  selector: string
): Promise<void> {
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'networkidle' }),
    page.click(selector),
  ]);
}

/**
 * Verify element is visible with text
 */
export async function verifyElementWithText(
  page: Page,
  selector: string,
  text: string | RegExp
): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toBeVisible();
  await expect(element).toContainText(text);
}

/**
 * Wait for toast notification
 */
export async function waitForToast(
  page: Page,
  message: string | RegExp,
  timeout = 5000
): Promise<void> {
  const toast = page.locator('[role="alert"], .toast, [data-testid="toast"]');
  await expect(toast).toBeVisible({ timeout });
  await expect(toast).toContainText(message);
}

/**
 * Verify no console errors (except known warnings)
 */
export async function verifyNoConsoleErrors(page: Page): Promise<void> {
  const errors: string[] = [];

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore known warnings
      if (
        !text.includes('Warning: ReactDOM.render') &&
        !text.includes('Warning: componentWillReceiveProps')
      ) {
        errors.push(text);
      }
    }
  });

  // Check at test end
  if (errors.length > 0) {
    throw new Error(`Console errors detected:\n${errors.join('\n')}`);
  }
}

/**
 * Mock API responses
 */
export async function mockAPIRoute(
  page: Page,
  route: string,
  response: any,
  status = 200
): Promise<void> {
  await page.route(route, (route) => {
    route.fulfill({
      status,
      contentType: 'application/json',
      body: JSON.stringify(response),
    });
  });
}

/**
 * Test data factory
 */
export const testData = {
  validAsset: {
    assetId: '0.0.12345:1',
    name: 'Test Patent #001',
    category: 'ip',
    assetType: 'patent',
    description: 'Test quantum-protected patent',
    metadata: {
      jurisdiction: 'US',
      filingDate: '2024-01-01',
      status: 'pending',
    },
  },

  invalidAsset: {
    assetId: '',
    name: '',
    category: '',
    assetType: '',
  },

  mockShieldResult: {
    shieldId: 'test-shield-123',
    assetId: '0.0.12345:1',
    quantumSignature: {
      signature: 'mock-signature',
      publicKey: 'mock-public-key',
    },
    hederaProof: {
      transactionId: '0.0.12345@1234567890.123456789',
      topicId: '0.0.999',
      sequenceNumber: 1,
    },
    timestamp: new Date().toISOString(),
    integrityHash: 'mock-hash-abcd1234',
    migrationState: 'HYBRID_SIGN',
  },
};
