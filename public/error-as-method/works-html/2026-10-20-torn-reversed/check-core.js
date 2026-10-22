// check-core.js: mutate-core.js must reproduce the night's twelve mutants (rooms/mutants/mNN/index.html) byte for byte.
const fs = require('fs'), path = require('path'); const core = require('./mutate-core.js');
const parent = fs.readFileSync(path.join(__dirname, 'rooms/c4/index.html'), 'utf8'); let ok = 0;
for (const m of core.night(parent, 144)) { const want = fs.readFileSync(path.join(__dirname, 'rooms/mutants', m.id, 'index.html'), 'utf8');
  const same = want === m.src; ok += same; console.log(m.id, m.op, m.n, same ? 'identical' : 'DIFFERS'); }
console.log(ok + ' of 12 identical'); process.exit(ok === 12 ? 0 : 1);
