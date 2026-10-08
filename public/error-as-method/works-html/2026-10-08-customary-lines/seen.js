// node seen.js: the face at 1200 (light) and 390 (dark), before and after sorting -> seen/*.png; prints errors and overflow.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 fs.mkdirSync(path.join(__dirname, 'seen'), { recursive: true });
 for (const [w, scheme] of [[1200, 'light'], [390, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('failed ' + r.url()));
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-${scheme}.png`), fullPage: true });
  await p.click('#sort'); await p.waitForTimeout(500);
  await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-${scheme}-sorted.png`), fullPage: true });
  const sw = await p.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  console.log(JSON.stringify({ w, scheme, errs, scrollWidth: sw[0], innerWidth: sw[1] })); await p.close(); }
 await b.close(); })();
