import { test as setup } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';

const authFile = 'tests/Expert-Dashboard/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const login = new LoginPage(page);
  await login.loginAsClinician();

  // Navigate to expert dashboard to confirm auth works
  await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
  await page.waitForURL(/expert\/dashboard/, { timeout: 30000 });

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
