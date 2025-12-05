import { test, expect } from '@playwright/test';

test.describe('Payment Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
  });

  test('should display subscription plans', async ({ page }) => {
    // Navigate to subscription page
    await page.goto('/subscription');
    
    // Should show plan cards
    await expect(page.getByText(/starter|professional|enterprise/i)).toBeVisible();
    await expect(page.getByText(/\$\d+/)).toBeVisible(); // Price display
  });

  test('should show plan features and pricing', async ({ page }) => {
    await page.goto('/subscription');
    
    // Check for common features
    await expect(page.getByText(/tournaments/i)).toBeVisible();
    await expect(page.getByText(/questions/i)).toBeVisible();
    await expect(page.getByText(/participants/i)).toBeVisible();
  });

  test('should initiate checkout flow', async ({ page, context }) => {
    await page.goto('/subscription');
    
    // Click upgrade button
    const upgradeButton = page.getByRole('button', { name: /upgrade|subscribe|get started/i }).first();
    await upgradeButton.click();
    
    // Should redirect to checkout or show payment form
    await expect(page).toHaveURL(/checkout|payment|subscribe/i, { timeout: 10000 });
  });

  test('should validate payment form fields', async ({ page }) => {
    await page.goto('/subscription/checkout');
    
    // Try to submit without filling fields
    await page.getByRole('button', { name: /pay|subscribe|complete/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required|invalid/i)).toBeVisible();
  });

  test('should display current subscription status', async ({ page }) => {
    await page.goto('/subscription');
    
    // Should show current plan
    await expect(page.getByText(/current plan|active plan|free plan/i)).toBeVisible();
  });

  test('should show billing history', async ({ page }) => {
    await page.goto('/billing');
    
    // Should have billing section
    await expect(page.getByText(/billing history|invoices|payments/i)).toBeVisible();
  });

  test('should allow subscription cancellation', async ({ page }) => {
    // Navigate to subscription settings
    await page.goto('/subscription/manage');
    
    // Look for cancel button (may be in a dropdown)
    const cancelButton = page.getByRole('button', { name: /cancel|unsubscribe/i });
    
    if (await cancelButton.isVisible()) {
      await cancelButton.click();
      
      // Should show confirmation dialog
      await expect(page.getByText(/are you sure|confirm/i)).toBeVisible();
    }
  });

  test('should handle payment method updates', async ({ page }) => {
    await page.goto('/billing');
    
    // Look for payment method section
    const updatePaymentButton = page.getByRole('button', { name: /update payment|change card|add card/i });
    
    if (await updatePaymentButton.isVisible()) {
      await updatePaymentButton.click();
      
      // Should show payment form
      await expect(page.getByText(/card number|credit card/i)).toBeVisible();
    }
  });

  test('should display subscription benefits', async ({ page }) => {
    await page.goto('/subscription');
    
    // Check for feature highlights
    const features = [
      /unlimited tournaments/i,
      /advanced analytics/i,
      /priority support/i,
      /custom branding/i,
    ];
    
    // At least one feature should be visible
    let featureFound = false;
    for (const feature of features) {
      if (await page.getByText(feature).isVisible().catch(() => false)) {
        featureFound = true;
        break;
      }
    }
    
    expect(featureFound).toBeTruthy();
  });

  test('should show trial period information', async ({ page }) => {
    await page.goto('/subscription');
    
    // Look for trial messaging
    const trialText = page.getByText(/free trial|14 days|30 days|try free/i);
    
    // Trial info should be visible on at least one plan
    expect(await trialText.count()).toBeGreaterThan(0);
  });
});
