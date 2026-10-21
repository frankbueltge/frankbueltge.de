// pixeldiff.js <root>: pixel difference of each page's final.png from the parent's (c2), in a headless browser (Session 146)
const { chromium } = require('playwright'); const fs = require('fs'); const path = require('path');
(async () => {
  const R = process.argv[2]; const ids = ['c1','c3','c4'].concat([...'uts'].flatMap(a => [1,2,3,4,5,6,7,8].map(i => a + i)));
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); const p = await b.newPage();
  const uri = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');
  const parent = uri(R + '/rooms/c2/final.png'); const out = {};
  for (const id of ids) {
    const f = (id[0] === 'c' ? R + '/rooms/' : R + '/mutants/') + id + '/final.png';
    out[id] = await p.evaluate(async ([a, c]) => {
      const load = s => new Promise(r => { const i = new Image(); i.onload = () => r(i); i.src = s; });
      const [A, B] = await Promise.all([load(a), load(c)]); const cv = document.createElement('canvas'); cv.width = 1100; cv.height = 800;
      const x = cv.getContext('2d'); x.drawImage(A, 0, 0); const da = x.getImageData(0, 0, 1100, 800).data; x.clearRect(0,0,1100,800); x.drawImage(B, 0, 0);
      const db = x.getImageData(0, 0, 1100, 800).data; let n = 0, dark = 0;
      for (let i = 0; i < da.length; i += 4) { if (da[i] !== db[i] || da[i+1] !== db[i+1] || da[i+2] !== db[i+2]) n++; }
      return +(100 * n / (1100 * 800)).toFixed(3);
    }, [parent, uri(f)]);
  }
  await b.close(); console.log(JSON.stringify(out));
})();
