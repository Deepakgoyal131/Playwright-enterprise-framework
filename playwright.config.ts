import { defineConfig, devices } from "@playwright/test";
import { Environment } from "./configs/Environment";
import { FrameworkConfig } from "./configs/FrameworkConfig";

// Read Enviornment variables from different env when run test with npx run test:uat(or Learn environment.md file)
Environment.initialize();
export default defineConfig({
  testDir: './tests',
  timeout: FrameworkConfig.timeout.test,
  expect:{
    timeout:FrameworkConfig.timeout.expect
  },
  retries: Environment.isCI ? FrameworkConfig.retry.ci: FrameworkConfig.retry.local,
  workers: Environment.isCI ? FrameworkConfig.workers.ci : FrameworkConfig.workers.local,
  reporter:[["list"],["html"]],

  /* Run tests in files in parallel */
  fullyParallel: FrameworkConfig.execution.fullyParallel,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!Environment.isCI,

  use: {
    baseURL: Environment.baseURL,
    headless: Environment.headless,
    viewport: FrameworkConfig.browser.viewport,

    ignoreHTTPSErrors: FrameworkConfig.browser.ignoreHTTPSErrors,
    locale: FrameworkConfig.browser.locale,
    timezoneId: FrameworkConfig.browser.timezoneId,

    actionTimeout: FrameworkConfig.timeout.action,
    navigationTimeout: FrameworkConfig.timeout.navigation,

    screenshot: FrameworkConfig.artifacts.screenshot,
    video: FrameworkConfig.artifacts.video,
    trace: FrameworkConfig.artifacts.trace,

  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],
});
