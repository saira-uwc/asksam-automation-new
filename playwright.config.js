import dotenv from "dotenv";
dotenv.config();

import { defineConfig } from "@playwright/test";

console.log("Loaded ENV in config:", {
  sheet: process.env.SHEET_ID,
  folder: process.env.DRIVE_FOLDER_ID,
  tab: process.env.SHEET_TAB
});

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
    ["./reporters/sheet-reporter.js"],
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
  }
});