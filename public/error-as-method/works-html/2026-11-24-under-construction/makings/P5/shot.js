const { chromium } = require('playwright');
(async () => {
  const v = process.argv[2];
  const dir = __dirname + '/';
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 800, height: 600 } });
  await p.goto('file://' + dir + 'index-' + v + '.html');
  await p.screenshot({ path: dir + 'shot-' + v + '.png' });
  await p.screenshot({ path: dir + 'shot-' + v + '-full.png', fullPage: true });
  await b.close();
})();
