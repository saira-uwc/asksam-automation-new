export default class FailureReporter {
    constructor() {
      console.log("⚠ Failure Reporter loaded (safe mode, no sheet update)");
    }

    async onTestEnd(test, result) {
      if (result.status !== "failed" && result.status !== "timedOut") return;

      console.log("❌ Test FAILED →", test.title);

      const find = (name) => result.attachments?.find((a) => a.name === name);
      const att = {
        screenshot: find("screenshot"),
        video: find("video"),
        trace: find("trace"),
        cookies: find("cookies.json"),
        clerkInfo: find("clerk-info.txt"),
        localStorage: find("localStorage.json"),
        sessionStorage: find("sessionStorage.json"),
        consoleLog: find("console.log"),
        pageErrors: find("page-errors.log"),
        redirects: find("redirect-chain.txt"),
        netFails: find("network-failures.txt"),
      };

      console.log("📸 Screenshot:    ", att.screenshot?.path || "(none)");
      console.log("🎥 Video:         ", att.video?.path || "(none)");
      console.log("📊 Trace:         ", att.trace?.path || "(none)");
      console.log("🍪 Cookies:       ", att.cookies?.path || "(none)");
      console.log("🔐 Clerk info:    ", att.clerkInfo?.path || "(none)");
      console.log("💾 localStorage:  ", att.localStorage?.path || "(none)");
      console.log("💾 sessionStorage:", att.sessionStorage?.path || "(none)");
      console.log("📝 Console log:   ", att.consoleLog?.path || "(none)");
      console.log("⚠  Page errors:   ", att.pageErrors?.path || "(none)");
      console.log("➡  Redirect chain:", att.redirects?.path || "(none)");
      console.log("❌ Network fails: ", att.netFails?.path || "(none)");
    }
  }
