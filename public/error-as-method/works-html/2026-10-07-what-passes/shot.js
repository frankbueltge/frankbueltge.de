// node shot.js -> seen/face-1100.png, seen/face-390.png; fails on page errors or horizontal scroll
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch()); let bad = 0;
 for (const w of [1100, 390]) { const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(500);
  await p.click('.tabs button[data-a="A5"]'); await p.waitForTimeout(300);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  await p.screenshot({ path: `seen/face-${w}.png`, fullPage: true });
  console.log(w, 'scrollWidth', sw, 'errors', errs.length, errs.join(' | ')); if (errs.length || sw > w) bad = 1; }
 await b.close(); process.exit(bad); })();
