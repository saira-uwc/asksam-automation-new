import cron from 'node-cron';
import { exec } from 'child_process';
import path from 'path';

const projectRoot = path.resolve(__dirname, '..');

// run daily at 10:00 AM server time
cron.schedule('0 10 * * *', () => {
  console.log('Running scheduled tests...');
  exec('npx playwright test', { cwd: projectRoot }, (err, stdout, stderr) => {
    console.log(stdout);
    if (err) console.error('Cron run error', err);
  });
});

console.log('Cron scheduler started');
