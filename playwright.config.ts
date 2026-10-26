import { defineConfig } from '@playwright/test'
export default defineConfig({
  testDir: './tests', testMatch: '*.spec.ts', fullyParallel: true,
  use: { baseURL: 'http://127.0.0.1:5193', channel: process.env.CI ? undefined : 'chrome', viewport: { width: 1440, height: 1000 }, trace: 'retain-on-failure' },
  webServer: { command: 'npx vite --host 127.0.0.1 --port 5193 --strictPort', url: 'http://127.0.0.1:5193/showcase/', reuseExistingServer: false },
})
