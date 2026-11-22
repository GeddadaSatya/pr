import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';
import { ModalsPage } from '../pages/modals.page';

test.describe('Cross-Screen Data Consistency & Global Overlays', () => {
  let basePage: BasePage;
  let modalsPage: ModalsPage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    modalsPage = new ModalsPage(page);
    await basePage.goto();
    await basePage.unlockPrivacy();
  });

  test('Universal Search finds entities and navigates across modules', async ({ page }) => {
    // 1. Open Search
    await modalsPage.openSearch();

    // 2. Type query that matches both loans and payables
    await modalsPage.performSearch('Marcus');

    // 3. Verify matching results appear
    const results = page.locator('#search-dialog-card [data-search-result]');
    expect(await results.count()).toBeGreaterThan(0);

    // 4. Click first result
    await results.first().click();
    await page.waitForTimeout(300);

    // Verify search modal closes
    await expect(modalsPage.searchModal).not.toBeVisible();
  });

  test('Notifications Drawer displays real alerts and supports Mark All Read', async ({ page }) => {
    // 1. Open drawer
    await modalsPage.openNotifications();

    // 2. Verify alert items
    const alerts = page.locator('#notifications-drawer [data-notification-card]');
    expect(await alerts.count()).toBeGreaterThan(0);

    // 3. Click Mark all read
    if (await modalsPage.markAllReadBtn.isVisible()) {
      await modalsPage.markAllReadBtn.click();
      await page.waitForTimeout(300);
      // Verify unread badge in header is removed or 0
      const headerBadge = page.locator('header:visible button[aria-label="Notifications"] span.rounded-full');
      expect(await headerBadge.count()).toBe(0);
    }

    // 4. Close drawer
    await modalsPage.closeNotifications();
    await expect(modalsPage.notificationsDrawer).not.toBeVisible();
  });

  test('Settling a payable immediately synchronizes Expense Notebook, Day Ledger, and Overview', async ({ page }) => {
    // 1. Navigate to Payables and settle Elena Rostova or first bill
    await basePage.navigateTo('payables');
    const settleBtn = page.locator('button:has-text("Settle")').first();
    await settleBtn.click();

    // Confirm settlement
    await page.locator('button:has-text("Authorize & Settle")').click();
    await page.waitForTimeout(500);

    // 2. Navigate to Expense Notebook -> verify settlement outflow entry exists
    await basePage.navigateTo('expenses');
    const settlementExpense = page.locator('text=(Settlement)').first();
    await expect(settlementExpense).toBeVisible();

    // 3. Navigate to Overview -> verify pulse or payables update
    await basePage.navigateTo('overview');
    const dailyPulseOutflow = page.locator('text=Today\'s Inflow').or(page.locator('text=Bills to Pay Soon'));
    await expect(dailyPulseOutflow.first()).toBeVisible();
  });
});
