#!/bin/bash
set -e

REPORT_REPO="$HOME/Documents/Saira Automation/Test Run Reports/asksam-playwright-reports"
AUTOMATION_REPO="$HOME/Documents/automation"

echo "🧹 Cleaning old report..."
rm -rf "$REPORT_REPO/docs"
mkdir -p "$REPORT_REPO/docs"

echo "📂 Copying latest Playwright report..."
cp -R "$AUTOMATION_REPO/reports/html-report/." "$REPORT_REPO/docs/"

cd "$REPORT_REPO"

git add docs
git commit -m "Update Playwright report (latest)"
git push

echo "✅ Published latest report"
echo "🌍 https://saira-uwc.github.io/asksam-playwright-reports/"