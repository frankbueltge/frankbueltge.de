/* Bound to Proceed, state 3 (2026-11-27): the check, rendered from data/check.json. What state 2 said, the verdict,
   and the finding with the passages it rests on, each quoted as found. Writes nothing anywhere. */
(function () {
  var C = window.CHECK, ul = document.getElementById("checklist");
  if (!C || !ul) return;
  function h(t, cls, txt) { var e = document.createElement(t); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; }
  var Q2 = {};
  (window.CASES ? window.CASES.stations : []).forEach(function (s) { s.passages.forEach(function (p) { Q2[p.id] = p; }); });
  C.items.forEach(function (it) {
    var li = h("li"); li.setAttribute("data-check", it.id); li.setAttribute("data-verdict", it.verdict);
    li.appendChild(h("span", "tag " + it.verdict, it.verdict));
    li.appendChild(h("span", "where", it.where));
    var was = h("span", "was");
    // a claim of state 2 that was withdrawn or corrected is struck; what held, and what the critique asked, is not
    if (/^The critique/.test(it.claim)) was.appendChild(document.createTextNode(it.claim + " "));
    else if (it.verdict === "held") { was.appendChild(document.createTextNode("State 2: " + it.claim + " ")); }
    else { was.appendChild(document.createTextNode("State 2: ")); was.appendChild(h("i", null, it.claim)); was.appendChild(document.createTextNode(" ")); }
    li.appendChild(was);
    var f = h("span", "found");
    it.finding.forEach(function (seg) {
      if (typeof seg === "string") { f.appendChild(document.createTextNode(seg)); return; }
      var q;
      if (seg.q3) { q = h("q", null, C.passages[seg.q3].text); q.setAttribute("data-q3", seg.q3); }
      else { q = h("q", null, Q2[seg.q2].text); q.setAttribute("data-q2", seg.q2); }
      f.appendChild(q);
    });
    li.appendChild(f);
    ul.appendChild(li);
  });
  var srcs = document.getElementById("srcs");
  if (srcs) Object.keys(C.sources).forEach(function (k) {
    var s = C.sources[k], li = h("li"), a = h("a", null, s.title); a.href = s.url; li.appendChild(a);
    li.appendChild(h("span", "how", "read by the check, " + s.fetched + ", " + s.how + ", sha256 " + s.sha256.slice(0, 16) + "…"));
    srcs.appendChild(li);
  });
})();
