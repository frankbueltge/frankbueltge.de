const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch({ executablePath: process.argv[3] });
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('requestfailed', r=>errs.push('REQ '+r.url()));
  await p.goto('file:///tmp/claude-0/s130/mk/m04/work/index.html');
  await p.waitForTimeout(300);
  await p.screenshot({ path: process.argv[2] });
  console.log('errors', errs); await b.close();
})();
