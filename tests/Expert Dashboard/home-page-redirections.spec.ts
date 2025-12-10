import { test, expect } from '../../helpers/auto-fixture.js';

const BASE = process.env.BASE_URL || 'https://asksam.com.au/';

test.beforeEach(async ({ page }) => {
  // Ensure clean state before each test
  await page.context().clearCookies();
  await page.addInitScript(() => { 
    localStorage.clear(); 
    sessionStorage.clear(); });
});

test('Home page redirections', async ({ page }) => {
  // Always start from sign-in page
  await page.goto(BASE);

  // --- YOUR RECORDED CODE START ---
  await page.goto('https://asksam.com.au/');
  await page.locator('img').nth(4).click();
  await page.getByRole('link', { name: 'Sign up / Log in', exact: true }).click();
  await page.getByRole('button', { name: 'Log in here' }).click();
  await page.getByText('Clinician').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('testing_clinician_aus+clerk_test@tmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Enter verification code' }).fill('424242');
  await page.goto('https://copilot.asksam.com.au/clinical/home');
  await page.locator('img').first().click();
  const page1Promise = page.waitForEvent('popup');
  await page.getByRole('link', { name: 'Appointment Dashboard' }).click();
  const page1 = await page1Promise;
  await page1.getByRole('link', { name: 'appointments', exact: true }).click();
  await page1.getByRole('heading', { name: 'Appointments' }).click();
  await page1.getByRole('link', { name: 'chat', exact: true }).click();
  await page1.getByRole('heading', { name: 'Patients' }).click();
  await page1.getByRole('link', { name: 'notifications', exact: true }).click();
  await page1.getByRole('heading', { name: 'Notifications' }).click();
  await page1.getByRole('button', { name: 'Open user menu' }).click();
  await page1.getByRole('menuitem', { name: 'Sign out' }).click();


  // --- YOUR RECORDED CODE END ---
});
