export class LoginPage {
  constructor(page) {
    this.page = page;

    this.emailInput = page.getByRole('textbox', { name: 'Email address' });
    this.otpInput = page.getByRole('textbox', { name: 'Enter verification code' });
    this.continueBtn = page.getByRole('button', { name: 'Continue' });
  }

  async loginAsClinician(email = 'testing_clinician_aus+clerk_test@tmail.com') {
    // Navigate directly to the registration/login page
    await this.page.goto('https://account.asksam.com.au/register');

    await this.page.getByRole('button', { name: 'Log in here' }).click();
    await this.page.getByText('Clinician').click();
    await this.continueBtn.click();

    await this.emailInput.fill(email);
    await this.continueBtn.click();

    // OTP – always same as per your requirement
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