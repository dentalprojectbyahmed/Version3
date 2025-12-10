import { test, expect } from '@playwright/test';

test.describe('Smoke Tests - Basic App Functionality', () => {
  
  test('app loads successfully', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Abdullah Dental Care/i);
  });

  test('dashboard displays', async ({ page }) => {
    await page.goto('/');
    
    // Wait for setup wizard or dashboard
    const hasSetupWizard = await page.locator('text=Setup Wizard').isVisible().catch(() => false);
    
    if (hasSetupWizard) {
      // Complete setup wizard
      await page.click('button:has-text("Skip")').catch(() => {});
    }
    
    // Check dashboard elements
    await expect(page.locator('text=Welcome back')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Total Patients')).toBeVisible();
  });

  test('navigation works', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to Patients
    await page.click('a[href="/patients"]');
    await expect(page).toHaveURL(/.*patients/);
    await expect(page.locator('text=Patients')).toBeVisible();
    
    // Navigate to Appointments
    await page.click('a[href="/appointments"]');
    await expect(page).toHaveURL(/.*appointments/);
    await expect(page.locator('text=Appointments')).toBeVisible();
  });

  test('offline functionality - IndexedDB works', async ({ page }) => {
    await page.goto('/');
    
    // Check if IndexedDB is initialized
    const dbExists = await page.evaluate(async () => {
      const dbs = await indexedDB.databases();
      return dbs.some(db => db.name === 'AbdullahDentalCare');
    });
    
    expect(dbExists).toBeTruthy();
  });
});
