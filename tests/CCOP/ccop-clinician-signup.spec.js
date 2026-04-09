import { test } from '@playwright/test';
import { CCOPClinicianSignupPage } from '../../pages/ccop-clinician-signup.page';

test('CCOP | Clinician signup full flow (recorded)', async ({ page }) => {
  const signup = new CCOPClinicianSignupPage(page);

  const id = Date.now().toString().slice(-6);
  const user = {
    firstName: 'test',
    lastName: `autouser${id}`,
    email: `testautouser${id}+clerk_test@tmail.com`,
  };

  await signup.signup(user);

  const popup = await signup.activateFreePlan();

  await signup.completeTours(popup);

  await signup.logout(popup);
});