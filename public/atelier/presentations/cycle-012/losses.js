// The Last Case — third movement, "The losses". The Atelier, cycle 012, state 4 (2026-11-05). No library.
// Draws Kaplan and Meier's product-limit estimate (JASA 53, 1958) over the quiets, as build.py computes it
// into quiets.json (facts.pl): a quiet that broke is a "death", a quiet that held is a "loss", the day the
// record stopped watching. Past the greatest observed time, when that is a loss, the estimate is undefined,
// bounded by 0 and its last value: the band. The visitor's own declarations stand on it as marks.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  var D = null, rec = "bdbv", said = [], hover = null, open = false;
  var NAMES = { bdbv: "Congo and Ituri, 2026", kivu: "North Kivu and Ituri, 2018–2020", both: "both records" };
  var X0 = 42, X1 = 660;

  function P(pl, t) { // product-limit value at day t (deaths at t included), or null past t* when t* is a loss
    if (t > pl.tStar && pl.tStarIsLoss) return null;
    var s = 1; for (var i = 0; i < pl.deaths.length && pl.deaths[i][0] <= t; i++) s = pl.deaths[i][1];
    return s;
  }
  function atRisk(pl, qs, t) { return qs.filter(function (q) { return (q.b ? q.k.length + 1 : q.k.length) >= t; }).length; }
  function quiets() { return D.quiets.filter(function (q) { return rec === "both" || q.rec === rec; }); }
  function naive(qs, t) { // the declaration's reading: every quiet that held is over for good
    return 1 - qs.filter(function (q) { return q.b && q.k.length + 1 <= t; }).length / qs.length;
  }

  function draw() {
    if (!D) return;
    var c = $("km"), r = window.devicePixelRatio || 1, w = c.clientWidth, h = w < 600 ? 260 : 340;
    c.width = Math.round(w * r); c.height = Math.round(h * r); c.style.height = h + "px";
    var x = c.getContext("2d"); x.setTransform(r, 0, 0, r, 0, 0); x.clearRect(0, 0, w, h);
    var L = 40, R = 12, T = 14, B = 42, pw = w - L - R, ph = h - T - B;
    var sx = function (t) { return L + (Math.min(t, X1) - X0) / (X1 - X0) * pw; }, sy = function (p) { return T + (1 - p) * ph; };
    var pl = D.facts.pl[rec], qs = quiets();
    x.font = "12px system-ui,sans-serif"; x.fillStyle = css("--mute"); x.strokeStyle = css("--line"); x.lineWidth = 1;
    [0, 0.25, 0.5, 0.75, 1].forEach(function (p) {
      x.beginPath(); x.moveTo(L, sy(p) + 0.5); x.lineTo(L + pw, sy(p) + 0.5); x.stroke();
      x.fillText(Math.round(p * 100) + "", 6, sy(p) + 4);
    });
    [42, 100, 200, 300, 400, 500, 600].forEach(function (t) { x.fillText(t, sx(t) - 8, h - 24); });
    x.fillText("days since the last confirmed case", Math.max(L, L + pw - 210), h - 4);
    // the band: undefined past t*, bounded by 0 and P(t*)
    if (pl.tStarIsLoss) {
      var bx = sx(pl.tStar), by = sy(pl.pStar);
      x.save(); x.beginPath(); x.rect(bx, by, L + pw - bx, sy(0) - by); x.clip();
      x.fillStyle = css("--card"); x.fillRect(bx, by, L + pw - bx, sy(0) - by);
      x.strokeStyle = css("--nb"); x.lineWidth = 1;
      for (var k = -ph; k < pw + ph; k += 7) { x.beginPath(); x.moveTo(bx + k, sy(0)); x.lineTo(bx + k + ph, sy(0) - ph); x.stroke(); }
      x.restore();
      x.fillStyle = css("--fg"); x.font = "italic 14px Georgia,serif";
      var lbx = Math.min(bx + 8, L + pw - 170);
      x.fillText("undefined", lbx, sy(pl.pStar / 2)); x.font = "12px system-ui,sans-serif"; x.fillStyle = css("--mute");
      x.fillText("between 0 and " + Math.round(pl.pStar * 100) + " in 100", lbx, sy(pl.pStar / 2) + 16);
    }
    // the declaration's reading, dashed, flat for ever
    x.strokeStyle = css("--mute"); x.setLineDash([5, 4]); x.lineWidth = 1.5; x.beginPath();
    for (var t = X0; t <= X1; t++) { var v = naive(qs, t); if (t === X0) x.moveTo(sx(t), sy(v)); else x.lineTo(sx(t), sy(v)); }
    x.stroke(); x.setLineDash([]);
    // the product-limit steps
    x.strokeStyle = css("--fg"); x.lineWidth = 2.2; x.beginPath(); x.moveTo(sx(X0), sy(1)); var s = 1;
    pl.deaths.forEach(function (d) { x.lineTo(sx(d[0]), sy(s)); s = d[1]; x.lineTo(sx(d[0]), sy(s)); });
    x.lineTo(sx(pl.tStar), sy(s)); x.stroke();
    // the losses: one tick per quiet that held, on the day its record stopped
    x.strokeStyle = css("--held"); x.lineWidth = 2;
    var seen = {};
    pl.losses.forEach(function (t) {
      seen[t] = (seen[t] || 0) + 1; var p = P(pl, t); if (p === null) p = pl.pStar;
      var yy = sy(p) - 4 - (seen[t] - 1) * 7; x.beginPath(); x.moveTo(sx(t), yy - 5); x.lineTo(sx(t), yy + 5); x.stroke();
    });
    // the visitor's declarations
    x.strokeStyle = css("--you"); x.fillStyle = css("--you"); x.lineWidth = 2;
    said.forEach(function (d, i) {
      var dx = d < X0 ? L - 4 : sx(d); x.beginPath(); x.moveTo(dx, T); x.lineTo(dx, T + ph); x.stroke();
      x.fillText(d < X0 ? "← you, " + d : "you, " + d, Math.min(dx + 4, L + pw - 60), T + 12 + i * 14);
    });
    if (hover !== null) { x.strokeStyle = css("--mute"); x.lineWidth = 1; x.beginPath(); x.moveTo(sx(hover) + 0.5, T); x.lineTo(sx(hover) + 0.5, T + ph); x.stroke(); }
    c._sx = { L: L, pw: pw };
  }

  function read(t) {
    var pl = D.facts.pl[rec], qs = quiets(), p = P(pl, t), n = atRisk(pl, qs, t);
    if (t < X0) return "Before day 42 this material says nothing: it holds only quiets that reached 42 days.";
    if (p === null) return "Day " + t + ": <b>undefined</b>. Nothing in " + NAMES[rec] + " was still watched after day " + pl.tStar +
      ", so of the quiets that reached 42 days, somewhere between 0 and " + Math.round(pl.pStar * 100) + " in 100 are still quiet. The dashed line says " +
      Math.round(naive(qs, t) * 100) + ", for ever.";
    return "Day " + t + ": of the quiets that reached 42 days, about <b>" + Math.round(p * 100) + " in 100</b> are still quiet, by the product-limit estimate. " +
      n + " of " + qs.length + " were still being watched. If every quiet that held were over for good, the dashed line, it would be " + Math.round(naive(qs, t) * 100) + ".";
  }
  function yours() {
    if (!said.length) return "";
    var pl = D.facts.pl[rec], last = Math.max.apply(null, said), p = P(pl, last);
    if (last < X0) return "You said “over” on day " + said.join(", day ") + ", all before day 42, where this material says nothing.";
    return "You said “over” on day " + said.join(", day ") + ". At day " + last + ", in " + NAMES[rec] + ", the estimate is " +
      (p === null ? "undefined" : Math.round(p * 100) + " in 100 still quiet") + ". “The last case has been” asks for 100, and for every day after.";
  }
  function show(t) { $("kmread").innerHTML = read(t); }
  function refresh() { draw(); $("kmyou").textContent = yours(); show(hover === null ? D.facts.pl[rec].tStar : hover); }

  function point(e) {
    var c = $("km"), g = c._sx; if (!g) return;
    var px = (e.touches ? e.touches[0].clientX : e.clientX) - c.getBoundingClientRect().left;
    hover = Math.max(X0 - 1, Math.min(X1, Math.round(X0 + (px - g.L) / g.pw * (X1 - X0)))); draw(); show(hover);
  }

  fetch("quiets.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; refresh();
    if (/[?&]demo/.test(location.search)) { said = [44, 38, 51]; unlock(); }
  });
  function unlock() { open = true; $("losses").classList.remove("locked"); $("klock").textContent = "Three quiets heard. Your declarations stand on the curve."; if (D) refresh(); }
  window.addEventListener("pairs-open", unlock);
  window.addEventListener("quiet-said", function (e) { said = e.detail.filter(function (v) { return v !== null; }); if (D) refresh(); });
  Array.prototype.forEach.call(document.querySelectorAll("#kmrec button"), function (b) {
    b.onclick = function () {
      rec = b.getAttribute("data-rec"); hover = null;
      Array.prototype.forEach.call(document.querySelectorAll("#kmrec button"), function (o) { o.setAttribute("aria-pressed", o === b ? "true" : "false"); });
      refresh();
    };
  });
  $("km").addEventListener("mousemove", point); $("km").addEventListener("touchstart", point, { passive: true });
  $("km").addEventListener("touchmove", point, { passive: true });
  $("km").addEventListener("mouseleave", function () { hover = null; draw(); show(D.facts.pl[rec].tStar); });
  window.addEventListener("resize", draw);
})();
