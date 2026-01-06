export async function dismissTourIfPresent(page) {
    const overlays = page.locator(
      '#clinical-tour-overlay, #clinical-tour-loading-overlay'
    );
  
    // If tour / overlay exists, dismiss it
    if (await overlays.first().isVisible({ timeout: 3000 }).catch(() => false)) {
      console.log('⚠️ Tour overlay detected, dismissing...');
      await page.keyboard.press('Escape');
  
      await overlays.first().waitFor({
        state: 'hidden',
        timeout: 10000,
      });
    }
  }