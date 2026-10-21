// rebind.js <parent-dir> <out-dir> : makes the night's 24 mutants of the parent (seed 146; Session 145's file with
// the table's name changed). Each mutant is a copy of the parent's folder whose data/dogs.js has had its columns
// swapped by rebind-core.js; data/dogs.csv is removed from the mutant, so that the page's folder holds one table.
// The parent's index.html is copied unchanged. Writes <out-dir>/mutants.json.
const fs = require('fs'), path = require('path'), R = require('./rebind-core.js');
const [pd, od] = process.argv.slice(2).map(p => path.resolve(p));
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'fields.json')));
const src = fs.readFileSync(path.join(pd, 'data', 'dogs.js'), 'utf8');
const DOGS = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
const html = fs.readFileSync(path.join(pd, 'index.html'), 'utf8'), read = R.readBy(html, F);
const M = R.night(146, F, read);
for (const m of M) {
  const d = path.join(od, m.id); fs.cpSync(pd, d, { recursive: true, filter: s => !/renders|final\.png|dogs\.csv/.test(path.relative(pd, s)) });
  fs.writeFileSync(path.join(d, 'data', 'dogs.js'), 'const DOGS = ' + JSON.stringify(R.apply(DOGS, m.swaps)) + ';\n');
}
fs.writeFileSync(path.join(od, 'mutants.json'), JSON.stringify({ seed: 146, read, mutants: M }, null, 1));
console.log('read by the parent:', read.join(', ')); for (const m of M) console.log(m.id, m.swaps.map(s => s.join('<->')).join(' ; '));
