import path from 'path';

export class PatientPage {
  constructor(page) {
    this.page = page;
  }

  async createNewPatient() {
    // ✅ short unique id (last 6 digits of timestamp)
    const uid = Date.now().toString().slice(-6);

    this.firstName = 'Test';
    this.lastName = `user-${uid}`;
    this.email = `testuser-${uid}@tmail.com`;

    console.log('✅ Created patient:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    });

    await this.page.getByRole('button', { name: 'Create Clinical Note' }).click();
    await this.page.getByRole('button', { name: 'Create New Patient Profile' }).click();

    await this.page.getByRole('textbox', { name: 'First Name' }).fill(this.firstName);
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(this.lastName);
    await this.page.getByRole('textbox', { name: 'Email Address...' }).fill(this.email);

    await this.page.locator('#client-sex').click();
    await this.page.getByRole('option', { name: 'Female' }).click();

    await this.page.getByRole('button', {
      name: /Confirm and create clinical/i,
    }).click();

    // backend + hydration buffer
    await this.page.waitForLoadState('networkidle');
    await this.page.waitForTimeout(3000);
  }

  async uploadAndTranscribe() {
    const filePath = path.resolve('uploads/Yamini_Pal_Health_Summary.pdf');

    await this.page.getByRole('button', { name: 'Upload' }).click();
    await this.page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

    await this.page.getByRole('button', { name: 'Transcribe All' }).click();
    await this.page.getByRole('button', { name: 'Send Transcription' }).click();

    console.log('⏳ Waiting for transcription / consent…');

    // ✅ wait for processing text to disappear (NO infinite loops)
    const processing = this.page.getByText(/Processing transcription/i);
    if (await processing.isVisible().catch(() => false)) {
      await processing.waitFor({ state: 'hidden', timeout: 180000 });
    }

    // ✅ disclaimer / consent (this is what you missed earlier)
    const acceptBtn = this.page.getByRole('button', {
      name: /I Understand And Accept/i,
    });

    if (await acceptBtn.isVisible().catch(() => false)) {
      await acceptBtn.click();
    } else {
      console.log('ℹ️ Consent not shown, continuing');
    }
  }

  async submitClinicalNote() {
    // ✅ Wait until Submit button becomes enabled
    const submitBtn = this.page.getByRole('button', { name: 'Submit' });
  
    await submitBtn.waitFor({ state: 'visible', timeout: 60000 });
    await expect(submitBtn).toBeEnabled({ timeout: 60000 });
  
    // First submit
    await submitBtn.click();
  
    // Second confirm submit (modal)
    await submitBtn.waitFor({ state: 'visible', timeout: 30000 });
    await submitBtn.click();
  
    // ✅ Wait for success toast/message
    await this.page.getByText(/Your note has been submitted/i).waitFor({
      timeout: 30000,
    });
  
    console.log('✅ Clinical note submitted successfully');
  }
}