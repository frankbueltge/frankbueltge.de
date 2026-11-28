/* Bound to Proceed, state 2 — draws section III, the word in 2026, from data/cases.js. No library. */
(function () {
  "use strict";
  var K = window.CASES, D = window.LOG;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent, text) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) if (attrs[k] !== undefined && attrs[k] !== null) e.setAttribute(k, attrs[k]);
    if (text !== undefined) e.textContent = text;
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text !== undefined) e.textContent = text; return e; }
  function t(d) { return Date.parse(d + "T00:00:00Z"); }
  var C = K.counts;
  var QUOTE = {};
  K.stations.forEach(function (s) { s.passages.forEach(function (p) { QUOTE[p.id] = p; }); });

  var svg = document.getElementById("cases");
  var W = 1000, X0 = 140, X1 = 975, T0 = t("2026-05-08"), T1 = t("2026-11-26");
  var LANES = [{ key: "maker", title: "THE MAKER", sub: "its teams, its reports", y: 120 },
               { key: "outside", title: "THOSE OUTSIDE", sub: "the harmed, a moderator, a filer", y: 220 },
               { key: "public", title: "PUBLIC BODIES", sub: "state, Commission, courts", y: 320 }];
  var LY = {}; LANES.forEach(function (l) { LY[l.key] = l.y; });
  var H = 400;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  function x(d) { return X0 + (t(d) - T0) / (T1 - T0) * (X1 - X0); }

  /* the agents' own acts, as the bands of rockets in the night above */
  [["2026-05-11", "2026-07-02", "the wiki case: the agents write, 11 May to 2 July"],
   ["2026-07-08", "2026-07-13", "the escape: 8 to 13 July"]].forEach(function (a, i) {
    el("rect", { "class": "acts", x: x(a[0]), y: 22 + i * 22, width: Math.max(4, x(a[1]) - x(a[0])), height: 12 }, svg);
    el("text", { x: x(a[1]) + 6, y: 32 + i * 22 }, svg, a[2]);
  });
  ["2026-06-01", "2026-07-01", "2026-08-01", "2026-09-01", "2026-10-01", "2026-11-01"].forEach(function (d) {
    var xx = x(d);
    el("line", { "class": "tick", x1: xx, y1: 64, x2: xx, y2: H - 22 }, svg);
    el("text", { x: xx, y: H - 6, "text-anchor": "middle" }, svg, new Date(t(d)).toLocaleString("en-GB", { month: "short", timeZone: "UTC" }));
  });
  LANES.forEach(function (l) {
    el("line", { "class": "lane", x1: X0 - 6, y1: l.y, x2: X1, y2: l.y }, svg);
    el("text", { "class": "band", x: 6, y: l.y - 2 }, svg, l.title);
    el("text", { x: 6, y: l.y + 12 }, svg, l.sub);
  });

  /* the sea's rule: a box owed under each word with nothing on record; for each reason, how long after the word it was written */
  var det = document.getElementById("cdet");
  var sel = el("circle", { "class": "sel", cx: -99, cy: -99, r: 11 }, svg);
  var lastX = {}, level = {}, seen = {}, lagN = {};
  /* a hit area never reaches over a neighbour's mark in the same lane */
  var PX = K.stations.map(function (s) { return x(s.date); });
  function hitR(i) {
    var r = 13, s = K.stations[i];
    K.stations.forEach(function (o, j) {
      if (j === i || o.lane !== s.lane) return;
      r = Math.min(r, o.date === s.date ? 7.5 : Math.max(6, Math.abs(PX[j] - PX[i]) / 2));
    });
    return r;
  }
  K.stations.forEach(function (s, i) {
    var xx = x(s.date), base = LY[s.lane];
    var key = s.lane + s.date;
    var yy = base + (seen[key] ? 15 : 0); seen[key] = true;
    var lv = (lastX[s.lane] !== undefined && xx - lastX[s.lane] < 72) ? (level[s.lane] + 1) % 3 : 0;
    lastX[s.lane] = xx; level[s.lane] = lv;
    if (yy === base) el("text", { "class": "nm", x: xx, y: base - 14 - lv * 12, "text-anchor": xx > X1 - 40 ? "end" : "middle" }, svg, s.label);
    var mark;
    if (s.kind === "received") mark = el("circle", { "class": "cs-recv", cx: xx, cy: yy, r: 5.5, "data-kind": s.kind }, svg);
    else if (s.kind === "acted") mark = el("circle", { "class": "cs-acted", cx: xx, cy: yy, r: 5.5, "data-kind": s.kind }, svg);
    else if (s.kind === "told") mark = el("path", { "class": "cs-told", d: "M" + (xx - 6) + "," + (yy + 5) + "L" + xx + "," + (yy - 6) + "L" + (xx + 6) + "," + (yy + 5) + "Z", "data-kind": s.kind }, svg);
    else mark = el("rect", { "class": "cs-reason", x: xx - 5.5, y: yy - 5.5, width: 11, height: 11, "data-kind": s.kind }, svg);
    if (s.kind === "received") {
      el("rect", { "class": "owedn", x: xx - 9, y: yy + 10, width: 18, height: 14, "data-owed": s.id }, svg);
    }
    if (s.kind === "reason") {
      /* from the day the word reached the receiver to the day the reason stands in a record; staggered per lane */
      var k = lagN[s.lane] = (lagN[s.lane] || 0) + 1;
      var xr = x(s.received), xw = x(s.written), ly = base + 22 + k * 12;
      el("path", { "class": "lag", d: "M" + xr + "," + (ly - 5) + "L" + xr + "," + ly + "L" + xw + "," + ly + "L" + xw + "," + (ly - 5), "data-lag": s.id }, svg);
      var n = Math.round((t(s.written) - t(s.received)) / 864e5);
      el("text", { "class": "lagt", x: xw + 4, y: ly + 3 }, svg, n + " d");
    }
    var hit = el("circle", { "class": "hit", cx: xx, cy: yy, r: hitR(i), tabindex: 0, role: "button", "aria-label": s.label + ": " + s.receiver }, svg);
    function pick() {
      sel.setAttribute("cx", xx); sel.setAttribute("cy", yy);
      det.innerHTML = "";
      det.appendChild(h("p", "meta", s.label + " 2026 · " + (s.case === "wiki" ? "the wiki case" : s.case === "escape" ? "the escape" : "both cases") + " · " + s.basis));
      var p = h("p"); p.appendChild(h("b", null, s.receiver)); p.appendChild(document.createTextNode(s.word ? " received " + s.word + ". " : ". "));
      p.appendChild(document.createTextNode(s.did)); det.appendChild(p);
      det.appendChild(h("p", "meta", "Named in the record as: " + s.who_text));
      s.passages.forEach(function (q) { var bq = h("blockquote", null, "“" + q.text + "”"); bq.setAttribute("data-quote2", q.id); det.appendChild(bq); });
      if (s.kind === "reason") (s.reasons || []).forEach(function (r) {
        det.appendChild(h("p", null, "The reason names " + r.names + ", not a circumstance of the case. It stands in a record made " +
          Math.round((t(s.written) - t(s.received)) / 864e5) + " days after the word (" + s.received_what + ")."));
      });
      if (s.kind === "received") det.appendChild(h("p", null, "At sea, a receiver placed to act on this word would owe going and saying so, or the reason for not going, entered in the log at the time. The record holds neither."));
      if (s.basis === "allegation") det.appendChild(h("p", "meta", "An allegation in the Attorney General's complaint of 16 November 2026, not a finding of a court."));
    }
    hit.addEventListener("click", pick);
    hit.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });

  var csay = document.getElementById("csay"), csay0 = csay.innerHTML;
  var bS = document.getElementById("b-sea26");
  bS.addEventListener("click", function () {
    var on = bS.getAttribute("aria-pressed") !== "true";
    bS.setAttribute("aria-pressed", on); svg.classList.toggle("ruled", on);
    csay.innerHTML = on ? "Under the sea's rule each of the <b>" + C.receipts_no_record + "</b> words received with nothing on record leaves a cell someone must fill. The <b>" +
      C.reasons + "</b> reasons are there, but none is on record from the hour: each stands in a record made public " + C.reason_lag_min + " to " + C.reason_lag_max + " days after the word." : csay0;
  });

  /* the reasons, side by side, between the sea's two references */
  var box = document.getElementById("reasons"), bR = document.getElementById("b-reasons");
  var master = D.rows.filter(function (r) { return r.id === "SEA-MASTER"; })[0];
  var solas = master.cells.why.quotes[0];
  var company = null;
  D.night.forEach(function (s) { s.quotes.forEach(function (q) { if (q.id === "i12-company") company = q; }); });
  var tb = h("table"), th = h("tr");
  var HEADS = ["When", "Who gave it", "The reason, as written", "What it names", "What asked for it"];
  HEADS.forEach(function (c) { th.appendChild(h("th", null, c)); });
  var thead = h("thead"); thead.appendChild(th); tb.appendChild(thead);
  var body = h("tbody");
  function row(cls, when, who, text, names, qid, attr, asked) {
    var tr = h("tr", cls), c0 = h("td", "nm", when), c1 = h("td", null, who);
    c0.setAttribute("data-h", HEADS[0]); c1.setAttribute("data-h", HEADS[1]); tr.appendChild(c0); tr.appendChild(c1);
    var td = h("td"), q = h("q", null, text); q.setAttribute(attr, qid); td.appendChild(q); td.setAttribute("data-h", HEADS[2]); tr.appendChild(td);
    var tn = h("td", "names"); tn.appendChild(h("b", null, names)); tn.setAttribute("data-h", HEADS[3]); tr.appendChild(tn);
    var ta = h("td", "asked", asked); ta.setAttribute("data-h", HEADS[4]); tr.appendChild(ta);
    if (cls !== "ref") tr.setAttribute("data-reason", qid);
    body.appendChild(tr);
  }
  var ASKED = { "none": "nothing: given by choice", "a hearing": "legislators, at a hearing", "a law's report": "a report the law asks for every three months, which asks for no reason", "an executive order": "the Governor's executive order of 18 September" };
  row("ref", "15 Apr 1912, 01:10", "the Californian's Master", company.text, "a class", company.id, "data-q", "a report from his bridge");
  K.reasons.forEach(function (r) {
    var s = K.stations.filter(function (x) { return x.id === r.station; })[0];
    row("", s.label + " 2026", s.receiver, r.passage, r.names, r.q, "data-q2", ASKED[r.asked]);
  });
  row("ref", "SOLAS V/33.1 (today)", "the reason the sea's rule asks for", solas.text, "the special circumstances of the case", solas.id, "data-q", "the rule itself, on receipt");
  tb.appendChild(body); box.appendChild(tb);
  box.appendChild(h("p", "note", "Coded by this practice from the passages; each row's passage is found word for word in its source (cases.py). What asked for a reason is read from the record it stands in (checked 27 November). The first and the last rows are the references from sections I and II; \"the special circumstances of the case\" is the regulation's own phrase, and the sea accepts a reason that it is unnecessary to proceed."));
  bR.addEventListener("click", function () {
    var on = bR.getAttribute("aria-pressed") !== "true";
    bR.setAttribute("aria-pressed", on); box.hidden = !on;
  });

  /* sources of the cases, added to the list at the foot */
  var ul = document.getElementById("srcs");
  Object.keys(K.sources).forEach(function (k) {
    var s = K.sources[k], li = h("li"), a = h("a", null, s.title); a.href = s.url; li.appendChild(a);
    li.appendChild(h("span", "how", "fetched " + s.fetched + ", " + s.how + ", sha256 " + s.sha256.slice(0, 16) + "…"));
    ul.appendChild(li);
  });
})();
