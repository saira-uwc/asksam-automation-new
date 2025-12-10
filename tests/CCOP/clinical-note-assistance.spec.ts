import { test } from "../../helpers/auto-fixture.js";
import { expect } from "@playwright/test";
import path from "path";

const BASE = process.env.BASE_URL || 'https://asksam.com.au/';
const filePath = path.resolve("uploads/Yamini_Pal_Health_Summary.pdf");   // ✅ ADDED

test.beforeEach(async ({ page }) => {
  await page.context().clearCookies();
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
});

test('Clinical note assistant', async ({ page }) => {
  await page.goto(BASE);

  // Login
  await page.goto('https://asksam.com.au/');
  await page.locator('img').nth(4).click();
  await page.getByRole('link', { name: 'Sign up / Log in', exact: true }).click();
  await page.getByText('Clinician').click();
  await page.getByRole('button', { name: 'Log in here' }).click();
  await page.getByText('Clinician').click();
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).click();
  await page.getByRole('textbox', { name: 'Email address' }).fill('testing_clinician_aus+clerk_test@tmail.com');
  await page.getByRole('button', { name: 'Continue' }).click();
  await page.getByRole('textbox', { name: 'Enter verification code' }).fill('424242');
  await page.waitForTimeout(3000);
  await page.goto('https://copilot.asksam.com.au/clinical/home');
  await page.waitForTimeout(3000)
  await page.getByRole('button', { name: 'Create Clinical Note' }).click();
  await page.getByLabel('', { exact: true }).getByText('Yamini Singh 191').click();
  await page.getByRole('button', { name: 'Upload' }).click();

  // ✅ CORRECT FILE-UPLOAD
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.waitForTimeout(5000);
  await page.getByRole('button', { name: 'Transcribe All' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'Send Transcription' }).click();
  await page.waitForTimeout(15000);
  await page.getByRole('button', { name: 'I Understand and Accept the Disclaimer' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'I Understand and Accept the Disclaimer' }).click();
  await page.waitForTimeout(10000);
  await page.getByText('Assistant').click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'I Understand' }).click();
  await page.getByRole('button', { name: 'close' }).click();
  await page.getByText('Generate note via voice/').click();
  await page.getByRole('button', { name: 'Upload' }).click();
  await page.getByRole('button', { name: 'Choose File' }).click();
  await page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'Transcribe All' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'Send Transcription' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('button', { name: 'I Understand and Accept the disclaimer' }).click();
  await page.waitForTimeout(10000);
  await page.getByRole('heading', { name: 'Yamini Singh' }).click();
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
});
