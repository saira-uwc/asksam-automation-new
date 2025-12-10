import { test as base } from "@playwright/test";

// Full Stabilization Layer
export const test = base.extend({
  page: async ({ page }, use) => {
    
    // Wrap locator actions (click, fill, press, type)
    const wrapLocatorAction = (locator, actionName, originalFn) => {
      locator[actionName] = async (...args) => {
        await locator.waitFor({ state: "visible", timeout: 30000 }).catch(() => {});
        await locator.waitFor({ state: "attached", timeout: 30000 }).catch(() => {});
        return originalFn.apply(locator, args);
      };
    };

    // Monkey-patch Locator prototype globally
    const proto = page.locator("").constructor.prototype;

    ["click", "fill", "press", "type"].forEach((action) => {
      const original = proto[action];
      proto[action] = function (...args) {
        const locator = this;
        return locator
          .waitFor({ state: "visible", timeout: 30000 })
          .catch(() => {})
          .then(() => original.apply(locator, args));
      };
    });

    // Patch getByRole / getByText / locator auto-waiting
    const locatorMethods = ["getByRole", "getByText", "locator"];
    locatorMethods.forEach((method) => {
      const original = page[method].bind(page);

      page[method] = (...args) => {
        const loc = original(...args);

        // auto-wait + auto-stabilize methods
        ["click", "fill", "press", "type"].forEach((action) => {
          wrapLocatorAction(loc, action, loc[action]);
        });

        return loc;
      };
    });

    await use(page);
  }
});
