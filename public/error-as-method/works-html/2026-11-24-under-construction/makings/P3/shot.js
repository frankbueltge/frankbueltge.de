const { chromium } = require('playwright');
(async () => {
  const [, , file, out, full] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto('file://' + require('path').resolve(file));
  await p.waitForTimeout(300);
  await p.screenshot({ path: out, fullPage: full === 'full' });
  await b.close();
})();
