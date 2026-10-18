const { chromium } = require('/opt/node-tools/node_modules/playwright');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome' });
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } });
  const reqs = [];
  p.on('request', r => reqs.push(r.url()));
  p.on('console', m => console.log('console:', m.text()));
  p.on('pageerror', e => console.log('error:', e.message));
  await p.goto('file:///tmp/claude-0/s133/mk/m02/work/index.html');
  await p.waitForTimeout(1500);
  await p.screenshot({ path: '/tmp/claude-0/s133/mk/m02/scratch/shot.png' });
  console.log(reqs);
  await b.close();
})();
