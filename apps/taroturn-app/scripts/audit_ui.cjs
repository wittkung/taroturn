const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function audit() {
  const browser = await chromium.launch();
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });
  const page = await context.newPage();

  console.log('Navigating to http://localhost:3000/...');
  await page.goto('http://localhost:3000/');
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(800);

  const outDir = path.resolve(__dirname, '../../../artifacts/screenshots');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  // 1. Initial Empty Sanctuary (Dark)
  await page.screenshot({ path: path.join(outDir, '01_dark_sanctuary_empty.png') });
  console.log('Captured 01_dark_sanctuary_empty.png');

  // 2. Click Draw button (Time Stream 3 Cards)
  const drawBtn = page.locator('button:has-text("开始密码学抽牌"), button:has-text("重新洗牌")').first();
  if (await drawBtn.isVisible()) {
    await drawBtn.click();
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(outDir, '02_dark_time_stream_dealt.png') });
    console.log('Captured 02_dark_time_stream_dealt.png');
  }

  // 3. Click first card to open slide-over reading drawer
  const firstCard = page.locator('.card-tactile').first();
  if (await firstCard.isVisible()) {
    await firstCard.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '03_dark_reading_drawer.png') });
    console.log('Captured 03_dark_reading_drawer.png');
  }

  // Close drawer
  const closeBtn = page.locator('.glass-drawer button:has(svg)').first();
  if (await closeBtn.isVisible()) {
    await closeBtn.click();
    await page.waitForTimeout(400);
  }

  // 4. Switch to Celtic Cross Spread
  const spreadDropdown = page.locator('header button:has-text("时间之流"), header button:has-text("牌阵")').first();
  if (await spreadDropdown.isVisible()) {
    await spreadDropdown.click();
    await page.waitForTimeout(300);
    const celticOption = page.locator('button:has-text("凯尔特十字")').first();
    if (await celticOption.isVisible()) {
      await celticOption.click();
      await page.waitForTimeout(400);
      const drawBtn2 = page.locator('button:has-text("开始密码学抽牌"), button:has-text("重新洗牌")').first();
      if (await drawBtn2.isVisible()) {
        await drawBtn2.click();
        await page.waitForTimeout(3200);
        await page.screenshot({ path: path.join(outDir, '04_dark_celtic_cross.png') });
        console.log('Captured 04_dark_celtic_cross.png');
      }
    }
  }

  // 5. Switch to Light Mode (Washi Linen)
  const themeBtn = page.locator('header button[title*="日间模式"], header button[title*="夜间模式"], header button:has(svg.lucide-sun), header button:has(svg.lucide-moon)').first();
  if (await themeBtn.isVisible()) {
    await themeBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '05_light_celtic_cross.png') });
    console.log('Captured 05_light_celtic_cross.png');
  }

  // 6. Open Deck Catalog in Light Mode
  const catalogBtn = page.locator('button:has-text("78 牌图鉴"), button:has-text("78牌图鉴")').first();
  if (await catalogBtn.isVisible()) {
    await catalogBtn.click();
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(outDir, '06_light_deck_catalog.png') });
    console.log('Captured 06_light_deck_catalog.png');
  }

  await browser.close();
  console.log('All audit screenshots captured successfully!');
}

audit().catch(err => {
  console.error(err);
  process.exit(1);
});
