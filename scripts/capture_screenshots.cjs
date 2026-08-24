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
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  const outDir = path.resolve(__dirname, '../artifacts/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Initial Dark Mode (Empty)
  await page.screenshot({ path: path.join(outDir, '01_dark_empty.png') });
  console.log('Saved 01_dark_empty.png');

  // 2. Draw Cards
  const drawBtn = page.locator('button:has-text("洗牌推演"), button:has-text("开始密码学抽牌")').first();
  if (await drawBtn.isVisible()) {
    await drawBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '02_dark_drawn.png') });
    console.log('Saved 02_dark_drawn.png');
  }

  // 3. Switch to Celtic Cross
  const celticBtn = page.locator('button:has-text("凯尔特十字")').first();
  if (await celticBtn.isVisible()) {
    await celticBtn.click();
    await page.waitForTimeout(500);
    const drawBtn2 = page.locator('button:has-text("洗牌推演"), button:has-text("开始密码学抽牌")').first();
    if (await drawBtn2.isVisible()) {
      await drawBtn2.click();
      await page.waitForTimeout(1500);
      await page.screenshot({ path: path.join(outDir, '03_dark_celtic_cross.png') });
      console.log('Saved 03_dark_celtic_cross.png');
    }
  }

  // 4. Switch to Light Mode
  const themeBtn = page.locator('button[title*="日间模式"], button[title*="夜间模式"], header button:has(svg)').nth(1);
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '04_light_celtic_cross.png') });
    console.log('Saved 04_light_celtic_cross.png');
  }

  // 5. Open 78 Cards Catalog
  const catalogBtn = page.locator('button:has-text("78牌图鉴")').first();
  if (await catalogBtn.isVisible()) {
    await catalogBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '05_light_deck_catalog.png') });
    console.log('Saved 05_light_deck_catalog.png');
  }

  await browser.close();
  console.log('Screenshot capture complete!');
}

capture().catch(err => {
  console.error('Error capturing screenshots:', err);
  process.exit(1);
});
