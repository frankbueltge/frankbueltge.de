// node check_js.js : regenerates out/*.wav with adapt.py's rules in JS and compares sample by sample
require('./adapters.js'); const fs = require('fs');
const q = JSON.parse(fs.readFileSync('series.json')).q; const A = WP.adapters(q); let bad = 0;
for (const k of Object.keys(A)) {
  const js = WP.toInt16(A[k]); const wav = fs.readFileSync(`out/${k}.wav`); const py = new Int16Array(wav.buffer.slice(wav.byteOffset + 44, wav.byteOffset + wav.length));
  let diff = 0; if (js.length !== py.length) diff = -1; else for (let i = 0; i < js.length; i++) if (js[i] !== py[i]) diff++;
  console.log(k, js.length, py.length, diff === 0 ? 'identical' : 'DIFFERS ' + diff); if (diff) bad = 1;
}
process.exit(bad);
