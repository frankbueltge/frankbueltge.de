// node shotc.js <C>: renders control/<C>/index.html at 1100x800 -> shots/<C>.png (the data tag's path was shortened by one level after copying, nothing else)
const { chromium } = require('playwright'); const path = require('path');
(async () => { const C = process.argv[2]; const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = []; p.on('pageerror', e => errs.push(String(e)));
 await p.goto('file://' + path.join(__dirname, 'control', C, 'index.html')); await p.waitForTimeout(1500);
 await p.screenshot({ path: path.join(__dirname, 'shots', C + '.png') }); console.log(C, errs); await b.close(); })();
