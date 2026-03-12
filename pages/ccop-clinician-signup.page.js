export class CCOPClinicianSignupPage {
    constructor(page) {
      this.page = page;
    }
  
  /* ================= SIGNUP ================= */
  async signup(user) {
    // Navigate directly to the registration page
    await this.page.goto('https://account.asksam.com.au/register', { waitUntil: 'load' });
  
      await this.page.getByText('Clinician').click();
      await this.page.getByRole('button', { name: "Let's get started" }).click();
  
      await this.page.getByRole('textbox', { name: 'First name' }).fill(user.firstName);
      await this.page.getByRole('textbox', { name: 'Last name' }).fill(user.lastName);
      await this.page.getByRole('textbox', { name: 'Email address' }).fill(user.email);
  
      await this.page.getByRole('button', { name: 'Continue' }).click();
  
      // OTP
      await this.page.getByRole('textbox', { name: 'Enter verification code' }).fill('424242');
  
      // Wait for Clerk to finish auth and redirect
      await this.page.waitForURL(/copilot|clinical|dashboard/, { timeout: 60000 }).catch(() => {});
    }
  
    /* ================= FREE PLAN ================= */
    async activateFreePlan() {
      await this.page.goto(
        'https://copilot.asksam.com.au/clinical/settings?view=Plans%20%26%20Billing',
        { waitUntil: 'load' }
      );

      await this.page.getByRole('button', { name: 'Try for Free' }).waitFor({ state: 'visible', timeout: 30000 });

      const popupPromise = this.page.waitForEvent('popup', { timeout: 60000 });
      await this.page.getByRole('button', { name: 'Try for Free' }).click();

      const popup = await popupPromise;
      await popup.waitForLoadState('load');

      await popup.getByTestId('hosted-payment-submit-button').waitFor({ state: 'visible', timeout: 30000 });
      await popup.getByTestId('hosted-payment-submit-button').click();

      // Wait for payment processing
      await popup.waitForTimeout(5000);

      return popup;
    }
  
    /* ================= TOURS ================= */
    async completeTours(popup) {
      // HOME
      await popup.getByRole('link', { name: 'Home' }).click();
      await popup.waitForLoadState('domcontentloaded');
  
      // HOME TOUR
      await popup.getByRole('button', { name: 'Start tour' }).click();
  
      for (let i = 0; i < 4; i++) {
        const nextBtn = popup.getByRole('button', { name: 'Next →' });
        await nextBtn.waitFor({ state: 'visible', timeout: 10000 });
        await nextBtn.click();
        await popup.waitForTimeout(800);
      }
  
      await popup.getByRole('button', { name: 'Done' }).click();
  
      // HELP CENTER TOUR
      await popup.getByRole('link', { name: 'Help Center' }).click();
      await popup.waitForLoadState('domcontentloaded');
  
      await popup.getByRole('button', { name: 'Next →' }).click();
      await popup.waitForTimeout(500);
      await popup.getByRole('button', { name: 'Next →' }).click();
      await popup.waitForTimeout(500);
      await popup.getByRole('button', { name: 'Done' }).click();
  
      // BACK HOME
      await popup.getByRole('link', { name: 'Home' }).click();
      await popup.waitForLoadState('domcontentloaded');
  
      // Wait for tour overlay to disappear before clicking
      await popup.locator('#clinical-tour-overlay, #clinical-tour-loading-overlay')
        .waitFor({ state: 'hidden', timeout: 30000 }).catch(() => {});

      // FIRST CLINICAL
      await popup.getByRole('button', { name: 'Create Your First Clinical' }).click({ force: true });
      await popup.getByRole('button', { name: 'Done' }).click();
      await popup.getByRole('button', { name: 'close' }).click();
    }
  
    /* ================= LOGOUT ================= */
    async logout(popup) {
      await popup.getByRole('button', { name: 'Open user menu' }).click();
      await popup.getByRole('menuitem', { name: 'Sign out' }).click();
    }
  }