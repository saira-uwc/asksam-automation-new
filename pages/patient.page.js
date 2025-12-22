import path from 'path';

export class PatientPage {
  constructor(page) {
    this.page = page;
  }

  async createNewPatient() {
    // ✅ Short, readable unique id (last 6 digits of timestamp)
    const id = Date.now().toString().slice(-6);

    this.firstName = 'Test';
    this.lastName = `user-${id}`;
    this.email = `testuser-${id}@tmail.com`;

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

    console.log('✅ Created patient:', {
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
    });
  }

  async uploadAndTranscribe() {
    const filePath = path.resolve('uploads/Yamini_Pal_Health_Summary.pdf');

    await this.page.getByRole('button', { name: 'Upload' }).click();
    await this.page.getByRole('button', { name: 'Choose File' }).setInputFiles(filePath);

    await this.page.getByRole('button', { name: 'Transcribe All' }).click();
    await this.page.getByRole('button', { name: 'Send Transcription' }).click();

    console.log('⏳ Waiting for transcription / disclaimer / submit…');

    // ✅ DO NOT wait for "Processing transcription" to disappear
    await Promise.race([
      this.page
        .getByRole('button', { name: /I Understand and Accept/i })
        .waitFor({ timeout: 120000 }),

      this.page
        .getByRole('button', { name: 'Submit' })
        .waitFor({ timeout: 120000 }),
    ]).catch(() => {});

    const disclaimerBtn = this.page.getByRole('button', {
      name: /I Understand and Accept/i,
    });

    if (await disclaimerBtn.isVisible().catch(() => false)) {
      await disclaimerBtn.click();
      console.log('✅ Disclaimer accepted');
    } else {
      console.log('ℹ️ Disclaimer not shown, continuing');
    }
  }

  async submitClinicalNote() {
    // ❌ NO waitForURL — UI doesn’t always navigate
    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.getByRole('button', { name: 'Submit' }).click();

    await this.page
      .getByText(/Your note has been submitted/i)
      .waitFor({ timeout: 60000 });

    console.log('✅ Clinical note submitted');
  }
}