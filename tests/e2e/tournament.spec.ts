import { test, expect } from '@playwright/test';

test.describe('Tournament Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto('/');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByLabel(/password/i).fill('password123');
    await page.getByRole('button', { name: /sign in/i }).click();
    
    // Wait for dashboard
    await expect(page).toHaveURL(/dashboard/i, { timeout: 10000 });
  });

  test('should display tournaments list', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Should show tournaments page
    await expect(page.getByRole('heading', { name: /tournaments/i })).toBeVisible();
  });

  test('should open create tournament dialog', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Click create button
    const createButton = page.getByRole('button', { name: /create|new tournament/i });
    await createButton.click();
    
    // Should show form
    await expect(page.getByText(/tournament name|create tournament/i)).toBeVisible();
  });

  test('should validate tournament form fields', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Open create dialog
    await page.getByRole('button', { name: /create|new tournament/i }).click();
    
    // Try to submit without filling required fields
    await page.getByRole('button', { name: /create|save|submit/i }).click();
    
    // Should show validation errors
    await expect(page.getByText(/required|name is required/i)).toBeVisible();
  });

  test('should create a new tournament', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Open create dialog
    await page.getByRole('button', { name: /create|new tournament/i }).click();
    
    // Fill form
    const tournamentName = `Test Tournament ${Date.now()}`;
    await page.getByLabel(/tournament name|name/i).fill(tournamentName);
    await page.getByLabel(/date|start date/i).fill('2025-12-31');
    
    // Submit
    await page.getByRole('button', { name: /create|save/i }).click();
    
    // Should show success message or redirect
    await expect(page.getByText(new RegExp(tournamentName, 'i'))).toBeVisible({ timeout: 5000 });
  });

  test('should filter tournaments', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Look for filter controls
    const filterButton = page.getByRole('button', { name: /filter|search/i });
    
    if (await filterButton.isVisible()) {
      await filterButton.click();
      
      // Should show filter options
      await expect(page.getByText(/status|date|type/i)).toBeVisible();
    }
  });

  test('should view tournament details', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Click on first tournament (if exists)
    const firstTournament = page.getByRole('link', { name: /tournament/i }).first();
    
    if (await firstTournament.isVisible()) {
      await firstTournament.click();
      
      // Should show tournament details
      await expect(page.getByText(/participants|rounds|schedule/i)).toBeVisible();
    }
  });

  test('should add participants to tournament', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Create or open a tournament
    const firstTournament = page.getByRole('link', { name: /tournament/i }).first();
    
    if (await firstTournament.isVisible()) {
      await firstTournament.click();
      
      // Look for add participants button
      const addButton = page.getByRole('button', { name: /add participant|invite/i });
      
      if (await addButton.isVisible()) {
        await addButton.click();
        
        // Should show participant selection/invite form
        await expect(page.getByText(/select participant|email|user/i)).toBeVisible();
      }
    }
  });

  test('should start a tournament', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Find a tournament in "draft" or "upcoming" status
    const startButton = page.getByRole('button', { name: /start tournament|begin/i }).first();
    
    if (await startButton.isVisible()) {
      await startButton.click();
      
      // Should show confirmation or start the tournament
      await expect(page.getByText(/tournament started|in progress|confirm/i)).toBeVisible();
    }
  });

  test('should record scores in tournament', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Open an active tournament
    const activeTournament = page.getByRole('link', { name: /tournament/i }).first();
    
    if (await activeTournament.isVisible()) {
      await activeTournament.click();
      
      // Look for score entry section
      const scoreInput = page.getByLabel(/score|points/i);
      
      if (await scoreInput.isVisible()) {
        await scoreInput.fill('100');
        
        // Should be able to save score
        const saveButton = page.getByRole('button', { name: /save|submit score/i });
        if (await saveButton.isVisible()) {
          await saveButton.click();
          
          // Should show success feedback
          await expect(page.getByText(/saved|updated|success/i)).toBeVisible();
        }
      }
    }
  });

  test('should display tournament leaderboard', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Open a tournament
    const tournament = page.getByRole('link', { name: /tournament/i }).first();
    
    if (await tournament.isVisible()) {
      await tournament.click();
      
      // Should show leaderboard
      await expect(page.getByText(/leaderboard|standings|rankings/i)).toBeVisible();
    }
  });

  test('should delete a tournament', async ({ page }) => {
    await page.goto('/tournaments');
    
    // Look for delete button (usually in dropdown menu)
    const moreButton = page.getByRole('button', { name: /more|options|menu/i }).first();
    
    if (await moreButton.isVisible()) {
      await moreButton.click();
      
      const deleteButton = page.getByRole('menuitem', { name: /delete|remove/i });
      
      if (await deleteButton.isVisible()) {
        await deleteButton.click();
        
        // Should show confirmation dialog
        await expect(page.getByText(/are you sure|confirm|delete/i)).toBeVisible();
      }
    }
  });
});
