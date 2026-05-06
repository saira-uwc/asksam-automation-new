import { test as setup, expect } from '../../helpers/forensics-fixture.js';
import { LoginPage } from '../../pages/login.page.js';

const authFile = 'tests/Expert-Dashboard/.auth/user.json';

setup('authenticate', async ({ page }) => {
  const login = new LoginPage(page);
  await login.loginAsClinician();

  // Pre-warm BOTH subdomains so storageState contains valid session cookies for
  // each. Cookies set via Clerk on login are subdomain-scoped — if we only
  // visit dashboard.asksam.com.au here, copilot.asksam.com.au tests can hit
  // a "no session on this subdomain" auth bounce mid-suite (dev team's
  // hypothesis for the 22 Apr / 28 Apr mass-failure incidents).
  //
  // Visiting both URLs forces Clerk to issue/refresh the session cookie on
  // each subdomain BEFORE storageState is saved, so all later tests start
  // with a fully-warm session.

  // 1. Dashboard subdomain
  await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
  await page.waitForURL(/dashboard\.asksam\.com\.au\/expert\/dashboard/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  // Sanity check — the sidebar 'Appointments' link only exists when authenticated
  await expect(page.getByRole('link', { name: 'Appointments', exact: true }).first())
    .toBeVisible({ timeout: 30000 });
  console.log('✅ Auth verified on dashboard.asksam.com.au');

  // 2. Copilot subdomain — sanity check uses the sidebar nav which is always
  // present for an authenticated user (page-content buttons like 'Create Clinical
  // Note' depend on data-load state and aren't reliable as auth indicators).
  await page.goto('https://copilot.asksam.com.au/clinical/home');
  await page.waitForURL(/copilot\.asksam\.com\.au\/clinical/, { timeout: 60000 });
  await page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
  await expect(page.getByRole('link', { name: 'Patients' }))
    .toBeVisible({ timeout: 30000 });
  // Also confirm we did NOT get bounced to a login screen
  expect(page.url()).not.toMatch(/sign-in|login|account\.asksam/);
  console.log('✅ Auth verified on copilot.asksam.com.au');

  // Now save — storageState will include cookies set during BOTH visits
  await page.context().storageState({ path: authFile });
  console.log('✅ Saved cross-subdomain auth state to', authFile);
});
