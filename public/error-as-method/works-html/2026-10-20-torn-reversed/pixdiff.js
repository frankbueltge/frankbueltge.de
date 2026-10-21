// pixdiff.js: share of pixels each mutant's and each A variant's final render differs from the parent's (any channel > 8).
const { chromium } = require('playwright'); const fs = require('fs'), path = require('path');
(async () => { const H = __dirname, par = path.join(H, 'rooms/c4/final.png');
  const ks = ['a1','a2','a3','a4', ...Array.from({length:12},(_, i)=>'m'+String(i+1).padStart(2,'0'))];
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage(); const out = {};
  const u = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  for (const k of ks) { const f = path.join(H, 'rooms', k.startsWith('m') ? 'mutants/' + k : k, 'final.png');
    out[k] = await p.evaluate(async ([A, B]) => { const ld = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      const [a, bb] = await Promise.all([ld(A), ld(B)]); const c = document.createElement('canvas'); c.width = a.width; c.height = a.height; const x = c.getContext('2d');
      x.drawImage(a, 0, 0); const da = x.getImageData(0, 0, c.width, c.height).data; x.clearRect(0,0,c.width,c.height); x.drawImage(bb, 0, 0);
      const db = x.getImageData(0, 0, c.width, c.height).data; let n = 0;
      for (let i = 0; i < da.length; i += 4) if (Math.abs(da[i]-db[i]) > 8 || Math.abs(da[i+1]-db[i+1]) > 8 || Math.abs(da[i+2]-db[i+2]) > 8) n++;
      return +(100 * n / (c.width * c.height)).toFixed(3); }, [u(par), u(f)]); }
  await b.close(); fs.writeFileSync(path.join(H, 'pixdiff.json'), JSON.stringify(out, null, 1)); console.log(out); })();
