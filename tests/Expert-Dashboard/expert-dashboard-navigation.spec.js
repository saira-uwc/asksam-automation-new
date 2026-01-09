import { test } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { ExpertDashboardPage } from '../../pages/expert-dashboard.page.js';

test('Expert Dashboard | Navigation flow validation', async ({ page }) => {
  const login = new LoginPage(page);
  const dashboard = new ExpertDashboardPage(page);

  await login.loginAsClinician(
    'testing_clinician_aus+clerk_test@tmail.com',
    '424242'
  );

  await dashboard.gotoDashboard();

  await dashboard.openAppointments();
  await dashboard.gotoDashboard();

  await dashboard.openPatients();
  await dashboard.gotoDashboard();

  await dashboard.openChat();
  await dashboard.gotoDashboard();

  await dashboard.openNotifications();
  await dashboard.gotoDashboard();

  await dashboard.openSessionManagement();
  await dashboard.gotoDashboard();

  await login.logout();
});