// node diff.js: for every kept step vN -> vN+1, and v1 -> last, the share of the 1100 x 800 pixels whose largest
// channel difference exceeds 24 (of 255), from shots/*.png. Writes diff.json. The face computes the same from thumbs.
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => { const vs = fs.readFileSync(path.join(__dirname, 'versions.jsonl'), 'utf8').trim().split('\n').map(JSON.parse);
 const by = {}; for (const r of vs) (by[r.maker] = by[r.maker] || []).push(r.v);
 const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
 const url = (m, v) => 'data:image/png;base64,' + fs.readFileSync(path.join(__dirname, 'shots', `${m}-v${v}.png`)).toString('base64');
 const share = (a, c) => p.evaluate(async ([a, c]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
   const [x, y] = await Promise.all([ld(a), ld(c)]); const g = i => { const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 800;
   const k = cv.getContext('2d'); k.drawImage(i, 0, 0); return k.getImageData(0, 0, 1100, 800).data; };
   const A = g(x), B = g(y); let n = 0; for (let j = 0; j < A.length; j += 4)
   if (Math.max(Math.abs(A[j] - B[j]), Math.abs(A[j + 1] - B[j + 1]), Math.abs(A[j + 2] - B[j + 2])) > 24) n++; return n / (1100 * 800); }, [a, c]);
 const out = {}; for (const m of Object.keys(by).sort()) { const v = by[m].sort((a, b) => a - b); out[m] = { steps: [], first_to_last: null };
  for (let i = 0; i + 1 < v.length; i++) out[m].steps.push(+(await share(url(m, v[i]), url(m, v[i + 1]))).toFixed(4));
  if (v.length > 1) out[m].first_to_last = +(await share(url(m, v[0]), url(m, v[v.length - 1]))).toFixed(4); }
 fs.writeFileSync(path.join(__dirname, 'diff.json'), JSON.stringify(out, null, 1)); console.log(JSON.stringify(out)); await b.close(); })();
