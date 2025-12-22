import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page.js';
import { CCOPHelpCenterPage } from '../../pages/ccop-help-center.page.js';

test('CCOP | Help Center | Raise, Reply & Resolve Ticket', async ({ page }) => {
  const login = new LoginPage(page);
  const helpCenter = new CCOPHelpCenterPage(page);

  /* ===== LOGIN ===== */
  await login.loginAsClinician();
  await expect(page).toHaveURL(/clinical\/home/);

  /* ===== HELP CENTER ===== */
  await helpCenter.openHelpCenter();

  /* ===== RAISE ===== */
  await helpCenter.raiseTicket({
    subject: 'Any Other Issue',
    message: 'test',
    fileName: 'test-image.png',
  });

  /* ===== REPLY ===== */
  await helpCenter.openLatestTicket();
  await helpCenter.replyToTicket('test');

  /* ===== CLOSE MODAL ===== */
  await helpCenter.closeTicketPopup();

  /* ===== RESOLVE ===== */
  await helpCenter.markAsResolved();

  /* ===== LOGOUT ===== */
  await login.logout();
});