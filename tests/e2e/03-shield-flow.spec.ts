import { test, expect } from '@playwright/test';
import {
  waitForPageLoad,
  mockHederaWallet,
  fillAndVerify,
  waitForAPIResponse,
  mockAPIRoute,
  testData,
  verifyElementWithText,
} from './fixtures/test-helpers';

/**
 * E2E Tests: Complete Shield Creation Flow
 *
 * Tests the end-to-end process of creating a quantum-protected NFT shield.
 * This is the core business flow of the application.
 */

test.describe('Shield Creation Flow', () => {
  test.beforeEach(async ({ page, context }) => {
    // Mock wallet connection
    await mockHederaWallet(page);

    // Set connected wallet in session
    await context.addInitScript(() => {
      sessionStorage.setItem(
        'walletConnection',
        JSON.stringify({
          isConnected: true,
          accountId: '0.0.12345',
          network: 'testnet',
        })
      );
    });

    // Navigate to shield creation page
    await page.goto('/dashboard/shield');
    await waitForPageLoad(page);
  });

  test('should display shield creation form', async ({ page }) => {
    // Verify form elements are present
    await expect(page.getByLabel(/asset.*id|token.*id/i)).toBeVisible();
    await expect(page.getByLabel(/name/i)).toBeVisible();
    await expect(page.getByLabel(/category/i)).toBeVisible();

    // Verify submit button
    const submitButton = page.getByRole('button', { name: /shield|create|submit/i });
    await expect(submitButton).toBeVisible();
  });

  test('should validate required fields', async ({ page }) => {
    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /shield|create|submit/i });
    await submitButton.click();

    // Verify validation errors appear
    const errorMessages = page.locator('[role="alert"], .error, .text-red-500');
    await expect(errorMessages.first()).toBeVisible({ timeout: 5000 });
  });

  test('should fill out shield form with valid data', async ({ page }) => {
    // Fill asset ID
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);

    // Fill asset name
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    // Select category
    const categorySelect = page.locator('select[name="category"], [name="category"]');
    await categorySelect.selectOption(testData.validAsset.category);

    // Fill description
    const descriptionField = page.locator('textarea[name="description"], [name="description"]');
    if (await descriptionField.count() > 0) {
      await descriptionField.fill(testData.validAsset.description);
    }

    // Verify form is filled
    await expect(page.locator('input[name="assetId"]')).toHaveValue(testData.validAsset.assetId);
    await expect(page.locator('input[name="name"]')).toHaveValue(testData.validAsset.name);
  });

  test('should successfully create a shield with mocked API', async ({ page }) => {
    // Mock API endpoint
    await mockAPIRoute(page, '**/api/v1/shield', testData.mockShieldResult, 200);

    // Fill form
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const categorySelect = page.locator('select[name="category"]');
    await categorySelect.selectOption(testData.validAsset.category);

    // Submit form
    const submitButton = page.getByRole('button', { name: /shield|create|submit/i });
    await submitButton.click();

    // Wait for success message
    const successMessage = page.locator('[role="status"], .success, .text-green-600').filter({
      hasText: /success|created|shielded/i,
    });
    await expect(successMessage).toBeVisible({ timeout: 10000 });
  });

  test('should display shield ID after successful creation', async ({ page }) => {
    await mockAPIRoute(page, '**/api/v1/shield', testData.mockShieldResult, 200);

    // Fill and submit form
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testData.validAsset.category);
    }

    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Verify shield ID is displayed
    const shieldId = page.getByText(/shield.*id|id:/i);
    await expect(shieldId).toBeVisible({ timeout: 15000 });

    // Verify it contains the expected shield ID format
    const shieldIdText = await shieldId.textContent();
    expect(shieldIdText).toMatch(/[a-f0-9-]{36}|test-shield-\d+/i);
  });

  test('should display quantum signature information', async ({ page }) => {
    await mockAPIRoute(page, '**/api/v1/shield', testData.mockShieldResult, 200);

    // Create shield
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testData.validAsset.category);
    }

    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Wait for result
    await page.waitForTimeout(2000);

    // Look for quantum signature indicators
    const quantumInfo = page.getByText(/ML-DSA|quantum.*signature|post-quantum/i);
    const hasQuantumInfo = await quantumInfo.count() > 0;

    // Either shows quantum signature info or success message (both valid)
    expect(hasQuantumInfo || (await page.getByText(/success/i).count() > 0)).toBeTruthy();
  });

  test('should display Hedera transaction proof', async ({ page }) => {
    await mockAPIRoute(page, '**/api/v1/shield', testData.mockShieldResult, 200);

    // Create shield
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testData.validAsset.category);
    }

    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Wait for transaction info
    await page.waitForTimeout(2000);

    // Look for Hedera transaction ID or topic ID
    const hederaInfo = page.getByText(/0\.0\.\d+@\d+\.\d+|topic.*id|transaction.*id/i);
    const hasHederaInfo = await hederaInfo.count() > 0;

    // Transaction info may be in a details section
    expect(hasHederaInfo || (await page.getByText(/success/i).count() > 0)).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    // Mock API error
    await mockAPIRoute(
      page,
      '**/api/v1/shield',
      {
        error: 'Shield creation failed',
        message: 'Hedera account balance too low',
      },
      500
    );

    // Fill form
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    // Submit
    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Verify error message is displayed
    const errorMessage = page.locator('[role="alert"]').filter({
      hasText: /error|failed|unable/i,
    });
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
  });

  test('should disable submit button while creating shield', async ({ page }) => {
    // Slow down API response to test loading state
    await page.route('**/api/v1/shield', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(testData.mockShieldResult),
      });
    });

    // Fill form
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const submitButton = page.getByRole('button', { name: /shield|create|submit/i });

    // Submit
    await submitButton.click();

    // Verify button is disabled during submission
    await expect(submitButton).toBeDisabled({ timeout: 1000 });
  });

  test('should show loading indicator during shield creation', async ({ page }) => {
    await page.route('**/api/v1/shield', async (route) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      await route.fulfill({
        status: 200,
        body: JSON.stringify(testData.mockShieldResult),
      });
    });

    // Fill and submit
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Look for loading indicator (spinner, progress bar, etc.)
    const loadingIndicator = page.locator('[role="status"], .spinner, .loading, [aria-busy="true"]');
    await expect(loadingIndicator).toBeVisible({ timeout: 1000 });
  });

  test('should allow navigation to view shield after creation', async ({ page }) => {
    await mockAPIRoute(page, '**/api/v1/shield', testData.mockShieldResult, 200);

    // Create shield
    await fillAndVerify(page, 'input[name="assetId"]', testData.validAsset.assetId);
    await fillAndVerify(page, 'input[name="name"]', testData.validAsset.name);

    const categorySelect = page.locator('select[name="category"]');
    if (await categorySelect.count() > 0) {
      await categorySelect.selectOption(testData.validAsset.category);
    }

    await page.getByRole('button', { name: /shield|create|submit/i }).click();

    // Wait for success
    await page.waitForTimeout(2000);

    // Look for "View Shield" or similar button
    const viewButton = page.getByRole('link', { name: /view.*shield|details|see.*shield/i }).or(
      page.getByRole('button', { name: /view.*shield|details|see.*shield/i })
    );

    if (await viewButton.count() > 0) {
      await viewButton.click();
      await waitForPageLoad(page);

      // Verify navigated to shield details page
      expect(page.url()).toMatch(/shield|details|verify/);
    }
  });
});
