// node thumbs.js: every look (makers/<m>/renders/NN.png) and every final (shots/<m>.png), 1100x800 ->
// thumbs/<m>-NN.jpg and thumbs/<m>-final.jpg (440x320, quality 80) for the face.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
 const p = await b.newPage({ viewport: { width: 440, height: 320 } });
 const out = path.join(__dirname, 'thumbs'); fs.mkdirSync(out, { recursive: true });
 const jobs = [];
 for (const m of fs.readdirSync(path.join(__dirname, 'makers')).sort()) {
  const rd = path.join(__dirname, 'makers', m, 'renders');
  if (fs.existsSync(rd)) for (const f of fs.readdirSync(rd).filter(f => /^\d+\.png$/.test(f)).sort())
   jobs.push([path.join(rd, f), m + '-' + f.replace('.png', '.jpg')]);
  jobs.push([path.join(__dirname, 'shots', m + '.png'), m + '-final.jpg']);
 }
 for (const [src, name] of jobs) {
  const d = 'data:image/png;base64,' + fs.readFileSync(src).toString('base64');
  await p.setContent(`<body style="margin:0"><img src="${d}" style="width:440px;height:320px;display:block"></body>`);
  await p.screenshot({ path: path.join(out, name), type: 'jpeg', quality: 80 });
 }
 await b.close(); console.log(jobs.length);
})();
