const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const name = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto('file://' + path.resolve(__dirname, name));
  await page.waitForTimeout(300);
  const base = name.replace('.html', '');
  await page.screenshot({ path: path.resolve(__dirname, base + '-screen.png') });
  await page.screenshot({ path: path.resolve(__dirname, base + '-full.png'), fullPage: true });
  await browser.close();
})();
