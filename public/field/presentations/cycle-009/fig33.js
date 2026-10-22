// Study 33 page: each part of the office's empty-warning record, read from the 12 months before
// (solid) and the 12 months after (hollow, the placebo), per outcome; within-office rows have no placebo.
(function () {
  const S = window.S33, F = S.fits;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const f2 = x => x.toFixed(2);
  const ROWS = [
    ["far", "far", "Share empty", "all empty warnings alike (habit)"],
    ["wexp_excess", "wexp", "Empty as the words foretold", "the warner's own stated doubt"],
    ["wexp_excess", "excess", "Empty beyond the words", "the promise the words did not keep"],
    ["broken", "broken", "Empty after OBSERVED", "beside the share empty"],
    ["taken", "taken", "Empties taken back", "beside the share empty"],
    ["excess_fe", "excess", "Beyond the words, within an office", "the office compared with itself"],
    ["taken_fe", "taken", "Taken back, within an office", "the office compared with itself"]];
  let y = "inj";
  const svg = document.getElementById("parts"), det = document.getElementById("partsdet");
  const get = (fit, w, e) => {
    const name = fit.endsWith("_fe") ? `${fit.slice(0, -3)}_${w}_fe_${y}` : `${fit}_${w}_${y}`;
    const r = F[name]; if (!r) return null;
    return { ...r[`z_${e}_${w}`], n: r.n, converged: r.converged, offices_dropped: r.offices_dropped };
  };
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, top = 26, rh = narrow ? 62 : 50, H = top + rh * ROWS.length + 34;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const x0 = narrow ? 14 : 360, x1 = W - 14, lo = 0.6, hi = 1.8;
    const X = v => x0 + (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    for (const v of [0.6, 0.8, 1, 1.25, 1.5, 1.8]) {
      el("line", { x1: X(v), x2: X(v), y1: top - 6, y2: top + rh * ROWS.length, class: v === 1 ? "one" : "grid" }, svg);
      el("text", { x: X(v), y: H - 12, "text-anchor": "middle" }, svg).textContent = v;
    }
    ROWS.forEach(([fit, e, label, role], i) => {
      const cy = top + rh * i + rh / 2 + (narrow ? 10 : 0);
      if (narrow) el("text", { x: x0, y: cy - 20, class: "lab" }, svg).textContent = label;
      else { el("text", { x: x0 - 12, y: cy - 2, "text-anchor": "end", class: "lab" }, svg).textContent = label; el("text", { x: x0 - 12, y: cy + 14, "text-anchor": "end" }, svg).textContent = role; }
      const g = el("g", { class: "row", tabindex: 0, role: "button", "aria-label": label }, svg);
      el("rect", { x: x0, y: cy - rh / 2 + 4, width: x1 - x0, height: rh - 8, class: "hit" }, g);
      const p = get(fit, "past", e), f = fit.endsWith("_fe") ? null : get(fit, "future", e);
      const draw1 = (r, dy, cls) => {
        if (r.converged !== false && r.lo != null && r.hi != null)
          el("line", { x1: X(Math.max(r.lo, lo)), x2: X(Math.min(r.hi, hi)), y1: cy + dy, y2: cy + dy, class: "w " + cls }, g);
        el("circle", { cx: X(Math.min(Math.max(r.irr, lo), hi)), cy: cy + dy, r: 5.5, class: "pt " + cls + (r.lo > 1 && r.converged !== false ? " above" : "") + (r.converged === false ? " nc" : "") }, g);
      };
      draw1(p, f ? -6 : 0, "final");
      if (f) draw1(f, 6, "office");
      const one = (r, w) => `${w}: ${f2(r.irr)}` + (r.converged === false ? " (did not converge, not read)" : ` (${f2(r.lo)}–${f2(r.hi)})`);
      const show = () => {
        let s = `${label}, ${y === "inj" ? "injuries" : "deaths"}. ${one(p, "Year before")}`;
        if (f) s += `; ${one(f, "year after")}`;
        s += `. ${p.n.toLocaleString("en")} tornadoes` + (p.offices_dropped ? `, ${p.offices_dropped} offices without any ${y === "inj" ? "injury" : "death"} left out` : "") + ".";
        det.textContent = s;
      };
      g.addEventListener("click", show); g.addEventListener("keydown", ev => (ev.key === "Enter" || ev.key === " ") && show());
    });
    det.textContent = "Solid upper dot: the record of the year before. Hollow lower dot: the year after, which nobody under the tornado had seen. Tap a row.";
    for (const b of document.querySelectorAll("#seg-y3 button")) b.setAttribute("aria-pressed", b.dataset.v === y);
  }
  for (const b of document.querySelectorAll("#seg-y3 button")) b.addEventListener("click", () => { y = b.dataset.v; draw(); });
  const tb = document.querySelector("#pred33 tbody");
  for (const [k, p] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${p.text}</td><td class="${p.held ? "held" : "failed"}">${p.held ? "held" : "failed"}</td>`;
    tb.appendChild(tr);
  }
  draw(); let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(draw, 120); });
})();
