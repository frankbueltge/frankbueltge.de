/* Bound to Proceed, state 4 (2026-11-28): the presentation. Lays the two cases of step 6 over the log of
   section I, from data/present.js (written by present.py from the Field's check 96). A duty of the one who must
   pass the word on lights the receiver's door, the row's name, where the word comes in; a duty of the one the
   word reaches rings the cell of the log that rules it. Also marks the one cell of study 94 the Field's blind
   recoding moved. No library; writes nothing anywhere. */
(function () {
  "use strict";
  var P = window.PRESENT, D = window.LOG;
  var svg = document.getElementById("log"), det = document.getElementById("det"), say = document.getElementById("say");
  var btn = document.getElementById("b-cases"), box = document.getElementById("duties");
  if (!P || !D || !svg || !btn || !box) return;
  var NS = "http://www.w3.org/2000/svg";
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function h(tag, cls, text) { var e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }
  var K = P.counts, CASE = { wiki: "the wiki", escape: "the escape" };
  var GLYPH = { met: "✓", done: "~", declared: "×", missed: "!", notdue: "–", unknowable: "?" };
  var COLS = D.columns;

  var atDoor = {}, atCell = {};
  P.cells.forEach(function (c) {
    c.doors.forEach(function (r) { (atDoor[r] = atDoor[r] || []).push(c); });
    c.cells.forEach(function (rc) { var k = rc[0] + "/" + rc[1]; (atCell[k] = atCell[k] || []).push(c); });
  });

  function geom(g, col) {
    var hit = g.querySelectorAll("rect.hit")[COLS.indexOf(col)];
    return { x: +hit.getAttribute("x"), y: +hit.getAttribute("y"), w: +hit.getAttribute("width"), h: +hit.getAttribute("height") };
  }
  function dutyList(list, intro) {
    det.appendChild(h("p", null, intro));
    list.forEach(function (c) {
      var p = h("p"); p.setAttribute("data-duty", c.n);
      var b = h("b", null, CASE[c.case] + ": " + P.fate_txt[c.fate]);
      p.appendChild(b); p.appendChild(document.createTextNode(". " + c.duty + ". " + c.reason));
      det.appendChild(p);
      c.passages.forEach(function (q) {
        var bq = h("blockquote", null, "“" + q.quote + "”"); bq.setAttribute("data-fq", c.n); det.appendChild(bq);
      });
    });
    det.appendChild(h("p", "meta", "— coded by the Field's conductor in its check 96 (duties96.json, " + P.pin + "), passages as the Field quotes them"));
  }

  /* the door of each row the cases reach, and a ring round each cell they set off */
  Array.prototype.forEach.call(svg.querySelectorAll("g.row"), function (g) {
    var id = g.getAttribute("data-id"), touched = false;
    var g0 = geom(g, COLS[0]);
    if (atDoor[id]) {
      touched = true;
      var d = el("rect", { "class": "door", x: 0, y: g0.y + 1, width: g0.x - 4, height: g0.h - 3, "data-door": id });
      g.insertBefore(d, g.firstChild);
      var dh = el("rect", { "class": "dhit", x: 0, y: g0.y, width: g0.x - 2, height: g0.h, tabindex: 0, role: "button",
        "aria-label": id + ": the word's door, " + atDoor[id].length + " duties of the two cases" }, g);
      var open = function () {
        det.innerHTML = "";
        det.appendChild(h("p", "meta", "THE DOOR · where the word comes in"));
        var row = D.rows.filter(function (r) { return r.id === id; })[0];
        var p = h("p"); p.appendChild(h("b", null, row.name)); p.appendChild(document.createTextNode(" — " + row.source_label)); det.appendChild(p);
        dutyList(atDoor[id], "The word reaches this receiver only if the one who must pass it on does so. In the two cases:");
      };
      dh.addEventListener("click", open);
      dh.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    }
    COLS.forEach(function (c, i) {
      var k = id + "/" + c, cl = (D.rows.filter(function (r) { return r.id === id; })[0] || {}).cells;
      var gm = geom(g, c), hit = g.querySelectorAll("rect.hit")[i];
      if (atCell[k]) {
        touched = true;
        el("rect", { "class": "ring", x: gm.x + 1.5, y: gm.y + 0.5, width: gm.w - 3, height: gm.h - 2, "data-ring": k }, g);
        hit.addEventListener("click", function () {
          if (!svg.classList.contains("cases")) return;
          dutyList(atCell[k], "In the two cases of step 6, this duty of the receiver:");
        });
      }
      /* a cell of study 94 that the Field's blind recoding moved: struck, with its reason */
      if (cl && cl[c] && cl[c].was) {
        var w = cl[c].was;
        el("rect", { "class": "c-was", x: gm.x + 3, y: gm.y + 2, width: gm.w - 6, height: gm.h - 5, "data-was": k }, g);
        el("line", { "class": "c-was", x1: gm.x + 3, y1: gm.y + gm.h - 3, x2: gm.x + gm.w - 3, y2: gm.y + 2 }, g);
        hit.addEventListener("click", function () {
          det.appendChild(h("p", null, "Corrected " + w.corrected + ": study 94 coded this cell '" + w.label + "'; " + w.by + " found nothing ruled here. " + w.why));
          w.quotes.forEach(function (q) { det.appendChild(h("blockquote", null, "“" + q.text + "”")); });
        });
      }
    });
    if (touched) g.classList.add("touched");
  });

  /* the duties, by whose they are */
  var t = h("table"), th = h("thead"), tr = h("tr");
  ["The duty", "Whose", "In the log", "The wiki", "The escape"].forEach(function (x) { tr.appendChild(h("th", null, x)); });
  th.appendChild(tr); t.appendChild(th);
  var tb = h("tbody"), sig = [];
  P.cells.forEach(function (c) { if (sig.indexOf(c.signal) < 0) sig.push(c.signal); });
  var ORDER = { sender: 0, both: 1, receiver: 2 };
  sig.sort(function (a, b) {
    var ca = P.cells.filter(function (c) { return c.signal === a; })[0], cb = P.cells.filter(function (c) { return c.signal === b; })[0];
    return ORDER[ca.whose] - ORDER[cb.whose] || ca.n - cb.n;
  });
  sig.forEach(function (s) {
    var cs = P.cells.filter(function (c) { return c.signal === s; }), c0 = cs[0], r = h("tr");
    r.setAttribute("data-signal", s); r.setAttribute("data-whose", c0.whose);
    var td = h("td", "duty", c0.duty); td.setAttribute("data-h", "the duty"); r.appendChild(td);
    td = h("td", "whose", P.whose[c0.whose]); td.setAttribute("data-h", "whose"); r.appendChild(td);
    var where = c0.doors.map(function (d) { return "door of " + d; }).concat(c0.cells.map(function (x) { return x[0] + " · " + x[1]; }));
    td = h("td", "nm", where.join(", ")); td.setAttribute("data-h", "in the log"); r.appendChild(td);
    ["wiki", "escape"].forEach(function (cs1) {
      var c = cs.filter(function (x) { return x.case === cs1; })[0], d = h("td", "fate");
      d.setAttribute("data-h", CASE[cs1]);
      if (c) {
        d.setAttribute("data-fate", c.fate); d.setAttribute("data-n", c.n);
        var dt = h("details"), sm = h("summary");
        sm.appendChild(h("span", "gl", GLYPH[c.fate])); sm.appendChild(document.createTextNode(" " + P.fate_txt[c.fate]));
        dt.appendChild(sm); dt.appendChild(h("p", null, c.reason));
        c.passages.forEach(function (q) { var bq = h("blockquote", null, "“" + q.quote + "”"); bq.setAttribute("data-fq", c.n); dt.appendChild(bq); });
        d.appendChild(dt);
      }
      r.appendChild(d);
    });
    tb.appendChild(r);
  });
  t.appendChild(tb);
  var wrap = document.getElementById("duties-table");
  wrap.appendChild(t);

  btn.addEventListener("click", function () {
    var on = btn.getAttribute("aria-pressed") !== "true";
    btn.setAttribute("aria-pressed", on);
    svg.classList.toggle("cases", on);
    box.hidden = !on;
    say.innerHTML = on
      ? "Laid over the log, the two cases could set off <b>" + K.cells + "</b> duties (the Field's check 96), and the record shows <b>" + K.met + "</b> met. <b>" + K.sender +
        "</b> bind the one who must pass the word on: they stand at a receiver's door, lit. <b>" + K.receiver + "</b> bind the one the word reaches: they stand in its cells, ringed; <b>" + K.both +
        "</b> bind both. Of those " + K.receiver + ", <b>" + K.receiver_done + "</b> are done, the maker's own investigation, with set-off or time unknown; the record cannot say for <b>" + K.receiver_unknowable +
        "</b>; <b>" + K.receiver_declared + "</b> was declared not set off; <b>" + K.receiver_notdue + "</b> are not yet due. The one duty owed back to a sender, a monthly word to the employee who reported, cannot be seen in either case (<b>" +
        K.back_unknowable + "</b> of " + K.back_cases + "): it is kept inside the firm. Choose a lit door or a ringed cell."
      : "Read across a row: what the receiver must do. Read down a column: who must do it.";
  });
})();
