export class ExpertDashboardPage {
    constructor(page) {
      this.page = page;
    }
  
    async gotoDashboard() {
      await this.page.goto('https://dashboard.asksam.com.au/expert/dashboard');
      await this.page.getByRole('heading', { name: 'Upcoming Appointments' })
        .waitFor({ timeout: 15000 });
    }
  
    async openDashboard() {
      await this.page.getByRole('link', { name: 'Dashboard' }).click();
    }
  
    async openUpcomingAppointments() {
      await this.page.getByRole('heading', { name: 'Upcoming Appointments' }).click();
    }
  
    async openNotifications() {
      await this.page.getByRole('heading', { name: 'Notifications' }).click();
    }
  
    async openInbox() {
      await this.page.getByRole('heading', { name: 'Inbox' }).click();
    }
  
    async openCalendar() {
      await this.page.getByRole('heading', { name: 'Calendar' }).click();
    }
  
    async viewAllAppointments() {
      await this.page.getByRole('link', { name: 'View All' }).first().click();
      await this.page.getByRole('heading', { name: 'Appointments' })
        .waitFor({ timeout: 10000 });
    }
  
    async viewAllPatients() {
      await this.page.getByRole('link', { name: 'View All' }).nth(2).click();
      await this.page.getByRole('heading', { name: 'Patients' })
        .waitFor({ timeout: 10000 });
    }
  
    async openAppointmentsFromMenu() {
      await this.page.getByRole('link', { name: 'appointments', exact: true }).click();
      await this.page.getByRole('heading', { name: 'Appointments' }).waitFor();
    }
  
    async openChat() {
      await this.page.getByRole('link', { name: 'chat', exact: true }).click();
      await this.page.getByRole('heading', { name: 'Patients' }).waitFor();
    }
  
    async openNotificationsFromMenu() {
      await this.page.getByRole('link', { name: 'notifications', exact: true }).click();
      await this.page.getByRole('heading', { name: 'Notifications' }).waitFor();
    }
  }