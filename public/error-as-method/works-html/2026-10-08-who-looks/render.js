// render.js <folder>: the viewer offered to makers in arms O and R (Session 117).
// Renders <folder>/index.html at 1100 x 800 to <folder>/renders/NN.png, keeps the html as it stood
// at that moment as renders/NN.html, and appends one line to renders/log.jsonl
// (n, time, bytes and sha256 of the html, page errors). It prints where the picture is.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const crypto = require('crypto');
(async () => {
  const dir = path.resolve(process.argv[2] || '.'); const f = path.join(dir, 'index.html');
  if (!fs.existsSync(f)) { console.log('no index.html in ' + dir); process.exit(1); }
  const out = path.join(dir, 'renders'); fs.mkdirSync(out, { recursive: true });
  const n = fs.readdirSync(out).filter(x => /^\d+\.png$/.test(x)).length + 1; const id = String(n).padStart(2, '0');
  const html = fs.readFileSync(f); fs.writeFileSync(path.join(out, id + '.html'), html);
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + f); await p.waitForTimeout(1200);
  const png = path.join(out, id + '.png'); await p.screenshot({ path: png }); await b.close();
  fs.appendFileSync(path.join(out, 'log.jsonl'), JSON.stringify({ n, time: new Date().toISOString(),
    bytes: html.length, sha256: crypto.createHash('sha256').update(html).digest('hex'), errors: errs }) + '\n');
  console.log('rendered: ' + png + (errs.length ? '\npage errors: ' + errs.join(' | ') : '\nno page errors'));
})();
