#!/bin/bash

echo "🚀 Publishing Playwright HTML report..."

# PATHS (CHANGE ONLY IF YOUR PATH DIFFERS)
AUTOMATION_REPORT="$HOME/Downloads/automation/reports/html-report"
PAGES_REPO="$HOME/Documents/Saira Automation/Test Run Reports/asksam-playwright-reports"

# Safety check
if [ ! -d "$AUTOMATION_REPORT" ]; then
  echo "❌ HTML report not found. Run Playwright first."
  exit 1
fi

# Clean old report
rm -rf "$PAGES_REPO"/*

# Copy new report
cp -R "$AUTOMATION_REPORT"/* "$PAGES_REPO"

# Push to GitHub Pages
cd "$PAGES_REPO" || exit
git add .
git commit -m "Playwright Report - $(date '+%Y-%m-%d %H:%M:%S')" || echo "ℹ️ No changes to commit"
git push origin main

echo "✅ Report published successfully!"
echo "🌍 https://saira-uwc.github.io/asksam-playwright-reports/"