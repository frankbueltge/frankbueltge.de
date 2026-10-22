// Study 36 page (coda): study 35's ratio, run 3+ against after a hit, refitted with single tornadoes set aside.
// Rows: the four named sets with their intervals; below, one dot for each of the 30 most injurious warned tornadoes left out in turn.
(function () {
  const S = window.S36;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const SETS = [["all", "all 9,295 warned tornadoes"], ["without_joplin", "Joplin, MO, 2011, set aside"],
                ["without_tuscaloosa", "Tuscaloosa, AL, 2011, set aside"], ["without_both", "both set aside"]];
  const CAT = { hit: "after a hit", run3: "after a run of 3+", run12: "after 1–2 empty warnings", none: "no warning in the county's year" };
  const st = { y: "inj", pick: null };
  const svg = document.getElementById("loo"), out = document.getElementById("loodet");
  function say() {
    const f = S.sets.all[st.y], noun = st.y === "inj" ? "injured" : "dead";
    if (st.pick === null) {
      const j = S.sets.without_joplin[st.y];
      out.textContent = `All warned tornadoes: ${f.irr.toFixed(2)} times the ${noun} after a run of 3+ (${f.lo.toFixed(2)}–${f.hi.toFixed(2)}). ` +
        `With Joplin set aside: ${j.irr.toFixed(2)} (${j.lo.toFixed(2)}–${j.hi.toFixed(2)}). Tap a dot to see which tornado was left out.`;
      return;
    }
    const x = S.loo[st.pick], r = st.y === "inj" ? x.r_inj : x.r_fat;
    out.textContent = `Left out: ${x.st}, ${x.date} (${x.inj.toLocaleString("en")} injured, ${x.fat} dead; ${CAT[x.cat]}). ` +
      `The ratio for the ${noun} becomes ${r.toFixed(2)}, against ${f.irr.toFixed(2)} with it.`;
  }
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = narrow ? 360 : 320, x0 = narrow ? 14 : 300, x1 = W - 14, lo = 0.6, hi = 3.2;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const X = v => x0 + (Math.log(Math.min(hi, Math.max(lo, v))) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    const axisY = H - 30;
    for (const v of [0.75, 1, 1.5, 2, 3]) {
      el("line", { class: v === 1 ? "one" : "grid", x1: X(v), x2: X(v), y1: 26, y2: axisY }, svg);
      el("text", { x: X(v), y: axisY + 16, "text-anchor": "middle" }, svg).textContent = v;
    }
    const base = S.sets.all[st.y];
    el("rect", { class: "band", x: X(base.lo), y: 26, width: X(base.hi) - X(base.lo), height: axisY - 26 }, svg);
    SETS.forEach(([k, name], i) => {
      const y = narrow ? 56 + i * 50 : 52 + i * 44, f = S.sets[k][st.y];
      const g = el("g", { class: "set", "data-k": k }, svg);
      el("line", { class: "w", x1: X(f.lo), x2: X(f.hi), y1: y, y2: y }, g);
      el("circle", { class: "pt" + (k === "without_joplin" || k === "without_both" ? " above" : ""), cx: X(f.irr), cy: y, r: 5 }, g);
      const t = el("text", { class: "lab", x: narrow ? x0 : x0 - 10, y: narrow ? y - 12 : y + 4, "text-anchor": narrow ? "start" : "end" }, g);
      t.textContent = `${name}: ${f.irr.toFixed(2)}`;
    });
    const yl = narrow ? 56 + 4 * 50 + 24 : 52 + 4 * 44 + 22;
    el("text", { class: "lab", x: narrow ? x0 : x0 - 10, y: narrow ? yl - 14 : yl + 4, "text-anchor": narrow ? "start" : "end" }, svg).textContent =
      "30 most injurious, each left out";
    S.loo.forEach((x, i) => {
      const r = st.y === "inj" ? x.r_inj : x.r_fat;
      const c = el("circle", { class: "dot" + (st.pick === i ? " on" : ""), cx: X(r), cy: yl + ((i % 5) - 2) * 7, r: 4, "data-i": i, tabindex: 0 }, svg);
      const pick = () => { st.pick = i; draw(); };
      c.addEventListener("click", pick); c.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && pick());
    });
    const P = S.prices[st.y];
    for (const [v, lab, dash, anchor, yy] of [[P.learning, "learning", "5 3", "end", 16], [P.habit, "habit", "2 3", "start", 16]]) {
      el("line", { class: "w", x1: X(v), x2: X(v), y1: 22, y2: axisY, "stroke-dasharray": dash }, svg);
      el("text", { class: "lab", x: X(v) + (anchor === "end" ? -5 : 5), y: yy, "text-anchor": anchor }, svg).textContent = lab;
    }
    say();
  }
  document.querySelectorAll("#seg-v36 button").forEach(bt => bt.addEventListener("click", () => {
    st.y = bt.dataset.v; document.querySelectorAll("#seg-v36 button").forEach(x => x.setAttribute("aria-pressed", x === bt)); draw();
  }));
  addEventListener("resize", draw);
  draw();
  const T = document.querySelector("#pred36 tbody");
  for (const [k, v] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${v.text}</td><td class="${v.held ? "held" : "failed"}">${v.held ? "held" : "failed"}</td>`;
    T.appendChild(tr);
  }
})();
