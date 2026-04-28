export class LoginPage {
  constructor(page) {
    this.page = page;

    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.otpInput = page.getByRole('textbox', { name: 'Enter verification code' });
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
  }

  async loginAsClinician(email = 'testing_clinician_aus+clerk_test@tmail.com') {
    // Navigate to the registration/login page and wait for it to settle.
    // Without networkidle the immediate "Log in here" click can land on a
    // not-yet-rendered button, leaving the flow stuck before the email step.
    await this.page.goto('https://account.asksam.com.au/register', {
      waitUntil: 'domcontentloaded',
      timeout: 60000,
    });
    await this.page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {});

    // Each step waits for its target to be visible before clicking — eliminates
    // the race where one click-to-next-render sequence stalls and the following
    // locator times out at 30s with no diagnostic.
    const loginHere = this.page.getByRole('button', { name: 'Log in here' });
    await loginHere.waitFor({ state: 'visible', timeout: 30000 });
    await loginHere.click();

    const clinicianOption = this.page.getByText('Clinician', { exact: true }).first();
    await clinicianOption.waitFor({ state: 'visible', timeout: 30000 });
    await clinicianOption.click();

    await this.continueBtn.first().waitFor({ state: 'visible', timeout: 30000 });
    await this.continueBtn.first().click();

    await this.emailInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.emailInput.fill(email);

    await this.continueBtn.first().waitFor({ state: 'visible', timeout: 15000 });
    await this.continueBtn.first().click();

    // OTP – always same as per your requirement (Clerk test mode)
    await this.otpInput.waitFor({ state: 'visible', timeout: 30000 });
    await this.otpInput.fill('424242');

    // Wait for backend + redirect (CI auth can be slow/throttled)
    await this.page.waitForURL('**/clinical/home', { timeout: 90000 }).catch(async () => {
      // Fallback: if redirect didn't happen, navigate manually
      await this.page.goto('https://copilot.asksam.com.au/clinical/home', { waitUntil: 'load', timeout: 30000 });
    });
  }
  async logout() {
    await this.page.getByRole('button', { name: 'Open user menu' }).click();
    await this.page.getByRole('menuitem', { name: 'Sign out' }).click();
    await this.page.waitForURL(/sign-in/, { timeout: 15000 });
  }
}