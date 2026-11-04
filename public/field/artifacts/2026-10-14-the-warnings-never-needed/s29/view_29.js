// Study 29's section (#s29): every alert by its adjusted chance, and one alert's plane of magnitude
// against distance, where the visitor can set any candidate and count the earlier windows that beat it.
(function () {
  const D = window.D29, R = D.res, A = D.alerts, $ = id => document.getElementById(id), NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
  const pct = x => (100 * x).toFixed(1) + " %", fp = p => p < 0.01 ? p.toFixed(3) : p.toFixed(2);
  const when = t => new Date(t * 6e4).toISOString().slice(0, 16).replace("T", " ") + "Z";
  const by = {}; A.forEach(a => by[a.i] = a);
  // headline
  $("s29-n").textContent = R.n; $("s29-behind").textContent = R.behind + " (" + pct(R.behind / R.n) + ", 95 % interval " + pct(R.behind_ci[0]) + "–" + pct(R.behind_ci[1]) + ")";
  $("s29-beside").textContent = R.beside;
  // figure 1: alerts by adjusted chance
  let sel = 1893;
  function f1() {
    const s = $("s29f1"); s.innerHTML = ""; const W = 900, L = 150, Rr = 20, lo = Math.log10(1 / 365), x = p => L + (W - L - Rr) * (Math.log10(p) - lo) / (0 - lo);
    const rows = [["met in its own minutes (study 27)", a => a.strict27], ["met within a day only", a => !a.strict27 && a.live27], ["left unmet by study 27", a => !a.live27]];
    el("line", { x1: x(0.05), x2: x(0.05), y1: 16, y2: 200, stroke: "var(--muted)", "stroke-dasharray": "3 3" }, s);
    el("text", { x: x(0.05) + 4, y: 14 }, s).textContent = "0.05: behind ← → beside";
    [1 / 365, 0.01, 0.05, 0.2, 1].forEach(p => { el("text", { x: x(p), y: 222, "text-anchor": "middle" }, s).textContent = p === 1 / 365 ? "1/365" : String(p); });
    el("text", { x: L, y: 240 }, s).textContent = "adjusted chance: the share of the 364 earlier windows at this place whose best event is as unlikely as the live one's";
    rows.forEach(([lab, f], j) => {
      const y0 = 50 + j * 62; el("text", { x: 0, y: y0 - 22 }, s).textContent = lab;
      const rs = A.filter(f).sort((a, b) => a.pa - b.pa); const seen = {};
      rs.forEach(a => {
        const cx = x(a.pa), key = Math.round(cx / 7); seen[key] = (seen[key] || 0) + 1; const cy = y0 - 14 + ((seen[key] - 1) % 6) * 7;
        const c = el("circle", { cx: cx, cy: cy, r: a.i === sel ? 5 : 3.2, fill: a.behind ? "var(--seen)" : "var(--unseen)", stroke: a.i === sel ? "var(--fg)" : "none", "stroke-width": 1.5, tabindex: 0, "data-i": a.i }, s);
        c.style.cursor = "pointer"; const go = () => { sel = a.i; f1(); f2(null); };
        c.addEventListener("click", go); c.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      });
    });
  }
  // figure 2: one alert's plane
  function f2(cand) {
    const a = by[sel], s = $("s29f2"); s.innerHTML = ""; const W = 900, H = 330, L = 50, B = 290, T = 14, Rr = 16, x = d => L + (W - L - Rr) * d / 300, y = m => B - (B - T) * (m - 1) / 6.5;
    [1, 2, 3, 4, 5, 6, 7].forEach(m => { el("line", { x1: L, x2: W - Rr, y1: y(m), y2: y(m), stroke: "var(--rule)" }, s); el("text", { x: L - 8, y: y(m) + 4, "text-anchor": "end" }, s).textContent = "M" + m; });
    [0, 50, 100, 150, 200, 250, 300].forEach(d => el("text", { x: x(d), y: B + 18, "text-anchor": "middle" }, s).textContent = d + " km");
    const c = cand || (a.best ? [a.best.mag, a.best.km] : null);
    if (c) {
      el("rect", { x: x(0), y: y(7.5), width: x(c[1]) - x(0), height: y(Math.max(1, c[0])) - y(7.5), fill: "var(--unseen)", opacity: 0.12 }, s);
    }
    a.plc.forEach(p => el("circle", { cx: x(p[1]), cy: y(Math.min(7.5, p[0])), r: 2, fill: "var(--muted)", opacity: 0.5 }, s));
    a.live.forEach(e => el("circle", { cx: x(e[1]), cy: y(Math.min(7.5, e[0])), r: 5, fill: a.behind ? "var(--seen)" : "var(--unseen)", stroke: "var(--fg)", "stroke-width": 1 }, s));
    const hit = el("rect", { x: L, y: T, width: W - L - Rr, height: B - T, fill: "transparent" }, s); hit.style.cursor = "crosshair";
    hit.addEventListener("click", ev => { const r = s.getBoundingClientRect(), px = (ev.clientX - r.left) * W / r.width, py = (ev.clientY - r.top) * H / r.height;
      f2([Math.max(1, Math.round((1 + 6.5 * (B - py) / (B - T)) * 10) / 10), Math.max(1, Math.round(300 * (px - L) / (W - L - Rr)))]); });
    let n = a.S; if (cand) { const ks = new Set(); a.plc.forEach(p => { if (p[0] >= c[0] && p[1] <= c[1]) ks.add(p[2]); }); n = ks.size; }  // the default reads the exact count; a chosen point counts the rounded frontiers
    $("s29-sel").textContent = "Message " + a.i + " · " + when(a.t) + " · " + a.places.join("; ") + (a.np > 3 ? " …" : "") + " · " + a.code + ': "' + a.w + '"';
    $("s29-read").textContent = (a.nlive ? "In its own minutes the catalogue holds " + a.nlive + " event" + (a.nlive > 1 ? "s" : "") + " of M1 or more within 300 km" + (a.best ? "; the least likely is M" + a.best.mag + " at " + a.best.km + " km, " + Math.abs(a.best.lag_min) + " min " + (a.best.lag_min >= 0 ? "before" : "after") + " (" + a.best.id + ")" : "") : "In its own minutes the catalogue holds no event of M1 or more within 300 km") + ". "
      + (c ? (cand ? "Your point, M" + c[0] + " within " + c[1] + " km: " : "") + n + " of 364 earlier windows hold something at least as large and as near. " : "")
      + "Adjusted chance " + fp(a.pa) + ": " + (a.behind ? "an event is behind this alert." : "what lies near it lies beside it.");
  }
  document.querySelectorAll("#s29 [data-a]").forEach(b => b.addEventListener("click", () => { sel = +b.dataset.a; f1(); f2(null); }));
  f1(); f2(null);
  // domains
  const tb = $("s29d"); const order = Object.keys(R.domains);
  order.forEach(k => { const g = R.domains[k], [fl, rad, wn] = k.split("|"); const differ = g.quiet_k364 !== g.quiet_mean;
    const tr = document.createElement("tr"); if (differ) tr.className = "differ";
    tr.innerHTML = `<td>M${fl}+, ${rad} km, ${wn === "strict" ? "its own minutes" : "±1 day"}</td><td class="n">${g.live}</td><td class="n">${pct(g.k364_share)}</td><td class="n">${pct(g.mean_share)}</td><td>${differ ? "<b>differs</b>" : (g.quiet_mean ? "quiet" : "not quiet")}</td>`;
    tb.appendChild(tr); });
  // predictions
  const P = R.predictions, txt = {
    P1: ["Alert 1893: best candidate's chance ≥ 0.5 and adjusted ≥ 0.2", v => "chance " + fp(v[0]) + ", adjusted " + fp(v[1])],
    P2: ["Alerts 1893, 10607, 10608 each adjusted > 0.05", v => v.map(fp).join(", ")],
    P3: ["Every alert with an M5+ within 300 km in its minutes: adjusted ≤ 0.01", v => v[1] + " of " + v[0]],
    P4: ["≥ 95 % of the 131 met in their own minutes are behind", v => v[0] + " of " + v[1] + " (" + pct(v[0] / v[1]) + ")"],
    P5: ["≥ 45 of 50 domains: one earlier year and 364 earlier days give the same quiet class", v => v + " of 50"] };
  const pb = $("s29p"); Object.keys(txt).forEach(k => { const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}. ${txt[k][0]}</td><td>${txt[k][1](P[k].value)}</td><td class="${P[k].held ? "held" : "failed"}">${P[k].held ? "held" : "failed"}</td>`; pb.appendChild(tr); });
})();
