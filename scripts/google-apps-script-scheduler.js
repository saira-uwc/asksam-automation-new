/**
 * Google Apps Script — Scheduled Test Runner & Email Report
 *
 * This file is a REFERENCE for Google Apps Script (not executed by Node.js).
 * Copy this code into a new Google Apps Script project at https://script.google.com
 *
 * Setup:
 * 1. Create a new Google Apps Script project
 * 2. Paste this code into Code.gs
 * 3. Go to Project Settings > Script Properties and add:
 *    - GITHUB_OWNER  → United-We-Care
 *    - GITHUB_REPO   → playwrite-expert-dashboard
 *    - GITHUB_PAT    → your GitHub Personal Access Token (needs "repo" scope)
 * 4. Go to Triggers > Add Trigger:
 *
 *    Trigger 1 — Run Tests (scheduled):
 *      Function: triggerRunTests
 *      Event source: Time-driven
 *      Type: choose your frequency (e.g., every 6 hours, or specific times)
 *
 *    Trigger 2 — Send Email (scheduled, after tests):
 *      Function: triggerSendEmail
 *      Event source: Time-driven
 *      Type: Day timer → e.g., 6pm to 7pm
 *
 * How it works:
 * - triggerRunTests()   → dispatches "run-tests" event to GitHub Actions
 *                         → workflow runs tests, updates sheets & dashboard (NO email)
 * - triggerSendEmail()  → dispatches "send-email" event to GitHub Actions
 *                         → workflow sends email report only (using latest test data)
 */

function postDispatch(eventType) {
  var props = PropertiesService.getScriptProperties();
  var owner = props.getProperty("GITHUB_OWNER");
  var repo = props.getProperty("GITHUB_REPO");
  var token = props.getProperty("GITHUB_PAT");

  if (!owner || !repo || !token) {
    throw new Error("Missing GITHUB_OWNER/GITHUB_REPO/GITHUB_PAT in script properties.");
  }

  var url = "https://api.github.com/repos/" + owner + "/" + repo + "/dispatches";
  var payload = JSON.stringify({ event_type: eventType });

  var options = {
    method: "post",
    contentType: "application/json",
    headers: {
      Authorization: "token " + token,
      Accept: "application/vnd.github+json",
    },
    payload: payload,
    muteHttpExceptions: true,
  };

  var response = UrlFetchApp.fetch(url, options);
  if (response.getResponseCode() >= 300) {
    throw new Error("GitHub dispatch failed: " + response.getResponseCode() + " " + response.getContentText());
  }

  Logger.log("Dispatched '" + eventType + "' to " + owner + "/" + repo);
}

/**
 * Trigger 1: Run all tests (updates sheet + dashboard, NO email)
 */
function triggerRunTests() {
  postDispatch("run-tests");
}

/**
 * Trigger 2: Send email report only (uses latest dashboard data)
 */
function triggerSendEmail() {
  postDispatch("send-email");
}
