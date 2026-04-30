#!/usr/bin/env node

/**
 * generate-dashboard.js
 * Parses Playwright JSON report and generates dashboard data files.
 *
 * Reads:  reports/json-report/results.json
 * Writes: docs/data/latest.json
 *         docs/history/runs.json  (appends, keeps last 300)
 *         docs/exports/current-run.csv
 *         docs/exports/all-runs-summary.csv
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const REPORT_PATH = path.join(ROOT, 'reports', 'json-report', 'results.json');
const LATEST_PATH = path.join(ROOT, 'docs', 'data', 'latest.json');
const HISTORY_PATH = path.join(ROOT, 'docs', 'history', 'runs.json');
const CSV_CURRENT = path.join(ROOT, 'docs', 'exports', 'current-run.csv');
const CSV_ALL = path.join(ROOT, 'docs', 'exports', 'all-runs-summary.csv');
const ARTIFACTS_DIR = path.join(ROOT, 'docs', 'artifacts');
const RESULTS_PATH = path.join(ROOT, 'docs', 'test-results.json');
const MAX_HISTORY = 300;
const HISTORY_RETENTION_DAYS = 30;

// Module name mapping
const MODULE_MAP = {
  'CCOP': 'CCOP',
  'Expert-Dashboard': 'Expert Dashboard',
};

function getModuleFromFile(filePath) {
  if (filePath.includes('CCOP')) return 'CCOP';
  if (filePath.includes('Expert-Dashboard')) return 'Expert-Dashboard';
  return path.basename(path.dirname(filePath)) || 'Other';
}

function getModuleLabel(key) {
  return MODULE_MAP[key] || key;
}

// Recursively extract tests from Playwright suite tree
function extractTests(suite, tests = []) {
  if (suite.specs) {
    for (const spec of suite.specs) {
      for (const test of spec.tests || []) {
        for (const result of test.results || []) {
          const status = result.status === 'passed' ? 'passed'
            : result.status === 'timedOut' ? 'timedOut'
            : result.status === 'skipped' ? 'skipped'
            : 'failed';

          const errorMsg = result.errors && result.errors.length > 0
            ? result.errors.map(e => e.message || '').join('\n').substring(0, 500)
            : '';

          const attachments = (result.attachments || []).map(a => ({
            name: a.name,
            sourcePath: a.path || '',
            path: a.path ? path.basename(a.path) : '',
            contentType: a.contentType || '',
          }));

          tests.push({
            title: spec.title,
            status,
            durationMs: result.duration || 0,
            file: spec.file || '',
            module: getModuleFromFile(spec.file || ''),
            moduleLabel: getModuleLabel(getModuleFromFile(spec.file || '')),
            attachments,
            error: errorMsg,
            retry: result.retry || 0,
          });
        }
      }
    }
  }

  if (suite.suites) {
    for (const child of suite.suites) {
      extractTests(child, tests);
    }
  }

  return tests;
}

function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

function main() {
  if (!fs.existsSync(REPORT_PATH)) {
    console.error('Report not found:', REPORT_PATH);
    console.error('Run tests first: npx playwright test');
    process.exit(1);
  }

  const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'));
  const allTests = extractTests(report);

  // Keep only the final result for each test (highest retry number)
  const testMap = new Map();
  for (const t of allTests) {
    const key = `${t.file}::${t.title}`;
    const existing = testMap.get(key);
    if (!existing || t.retry > existing.retry) {
      testMap.set(key, t);
    }
  }
  const tests = Array.from(testMap.values());

  // Compute summary
  const passed = tests.filter(t => t.status === 'passed').length;
  const failed = tests.filter(t => t.status === 'failed').length;
  const skipped = tests.filter(t => t.status === 'skipped').length;
  const timedOut = tests.filter(t => t.status === 'timedOut').length;
  const total = tests.length;
  const activeTotal = total - skipped;
  const passRate = activeTotal > 0 ? Math.round((passed / activeTotal) * 100) : 0;

  // Compute per-module stats
  const modules = {};
  for (const t of tests) {
    if (!modules[t.module]) {
      modules[t.module] = { label: t.moduleLabel, total: 0, passed: 0, failed: 0, skipped: 0, timedOut: 0 };
    }
    modules[t.module].total++;
    if (t.status === 'passed') modules[t.module].passed++;
    else if (t.status === 'failed') modules[t.module].failed++;
    else if (t.status === 'skipped') modules[t.module].skipped++;
    else if (t.status === 'timedOut') modules[t.module].timedOut++;
  }

  const runId = crypto.randomUUID();
  const startedAt = report.stats?.startTime || new Date().toISOString();
  const durationMs = report.stats?.duration || tests.reduce((sum, t) => sum + t.durationMs, 0);

  // Copy artifacts for failed tests
  if (fs.existsSync(ARTIFACTS_DIR)) {
    fs.rmSync(ARTIFACTS_DIR, { recursive: true });
  }
  fs.mkdirSync(ARTIFACTS_DIR, { recursive: true });

  let artifactCount = 0;
  for (const t of tests) {
    if (t.status === 'passed') continue;
    const slug = t.title.replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50).toLowerCase();
    for (const a of t.attachments) {
      if (!a.sourcePath || !fs.existsSync(a.sourcePath)) continue;
      const ext = path.extname(a.path) || '';
      const destName = `${slug}-${a.name}${ext}`;
      const destPath = path.join(ARTIFACTS_DIR, destName);
      try {
        fs.copyFileSync(a.sourcePath, destPath);
        a.webPath = `./artifacts/${destName}`;
        artifactCount++;
      } catch { /* skip */ }
    }
  }
  if (artifactCount > 0) {
    console.log(`Copied ${artifactCount} artifacts to docs/artifacts/`);
  }

  const latest = {
    id: runId,
    startedAt,
    durationMs,
    summary: { total, passed, failed, skipped, timedOut },
    passRate,
    modules,
    tests: tests.map(({ retry, ...rest }) => ({
      ...rest,
      attachments: rest.attachments.map(({ sourcePath, ...a }) => a),
    })),
  };

  // Write latest.json
  fs.mkdirSync(path.dirname(LATEST_PATH), { recursive: true });
  fs.writeFileSync(LATEST_PATH, JSON.stringify(latest, null, 2));
  console.log('Written:', LATEST_PATH);

  // Update history
  let history = [];
  if (fs.existsSync(HISTORY_PATH)) {
    try { history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')); } catch { history = []; }
  }

  // Lightweight per-test entries for history (title/module/status/duration + truncated error).
  // Skip attachments and full errors to keep runs.json small even with 100s of runs.
  const lightweightTests = tests.map((t) => ({
    title: t.title,
    module: t.module,
    moduleLabel: t.moduleLabel,
    status: t.status,
    durationMs: t.durationMs,
    error: t.error ? t.error.substring(0, 300) : '',
  }));

  const runSummary = {
    id: runId,
    startedAt,
    durationMs,
    summary: { total, passed, failed, skipped, timedOut },
    passRate,
    modules,
    tests: lightweightTests,
  };

  history.unshift(runSummary);

  // Retention: keep all runs from the last HISTORY_RETENTION_DAYS days,
  // plus a hard cap of MAX_HISTORY total entries
  const cutoff = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  history = history.filter(r => new Date(r.startedAt).getTime() >= cutoff);
  if (history.length > MAX_HISTORY) history = history.slice(0, MAX_HISTORY);

  fs.mkdirSync(path.dirname(HISTORY_PATH), { recursive: true });
  fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2));
  console.log('Written:', HISTORY_PATH);

  // Write current-run.csv
  const csvHeader = 'Test ID,Test Name,Module,Status,Duration (ms),Error\n';
  const csvRows = tests.map(t => {
    const error = t.error.replace(/"/g, '""').replace(/\n/g, ' ');
    return `"","${t.title}","${t.moduleLabel}","${t.status}",${t.durationMs},"${error}"`;
  }).join('\n');

  fs.mkdirSync(path.dirname(CSV_CURRENT), { recursive: true });
  fs.writeFileSync(CSV_CURRENT, csvHeader + csvRows);
  console.log('Written:', CSV_CURRENT);

  // Write all-runs-summary.csv
  const summaryHeader = 'Run ID,Date,Total,Passed,Failed,Skipped,Timed Out,Pass Rate (%),Duration (ms)\n';
  const summaryRows = history.map(r => {
    const date = new Date(r.startedAt).toLocaleString('en-US');
    return `"${r.id}","${date}",${r.summary.total},${r.summary.passed},${r.summary.failed},${r.summary.skipped},${r.summary.timedOut},${r.passRate},${r.durationMs}`;
  }).join('\n');

  fs.writeFileSync(CSV_ALL, summaryHeader + summaryRows);
  console.log('Written:', CSV_ALL);

  // Also update the legacy test-results.json used by docs/index.html
  updateLegacyDashboard(tests, startedAt);

  console.log(`\nDashboard data generated: ${total} tests (${passed} passed, ${failed} failed, ${passRate}% pass rate)`);
}

function updateLegacyDashboard(tests, startedAt) {
  let existingData = { lastUpdated: new Date().toISOString(), runs: [], tests: [] };
  if (fs.existsSync(RESULTS_PATH)) {
    try { existingData = JSON.parse(fs.readFileSync(RESULTS_PATH, 'utf8')); } catch { /* ignore */ }
  }

  const passedCount = tests.filter(t => t.status === 'passed').length;
  const failedCount = tests.filter(t => t.status === 'failed' || t.status === 'timedOut').length;
  const today = new Date(startedAt).toISOString().split('T')[0];

  const activeTests = tests.filter(t => t.status !== 'skipped');
  const newRun = { date: today, passed: passedCount, failed: failedCount, total: activeTests.length };
  const todayIdx = existingData.runs.findIndex(r => r.date === today);
  if (todayIdx >= 0) {
    existingData.runs[todayIdx] = newRun;
  } else {
    existingData.runs.unshift(newRun);
  }
  // Keep last 30 days of daily aggregated runs
  const legacyCutoff = Date.now() - HISTORY_RETENTION_DAYS * 24 * 60 * 60 * 1000;
  existingData.runs = existingData.runs.filter(r => {
    const d = new Date(r.date).getTime();
    return !isNaN(d) && d >= legacyCutoff;
  });

  existingData.tests = tests.filter(t => t.status !== 'skipped').map((t, i) => ({
    id: i + 1,
    module: t.module,
    name: t.title,
    status: t.status === 'passed' ? 'passed' : 'failed',
    duration: formatDuration(t.durationMs),
    screenshot: t.attachments.find(a => a.name === 'screenshot')?.webPath || '',
    video: t.attachments.find(a => a.name === 'video')?.webPath || '',
    trace: t.attachments.find(a => a.name === 'trace')?.webPath || '',
  }));

  existingData.lastUpdated = new Date().toISOString();
  fs.writeFileSync(RESULTS_PATH, JSON.stringify(existingData, null, 2));
  console.log('Written:', RESULTS_PATH);
}

main();
