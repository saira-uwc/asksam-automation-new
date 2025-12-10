import fs from 'fs';
import path from 'path';
import { sendMail } from '../helpers/emailer.js';

(async function() {
  const reportPath = path.resolve('reports/html-report/index.html');
  const attachments = [];
  if (fs.existsSync(reportPath)) attachments.push({ path: reportPath, filename: 'report.html' });

  try {
    await sendMail('United We Care - Automation Report', 'Latest run attached.', attachments);
    console.log('Report emailed');
  } catch (e) {
    console.error('Email error', e);
  }
})();
