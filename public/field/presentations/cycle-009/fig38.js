// Study 38 page (third coda): the record behind the tornadoes that carry the ratio. Two switches set how two
// records are read (McLoud's injured, Louisiana's track); the figure shows section 8's ratio refitted under that reading.
(function () {
  const S = window.S38;
  const NS = "http://www.w3.org/2000/svg";
  const el = (n, a, p) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); p && p.appendChild(e); return e; };
  const st = { mc: "db", la: "split" };
  const KEY = { "db split": "full", "office split": "mcloud_1_injured", "db one": "louisiana_one_track", "office one": "both" };
  const NAME = { full: "both records as the database has them", mcloud_1_injured: "McLoud as its office’s event page counts it",
                 louisiana_one_track: "Louisiana as one tornado (stands)", both: "both (withdrawn 2026-10-23)" };
  const svg = document.getElementById("rec38"), out = document.getElementById("rec38det");
  const f2 = v => v.toFixed(2);
  function draw() {
    svg.innerHTML = "";
    const narrow = svg.parentNode.getBoundingClientRect().width < 600;
    const W = narrow ? 380 : 900, H = narrow ? 260 : 220, x0 = narrow ? 112 : 300, x1 = W - 18, y0 = 34, y1 = H - 40;
    svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
    const lo = 0.7, hi = 2.3, X = v => x0 + (Math.log(v) - Math.log(lo)) / (Math.log(hi) - Math.log(lo)) * (x1 - x0);
    for (const v of [0.8, 1, 1.25, 1.5, 2]) {
      el("line", { class: "grid", x1: X(v), x2: X(v), y1: y0 - 8, y2: y1 }, svg);
      el("text", { x: X(v), y: y1 + 16, "text-anchor": "middle" }, svg).textContent = v.toFixed(2);
    }
    for (const [v, n] of [[1.04, "learning 1.04"], [1.46, "habit 1.46"]]) {
      el("line", { class: "one", x1: X(v), x2: X(v), y1: y0 - 8, y2: y1 }, svg);
      el("text", { class: "lab", x: X(v), y: y0 - 14, "text-anchor": "middle" }, svg).textContent = n;
    }
    el("text", { class: "lab", x: (x0 + x1) / 2, y: H - 8, "text-anchor": "middle" }, svg).textContent =
      narrow ? "injured, run 3+ vs after a hit (log)" : "injured ratio, after a run of 3+ against right after a hit (log; 95 % interval)";
    const order = ["full", "mcloud_1_injured", "louisiana_one_track", "both"], cur = KEY[`${st.mc} ${st.la}`];
    const step = (y1 - y0) / order.length;
    order.forEach((k, i) => {
      const f = S.fits[k], y = y0 + step * (i + 0.5), on = k === cur;
      el("text", { class: on ? "lab" : "", x: x0 - 8, y: y + 4, "text-anchor": "end" }, svg).textContent =
        narrow ? { full: "as recorded", mcloud_1_injured: "McLoud 1 (page)", louisiana_one_track: "LA one track ✓", both: "both, withdrawn" }[k] : NAME[k];
      el("line", { class: on ? "w" : "grid", x1: X(f.lo), x2: X(f.hi), y1: y, y2: y, "stroke-width": on ? 3 : 2 }, svg);
      el("circle", { class: "pt" + (on ? " above" : ""), cx: X(f.irr), cy: y, r: on ? 6 : 4 }, svg);
    });
    const f = S.fits[cur];
    out.textContent = `${NAME[cur][0].toUpperCase() + NAME[cur].slice(1)}: ${f2(f.irr)} (95 % interval ${f2(f.lo)}–${f2(f.hi)}). ` +
      `The interval holds the learning price, 1.04, and the habit price, 1.46.` +
      (st.la === "one" ? ` As one EF3 track of 20.7 miles, the model expects ${f.mu_la.toFixed(1)} injured in Louisiana, not ${S.fits.full.mu_la.toFixed(1)}.` : "");
  }
  for (const [id, k] of [["seg-mc38", "mc"], ["seg-la38", "la"]])
    document.querySelectorAll(`#${id} button`).forEach(bt => bt.addEventListener("click", () => {
      st[k] = bt.dataset.v; document.querySelectorAll(`#${id} button`).forEach(x => x.setAttribute("aria-pressed", x === bt)); draw();
    }));
  addEventListener("resize", draw);
  draw();
  const T = document.querySelector("#tab38 tbody");
  for (const r of S.rows) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${r.st}, ${r.date}, EF${r.ef}</td><td class="n">${r.spc}</td><td class="n">${r.se}</td>` +
      `<td class="${r.cls === "agrees" || r.cls.endsWith("agrees") ? "held" : "failed"}">${r.cls}</td><td>${r.read}</td>`;
    T.appendChild(tr);
  }
  const P = document.querySelector("#pred38 tbody");
  for (const [k, v] of Object.entries(S.predictions)) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td>${k}</td><td>${v.text}</td><td class="${v.held ? "held" : "failed"}">${v.held ? "held" : "failed"}</td>`;
    P.appendChild(tr);
  }
})();
