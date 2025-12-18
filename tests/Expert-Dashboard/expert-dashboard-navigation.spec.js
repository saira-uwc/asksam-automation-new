import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ExpertDashboardPage } from '../../pages/expert-dashboard.page';

test('Expert Dashboard | Navigation flow validation', async ({ page }) => {

  const login = new LoginPage(page);
  const dashboard = new ExpertDashboardPage(page);

  /* ===== LOGIN ===== */
  await login.loginAsClinician(
    'testing_clinician_aus+clerk_test@tmail.com',
    '424242'
  );

  /* ===== DASHBOARD ===== */
  await dashboard.gotoDashboard();

  await dashboard.openDashboard();
  await dashboard.openUpcomingAppointments();
  await dashboard.openNotifications();
  await dashboard.openInbox();
  await dashboard.openCalendar();

  await dashboard.viewAllAppointments();
  await dashboard.openDashboard();

  await dashboard.viewAllPatients();
  await dashboard.openDashboard();

  await dashboard.openAppointmentsFromMenu();
  await dashboard.openChat();
  await dashboard.openNotificationsFromMenu();

  /* ===== LOGOUT ===== */
  await login.logout();
});