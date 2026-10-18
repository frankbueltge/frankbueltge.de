// node faceshot.js: renders index.html at 1280 wide (light and dark, ledger closed and open) and at 390 wide, checks
// for script errors and horizontal overflow, and writes the frames to /tmp/claude-0/s133/face-*.png (not committed).
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 for (const [w, scheme] of [[1280, 'light'], [1280, 'dark'], [390, 'light']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: `/tmp/claude-0/s133/face-${w}-${scheme}.png` });
  await p.click('#open'); await p.waitForTimeout(400);
  await p.screenshot({ path: `/tmp/claude-0/s133/face-${w}-${scheme}-open.png`, fullPage: w < 400 ? false : false });
  const ov = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  console.log(w, scheme, 'errors', errs.length, errs[0] || '', 'overflow', ov); await p.close(); }
 await b.close(); })();
