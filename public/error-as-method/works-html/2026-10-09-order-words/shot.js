// shot.js <out-dir> <stage> [jpg]: renders makers/*/<stage>/index.html at 1100 x 800 with the shared data.js
// to <out-dir>/<maker>.png. Not the makers' viewer: a separate pass, so its renders are not counted as looks.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const out = path.resolve(process.argv[2]); const stage = process.argv[3]; fs.mkdirSync(out, { recursive: true });
  const here = __dirname; const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  for (const m of fs.readdirSync(path.join(here, 'makers')).sort()) {
    const dir = path.join(here, 'makers', m, stage); if (!fs.existsSync(path.join(dir, 'index.html'))) continue;
    fs.copyFileSync(path.join(here, 'data.js'), path.join(dir, 'data.js'));
    const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [];
    p.on('pageerror', e => errs.push(String(e)));
    await p.goto('file://' + path.join(dir, 'index.html')); await p.waitForTimeout(1500);
    const jpg = process.argv[4] === 'jpg'; await p.screenshot(jpg ? { path: path.join(out, m + '.jpg'), type: 'jpeg', quality: 72 } : { path: path.join(out, m + '.png') }); await p.close();
    fs.unlinkSync(path.join(dir, 'data.js'));
    console.log(m, errs.length ? 'errors: ' + errs.join(' | ') : 'ok');
  }
  await b.close();
})();
