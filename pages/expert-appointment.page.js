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

    await searchBox.waitFor({ timeout: 20000 });
    await searchBox.click();
    await searchBox.fill(patientName);

    const patientOption = this.page.getByText(patientName, { exact: false });
    await patientOption.waitFor({ timeout: 20000 });
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

    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(date.getDate() + i + 1);

      const formattedDate = `${String(date.getMonth() + 1).padStart(2, '0')}/${String(
        date.getDate()
      ).padStart(2, '0')}/${date.getFullYear()}`;

      await dateInput.fill(formattedDate);
      await findSlotsBtn.click();

      await this.page.waitForTimeout(3000);

      const slots = this.page.getByRole('button', { name: /AM|PM/ });

      if (await slots.first().isVisible().catch(() => false)) {
        await slots.first().click();
        break;
      }
    }

    await this.page.getByRole('radio', { name: 'Complimentary' }).check();

    const bookBtn = this.page.getByRole('button', { name: 'Book' });

    await this.page.waitForFunction(
      (btn) => !btn.disabled,
      await bookBtn.elementHandle(),
      { timeout: 20000 }
    );

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
        await slots.first().waitFor({ timeout: 8000 });
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
  
    await this.page.waitForFunction(
      btn => !btn.disabled,
      await confirmBtn.elementHandle(),
      { timeout: 20000 }
    );
  
    await confirmBtn.click();
  
    // 6️⃣ Success toast
    await this.page.getByRole('alert').waitFor({ timeout: 30000 });
  }
}