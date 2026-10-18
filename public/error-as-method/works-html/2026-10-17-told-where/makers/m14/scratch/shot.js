const { chromium } = require('/opt/node22/lib/node_modules/playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const reqs = []; p.on('request', r => reqs.push(r.url()));
  p.on('console', m => console.log('console', m.text())); p.on('pageerror', e => console.log('err', e.message));
  await p.goto('file:///tmp/claude-0/s133/mk/m14/work/index.html');
  await p.waitForTimeout(500);
  await p.screenshot({ path: '/tmp/claude-0/s133/mk/m14/scratch/shot.png' });
  console.log(reqs); await b.close();
})();
