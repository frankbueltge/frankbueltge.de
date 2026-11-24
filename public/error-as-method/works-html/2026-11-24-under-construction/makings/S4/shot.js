const { chromium } = require('playwright');
(async () => {
  const name = process.argv[2];
  const dir = __dirname + '/';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto('file://' + dir + name + '.html');
  await p.waitForTimeout(300);
  await p.screenshot({ path: dir + 'shot-' + name + '.png' });
  await p.screenshot({ path: dir + 'shot-' + name + '-full.png', fullPage: true });
  await b.close();
})();
