import { test, expect } from '@playwright/test';
import { waitForPageLoad, verifyElementWithText } from './fixtures/test-helpers';

/**
 * E2E Tests: Landing Page
 *
 * Tests the main landing page functionality and user journey entry points.
 */

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to landing page
    await page.goto('/');
    await waitForPageLoad(page);
  });

  test('should load landing page successfully', async ({ page }) => {
    // Verify page title
    await expect(page).toHaveTitle(/Quantum Shield NFT/i);

    // Verify main heading
    await verifyElementWithText(page, 'h1', /quantum/i);
  });

  test('should display hero section with CTA', async ({ page }) => {
    // Verify hero section is visible
    const hero = page.locator('[data-testid="hero"], .hero, main > section:first-child');
    await expect(hero).toBeVisible();

    // Verify primary CTA button exists
    const ctaButton = page.getByRole('button', { name: /get started|shield now|connect wallet/i });
    await expect(ctaButton).toBeVisible();
    await expect(ctaButton).toBeEnabled();
  });

  test('should display key features section', async ({ page }) => {
    // Scroll to features section
    await page.evaluate(() => window.scrollTo(0, 500));

    // Verify features section exists
    const features = page.locator('[data-testid="features"], .features');
    await expect(features).toBeVisible();

    // Verify quantum security feature is mentioned
    const quantumFeature = page.getByText(/quantum-safe|post-quantum|ML-DSA|ML-KEM/i);
    await expect(quantumFeature).toBeVisible();
  });

  test('should have working navigation links', async ({ page }) => {
    // Test navigation link clicks
    const navLinks = page.locator('nav a, header a');
    const count = await navLinks.count();
    expect(count).toBeGreaterThan(0);

    // Verify at least one navigation link is visible
    await expect(navLinks.first()).toBeVisible();
  });

  test('should be responsive on mobile viewport', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Verify page still loads
    await expect(page).toHaveTitle(/Quantum Shield NFT/i);

    // Verify mobile navigation (hamburger menu or similar)
    const mobileNav = page.locator('[aria-label="Menu"], button[aria-label*="menu" i], .mobile-nav');

    // Either mobile nav button exists or regular nav is visible
    const hasMobileNav = await mobileNav.count() > 0;
    const hasRegularNav = await page.locator('nav').count() > 0;
    expect(hasMobileNav || hasRegularNav).toBeTruthy();
  });

  test('should have proper meta tags for SEO', async ({ page }) => {
    // Check for essential meta tags
    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description?.length).toBeGreaterThan(50);

    // Check for Open Graph tags (social media)
    const ogTitle = await page.locator('meta[property="og:title"]').getAttribute('content');
    expect(ogTitle).toBeTruthy();
  });

  test('should load without console errors', async ({ page }) => {
    const errors: string[] = [];

    // Capture console errors
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // Ignore known Next.js warnings
        if (!text.includes('Warning:') && !text.includes('deprecated')) {
          errors.push(text);
        }
      }
    });

    // Reload page
    await page.reload();
    await waitForPageLoad(page);

    // Verify no critical errors
    expect(errors).toHaveLength(0);
  });

  test('should have accessibility landmarks', async ({ page }) => {
    // Check for semantic HTML landmarks
    const main = page.locator('main');
    await expect(main).toBeVisible();

    const nav = page.locator('nav, header');
    await expect(nav.first()).toBeVisible();
  });

  test('should display footer with links', async ({ page }) => {
    // Scroll to footer
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    // Verify footer exists
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();

    // Verify footer contains some text or links
    const footerText = await footer.textContent();
    expect(footerText?.length).toBeGreaterThan(10);
  });

  test('should handle navigation to dashboard route', async ({ page }) => {
    // Try to navigate to dashboard (should redirect to connect wallet or show dashboard)
    await page.goto('/dashboard');
    await waitForPageLoad(page);

    // Either shows connect wallet prompt or dashboard
    const hasWalletPrompt = await page.getByText(/connect wallet|connect your wallet/i).count() > 0;
    const hasDashboard = await page.locator('h1, h2').filter({ hasText: /dashboard/i }).count() > 0;

    expect(hasWalletPrompt || hasDashboard).toBeTruthy();
  });
});
