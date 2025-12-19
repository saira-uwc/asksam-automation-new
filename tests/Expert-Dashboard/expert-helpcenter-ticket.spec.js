import { test, expect } from '@playwright/test';
import { HelpCenterPage } from '../../pages/help-center.page.js';

test(
  'Expert Dashboard | Help Center raise & reply ticket',
  async ({ page }) => {

    /* ===== LOGIN (SAME LEVEL AS APPOINTMENT FLOW) ===== */
    await page.goto('https://dashboard.asksam.com.au/sign-in');

    await page.getByRole('textbox', { name: 'Email address' }).fill(
      'testing_clinician_aus+clerk_test@tmail.com'
    );
    await page.getByRole('button', { name: 'Continue' }).click();

    await page.getByRole('textbox', { name: 'Enter verification code' })
      .fill('424242');

    // 🔑 CRITICAL: DO NOTHING – let Clerk finish internally
    await page.waitForTimeout(6000);

    /* ===== NOW SAFE TO NAVIGATE ===== */
    await page.goto('https://dashboard.asksam.com.au/expert/dashboard');

    // Wait for dashboard UI (NOT URL / networkidle)
    await page.waitForSelector('body', { timeout: 60000 });
    await page.waitForTimeout(2000);

    // Poll until sidebar is ready
    const helpCenterLink = page.getByRole('link', { name: 'Help Center' });
    for (let i = 0; i < 20; i++) {
      if (await helpCenterLink.isVisible()) break;
      await page.waitForTimeout(1000);
    }

    const helpCenter = new HelpCenterPage(page);

    /* ===== HELP CENTER FLOW ===== */
    await helpCenter.openHelpCenter();

    await helpCenter.raiseTicket({
      subject: 'Any Other Issue',
      message: 'test issue',
      fileName: 'test-image.png',
    });

    await helpCenter.openLatestTicket();
    await helpCenter.replyToTicket('test');
    // / * ✅ CLOSE TICKET POPUP (MANDATORY) */
    await helpCenter.closeTicketPopup();
    /* ===== LOGOUT ===== */
    await page.getByRole('button', { name: 'Open user menu' }).click();
    await page.getByRole('menuitem', { name: 'Sign out' }).click();
  }
);