# E2E Tests - Smart eQuiz Platform

End-to-end tests using Playwright for the Smart eQuiz Platform.

## Setup

```bash
cd tests
pnpm install
npx playwright install  # Install browser binaries
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in UI mode (interactive)
pnpm test:ui

# Run tests in headed mode (see browser)
pnpm test:headed

# Run tests in debug mode
pnpm test:debug

# View test report
pnpm test:report

# Generate test code (record actions)
pnpm test:codegen
```

## Test Structure

- `e2e/auth.spec.ts` - Authentication flow tests (login, signup, logout, password reset)
- `e2e/payment.spec.ts` - Payment and subscription tests
- `e2e/tournament.spec.ts` - Tournament management tests

## Configuration

Tests are configured in `playwright.config.ts`:

- **Base URL**: `http://localhost:5174` (tenant-app)
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 retries on CI, 0 locally
- **Reporters**: HTML, JSON, JUnit
- **Auto-start servers**: API (port 3001) and tenant-app (port 5174)

## CI/CD Integration

Tests run automatically on GitHub Actions:

```yaml
- name: Run E2E Tests
  run: |
    cd tests
    pnpm install
    npx playwright install --with-deps
    pnpm test
```

## Writing New Tests

1. Create a new spec file in `e2e/` directory
2. Import test utilities: `import { test, expect } from '@playwright/test';`
3. Organize tests in `test.describe()` blocks
4. Use `test.beforeEach()` for common setup (e.g., login)
5. Write assertions with `expect()`

Example:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should do something', async ({ page }) => {
    await page.getByRole('button').click();
    await expect(page.getByText('Success')).toBeVisible();
  });
});
```

## Best Practices

- Use semantic selectors (roles, labels) over CSS selectors
- Wait for elements to be visible before interacting
- Use `test.beforeEach()` to avoid code duplication
- Add descriptive test names
- Keep tests independent (no shared state)
- Use data-testid for complex elements
- Handle dynamic content with proper timeouts

## Debugging

- Run with `--debug` flag to step through tests
- Use `page.pause()` to pause execution
- Check screenshots/videos in `test-results/` folder
- Use `--headed` to see browser actions

## Test Data

- Use unique identifiers (timestamps) for test data
- Clean up test data after tests (if needed)
- Use test database/environment separate from production
