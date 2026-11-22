# Wealth Tracker - Automation Test Suite

This directory contains the complete end-to-end (E2E) and backend REST API test automation suites for the Wealth & Expense Tracker application.

## Directory Structure

```
automation/
├── playwright.config.ts    # Dedicated Playwright configuration
├── tests/
│   ├── api/
│   │   └── api.spec.ts     # 10 Backend App Router API contract tests
│   ├── e2e/
│   │   ├── overview.spec.ts        # Overview, KPI carousel, and PIN privacy mode
│   │   ├── notebook.spec.ts        # Expense Notebook CRUD, category filters, search
│   │   ├── payables.spec.ts        # Payables settlement disbursement, export ledger
│   │   ├── loans.spec.ts           # Compounding loan calculator & borrower dossier
│   │   ├── assets.spec.ts          # Assets register & dynamic valuation updates
│   │   └── cross-screen-sync.spec.ts # Universal search (Ctrl+K), notifications drawer, sync
│   └── pages/
│       ├── base.page.ts            # Base Page Object Model (header, nav, PIN unlock)
│       └── modals.page.ts          # Modals Page Object Model (search, drawer, transaction)
├── reports/                # Playwright HTML and JSON test reports (git ignored)
└── results/                # Traces, screenshots, and videos on failure (git ignored)
```

## Running Tests

From the project root:

```bash
# Run all tests (API + Desktop E2E)
npm test

# Run API tests only
npm run test:api

# Run E2E user workflow tests only
npm run test:e2e

# View interactive HTML test report
npm run test:report
```
