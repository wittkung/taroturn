const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function auditTtagy() {
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

  // 1. Draw Celtic Cross cards
  console.log('Dealing cards...');
  const drawBtn = page.locator('button:has-text("开始密码学抽牌"), button:has-text("重新洗牌")').first();
  await drawBtn.click();
  await page.waitForTimeout(2200);

  // 2. Open Reading Drawer
  console.log('Opening Reading Drawer...');
  const firstCard = page.locator('.card-tactile').first();
  await firstCard.click();
  await page.waitForTimeout(600);

  // 3. Switch to TTAgy AI Tab
  console.log('Switching to TTAgy AI tab...');
  const aiTabBtn = page.locator('button:has-text("TTAgy 深度推演")').first();
  await aiTabBtn.click();
  await page.waitForTimeout(500);

  // 4. Trigger Full Spread AI Report Generation
  console.log('Triggering AI Report generation...');
  const generateReportBtn = page.locator('button:has-text("生成全景推演报告"), button:has-text("重新生成推演报告")').first();
  await generateReportBtn.click();

  // Wait for streaming report to complete
  console.log('Waiting for AI report stream to finish...');
  await page.waitForTimeout(22000);

  await page.screenshot({ path: path.join(outDir, '07_ttagy_ai_report_streamed.png') });
  console.log('Captured 07_ttagy_ai_report_streamed.png');

  // 5. Switch to Multi-turn Chat Tab
  console.log('Switching to Chat Dialogue tab...');
  const chatTabBtn = page.locator('button:has-text("圣所追问对话")').first();
  await chatTabBtn.click();
  await page.waitForTimeout(500);

  // 6. Send a follow-up question
  console.log('Sending follow-up question...');
  const quickQuestionBtn = page.locator('button:has-text("这张牌对我目前的决策意味着什么？")').first();
  if (await quickQuestionBtn.isVisible()) {
    await quickQuestionBtn.click();
  } else {
    const input = page.locator('input[placeholder*="向推演导师提出你的困惑与追问"]');
    await input.fill('请问阻碍位的逆位卡牌对我有什么关键提醒？');
    const sendBtn = page.locator('button:has(svg.lucide-send)');
    await sendBtn.click();
  }

  // Wait for streaming chat answer
  console.log('Waiting for AI chat answer stream to finish...');
  await page.waitForTimeout(18000);

  await page.screenshot({ path: path.join(outDir, '08_ttagy_ai_chat_dialogue.png') });
  console.log('Captured 08_ttagy_ai_chat_dialogue.png');

  await browser.close();
  console.log('Audit completed successfully.');
}

auditTtagy().catch((err) => {
  console.error('Audit failed:', err);
  process.exit(1);
});
