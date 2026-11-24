const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const f = process.argv[2];
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto('file://' + path.resolve(f));
  await page.screenshot({ path: f.replace(/\.html$/, '.png') });
  await page.screenshot({ path: f.replace(/\.html$/, '-full.png'), fullPage: true });
  await browser.close();
})();
