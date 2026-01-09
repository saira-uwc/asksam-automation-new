import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ExpertAppointmentPage } from '../../pages/expert-appointment.page.js';

test('Expert Dashboard | Create patient & book appointment', async ({ page }) => {
  const login = new LoginPage(page);
  const appointment = new ExpertAppointmentPage(page);

  /* ===== LOGIN ===== */
  await login.loginAsClinician();

  /* ===== GO TO EXPERT DASHBOARD ===== */
  await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
  await expect(page).toHaveURL(/expert\/dashboard/);

  /* ===== APPOINTMENTS FLOW ===== */
  await appointment.openAppointments();

  const patient = await appointment.createPatient();
  console.log('✅ Created patient:', patient);

  // ✅ FIXED LINE
  await appointment.selectExistingPatient(
    `${patient.firstName} ${patient.lastName}`
  );

  await appointment.selectExpert();
  await appointment.bookAppointment();

  /* ===== LOGOUT ===== */
  await login.logout();
});