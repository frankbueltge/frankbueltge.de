// Study 32 page: (a) office-years, the office's verdict against the final database;
// (b) the same measures read with each record, paired, per outcome.
(function () {
  const S = window.S32, S31 = window.S31, F = S.fits, F31 = S31.fits;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const f2 = x => x.toFixed(2), pc = x => Math.round(100 * x) + " %";

  // (a) scatter
  const sc = document.getElementById("oy"), sdet = document.getElementById("oydet");
  let mark = null;
  function scatter() {
    sc.innerHTML = "";
    const narrow = sc.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = narrow ? 380 : 460, L = 46, B = 40, T = 14, Rr = narrow ? 12 : 220;
    sc.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const X = v => L + v * (W - L - Rr), Y = v => H - B - v * (H - B - T);
    for (const v of [0, .25, .5, .75, 1]) {
      el("line", { x1: X(v), x2: X(v), y1: Y(0), y2: Y(1), class: "grid" }, sc);
      el("line", { x1: X(0), x2: X(1), y1: Y(v), y2: Y(v), class: "grid" }, sc);
      el("text", { x: X(v), y: H - B + 16, "text-anchor": "middle" }, sc).textContent = v;
      el("text", { x: L - 6, y: Y(v) + 4, "text-anchor": "end" }, sc).textContent = v;
    }
    el("line", { x1: X(0), y1: Y(0), x2: X(1), y2: Y(1), class: "one" }, sc);
    el("text", { x: X(.5), y: H - 6, "text-anchor": "middle" }, sc).textContent = "empty, by the office's own verdict";
    const yl = el("text", { x: 12, y: Y(.5), "text-anchor": "middle", transform: `rotate(-90 12 ${Y(.5)})` }, sc); yl.textContent = "empty, by the final database";
    if (!narrow) {
      const notes = [["above: the final record", "finds met warnings empty"], ["below: it fills warnings", "the office counted empty"]];
      notes.forEach(([a, b], i) => { el("text", { x: X(1) + 14, y: Y(i ? .2 : .95), class: "lab" }, sc).textContent = a; el("text", { x: X(1) + 14, y: Y(i ? .2 : .95) + 16 }, sc).textContent = b; });
    }
    const g = el("g", {}, sc);
    S.officeyears.forEach((d, i) => {
      const [o, y, n, eo, ef, fill] = d;
      const c = el("circle", { cx: X(eo / n), cy: Y(ef / n), r: Math.max(2, Math.min(9, Math.sqrt(n) / 2.2)), class: "dot" + (mark === i ? " on" : "") }, g);
      c.addEventListener("click", () => { mark = i; scatter(); show(i); });
    });
    if (mark !== null) show(mark);
    else sdet.textContent = `${S.officeyears.length.toLocaleString("en")} office-years with 10 or more warnings. Tap a dot.`;
  }
  function show(i) {
    const [o, y, n, eo, ef, fill] = S.officeyears[i];
    sdet.textContent = `${o}, ${y}: ${n} warnings. The office counted ${eo} empty (${pc(eo / n)}); the final database finds ${ef} empty (${pc(ef / n)}). Of the office's empty ones, the final database puts a tornado track inside ${fill}.`;
  }

  // (b) paired forest
  const ROWS = [
    ["past", "final_past", "z_ffp", "Office, the 12 months before", "the replication"],
    ["future", "final_future", "z_fff", "Office, the 12 months after", "the placebo: a record nobody had read"],
    ["past_fe", "final_past_fe", "z_ffp", "Within an office, the 12 months before", "the office compared with itself"],
    ["future_fe", "final_future_fe", "z_fff", "Within an office, the 12 months after", "placebo, within (exploration)"],
    [null, "revision", "z_rev", "Share of the office's empties the final record fills", "the disagreement itself"]];
  let y = "inj";
  const svg = document.getElementById("pair"), det = document.getElementById("pairdet");
  const SS09 = { inj: [1.13, 1.32], fat: [1.12, 1.29] };
  function old(k) {   // study 31's fit; its within-office deaths interval corrected on this page (s217)
    if (k === "past_fe" && y === "fat") { const c = F.office_past_fe_fat; return { ...c.z_far_past, n: c.n, corrected: true }; }
    const r = F31[`${k}_${y}`]; return r;
  }
  function pair() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, top = 34, rh = narrow ? 62 : 50, H = top + rh * ROWS.length + 34;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const x0 = narrow ? 14 : 360, x1 = W - 14, lo = 0.6, hi = 1.8;
    const X = v => x0 + (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    const band = SS09[y];
    el("rect", { x: X(band[0]), y: top - 10, width: X(band[1]) - X(band[0]), height: rh * ROWS.length + 4, class: "band" }, svg);
    el("text", { x: narrow ? x1 : X(band[0]) + 4, y: top - 14, "text-anchor": narrow ? "end" : "start" }, svg).textContent = "shaded: 1986–2004 (Simmons & Sutter)";
    for (const v of [0.6, 0.8, 1, 1.25, 1.5, 1.8]) {
      el("line", { x1: X(v), x2: X(v), y1: top - 6, y2: top + rh * ROWS.length, class: v === 1 ? "one" : "grid" }, svg);
      el("text", { x: X(v), y: H - 12, "text-anchor": "middle" }, svg).textContent = v;
    }
    ROWS.forEach(([ko, kf, z, label, role], i) => {
      const cy = top + rh * i + rh / 2 + (narrow ? 10 : 0);
      if (narrow) el("text", { x: x0, y: cy - 20, class: "lab" }, svg).textContent = label;
      else { el("text", { x: x0 - 12, y: cy - 2, "text-anchor": "end", class: "lab" }, svg).textContent = label; el("text", { x: x0 - 12, y: cy + 14, "text-anchor": "end" }, svg).textContent = role; }
      const g = el("g", { class: "row", tabindex: 0, role: "button", "aria-label": label }, svg);
      el("rect", { x: x0, y: cy - rh / 2 + 4, width: x1 - x0, height: rh - 8, class: "hit" }, g);
      const fr = F[`${kf}_${y}`], f = { ...fr[z], n: fr.n, converged: fr.converged, offices_dropped: fr.offices_dropped };
      const o = ko ? old(ko) : null;
      const draw1 = (r, dy, cls) => {
        el("line", { x1: X(Math.max(r.lo, lo)), x2: X(Math.min(r.hi, hi)), y1: cy + dy, y2: cy + dy, class: "w " + cls }, g);
        el("circle", { cx: X(Math.min(Math.max(r.irr, lo), hi)), cy: cy + dy, r: 5.5, class: "pt " + cls + (r.lo > 1 ? " above" : "") + (r.converged === false ? " nc" : "") }, g);
      };
      if (o) draw1(o, -6, "office");
      draw1(f, o ? 6 : 0, "final");
      const show = () => {
        let s = `${label}, ${y === "inj" ? "injuries" : "deaths"}. Final database: ${f2(f.irr)} (${f2(f.lo)}–${f2(f.hi)})`;
        if (o) s += `; office's verdict: ${f2(o.irr)} (${f2(o.lo)}–${f2(o.hi)})` + (o.corrected ? ", interval corrected 2026-10-20 (study 31 printed 0.43–3.05)" : "");
        s += `. ${f.n.toLocaleString("en")} tornadoes` + (f.offices_dropped ? `, ${f.offices_dropped} offices without any ${y === "inj" ? "injury" : "death"} left out` : "") + (f.converged ? "." : ". Did not converge.");
        det.textContent = s;
      };
      g.addEventListener("click", show); g.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && show());
    });
    det.textContent = "Hollow upper dot: the office's verdict (study 31). Solid lower dot: the final database. Tap a row.";
    for (const b of document.querySelectorAll("#seg-y2 button")) b.setAttribute("aria-pressed", b.dataset.v === y);
  }
  for (const b of document.querySelectorAll("#seg-y2 button")) b.addEventListener("click", () => { y = b.dataset.v; pair(); });

  // predictions
  const tb = document.querySelector("#pred32 tbody");
  for (const [k, p] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${p.text}</td><td class="${p.held ? "held" : "failed"}">${p.held ? "held" : "failed"}</td>`;
    tb.appendChild(tr);
  }
  const redraw = () => { scatter(); pair(); };
  redraw(); let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(redraw, 120); });
})();
