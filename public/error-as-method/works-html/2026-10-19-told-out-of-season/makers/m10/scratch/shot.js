const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const errs=[]; p.on('pageerror', e=>errs.push(e.message)); p.on('request', r=>{ if(!r.url().startsWith('file:')) errs.push('REQ '+r.url()); });
  await p.goto('file:///tmp/claude-0/s137/mk/m10/work/index.html');
  await p.screenshot({ path: '/tmp/claude-0/s137/mk/m10/scratch/shot.png' });
  console.log(errs.join('\n')||'no errors'); await b.close();
})();
