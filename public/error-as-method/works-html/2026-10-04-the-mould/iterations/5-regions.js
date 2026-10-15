// Iteration 5: iteration 4 with labels per region (last part of the place string, at least 20 events), at its busiest cell, giving its smallest magnitude; overlapping labels skipped.
ITER.push({
 n: 5, title: "the floor, named by region",
 draw(root, D) {
  const cs = getComputedStyle(root), W = root.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight), C = 2, nx = 360 / C, ny = 180 / C, cw = W / nx, H = ny * cw + 40;
  const cell = {}, cnt = {}; D.forEach(r => { if (r[4] === null) return; const k = Math.floor((r[2] + 180) / C) + "," + Math.floor((90 - r[1]) / C);
   cnt[k] = (cnt[k] || 0) + 1; if (!cell[k] || r[4] < cell[k][4]) cell[k] = r; });
  const ramp = m => { const t = Math.max(0, Math.min(1, (m + 1) / 6)); const l = Math.round(18 + t * 62); return `hsl(14 ${Math.round(55 - t * 35)}% ${l}%)`; };
  root.innerHTML = `<p class="lede">Each cell of 2° shows the smallest event the catalogue recorded there between 3 September and 3 October 2026. Dark: it heard very small ones. Pale: only large ones. Blank: nothing.</p><canvas></canvas><div class="card">touch a cell</div>`;
  const cv = root.querySelector("canvas"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.strokeStyle = "#cfc8ba"; cx.strokeRect(0.5, 0.5, W - 1, ny * cw - 1);
  Object.entries(cell).forEach(([k, r]) => { const [i, j] = k.split(",").map(Number); cx.fillStyle = ramp(r[4]); cx.fillRect(i * cw, j * cw, cw - 0.5, cw - 0.5); });
  const reg = {}; D.forEach(r => { if (r[4] === null) return; const p = (r[9] || "").split(", ").pop(); if (!p) return;
   const k = Math.floor((r[2] + 180) / C) + "," + Math.floor((90 - r[1]) / C); const g = reg[p] = reg[p] || { n: 0, min: 99, cells: {} };
   g.n++; g.min = Math.min(g.min, r[4]); g.cells[k] = (g.cells[k] || 0) + 1; });
  const placed = []; cx.font = "12px Georgia";
  Object.entries(reg).filter(e => e[1].n >= 20).sort((a, b) => b[1].n - a[1].n).forEach(([p, g]) => {
   const k = Object.keys(g.cells).sort((a, b) => g.cells[b] - g.cells[a])[0], [i, j] = k.split(",").map(Number);
   const t = `${p} · nothing below M${g.min.toFixed(1)}`, w = cx.measureText(t).width, x = Math.min(i * cw + cw + 3, W - w - 2), y = j * cw + cw;
   if (placed.some(q => x < q[0] + q[2] && q[0] < x + w && Math.abs(y - q[1]) < 14)) return; placed.push([x, y, w]);
   cx.fillStyle = "rgba(244,241,234,.85)"; cx.fillRect(x - 2, y - 11, w + 4, 14); cx.fillStyle = "#1d1b18"; cx.fillText(t, x, y); });
  for (let m = -1; m <= 5; m++) { cx.fillStyle = ramp(m); cx.fillRect(m * 40 + 40, ny * cw + 12, 30, 10); cx.fillStyle = "#6f6a60"; cx.font = "11px monospace"; cx.fillText("M" + m, m * 40 + 40, ny * cw + 36); }
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(); const k = Math.floor((e.clientX - b.left) / cw) + "," + Math.floor((e.clientY - b.top) / cw);
   const r = cell[k]; if (r) root.querySelector(".card").textContent = `smallest here: M${r[4]} ${r[5]} · ${new Date(r[0]).toISOString()} · ${r[8]} · ${r[9]}`; });
 }
});
