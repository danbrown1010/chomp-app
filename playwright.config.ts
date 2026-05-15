import * as dotenv from 'dotenv'
dotenv.config()

import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './tests',
  globalSetup: './tests/global-setup.ts',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: 'https://app.vela-go.com',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
    {
      name: 'mobile',
      use: {
        browserName: 'chromium',
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  reporter: [
    ['html', { open: 'never' }],
    ['list'],
  ],
})
