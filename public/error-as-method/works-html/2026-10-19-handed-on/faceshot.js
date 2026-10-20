// node faceshot.js <url> <out-prefix>: screenshots the face at 1280 and at 390 px wide, reports page errors.
const { chromium } = require('playwright');
(async () => { const [url, out] = process.argv.slice(2);
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const errs = [];
 for (const [w, h] of [[1280, 900], [390, 844]]) { const p = await b.newPage({ viewport: { width: w, height: h } });
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(2500);
  await p.screenshot({ path: out + '-' + w + '.png', fullPage: true });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth); console.log(w, 'scrollWidth', sw); await p.close(); }
 console.log(JSON.stringify(errs)); await b.close(); })();
