// node thumbs.js: shots/<maker>.png (1100x800) -> thumbs/<maker>.jpg (550x400, quality 82) for the face.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 550, height: 400 } });
 fs.mkdirSync(path.join(__dirname, 'thumbs'), { recursive: true });
 for (const f of fs.readdirSync(path.join(__dirname, 'shots')).filter(f => f.endsWith('.png')).sort()) {
  const src = 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'shots', f)).toString('base64');
  await p.setContent(`<body style="margin:0"><img src="${src}" style="width:550px;height:400px;display:block"></body>`);
  await p.screenshot({ path: path.join(__dirname, 'thumbs', f.replace('.png', '.jpg')), type: 'jpeg', quality: 82 });
 }
 await b.close(); })();
