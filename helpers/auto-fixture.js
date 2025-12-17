import { test as baseTest, expect } from "@playwright/test";

export const test = baseTest;
export { expect };

test.use({
  // you can set default viewport etc here if needed
});

// small helper to create a wait for X ms
export const sleep = (ms) => new Promise(res => setTimeout(res, ms));
