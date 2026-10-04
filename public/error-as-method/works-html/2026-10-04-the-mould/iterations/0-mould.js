// Iteration 0: the house mould. Written before the material was fetched.
// It is Withdrawn's form (one square per record, time order, colour by one field's category,
// touch to read, legend with counts), transferred without looking.
// Record: [t_ms, lat, lon, depth_km, mag, magType, type, status, net, place]
ITER.push({
 n: 0, title: "the mould",
 draw(root, D) {
  const bands = [["no magnitude", m => m === null], ["below 1", m => m < 1], ["1 to 2", m => m < 2],
   ["2 to 3", m => m < 3], ["3 to 4", m => m < 4], ["4 to 5", m => m < 5], ["5 and above", m => true]];
  const pal = ["#cfc8ba", "#d9c9a3", "#c9a66b", "#c8553d", "#9c2f22", "#5e1a12", "#1d1b18"];
  const cat = r => bands.findIndex(b => b[1](r[4]));
  const counts = bands.map(() => 0); D.forEach(r => counts[cat(r)]++);
  root.innerHTML = `<p class="lede">${D.length} events in the catalogue, one square each, in the order they happened. Touch a square to read it.</p>
   <ul class="legend">${bands.map((b, i) => `<li><span class="sw" data-i="${i}"></span>${b[0]} · ${counts[i]}</li>`).join("")}</ul>
   <canvas></canvas><div class="card">touch a square</div>`;
  root.querySelectorAll(".sw").forEach(s => s.style.background = pal[+s.dataset.i]);
  const cv = root.querySelector("canvas"), cx = cv.getContext("2d"), W = root.clientWidth;
  const cell = 5, gap = 1, step = cell + gap, per = Math.floor(W / step), H = Math.ceil(D.length / per) * step;
  const dpr = window.devicePixelRatio || 1; cv.width = W * dpr; cv.height = H * dpr; cv.style.width = W + "px"; cv.style.height = H + "px";
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const S = D.slice().sort((a, b) => a[0] - b[0]);
  S.forEach((r, i) => { cx.fillStyle = pal[cat(r)]; cx.fillRect((i % per) * step, Math.floor(i / per) * step, cell, cell); });
  cv.addEventListener("click", e => { const b = cv.getBoundingClientRect(); const i = Math.floor((e.clientY - b.top) / step) * per + Math.floor((e.clientX - b.left) / step);
   const r = S[i]; if (r) root.querySelector(".card").textContent = `${new Date(r[0]).toISOString()} · M${r[4]} ${r[5]} · depth ${r[3]} km · ${r[6]} · ${r[8]} · ${r[9]}`; });
 }
});
