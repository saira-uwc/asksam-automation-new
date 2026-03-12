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

    return patient;
  }

  /* ===============================
     SELECT EXISTING PATIENT (NEW)
  =============================== */
  async selectExistingPatient(patientName) {
    const searchBox = this.page.getByRole('combobox', { name: 'Search User' });

    await searchBox.waitFor({ state: 'visible', timeout: 30000 });
    await searchBox.click();
    await searchBox.fill(patientName);

    // Wait for API response — CI can be slow
    await this.page.waitForTimeout(3000);

    // If listbox didn't appear, clear and retry fill
    const listbox = this.page.locator('[role="listbox"]');
    if (!(await listbox.isVisible().catch(() => false))) {
      await searchBox.clear();
      await this.page.waitForTimeout(500);
      await searchBox.fill(patientName);
      await this.page.waitForTimeout(3000);
    }

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

    // 14 days instead of 7 — prevents slot depletion when full suite runs back-to-back
    for (let i = 0; i < 14; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
        date.getDate()
      ).padStart(2, '0')}/${date.getFullYear()}`;

      await dateInput.fill(formattedDate);
      await findSlotsBtn.click();

      await this.page.waitForTimeout(5000);

      const slots = this.page.getByRole('button', { name: /AM|PM/ });

      if (await slots.first().isVisible().catch(() => false)) {
        await slots.first().click();
        break;
      }
    }

    await this.page.getByRole('radio', { name: 'Complimentary' }).check();

    const bookBtn = this.page.getByRole('button', { name: 'Book' });

    await bookBtn.waitFor({ state: 'visible', timeout: 20000 });
    await expect(bookBtn).toBeEnabled({ timeout: 20000 });
    await bookBtn.click();

    await this.page
      .getByText(/Appointment Booked/i)
      .waitFor({ timeout: 60000 });
  }

  /* ===============================
     SEARCH APPOINTMENT
  =============================== */
  async searchAppointment(keyword) {
    const searchBox = this.page.getByRole('textbox', {
      name: 'Search appointments...',
    });

    await searchBox.waitFor({ timeout: 20000 });
    await searchBox.fill(keyword);
  }

  /* ===============================
     OPEN FIRST APPOINTMENT
  =============================== */
  async openFirstAppointment() {
    await this.page.getByRole('button', { name: 'View Details' }).first().click();
  }
  async openReschedule() {
    const rescheduleBtn = this.page.getByRole('button', {
      name: /Reschedule/i,
    });
  
    await rescheduleBtn.waitFor({ state: 'visible', timeout: 20000 });
    await rescheduleBtn.click();
  
    // wait till modal header appears
    await this.page
      .getByText('Reschedule Appointment')
      .waitFor({ timeout: 20000 });
  }

  /* ===============================
     RESCHEDULE APPOINTMENT (DYNAMIC – FINAL)
  =============================== */
  async rescheduleAppointment() {
    const modal = this.page
      .getByRole('dialog')
      .filter({ hasText: 'Reschedule Appointment' })
      .first();
  
    await modal.waitFor({ state: 'visible', timeout: 20000 });
  
    const calendarBtn = modal.getByRole('button', {
      name: /Choose date, selected date is/i,
    });
  
    let slotPicked = false;
  
    for (let dayOffset = 1; dayOffset <= 14; dayOffset++) {
      // 1️⃣ Open calendar
      await calendarBtn.click();
  
      const d = new Date();
      d.setDate(d.getDate() + dayOffset);
      const day = String(d.getDate());
  
      // 2️⃣ Pick date
      const dateCell = this.page.getByRole('gridcell', { name: day });
      if (!(await dateCell.isVisible().catch(() => false))) continue;
      await dateCell.click();
  
      // 3️⃣ WAIT for slots to load (IMPORTANT)
      const slots = modal.locator('div').filter({
        hasText: /(AM|PM)$/,
      });
  
      try {
        await slots.first().waitFor({ timeout: 15000 });
      } catch {
        continue; // ❌ no slots → next date
      }
  
      // 4️⃣ CLICK FIRST SLOT (REAL USER CLICK)
      await slots.first().scrollIntoViewIfNeeded();
      await slots.first().click();
  
      slotPicked = true;
      break;
    }
  
    if (!slotPicked) {
      throw new Error('No available slot found for reschedule');
    }
  
    // 5️⃣ Confirm
    const confirmBtn = modal.getByRole('button', {
      name: /Confirm and Reschedule/i,
    });
  
    await expect(confirmBtn).toBeEnabled({ timeout: 20000 });
    await confirmBtn.click();
  
    // 6️⃣ Success toast
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
async openAndCancelNonCancelledAppointment() {
  const cards = this.page.locator('.MuiCard-root');

  const count = await cards.count();
  if (count === 0) {
    throw new Error('No appointment cards found');
  }

  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);

    // 🔎 Check status text inside card
    const statusText = await card.textContent();

    // ❌ Skip already cancelled appointments
    if (statusText?.includes('Cancelled')) {
      continue;
    }

    // ✅ Open View Details for valid appointment
    const viewDetailsBtn = card.getByRole('button', {
      name: /View Details/i,
    });

    await viewDetailsBtn.waitFor({ timeout: 15000 });
    await viewDetailsBtn.click();

    // ✅ Cancel flow
    const cancelBtn = this.page.getByRole('button', { name: /^Cancel$/i });
    await cancelBtn.waitFor({ timeout: 15000 });
    await cancelBtn.click();

    const confirmBtn = this.page.getByRole('button', {
      name: /Yes, Cancel it/i,
    });
    await confirmBtn.waitFor({ timeout: 15000 });
    await confirmBtn.click();

    // ✅ Success toast
    await this.page
      .getByText(/Appointment cancelled/i)
      .waitFor({ timeout: 30000 });

    // 🎯 Exit after first successful cancellation
    return;
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