import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  timeout: 180000,
  retries: 1,
  workers: 1,
  expect: { timeout: 15000 },

  reporter: [
    ["line"],
    ["html", { outputFolder: "reports/html-report", open: "never" }],
    ["json", { outputFile: "reports/json-report/results.json" }],
    ["allure-playwright", { resultsDir: "reports/allure-results" }],
    ["./reporters/google-sheets-reporter.js"],
    ["./helpers/failure-reporter.js"]
  ],

  use: {
    headless: true,
    screenshot: "on",
    video: "on",
    trace: "retain-on-failure",
    navigationTimeout: 60000,
    actionTimeout: 30000,
    // Real user-agent — some APIs block HeadlessChrome
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
  },

  /* ===== PROJECTS: login once, reuse auth for all tests ===== */
  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.js/,
    },
    {
      name: 'expert-dashboard',
      testMatch: /Expert-Dashboard\/.*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: {
        storageState: 'tests/Expert-Dashboard/.auth/user.json',
      },
    },
    {
      name: 'ccop',
      testMatch: /CCOP\/(?!ccop-clinician-signup).*\.spec\.js/,
      dependencies: ['auth-setup'],
      use: {
        storageState: 'tests/Expert-Dashboard/.auth/user.json',
      },
    },
    {
      name: 'ccop-signup',
      testMatch: /CCOP\/ccop-clinician-signup\.spec\.js/,
    },
  ],
});