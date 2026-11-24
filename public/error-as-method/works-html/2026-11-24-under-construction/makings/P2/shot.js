const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const f = process.argv[2];
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto('file://' + path.resolve(__dirname, f));
  await p.waitForTimeout(500);
  await p.screenshot({ path: path.resolve(__dirname, f.replace('.html', '.png')) });
  await p.screenshot({ path: path.resolve(__dirname, f.replace('.html', '-full.png')), fullPage: true });
  await b.close();
})();
