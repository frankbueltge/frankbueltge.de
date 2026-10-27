// pixeldiff.js <root>: per cent of pixels in which each mutant's final.png differs from its own work's (Session 147,
// after Session 146's file, which compared every page with one parent).
const { chromium } = require('playwright'); const fs = require('fs');
(async () => {
  const R = process.argv[2]; const ids = ['c1','c2','c3','c4'].flatMap(c => ['o1','o2','o3','a'].map(s => c + s));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
  const uri = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64'); const out = {};
  for (const id of ids) {
    out[id] = await p.evaluate(async ([a, c]) => {
      const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      const [A, B] = await Promise.all([load(a), load(c)]); const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 800;
      const x = cv.getContext('2d'); x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, 1100, 800).data; x.clearRect(0,0,1100,800); x.drawImage(B, 0, 0);
      const db = x.getImageData(0, 0, 1100, 800).data; let n = 0;
      for (let i = 0; i < da.length; i += 4) { if (da[i] !== db[i] || da[i+1] !== db[i+1] || da[i+2] !== db[i+2]) n++; }
      return +(100 * n / (1100 * 800)).toFixed(3);
    }, [uri(R + '/rooms/' + id.slice(0, 2) + '/final.png'), uri(R + '/mutants/' + id + '/final.png')]);
  }
  await b.close(); console.log(JSON.stringify(out));
})();
