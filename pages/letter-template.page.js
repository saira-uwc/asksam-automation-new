import { safeClick, optionalClick } from "../helpers/wait.js";

export class LetterTemplatePage {
  constructor(page) {
    this.page = page;
  }

  /* ===========================
     NAVIGATE TO PATIENT NOTE
  ============================ */
  async openExistingPatientNote() {
    await this.page.goto("https://copilot.asksam.com.au/clinical/home");
    await this.page.waitForURL("**/clinical/home");

    // Wait for page to fully load — wait until at least one patient card button appears
    // Try each tab: In Progress (Edit Draft) → Completed (View Clinical Note) → All
    const editDraftBtn = this.page.getByRole("button", { name: "Edit Draft" }).first();
    const viewNoteBtn = this.page.getByRole("button", { name: "View Clinical Note" }).first();

    // Strategy: wait for skeleton loaders to clear, then check for buttons across tabs
    const waitForSkeletonsClear = async () => {
      const skeleton = this.page.locator(".MuiSkeleton-root").first();
      if (await skeleton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await skeleton.waitFor({ state: "detached", timeout: 30000 }).catch(() => {});
      }
    };

    await waitForSkeletonsClear();

    // Tab 1: In Progress (default) — look for "Edit Draft"
    if (await editDraftBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
      await editDraftBtn.click();
      console.log("✅ Clicked Edit Draft (In Progress tab)");
    } else {
      // Tab 2: Completed — look for "View Clinical Note"
      const completedTab = this.page.getByRole("button", { name: "Completed" });
      await completedTab.click();
      console.log("✅ Switched to Completed tab");
      await waitForSkeletonsClear();

      if (await viewNoteBtn.isVisible({ timeout: 15000 }).catch(() => false)) {
        await viewNoteBtn.click();
        console.log("✅ Clicked View Clinical Note (Completed tab)");
      } else {
        // Tab 3: All — look for either button
        const allTab = this.page.getByRole("button", { name: "All" });
        await allTab.click();
        console.log("✅ Switched to All tab");
        await waitForSkeletonsClear();

        const anyBtn = this.page
          .getByRole("button", { name: /Edit Draft|View Clinical Note/i })
          .first();
        await anyBtn.waitFor({ state: "visible", timeout: 30000 });
        await anyBtn.click();
        console.log("✅ Clicked patient note button (All tab)");
      }
    }

    // Wait for the note detail page to load
    await this.page
      .getByRole("button", { name: /Actions/i })
      .waitFor({ state: "visible", timeout: 30000 });
    console.log("✅ Note page loaded — Actions button visible");
  }

  /* ===========================
     OPEN LETTER TEMPLATES
  ============================ */
  async openLetterTemplates() {
    // Click the "Actions" dropdown button
    await this.page.getByRole("button", { name: /Actions/i }).click();
    await this.page.waitForTimeout(1000);

    // Click "Letter Templates" from the dropdown
    const letterTemplatesOption = this.page.getByRole("menuitem", {
      name: /Letter Templates/i,
    });

    if (await letterTemplatesOption.isVisible({ timeout: 5000 }).catch(() => false)) {
      await letterTemplatesOption.click();
    } else {
      await safeClick(
        this.page.getByText(/Letter Templates/i).first(),
        10000
      );
    }

    // Wait for the "Select Letter Type" heading to appear
    await this.page
      .getByRole("heading", { name: "Select Letter Type" })
      .waitFor({ state: "visible", timeout: 15000 });
    console.log("✅ Letter Templates page loaded");
  }

  /* ===========================
     SELECT LETTER TYPE
  ============================ */
  async selectLetterType(letterType = "Referral Letter") {
    // Click the "Select letter type" dropdown
    const dropdown = this.page.getByText("Select letter type", { exact: true });
    await dropdown.waitFor({ state: "visible", timeout: 10000 });
    await dropdown.click();
    await this.page.waitForTimeout(1000);

    // Select the specified letter type from the dropdown options
    const option = this.page.getByText(letterType, { exact: true });
    await option.waitFor({ state: "visible", timeout: 10000 });
    await option.click();
    console.log(`✅ Selected letter type: ${letterType}`);

    // After selecting, the template editor + preview loads automatically
    // Wait for the "View Letter Template" page and "Letter Preview" to appear
    await this.page
      .getByText("Letter Preview")
      .waitFor({ state: "visible", timeout: 20000 });
    console.log("✅ Template loaded — Letter Preview visible");
  }

  /* ===========================
     VERIFY TEMPLATE LOADED
  ============================ */
  async verifyTemplateContent() {
    // Verify Template Name field is visible and has value
    const templateNameInput = this.page.getByLabel(/Template Name/i);
    if (await templateNameInput.isVisible().catch(() => false)) {
      const templateName = await templateNameInput.inputValue();
      console.log(`✅ Template Name: ${templateName}`);
    }

    // Verify Letter Body editor is visible
    const letterBody = this.page.getByText("Letter Body");
    if (await letterBody.isVisible().catch(() => false)) {
      console.log("✅ Letter Body editor is visible");
    }

    // Verify Available Fields section is visible
    const availableFields = this.page.getByText("Available Fields");
    if (await availableFields.isVisible().catch(() => false)) {
      console.log("✅ Available Fields section is visible");
    }

    // Verify Letter Preview section is visible with content
    const letterPreview = this.page.getByText("Letter Preview");
    if (await letterPreview.isVisible().catch(() => false)) {
      console.log("✅ Letter Preview section is visible");
    }

    // Verify Download Template button is present
    const downloadBtn = this.page.getByRole("button", { name: /Download Template/i });
    await downloadBtn.waitFor({ state: "visible", timeout: 10000 });
    console.log("✅ Download Template button is visible");

    // Verify Update Template button is present
    const updateBtn = this.page.getByRole("button", { name: /Update Template/i });
    await updateBtn.waitFor({ state: "visible", timeout: 10000 });
    console.log("✅ Update Template button is visible");
  }

  /* ===========================
     DOWNLOAD TEMPLATE
  ============================ */
  async downloadTemplate() {
    const downloadBtn = this.page.getByRole("button", { name: /Download Template/i });
    await downloadBtn.waitFor({ state: "visible", timeout: 10000 });
    await downloadBtn.click();
    console.log("✅ Clicked Download Template");
    await this.page.waitForTimeout(3000);
  }

  /* ===========================
     CREATE NEW TEMPLATE
  ============================ */
  async clickCreateTemplate() {
    const createBtn = this.page.getByRole("button", { name: /Create Template/i });
    await createBtn.waitFor({ state: "visible", timeout: 10000 });
    await createBtn.click();
    console.log("✅ Clicked + Create Template");

    // Wait for Template Name input to appear (confirms dialog loaded)
    await this.page
      .getByLabel(/Template Name/i)
      .waitFor({ state: "visible", timeout: 15000 });
    console.log("✅ Create Letter Template form loaded");
  }

  async fillNewTemplateForm(templateName) {
    // Fill Template Name
    const nameInput = this.page.getByLabel(/Template Name/i);
    await nameInput.click();
    await nameInput.fill(templateName);
    console.log(`✅ Filled Template Name: ${templateName}`);

    // Click the rich text editor (DraftJS contenteditable area)
    const editorTextbox = this.page.locator('[contenteditable="true"]').last();
    await editorTextbox.waitFor({ state: "visible", timeout: 10000 });
    await editorTextbox.click({ force: true });
    await this.page.waitForTimeout(500);
    await this.page.keyboard.type(
      "Dear recipient, I am writing to refer the patient for evaluation and treatment. Regards, Test Clinician",
      { delay: 30 }
    );
    console.log("✅ Filled Letter Body");

    await this.page.waitForTimeout(2000);
  }

  async selectClinicalNoteFields() {
    // Step 1: Ensure "Clinical Content" section is expanded
    // The section uses an h6 + IconButton with ExpandLess/ExpandMore icons
    const clinicalContentText = this.page.locator('h6').filter({ hasText: 'Clinical Content' });
    await clinicalContentText.waitFor({ state: "visible", timeout: 10000 });

    // Check if collapsed (ExpandMoreIcon means collapsed, ExpandLessIcon means expanded)
    const contentExpandBtn = clinicalContentText.locator('..').locator('button');
    const isContentCollapsed = await contentExpandBtn
      .locator('[data-testid="ExpandMoreIcon"]')
      .isVisible({ timeout: 2000 })
      .catch(() => false);

    if (isContentCollapsed) {
      await contentExpandBtn.click();
      console.log("✅ Expanded Clinical Content section");
      await this.page.waitForTimeout(2000);
    } else {
      console.log("✅ Clinical Content section already expanded");
    }

    // Step 2: Expand "Clinical Notes" — click the icon button with title="Configure field options"
    const clinicalNotesText = this.page.locator('h6').filter({ hasText: 'Clinical Notes' });
    await clinicalNotesText.waitFor({ state: "visible", timeout: 10000 });

    const notesExpandBtn = this.page.locator('button[title="Configure field options"]');
    const isNotesVisible = await notesExpandBtn.isVisible({ timeout: 3000 }).catch(() => false);

    if (isNotesVisible) {
      await notesExpandBtn.click();
      console.log("✅ Expanded Clinical Notes dropdown");
      await this.page.waitForTimeout(2000);
    }

    // Step 3: Wait for field list to load
    await this.page
      .getByText("Select Clinical Note Fields:")
      .waitFor({ state: "visible", timeout: 10000 });

    // Step 4: Click "+" next to "Chief Complaint (CC)"
    const ccAddBtn = this.page
      .locator('p')
      .filter({ hasText: 'Chief Complaint (CC)' })
      .locator('..')
      .locator('button[title="Add to selection"]');
    await ccAddBtn.waitFor({ state: "visible", timeout: 5000 });
    await ccAddBtn.click();
    console.log("✅ Added field: Chief Complaint (CC)");
    await this.page.waitForTimeout(1000);

    // Step 5: Click "+" next to "History of Present Illness (HPI)"
    const hpiAddBtn = this.page
      .locator('p')
      .filter({ hasText: 'History of Present Illness (HPI)' })
      .locator('..')
      .locator('button[title="Add to selection"]');
    await hpiAddBtn.waitFor({ state: "visible", timeout: 5000 });
    await hpiAddBtn.click();
    console.log("✅ Added field: History of Present Illness (HPI)");
    await this.page.waitForTimeout(1000);
  }

  async saveNewTemplate() {
    const saveBtn = this.page.getByRole("button", { name: /Save Template/i });
    await saveBtn.waitFor({ state: "visible", timeout: 10000 });
    await saveBtn.click();
    console.log("✅ Clicked Save Template");
    await this.page.waitForTimeout(5000);
  }

  async verifyTemplateCreated(templateName) {
    // After saving, check for success indicators
    const successIndicators = [
      this.page.getByText(/success/i),
      this.page.getByText(/created/i),
      this.page.getByText(/saved/i),
      this.page.getByRole("heading", { name: "Select Letter Type" }),
    ];

    for (const indicator of successIndicators) {
      if (await indicator.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log("✅ Template save confirmed");
        return true;
      }
    }

    // Fallback: verify by opening dropdown and finding the new template
    const dropdown = this.page.getByText("Select letter type", { exact: true });
    if (await dropdown.isVisible().catch(() => false)) {
      await dropdown.click();
      await this.page.waitForTimeout(1000);
      const newTemplate = this.page.getByText(templateName, { exact: true });
      if (await newTemplate.isVisible({ timeout: 5000 }).catch(() => false)) {
        console.log(`✅ New template "${templateName}" found in dropdown`);
        return true;
      }
    }

    console.log("⚠ Could not confirm template creation — check manually");
    return false;
  }
}
