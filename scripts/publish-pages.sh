#!/bin/bash
set -e

REPORT_REPO="$HOME/Documents/Saira Automation/Test Run Reports/asksam-playwright-reports"
AUTOMATION_REPO="$HOME/Documents/Saira Automation/Playwright Automation V1.1"

DATE=$(date +"%Y-%m-%d")

cd "$REPORT_REPO"
mkdir -p "runs/$DATE"

RUN_COUNT=$(ls "runs/$DATE" 2>/dev/null | wc -l | tr -d ' ')
RUN_NUM=$(printf "%02d" $((RUN_COUNT + 1)))
RUN_DIR="runs/$DATE/run-$RUN_NUM"

mkdir -p "$RUN_DIR"

echo "📂 Copying fresh Playwright report → $RUN_DIR"

# 🔥 CRITICAL: copy FULL report (no reuse)
cp -R "$AUTOMATION_REPO/reports/html-report/." "$RUN_DIR/"

# -------- index.json ----------
INDEX_FILE="runs/index.json"
echo '{ "dates": [' > "$INDEX_FILE"

FIRST_DATE=true
for D in runs/*; do
  [ -d "$D" ] || continue
  DATE_NAME=$(basename "$D")

  $FIRST_DATE || echo "," >> "$INDEX_FILE"
  FIRST_DATE=false

  echo "{ \"date\": \"$DATE_NAME\", \"runs\": [" >> "$INDEX_FILE"

  FIRST_RUN=true
  for R in "$D"/run-*; do
    [ -f "$R/index.html" ] || continue
    RUN_NAME=$(basename "$R")

    $FIRST_RUN || echo "," >> "$INDEX_FILE"
    FIRST_RUN=false

    echo "{ \"label\": \"$DATE_NAME — $RUN_NAME\", \"path\": \"runs/$DATE_NAME/$RUN_NAME/index.html\" }" >> "$INDEX_FILE"
  done

  echo "] }" >> "$INDEX_FILE"
done

echo "] }" >> "$INDEX_FILE"

git add .
git commit -m "Playwright report $DATE run-$RUN_NUM"
git push

echo "✅ Published:"
echo "🌍 https://saira-uwc.github.io/asksam-playwright-reports/"