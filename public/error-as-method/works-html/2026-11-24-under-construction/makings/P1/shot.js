// node shot.js index-vN.html  -> index-vN.png (first screen) and index-vN-full.png
const path = require('path');
const { chromium } = require('playwright');
(async () => {
  const f = process.argv[2];
  const base = path.join(__dirname, f.replace(/\.html$/, ''));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  await page.goto('file://' + path.join(__dirname, f));
  await page.waitForTimeout(400);
  await page.screenshot({ path: base + '.png' });
  await page.screenshot({ path: base + '-full.png', fullPage: true });
  await browser.close();
})();
