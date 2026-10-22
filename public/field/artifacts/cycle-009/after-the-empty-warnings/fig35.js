// Study 35 page: casualties per warned tornado by the county's run before the warning, against a hit,
// on a log axis beside the price each village charges. The visitor sets the habit reader's belief after a run.
(function () {
  const S = window.S35;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const ROWS = [["none", "no warning in the county's year"], ["run12", "after 1–2 empty warnings"], ["run3", "after 3 or more empty warnings"]];
  const st = { y: "inj", b: S.b_run.habit };
  const svg = document.getElementById("villages"), out = document.getElementById("villdet");
  const price = (y, br, bh) => (1 - S.w[y] * br) / (1 - S.w[y] * bh);
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = 250, x0 = narrow ? 14 : 250, x1 = W - 14, lo = 0.5, hi = 3.5;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const X = v => x0 + (Math.log(Math.min(hi, Math.max(lo, v))) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    const axisY = H - 30;
    for (const v of [0.5, 0.75, 1, 1.5, 2, 3]) {
      el("line", { class: v === 1 ? "one" : "grid", x1: X(v), x2: X(v), y1: 26, y2: axisY }, svg);
      el("text", { x: X(v), y: axisY + 16, "text-anchor": "middle" }, svg).textContent = v;
    }
    const F = S.fits[st.y];
    ROWS.forEach(([k, name], i) => {
      const y = narrow ? 58 + i * 58 : 60 + i * 52, f = F[k];
      el("line", { class: "w", x1: X(f.lo), x2: X(f.hi), y1: y, y2: y }, svg);
      el("circle", { class: "pt" + (k === "run3" ? " above" : ""), cx: X(f.irr), cy: y, r: 5 }, svg);
      const t = el("text", { class: "lab", x: narrow ? x0 : x0 - 10, y: narrow ? y - 12 : y + 4, "text-anchor": narrow ? "start" : "end" }, svg);
      t.textContent = narrow ? `${name}: ${f.irr.toFixed(2)}` : `${name}  ${f.irr.toFixed(2)}`;
    });
    const pl = price(st.y, S.b_run.learning, S.b_hit.learning), ph = price(st.y, st.b, S.b_hit.habit);
    el("line", { class: "w office", x1: X(pl), x2: X(pl), y1: 22, y2: axisY, "stroke-dasharray": "5 3" }, svg);
    el("line", { class: "w", x1: X(ph), x2: X(ph), y1: 22, y2: axisY, "stroke-dasharray": "2 3" }, svg);
    el("text", { class: "lab", x: X(pl) - 5, y: 16, "text-anchor": "end" }, svg).textContent = "learning";
    el("text", { class: "lab", x: X(ph) + 5, y: axisY - 6, "text-anchor": "start" }, svg).textContent = "habit";
    const f = F.run3, inside = v => f.lo <= v && v <= f.hi;
    out.textContent = `${st.y === "inj" ? "Injured" : "Dead"} per warned tornado after a run of three or more, against one right after a hit: ` +
      `${f.irr.toFixed(2)} (95 % interval ${f.lo.toFixed(2)}–${f.hi.toFixed(2)}). The learning village's price is ${pl.toFixed(2)}; ` +
      `a habit reader who believes ${Math.round(100 * st.b)} % after a run charges ${ph.toFixed(2)}. ` +
      (inside(pl) && inside(ph) ? "Both lie inside the interval: the casualties cannot tell the two readers apart." :
        inside(pl) ? "The habit price lies outside the interval." : inside(ph) ? "The learning price lies outside the interval." : "Neither lies inside the interval.");
    document.getElementById("o-b").textContent = `${Math.round(100 * st.b)} %`;
  }
  document.querySelectorAll("#seg-v35 button").forEach(bt => bt.addEventListener("click", () => {
    st.y = bt.dataset.v; document.querySelectorAll("#seg-v35 button").forEach(x => x.setAttribute("aria-pressed", x === bt)); draw();
  }));
  const inp = document.getElementById("s-b");
  inp.value = st.b;
  inp.addEventListener("input", () => { st.b = +inp.value; draw(); });
  addEventListener("resize", draw);
  draw();

  const T = document.querySelector("#pred35 tbody");
  for (const [k, v] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${v.text}</td><td class="${v.held ? "held" : "failed"}">${v.held ? "held" : "failed"}</td>`;
    T.appendChild(tr);
  }
})();
