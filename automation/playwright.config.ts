import { defineConfig, devices } from '@playwright/test';
import path from 'path';

/**
 * Playwright Automation Suite Configuration
 * Isolated within the /automation folder
 */
export default defineConfig({
  testDir: path.join(__dirname, 'tests'),
  outputDir: path.join(__dirname, 'results'),
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { outputFolder: path.join(__dirname, 'reports'), open: 'never' }],
    ['json', { outputFile: path.join(__dirname, 'reports', 'test-results.json') }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'api',
      testDir: path.join(__dirname, 'tests', 'api'),
      use: {
        baseURL: process.env.BASE_URL || 'http://localhost:3000',
      },
    },
    {
      name: 'e2e-desktop',
      testDir: path.join(__dirname, 'tests', 'e2e'),
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1280, height: 900 },
      },
    },
    {
      name: 'e2e-mobile',
      testDir: path.join(__dirname, 'tests', 'e2e'),
      testMatch: /.*mobile.*\.spec\.ts/,
      use: {
        ...devices['iPhone 14'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: true,
    timeout: 120000,
  },
});
