import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('Payables & Dues End-to-End Workflows', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
    await basePage.navigateTo('payables');
    await basePage.unlockPrivacy();
  });

  test('Payables page displays KPI summary and active liabilities list', async ({ page }) => {
    const headerTitle = page.locator('h1:has-text("Payables & Dues")');
    await expect(headerTitle).toBeVisible();

    const outstandingCard = page.locator('text=TOTAL OUTSTANDING PAYABLES');
    await expect(outstandingCard).toBeVisible();
  });

  test('Settle Bill Modal settles vendor liability and moves it to Paid History', async ({ page }) => {
    // 1. Locate first Settle button
    const settleBtn = page.locator('button:has-text("Settle")').first();
    await expect(settleBtn).toBeVisible();

    // 2. Click Settle to open modal
    await settleBtn.click();
    const settleModal = page.locator('h3:has-text("Disburse Liability Settlement")');
    await expect(settleModal).toBeVisible();

    // 3. Confirm settlement
    const confirmBtn = page.locator('button:has-text("Authorize & Settle")');
    await confirmBtn.click();
    await expect(settleModal).not.toBeVisible();

    // 4. Verify toast notification
    const toast = page.locator('text=Successfully settled');
    await expect(toast).toBeVisible();

    // 5. Switch to Paid History tab
    const paidTab = page.locator('button:has-text("Paid History")');
    await paidTab.click();
    await page.waitForTimeout(300);

    // Verify paid items exist in table
    const paidRows = page.locator('tbody tr');
    expect(await paidRows.count()).toBeGreaterThan(0);
  });

  test('Export Ledger CSV triggers download cleanly', async ({ page }) => {
    const downloadPromise = page.waitForEvent('download');
    await page.locator('button:has-text("Export Ledger")').click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('payables_ledger_');
  });
});
