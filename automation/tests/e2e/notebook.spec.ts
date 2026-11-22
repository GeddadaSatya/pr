import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('Expense Notebook End-to-End Workflows', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
    await basePage.navigateTo('expenses');
    await basePage.unlockPrivacy();
  });

  test('Expense Notebook loads with metrics and entries table', async ({ page }) => {
    const notebookTitle = page.locator('h1:has-text("Expense Journal")');
    await expect(notebookTitle).toBeVisible();

    // Verify summary KPI cards
    const dailyAverageCard = page.locator('text=DAILY AVERAGE SPEND');
    await expect(dailyAverageCard).toBeVisible();
  });

  test('Quick Add requires category before saving to ledger', async ({ page }) => {
    const quickInput = page.locator('input[placeholder*="Cafe with friends"]');
    await quickInput.fill('Starbucks reserve 750');

    // 1. Clicking save without category opens category confirmation
    const quickAddBtn = page.locator('button:has-text("Save Expense")');
    await quickAddBtn.click();

    // Expect category required modal to appear
    const confirmModal = page.locator('text=Category Selection Required');
    await expect(confirmModal).toBeVisible();

    // Click "Pick Category in Quick Add"
    await page.locator('button:has-text("Pick Category in Quick Add")').click();
    await expect(confirmModal).not.toBeVisible();

    // 2. Now select Dining category chip in Quick Add
    const diningChip = page.locator('button:has-text("Dining")').first();
    await diningChip.click();

    // Click Save Expense again
    await quickAddBtn.click();
    await page.waitForTimeout(400);

    // Verify entry is saved into the list
    const newEntry = page.locator('text=Starbucks reserve').first();
    await expect(newEntry).toBeVisible();
  });

  test('Filter expenses by category select', async ({ page }) => {
    // Select Dining in category dropdown
    const categorySelect = page.locator('select:has(option[value="Dining"])');
    if (await categorySelect.isVisible()) {
      await categorySelect.selectOption('Dining');
      await page.waitForTimeout(200);
      const rows = page.locator('tbody tr');
      expect(await rows.count()).toBeGreaterThan(0);
    }
  });

  test('Search filter matches keywords in real-time', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search transactions"]');
    await searchInput.fill('Dinner');
    await page.waitForTimeout(200);

    const matches = page.locator('text=Dinner');
    await expect(matches.first()).toBeVisible();
  });

  test('Delete expense action removes item and updates count', async ({ page }) => {
    const initialRowsCount = await page.locator('button[title="Delete Entry"]').count();
    if (initialRowsCount > 0) {
      // Click delete on the first row
      await page.locator('button[title="Delete Entry"]').first().click();
      await page.waitForTimeout(300);

      const afterCount = await page.locator('button[title="Delete Entry"]').count();
      expect(afterCount).toBe(initialRowsCount - 1);
    }
  });
});
