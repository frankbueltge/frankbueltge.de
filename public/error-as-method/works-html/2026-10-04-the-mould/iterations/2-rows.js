// Iteration 2: one row per network on a shared magnitude axis; each row its own stack of squares.
const NETNAME = { ak: "Alaska Earthquake Center", nc: "Northern California Seismic System", ci: "Southern California Seismic Network",
 us: "USGS National Earthquake Information Center (the world)", av: "Alaska Volcano Observatory", tx: "Texas Seismological Network",
 uu: "University of Utah Seismograph Stations", hv: "Hawaiian Volcano Observatory", pr: "Puerto Rico Seismic Network",
 uw: "Pacific Northwest Seismic Network", ok: "Oklahoma Geological Survey", nn: "Nevada Seismological Laboratory",
 mb: "Montana Bureau of Mines and Geology", nm: "New Madrid Seismic Network", se: "Center for Earthquake Research and Information" };
ITER.push({
 n: 2, title: "one row per network",
 draw(root, D) {
  const W = root.clientWidth, LAB = 0, cell = 2, g = 0.5, st = cell + g;
  const M = D.filter(r => r[4] !== null), lo = Math.floor(Math.min(...M.map(r => r[4])) * 10), hi = Math.ceil(Math.max(...M.map(r => r[4])) * 10);
  const ncol = hi - lo + 1, cw = W / ncol, across = Math.max(1, Math.floor(cw / st));
  const by = {}; M.forEach(r => (by[r[8]] = by[r[8]] || []).push(r));
  const med = a => a.map(r => r[4]).sort((x, y) => x - y)[a.length >> 1];
  const nets = Object.keys(by).sort((a, b) => med(by[a]) - med(by[b]));
  const rows = nets.map(n => { const cols = Array.from({ length: ncol }, () => []); by[n].forEach(r => cols[Math.round(r[4] * 10) - lo].push(r));
   return { n, cols, h: Math.max(...cols.map(c => Math.ceil(c.length / across))) * st + 18 }; });
  const H = rows.reduce((s, r) => s + r.h + 6, 0) + 24;
  root.innerHTML = `<p class="lede">${M.length} events, one square each, stacked by magnitude. Each row is one network that reported them, ordered by its median magnitude.</p><canvas></canvas><div class="card">touch a square</div>`;
  const cv = root.querySelector("canvas"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  let y0 = 0; const hit = [];
  rows.forEach(R => { const base = y0 + R.h; cx.fillStyle = "#1d1b18";
   R.cols.forEach((c, k) => c.forEach((r, i) => { const x = k * cw + (i % across) * st, y = base - (Math.floor(i / across) + 1) * st; cx.fillRect(x, y, cell, cell); hit.push([x, y, r]); }));
   cx.fillStyle = "#6f6a60"; cx.font = "12px Georgia"; cx.fillText(`${NETNAME[R.n] || R.n} · ${by[R.n].length}`, 4, y0 + 13);
   cx.strokeStyle = "#cfc8ba"; cx.beginPath(); cx.moveTo(0, base + 0.5); cx.lineTo(W, base + 0.5); cx.stroke(); y0 = base + 6; });
  cx.fillStyle = "#6f6a60"; cx.font = "11px monospace";
  for (let m = Math.ceil(lo / 10); m <= hi / 10; m++) cx.fillText("M" + m, (m * 10 - lo) * cw, H - 6);
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(), X = e.clientX - b.left, Y = e.clientY - b.top;
   const h = hit.find(h => X >= h[0] && X < h[0] + st && Y >= h[1] && Y < h[1] + st); if (h) { const r = h[2];
   root.querySelector(".card").textContent = `${new Date(r[0]).toISOString()} · M${r[4]} ${r[5]} · depth ${r[3]} km · ${r[6]} · ${r[8]} · ${r[9]}`; } });
 }
});
