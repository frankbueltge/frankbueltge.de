const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const name = process.argv[2];
  const dir = __dirname;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto('file://' + path.join(dir, name + '.html'));
  await page.screenshot({ path: path.join(dir, name + '.png') });
  await page.screenshot({ path: path.join(dir, name + '-full.png'), fullPage: true });
  await browser.close();
})();
