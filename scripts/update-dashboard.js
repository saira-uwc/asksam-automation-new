/**
 * Script to update the test dashboard with latest results
 * Run after: npx playwright test
 * 
 * Usage: node scripts/update-dashboard.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');
const docsDir = path.join(rootDir, 'docs');
const resultsFile = path.join(docsDir, 'test-results.json');
const playwrightResultsDir = path.join(rootDir, 'test-results');

// Read Playwright JSON report if available
function readPlaywrightResults() {
  const jsonReportPath = path.join(rootDir, 'reports', 'json-report', 'results.json');
  
  if (fs.existsSync(jsonReportPath)) {
    try {
      return JSON.parse(fs.readFileSync(jsonReportPath, 'utf-8'));
    } catch (e) {
      console.log('Could not parse Playwright JSON report');
    }
  }
  return null;
}

// Get module name from file path
function getModule(filePath) {
  if (filePath.includes('CCOP')) return 'CCOP';
  if (filePath.includes('Expert-Dashboard')) return 'Expert-Dashboard';
  return 'Other';
}

// Format duration
function formatDuration(ms) {
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  const mins = Math.floor(ms / 60000);
  const secs = Math.round((ms % 60000) / 1000);
  return `${mins}m ${secs}s`;
}

// Find attachments for a test
function findAttachments(testTitle) {
  const attachments = { screenshot: '', video: '', trace: '' };
  
  if (!fs.existsSync(playwrightResultsDir)) return attachments;
  
  const dirs = fs.readdirSync(playwrightResultsDir);
  
  for (const dir of dirs) {
    const dirPath = path.join(playwrightResultsDir, dir);
    if (!fs.statSync(dirPath).isDirectory()) continue;
    
    // Check if this directory belongs to the test
    const normalizedTitle = testTitle.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const normalizedDir = dir.toLowerCase();
    
    if (normalizedDir.includes(normalizedTitle.substring(0, 20))) {
      const files = fs.readdirSync(dirPath);
      
      for (const file of files) {
        if (file.endsWith('.png')) {
          attachments.screenshot = `./attachments/${dir}/${file}`;
        } else if (file.endsWith('.webm') || file.endsWith('.mp4')) {
          attachments.video = `./attachments/${dir}/${file}`;
        } else if (file.endsWith('.zip')) {
          attachments.trace = `./attachments/${dir}/${file}`;
        }
      }
    }
  }
  
  return attachments;
}

// Copy attachments to docs folder
function copyAttachments() {
  const attachmentsDir = path.join(docsDir, 'attachments');
  
  if (!fs.existsSync(playwrightResultsDir)) return;
  
  // Create attachments directory
  if (!fs.existsSync(attachmentsDir)) {
    fs.mkdirSync(attachmentsDir, { recursive: true });
  }
  
  // Copy failed test attachments
  const dirs = fs.readdirSync(playwrightResultsDir);
  
  for (const dir of dirs) {
    const srcDir = path.join(playwrightResultsDir, dir);
    const destDir = path.join(attachmentsDir, dir);
    
    if (!fs.statSync(srcDir).isDirectory()) continue;
    
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    
    const files = fs.readdirSync(srcDir);
    for (const file of files) {
      if (file.endsWith('.png') || file.endsWith('.webm') || file.endsWith('.mp4') || file.endsWith('.zip')) {
        fs.copyFileSync(path.join(srcDir, file), path.join(destDir, file));
      }
    }
  }
  
  console.log('✅ Attachments copied to docs/attachments/');
}

// Main function
function updateDashboard() {
  const playwrightResults = readPlaywrightResults();
  
  // Read existing results
  let existingData = {
    lastUpdated: new Date().toISOString(),
    runs: [],
    tests: []
  };
  
  if (fs.existsSync(resultsFile)) {
    try {
      existingData = JSON.parse(fs.readFileSync(resultsFile, 'utf-8'));
    } catch (e) {
      console.log('Creating new results file');
    }
  }
  
  // Update from Playwright results if available
  if (playwrightResults && playwrightResults.suites) {
    const tests = [];
    let id = 1;
    
    function processSpec(spec, filePath) {
      for (const test of spec.tests || []) {
        const result = test.results?.[test.results.length - 1];
        const status = test.status === 'passed' ? 'passed' : 
                      test.status === 'timedOut' ? 'failed' : 
                      test.status;
        
        const attachments = status === 'failed' ? findAttachments(test.title) : { screenshot: '', video: '', trace: '' };
        
        tests.push({
          id: id++,
          module: getModule(filePath),
          name: test.title,
          status: status,
          duration: formatDuration(result?.duration || 0),
          screenshot: attachments.screenshot,
          video: attachments.video,
          trace: attachments.trace
        });
      }
    }
    
    function processSuite(suite, filePath = '') {
      const currentPath = suite.file || filePath;
      
      for (const spec of suite.specs || []) {
        processSpec(spec, currentPath);
      }
      
      for (const childSuite of suite.suites || []) {
        processSuite(childSuite, currentPath);
      }
    }
    
    for (const suite of playwrightResults.suites) {
      processSuite(suite);
    }
    
    // Update tests
    existingData.tests = tests;
    
    // Add new run to history
    const passed = tests.filter(t => t.status === 'passed').length;
    const failed = tests.filter(t => t.status !== 'passed').length;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's run already exists
    const todayRunIndex = existingData.runs.findIndex(r => r.date === today);
    const newRun = { date: today, passed, failed, total: tests.length };
    
    if (todayRunIndex >= 0) {
      existingData.runs[todayRunIndex] = newRun;
    } else {
      existingData.runs.unshift(newRun);
    }
    
    // Keep only last 10 runs
    existingData.runs = existingData.runs.slice(0, 10);
    
    // Copy attachments for failed tests
    if (failed > 0) {
      copyAttachments();
    }
  }
  
  // Update timestamp
  existingData.lastUpdated = new Date().toISOString();
  
  // Write results
  fs.writeFileSync(resultsFile, JSON.stringify(existingData, null, 2));
  
  console.log('✅ Dashboard updated!');
  console.log(`   Total: ${existingData.tests.length}`);
  console.log(`   Passed: ${existingData.tests.filter(t => t.status === 'passed').length}`);
  console.log(`   Failed: ${existingData.tests.filter(t => t.status !== 'passed').length}`);
}

updateDashboard();
