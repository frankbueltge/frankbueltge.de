// node faceshot.js: renders index.html at 1100x800 (light and dark) and at 390 px, opens the truth, logs errors.
const { chromium } = require('playwright'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 for (const [w, h, scheme] of [[1100, 800, 'light'], [1100, 800, 'dark'], [390, 844, 'light']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, colorScheme: scheme }); const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(800);
  await p.screenshot({ path: `/tmp/claude-0/s137/face-${w}-${scheme}.png` });
  await p.click('#reveal'); await p.waitForTimeout(300);
  await p.screenshot({ path: `/tmp/claude-0/s137/face-${w}-${scheme}-full.png`, fullPage: true });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify({ w, scheme, errs, scrollWidth: sw, cards: await p.$$eval('.card', r => r.length), paths: await p.$$eval('#hydro path', r => r.length) })); await ctx.close(); }
 await b.close(); })();
