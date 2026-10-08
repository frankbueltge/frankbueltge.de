// node shot.js <maker>: renders makers/<maker>/index.html at 1100x800 -> shots/<maker>.png and a second
// frame 3 s later -> shots/<maker>-t3.png, to check the brief's "still" (F-196). Prints errors and
// whether the two frames differ.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const m = process.argv[2]; const f = path.join(__dirname, 'makers', m, 'index.html');
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [];
 p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + f); await p.waitForTimeout(1500);
 fs.mkdirSync(path.join(__dirname, 'shots'), { recursive: true });
 const a = await p.screenshot({ path: path.join(__dirname, 'shots', m + '.png') });
 await p.waitForTimeout(3000); const c = await p.screenshot();
 const sw = await p.evaluate(() => [document.documentElement.scrollWidth, document.documentElement.scrollHeight]);
 console.log(JSON.stringify({ maker: m, bytes: fs.statSync(f).size, errors: errs, scroll: sw, still: a.equals(c) }));
 await b.close(); })();
