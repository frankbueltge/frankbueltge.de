// node noise.js: the noise floor of diff.js. Each kept version is rendered a second time (a fresh page load) and
// compared with its kept shot by the same rule. Makers' pages call Math.random, so a version can differ from itself.
// Writes noise.json: per maker, per version, the share of pixels that differ between two renders of the same file.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path'); const os = require('os');
(async () => { const vs = fs.readFileSync(path.join(__dirname, 'versions.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nz'));
 fs.copyFileSync(path.join(__dirname, 'data.js'), path.join(tmp, 'data.js')); const out = {};
 for (const r of vs) { fs.copyFileSync(path.join(__dirname, 'makers', r.maker, 'v' + r.v, 'index.html'), path.join(tmp, 'index.html'));
  const p = await b.newPage({ viewport: { width: 1100, height: 800 } }); await p.goto('file://' + path.join(tmp, 'index.html')); await p.waitForTimeout(1500);
  const again = (await p.screenshot()).toString('base64'); await p.close();
  const kept = fs.readFileSync(path.join(__dirname, 'shots', `${r.maker}-v${r.v}.png`)).toString('base64');
  const q = await b.newPage(); const share = await q.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = 'data:image/png;base64,' + s; });
   const [x, y] = await Promise.all([ld(a), ld(c)]); const g = i => { const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 800; const k = cv.getContext('2d'); k.drawImage(i, 0, 0); return k.getImageData(0, 0, 1100, 800).data; };
   const A = g(x), B = g(y); let n = 0; for (let j = 0; j < A.length; j += 4) if (Math.max(Math.abs(A[j]-B[j]), Math.abs(A[j+1]-B[j+1]), Math.abs(A[j+2]-B[j+2])) > 24) n++; return n / 880000; }, [kept, again]);
  await q.close(); (out[r.maker] = out[r.maker] || {})['v' + r.v] = +share.toFixed(4); }
 fs.writeFileSync(path.join(__dirname, 'noise.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
