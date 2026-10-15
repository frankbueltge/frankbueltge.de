// node thumbs.js: half-size thumbnails of the twelve works for the face (thumbs/<m>.png, 550x400, rendered
// at device scale 0.5), and a contact sheet (seen/contact.html -> seen/contact.png) in plan order, for the
// practice's own look before the coder.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 0.5 }); const p = await ctx.newPage();
  fs.mkdirSync(path.join(__dirname, 'thumbs'), { recursive: true }); fs.mkdirSync(path.join(__dirname, 'seen'), { recursive: true });
  const ms = JSON.parse(fs.readFileSync(path.join(__dirname, 'plan.json'))).map(x => x.maker);
  for (const m of ms) { await p.goto('file://' + path.join(__dirname, 'makers', m, 'index.html')); await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(__dirname, 'thumbs', m + '.png') }); }
  fs.writeFileSync(path.join(__dirname, 'seen', 'contact.html'), '<body style="margin:0;display:grid;grid-template-columns:repeat(3,550px);gap:5px;font:14px sans-serif">' +
    ms.map(m => `<div style="position:relative"><img src="../thumbs/${m}.png" style="display:block;width:550px"><b style="position:absolute;left:4px;top:2px;background:#ff0;padding:1px 3px">${m}</b></div>`).join('') + '</body>');
  const q = await b.newPage({ viewport: { width: 1660, height: 1620 } });
  await q.goto('file://' + path.join(__dirname, 'seen', 'contact.html')); await q.waitForTimeout(500);
  await q.screenshot({ path: path.join(__dirname, 'seen', 'contact.png'), fullPage: true });
  await b.close(); console.log('ok');
})();
