// Iteration 1: x = magnitude in steps of 0.1, one square per event stacked upward; colour = network.
ITER.push({
 n: 1, title: "by magnitude, by network",
 draw(root, D) {
  const W = root.clientWidth - 0;
  const nets = {}; D.forEach(r => nets[r[8]] = (nets[r[8]] || 0) + 1);
  const top = Object.entries(nets).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
  const pal = ["#1d1b18", "#c8553d", "#3b6e8f", "#c9a66b", "#6b8f3b", "#8f3b6e", "#d98c2b", "#5e5a53", "#cfc8ba"];
  const ci = r => { const k = top.indexOf(r[8]); return k < 0 ? 8 : k; };
  const M = D.filter(r => r[4] !== null), lo = Math.floor(Math.min(...M.map(r => r[4])) * 10), hi = Math.ceil(Math.max(...M.map(r => r[4])) * 10);
  const ncol = hi - lo + 1, cw = W / ncol, cell = 3, g = 0.5, across = Math.max(1, Math.floor(cw / (cell + g)));
  const cols = Array.from({ length: ncol }, () => []);
  M.slice().sort((a, b) => ci(a) - ci(b)).forEach(r => cols[Math.round(r[4] * 10) - lo].push(r));
  const rowsMax = Math.max(...cols.map(c => Math.ceil(c.length / across))), H = rowsMax * (cell + g) + 30;
  root.innerHTML = `<p class="lede">${M.length} events with a magnitude, one square each, stacked by magnitude in steps of 0.1. Colour is the network that reported it.</p>
   <ul class="legend">${top.concat(["other"]).map((n, i) => `<li><span class="sw" data-i="${i}"></span>${n} · ${i < 8 ? nets[n] : D.length - top.reduce((s, t) => s + nets[t], 0)}</li>`).join("")}</ul>
   <canvas></canvas><div class="card">touch a square</div>`;
  root.querySelectorAll(".sw").forEach(s => s.style.background = pal[+s.dataset.i]);
  const cv = root.querySelector("canvas"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const hit = [];
  cols.forEach((c, k) => c.forEach((r, i) => { const x = k * cw + (i % across) * (cell + g), y = H - 30 - (Math.floor(i / across) + 1) * (cell + g);
   cx.fillStyle = pal[ci(r)]; cx.fillRect(x, y, cell, cell); hit.push([x, y, r]); }));
  cx.fillStyle = "#6f6a60"; cx.font = "11px monospace";
  for (let m = Math.ceil(lo / 10); m <= hi / 10; m++) cx.fillText("M" + m, (m * 10 - lo) * cw, H - 12);
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(), X = e.clientX - b.left, Y = e.clientY - b.top;
   const h = hit.find(h => X >= h[0] && X < h[0] + cell + g && Y >= h[1] && Y < h[1] + cell + g); if (h) { const r = h[2];
   root.querySelector(".card").textContent = `${new Date(r[0]).toISOString()} · M${r[4]} ${r[5]} · depth ${r[3]} km · ${r[6]} · ${r[8]} · ${r[9]}`; } });
 }
});
