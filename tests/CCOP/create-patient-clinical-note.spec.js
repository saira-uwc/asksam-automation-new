import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { PatientPage } from '../../pages/patient.page.js';

test.describe('CCOP | Create new patient & clinical note (dynamic)', () => {
  test('Create patient + upload + submit', async ({ page }) => {
    const login = new LoginPage(page);
    const patient = new PatientPage(page);

    /* ===== LOGIN (STABLE, COMMON) ===== */
    await login.loginAsClinician();

    /* ===== CREATE PATIENT ===== */
    await patient.createNewPatient();

    /* ===== UPLOAD + TRANSCRIBE ===== */
    await patient.uploadAndTranscribe();

    /* ===== SUBMIT NOTE ===== */
    await patient.submitClinicalNote();

    /* ===== LOGOUT ===== */
    await login.logout();
  });
});