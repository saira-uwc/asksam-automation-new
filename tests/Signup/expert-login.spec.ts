// import { test, expect } from '../../helpers/auto-fixture.js';

// const BASE = process.env.BASE_URL || 'https://asksam.com.au/';

// test.beforeEach(async ({ page }) => {
//   // Ensure clean state before each test
//   await page.context().clearCookies();
//   await page.addInitScript(() => { 
//     localStorage.clear(); 
//     sessionStorage.clear(); });
// });

// test('Expert Login flow', async ({ page }) => {
//   // Always start from sign-in page
//   await page.goto(BASE);

//   // --- YOUR RECORDED CODE START ---
//   await page.goto('https://asksam.com.au/');
//   await page.locator('.elementor-element.elementor-element-8b6335e').click();
//   await page.locator('img').nth(4).click();
//   await page.getByRole('link', { name: 'Sign up / Log in', exact: true }).click();
//   await page.getByText('I’m here to use my AI powered').click();
//   await page.getByRole('button', { name: 'Log in here' }).click();
//   await page.getByText('Clinician').click();
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('tes');
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).dblclick();
//   await page.getByRole('textbox', { name: 'Email address' }).click();
//   await page.getByRole('textbox', { name: 'Email address' }).fill('testing_clinician_aus+clerk_test@tmail.com');
//   await page.getByRole('button', { name: 'Continue' }).click();
//   await page.getByRole('textbox', { name: 'Enter verification code' }).fill('424242');
//   await page.waitForTimeout(3000);
//   await page.goto('https://copilot.asksam.com.au/clinical/home');
//   await page.getByRole('button', { name: 'Open user menu' }).click();
//   await page.getByRole('menuitem', { name: 'Sign out' }).click();
//   await page.waitForTimeout(500);   // ensure reporter runs
//   // --- YOUR RECORDED CODE END ---
// });
