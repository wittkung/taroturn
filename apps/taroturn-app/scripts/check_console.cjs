const { chromium } = require('playwright');

async function checkConsole() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER ERROR:', err.message, err.stack));

  console.log('Loading page...');
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);

  const html = await page.content();
  console.log('HTML Length:', html.length);
  if (html.length < 500) {
    console.log('HTML Content:', html);
  }

  await browser.close();
}

checkConsole().catch(err => {
  console.error(err);
  process.exit(1);
});
