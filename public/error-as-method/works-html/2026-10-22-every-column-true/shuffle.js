// shuffle.js <rooms-dir> <out-dir> : makes the night's 16 mutants, four of each family work c1-c4, in that order,
// from one stream (seed 147). Each mutant is a copy of the work's folder whose data/bridges.js has had the plan's
// columns shuffled by shuffle-core.js; data/bridges.csv is removed from the mutant, so that the page's folder holds
// one table. The work's index.html is copied unchanged. Writes <out-dir>/mutants.json (plans, not permutations;
// the permutations are re-derivable from the seed).
const fs = require('fs'), path = require('path'), S = require('./shuffle-core.js');
const [rd, od] = process.argv.slice(2).map(p => path.resolve(p));
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'fields.json')));
const rand = S.mulberry32(147), all = [];
for (const w of ['c1', 'c2', 'c3', 'c4']) {
  const wd = path.join(rd, w), src = fs.readFileSync(path.join(wd, 'data', 'bridges.js'), 'utf8');
  const B = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
  const read = S.readBy(fs.readFileSync(path.join(wd, 'index.html'), 'utf8'), F);
  for (const m of S.plan(rand, w, read)) {
    const d = path.join(od, m.id);
    fs.cpSync(wd, d, { recursive: true, filter: s => !/renders|final\.png|bridges\.csv/.test(path.relative(wd, s)) });
    fs.writeFileSync(path.join(d, 'data', 'bridges.js'), 'const BRIDGES = ' + JSON.stringify(S.apply(B, m.cols, rand).rows) + ';\n');
    m.read = read; all.push(m); console.log(m.id, m.arm, m.cols.join(', '));
  }
}
fs.writeFileSync(path.join(od, 'mutants.json'), JSON.stringify({ seed: 147, mutants: all }, null, 1));
