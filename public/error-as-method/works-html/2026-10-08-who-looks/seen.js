// node seen.js: the face at 1200 px (light) and 390 px (dark); page errors and horizontal scroll reported.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 for (const [w, scheme] of [[1200, 'light'], [390, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + path.join(__dirname, 'index.html'));
  await p.waitForTimeout(1500); await p.evaluate(() => document.querySelectorAll('img').forEach(i => i.loading = 'eager')); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-${scheme}.png`), fullPage: false });
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  console.log(w, scheme, JSON.stringify({ errors: errs, scrollWidth: sw })); await p.close(); }
 await b.close(); })();
