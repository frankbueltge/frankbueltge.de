// The six adapters of adapt.py, ported so the page can sound them. check_js.js proves the port
// writes the same 16-bit samples as the WAVs the ear read.
(function (root) {
  function interp(x, k) {
    if (k === 1) return x.slice();
    const out = new Float64Array((x.length - 1) * k + 1); let n = 0;
    for (let i = 0; i < x.length - 1; i++) { const a = x[i], b = x[i + 1]; for (let j = 0; j < k; j++) out[n++] = a + (b - a) * j / k; }
    out[n] = x[x.length - 1]; return Array.from(out);
  }
  function daymean(q, w) {
    w = w || 96; const h = w >> 1, n = q.length, pre = [0];
    for (const v of q) pre.push(pre[pre.length - 1] + v);
    const out = [];
    for (let i = 0; i < n; i++) { const lo = Math.max(0, i - h), hi = Math.min(n, i + h); out.push((pre[hi] - pre[lo]) / (hi - lo)); }
    return out;
  }
  function adapters(q) {
    let lo = Infinity, hi = -Infinity; for (const v of q) { if (v < lo) lo = v; if (v > hi) hi = v; }
    const lin = q.map(v => 2 * (v - lo) / (hi - lo) - 1);
    const m = daymean(q); const h = q.map((v, i) => v - m[i]);
    let hm = 0; for (const v of h) hm = Math.max(hm, Math.abs(v)); const hn = h.map(v => v / hm);
    const d = []; for (let i = 0; i < q.length - 1; i++) d.push(q[i + 1] - q[i]);
    let dm = 0; for (const v of d) dm = Math.max(dm, Math.abs(v));
    return { A1: lin, A2: interp(lin, 4), A3: interp(lin, 226), A4: hn, A5: d.map(v => v / dm), A6: interp(hn, 226) };
  }
  // Python's round() is round-half-to-even; match it so the samples are identical.
  function pyround(v) { const f = Math.floor(v), r = v - f; if (r > 0.5) return f + 1; if (r < 0.5) return f; return (f % 2 === 0) ? f : f + 1; }
  function toInt16(x) { const o = new Int16Array(x.length); for (let i = 0; i < x.length; i++) o[i] = pyround(Math.max(-1, Math.min(1, x[i])) * 32767); return o; }
  root.WP = { adapters, toInt16 };
})(typeof window !== 'undefined' ? window : globalThis);
