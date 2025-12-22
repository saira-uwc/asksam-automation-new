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
       CREATE NEW PATIENT (➕ FLOW)
    =============================== */
    async createPatient() {
      const uniq = Math.floor(100000 + Math.random() * 900000);
  
      const patient = {
        firstName: 'test',
        lastName: `user-${uniq}`,
        email: `testuser${uniq}@tmail.com`,
      };
  
      // ➕ Add new patient
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
       SELECT PATIENT
    =============================== */
    async selectPatient(patient) {
        const searchBox = this.page.getByRole('combobox', { name: 'Search User' });
      
        await searchBox.click();
        await searchBox.fill(patient.email);
      
        // wait for dropdown result to appear
        const patientOption = this.page.getByText(patient.email, { exact: false });
      
        await patientOption.waitFor({ timeout: 15000 });
        await patientOption.click();
      }
  
    /* ===============================
       SELECT EXPERT
    =============================== */
    async selectExpert() {
      await this.page.getByRole('combobox', { name: 'Search Expert' }).click();
      await this.page.getByRole('combobox', { name: 'Search Expert' }).fill('anth');
      await this.page.getByText('Dr Anthony Smith', { exact: true }).click();
  
      await this.page.getByRole('button', { name: 'Natural Medicine' }).click();
      await this.page.getByRole('button', { name: 'Follow up Consult' }).click();
    }
  
    /* ===============================
       BOOK SLOT
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
      
        // ✅ Correct way (no expect in page object)
        await this.page.waitForFunction(
          (btn) => !btn.disabled,
          await bookBtn.elementHandle(),
          { timeout: 20000 }
        );
      
        await bookBtn.click();
      
        await this.page
          .getByText('Appointment Booked', { exact: false })
          .waitFor({ timeout: 60000 });
      }
  }