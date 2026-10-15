// The variant generator. Written and committed BEFORE the material was fetched (Session 106).
// Twenty-four variants of one daily series: 4 layouts x 3 transforms x 2 scales.
// Data interface, fixed in advance: D = { start: "YYYY-MM-DD", lod: [ms, ms, ...] } one value per day.
// Variant id i = layout*6 + transform*2 + scale.
const LAYOUTS = ["line", "strip", "spiral", "decades"];
const TRANSFORMS = ["raw", "seasonal", "tidal"];   // raw; minus centred 365-day mean; minus centred 31-day mean
const SCALES = ["linear", "rank"];
const W = 1100, H = 700;
const PAPER = "#f4efe6", INK = "#1d1b18", MUTE = "#8a8278";
const LOW = [47, 74, 94], MID = [239, 232, 218], HIGH = [156, 47, 34];

function variantParams(i) {
  return { id: i, layout: LAYOUTS[Math.floor(i / 6)], transform: TRANSFORMS[Math.floor(i / 2) % 3], scale: SCALES[i % 2] };
}
function centredMean(a, w) {
  const h = Math.floor(w / 2), out = new Array(a.length), c = [0];
  for (let k = 0; k < a.length; k++) c.push(c[k] + a[k]);
  for (let k = 0; k < a.length; k++) { const lo = Math.max(0, k - h), hi = Math.min(a.length, k + h + 1); out[k] = (c[hi] - c[lo]) / (hi - lo); }
  return out;
}
function transform(a, t) {
  if (t === "raw") return a.slice();
  const m = centredMean(a, t === "seasonal" ? 365 : 31);
  return a.map((v, k) => v - m[k]);
}
function scaler(v, s) {           // returns f(value) -> 0..1
  if (s === "linear") { let lo = Infinity, hi = -Infinity; v.forEach(x => { if (x < lo) lo = x; if (x > hi) hi = x; }); return x => (x - lo) / ((hi - lo) || 1); }
  const sorted = v.slice().sort((a, b) => a - b);
  return x => { let lo = 0, hi = sorted.length; while (lo < hi) { const m = (lo + hi) >> 1; if (sorted[m] < x) lo = m + 1; else hi = m; } return lo / (sorted.length - 1); };
}
function ramp(u) {
  u = Math.max(0, Math.min(1, u)); const [a, b, f] = u < 0.5 ? [LOW, MID, u * 2] : [MID, HIGH, (u - 0.5) * 2];
  return `rgb(${a.map((x, k) => Math.round(x + (b[k] - x) * f)).join(",")})`;
}
function dates(D) {               // [year, dayOfYear 0..365, fraction of whole span]
  const t0 = Date.parse(D.start + "T00:00:00Z"), n = D.lod.length;
  return D.lod.map((_, k) => { const d = new Date(t0 + k * 864e5), y = d.getUTCFullYear();
    return [y, Math.floor((d - Date.UTC(y, 0, 1)) / 864e5), k / (n - 1)]; });
}
function drawVariant(cv, D, i) {
  const p = variantParams(i), cx = cv.getContext("2d");
  cv.width = W; cv.height = H; cx.fillStyle = PAPER; cx.fillRect(0, 0, W, H);
  const v = transform(D.lod, p.transform), f = scaler(v, p.scale), T = dates(D);
  const L = 40, R = W - 20, Tp = 20, B = H - 40;
  if (p.layout === "line") {
    cx.strokeStyle = INK; cx.lineWidth = 0.6; cx.beginPath();
    v.forEach((x, k) => { const X = L + T[k][2] * (R - L), Y = B - f(x) * (B - Tp); k ? cx.lineTo(X, Y) : cx.moveTo(X, Y); });
    cx.stroke();
  } else if (p.layout === "strip") {
    const y0 = T[0][0], ny = T[T.length - 1][0] - y0 + 1, cw = (R - L) / 366, ch = (B - Tp) / ny;
    v.forEach((x, k) => { cx.fillStyle = ramp(f(x)); cx.fillRect(L + T[k][1] * cw, Tp + (T[k][0] - y0) * ch, Math.ceil(cw), Math.ceil(ch)); });
  } else if (p.layout === "spiral") {
    const ox = W / 2, oy = (Tp + B) / 2, r0 = 30, r1 = (B - Tp) / 2;
    v.forEach((x, k) => { const a = T[k][1] / 366 * 2 * Math.PI - Math.PI / 2, r = r0 + T[k][2] * (r1 - r0);
      cx.fillStyle = ramp(f(x)); cx.fillRect(ox + r * Math.cos(a) - 1, oy + r * Math.sin(a) - 1, 2, 2); });
  } else {                        // decades: one row per decade, shared vertical scale
    const d0 = Math.floor(T[0][0] / 10) * 10, nd = Math.floor(T[T.length - 1][0] / 10) * 10 - d0 / 1 + 10, rows = nd / 10, rh = (B - Tp) / rows;
    cx.strokeStyle = INK; cx.lineWidth = 0.6; let cur = -1;
    v.forEach((x, k) => { const row = Math.floor((T[k][0] - d0) / 10), within = ((T[k][0] - d0) % 10 * 366 + T[k][1]) / 3660;
      const X = L + within * (R - L), Y = Tp + row * rh + rh - f(x) * (rh - 6);
      if (row !== cur) { cx.stroke(); cx.beginPath(); cx.moveTo(X, Y); cur = row; } else cx.lineTo(X, Y); });
    cx.stroke();
  }
  cx.fillStyle = MUTE; cx.font = "13px Georgia, serif";
  cx.fillText(`V${String(i).padStart(2, "0")} · ${p.layout} · ${p.transform} · ${p.scale}`, L, H - 14);
}
if (typeof module !== "undefined") module.exports = { variantParams, drawVariant, LAYOUTS, TRANSFORMS, SCALES };
