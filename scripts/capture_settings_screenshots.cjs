const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function capture() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/...');
  try {
    await page.goto('http://localhost:3000/', { timeout: 5000 });
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(800);

    const outDir = path.resolve(__dirname, '../artifacts/screenshots');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    // 1. Open Settings Modal (AI Gateway Tab)
    const settingsBtn = page.locator('button[title*="设置"]').first();
    if (await settingsBtn.isVisible()) {
      await settingsBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, '09_settings_ai_gateway.png') });
      console.log('Saved 09_settings_ai_gateway.png');

      // Click Profile Tab inside Settings
      const profileTabBtn = page.locator('button:has-text("求问者与本命灵数")').first();
      if (await profileTabBtn.isVisible()) {
        await profileTabBtn.click();
        await page.waitForTimeout(500);
        await page.screenshot({ path: path.join(outDir, '10_settings_seeker_profile.png') });
        console.log('Saved 10_settings_seeker_profile.png');
      }

      // Close Settings Modal
      const closeBtn = page.locator('button:has(svg.lucide-x)').first();
      if (await closeBtn.isVisible()) {
        await closeBtn.click();
        await page.waitForTimeout(400);
      }
    }

    // 2. Open User Profile Modal
    const userBtn = page.locator('button[title*="求问者本命神殿"]').first();
    if (await userBtn.isVisible()) {
      await userBtn.click();
      await page.waitForTimeout(600);
      await page.screenshot({ path: path.join(outDir, '11_seeker_archetype_sanctuary.png') });
      console.log('Saved 11_seeker_archetype_sanctuary.png');
    }
  } catch (err) {
    console.log('Capture note:', err.message);
  } finally {
    await browser.close();
  }
}

capture().catch(err => {
  console.error('Capture script error:', err);
});
