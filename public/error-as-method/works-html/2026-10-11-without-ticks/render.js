// node render.js: materials/births.svg -> births.png (PNG, 1100x500) and materials/lossy.svg -> births.jpg
// (480x220, JPEG quality 20). The JPEG is the lossy preparation: small, compressed, with nothing to calibrate by.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const M = path.join(__dirname, 'materials');
 for (const [src, out, w, h, opt] of [['births.svg', 'births.png', 1100, 500, { type: 'png' }], ['lossy.svg', 'births.jpg', 480, 220, { type: 'jpeg', quality: 20 }]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent('<html><body style="margin:0">' + fs.readFileSync(path.join(M, src), 'utf8') + '</body></html>');
  await p.screenshot(Object.assign({ path: path.join(M, out) }, opt)); await p.close(); console.log(out, fs.statSync(path.join(M, out)).size); }
 await b.close(); })();
