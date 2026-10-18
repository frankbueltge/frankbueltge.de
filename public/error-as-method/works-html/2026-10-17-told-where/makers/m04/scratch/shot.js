const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ args: ['--no-sandbox'] });
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs=[]; p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('REQ '+r.url()));
  p.on('request', r => { if (!r.url().startsWith('file:')) errs.push('NET '+r.url()); });
  await p.goto('file:///tmp/claude-0/s133/mk/m04/work/index.html');
  await p.waitForTimeout(4000);
  await p.screenshot({ path: '/tmp/claude-0/s133/mk/m04/scratch/shot.png' });
  console.log(errs);
  await b.close();
})();
