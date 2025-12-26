import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ExpertAppointmentPage } from '../../pages/expert-appointment.page.js';

test.describe('Expert Dashboard | Create Patient & View Profile', () => {
  test('create unique patient, search and view profile', async ({ page }) => {
    const login = new LoginPage(page);
    const patientPage = new ExpertAppointmentPage(page);

    /* ===== LOGIN ===== */
    await login.loginAsClinician();

    /* ===== DASHBOARD ===== */
    await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
    await expect(page).toHaveURL(/expert\/dashboard/);

    /* ===== OPEN PATIENTS ===== */
    await patientPage.openPatients();

    /* ===== CREATE PATIENT ===== */
    const patient = await patientPage.createPatientFromPatientsModule();

    /* ===== WAIT (backend sync) ===== */
    await page.waitForTimeout(3000);

    /* ===== SEARCH & VIEW ===== */
    await patientPage.searchAndOpenPatient(patient.email);

    /* ===== LOGOUT ===== */
    await login.logout();
  });
});