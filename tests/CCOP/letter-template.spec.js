import { test } from "@playwright/test";
import { LetterTemplatePage } from "../../pages/letter-template.page";
import { LoginPage } from "../../pages/login.page";

// Use a separate login for letter-template tests
test.use({ storageState: { cookies: [], origins: [] } });

const LETTER_TEMPLATE_EMAIL = "ccop22.test+clerk_test@tmail.com";

test.beforeEach(async ({ page }) => {
  const login = new LoginPage(page);
  await login.loginAsClinician(LETTER_TEMPLATE_EMAIL);
});

test("Open letter template from Actions dropdown, select type and verify preview", async ({
  page,
}) => {
  const letterTemplate = new LetterTemplatePage(page);

  /* ===== STEP 1: Navigate to an existing patient note ===== */
  await letterTemplate.openExistingPatientNote();

  /* ===== STEP 2: Open Actions → Letter Templates ===== */
  await letterTemplate.openLetterTemplates();

  /* ===== STEP 3: Select a letter type from dropdown ===== */
  await letterTemplate.selectLetterType("Referral Letter");

  /* ===== STEP 4: Verify template content and preview ===== */
  await letterTemplate.verifyTemplateContent();

  /* ===== STEP 5: Download the template ===== */
  await letterTemplate.downloadTemplate();
});

test("Create a new letter template from Actions dropdown", async ({ page }) => {
  const letterTemplate = new LetterTemplatePage(page);
  const templateName = `Test Template ${Date.now().toString().slice(-6)}`;

  /* ===== STEP 1: Navigate to an existing patient note ===== */
  await letterTemplate.openExistingPatientNote();

  /* ===== STEP 2: Open Actions → Letter Templates ===== */
  await letterTemplate.openLetterTemplates();

  /* ===== STEP 3: Click + Create Template ===== */
  await letterTemplate.clickCreateTemplate();

  /* ===== STEP 4: Fill new template form ===== */
  await letterTemplate.fillNewTemplateForm(templateName);

  /* ===== STEP 5: Select variables from Clinical Notes dropdown ===== */
  await letterTemplate.selectClinicalNoteFields();

  /* ===== STEP 6: Save the new template ===== */
  await letterTemplate.saveNewTemplate();

  /* ===== STEP 7: Verify template was created ===== */
  await letterTemplate.verifyTemplateCreated(templateName);
});
