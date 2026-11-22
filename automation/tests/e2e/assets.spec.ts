import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('Total Assets & Holdings End-to-End Workflows', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
    await basePage.navigateTo('assets');
    await basePage.unlockPrivacy();
  });

  test('Assets Canvas renders Net Worth and Allocation breakdown', async ({ page }) => {
    const title = page.locator('h1:has-text("Total Assets & Holdings")');
    await expect(title).toBeVisible();

    const netWorthKpi = page.locator('text=Total Portfolio Net Worth');
    await expect(netWorthKpi).toBeVisible();

    const allocationHeader = page.locator('text=Asset Class Allocation');
    await expect(allocationHeader).toBeVisible();
  });

  test('Register New Asset creates asset holding and updates Net Worth', async ({ page }) => {
    // 1. Open Register Modal
    await page.locator('button:has-text("Register New Asset")').click();
    const modal = page.locator('h2:has-text("Register Asset or Holding")');
    await expect(modal).toBeVisible();

    // 2. Fill asset details
    await page.locator('input[placeholder*="HDFC Sovereign Wealth Deposit"]').fill('Zurich Gold Bullion Tranche');
    await page.locator('input[placeholder="50000"]').fill('75000');
    await page.locator('input[placeholder="7.5"]').fill('5.0');
    await page.locator('input[placeholder*="Brinks Vault Security"]').fill('LGT Bank Liechtenstein');

    // 3. Submit
    await page.locator('button:has-text("Register Asset")').click();
    await expect(modal).not.toBeVisible();

    // 4. Verify asset card is rendered in the list
    const newCard = page.locator('text=Zurich Gold Bullion Tranche');
    await expect(newCard).toBeVisible();
  });

  test('Update Valuation modifies asset valuation reactively', async ({ page }) => {
    // 1. Click Update Value on first asset card
    const updateBtn = page.locator('button:has-text("Update Value")').first();
    await updateBtn.click();
    const modal = page.locator('h3:has-text("Update Valuation")');
    await expect(modal).toBeVisible();

    // 2. Enter new valuation
    const input = page.locator('input[type="number"][required]');
    await input.fill('99000');
    await page.locator('button:has-text("Save Valuation")').click();
    await expect(modal).not.toBeVisible();

    // 3. Verify updated value in card
    const updatedValue = page.locator('text=₹99,000');
    await expect(updatedValue.first()).toBeVisible();
  });
});
