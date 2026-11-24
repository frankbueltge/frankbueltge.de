const { chromium } = require('playwright');
(async () => {
  const [file, out, full] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto('file://' + file);
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: full === 'full' });
  await b.close();
})();
