// Turn fitC (pixel heights) into 1464 integer values 0..80, with order inside each
// ~2-hour neighbourhood (below the picture's horizontal resolution) chosen for smoothness.
const f = require('./fitC.json');
const v = f.ys.map((y, i) => f.fixed[i] ? 0 : Math.max(0, 83.5 - y));
const N = v.length;
const rough = (a, b) => (a - b) ** 2;
const local = i => (i > 0 ? rough(v[i - 1], v[i]) : 0) + (i < N - 1 ? rough(v[i], v[i + 1]) : 0);
for (let pass = 0; pass < 20; pass++) {
  let changed = 0;
  for (let i = 0; i < N; i++) for (let j = i + 1; j <= i + 2 && j < N; j++) {
    if (f.fixed[i] || f.fixed[j]) continue;
    const before = local(i) + local(j);
    [v[i], v[j]] = [v[j], v[i]];
    const after = local(i) + local(j);
    if (after < before - 1e-9) changed++; else [v[i], v[j]] = [v[j], v[i]];
  }
  if (!changed) break;
}
const q = v.map(x => Math.round(Math.min(80, x)));
require('fs').writeFileSync(__dirname + '/values.txt', q.join(','));
console.log('max', Math.max(...q), 'zeros', q.filter(x => !x).length);
