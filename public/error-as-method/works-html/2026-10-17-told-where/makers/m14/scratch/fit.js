// Forward-model fit: recover y for each of 1464 hourly dots from the JPEG ink map.
const fs = require('fs');
const W = 300, H = 90, N = 1464;
const obs = JSON.parse(fs.readFileSync(__dirname + '/ink.json'));
const args = Object.fromEntries(process.argv.slice(2).map(a => a.split('=')).map(([k, v]) => [k, +v]));
const x0 = args.x0 ?? 3.5, x1 = args.x1 ?? 295.5, s = args.s ?? 0.65, A = args.A ?? 0.6;
const lam = args.lam ?? 0, sweeps = args.sweeps ?? 12, seed = args.seed ?? 1;
const dx = (x1 - x0) / (N - 1);
const xs = Array.from({ length: N }, (_, i) => x0 + dx * i);
const S = new Float64Array(W * H); // sum of log(1-a)
const R = 4;
function contrib(cx, cy, fn) {
  const px0 = Math.max(0, Math.floor(cx - R)), px1 = Math.min(W - 1, Math.ceil(cx + R));
  const py0 = Math.max(0, Math.floor(cy - R)), py1 = Math.min(H - 1, Math.ceil(cy + R));
  for (let py = py0; py <= py1; py++) for (let px = px0; px <= px1; px++) {
    const d2 = (px - cx) ** 2 + (py - cy) ** 2;
    const a = Math.min(0.98, A * Math.exp(-d2 / (2 * s * s)));
    if (a > 1e-4) fn(py * W + px, Math.log(1 - a));
  }
}
let rnd = seed; const rand = () => (rnd = (rnd * 16807) % 2147483647) / 2147483647;
const ys = new Float64Array(N).fill(83.5);
const fixed = new Uint8Array(N);
if (args.mid !== undefined) {
  for (let d = -1; d <= 61; d++) {
    const n = (args.na ?? 7.6) + (args.nb ?? 0.05) * d;
    const c = d * 24 + args.mid + (args.md ?? 0) * d; // solar midnight index (fractional)
    for (let i = Math.ceil(c - n / 2); i <= Math.floor(c + n / 2 - 1e-9); i++) if (i >= 0 && i < N) fixed[i] = 1;
  }
}
for (let i = 0; i < N; i++) contrib(xs[i], ys[i], (k, l) => S[k] += l);
const cand = []; for (let y = 1; y <= 88.5; y += 0.25) cand.push(y);
function err(k, Sk) { const m = 1 - Math.exp(Sk); return (m - obs[k]) ** 2; }
function total() { let e = 0; for (let k = 0; k < W * H; k++) e += err(k, S[k]); return e; }
for (let sw = 0; sw < sweeps; sw++) {
  const order = Array.from({ length: N }, (_, i) => i).sort(() => rand() - 0.5);
  for (const i of order) {
    if (fixed[i]) continue;
    contrib(xs[i], ys[i], (k, l) => S[k] -= l);
    let best = Infinity, by = ys[i];
    for (const cy of cand) {
      let d = 0;
      contrib(xs[i], cy, (k, l) => { d += err(k, S[k] + l) - err(k, S[k]); });
      if (lam) {
        if (i > 0) d += lam * (cy - ys[i - 1]) ** 2;
        if (i < N - 1) d += lam * (cy - ys[i + 1]) ** 2;
      }
      if (d < best) { best = d; by = cy; }
    }
    ys[i] = by;
    contrib(xs[i], ys[i], (k, l) => S[k] += l);
  }
  console.error('sweep', sw, 'err', total().toFixed(3));
}
console.log(JSON.stringify({ x0, x1, s, A, lam, err: total(), fixed: Array.from(fixed), ys: Array.from(ys) }));
