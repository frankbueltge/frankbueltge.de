// node render.js: materials/G*/plot.svg -> materials/G*/record.jpg, each rendered at its own size and saved as
// JPEG quality 30. The size is the only thing that changes between the four grains.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const M = path.join(__dirname, 'materials');
 for (const [g, w, h] of [['G1', 1200, 360], ['G2', 300, 90], ['G3', 75, 23], ['G4', 19, 6]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.setContent('<html><body style="margin:0">' + fs.readFileSync(path.join(M, g, 'plot.svg'), 'utf8') + '</body></html>');
  await p.screenshot({ path: path.join(M, g, 'record.jpg'), type: 'jpeg', quality: 30 }); await p.close();
  console.log(g, fs.statSync(path.join(M, g, 'record.jpg')).size); }
 await b.close(); })();
