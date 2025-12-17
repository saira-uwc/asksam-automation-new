import path from "path";
import { writeToSheet } from "../helpers/sheet-writer.js";

/**
 * Robust Sheet Reporter
 * - Waits briefly for attachments to be available
 * - Retries writeToSheet up to 3 times (exponential backoff)
 * - Logs clear diagnostics so you can see why a write failed
 */

function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

export default class SheetReporter {
  constructor() {
    console.log("🟢 Sheet Reporter LOADED");
  }

  // small helper wrapper that retries the sheet write
  async safeWrite(rowObj, tries = 3) {
    let attempt = 0;
    while (attempt < tries) {
      attempt++;
      try {
        console.log(`📝 writeToSheet: attempt ${attempt} →`, {
          moduleName: rowObj.moduleName,
          testName: rowObj.testName,
          status: rowObj.status,
        });
        await writeToSheet(rowObj);
        console.log("✔ writeToSheet succeeded");
        return true;
      } catch (err) {
        console.log(
          `⚠ writeToSheet attempt ${attempt} failed:`,
          err && err.message ? err.message : err
        );
        if (attempt < tries) {
          const waitMs = 500 * attempt; // 500ms, 1000ms, ...
          console.log(`⏳ retrying in ${waitMs}ms...`);
          await sleep(waitMs);
        } else {
          console.log("❌ All writeToSheet retries failed — continuing tests");
          return false;
        }
      }
    }
  }

  async onTestEnd(test, result) {
    try {
      console.log("🔥 Sheet Reporter Triggered:", test.title);

      // ---- MODULE NAME = folder name ----
      const fullPath = test?.location?.file || "";
      const moduleName = fullPath
        ? path.basename(path.dirname(fullPath))
        : "Unknown";

      // ---- TESTCASE NAME = test() TITLE ----
      const testCaseName = test.title || "Unknown";

      // ---- ATTACHMENT PATHS (if any) ----
      const screenshot = result.attachments?.find((a) => a.name === "screenshot");
      const video = result.attachments?.find((a) => a.name === "video");

      // give Playwright a short time to flush attachments (helps with pass-case where files are created just before reporter)
      await sleep(300);

      const screenshotPath = screenshot?.path || "";
      const videoPath = video?.path || "";

      // Build payload for sheet-writer
      const payload = {
        moduleName,
        testName: testCaseName,
        status: (result.status || "UNKNOWN").toUpperCase(),
        screenshotPath,
        videoPath,
      };

      // Defensive logs so you can inspect what will be written
      console.log("➡ Preparing to write row:", JSON.stringify(payload));

      // Try to write with retries
      const ok = await this.safeWrite(payload, 3);
      if (ok) {
        console.log(`✔ Sheet updated → ${moduleName} | ${testCaseName}`);
      } else {
        // Final failure - surface diagnostic to console (but don't throw; reporter must not break test run)
        console.log("⚠ Sheet update FINAL FAILURE for:", moduleName, testCaseName);
      }
    } catch (err) {
      // Don't crash the runner if reporter errors — log and continue
      console.log("❌ Sheet Reporter ERROR:", err && err.message ? err.message : err);
    }
  }
}
