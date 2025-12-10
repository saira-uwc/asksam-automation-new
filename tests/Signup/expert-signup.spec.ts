import { test, expect } from '../../helpers/auto-fixture.js';

const BASE = process.env.BASE_URL || 'https://asksam.com.au/';

test.beforeEach(async ({ page }) => {
  // Ensure clean state before each test
  await page.context().clearCookies();
  await page.addInitScript(() => { 
    localStorage.clear(); 
    sessionStorage.clear(); });
});

test('Expert signup', async ({ page }) => {
  // Always start from sign-in page
  await page.goto(BASE);

  // --- YOUR RECORDED CODE START ---
  await page.locator('.attachment-large.size-large.wp-image-9173').click();
  await page.getByRole('link', { name: 'Sign up / Log in', exact: true }).click();
  await page.getByText('Clinician').click();
  await page.getByRole('button', { name: 'Let\'s get started' }).click();
  await page.getByRole('link', { name: 'Sign up' }).click();
  await page.getByRole('textbox', { name: 'First name' }).click();
  await page.getByRole('textbox', { name: 'First name' }).fill('Test');
  await page.getByRole('textbox', { name: 'Last name' }).click();
  await page.getByRole('textbox', { name: 'Last name' }).fill('User');
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('useraus90+clerk_test@tmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Enter verification code' }).fill('424242');
  await page.waitForTimeout(3000);
  await page.goto('https://copilot.asksam.com.au/clinical/home');
  await page.getByRole('button', { name: 'Clinical Assistant' }).click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(500);
// FORCE Playwright to call reporter
  test.info().attach("done", { body: "completed", contentType: "text/plain" });
  // ensure reporter runs



  // --- YOUR RECORDED CODE END ---
});
