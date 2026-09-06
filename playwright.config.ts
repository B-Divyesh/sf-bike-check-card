import { defineConfig, devices } from '@playwright/test';

const liveBaseUrl = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: liveBaseUrl ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium-mobile', use: { ...devices['Pixel 5'] } },
    { name: 'chromium-desktop', use: { ...devices['Desktop Chrome'] } }
  ],
  webServer: liveBaseUrl ? undefined : {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: false
  }
});
