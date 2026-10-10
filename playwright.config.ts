import { defineConfig, devices } from '@playwright/test'

// Browser tests open the built site (run `pnpm build` first) while it talks to the stub
// API in e2e/stub. Both are started here, on ports the dev stack does not use.
const SITE = 'http://127.0.0.1:3100'
const STUB_API = 'http://127.0.0.1:8099'

export default defineConfig({
  testDir: 'e2e',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: { baseURL: SITE, locale: 'ro-RO', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: [
    {
      command: 'node e2e/stub/server.mjs',
      url: `${STUB_API}/v1/health`,
      env: { PORT: '8099' },
      reuseExistingServer: false,
    },
    {
      command: 'node .output/server/index.mjs',
      url: SITE,
      env: { PORT: '3100', HOST: '127.0.0.1', API_URL: STUB_API },
      reuseExistingServer: false,
    },
  ],
})
