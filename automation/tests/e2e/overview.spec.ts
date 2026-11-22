import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('Overview Dashboard & Privacy Security', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
  });

  test('Privacy Mode masks balances by default and reveals with PIN 1234', async ({ page }) => {
    // 1. Initial load should have masked values
    const privacyEye = page.locator('header:visible button[aria-label="Toggle Privacy Mode"]');
    await expect(privacyEye).toBeVisible();

    // 2. Click eye to trigger unlock modal
    await privacyEye.click();
    const modalHeader = page.locator('h2:has-text("Unlock Privacy Mode")');
    await expect(modalHeader).toBeVisible();

    // 3. Test invalid PIN feedback
    const pinInput = page.locator('input[placeholder="Enter PIN (Default: 1234)"]');
    await pinInput.fill('9999');
    await page.locator('button[type="submit"]:has-text("Unlock")').click();
    const errorMsg = page.locator('text=Incorrect password. Default PIN is 1234.');
    await expect(errorMsg).toBeVisible();

    // 4. Enter valid PIN
    await pinInput.fill('1234');
    await page.locator('button[type="submit"]:has-text("Unlock")').click();
    await expect(modalHeader).not.toBeVisible();

    // 5. Verify values are unmasked
    const netWorthDisplay = page.locator('text=₹1,42,850').first();
    await expect(netWorthDisplay).toBeVisible();
  });

  test('KPI Carousel and Daily Pulse display correct metrics when unlocked', async ({ page }) => {
    await basePage.unlockPrivacy();

    // Verify KPI Carousel title and cards
    const kpiTitle = page.locator('text=Key Wealth Indicators');
    await expect(kpiTitle).toBeVisible();

    const propertyAssetsCard = page.locator('text=TOTAL PROPERTY & ASSETS');
    await expect(propertyAssetsCard).toBeVisible();

    // Verify Daily Cash Inflow & Outflow Pulse exists
    const todayInflow = page.locator("text=Today's Inflow").first();
    await expect(todayInflow).toBeVisible();
  });

  test('Operational Hub displays Bills to Pay Soon and Active Loans', async ({ page }) => {
    await basePage.unlockPrivacy();

    const billsHeader = page.locator('text=Bills to Pay Soon');
    await expect(billsHeader).toBeVisible();

    const loansHeader = page.locator('text=Money You Lent to Others');
    await expect(loansHeader).toBeVisible();
  });
});
