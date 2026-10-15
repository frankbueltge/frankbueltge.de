// node seen.js: renders the face at 1100 and 390 px, light and dark, before and after the reveal -> seen/*.png
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForTimeout(800); await p.screenshot({ path: `seen/face-${w}.png` });
  await p.click('#reveal'); await p.waitForTimeout(300);
  await p.screenshot({ path: `seen/face-${w}-shown.png`, fullPage: true });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify({ w, scheme, errors: errs, scrollWidth: sw })); await p.close(); }
 await b.close(); })();
