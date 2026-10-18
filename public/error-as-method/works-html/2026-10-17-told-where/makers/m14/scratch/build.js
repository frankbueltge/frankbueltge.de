const fs = require('fs');
const vals = fs.readFileSync(__dirname + '/values.txt', 'utf8').trim();
const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=1100">
<title>The Night Widens</title>
<style>
  :root { --ground: #07080c; --ink: #b9ad98; --dim: #6c665c; }
  html, body { margin: 0; height: 100%; background: var(--ground); }
  body { display: flex; align-items: center; justify-content: center; overflow: hidden; }
  .work { position: relative; width: 1100px; height: 800px; flex: none; }
  canvas { position: absolute; inset: 0; width: 1100px; height: 800px; }
  .title, .key { position: absolute; font-family: "Iowan Old Style", "Palatino Linotype", Palatino, Georgia, serif; color: var(--ink); }
  .title { left: 44px; top: 40px; font-size: 21px; letter-spacing: 0.04em; font-weight: normal; margin: 0; }
  .title span { display: block; margin-top: 8px; font-size: 12.5px; color: var(--dim); letter-spacing: 0.06em; font-style: italic; }
  .key { right: 44px; bottom: 40px; width: 200px; font-size: 12px; line-height: 1.6; color: var(--dim); text-align: right; }
</style>
</head>
<body>
<div class="work">
  <canvas id="c" width="1100" height="800" aria-label="A spiral of 1,464 hourly cells, one turn per day, noon at the top. Light fills the upper part of every turn; a dark wedge of night at the bottom widens from the centre outward."></canvas>
  <h1 class="title">The Night Widens<span>1,464 hours, wound one day to a turn</span></h1>
  <div class="key">noon at the top, midnight below.<br>the first hour at the centre,<br>the last at the rim.<br>brighter is more.</div>
</div>
<script>
// 1,464 hourly values (0 = the floor of the record, 78 = its highest),
// recovered from the dots of a 300 x 90 picture.
const V = [${vals}];
const cv = document.getElementById('c');
const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
cv.width = 1100 * dpr; cv.height = 800 * dpr;
const ctx = cv.getContext('2d');
ctx.scale(dpr, dpr);

const CX = 550, CY = 404, R0 = 46, PITCH = 5.3, NOON = 16.2, TH = PITCH - 1.15;
const TAU = Math.PI * 2;
const stops = [
  [0.00, [32, 22, 18]],
  [0.12, [70, 30, 16]],
  [0.30, [140, 58, 20]],
  [0.52, [212, 120, 44]],
  [0.74, [242, 196, 122]],
  [0.92, [252, 236, 204]],
  [1.00, [255, 251, 242]]
];
function colour(t) {
  for (let k = 1; k < stops.length; k++) {
    if (t <= stops[k][0]) {
      const [a, ca] = stops[k - 1], [b, cb] = stops[k], u = (t - a) / (b - a);
      return 'rgb(' + ca.map((c, j) => Math.round(c + (cb[j] - c) * u)).join(',') + ')';
    }
  }
  return 'rgb(255,251,242)';
}
const rad = t => R0 + PITCH * t / 24;
const ang = t => TAU * (t - NOON) / 24;
function cell(i, grow) {
  const a = i - 0.5, b = i + 0.5, n = 8;
  ctx.beginPath();
  for (let s = 0; s <= n; s++) {
    const t = a + (b - a) * s / n, r = rad(t) + TH / 2 + grow, th = ang(t);
    const x = CX + r * Math.sin(th), y = CY - r * Math.cos(th);
    s ? ctx.lineTo(x, y) : ctx.moveTo(x, y);
  }
  for (let s = n; s >= 0; s--) {
    const t = a + (b - a) * s / n, r = rad(t) - TH / 2 - grow, th = ang(t);
    ctx.lineTo(CX + r * Math.sin(th), CY - r * Math.cos(th));
  }
  ctx.closePath();
}

ctx.fillStyle = '#07080c';
ctx.fillRect(0, 0, 1100, 800);

// a soft halo under the brighter hours
ctx.save();
ctx.filter = 'blur(9px)';
ctx.globalAlpha = 0.33;
for (let i = 0; i < V.length; i++) {
  const t = V[i] / 78;
  if (t < 0.45) continue;
  ctx.fillStyle = colour(t);
  cell(i, 1.5);
  ctx.fill();
}
ctx.restore();

// the record itself: one cell per hour
for (let i = 0; i < V.length; i++) {
  const v = V[i];
  ctx.fillStyle = v === 0 ? '#0e1017' : colour(Math.min(1, v / 78));
  cell(i, 0);
  ctx.fill();
}
</script>
</body>
</html>
`;
fs.writeFileSync('/tmp/claude-0/s133/mk/m14/work/index.html', html);
console.log(html.length);
