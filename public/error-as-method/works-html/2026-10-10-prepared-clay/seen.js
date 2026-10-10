// node seen.js: renders the face at 1200 px (light) and 390 px (dark), before and after all guesses, to seen/,
// and reports page errors and horizontal overflow.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const out = [];
 for (const [w, scheme] of [[1200, 'light'], [390, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(700);
  await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-before.png`) });
  const bs = await p.$$('.w .ask button.k-T'); for (const x of bs) await x.click();
  await p.waitForTimeout(300); await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-after.png`), fullPage: true });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  out.push({ w, scheme, errors: errs, overflow: ov, score: await p.textContent('#score') }); }
 console.log(JSON.stringify(out, null, 1)); await b.close(); })();
