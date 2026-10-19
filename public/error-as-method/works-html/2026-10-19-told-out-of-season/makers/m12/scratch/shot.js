const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs=[]; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => errs.push(m.text()));
  await p.goto('file:///tmp/claude-0/s137/mk/m12/work/index.html');
  await p.waitForTimeout(300);
  await p.screenshot({ path: '/tmp/claude-0/s137/mk/m12/scratch/shot.png' });
  console.log(errs.join('\n') || 'no errors');
  await b.close();
})();
