// rebind.js <parent-dir> <out-dir> : makes the night's 24 mutants of the parent (seed 145). Each mutant is a
// copy of the parent's folder whose data/elements.js has had its columns swapped by rebind-core.js.
// The parent's index.html is copied unchanged. Writes <out-dir>/mutants.json.
const fs = require('fs'), path = require('path'), R = require('./rebind-core.js');
const [pd, od] = process.argv.slice(2).map(p => path.resolve(p));
const F = JSON.parse(fs.readFileSync(path.join(__dirname, 'fields.json')));
const src = fs.readFileSync(path.join(pd, 'data', 'elements.js'), 'utf8');
const ELEMENTS = JSON.parse(src.slice(src.indexOf('['), src.lastIndexOf(']') + 1));
const html = fs.readFileSync(path.join(pd, 'index.html'), 'utf8'), read = R.readBy(html, F);
const M = R.night(145, F, read);
for (const m of M) {
  const d = path.join(od, m.id); fs.cpSync(pd, d, { recursive: true, filter: s => !/renders|final\.png/.test(path.relative(pd, s)) });
  fs.writeFileSync(path.join(d, 'data', 'elements.js'), 'const ELEMENTS = ' + JSON.stringify(R.apply(ELEMENTS, m.swaps)) + ';\n');
}
fs.writeFileSync(path.join(od, 'mutants.json'), JSON.stringify({ seed: 145, read, mutants: M }, null, 1));
console.log('read by the parent:', read.join(', ')); for (const m of M) console.log(m.id, m.swaps.map(s => s.join('<->')).join(' ; '));
