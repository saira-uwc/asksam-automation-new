import { expect } from '@playwright/test';

export class ExpertAppointmentPage {
  constructor(page) {
    this.page = page;
  }

  /* ===============================
     OPEN APPOINTMENTS
  =============================== */
  async openAppointments() {
    await this.page.getByRole('link', { name: 'Appointments', exact: true }).click();
    await this.page.waitForURL(/expert\/appointments/, { timeout: 30000 });
    await this.page.getByRole('button', { name: 'Book new appointment' }).click();
  }

  /* ===============================
     CREATE NEW PATIENT (KEEP – USED BY OTHER TESTS)
  =============================== */
  async createPatient() {
    const uniq = Math.floor(100000 + Math.random() * 900000);

    const patient = {
      firstName: 'test',
      lastName: `user-${uniq}`,
      email: `testuser${uniq}@tmail.com`,
    };

    await this.page.getByRole('button').filter({ hasText: /^$/ }).nth(1).click();

    await this.page.getByRole('textbox', { name: 'First Name' }).waitFor({ timeout: 20000 });

    await this.page.getByRole('textbox', { name: 'First Name' }).fill(patient.firstName);
    await this.page.getByRole('textbox', { name: 'Last Name' }).fill(patient.lastName);
    await this.page.getByRole('textbox', { name: 'Email' }).fill(patient.email);

    await this.page.getByRole('combobox', { name: 'Gender' }).click();
    await this.page.getByRole('option', { name: 'Male', exact: true }).click();

    await this.page.getByRole('textbox', { name: 'Date of Birth' }).fill('01/01/1995');
    await this.page.getByRole('button', { name: 'Create Patient' }).click();

    // Wait for the create patient modal to close
    await this.page.getByRole('textbox', { name: 'First Name' }).waitFor({ state: 'hidden', timeout: 30000 });

    return patient;
  }

  /* ===============================
     SELECT EXISTING PATIENT (NEW)
  =============================== */
  async selectExistingPatient(patientName) {
    const searchBox = this.page.getByRole('combobox', { name: 'Search User' });
    await searchBox.waitFor({ state: 'visible', timeout: 30000 });

    const listbox = this.page.locator('[role="listbox"]');

    // Retry up to 3 times — MUI autocomplete can be flaky in headless
    for (let attempt = 1; attempt <= 3; attempt++) {
      await searchBox.click();
      await searchBox.clear();
      await this.page.waitForTimeout(500);

      // Type with keystroke events for MUI autocomplete API trigger
      await searchBox.pressSequentially(patientName, { delay: 150 });

      // Wait for debounce + API response
      await this.page.waitForTimeout(2000);

      // Check if listbox appeared with actual results (not "No patients found")
      if (await listbox.isVisible().catch(() => false)) {
        const patientOption = listbox.getByText(patientName, { exact: false });
        if (await patientOption.isVisible().catch(() => false)) {
          await patientOption.click();
          return;
        }
      }

      // Retry: clear, blur, refocus
      await searchBox.clear();
      await searchBox.blur();
      await this.page.waitForTimeout(1000);
    }

    // Final attempt: use fill() + dispatch input event
    await searchBox.click();
    await searchBox.fill(patientName);
    await searchBox.dispatchEvent('input');
    await this.page.waitForTimeout(2000);

    await listbox.waitFor({ state: 'visible', timeout: 30000 });
    const patientOption = listbox.getByText(patientName, { exact: false });
    await patientOption.waitFor({ state: 'visible', timeout: 30000 });
    await patientOption.click();
  }

  /* ===============================
     SELECT EXPERT
  =============================== */
  async selectExpert() {
    const modal = this.page.locator('[role="presentation"]').filter({
      has: this.page.getByText('Book Appointment'),
    });
  
    await modal.waitFor({ state: 'visible', timeout: 20000 });
  
    // ✅ Search Expert input ONLY
    const expertSearch = modal.getByRole('combobox', {
      name: /Search Expert/i,
    });
  
    await expertSearch.waitFor({ state: 'visible', timeout: 20000 });
    await expertSearch.click();
    await expertSearch.fill('anth');
  
    // ✅ VERY IMPORTANT: wait for dropdown listbox
    const listbox = this.page.locator('[role="listbox"]');
    await listbox.waitFor({ state: 'visible', timeout: 20000 });
  
    // ✅ now option WILL exist
    const expertOption = listbox.getByText('Dr Anthony Smith', { exact: false });
  
    await expertOption.waitFor({ state: 'visible', timeout: 20000 });
    await expertOption.click();
  
    // ✅ service selection (inside modal)
    await modal.getByRole('button', { name: 'Natural Medicine' }).click();
    await modal.getByRole('button', { name: 'Follow up Consult' }).click();
  }

  /* ===============================
     BOOK APPOINTMENT (WORKING – DO NOT TOUCH)
  =============================== */
  async bookAppointment() {
    const dateInput = this.page.getByRole('textbox', { name: 'Appointment Date' });
    const findSlotsBtn = this.page.getByRole('button', { name: 'Find Slots' });

    // Start 3 days ahead to ensure appointment stays "Upcoming" status
    // (not "Completed" or "Ongoing") so it can be rescheduled/cancelled
    // Search up to 30 days ahead for an available slot
    let slotSelected = false;
    for (let i = 2; i < 31; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
        date.getDate()
      ).padStart(2, '0')}/${date.getFullYear()}`;

      await dateInput.fill(formattedDate);
      await findSlotsBtn.click();

      const slots = this.page.getByRole('button', { name: /AM|PM/ });
      try {
        await slots.first().waitFor({ state: 'visible', timeout: 10000 });
        await slots.first().click();
        slotSelected = true;
        break;
      } catch {
        // No slot on this date — try next
        continue;
      }
    }

    if (!slotSelected) {
      throw new Error('No appointment slot available in next 30 days');
    }

    await this.page.getByRole('radio', { name: 'Complimentary' }).check();

    const bookBtn = this.page.getByRole('button', { name: 'Book' });
    await bookBtn.waitFor({ state: 'visible', timeout: 20000 });
    // CI can be slow — give the form validation more time to enable Book
    await expect(bookBtn).toBeEnabled({ timeout: 60000 });
    await bookBtn.click();

    await this.page
      .getByText(/Appointment Booked/i)
      .waitFor({ timeout: 60000 });
  }

  /* ===============================
     SEARCH APPOINTMENT
  =============================== */
  async searchAppointment(keyword) {
    // Navigate fresh to appointments page to ensure we see the newly booked one
    await this.page.goto('https://dashboard.asksam.com.au/expert/appointments');
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(2000);

    const searchBox = this.page.getByRole('textbox', {
      name: 'Search appointments...',
    });

    await searchBox.waitFor({ timeout: 20000 });
    await searchBox.fill(keyword);

    // Wait for search results to load
    await this.page.waitForTimeout(3000);
  }

  /* ===============================
     OPEN FIRST APPOINTMENT
  =============================== */
  async openFirstAppointment(pagesChecked = 0) {
    // Wait for appointment cards to load fully
    await this.page.waitForTimeout(3000);

    const hasCards = await this.page.locator('.MuiCard-root').first().isVisible().catch(() => false);
    if (!hasCards) {
      // No cards visible — reload and retry once
      if (pagesChecked === 0) {
        await this.page.reload();
        await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
        await this.page.waitForTimeout(3000);
      }
    }

    await this.page.locator('.MuiCard-root').first().waitFor({ timeout: 30000 });

    const cards = this.page.locator('.MuiCard-root');
    const count = await cards.count();

    // First pass: prefer "Upcoming" appointments (just-booked ones)
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      if (text?.includes('Upcoming')) {
        const viewBtn = card.getByRole('button', { name: /View Details/i });
        if (await viewBtn.isVisible().catch(() => false)) {
          await viewBtn.click();
          return;
        }
      }
    }

    // Second pass: any non-cancelled/completed/ongoing
    for (let i = 0; i < count; i++) {
      const card = cards.nth(i);
      const text = await card.textContent();
      if (text?.includes('Cancelled') || text?.includes('Completed') || text?.includes('Ongoing')) continue;

      const viewBtn = card.getByRole('button', { name: /View Details/i });
      if (await viewBtn.isVisible().catch(() => false)) {
        await viewBtn.click();
        return;
      }
    }

    // Check next pages (up to 15 pages to handle accumulated test data)
    if (pagesChecked < 15) {
      const nextBtn = this.page.getByRole('button', { name: 'Go to next page' });
      if (await nextBtn.isVisible().catch(() => false) && !(await nextBtn.isDisabled().catch(() => true))) {
        await nextBtn.click();
        await this.page.waitForTimeout(2000);
        return this.openFirstAppointment(pagesChecked + 1);
      }
    }

    throw new Error('No active (non-completed, non-cancelled) appointment found');
  }
  async openReschedule() {
    // Wait for the appointment details panel to fully load
    await this.page.waitForTimeout(3000);

    // Try button role first, then fall back to text-based locator
    const rescheduleBtn = this.page.getByRole('button', { name: /Reschedule/i });
    const rescheduleText = this.page.locator('button, [role="button"], a').filter({ hasText: /Reschedule/i }).first();

    try {
      await rescheduleBtn.waitFor({ state: 'visible', timeout: 15000 });
      await rescheduleBtn.click();
    } catch {
      // Fallback: some UI renders Reschedule as a link or styled element
      await rescheduleText.waitFor({ state: 'visible', timeout: 15000 });
      await rescheduleText.click();
    }

    // wait till modal header appears
    await this.page
      .getByText('Reschedule Appointment')
      .waitFor({ timeout: 30000 });
  }

  /* ===============================
     RESCHEDULE APPOINTMENT (DYNAMIC – FINAL)
  =============================== */
  async rescheduleAppointment() {
    // Use locator instead of getByRole to avoid strict mode violation
    // MUI renders multiple [role="dialog"] elements (backdrop + content)
    const modal = this.page.locator('[role="dialog"]').last();

    await modal.waitFor({ state: 'visible', timeout: 20000 });

    // Slot elements are styled divs, not buttons — match "08:00 AM", "01:30 PM" etc.
    const slots = modal.locator('div').filter({
      hasText: /^\d{1,2}:\d{2}\s*(AM|PM)$/,
    });

    let slotPicked = false;

    // First try: slots on the default date
    try {
      await slots.first().waitFor({ state: 'visible', timeout: 10000 });
      await slots.first().click();
      slotPicked = true;
    } catch {
      // Try different dates via the date input
      const dateInput = modal.locator('input[placeholder="DD/MM/YYYY"]');
      // Search up to 30 days ahead for reschedule slot
      for (let dayOffset = 2; dayOffset <= 31; dayOffset++) {
        const d = new Date();
        d.setDate(d.getDate() + dayOffset);
        const formatted = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;

        await dateInput.fill(formatted);
        await this.page.waitForTimeout(2000);

        if (await slots.first().isVisible().catch(() => false)) {
          await slots.first().click();
          slotPicked = true;
          break;
        }
      }
    }

    if (!slotPicked) {
      throw new Error('No available slot found for reschedule');
    }

    // Confirm
    const confirmBtn = modal.getByRole('button', {
      name: /Confirm and Reschedule/i,
    });

    await expect(confirmBtn).toBeEnabled({ timeout: 20000 });
    await confirmBtn.click();

    // Success toast
    await this.page.getByRole('alert').waitFor({ timeout: 30000 });
  }

  /* ===============================
   CANCEL APPOINTMENT (FINAL & STABLE)
=============================== */
// async cancelAppointment() {
//   // 1️⃣ Click Cancel button
//   const cancelBtn = this.page.getByRole('button', { name: /^Cancel$/i });
//   await cancelBtn.waitFor({ state: 'visible', timeout: 20000 });
//   await cancelBtn.click();

//   // 2️⃣ Confirm modal
//   const confirmCancelBtn = this.page.getByRole('button', {
//     name: /Yes, Cancel it/i,
//   });

//   await confirmCancelBtn.waitFor({ state: 'visible', timeout: 20000 });
//   await confirmCancelBtn.click();

//   // 3️⃣ Success toast
//   await this.page
//     .getByText(/Appointment cancelled/i)
//     .waitFor({ timeout: 30000 });

//   // 4️⃣ Close Appointment Details panel (same as recording)
//   const closeBtn = this.page
//     .locator('div')
//     .filter({ hasText: /^Appointment Details$/ })
//     .getByRole('button');

//   await closeBtn.waitFor({ timeout: 20000 });
//   await closeBtn.click();
// }

/* ===============================
   OPEN & CANCEL FIRST NON-CANCELLED APPOINTMENT
=============================== */
async openAndCancelNonCancelledAppointment(pagesChecked = 0) {
  await this.page.waitForTimeout(3000);

  const hasCards = await this.page.locator('.MuiCard-root').first().isVisible().catch(() => false);
  if (!hasCards && pagesChecked === 0) {
    await this.page.reload();
    await this.page.waitForLoadState('networkidle', { timeout: 30000 }).catch(() => {});
    await this.page.waitForTimeout(3000);
  }

  await this.page.locator('.MuiCard-root').first().waitFor({ timeout: 30000 });
  const cards = this.page.locator('.MuiCard-root');
  const count = await cards.count();

  if (count === 0) {
    throw new Error('No appointment cards found');
  }

  // Helper to cancel a card
  const cancelCard = async (card) => {
    const viewDetailsBtn = card.getByRole('button', { name: /View Details/i });
    await viewDetailsBtn.waitFor({ timeout: 15000 });
    await viewDetailsBtn.click();

    // Wait for details panel to load
    await this.page.waitForTimeout(2000);

    const cancelBtn = this.page.getByRole('button', { name: /^Cancel$/i });
    await cancelBtn.waitFor({ state: 'visible', timeout: 15000 });
    await cancelBtn.click();

    const confirmBtn = this.page.getByRole('button', { name: /Yes, Cancel it/i });
    await confirmBtn.waitFor({ state: 'visible', timeout: 15000 });
    await confirmBtn.click();

    await this.page.getByText(/Appointment cancelled/i).waitFor({ timeout: 30000 });
  };

  // First pass: prefer "Upcoming" appointments
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();
    if (text?.includes('Upcoming')) {
      await cancelCard(card);
      return;
    }
  }

  // Second pass: any non-cancelled/completed/ongoing
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    const text = await card.textContent();
    if (text?.includes('Cancelled') || text?.includes('Completed') || text?.includes('Ongoing')) continue;

    await cancelCard(card);
    return;
  }

  // Check next pages (up to 15 pages to handle accumulated test data)
  if (pagesChecked < 15) {
    const nextBtn = this.page.getByRole('button', { name: 'Go to next page' });
    if (await nextBtn.isVisible().catch(() => false) && !(await nextBtn.isDisabled().catch(() => true))) {
      await nextBtn.click();
      await this.page.waitForTimeout(2000);
      return this.openAndCancelNonCancelledAppointment(pagesChecked + 1);
    }
  }

  throw new Error('No non-cancelled appointment found to cancel');
}

/* ===============================
   OPEN SESSION MANAGEMENT (FIXED)
=============================== */
/* ===============================
   OPEN SESSION MANAGEMENT (STRICT SAFE)
=============================== */
async openSessionManagement() {
  await this.page.getByRole('link', {
    name: 'Session Management',
    exact: true,
  }).click();

  // ✅ Correct URL
  await this.page.waitForURL(/sessionmanagement/, { timeout: 30000 });

  // ✅ Wait ONLY for page heading (unique)
  await this.page
    .getByRole('heading', { name: 'Session Management' })
    .waitFor({ timeout: 30000 });
}

/* ===============================
   CLICK FIRST AVAILABLE MARK SESSION
=============================== */
async clickFirstMarkSession() {
  const markButtons = this.page.getByRole('button', {
    name: /Mark Session/i,
  });

  await markButtons.first().waitFor({ timeout: 20000 });
  await markButtons.first().click();
}

/* ===============================
   SUBMIT SESSION NOTE
=============================== */
async submitSession(note = 'test completed') {
  const noteBox = this.page.getByRole('textbox', {
    name: /Note \(Optional\)/i,
  });

  await noteBox.waitFor({ timeout: 20000 });
  await noteBox.fill(note);

  await this.page.getByRole('button', { name: 'Submit' }).click();

  await this.page
    .getByText(/Form submitted Successfully/i)
    .waitFor({ timeout: 30000 });
}

/* ===============================
   SWITCH SESSION TAB (ROBUST)
=============================== */
async switchSessionTab(tabName) {
  const tab = this.page.getByText(tabName, { exact: true });

  await tab.waitFor({ timeout: 15000 });
  await tab.click();
}

/* ===============================
   MARK NOT COMPLETED
=============================== */
async markNotCompleted() {
  await this.page
    .getByRole('button', { name: 'Not Completed' })
    .waitFor({ timeout: 15000 });

  await this.page
    .getByRole('button', { name: 'Not Completed' })
    .click();
}

/* ===============================
   OPEN & CLOSE SESSION DETAILS
=============================== */
async openAndCloseSessionDetails() {
  const viewBtn = this.page
    .locator('button')
    .filter({ hasText: /View/i })
    .first();

  await viewBtn.waitFor({ timeout: 15000 });
  await viewBtn.click();

  await this.page.getByRole('button', { name: 'close' }).click();
}

/* ===============================
   OPEN PATIENTS MODULE
=============================== */
async openPatients() {
  await this.page.getByRole('link', { name: 'Patients' }).click();
  await this.page.waitForURL(/expert\/patients/, { timeout: 30000 });
}

/* ===============================
   CREATE PATIENT (PATIENTS MODULE)
=============================== */
async createPatientFromPatientsModule() {
  const uniq = Math.floor(100000 + Math.random() * 900000);

  const patient = {
    firstName: 'test',
    lastName: `autouser-${uniq}`,
    email: `testautouser-${uniq}@tmail.com`,
  };

  // Open Patients → Create Patient
  await this.page.getByRole('button', { name: 'Create Patient' }).click();

  // ✅ REAL WAIT (not dialog)
  await this.page
    .getByRole('textbox', { name: 'First Name' })
    .waitFor({ state: 'visible', timeout: 20000 });

  await this.page.getByRole('textbox', { name: 'First Name' }).fill(patient.firstName);
  await this.page.getByRole('textbox', { name: 'Last Name' }).fill(patient.lastName);
  await this.page.getByRole('textbox', { name: 'Email' }).fill(patient.email);

  await this.page.getByRole('combobox', { name: 'Gender' }).click();
  await this.page.getByRole('option', { name: 'Male', exact: true }).click();

  await this.page.getByRole('textbox', { name: 'Date of Birth' }).fill('04/02/2001');

  await this.page.getByRole('button', { name: 'Create Patient' }).click();

  await this.page
    .getByText(/Patient registered|Patient created|successfully/i)
    .waitFor({ timeout: 30000 });

  return patient;
}

/* ===============================
   SEARCH & OPEN PATIENT
=============================== */
async searchAndOpenPatient(email) {
  const searchBox = this.page.getByRole('textbox', {
    name: 'Search patients...',
  });

  await searchBox.fill(email);
  await this.page.getByRole('button', { name: 'Search' }).click();

  // locate the patient row using unique email
  const patientRow = this.page
    .locator('tr')
    .filter({ hasText: email })
    .first();

  await patientRow.waitFor({ timeout: 30000 });

  // click profile / first column (safe & stable)
  await patientRow.locator('td').first().click();
}
}