import { test, expect } from '@playwright/test';
import { BasePage } from '../pages/base.page';

test.describe('Loans & Interest Ledger End-to-End Workflows', () => {
  let basePage: BasePage;

  test.beforeEach(async ({ page }) => {
    basePage = new BasePage(page);
    await basePage.goto();
    await basePage.navigateTo('lending');
    await basePage.unlockPrivacy();
  });

  test('Interactive Compounding Loan Calculator calculates returns', async ({ page }) => {
    const calcHeader = page.locator('text=Calculate Interest & Return');
    await expect(calcHeader).toBeVisible();

    // Verify calculator calculation cards
    const totalInterestCard = page.locator('text=TOTAL INTEREST');
    await expect(totalInterestCard).toBeVisible();

    const totalReturnCard = page.locator('text=TOTAL YOU GET BACK');
    await expect(totalReturnCard).toBeVisible();
  });

  test('Switch between Cards view and Table view', async ({ page }) => {
    // 1. Initially on Cards view
    const tableToggle = page.locator('button:has-text("Table")');
    await tableToggle.click();
    await page.waitForTimeout(200);

    // Verify table element is visible
    const tableHeader = page.locator('th:has-text("Borrower Name")');
    await expect(tableHeader).toBeVisible();

    // 2. Switch back to Cards
    const cardsToggle = page.locator('button:has-text("Cards")');
    await cardsToggle.click();
    await page.waitForTimeout(200);
  });

  test('Open Borrower Dossier, upload document, and verify update', async ({ page }) => {
    // 1. Click on first borrower card eye button (View Profile & Dossier)
    const viewBtn = page.locator('button[title*="Profile & Dossier"]').first();
    await viewBtn.click();
    await page.waitForTimeout(400);

    // 2. Verify Borrower Dossier view opened
    const profileAction = page.locator('button:has-text("Edit Profile")').first();
    await expect(profileAction).toBeVisible();

    // 3. Click Upload Document
    const uploadBtn = page.locator('button:has-text("Upload Document")');
    if (await uploadBtn.isVisible()) {
      await uploadBtn.click();
      const docInput = page.locator('input[placeholder*="Identity Proof"]');
      await docInput.fill('QA Automated Verified KYC Proof');
      await page.locator('button:has-text("Upload & Save")').click();
      await page.waitForTimeout(300);

      // Verify document is listed in table
      const newDoc = page.getByText('QA Automated Verified KYC Proof', { exact: true });
      await expect(newDoc).toBeVisible();
    }
  });
});
