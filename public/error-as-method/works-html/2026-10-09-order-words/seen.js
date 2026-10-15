// seen.js: the face at 1200 px (light) and 390 px (dark), before and after one judgement; page errors and horizontal scroll reported.
const { chromium } = require('playwright'); const path = require('path');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const [w, scheme] of [[1200, 'light'], [390, 'dark']]) {
    const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(__dirname, 'seen', w + '-' + scheme + '-top.png'), fullPage: false });
    await p.click('.ask button'); await p.waitForTimeout(500);
    const sx = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    await p.screenshot({ path: path.join(__dirname, 'seen', w + '-' + scheme + '-judged.png'), fullPage: true });
    console.log(w, scheme, 'errors:', errs.length ? errs : 'none', 'horizontal overflow px:', sx);
  }
  await b.close();
})();
