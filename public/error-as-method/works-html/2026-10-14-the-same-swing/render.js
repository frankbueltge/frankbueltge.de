// node render.js: materials/{F,C}/plot.svg -> materials/{F,C}/record.jpg, each rendered at its own size and saved
// as JPEG quality 30 (Session 122's render.js, two grains).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const M = path.join(__dirname, 'materials');
 for (const [g, w, h] of [['F', 300, 90], ['C', 40, 12]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent('<html><body style="margin:0">' + fs.readFileSync(path.join(M, g, 'plot.svg'), 'utf8') + '</body></html>');
  await p.screenshot({ path: path.join(M, g, 'record.jpg'), type: 'jpeg', quality: 30 }); await p.close();
  console.log(g, fs.statSync(path.join(M, g, 'record.jpg')).size); }
 await b.close(); })();
