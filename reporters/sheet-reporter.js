import path from "path";
import { writeToSheet } from "../helpers/sheet-writer.js";

export default class SheetReporter {
  constructor() {
    console.log("🟢 Sheet Reporter LOADED");
  }

  async onTestEnd(test, result) {
    try {
      console.log("🔥 Sheet Reporter Triggered:", test.title);

      const fullPath = test.location.file;
      const moduleName = path.basename(path.dirname(fullPath));
      const testCaseName = test.title;

      const screenshot = result.attachments.find(a => a.name === "screenshot");
      const video = result.attachments.find(a => a.name === "video");

      const screenshotPath = screenshot?.path || "";
      const videoPath = video?.path || "";

      await writeToSheet({
        moduleName,
        testName: testCaseName,
        status: result.status.toUpperCase(),
        screenshotPath,
        videoPath
      });

      console.log(`✔ Sheet updated → ${moduleName} | ${testCaseName}`);

    } catch (err) {
      console.log("❌ Sheet Reporter ERROR:", err);
    }
  }
}
