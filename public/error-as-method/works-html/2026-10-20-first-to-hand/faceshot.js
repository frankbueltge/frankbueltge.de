// node faceshot.js <out-prefix>: screenshots the face at 1100 px light, 390 px dark, and with one work opened; prints page errors.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const pre = process.argv[2]; const f = process.env.FACE_URL || ('file://' + path.resolve(__dirname, 'index.html'));
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch()); const errs = [];
 for (const [w, scheme, tag] of [[1100, 'light', 'wide'], [390, 'dark', 'phone']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); p.on('pageerror', e => errs.push(String(e)));
  await p.goto(f); await p.waitForTimeout(800); await p.screenshot({ path: `${pre}-${tag}.png`, fullPage: true });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth); console.log(tag, 'scrollWidth', sw);
  if (tag === 'wide') { await p.click('.card'); await p.waitForTimeout(1500); await p.screenshot({ path: `${pre}-open.png` }); }
  await p.close(); }
 console.log(JSON.stringify({ errors: errs })); await b.close(); })();
