// The Mortar (cycle 011). Reads mortar.json (built by build.py) and draws II, III and IV.
(function () {
  "use strict";
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => Math.round(n).toLocaleString("en-US");
  const pct = (f) => Math.round(f * 100) + " %";
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

  // ---------- III and IV ----------
  function declareTexts() {
    const sum = (a, b) => D.money.filter((m) => m.month >= a && m.month <= b).reduce((s, m) => s + m.us, 0);
    const before = sum("2024-07", "2024-12"), after = sum("2025-09", "2025-12");
    $("#jan-after-why").textContent = `the United States government recorded US$ ${fmt(after / 1e6)} m toward Sudan's appeals in Sep–Dec 2025, against US$ ${fmt(before / 1e6)} m in Jul–Dec 2024.`;
    $("#jan-before-why").textContent = "FEWS NET had been publishing on Sudan again since its Alert of 5 September 2025.";
  }

  const radio = (n) => document.querySelector(`input[name=${n}]:checked`).value;
  const GRID = Array.from({ length: 101 }, (_, i) => i / 100);

  function update() {
    const x = +$("#x").value / 100;
    $("#xout").textContent = pct(x);
    document.querySelectorAll(".xecho").forEach((e) => (e.textContent = pct(x)));
    const jan = radio("jan"), read = radio("read");
    const Bknown = jan === "after" ? 0 : null; // blank share in the world after the freeze, at another hour
    // Collect every (B, C) pair the declarations allow; C is the unwritten world (before the freeze, the siege's hour).
    const pairs = [];
    for (const B of Bknown === null ? GRID : [Bknown]) {
      if (read === "butfor") pairs.push([B, 1 - x]);
      else if (read === "shapley") { const C = 1 + B - 2 * x; if (C >= -1e-9 && C <= 1 + 1e-9) pairs.push([B, Math.min(1, Math.max(0, C))]); }
      else for (const C of GRID) pairs.push([B, C]);
    }
    const feasible = pairs.length > 0;
    const rules = [
      { name: "But-for the cuts", f: (B, C) => 1 - C, lo: 0 },
      { name: "But-for the siege's hour", f: (B, C) => 1 - B, lo: 0 },
      { name: "Equal shares, the cuts", f: (B, C) => ((1 - C) + B) / 2, lo: 0 },
      { name: "Remainder (what the but-for parts double-count, or leave)", f: (B, C) => 1 - B - C, lo: -1 },
    ];
    const ranges = rules.map((r) => {
      if (!feasible) return null;
      let mn = Infinity, mx = -Infinity;
      for (const [B, C] of pairs) { const v = r.f(B, C); mn = Math.min(mn, v); mx = Math.max(mx, v); }
      return [mn, mx];
    });
    const Brange = feasible ? [Math.min(...pairs.map((p) => p[0])), Math.max(...pairs.map((p) => p[0]))] : null;
    const Crange = feasible ? [Math.min(...pairs.map((p) => p[1])), Math.max(...pairs.map((p) => p[1]))] : null;
    drawGrid(jan, read, x, Brange, Crange, feasible);
    drawRules(rules, ranges, feasible);
    words(jan, read, x, Brange, Crange, ranges, feasible);
  }

  function world(cls, tag, what, range, note) {
    const w = document.createElement("div");
    w.className = "world " + cls;
    const t = document.createElement("div"); t.className = "tag"; t.textContent = tag; w.appendChild(t);
    const p = document.createElement("div"); p.className = "what"; p.textContent = what; w.appendChild(p);
    const bar = document.createElement("div"); bar.className = "bar";
    const n = document.createElement("div"); n.className = "n";
    if (range && Math.abs(range[1] - range[0]) < 1e-6) {
      const f = document.createElement("div"); f.className = "fill"; f.style.width = range[0] * 100 + "%"; bar.appendChild(f);
      n.textContent = `${fmt(range[0] * P)} of ${fmt(P)} without a phase`;
    } else if (range) {
      const f = document.createElement("div"); f.className = "fill"; f.style.width = range[0] * 100 + "%"; bar.appendChild(f);
      const r = document.createElement("div"); r.className = "range"; r.style.left = range[0] * 100 + "%"; r.style.width = (range[1] - range[0]) * 100 + "%"; bar.appendChild(r);
      n.textContent = `anywhere from ${fmt(range[0] * P)} to ${fmt(range[1] * P)} without a phase`;
    } else {
      bar.style.background = "#e8e2d6";
      n.textContent = "no world fits";
    }
    w.appendChild(bar); w.appendChild(n);
    if (note) { const q = document.createElement("div"); q.className = "n"; q.style.color = "var(--muted)"; q.textContent = note; w.appendChild(q); }
    return w;
  }

  function drawGrid(jan, read, x, Br, Cr, feasible) {
    const g = $("#grid"); g.textContent = "";
    const h = (txt, cls) => { const d = document.createElement("div"); d.className = "h " + (cls || ""); d.textContent = txt; g.appendChild(d); };
    h("", "corner"); h("The siege's hour: projected from Sep 2025"); h("Another hour");
    h("Money and monitor as after the freeze", "rh");
    g.appendChild(world("record", "the record", "Analysis of Sep 2025, second projection, Feb–May 2026: the six places with people and no phase.", [1, 1]));
    g.appendChild(jan === "after"
      ? world("borrowed", "borrowed from Jan 2026", "Analysis of Jan 2026, current period, the same Feb–May 2026: every place classified.", [0, 0], "Borrowed on your word that January 2026 stood after the freeze.")
      : world("unwritten", "unwritten", "No analysis written after the freeze from another hour, on your declaration.", Br));
    h("Money and monitor as before the freeze", "rh");
    const cw = read === "none" ? "Nobody wrote it. Every value is tried." : read === "butfor" ? "Written by your answer, read as but-for." : "Written by your answer, read as equal shares.";
    g.appendChild(world("unwritten", "unwritten — the fourth world", "A fully funded IPC, its monitor running, projecting from September 2025. " + cw, feasible ? Cr : null));
    g.appendChild(world("borrowed", jan === "before" ? "borrowed from Oct 2024 and Jan 2026" : "borrowed from Oct 2024", "Analysis of Oct 2024, second projection, Dec 2024–May 2025: every place classified." + (jan === "before" ? " And Jan 2026, on your word." : ""), [0, 0], "The places are drawn differently; a verdict is borrowed, not a count."));
  }

  function drawRules(rules, ranges, feasible) {
    const box = $("#rulebars"); box.textContent = "";
    rules.forEach((r, i) => {
      const row = document.createElement("div"); row.className = "rule";
      const nm = document.createElement("div"); nm.className = "name"; nm.textContent = r.name; row.appendChild(nm);
      const tr = document.createElement("div"); tr.className = "track";
      const span = (v) => ((v - r.lo) / (1 - r.lo)) * 100;
      if (r.lo < 0) { const t = document.createElement("div"); t.className = "tick"; t.style.left = span(0) + "%"; tr.appendChild(t); }
      const val = document.createElement("div"); val.className = "val";
      const rg = ranges[i];
      if (rg) {
        const s = document.createElement("div"); s.className = "span" + (rg[1] - rg[0] > 0.01 ? " wide" : "");
        s.style.left = span(rg[0]) + "%"; s.style.width = Math.max(span(rg[1]) - span(rg[0]), 0.4) + "%";
        tr.appendChild(s);
        val.textContent = rg[1] - rg[0] > 0.005 ? `${pct(rg[0])} to ${pct(rg[1])}` : pct(rg[0]);
      } else val.textContent = "no world";
      row.appendChild(tr); row.appendChild(val); box.appendChild(row);
    });
  }

  function words(jan, read, x, Br, Cr, ranges, feasible) {
    let s;
    const people = (f) => fmt(f * P);
    if (!feasible) {
      s = `Read as equal shares, no world fits ${pct(x)}. With January 2026 counted as after the freeze, the cuts' equal share of this blank can be at most 50 %: the record already holds a world with the cuts and without the blank.`;
    } else if (read === "none") {
      s = `With the fourth world unwritten, the record allows the cuts any but-for share from ${pct(ranges[0][0])} to ${pct(ranges[0][1])}. That is the record's whole answer to the question's second half.`;
    } else if (read === "butfor") {
      s = `Read as but-for, your ${pct(x)} writes the fourth world: had there been no cuts, ${people(1 - x)} of the ${people(1)} people would still have stood without a phase, projected from September 2025. No record holds that world. You wrote it.`;
      if (jan === "after" && x > 0) s += " And since January 2026 already shows the cuts without the blank, any share above zero says the two causes interlocked: mortar, not bricks.";
    } else {
      s = Cr[1] - Cr[0] < 1e-6
        ? `Read as equal shares, your ${pct(x)} writes the fourth world: had there been no cuts, ${people(Cr[0])} people would still have stood without a phase. No record holds that world. You wrote it.`
        : `Read as equal shares, your ${pct(x)} fits fourth worlds from ${people(Cr[0])} to ${people(Cr[1])} people without a phase, depending on the world you declined to borrow from January 2026.`;
    }
    $("#finding-worlds").textContent = s;
    const I = ranges && ranges[3];
    $("#lewontin").hidden = !(I && (I[0] > 0.005 || I[1] < -0.005 || (read !== "none" && Math.abs(I[0]) > 0.005)));
  }
})();
