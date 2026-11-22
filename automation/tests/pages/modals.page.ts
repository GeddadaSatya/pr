import { Page, Locator, expect } from '@playwright/test';

export class ModalsPage {
  readonly page: Page;

  // Search Modal
  readonly searchModal: Locator;
  readonly searchInput: Locator;
  readonly searchResults: Locator;

  // Notifications Drawer
  readonly notificationsDrawer: Locator;
  readonly markAllReadBtn: Locator;
  readonly notificationCards: Locator;

  // Transaction Modal
  readonly transactionModal: Locator;
  readonly titleInput: Locator;
  readonly amountInput: Locator;
  readonly ledgerTypeSelect: Locator;
  readonly categorySelect: Locator;
  readonly saveLedgerBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;

    this.searchModal = page.locator('#search-dialog-card');
    this.searchInput = page.locator('#search-dialog-card input[type="text"]');
    this.searchResults = page.locator('#search-dialog-card button');

    this.notificationsDrawer = page.locator('#notifications-drawer');
    this.markAllReadBtn = page.locator('#notifications-drawer button:has-text("Mark all read")');
    this.notificationCards = page.locator('#notifications-drawer [data-notification-card]');

    this.transactionModal = page.locator('form:has-text("New Ledger Entry"), div:has-text("New Ledger Entry")');
    this.titleInput = page.locator('input[placeholder*="Airline tickets"], input[placeholder*="Entry Title"], input[placeholder*="e.g."]').first();
    this.amountInput = page.locator('input[type="number"][placeholder="0.00"]');
    this.ledgerTypeSelect = page.locator('select:has(option[value="expense"])');
    this.categorySelect = page.locator('select:has(option[value="Dining"])');
    this.saveLedgerBtn = page.locator('button:has-text("Save to Ledger"), button:has-text("Saved ✓")');
    this.cancelBtn = page.locator('button:has-text("Cancel")');
  }

  async openSearch() {
    const searchBtn = this.page.locator('header:visible button[aria-label="Search"]');
    if (await searchBtn.isVisible()) {
      await searchBtn.click();
    } else {
      await this.page.keyboard.press('Control+KeyK');
    }
    await expect(this.searchModal).toBeVisible();
  }

  async performSearch(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(300);
  }

  async closeSearch() {
    await this.page.keyboard.press('Escape');
  }

  async openNotifications() {
    await this.page.locator('header:visible button[aria-label="Notifications"]').click();
    await expect(this.notificationsDrawer).toBeVisible();
  }

  async closeNotifications() {
    await this.page.locator('#close-notifications-btn').click();
  }

  async createExpense(title: string, amount: number, category: string = 'Dining') {
    await this.titleInput.fill(title);
    await this.amountInput.fill(amount.toString());
    if (await this.categorySelect.isVisible()) {
      await this.categorySelect.selectOption(category);
    }
    await this.saveLedgerBtn.click();
    await this.page.waitForTimeout(600);
  }

  async createPayable(creditor: string, amount: number) {
    await this.titleInput.fill(creditor);
    await this.amountInput.fill(amount.toString());
    await this.saveLedgerBtn.click();
    await this.page.waitForTimeout(600);
  }
}
