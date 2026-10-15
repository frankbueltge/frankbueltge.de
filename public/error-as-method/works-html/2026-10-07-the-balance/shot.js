// node shot.js <L> <k>: renders lineages/<L>/v<k>/index.html at 1100x800 -> shots/<L>-v<k>.png; prints bytes, page errors, scrollWidth
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const [L, k] = process.argv.slice(2); const f = path.join(__dirname, 'lineages', L, 'v' + k, 'index.html');
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [];
 p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + f); await p.waitForTimeout(1500);
 await p.screenshot({ path: path.join(__dirname, 'shots', `${L}-v${k}.png`) });
 const sw = await p.evaluate(() => document.documentElement.scrollWidth);
 console.log(JSON.stringify({ id: `${L}-v${k}`, bytes: fs.statSync(f).size, errors: errs, scrollWidth: sw }));
 await b.close(); })();
