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

  timeout: 120000,
  retries: 1,
  workers: 1,

  reporter: [
    ["line"],
    ["html", { outputFolder: "reports/html-report", open: "never" }],
    ["allure-playwright", { resultsDir: "reports/allure-results" }],
    ["./reporters/sheet-reporter.js"],
    ["./helpers/failure-reporter.js"]
  ],

  use: {
    headless: true,
    screenshot: "on",
    video: "on",
    trace: "retain-on-failure",
  }
});