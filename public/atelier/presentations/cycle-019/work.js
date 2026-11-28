/* Bound to Proceed — draws the log, the night and the house's log from data/log.js. No library. */
(function () {
  "use strict";
  var D = window.LOG;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function cut(s, n) { return s.length > n ? s.slice(0, n - 1) + "…" : s; }

  var COLNAME = { say: "SAY SO", look: "LOOK INTO", act: "ACT ON IT", pass: "PASS ON", public: "TELL THE PUBLIC",
    when: "BY WHEN", why: "IF NOT, WHY", silent: "IF SILENT", who: "WHO ANSWERS" };
  var COLDESC = { say: "say so to the one who sent the word", look: "look into it", act: "act on it: go, order a stop, take it up",
    pass: "pass the word on", public: "tell the public", when: "a deadline that runs from receipt", why: "write down why, if it does not act",
    silent: "what follows if the receiver does nothing", who: "whether the record says a person or a machine answered" };
  var SHORT = { duty: "must", recommended: "should", power: "may", silence: "silence" };
  /* in-cell text only; the full label stays in the panel and the aria-label */
  var CELLTXT = { "yearly total": "yearly sum", "flag State law": "flag law", "listen 5 min": "5 min", "1 to 2⅓ min": "1–2⅓ min",
    "every session": "per session", "marked lapsed": "lapsed", "a machine, named": "a machine", "silence is read as an answer": "silence",
    "a person, when he answers": "a person", "in a public file": "public file" };
  var BANDS = [
    { key: "sea", title: "AT SEA", sub: "SOLAS, UNCLOS, the radio rules" },
    { key: "ai", title: "AI, IN LAWS AND CODES", sub: "the Field's study 94, 19 receivers" },
    { key: "house", title: "THIS HOUSE", sub: "its constitutions and its channel" }
  ];
  var KIND = { "public body": 0, "own record": 1, "other party": 2, "public": 3 };

  /* ---------- I. the log ---------- */
  var svg = document.getElementById("log");
  var W = 1000, L = 300, CW = (W - L - 6) / 9, RH = 21, HEAD = 40, BH = 30;
  var rows = [];
  BANDS.forEach(function (b) {
    var rs = D.rows.filter(function (r) { return r.band === b.key; });
    if (b.key === "ai") rs = rs.slice().sort(function (a, c) { return (KIND[a.kind] - KIND[c.kind]); });
    rows.push({ band: b });
    rs.forEach(function (r) { rows.push(r); });
  });
  var y = HEAD, layout = [];
  rows.forEach(function (r) { if (r.band && r.band.key) { layout.push({ band: r.band, y: y }); y += BH; } else { layout.push({ row: r, y: y }); y += RH; } });
  var H = y + 8;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  var defs = el("defs", {}, svg);
  var pat = el("pattern", { id: "hatch", width: 4, height: 4, patternUnits: "userSpaceOnUse", patternTransform: "rotate(45)" }, defs);
  el("line", { "class": "hl", x1: 0, y1: 0, x2: 0, y2: 4 }, pat);

  var whycol = el("rect", { "class": "whycol", x: L + 6 * CW, y: HEAD - 4, width: CW, height: H - HEAD }, svg);
  D.columns.forEach(function (c, i) {
    var x = L + i * CW;
    el("line", { "class": "colrule", x1: x, y1: 8, x2: x, y2: H - 6 }, svg);
    var parts = COLNAME[c].split(" ");
    var l1 = parts.length > 2 ? parts.slice(0, parts.length - 1).join(" ") : parts[0];
    var l2 = parts.length > 2 ? parts[parts.length - 1] : (parts[1] || "");
    el("text", { "class": "hd", x: x + CW / 2, y: 20, "text-anchor": "middle", "data-col": c }, svg, l1);
    if (l2) el("text", { "class": "hd", x: x + CW / 2, y: 32, "text-anchor": "middle" }, svg, l2);
  });
  el("line", { "class": "bandrule", x1: 0, y1: HEAD - 4, x2: W, y2: HEAD - 4 }, svg);

  var gRows = el("g", {}, svg), sel = el("rect", { "class": "sel", x: -99, y: -99, width: 0, height: 0 }, svg);
  var cellIndex = [];
  layout.forEach(function (it) {
    if (it.band) {
      el("text", { "class": "band", x: 0, y: it.y + 19 }, gRows, it.band.title);
      el("text", { x: 0 + it.band.title.length * 7.4 + 10, y: it.y + 19 }, gRows, it.band.sub);
      el("line", { "class": "bandrule", x1: 0, y1: it.y + 26, x2: W, y2: it.y + 26 }, gRows);
      return;
    }
    var r = it.row, g = el("g", { "class": "row", "data-id": r.id, "data-band": r.band, "data-kind": r.kind || "" }, gRows);
    var yy = it.y;
    el("line", { "class": "base", x1: 0, y1: yy + RH - 1, x2: W, y2: yy + RH - 1 }, g);
    var t = el("text", { "class": "nm", x: 0, y: yy + 14 }, g);
    // two receivers stand in two rows each (a developer's report, the public's); a cut name kept them apart nowhere (critique of 26 November)
    var ROWNAME = { CA4: "Cal OES, from a developer", CA6: "Cal OES, from the public", NY4: "DFS office, from a developer",
      NY6: "DFS office, from the public", EU4: "AI Office, under the Act", COP3: "AI Office, under the Code" };
    var nm = r.band === "ai" ? cut(ROWNAME[r.id] || r.name, 30) : cut(r.name, 44);
    t.appendChild(document.createTextNode(nm));
    if (r.band === "ai") el("tspan", { dx: 6, "class": "mute" }, t, cut(r.instrument, 18));
    D.columns.forEach(function (c, i) {
      var cl = r.cells[c], x = L + i * CW + 3, w = CW - 6, cy = yy + 2, ch = RH - 5;
      if (cl.v !== "none") {
        var cls = cl.v === "duty" ? "c-duty" : cl.v === "recommended" ? "c-rec" : cl.v === "power" ? "c-power" : "c-silence";
        el("rect", { "class": cls, x: x, y: cy, width: w, height: ch, rx: 1, "data-v": cl.v, "data-col": c }, g);
        var lab = (c === "when" || c === "who" || c === "silent" || cl.v === "silence") ? cl.label : SHORT[cl.v];
        if (c === "public" && /yearly/.test(cl.label)) lab = "yearly total";
        if (CELLTXT[lab]) lab = CELLTXT[lab];
        el("text", { "class": cl.v === "duty" ? "t-duty" : (cl.v === "silence" ? "t-silence" : (cl.v === "recommended" ? "t-rec" : "")), x: x + w / 2, y: cy + ch / 2 + 3.5, "text-anchor": "middle" }, g, cut(lab, 11));
      } else if (c === "why") {
        el("rect", { "class": "c-owed", x: x, y: cy, width: w, height: ch, rx: 1 }, g);
      }
      var hit = el("rect", { "class": "hit", x: L + i * CW, y: yy, width: CW, height: RH, tabindex: 0, role: "button",
        "aria-label": r.name + ", " + COLNAME[c] + ": " + (cl.v === "none" ? "nothing ruled" : cl.label) }, g);
      cellIndex.push({ r: r, c: c, x: L + i * CW, y: yy });
      hit.addEventListener("click", function () { show(r, c, L + i * CW, yy); });
      hit.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(r, c, L + i * CW, yy); } });
    });
  });

  var det = document.getElementById("det");
  function srcTitle(s) { return s === "field94" ? "the Field's study 94 (receivers94.json)" : s === "protocol" ? "PROTOCOL.md" : (D.sources[s] ? D.sources[s].title : s); }
  function show(r, c, x, yy) {
    sel.setAttribute("x", x + 1); sel.setAttribute("y", yy + 1); sel.setAttribute("width", CW - 2); sel.setAttribute("height", RH - 2);
    var cl = r.cells[c];
    det.innerHTML = "";
    det.appendChild(h("p", "meta", COLNAME[c] + " · " + COLDESC[c]));
    var p = h("p"); var b = h("b", null, r.name); p.appendChild(b);
    p.appendChild(document.createTextNode(" — " + (r.source_label || "")));
    det.appendChild(p);
    if (r.trigger) det.appendChild(h("p", "meta", "Word that sets it off: " + r.trigger));
    if (r.band === "ai") det.appendChild(h("p", "meta", "Word that sets it off: " + r.what + ". Sent by " + r.sender + (r.sender_clock === "awareness" ? ", within " + r.sender_deadline_h + " hours of knowing" : "") + (r.sender_failure === "penalty" ? "; a sender who stays silent is fined (" + r.sender_failure_ref + ")." : ".")));
    if (cl.v === "none") {
      det.appendChild(h("p", null, "Nothing ruled. The text obliges this receiver to nothing here" + (c === "why" ? ": it need not write down why it did not act." : c === "who" ? ": it does not say whether a person or a machine answers." : ".")));
    } else {
      det.appendChild(h("p", null, (SHORT[cl.v] ? SHORT[cl.v].toUpperCase() + ": " : "") + cl.label + (cl.ref ? " (" + cl.ref + ")" : "")));
      (cl.quotes || []).forEach(function (q) {
        var bq = h("blockquote", null, "“" + q.text + "”"); bq.setAttribute("data-quote", q.id || ""); det.appendChild(bq);
        det.appendChild(h("p", "meta", "— " + srcTitle(q.source)));
      });
      if (cl.note) det.appendChild(h("p", null, cl.note));
      if (cl.doubt) det.appendChild(h("p", "meta", "Doubt, as the Field records it: " + cl.doubt));
    }
  }

  var say = document.getElementById("say");
  var bRule = document.getElementById("b-rule"), bPub = document.getElementById("b-public");
  var C = D.counts;
  bRule.addEventListener("click", function () {
    var on = bRule.getAttribute("aria-pressed") !== "true";
    bRule.setAttribute("aria-pressed", on);
    svg.classList.toggle("ruled", on);
    var empty = D.rows.filter(function (r) { return r.cells.why.v === "none"; }).length;
    say.innerHTML = on ? "Ruled as the sea rules a master's log, the column <b>IF NOT, WHY</b> stands empty in <b>" + empty + "</b> of " + D.rows.length + " rows: " + (C.sea_rows - C.sea_why) + " at sea, all " + C.receivers + " AI receivers, and the architect." : "Read across a row: what the receiver must do. Read down a column: who must do it.";
  });
  bPub.addEventListener("click", function () {
    var on = bPub.getAttribute("aria-pressed") !== "true";
    bPub.setAttribute("aria-pressed", on);
    Array.prototype.forEach.call(svg.querySelectorAll("g.row"), function (g) {
      var dim = on && g.getAttribute("data-band") === "ai" && g.getAttribute("data-kind") !== "public body";
      g.classList.toggle("dim", dim);
    });
    var X = (window.CHECK || {}).counts || {};
    say.innerHTML = on ? "The <b>" + C.public_bodies + "</b> public bodies among the AI receivers: none must say so to the sender, none has a deadline on receipt, none must write why, and for none is a consequence named. <b>" + X.voluntary_public + "</b> of them rest on voluntary texts; the span that compares is the <b>" + X.law_public + "</b> a law names." : "Read across a row: what the receiver must do. Read down a column: who must do it.";
  });

  /* ---------- II. the night ---------- */
  var ns = document.getElementById("night");
  var NW = 1000, NH = 250, X0 = 30, X1 = 980, M0 = -15, M1 = 450, AY = 120;
  ns.setAttribute("viewBox", "0 0 " + NW + " " + NH);
  function nx(m) { return X0 + (m - M0) / (M1 - M0) * (X1 - X0); }
  el("rect", { "class": "rockets", x: nx(105), y: 18, width: nx(165) - nx(105), height: 16 }, ns);
  el("text", { x: nx(105), y: 14 }, ns, "rockets from the Titanic, about 00:45 to 01:45 (inquiry)");
  el("line", { "class": "sink", x1: nx(200), y1: 16, x2: nx(200), y2: AY + 8 }, ns);
  el("text", { "class": "acc", x: nx(200) + 4, y: 46 }, ns, "02:20 the Titanic founders");
  el("line", { "class": "axis", x1: X0, y1: AY, x2: X1, y2: AY }, ns);
  for (var hr = 0; hr <= 7; hr++) {
    var m = hr * 60, lab = ((23 + hr) % 24 < 10 ? "0" : "") + ((23 + hr) % 24) + ":00";
    el("line", { "class": "tick", x1: nx(m), y1: AY - 4, x2: nx(m), y2: AY + 4 }, ns);
    el("text", { x: nx(m), y: AY + 16, "text-anchor": "middle" }, ns, lab);
  }
  var LOGY = 196;
  el("text", { "class": "hd", x: X0, y: LOGY - 8 }, ns, "ENTERED IN THE SHIP'S LOG AT THE TIME");
  el("rect", { "class": "logrow", x: X0, y: LOGY, width: X1 - X0, height: 22 }, ns);
  el("text", { x: X1 - 4, y: LOGY + 36, "text-anchor": "end" }, ns, "nothing: the log was written up afterwards from a scrap log, since destroyed");
  var ndet = document.getElementById("ndet"), nsel = el("circle", { "class": "sel", cx: -99, cy: -99, r: 10 }, ns);
  var firstOwed = true;
  D.night.forEach(function (s, i) {
    var x = nx(s.min), up = i % 2 === 0;
    var ly = up ? AY - 30 - (i % 4 === 0 ? 0 : 14) : AY + 34 + (i % 4 === 1 ? 0 : 14);
    el("line", { "class": "tick", x1: x, y1: AY, x2: x, y2: up ? ly + 4 : ly - 10 }, ns);
    el("text", { "class": "nm", x: x, y: ly, "text-anchor": i === D.night.length - 1 ? "end" : "middle" }, ns, s.time);
    var c = el("circle", { "class": "st" + (s.master_receives ? " m" : ""), cx: x, cy: AY, r: 5.5, "data-i": i }, ns);
    if (s.master_receives) {
      el("rect", { "class": "owedn", x: x - 22, y: LOGY + 3, width: 44, height: 16 }, ns);
      if (firstOwed) { el("text", { "class": "owedt", x: x - 24, y: LOGY + 15, "text-anchor": "end" }, ns, "owed: go and say so, or write why not"); firstOwed = false; }
    }
    var hit = el("circle", { "class": "hit", cx: x, cy: AY, r: 12, tabindex: 0, role: "button", "aria-label": s.time + ": " + s.what }, ns);
    function pick() {
      nsel.setAttribute("cx", x); nsel.setAttribute("cy", AY);
      ndet.innerHTML = "";
      ndet.appendChild(h("p", "meta", s.time + " · " + s.means + " · minutes " + s.minutes));
      var p = h("p"); p.appendChild(h("b", null, s.who)); p.appendChild(document.createTextNode(": " + s.what + ".")); ndet.appendChild(p);
      s.quotes.forEach(function (q) { var bq = h("blockquote", null, "“" + q.text + "”"); bq.setAttribute("data-quote", q.id); ndet.appendChild(bq); });
      if (s.master_receives) ndet.appendChild(h("p", null, "Under SOLAS V/33 today the Master, placed to assist and receiving this word, would be bound to proceed with all speed and to say so, or to write in the log the reason for not going."));
      if (/02:05/.test(s.time)) ndet.appendChild(h("p", "meta", "The witnesses disagree: the apprentice said the Master was awake; the Master remembered only the door."));
    }
    hit.addEventListener("click", pick);
    hit.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  var bN = document.getElementById("b-night"), nsay = document.getElementById("nsay");
  var nsay0 = nsay.innerHTML;
  bN.addEventListener("click", function () {
    var on = bN.getAttribute("aria-pressed") !== "true";
    bN.setAttribute("aria-pressed", on); ns.classList.toggle("ruled", on);
    nsay.innerHTML = on ? "Under today's rule each of the <b>" + C.night_master_receipts + "</b> times the word reached the Master leaves a cell he must fill: going, and saying so, or the reason for not going. In 1912 there was no such cell, and the record of the night is testimony given afterwards." : nsay0;
  });

  /* ---------- III. the house's log ---------- */
  var st = document.getElementById("strip");
  var SW = 1000, SH = 260, SX0 = 40, SX1 = 985, SY0 = 220, SY1 = 40;
  st.setAttribute("viewBox", "0 0 " + SW + " " + SH);
  var hc = D.house.counts;
  var d0 = Date.parse(hc.first + "T00:00:00Z"), d1 = Date.parse(hc.last + "T00:00:00Z");
  var nd = Math.round((d1 - d0) / 864e5) + 1, dw = (SX1 - SX0) / nd;
  function sy(days) { return SY0 - Math.sqrt(days) / Math.sqrt(hc.max_days) * (SY0 - SY1 - 20); }
  [0, 1, 2, 5, 10, 20].forEach(function (d) {
    el("line", { "class": "tick", x1: SX0, y1: sy(d), x2: SX1, y2: sy(d) }, st);
    el("text", { x: SX0 - 6, y: sy(d) + 3, "text-anchor": "end" }, st, d);
  });
  el("text", { "class": "acc", x: SX0 - 6, y: SY1 - 4, "text-anchor": "end" }, st, "—");
  el("text", { x: SX0, y: SY1 - 4 }, st, "unanswered");
  el("text", { x: SX0, y: 14 }, st, "days until answered (square-root scale)");
  ["2026-09-15", "2026-10-01", "2026-10-15", "2026-11-01", "2026-11-15"].forEach(function (d) {
    var x = SX0 + (Date.parse(d + "T00:00:00Z") - d0) / 864e5 * dw;
    el("line", { "class": "tick", x1: x, y1: SY0 + 2, x2: x, y2: SY0 + 8 }, st);
    el("text", { x: x, y: SY0 + 22, "text-anchor": "middle" }, st, d.slice(5));
  });
  el("line", { "class": "axis", x1: SX0, y1: SY0 + 2, x2: SX1, y2: SY0 + 2 }, st);
  var stack = {};
  D.house.points.forEach(function (p) {
    var di = Math.round((Date.parse(p.on + "T00:00:00Z") - d0) / 864e5);
    var key = di + ":" + (p.days === null ? "u" : p.days);
    var k = stack[key] = (stack[key] || 0) + 1;
    var cols = Math.max(1, Math.floor(dw / 3.2));
    var ox = ((k - 1) % cols) * 3.2 + 1.6, oy = Math.floor((k - 1) / cols) * 3.2;
    var cx = SX0 + di * dw + ox, cy = (p.days === null ? SY1 - 8 : sy(p.days)) - oy;
    el("circle", { "class": "p-" + p.status, cx: cx, cy: cy, r: 1.35, "data-status": p.status }, st);
    if (p.correction) el("circle", { "class": "p-cor", cx: cx, cy: cy, r: 3.2 }, st);
  });

  /* ---------- sources ---------- */
  var ul = document.getElementById("srcs");
  Object.keys(D.sources).forEach(function (k) {
    var s = D.sources[k], li = h("li"), a = h("a", null, s.title); a.href = s.url; li.appendChild(a);
    li.appendChild(h("span", "how", "fetched 2026-11-25, " + s.how + (s.sha256 ? ", sha256 " + s.sha256.slice(0, 16) + "…" : "")));
    ul.appendChild(li);
  });
  [["The Field, study 94: On Receipt (receivers94.json)", "https://github.com/frankbueltge/field-research/tree/3dcd20be555d36c58bebdead061dc7d3dd0c33a2/artifacts/cycle-019/on-receipt"],
   ["The Middle's relay (relay.json) and its contract", "https://github.com/frankbueltge/research-ecology/tree/e6daa26b049741f901612f2bac1c39066cffc97e/relay"],
   ["This practice's constitution, 6.2 (PROTOCOL.md)", "https://github.com/frankbueltge/ulysses/blob/d0e7a5178a4f2cf3785b690dc88f447f51f10f4a/PROTOCOL.md"],
   ["This practice's channel and its standing rule on silence (REQUESTS.md)", "https://github.com/frankbueltge/ulysses/blob/d0e7a5178a4f2cf3785b690dc88f447f51f10f4a/REQUESTS.md"]].forEach(function (x) {
    var li = h("li"), a = h("a", null, x[0]); a.href = x[1]; li.appendChild(a); li.appendChild(h("span", "how", "pinned commit")); ul.appendChild(li);
  });
})();
