#!/usr/bin/env node

/**
 * push-dashboard.js
 * Commits and pushes updated dashboard data to GitHub.
 * Called automatically after generate-dashboard.js in `npm test`.
 */

const { execSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function run(cmd) {
  try {
    return execSync(cmd, { cwd: ROOT, encoding: 'utf8', stdio: 'pipe' }).trim();
  } catch (e) {
    return e.stdout ? e.stdout.trim() : '';
  }
}

function main() {
  // Stage dashboard data files
  run('git add docs/');

  // Check if there are staged changes
  const diff = run('git diff --cached --stat');
  if (!diff) {
    console.log('\nNo dashboard changes to commit.');
    return;
  }

  // Commit with timestamp
  const now = new Date();
  const timestamp = now.toLocaleString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit', hour12: true,
    timeZone: 'Asia/Kolkata',
  });

  const commitMsg = `Update dashboard data — ${timestamp}`;
  run(`git commit -m "${commitMsg}"`);
  console.log(`\nCommitted: ${commitMsg}`);

  // Push
  try {
    execSync('git push', { cwd: ROOT, encoding: 'utf8', stdio: 'inherit' });
    console.log('Pushed to GitHub — dashboard will update shortly.');
  } catch {
    console.error('Failed to push. You can push manually: git push');
  }
}

main();
