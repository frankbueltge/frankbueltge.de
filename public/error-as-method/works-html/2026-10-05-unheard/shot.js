// node shot.js out.png width [dark] [full] -- screenshots index.html; clicks a vote to check the reveal
const { chromium } = require('playwright'); const path = require('path');
(async () => { const [out, w, dark, full] = process.argv.slice(2);
 const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: +w, height: 900 }, colorScheme: dark === '1' ? 'dark' : 'light' });
 const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('requestfailed', r => errs.push('failed ' + r.url()));
 await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(600);
 if (full) { await p.click('#vote button[data-v="?"]'); await p.waitForTimeout(200); }
 const sw = await p.evaluate(() => document.documentElement.scrollWidth); console.log('scrollWidth', sw, 'viewport', w);
 await p.screenshot({ path: out, fullPage: !!full }); await b.close();
 if (errs.length) { console.error(errs.join('\n')); process.exit(1); } })();
