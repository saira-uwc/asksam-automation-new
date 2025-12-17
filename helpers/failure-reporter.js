export default class FailureReporter {
    constructor() {
      console.log("⚠ Failure Reporter loaded (safe mode, no sheet update)");
    }
  
    async onTestEnd(test, result) {
      if (result.status !== "failed") return;
  
      console.log("❌ Test FAILED →", test.title);
  
      const screenshot = result.attachments?.find(a => a.name === "screenshot");
      const video = result.attachments?.find(a => a.name === "video");
  
      console.log("📸 Failure Screenshot:", screenshot?.path || "(none)");
      console.log("🎥 Failure Video:", video?.path || "(none)");
    }
  }
  