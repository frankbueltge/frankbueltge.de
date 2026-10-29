// The Mortar (cycle 011). Reads mortar.json (built by build.py) and draws II, III and IV.
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pct = (f) => Math.round(f * 100) + " %";
  const pct1 = (f) => (Math.round(f * 1000) / 10).toFixed(1) + " %";
  const SVGNS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs, parent) => {
    const e = document.createElementNS(SVGNS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };
  const PHASE = ["var(--p1)", "var(--p2)", "var(--p3)", "var(--p4)", "var(--p5)"];
  const MONTHS = [];
  for (let y = 2024, m = 4; y < 2027 || (y === 2027 && m <= 1); m++) {
    if (m > 12) { m = 1; y++; }
    MONTHS.push(y + "-" + String(m).padStart(2, "0"));
  }
  const mname = (k) => new Date(k + "-01T00:00:00Z").toLocaleString("en-GB", { month: "short", year: "numeric", timeZone: "UTC" });

  let D, P;

  fetch("mortar.json").then((r) => r.json()).then((d) => {
    D = d; P = d.blank.people;
    drawTimeline();
    declareTexts();
    for (const i of document.querySelectorAll("input")) i.addEventListener("input", update);
    update();
  });

  // ---------- II. The months ----------
  function drawTimeline() {
    const L = 150, W = 940, cw = (W - L - 10) / MONTHS.length;
    const x = (k) => L + MONTHS.indexOf(k) * cw;
    const xEnd = (iso) => { const k = iso.slice(0, 7); return x(k) + cw; };
    const laneH = 9, laneGap = 2, placeGap = 14;
    const top = 92, placeH = 4 * (laneH + laneGap) + placeGap;
    const H = top + D.places.length * placeH + 26;
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%" });
    const defs = el("defs", {}, svg);
    const pat = el("pattern", { id: "hatch", width: 6, height: 6, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
    el("rect", { width: 6, height: 6, fill: "#fffdf8" }, pat);
    el("line", { x1: 0, y1: 0, x2: 0, y2: 6, stroke: "#1f1c18", "stroke-width": 2.2 }, pat);

    // the blank's months, across everything
    const bx = x("2026-02"), bw = 4 * cw;
    el("rect", { x: bx, y: 4, width: bw, height: H - 8, fill: "#a8432a", opacity: 0.08 }, svg);
    const bl = el("text", { x: bx + bw / 2, y: H - 6, "text-anchor": "middle", "font-size": 10.5, fill: "#a8432a", "font-family": "ui-monospace, Menlo, monospace" }, svg);
    bl.textContent = "Feb–May 2026";

    // month axis
    MONTHS.forEach((k, i) => {
      if (k.endsWith("-01") || i === 0) {
        el("line", { x1: x(k), y1: 6, x2: x(k), y2: H - 20, stroke: "#d8d0c2", "stroke-width": 1 }, svg);
        const t = el("text", { x: x(k) + 2, y: 14, "font-size": 10.5, fill: "#6b645a", "font-family": "ui-monospace, Menlo, monospace" }, svg);
        t.textContent = k.slice(0, 4);
      }
    });

    // monitor lane
    const lab = (txt, y, size, color) => { const t = el("text", { x: 4, y, "font-size": size || 11, fill: color || "#1f1c18" }, svg); t.textContent = txt; return t; };
    lab("FEWS NET on Sudan", 31, 11);
    MONTHS.forEach((k) => {
      if (!(k in D.monitor)) return;
      const lit = D.monitor[k].length > 0;
      const r = el("rect", { x: x(k) + 0.5, y: 22, width: cw - 1, height: 12, fill: lit ? "#8a7f6c" : "url(#hatch)", stroke: lit ? "none" : "#1f1c18", "stroke-width": 0.5 }, svg);
      tip(r, `FEWS NET, Sudan, ${mname(k)}: ` + (lit ? D.monitor[k].join(", ") : "no analysis published"));
    });

    // money lane
    lab("Money recorded", 60, 11);
    lab("US gov. in dark", 74, 10, "#6b645a");
    const mx = Math.max(...D.money.map((m) => m.all));
    D.money.forEach((m) => {
      const h = (m.all / mx) * 40, hu = (m.us / mx) * 40, base = 84;
      const g = el("g", {}, svg);
      el("rect", { x: x(m.month) + 1, y: base - h, width: cw - 2, height: h, fill: "#c9bfae" }, g);
      el("rect", { x: x(m.month) + 1, y: base - hu, width: cw - 2, height: hu, fill: "#2b2a27" }, g);
      tip(g, `${mname(m.month)}: US$ ${fmt(m.all / 1e6)} m recorded toward Sudan's appeals, of which US$ ${fmt(m.us / 1e6)} m by the United States government (OCHA FTS, via the Studio)`);
    });

    // places
    const ANS = ["Apr 2024", "Oct 2024", "Sep 2025", "Jan 2026"];
    D.places.forEach((pl, pi) => {
      const y0 = top + pi * placeH + 8;
      lab(pl.name, y0 + 12, 13);
      ANS.forEach((an, ai) => {
        const y = y0 + ai * (laneH + laneGap);
        const al = el("text", { x: L - 6, y: y + laneH - 1, "text-anchor": "end", "font-size": 9, fill: "#6b645a", "font-family": "ui-monospace, Menlo, monospace" }, svg);
        al.textContent = an;
        (pl.lanes[an] || []).forEach((s) => {
          const sx = x(s.from.slice(0, 7)), ex = xEnd(s.to), w = ex - sx;
          if (sx < L) return;
          const g = el("g", {}, svg);
          if (!s.classified) {
            el("rect", { x: sx + 0.5, y, width: w - 1, height: laneH, fill: "url(#hatch)", stroke: "#1f1c18", "stroke-width": 0.8 }, g);
          } else {
            const tot = s.phases.reduce((a, b) => a + b, 0);
            let cx = sx + 0.5;
            s.phases.forEach((v, i) => {
              const ww = ((w - 1) * v) / tot;
              el("rect", { x: cx, y, width: Math.max(ww, 0), height: laneH, fill: PHASE[i] }, g);
              cx += ww;
            });
          }
          const ph = s.classified ? s.phases.map((v, i) => `P${i + 1} ${fmt(v)}`).join(" · ") : "no phase";
          tip(g, `${pl.name} · analysis of ${an}, ${s.period}\n${mname(s.from.slice(0, 7))} – ${mname(s.to.slice(0, 7))}\n${fmt(s.all)} people · ${ph}\nas the table names it: ${s.rows.map((r) => r.area).join(", ")}`);
        });
      });
    });
    $("#timeline").appendChild(svg);
    $("#finding-months").textContent = "The four months February to May 2026 are a blank in the analysis written in September 2025 and are classified, place by place, in the analysis written in January 2026. The places were reached for those months; they were not reachable from the hour in which the first analysis projected them.";
  }

  function tip(node, text) {
    const t = $("#tip");
    node.style.cursor = "crosshair";
    node.addEventListener("pointermove", (e) => {
      t.hidden = false; t.textContent = ""; text.split("\n").forEach((line, i) => { if (i) t.appendChild(document.createElement("br")); t.appendChild(document.createTextNode(line)); });
      const px = Math.min(e.clientX + 14, window.innerWidth - 310);
      t.style.left = px + "px"; t.style.top = (e.clientY + 14) + "px";
    });
    node.addEventListener("pointerleave", () => { t.hidden = true; });
  }

  // ---------- III. Six places ----------
  // t[i]: the visitor's fourth world for place i: "cls" (classified: the cuts made its blank), "blank", or "unsaid".
  let T;
  const NAMES = () => D.places.map((p) => p.name);
  function declareTexts() {
    T = D.places.map(() => "unsaid");
    const g = $("#placegrid"); g.textContent = "";
    D.places.forEach((pl, i) => {
      const row = document.createElement("div"); row.className = "place"; row.id = "place-" + i;
      const hd = document.createElement("div"); hd.className = "ph";
      const nm = document.createElement("b"); nm.textContent = pl.name; hd.appendChild(nm);
      const sm = document.createElement("span");
      sm.textContent = ` · ${pl.level1} · ${fmt(pl.weight)} people · ${pct(pl.weight / P)} of the blank`; hd.appendChild(sm);
      row.appendChild(hd);
      const cells = document.createElement("div"); cells.className = "cells";
      const seg = (an, per) => pl.lanes[an].find((s) => s.period === per);
      cells.appendChild(cell("record", "the record · Sep 2025", "Feb–May 2026: no phase. " + (pl.blank_row_people ? `The row keeps its ${fmt(pl.blank_row_people)} people.` : "The row writes zero people."), null));
      cells.appendChild(cell("borrowed", "borrowed · Oct 2024", "Dec 2024–May 2025, before the freeze: Phase " + pl.verdicts["Oct 2024"] + ".", seg("Oct 2024", "second projection").phases));
      cells.appendChild(cell("borrowed", "borrowed · Jan 2026", "The same Feb–May 2026, another hour: Phase " + pl.verdicts["Jan 2026"] + ".", seg("Jan 2026", "current").phases));
      const fw = document.createElement("div"); fw.className = "cell unwritten";
      const tg = document.createElement("div"); tg.className = "tag"; tg.textContent = "the fourth world · yours"; fw.appendChild(tg);
      const q = document.createElement("div"); q.className = "what"; q.textContent = "No cuts, projected from Sep 2025:"; fw.appendChild(q);
      const bs = document.createElement("div"); bs.className = "toggle";
      [["cls", "classified"], ["blank", "still blank"], ["unsaid", "unsaid"]].forEach(([v, lab]) => {
        const btn = document.createElement("button"); btn.type = "button"; btn.dataset.v = v; btn.textContent = lab;
        btn.addEventListener("click", () => { T[i] = v; update(); });
        bs.appendChild(btn);
      });
      fw.appendChild(bs); cells.appendChild(fw);
      row.appendChild(cells); g.appendChild(row);
    });
  }

  function cell(cls, tag, what, phases) {
    const c = document.createElement("div"); c.className = "cell " + cls;
    const t = document.createElement("div"); t.className = "tag"; t.textContent = tag; c.appendChild(t);
    const w = document.createElement("div"); w.className = "what"; w.textContent = what; c.appendChild(w);
    const bar = document.createElement("div"); bar.className = "pbar";
    if (phases) {
      const tot = phases.reduce((a, b) => a + b, 0);
      phases.forEach((v, k) => { const s = document.createElement("span"); s.style.width = (100 * v / tot) + "%"; s.style.background = PHASE[k]; s.title = `Phase ${k + 1}: ${fmt(v)}`; bar.appendChild(s); });
    } else bar.classList.add("hatched");
    c.appendChild(bar);
    return c;
  }

  const radio = (n) => document.querySelector(`input[name=${n}]:checked`).value;
  const GRID = Array.from({ length: 101 }, (_, i) => i / 100);
  const listNames = (set) => set.length ? set.map((i) => D.places[i].name).join(", ") : "no place";

  function writeWorld(set) {
    T = D.places.map((_, i) => (set.includes(i) ? "cls" : "blank"));
    update();
  }

  function update() {
    const x = +$("#x").value / 100;
    $("#xout").textContent = pct(x);
    document.querySelectorAll(".xecho").forEach((e) => (e.textContent = pct(x)));
    const cut = radio("cut");
    // The fourth world's blank share C, as a range over the unsaid places.
    const wsum = (st) => D.places.reduce((s, p, i) => s + (T[i] === st ? p.weight : 0), 0) / P;
    const Cr = [wsum("blank"), wsum("blank") + wsum("unsaid")];
    // B: the blank share in the world with the cut, at another hour. Borrowable from Jan 2026 only if the cut is the money.
    const Br = cut === "money" ? [0, 0] : [0, 1];
    const pairs = [];
    for (const B of Br[0] === Br[1] ? [Br[0]] : GRID)
      for (const C of Cr[0] === Cr[1] ? [Cr[0]] : GRID.filter((c) => c >= Cr[0] - 1e-9 && c <= Cr[1] + 1e-9)) pairs.push([B, C]);
    const rules = [
      { name: "But-for the cuts", f: (B, C) => 1 - C, lo: 0 },
      { name: "But-for the siege's hour", f: (B, C) => 1 - B, lo: 0 },
      { name: "Equal shares, the cuts", f: (B, C) => ((1 - C) + B) / 2, lo: 0 },
      { name: "Remainder (what the but-for parts double-count, or leave)", f: (B, C) => 1 - B - C, lo: -1 },
    ];
    const ranges = rules.map((r) => {
      let mn = Infinity, mx = -Infinity;
      for (const [B, C] of pairs) { const v = r.f(B, C); mn = Math.min(mn, v); mx = Math.max(mx, v); }
      return [mn, mx];
    });
    drawPlaces(x, Cr);
    drawReaction(cut, Cr);
    drawRules(rules, ranges);
    words(cut, x, Cr, ranges);
  }

  function drawPlaces(x, Cr) {
    D.places.forEach((pl, i) => {
      const row = $("#place-" + i);
      row.dataset.state = T[i];
      row.querySelectorAll(".toggle button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.v === T[i]));
    });
    // The visitor's number, at the grain of places: the worlds nearest it.
    const near = D.worlds.map((w) => ({ ...w, d: Math.abs(w.share - x) })).sort((a, b) => a.d - b.d).slice(0, 4);
    const exact = near[0].d < 0.005;
    const written = T.every((t) => t !== "unsaid");
    const butfor = 1 - Cr[1], butforHi = 1 - Cr[0];
    let s = exact
      ? `At the grain of places, your ${pct(x)} names one world: the cuts made the blank of ${listNames(near[0].set)}.`
      : `At the grain of places, your ${pct(x)} names no world. A place is classified or it is not, so the cuts' share can take only 64 values. The four nearest are below, each a list of towns, and neighbouring values can share no town at all.`;
    s += written
      ? ` The world you have written gives the cuts ${pct1(butfor)} of the blank.`
      : ` With ${T.filter((t) => t === "unsaid").length} of six places unsaid, the worlds you have written allow the cuts ${pct1(butfor)} to ${pct1(butforHi)}.`;
    $("#finding-places").textContent = s;
    const box = $("#nearlist"); box.textContent = "";
    near.forEach((w) => {
      const b = document.createElement("button"); b.type = "button"; b.className = "near";
      const v = document.createElement("span"); v.className = "v"; v.textContent = (w.share * 100).toFixed(1) + " %"; b.appendChild(v);
      const n = document.createElement("span"); n.textContent = listNames(w.set); b.appendChild(n);
      const a = document.createElement("span"); a.className = "act"; a.textContent = "write this world"; b.appendChild(a);
      b.addEventListener("click", () => writeWorld(w.set));
      box.appendChild(b);
    });
  }

  // ---------- IV. The cut as degrees: Lewontin's lines of response ----------
  function drawReaction(cut, Cr) {
    const box = $("#reaction"); box.textContent = "";
    const key = cut === "monitor" ? "monitor" : "money";
    const g = D.degrees, nocut = key === "money" ? 1 : g["Oct 2024"].monitor;
    const Wd = 760, H = 390, L = 70, R = 30, Tp = 44, Bt = 70;
    const xmax = key === "money" ? 1.35 : 1;
    const X = (v) => L + (v / xmax) * (Wd - L - R), Y = (v) => Tp + (1 - v) * (H - Tp - Bt);
    const svg = el("svg", { viewBox: `0 0 ${Wd} ${H}`, width: "100%" });
    const txt = (s, x, y, o) => { const t = el("text", Object.assign({ x, y, "font-size": 11, fill: "#6b645a", "font-family": "ui-monospace, Menlo, monospace" }, o || {}), svg); t.textContent = s; return t; };
    // axes
    el("line", { x1: L, y1: Y(0), x2: Wd - R, y2: Y(0), stroke: "#1f1c18" }, svg);
    el("line", { x1: L, y1: Y(0), x2: L, y2: Y(1), stroke: "#1f1c18" }, svg);
    [0, 0.5, 1].forEach((v) => { txt(pct(v), L - 8, Y(v) + 4, { "text-anchor": "end" }); el("line", { x1: L, y1: Y(v), x2: Wd - R, y2: Y(v), stroke: "#e8e2d6" }, svg); });
    const ticks = key === "money" ? [0, 0.25, 0.5, 0.75, 1, 1.25] : [0, 1 / 6, 2 / 6, 3 / 6, 4 / 6, 5 / 6, 1];
    ticks.forEach((v) => txt(key === "money" ? pct(v) : Math.round(v * 6) + "/6", X(v), Y(0) + 16, { "text-anchor": "middle" }));
    txt(key === "money" ? "money retained: US government per month, against its Jul–Dec 2024 rate" : "monitor: months of the six before the analysis in which FEWS NET published on Sudan", (L + Wd - R) / 2, H - 28, { "text-anchor": "middle", "font-size": 12, fill: "#1f1c18" });
    txt("share of the 841,404 without a phase", 14, 16, { "font-size": 12, fill: "#1f1c18" });
    // no-cut line
    el("line", { x1: X(nocut), y1: Y(0) + 4, x2: X(nocut), y2: Y(1) - 6, stroke: "#a8432a", "stroke-dasharray": "2 3" }, svg);
    txt("no cut", X(nocut) + 4, Y(1) - 10, { fill: "#a8432a" });
    const pt = (an) => g[an][key];
    // another hour: the line through Oct 2024 and Jan 2026
    const janBorrow = cut === "money" || cut === "monitor";
    const ox = X(pt("Oct 2024")), jx = X(pt("Jan 2026"));
    if (janBorrow) el("line", { x1: Math.min(ox, jx), y1: Y(0), x2: Math.max(ox, jx), y2: Y(0), stroke: "#8a7f6c", "stroke-width": 5, "stroke-linecap": "round", opacity: 0.6 }, svg);
    // the siege's hour: from Sep 2025 to the visitor's fourth world
    const sx = X(pt("Sep 2025")), fx = X(nocut);
    const mid = (Cr[0] + Cr[1]) / 2;
    if (Cr[1] - Cr[0] > 1e-6) {
      el("polygon", { points: `${sx},${Y(1)} ${fx},${Y(Cr[1])} ${fx},${Y(Cr[0])}`, fill: "#a8432a", opacity: 0.12 }, svg);
      el("line", { x1: fx, y1: Y(Cr[0]), x2: fx, y2: Y(Cr[1]), stroke: "#a8432a", "stroke-width": 6, opacity: 0.45 }, svg);
    }
    el("line", { x1: sx, y1: Y(1), x2: fx, y2: Y(mid), stroke: "#a8432a", "stroke-width": 2, "stroke-dasharray": "6 4" }, svg);
    el("circle", { cx: fx, cy: Y(mid), r: 6, fill: "#fffdf8", stroke: "#a8432a", "stroke-width": 2, "stroke-dasharray": "3 2" }, svg);
    txt("the fourth world, yours", fx + 10, Y(mid) + 4, { fill: "#a8432a" });
    // record points
    const dot = (an, y, label, hollow, dy) => {
      const cx = X(pt(an));
      const c = el("circle", { cx, cy: Y(y), r: 7, fill: hollow ? "#fffdf8" : "#1f1c18", stroke: "#1f1c18", "stroke-width": 2 }, svg);
      txt(label, cx + (dy && dy.dx || 10), Y(y) + (dy && dy.dy || -10), { fill: "#1f1c18", "text-anchor": dy && dy.anchor || "start" });
      tip(c, `Analysis of ${an}: money ${pct(g[an].money)} of the 2024 rate (months held ${g[an].months_held.join(" to ")}), FEWS NET on Sudan in ${g[an].monitor_months} of ${g[an].n} months`);
    };
    const same = key === "monitor" && Math.abs(pt("Oct 2024") - pt("Jan 2026")) < 1e-6;
    dot("Sep 2025", 1, "Sep 2025 · the siege's hour · blank", false, { dx: 12, dy: 4 });
    dot("Oct 2024", 0, same ? "Oct 2024 and Jan 2026 · another hour" : "Oct 2024 · another hour", false, same ? { dx: 0, dy: -14, anchor: "middle" } : { dx: 0, dy: -14, anchor: "end" });
    if (!same) dot("Jan 2026", 0, cut === "both" ? "Jan 2026 · money as after, monitor as before" : "Jan 2026 · another hour", cut === "both", { dx: 0, dy: -14, anchor: "middle" });
    box.appendChild(svg);
    const dm = g["Sep 2025"].money, jm = g["Jan 2026"].money;
    let s;
    if (cut === "money") s = `Between the blank and its closing the money did not move: ${pct(dm)} of its 2024 rate before September 2025, ${pct(jm)} before January 2026. So the record holds the same cut in two hours, and in the other hour it wrote no blank. The grey line is flat at zero. The red line is parallel to it only if your fourth world is all blank, that is, only if the cuts made none of it. Any share above zero for the money says that the cuts and the hour interlocked.`;
    else if (cut === "monitor") s = `The monitor moved with the hour: dark in all six months before September 2025, lit in ${g["Jan 2026"].monitor_months} of six before January 2026, as it was in ${g["Oct 2024"].monitor_months} of three before October 2024. Both classified worlds stand at the same setting, so the record never shows the monitor dark at another hour. It cannot tell the monitor's part from the hour's, and the rules in V stay open on both sides.`;
    else s = `As one cut, money and monitor disagree about January 2026: by the money it stood after the freeze, by the monitor before it. The record then holds no world of the cut at another hour, the hollow point cannot be borrowed, and the rules in V stay open on both sides.`;
    $("#finding-degrees").textContent = s;
  }

  function drawRules(rules, ranges) {
    const box = $("#rulebars"); box.textContent = "";
    rules.forEach((r, i) => {
      const row = document.createElement("div"); row.className = "rule";
      const nm = document.createElement("div"); nm.className = "name"; nm.textContent = r.name; row.appendChild(nm);
      const tr = document.createElement("div"); tr.className = "track";
      const span = (v) => ((v - r.lo) / (1 - r.lo)) * 100;
      if (r.lo < 0) { const t = document.createElement("div"); t.className = "tick"; t.style.left = span(0) + "%"; tr.appendChild(t); }
      const val = document.createElement("div"); val.className = "val";
      const rg = ranges[i];
      const s = document.createElement("div"); s.className = "span" + (rg[1] - rg[0] > 0.01 ? " wide" : "");
      s.style.left = span(rg[0]) + "%"; s.style.width = Math.max(span(rg[1]) - span(rg[0]), 0.4) + "%";
      tr.appendChild(s);
      val.textContent = rg[1] - rg[0] > 0.005 ? `${pct(rg[0])} to ${pct(rg[1])}` : pct(rg[0]);
      row.appendChild(tr); row.appendChild(val); box.appendChild(row);
    });
  }

  function words(cut, x, Cr, ranges) {
    const I = ranges[3], bf = ranges[0];
    let s;
    if (cut === "money" && bf[0] > 0.005) s = `With the cut read as the money, every world you have left open gives the cuts a part, and the record already holds the cut without the blank. So the remainder stands above zero throughout: the two but-for parts together claim more than the whole. That is the mark of causes that interlock, and Lewontin's sentence applies.`;
    else if (cut === "money" && bf[1] < 0.005) s = `You have written a world in which the cuts made none of the blank: every place would still have stood blank without them. Only here do the lines run parallel, and the hour takes the whole.`;
    else if (cut === "money") s = `With the cut read as the money, the cuts' but-for part runs from ${pct(bf[0])} to ${pct(bf[1])} over the places you left unsaid. Above zero, the causes interlock.`;
    else s = `With this cut the record borrows no world of the cut at another hour, so even a fourth world written town by town leaves the equal share open from ${pct(ranges[2][0])} to ${pct(ranges[2][1])}. The record's whole answer here is a range, and the town you name decides less than the world you cannot borrow.`;
    $("#finding-rules").textContent = s;
    $("#lewontin").hidden = !(I[0] > 0.005 || I[1] < -0.005);
  }
})();
