// Study 37 page (second coda): which tornado carries the ratio. One dot per tornado left out (study 36's 30 most
// injurious, and the 10 new refits chosen by their one-step pull); x = its injured, its injured over what the model expected, or the model's pull on it.
(function () {
  const S = window.S37;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const CAT = { hit: "after a hit", run3: "after a run of 3+", run12: "after 1–2 empty warnings", none: "no warning in the county's year" };
  const st = { x: "inj", pick: S.pts.findIndex(p => p.om === 613559) };
  const svg = document.getElementById("pull"), out = document.getElementById("pulldet");
  const f2 = v => v.toFixed(2), fx = v => (v >= 10 ? Math.round(v).toLocaleString("en") : v.toFixed(1));
  function say() {
    const p = S.pts[st.pick];
    out.textContent = `Left out: ${p.st}, ${p.date}, EF${p.ef}, ${CAT[p.cat]}. ${p.inj.toLocaleString("en")} injured where the model expected ${p.mu < 1 ? p.mu.toFixed(2) : fx(p.mu)}: ` +
      `${fx(p.surprise)} times what it expected. The ratio becomes ${f2(p.irr)}, against ${f2(S.full.irr)} with it` +
      (p.set === "new" ? ` (95 % interval ${f2(p.lo)}–${f2(p.hi)}; a new refit of study 37).` : " (study 36's refit).");
  }
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = narrow ? 380 : 340, x0 = narrow ? 44 : 60, x1 = W - 16, y0 = 20, y1 = H - 44;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const AX = {
      inj: { k: "inj", lo: 2, hi: 2000, log: true, ticks: [3, 10, 30, 100, 300, 1000], lab: "injured at the tornado left out (log)" },
      surprise: { k: "surprise", lo: 0.2, hi: 300, log: true, ticks: [0.3, 1, 3, 10, 30, 100], lab: "injured ÷ injured the model expected (log)" },
      u: { k: "u", lo: -0.5, hi: 7, log: false, ticks: [0, 1, 2, 3, 4, 5, 6], lab: narrow ? "pull: (injured − expected) ÷ (1 + α·expected)" : "the model's pull, (injured − expected) ÷ (1 + α × expected)" } }[st.x];
    const xs = S.pts.map(p => p[AX.k]);
    const ylo = 1.12, yhi = 1.36, tr = v => (AX.log ? Math.log(v) : v);
    const X = v => x0 + (tr(Math.min(AX.hi, Math.max(AX.lo, v))) - tr(AX.lo)) / (tr(AX.hi) - tr(AX.lo)) * (x1 - x0);
    const Y = v => y1 - (Math.log(v) - Math.log(ylo)) / (Math.log(yhi) - Math.log(ylo)) * (y1 - y0);
    for (const v of AX.ticks) {
      el("line", { class: "grid", x1: X(v), x2: X(v), y1: y0, y2: y1 }, svg);
      el("text", { x: X(v), y: y1 + 16, "text-anchor": "middle" }, svg).textContent = v.toLocaleString("en");
    }
    for (const v of [1.15, 1.2, 1.25, 1.3, 1.35]) {
      el("line", { class: "grid", x1: x0, x2: x1, y1: Y(v), y2: Y(v) }, svg);
      el("text", { x: x0 - 6, y: Y(v) + 4, "text-anchor": "end" }, svg).textContent = v.toFixed(2);
    }
    el("line", { class: "one", x1: x0, x2: x1, y1: Y(S.full.irr), y2: Y(S.full.irr) }, svg);
    el("text", { class: "lab", x: x1, y: Y(S.full.irr) - 6, "text-anchor": "end" }, svg).textContent = `every tornado in: ${f2(S.full.irr)}`;
    el("text", { class: "lab", x: (x0 + x1) / 2, y: H - 8, "text-anchor": "middle" }, svg).textContent =
      AX.lab;
    S.pts.forEach((p, i) => {
      const cls = "dot37 " + (p.cat === "hit" ? "hit" : p.cat === "run3" ? "run3" : "other") + (p.set === "new" ? " new" : "") + (st.pick === i ? " on" : "");
      const c = el("circle", { class: cls, cx: X(xs[i]), cy: Y(p.irr), r: st.pick === i ? 7 : 5, "data-i": i, tabindex: 0 }, svg);
      const pick = () => { st.pick = i; draw(); };
      c.addEventListener("click", pick); c.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && pick());
    });
    for (const [om, name] of [[296616, "Joplin"], [314625, "Tuscaloosa"], [613559, "Louisiana 2016"], [315890, "Oklahoma 2011"]]) {
      const i = S.pts.findIndex(p => p.om === om), p = S.pts[i];
      const below = p.irr < S.full.irr, right = !below && X(xs[i]) < (x0 + x1) / 2;
      el("text", { class: "lab", x: X(xs[i]) + (right ? 9 : -9), y: Y(p.irr) + (below ? 4 : -8), "text-anchor": right ? "start" : "end" }, svg).textContent = name;
    }
    say();
  }
  document.querySelectorAll("#seg-x37 button").forEach(bt => bt.addEventListener("click", () => {
    st.x = bt.dataset.v; document.querySelectorAll("#seg-x37 button").forEach(x => x.setAttribute("aria-pressed", x === bt)); draw();
  }));
  addEventListener("resize", draw);
  draw();
  const T = document.querySelector("#pred37 tbody");
  for (const [k, v] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${v.text}</td><td class="${v.held ? "held" : "failed"}">${v.held ? "held" : "failed"}</td>`;
    T.appendChild(tr);
  }
})();
