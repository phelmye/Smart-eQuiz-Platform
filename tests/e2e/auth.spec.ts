import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  const testEmail = `test-${Date.now()}@example.com`;
  const testPassword = 'TestPassword123!';

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    await expect(page).toHaveTitle(/Smart eQuiz/i);
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
  });

  test('should show validation errors for empty login form', async ({ page }) => {
    const loginButton = page.getByRole('button', { name: /sign in/i });
    await loginButton.click();
    
    // Should show validation errors
    await expect(page.getByText(/email is required/i)).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.getByLabel(/email/i).fill('wrong@example.com');
    await page.getByLabel(/password/i).fill('wrongpassword');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should show error message
    await expect(page.getByText(/invalid credentials/i)).toBeVisible();
  });

  test('should successfully register a new user', async ({ page }) => {
    // Navigate to signup page
    await page.getByRole('link', { name: /sign up/i }).click();
    
    // Fill registration form
    await page.getByLabel(/email/i).fill(testEmail);
    await page.getByLabel(/password/i).first().fill(testPassword);
    await page.getByLabel(/confirm password/i).fill(testPassword);
    await page.getByLabel(/full name/i).fill('Test User');
    
    // Submit form
    await page.getByRole('button', { name: /create account/i }).click();
    
    // Should redirect to dashboard or show success message
    await expect(page).toHaveURL(/dashboard|success/i, { timeout: 10000 });
  });

  test('should successfully login with valid credentials', async ({ page }) => {
    // Use existing test account
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
    await expect(page.getByText(/welcome/i)).toBeVisible();
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
    
    // Click logout button
    await page.getByRole('button', { name: /logout|sign out/i }).click();
    
    // Should redirect to login
    await expect(page).toHaveURL(/login|signin/i);
  });

  test('should handle password reset flow', async ({ page }) => {
    // Click forgot password link
    await page.getByRole('link', { name: /forgot password/i }).click();
    
    // Fill email
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /reset password|send link/i }).click();
    
    // Should show success message
    await expect(page.getByText(/email sent|check your email/i)).toBeVisible();
  });

  test('should persist session after page reload', async ({ page, context }) => {
    // Login
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
    
    // Reload page
    await page.reload();
    
    // Should still be on dashboard (session persisted)
    await expect(page).toHaveURL(/dashboard/i);
    await expect(page.getByText(/welcome|dashboard/i)).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    // Try to access dashboard directly
    await page.goto('/dashboard');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login|signin/i, { timeout: 5000 });
  });
});
