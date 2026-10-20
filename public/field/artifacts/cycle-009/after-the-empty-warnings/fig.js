// Study 31 page: forest of incidence-rate ratios per 1 SD of each record of empty warnings.
(function () {
  const S = window.S31, F = S.fits;
  // correction, 2026-10-20 (session 217): the within-office deaths fit of study 31 held the West dummy
  // and the GGW office dummy as one column; refitted without the duplicate (study 32, analyse32.py)
  if (window.S32) { const c = window.S32.fits.office_past_fe_fat.z_far_past; F.past_fe_fat = { ...F.past_fe_fat, irr: c.irr, lo: c.lo, hi: c.hi, corrected: true }; }
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const f2 = x => x.toFixed(2);
  // Simmons & Sutter 2009, 1986-2004, per 1 SD of a local, recent FAR (passages in data/sources.json)
  const SS09 = { inj: [1.13, 1.32], fat: [1.12, 1.29] };
  const ROWS = {
    across: [
      ["past", "Office, the 12 months before", "the replication"],
      ["future", "Office, the 12 months after", "the placebo: a record nobody had read"],
      ["state", "State, the 12 months before", "exploration"],
      ["empties", "The county: empty warnings in the year before", "the spot's own experience"],
      ["run", "The county: the run of empty warnings just before", "the fable's count"]],
    within: [
      ["past_fe", "Office, the 12 months before", "the same office, compared with itself over time"],
      ["future_fe", "Office, the 12 months after", "placebo, within the office (exploration)"]]
  };
  let y = "inj", view = "across";
  const svg = document.getElementById("forest"), det = document.getElementById("det");
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const rows = ROWS[view], W = narrow ? 380 : 900, top = 34, rh = narrow ? 54 : 46, H = top + rh * rows.length + 34;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const x0 = narrow ? 14 : 330, x1 = W - 14, lo = 0.6, hi = 1.8;
    const X = v => x0 + (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    const band = SS09[y];
    el("rect", { x: X(band[0]), y: top - 10, width: X(band[1]) - X(band[0]), height: rh * rows.length + 4, class: "band" }, svg);
    const t0 = el("text", { x: narrow ? x1 : X(band[0]) + 4, y: top - 14, "text-anchor": narrow ? "end" : "start" }, svg); t0.textContent = "shaded: 1986–2004 (Simmons & Sutter)";
    for (const v of [0.6, 0.8, 1, 1.25, 1.5, 1.8]) {
      el("line", { x1: X(v), x2: X(v), y1: top - 6, y2: top + rh * rows.length, class: v === 1 ? "one" : "grid" }, svg);
      const t = el("text", { x: X(v), y: H - 12, "text-anchor": "middle" }, svg); t.textContent = v;
    }
    rows.forEach(([k, label, role], i) => {
      const r = F[`${k}_${y}`], cy = top + rh * i + rh / 2 + (narrow ? 8 : 0);
      if (narrow) { const t = el("text", { x: x0, y: cy - 16, class: "lab" }, svg); t.textContent = label; }
      else {
        const t = el("text", { x: x0 - 12, y: cy - 2, "text-anchor": "end", class: "lab" }, svg); t.textContent = label;
        const u = el("text", { x: x0 - 12, y: cy + 14, "text-anchor": "end" }, svg); u.textContent = role;
      }
      const g = el("g", { class: "row", tabindex: 0, role: "button", "aria-label": `${label}: ${f2(r.irr)}` }, svg);
      el("rect", { x: x0, y: cy - rh / 2 + 4, width: x1 - x0, height: rh - 8, class: "hit" }, g);
      el("line", { x1: X(Math.max(r.lo, lo)), x2: X(Math.min(r.hi, hi)), y1: cy, y2: cy, class: "w" }, g);
      el("circle", { cx: X(r.irr), cy, r: 6, class: "pt" + (r.lo > 1 && r.converged ? " above" : "") + (r.converged ? "" : " nc") }, g);
      const vt = el("text", { x: Math.min(X(Math.min(r.hi, hi)) + 6, x1 - 26), y: narrow ? cy + 4 : cy - 9 }, g); vt.textContent = f2(r.irr);
      const show = () => {
        det.textContent = `${label}, ${y === "inj" ? "injuries" : "deaths"}: ${f2(r.irr)} per standard deviation (95 % interval ${f2(r.lo)}–${f2(r.hi)}), ${r.n.toLocaleString("en")} tornadoes` +
          (r.offices_dropped ? `, ${r.offices_dropped} offices without any ${y === "inj" ? "injury" : "death"} left out` : "") +
          (r.converged ? "." : ". This fit did not converge.") +
          (r.corrected ? " Interval corrected 2026-10-20: study 31 printed 0.43–3.05, made by a duplicated column." : "");
      };
      g.addEventListener("click", show); g.addEventListener("keydown", e => (e.key === "Enter" || e.key === " ") && show());
    });
    det.textContent = "Tap a row for its numbers.";
    for (const b of document.querySelectorAll("#seg-y button")) b.setAttribute("aria-pressed", b.dataset.v === y);
    for (const b of document.querySelectorAll("#seg-v button")) b.setAttribute("aria-pressed", b.dataset.v === view);
  }
  for (const b of document.querySelectorAll("#seg-y button")) b.addEventListener("click", () => { y = b.dataset.v; draw(); });
  for (const b of document.querySelectorAll("#seg-v button")) b.addEventListener("click", () => { view = b.dataset.v; draw(); });
  addEventListener("resize", draw);
  draw();

  // terciles
  const tb = document.querySelector("#terc tbody");
  for (const k of ["low", "mid", "high"]) {
    const t = S.by_tercile[k], tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td class="n">${f2(t.far_range[0])}–${f2(t.far_range[1])}</td><td class="n">${t.n.toLocaleString("en")}</td>` +
      `<td class="n">${t.deaths_per_100.toFixed(1)}</td><td class="n">${t.injuries_per_100.toFixed(1)}</td>` +
      `<td class="n">${Math.round(100 * t.share_EF2plus)} %</td><td class="n">${Math.round(100 * t.share_south)} %</td><td class="n">${Math.round(100 * t.share_night)} %</td>`;
    tb.appendChild(tr);
  }
  // predictions
  const pb = document.querySelector("#pred tbody");
  for (const [k, p] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${p.text}</td><td class="${p.held ? "held" : "failed"}">${p.held ? "held" : "failed"}</td>`;
    pb.appendChild(tr);
  }
})();
