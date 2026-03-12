export class DashboardPage {
  constructor(page) {
    this.page = page;
  }

  /* ===========================
     CREATE NOTE
  ============================ */
  async clickCreateClinicalNote() {
    await this.page
      .getByRole('button', { name: 'Create Clinical Note' })
      .waitFor({ state: 'visible', timeout: 20000 });

    await this.page
      .getByRole('button', { name: 'Create Clinical Note' })
      .click();
  }

  /* ===========================
     PATIENT SELECTION 
  ============================ */
  async selectPatientWithFallback() {
    const patients = [
      'Yamini Singh 191',
      'Ganesh Test 123',
      'Yamini Singh 185'
    ];

    // modal container (important for scrolling)
    const modal = this.page.getByRole('dialog');

    // search input (CORRECT placeholder)
    const searchBox = modal.getByPlaceholder('Search by name or email...');

    await modal.waitFor({ state: 'visible', timeout: 20000 });

    for (const name of patients) {
      console.log(`🔍 Searching patient: ${name}`);

      /* ---------- STEP 1: try direct click (already visible) ---------- */
      const directResult = modal
        .getByText(name, { exact: true })
        .first();

      if (await directResult.isVisible().catch(() => false)) {
        await directResult.click();
        console.log(`✅ Selected patient (direct): ${name}`);
        return;
      }

      /* ---------- STEP 2: search ---------- */
      await searchBox.click();
      await searchBox.fill('');
      await searchBox.fill(name);

      // wait for results to refresh
      await this.page.waitForTimeout(1500);

      /* ---------- STEP 3: scroll results ---------- */
      for (let i = 0; i < 4; i++) {
        const result = modal
          .getByText(name, { exact: true })
          .first();

        if (await result.isVisible().catch(() => false)) {
          await result.click();
          console.log(`✅ Selected patient (search): ${name}`);
          return;
        }

        // scroll inside modal, not page
        await modal.evaluate(el => (el.scrollTop += 300));
        await this.page.waitForTimeout(800);
      }
    }

    throw new Error('❌ No expected patient found after search & scroll');
  }

  /* ===========================
     UPLOAD
  ============================ */
  async openUploadModal() {
    const uploadBtn = this.page.getByRole('button', { name: 'Upload' });

    await uploadBtn.waitFor({ state: 'visible', timeout: 30000 });
    await uploadBtn.click();
  }

  async uploadFile(filePath) {
    const chooseFile = this.page.getByRole('button', { name: 'Choose File' });

    await chooseFile.waitFor({ state: 'attached', timeout: 15000 });
    await chooseFile.setInputFiles(filePath);
  }

  /* ===========================
     TRANSCRIPTION
  ============================ */
  async transcribeAndSend() {
    await this.page
      .getByRole('button', { name: 'Transcribe All' })
      .waitFor({ state: 'visible', timeout: 20000 });

    await this.page.getByRole('button', { name: 'Transcribe All' }).click();

    // Wait for transcription to complete — CI can be slow
    await this.page
      .getByRole('button', { name: 'Send Transcription' })
      .waitFor({ state: 'visible', timeout: 120000 });

    await this.page.getByRole('button', { name: 'Send Transcription' }).click();
  }

/* ===========================
   DISCLAIMERS
============================ */
async acceptDisclaimers() {
  const disclaimerBtn = this.page.getByRole('button', {
    name: /I Understand And Accept/i
  });

  // First disclaimer
  await disclaimerBtn.waitFor({ state: 'visible', timeout: 30000 });
  await disclaimerBtn.click();

  // Small wait for next modal transition
  await this.page.waitForTimeout(2000);

  // Second disclaimer
  await disclaimerBtn.waitFor({ state: 'visible', timeout: 30000 });
  await disclaimerBtn.click();

  // Ensure modal is gone before Save
  await disclaimerBtn.first().waitFor({ state: 'detached', timeout: 30000 });
}

  /* ===========================
     SAVE & SUBMIT
  ============================ */
  async saveAndSubmit() {
    await this.page.getByRole('button', { name: 'Save' }).click();
    await this.page.waitForTimeout(3000);

    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForTimeout(3000);

    await this.page.getByRole('button', { name: 'Submit' }).click();
    await this.page.waitForTimeout(3000);

  }

  /* ===========================
     LOGOUT
  ============================ */
  async logout() {
    await this.page.getByRole('button', { name: 'Open user menu' }).click();
    await this.page.getByRole('menuitem', { name: 'Sign out' }).click();
  }
}