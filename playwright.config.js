/*!
 * Copyright (c) 2026 Digital Bazaar, Inc.
 */
import {defineConfig, devices} from '@playwright/test';

// Serves the repo root over http://localhost (a secure context, so the
// polyfill's `_assertSecureContext()` passes) and runs the smoke test across
// chromium, firefox, and webkit. The webkit project reproduces #51.
const PORT = 9876;

export default defineConfig({
  testDir: './test',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: `http://localhost:${PORT}`
  },
  webServer: {
    // build the bundle, then serve the repo root so /dist and /test
    // are reachable
    command: `npm run build && npx http-server -p ${PORT} -c-1 --silent .`,
    url: `http://localhost:${PORT}/test/fixtures/index.html`,
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  },
  projects: [
    {name: 'chromium', use: {...devices['Desktop Chrome']}},
    {name: 'firefox', use: {...devices['Desktop Firefox']}},
    {name: 'webkit', use: {...devices['Desktop Safari']}}
  ]
});
