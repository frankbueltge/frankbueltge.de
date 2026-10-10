// node render_png.js: renders materials/bloom.svg to materials/bloom.png at 1100x500 (arm I's material).
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1100, height: 500 } });
  await p.goto('file://' + path.join(__dirname, 'materials', 'bloom.svg'));
  await p.screenshot({ path: path.join(__dirname, 'materials', 'bloom.png') });
  await b.close(); console.log('ok');
})();
