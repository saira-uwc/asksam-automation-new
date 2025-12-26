import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ExpertAppointmentPage } from '../../pages/expert-appointment.page.js';

test.describe('Expert Dashboard | Create & Reschedule Appointment', () => {
  test('create appointment with existing patient and reschedule', async ({ page }) => {
    const login = new LoginPage(page);
    const appointment = new ExpertAppointmentPage(page);

    /* ===== LOGIN (REUSE WORKING CCOP LOGIN) ===== */
    await login.loginAsClinician();

    /* ===== GO TO EXPERT DASHBOARD ===== */
    await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
    await expect(page).toHaveURL(/expert\/dashboard/);

    /* ===== OPEN APPOINTMENTS + BOOK FLOW ===== */
    await appointment.openAppointments();

    /* ===== SELECT EXISTING PATIENT ===== */
    const existingPatient = 'testsaira';
    await appointment.selectExistingPatient(existingPatient);

    /* ===== SELECT EXPERT & SERVICE ===== */
    await appointment.selectExpert();

    /* ===== BOOK APPOINTMENT (DYNAMIC SLOTS) ===== */
    await appointment.bookAppointment();

    /* ===== SEARCH CREATED APPOINTMENT ===== */
    await appointment.searchAppointment(existingPatient);

    /* ===== OPEN FIRST APPOINTMENT ===== */
    await appointment.openFirstAppointment();
    await appointment.openReschedule();

    /* ===== RESCHEDULE (DYNAMIC DATE + SLOT) ===== */
    await appointment.rescheduleAppointment();

    /* ===== LOGOUT ===== */
    await login.logout();
  });
});