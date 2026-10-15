// node thumbs.js: half-size thumbnails of the twelve works for the face (thumbs/<m>.png, 550x400, device scale 0.5).
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => {
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const ctx = await b.newContext({ viewport: { width: 1100, height: 800 }, deviceScaleFactor: 0.5 }); const p = await ctx.newPage();
  fs.mkdirSync(path.join(__dirname, 'thumbs'), { recursive: true });
  for (const m of JSON.parse(fs.readFileSync(path.join(__dirname, 'plan.json'))).map(x => x.maker)) {
    await p.goto('file://' + path.join(__dirname, 'makers', m, 'index.html')); await p.waitForTimeout(800);
    await p.screenshot({ path: path.join(__dirname, 'thumbs', m + '.png') }); }
  await b.close(); console.log('ok'); })();
