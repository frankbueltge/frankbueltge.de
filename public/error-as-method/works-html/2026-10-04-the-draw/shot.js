// node shot.js out.png width [dark]  -- screenshots index.html, full page
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [out, w, dark] = process.argv.slice(2);
 const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 }, colorScheme: dark ? 'dark' : 'light' });
 const errs = []; p.on('pageerror', e => errs.push(String(e)));
 await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(500);
 const sw = await p.evaluate(() => document.documentElement.scrollWidth); console.log('scrollWidth', sw);
 await p.screenshot({ path: out, fullPage: !!process.argv[5] }); await b.close();
 if (errs.length) { console.error(errs.join('\n')); process.exit(1); } })();
