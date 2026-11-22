import { Page, Locator } from '@playwright/test';

export class BasePage {
  readonly page: Page;

  // Sidebar navigators
  readonly overviewNav: Locator;
  readonly notebookNav: Locator;
  readonly payablesNav: Locator;
  readonly loansNav: Locator;
  readonly assetsNav: Locator;

  // Header controls
  readonly searchButton: Locator;
  readonly notificationsButton: Locator;
  readonly privacyEyeButton: Locator;
  readonly profileDropdownButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.overviewNav = page.locator('aside nav button[title*="Overview"]');
    this.notebookNav = page.locator('aside nav button[title*="Expense Notebook"]');
    this.payablesNav = page.locator('aside nav button[title*="Payables"]');
    this.loansNav = page.locator('aside nav button[title*="Loans"]');
    this.assetsNav = page.locator('aside nav button[title*="Total Assets"]');

    this.searchButton = page.locator('header:visible button[aria-label="Search"]');
    this.notificationsButton = page.locator('header:visible button[aria-label="Notifications"]');
    this.privacyEyeButton = page.locator('header:visible button[aria-label="Toggle Privacy Mode"]');
    this.profileDropdownButton = page.locator('header:visible button:has(img[alt="Arjun Sharma"])');
  }

  async goto() {
    await this.page.goto('/');
    await this.page.waitForLoadState('domcontentloaded');
  }

  async unlockPrivacy(pin: string = '1234') {
    const eye = this.privacyEyeButton;
    if (await eye.isVisible()) {
      const isMasked = await eye.getAttribute('title');
      if (isMasked && isMasked.includes('Values Hidden')) {
        await eye.click();
        const pinInput = this.page.locator('input[placeholder="Enter PIN (Default: 1234)"]');
        await pinInput.waitFor({ state: 'visible', timeout: 5000 });
        await pinInput.fill(pin);
        await this.page.locator('button[type="submit"]:has-text("Unlock")').click();
        await this.page.waitForTimeout(300);
      }
    }
  }

  async navigateTo(tab: 'overview' | 'expenses' | 'payables' | 'lending' | 'assets') {
    if (tab === 'overview') await this.overviewNav.click();
    else if (tab === 'expenses') await this.notebookNav.click();
    else if (tab === 'payables') await this.payablesNav.click();
    else if (tab === 'lending') await this.loansNav.click();
    else if (tab === 'assets') await this.assetsNav.click();
    await this.page.waitForTimeout(300);
  }
}
