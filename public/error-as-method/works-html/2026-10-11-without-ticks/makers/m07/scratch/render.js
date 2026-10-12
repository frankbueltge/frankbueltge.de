// Shared renderer: used inline in index.html and by preview.js under node.
// enc: run-length encoded ink field, one source pixel column per '|' segment.
function decodeInk(enc) {
  var segs = enc.split('|'), cols = [];
  for (var c = 0; c < segs.length; c++) {
    var s = segs[c], col = [], num = '';
    for (var i = 0; i < s.length; i++) {
      var ch = s[i];
      if (ch >= '0' && ch <= '9') { num += ch; continue; }
      var n = num ? parseInt(num, 10) : 1, v = (ch.charCodeAt(0) - 97) / 25;
      for (var k = 0; k < n; k++) col.push(v);
      num = '';
    }
    cols.push(col);
  }
  return cols;
}

var G = {
  W: 1100, H: 800,
  PX0: 92, PW: 880,          // Jan 1 .. Dec 31
  PY0: 132, PH: 600,         // VMAX .. VMIN
  VMAX: 16200, VMIN: 5400,
  DAYS_PER_COL: 5479 / 1000,
  BIRTHS_PER_ROW: 12000 / 430
};
function xOf(t) { return G.PX0 + t * G.PW; }
function yOf(v) { return G.PY0 + (G.VMAX - v) / (G.VMAX - G.VMIN) * G.PH; }

function yearColor(yr) {
  // 2000 -> ember, 2007 -> pale straw, 2014 -> cold blue
  var stops = [[0, [1.00, 0.42, 0.16]], [0.5, [1.00, 0.86, 0.58]], [1, [0.36, 0.62, 1.00]]];
  var t = (yr - 2000) / 14, a = stops[0], b = stops[1];
  if (t > 0.5) { a = stops[1]; b = stops[2]; }
  var u = (t - a[0]) / (b[0] - a[0]);
  return [0, 1, 2].map(function (i) { return a[1][i] + (b[1][i] - a[1][i]) * u; });
}

function renderInk(enc, W, H) {
  var cols = decodeInk(enc);
  var R = new Float32Array(W * H), Gc = new Float32Array(W * H), B = new Float32Array(W * H), D = new Float32Array(W * H);
  var t0 = Date.UTC(2000, 0, 1);
  function splat(x0, x1, y0, y1, w, col) {
    var xa = Math.max(0, Math.floor(x0)), xb = Math.min(W - 1, Math.ceil(x1) - 1);
    var ya = Math.max(0, Math.floor(y0)), yb = Math.min(H - 1, Math.ceil(y1) - 1);
    for (var y = ya; y <= yb; y++) {
      var cy = Math.min(y + 1, y1) - Math.max(y, y0);
      if (cy <= 0) continue;
      for (var x = xa; x <= xb; x++) {
        var cx = Math.min(x + 1, x1) - Math.max(x, x0);
        if (cx <= 0) continue;
        var a = w * cx * cy, p = y * W + x;
        D[p] += a; R[p] += a * col[0]; Gc[p] += a * col[1]; B[p] += a * col[2];
      }
    }
  }
  for (var c = 1; c < cols.length; c++) {
    var day = (c + 0.5) * G.DAYS_PER_COL - 0.5;
    var ms = t0 + day * 864e5, dt = new Date(ms), yr = dt.getUTCFullYear();
    var ys = Date.UTC(yr, 0, 1), yl = (Date.UTC(yr + 1, 0, 1) - ys) / 864e5;
    var t = (ms - ys) / 864e5 / yl, hw = G.DAYS_PER_COL / 2 / yl;
    var color = yearColor(yr), col = cols[c];
    for (var r = 0; r < col.length; r++) {
      var w = col[r];
      if (!w) continue;
      var v = 17000 - (r + 21 + 0.5 - 20) * G.BIRTHS_PER_ROW;
      var ya = yOf(v + G.BIRTHS_PER_ROW / 2), yb = yOf(v - G.BIRTHS_PER_ROW / 2);
      var xa = t - hw, xb = t + hw;
      splat(xOf(Math.max(0, xa)), xOf(Math.min(1, xb)), ya, yb, w, color);
      if (xa < 0) splat(xOf(1 + xa), xOf(1), ya, yb, w, color);
      if (xb > 1) splat(xOf(0), xOf(xb - 1), ya, yb, w, color);
    }
  }
  var out = new Uint8ClampedArray(W * H * 4), bg = [13, 12, 15];
  for (var p = 0; p < W * H; p++) {
    var d = D[p], o = p * 4;
    if (d <= 0) { out[o] = bg[0]; out[o + 1] = bg[1]; out[o + 2] = bg[2]; out[o + 3] = 255; continue; }
    var lum = 1 - Math.exp(-d / 2.5);
    var white = Math.max(0, (d - 6) / 12); white = Math.min(0.55, white);
    var cr = R[p] / d, cg = Gc[p] / d, cb = B[p] / d;
    cr = cr + (1 - cr) * white; cg = cg + (1 - cg) * white; cb = cb + (1 - cb) * white;
    out[o] = bg[0] + (255 * cr - bg[0]) * lum;
    out[o + 1] = bg[1] + (255 * cg - bg[1]) * lum;
    out[o + 2] = bg[2] + (255 * cb - bg[2]) * lum;
    out[o + 3] = 255;
  }
  return out;
}
if (typeof module !== 'undefined') module.exports = { renderInk: renderInk, G: G, xOf: xOf, yOf: yOf, decodeInk: decodeInk };
