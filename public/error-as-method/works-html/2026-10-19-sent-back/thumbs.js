// node thumbs.js: writes thumbs/<maker>-v<n>.jpg (550 x 400, JPEG 72) from shots/*.png for the face.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
 const p = await b.newPage({ viewport: { width: 550, height: 400 } }); fs.mkdirSync(path.join(__dirname, 'thumbs'), { recursive: true });
 for (const f of fs.readdirSync(path.join(__dirname, 'shots')).filter(x => x.endsWith('.png'))) {
  await p.setContent(`<body style="margin:0"><img src="data:image/png;base64,${fs.readFileSync(path.join(__dirname, "shots", f)).toString("base64")}" width=550 height=400></body>`);
  await p.waitForTimeout(100);
  await p.screenshot({ path: path.join(__dirname, 'thumbs', f.replace('.png', '.jpg')), type: 'jpeg', quality: 72 }); }
 await b.close(); })();
