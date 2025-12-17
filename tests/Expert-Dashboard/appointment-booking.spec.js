import { test } from '@playwright/test';
import { AppointmentPage } from '../../pages/appointment.page';

test('Expert Dashboard | Appointment booking (dynamic slots)', async ({ page }) => {
  // ===== LOGIN =====
  await page.goto('https://dashboard.asksam.com.au/sign-in');

  await page.getByRole('textbox', { name: 'Email address' }).fill(
    'testing_clinician_aus+clerk_test@tmail.com'
  );
  await page.getByRole('button', { name: 'Continue' }).click();

  await page.getByRole('textbox', { name: 'Enter verification code' }).fill(
    '424242'
  );

  // wait after OTP (VERY IMPORTANT)
  await page.waitForTimeout(6000);

  // ===== DASHBOARD =====
  await page.goto('https://dashboard.asksam.com.au/expert/dashboard');
  await page.waitForLoadState('networkidle');

  await page.getByRole('link', { name: 'Appointments', exact: true }).click();
  await page.getByRole('button', { name: 'Book new appointment' }).click();

  const appointment = new AppointmentPage(page);

  await appointment.selectUser('testsaira');
  await appointment.selectExpert('Anthony');
  await appointment.selectConsult('Natural Medicine', 'Follow up Consult');

  await appointment.findFirstAvailableSlot(30);
  await appointment.selectPayment('Complimentary');
  await appointment.book();

  // ===== LOGOUT =====
  await page.getByRole('button', { name: 'Open user menu' }).click();
  await page.getByRole('menuitem', { name: 'Sign out' }).click();
});