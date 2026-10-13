const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => errs.push(m.text()));
  p.on('request', r => { if (!r.url().startsWith('file:')) errs.push('REQ ' + r.url()); });
  await p.goto('file:///tmp/claude-0/s122/mk/m10/work/index.html');
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/claude-0/s122/mk/m10/scratch/shot.png' });
  console.log(errs.join('\n') || 'no errors'); await b.close();
})();
