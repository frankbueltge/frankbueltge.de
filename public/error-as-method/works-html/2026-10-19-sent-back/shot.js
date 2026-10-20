// node shot.js <index.html> <out.png>: renders one kept version at 1100 x 800 after 1.5 s; prints page errors
// and whether a second frame 3 s later is the same (the brief asks for a still image).
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const [f, png] = process.argv.slice(2); fs.mkdirSync(path.dirname(png), { recursive: true });
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [];
 p.on('pageerror', e => errs.push(String(e))); await p.goto('file://' + path.resolve(f)); await p.waitForTimeout(1500);
 const a = await p.screenshot({ path: png }); await p.waitForTimeout(3000); const c = await p.screenshot();
 console.log(JSON.stringify({ errors: errs, still: a.equals(c) })); await b.close(); })();
