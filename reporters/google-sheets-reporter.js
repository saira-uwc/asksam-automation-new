import path from 'path';
import dotenv from 'dotenv';
dotenv.config();

/**
 * Google Sheets Reporter — pushes test results to Google Sheet via Apps Script webhook.
 *
 * Env vars:
 *   GOOGLE_APPS_SCRIPT_URL — Apps Script doPost endpoint that writes to the sheet
 *
 * Each test title should follow: "TC_XXX_01 - Description" format
 * or just plain titles (auto-generates IDs from module + index).
 */

class GoogleSheetsReporter {
  constructor() {
    this.results = [];
    this.appsScriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL || '';
    this.testIndex = {};
    console.log('🟢 Google Sheets Reporter LOADED');
  }

  onTestEnd(test, result) {
    if (test.title === 'authenticate') return;

    const fullPath = test?.location?.file || '';
    const moduleName = fullPath ? path.basename(path.dirname(fullPath)) : 'Unknown';

    // Extract TC ID from title if present: "TC_CCOP_01 - Some test name"
    const titleMatch = test.title.match(/^(TC_\w+_\d+)\s*-\s*(.+)$/);
    let testcaseId, testName;

    if (titleMatch) {
      testcaseId = titleMatch[1];
      testName = titleMatch[2].trim();
    } else {
      // Auto-generate ID from module
      const prefix = moduleName === 'CCOP' ? 'TC_CCOP' : 'TC_ED';
      if (!this.testIndex[prefix]) this.testIndex[prefix] = 0;
      this.testIndex[prefix]++;
      testcaseId = `${prefix}_${String(this.testIndex[prefix]).padStart(2, '0')}`;
      testName = test.title;
    }

    const suiteName = test.parent?.title || moduleName;
    const description = `[${suiteName}] ${testName}`;

    const now = new Date();
    const updateDateTime = now.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
      timeZone: 'Asia/Kolkata',
    });

    const status = result.status === 'passed' ? 'PASS'
      : result.status === 'skipped' ? 'SKIP'
      : 'FAIL';

    let reason = '';
    if (status === 'FAIL' && result.errors?.length > 0) {
      const rawError = result.errors[0]?.message || 'Unknown error';
      reason = simplifyError(rawError);
    }

    let comment = '';
    if (status === 'PASS') {
      comment = 'Test passed successfully';
    } else if (status === 'FAIL') {
      const screenshot = result.attachments?.find(a => a.name === 'screenshot');
      comment = screenshot?.path ? `Screenshot: ${path.basename(screenshot.path)}` : 'No screenshot captured';
    } else if (status === 'SKIP') {
      comment = 'Test was skipped';
    }

    this.results.push({
      testcaseId,
      testName,
      description,
      updateDateTime,
      status,
      reason,
      comment,
    });
  }

  async onEnd(_result) {
    if (!this.appsScriptUrl) {
      console.log('\n⚠️  GOOGLE_APPS_SCRIPT_URL not set — skipping Google Sheets update');
      console.log('   Deploy the Apps Script and add the URL to .env to enable reporting\n');
      this.printConsoleTable();
      return;
    }

    try {
      await this.pushToGoogleSheets();
      console.log(`\n✅ Google Sheets updated — ${this.results.length} test results pushed`);
    } catch (error) {
      console.error('\n❌ Failed to update Google Sheets:', error.message);
      this.printConsoleTable();
    }
  }

  async pushToGoogleSheets() {
    const payload = JSON.stringify({ results: this.results });

    const response = await fetch(this.appsScriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain' },
      body: payload,
      redirect: 'follow',
    });

    if (response.ok) {
      const body = await response.json();
      if (body.status !== 'success') {
        throw new Error(body.message || 'Apps Script returned an error');
      }
      return;
    }

    if (response.status >= 300 && response.status < 400) {
      const redirectUrl = response.headers.get('location');
      if (redirectUrl) {
        const getResp = await fetch(redirectUrl);
        if (getResp.ok) return;
      }
    }

    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  printConsoleTable() {
    console.log('\n📋 Test Results Summary:');
    console.log('─'.repeat(90));
    console.log(
      'ID'.padEnd(14) + 'Status'.padEnd(8) + 'Test Name'.padEnd(60) + 'Reason'
    );
    console.log('─'.repeat(90));
    for (const r of this.results) {
      const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⏭️';
      console.log(
        r.testcaseId.padEnd(14) +
        `${icon} ${r.status}`.padEnd(10) +
        r.testName.substring(0, 58).padEnd(60) +
        (r.reason || '-')
      );
    }
    console.log('─'.repeat(90));
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const skipped = this.results.filter(r => r.status === 'SKIP').length;
    console.log(`Total: ${this.results.length} | ✅ ${passed} passed | ❌ ${failed} failed | ⏭️ ${skipped} skipped\n`);
  }
}

function simplifyError(rawError) {
  if (rawError.includes('toBeVisible') && rawError.includes('not found')) {
    const m = rawError.match(/Locator: (.+)/);
    return `Expected element not visible: ${m ? m[1].trim() : 'an element'}`;
  }
  if (rawError.includes('toHaveURL')) return 'Page did not navigate to the expected URL';
  if (rawError.includes('Timeout')) return 'Page or element took too long to load (timeout)';
  if (rawError.includes('toContainText') || rawError.includes('toHaveText')) return 'Text content did not match expected value';
  if (rawError.includes('toBeEnabled')) return 'A button or input was disabled when it should have been enabled';
  if (rawError.includes('net::ERR') || rawError.includes('Navigation')) return 'Network error — page failed to load';
  const firstLine = rawError.split('\n')[0].replace(/\[2m|\[22m|\[31m|\[39m/g, '').trim();
  return firstLine.length > 150 ? firstLine.substring(0, 150) + '...' : firstLine;
}

export default GoogleSheetsReporter;
