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

    await this.page.getByRole('button', { name: 'Upload' }).waitFor({ state: 'visible', timeout: 60000 });
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

  async verifyClinicalTabsHaveData() {
    const tabs = ['Clinical Advice', 'Clinical Examination', 'Follow-Up Note', 'Case History'];
    const maxWait = 90000;
    const startTime = Date.now();

    let dataFound = false;
    while (Date.now() - startTime < maxWait) {
      const editables = await this.page.locator('[contenteditable="true"]').allTextContents();
      const hasContent = editables.some(t => t.trim().length > 10 && !t.includes('No information'));
      if (hasContent) {
        dataFound = true;
        console.log('✅ Clinical Advice tab has transcription data');
        break;
      }
      await this.page.waitForTimeout(3000);
    }

    if (!dataFound) {
      throw new Error('Clinical tabs have no data after 90 seconds — transcription may have failed');
    }

    for (const tabName of tabs) {
      const tab = this.page.getByRole('tab', { name: tabName });
      if (await tab.isVisible().catch(() => false)) {
        await tab.click();
        await this.page.waitForTimeout(1500);

        const editables = await this.page.locator('[contenteditable="true"]').allTextContents();
        const content = editables.filter(t => t.trim().length > 0);
        console.log(`📋 ${tabName}: ${content.length} fields with data`);
      }
    }

    const firstTab = this.page.getByRole('tab', { name: 'Clinical Advice' });
    if (await firstTab.isVisible().catch(() => false)) {
      await firstTab.click();
      await this.page.waitForTimeout(1000);
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