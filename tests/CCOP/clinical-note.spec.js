import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { DashboardPage } from '../../pages/dashboard.page';
import path from 'path';

test('Create clinical note with document upload & transcription', async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = new DashboardPage(page);

  const filePath = path.resolve('uploads/Yamini_Pal_Health_Summary.pdf');

  await login.loginAsClinician();                 // login + OTP
  await page.waitForURL('**/clinical/home');      // stable wait

  await dashboard.clickCreateClinicalNote();
  await dashboard.selectPatientWithFallback();

  await dashboard.openUploadModal();
  await dashboard.uploadFile(filePath);

  await dashboard.transcribeAndSend();
  await dashboard.acceptDisclaimers();
  await dashboard.saveAndSubmit();
  await dashboard.logout();
});