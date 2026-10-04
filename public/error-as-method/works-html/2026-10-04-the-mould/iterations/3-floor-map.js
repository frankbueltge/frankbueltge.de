// Iteration 3: longitude x latitude, cells of 2 degrees; each cell shows the smallest magnitude recorded there.
ITER.push({
 n: 3, title: "the floor, as a map",
 draw(root, D) {
  const W = root.clientWidth, C = 2, nx = 360 / C, ny = 180 / C, cw = W / nx, H = ny * cw + 40;
  const cell = {}; D.forEach(r => { if (r[4] === null) return; const k = Math.floor((r[2] + 180) / C) + "," + Math.floor((90 - r[1]) / C);
   if (!cell[k] || r[4] < cell[k][4]) cell[k] = r; });
  const ramp = m => { const t = Math.max(0, Math.min(1, (m + 1) / 6)); const l = Math.round(18 + t * 62); return `hsl(14 ${Math.round(55 - t * 35)}% ${l}%)`; };
  root.innerHTML = `<p class="lede">Each cell of 2° shows the smallest event the catalogue recorded there between 3 September and 3 October 2026. Dark: it heard very small ones. Pale: only large ones. Blank: nothing.</p><canvas></canvas><div class="card">touch a cell</div>`;
  const cv = root.querySelector("canvas"), cx = cv.getContext("2d"), dpr = window.devicePixelRatio || 1;
  cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px"; cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  cx.strokeStyle = "#cfc8ba"; cx.strokeRect(0.5, 0.5, W - 1, ny * cw - 1);
  Object.entries(cell).forEach(([k, r]) => { const [i, j] = k.split(",").map(Number); cx.fillStyle = ramp(r[4]); cx.fillRect(i * cw, j * cw, cw - 0.5, cw - 0.5); });
  for (let m = -1; m <= 5; m++) { cx.fillStyle = ramp(m); cx.fillRect(m * 40 + 40, ny * cw + 12, 30, 10); cx.fillStyle = "#6f6a60"; cx.font = "11px monospace"; cx.fillText("M" + m, m * 40 + 40, ny * cw + 36); }
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(); const k = Math.floor((e.clientX - b.left) / cw) + "," + Math.floor((e.clientY - b.top) / cw);
   const r = cell[k]; if (r) root.querySelector(".card").textContent = `smallest here: M${r[4]} ${r[5]} · ${new Date(r[0]).toISOString()} · ${r[8]} · ${r[9]}`; });
 }
});
