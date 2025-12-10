import dotenv from "dotenv";
dotenv.config();

console.log("Loaded ENV in config:", {
  sheet: process.env.SHEET_ID,
  folder: process.env.DRIVE_FOLDER_ID
});

import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",

  timeout: 60000,
  retries: 1,

  fullyParallel: false,
  workers: 1,

  reporter: [
    ["line"],
    ["html", { outputFolder: "reports/html-report", open: "never" }],
    ["./reporters/sheet-reporter.js"],   // MUST be before failure reporter
    ["./helpers/failure-reporter.js"]
  ],

  use: {
    headless: true,
    screenshot: "on",
    video: "on",
    trace: "on",
  }
});
