// Iteration 4: iteration 3 fitted to the content box, and the six busiest cells named by the catalogue's own place strings.
ITER.push({
 n: 4, title: "the floor, named by its own places",
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
  Object.keys(cnt).sort((a, b) => cnt[b] - cnt[a]).slice(0, 6).forEach(k => { const [i, j] = k.split(",").map(Number), p = (cell[k][9] || "").split(", ").pop();
   cx.fillStyle = "#1d1b18"; cx.font = "12px Georgia"; cx.fillText(p + " · " + cnt[k], i * cw + cw + 3, j * cw + cw); });
  for (let m = -1; m <= 5; m++) { cx.fillStyle = ramp(m); cx.fillRect(m * 40 + 40, ny * cw + 12, 30, 10); cx.fillStyle = "#6f6a60"; cx.font = "11px monospace"; cx.fillText("M" + m, m * 40 + 40, ny * cw + 36); }
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(); const k = Math.floor((e.clientX - b.left) / cw) + "," + Math.floor((e.clientY - b.top) / cw);
   const r = cell[k]; if (r) root.querySelector(".card").textContent = `smallest here: M${r[4]} ${r[5]} · ${new Date(r[0]).toISOString()} · ${r[8]} · ${r[9]}`; });
 }
});
