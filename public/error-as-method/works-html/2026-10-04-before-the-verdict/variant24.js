// V24: written from NORMS.md alone after the four batches (Session 106). Loaded after variants.js.
// N3 + N0.4 + N5: one line, left to right, every day the same width.  N2: linear, in ms, one scale for both marks.
// N1: two rhythms at once without one erasing the other -> the line's POSITION is the slow arc (centred
// 365-day mean of raw LOD) and its THICKNESS is the size of the fast wobble (centred 365-day mean of
// |tidal transform|), drawn as a band of +/- that size around the slow line.  N0.5: no legend; N0.4: two years.
function drawVariant(cv, D, i) {
  const cx = cv.getContext("2d"); cv.width = W; cv.height = H; cx.fillStyle = PAPER; cx.fillRect(0, 0, W, H);
  const slow = centredMean(D.lod, 365), tid = transform(D.lod, "tidal").map(Math.abs), env = centredMean(tid, 365);
  const T = dates(D), L = 60, R = W - 30, Tp = 30, B = H - 60;
  let lo = Infinity, hi = -Infinity; slow.forEach((s, k) => { lo = Math.min(lo, s - env[k]); hi = Math.max(hi, s + env[k]); });
  const X = k => L + T[k][2] * (R - L), Y = v => B - (v - lo) / (hi - lo) * (B - Tp);
  cx.fillStyle = INK; cx.beginPath();
  slow.forEach((s, k) => k ? cx.lineTo(X(k), Y(s + env[k])) : cx.moveTo(X(k), Y(s + env[k])));
  for (let k = slow.length - 1; k >= 0; k--) cx.lineTo(X(k), Y(slow[k] - env[k]));
  cx.closePath(); cx.fill();
  cx.fillStyle = MUTE; cx.font = "13px Georgia, serif";
  cx.fillText(String(T[0][0]), L, H - 34); const e = String(T[T.length - 1][0]); cx.fillText(e, R - cx.measureText(e).width, H - 34);
  cx.fillText("V24 · from the norms", L, H - 14);
}
