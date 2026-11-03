// The Last Case — the Atelier, cycle 012. No library. Data: quiets.json (build.py).
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  var D, order = [], ix = -1, cur = null, day = 0, timer = null, said = null, revealing = false;
  var log = []; // {q, said, outcome}
  var PER_ROW = 30, HOLE = null;

  // ---------- sound ----------
  var ac = null, master = null;
  function audio() {
    if (ac || !$("snd").checked) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.5; master.connect(ac.destination);
    } catch (e) { ac = null; }
  }
  function tick(kind) {
    if (!ac || !$("snd").checked) return;
    var t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), f = ac.createBiquadFilter();
    f.type = "lowpass";
    if (kind === "w") { o.type = "sine"; o.frequency.value = 1320; f.frequency.value = 6000; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); }
    else if (kind === "a") { o.type = "triangle"; o.frequency.value = 330; f.frequency.value = 700; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.25, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); }
    else if (kind === "case") { o.type = "sine"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(55, t + 0.9); f.frequency.value = 400; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.9, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.4); }
    else if (kind === "end") { o.type = "sine"; o.frequency.value = 660; f.frequency.value = 3000; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.12, t + 0.3); g.gain.exponentialRampToValueAtTime(0.0001, t + 2.2); }
    else return;
    o.connect(f); f.connect(g); g.connect(master); o.start(t); o.stop(t + 2.4);
  }

  // ---------- the strip ----------
  function sizeCanvas(c, h) {
    var r = window.devicePixelRatio || 1, w = c.clientWidth;
    c.width = Math.round(w * r); c.height = Math.round(h * r); c.style.height = h + "px";
    var x = c.getContext("2d"); x.setTransform(r, 0, 0, r, 0, 0); return { x: x, w: w, h: h };
  }
  function drawStrip() {
    var c = $("strip"), n = cur ? Math.max(day, cur.k.length + (cur.b ? 1 : 0)) : 0;
    var shown = cur ? day : 0, total = Math.max(shown, 60);
    var per = window.innerWidth < 600 ? 15 : PER_ROW;
    var rows = Math.ceil(Math.max(total, 1) / per), cell = Math.min(26, Math.floor((c.clientWidth) / per));
    var g = sizeCanvas(c, Math.max(rows * cell + 4, cell * 2 + 4)), x = g.x;
    x.clearRect(0, 0, g.w, g.h);
    for (var i = 0; i < total; i++) {
      var X = (i % per) * cell, Y = Math.floor(i / per) * cell, s = cell - 3;
      if (i >= shown) { x.strokeStyle = css("--line"); x.lineWidth = 1; x.setLineDash([2, 3]); x.strokeRect(X + 0.5, Y + 0.5, s, s); x.setLineDash([]); continue; }
      var k = i < cur.k.length ? cur.k[i] : "X";
      if (k === "X") { x.fillStyle = css("--case"); x.beginPath(); x.arc(X + s / 2, Y + s / 2, s / 2, 0, 7); x.fill(); continue; }
      x.fillStyle = css(k === "w" ? "--w" : k === "a" ? "--a" : "--n"); x.fillRect(X, Y, s, s);
      if (k === "n") { x.strokeStyle = css("--nb"); x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, s - 1, s - 1); }
      if (said !== null && i === said - 1) { x.strokeStyle = css("--you"); x.lineWidth = 3; x.strokeRect(X - 1, Y - 1, s + 2, s + 2); }
    }
  }
  function tally() {
    var k = cur ? cur.k.slice(0, Math.min(day, cur.k.length)) : "", c = function (ch) { return k.split(ch).length - 1; };
    $("tally").textContent = "named " + c("w") + " · not named " + c("a") + " · no report " + c("n");
    $("day").textContent = cur ? Math.min(day, cur.k.length) : 0;
  }

  // ---------- one quiet ----------
  function start() {
    audio(); if (ac && ac.state === "suspended") ac.resume();
    ix = (ix + 1) % order.length; cur = D.quiets[order[ix]]; day = 0; said = null; revealing = false;
    $("go").hidden = true; $("next").hidden = true; $("over").disabled = false; $("over").hidden = false;
    $("verdict").textContent = "";
    run(+$("pace").value);
  }
  function run(rate) {
    clearInterval(timer);
    timer = setInterval(step, 1000 / rate);
  }
  function step() {
    var L = cur.k.length;
    if (day < L) {
      day++; tick(cur.k[day - 1]); tally(); drawStrip(); return;
    }
    clearInterval(timer);
    if (cur.b) { day = L + 1; tick("case"); } else tick("end");
    drawStrip(); finish();
  }
  function declare() {
    if (said !== null || !cur) return;
    said = Math.min(day, cur.k.length); $("over").disabled = true;
    $("verdict").innerHTML = "You said it is over on day <b>" + said + "</b>: “the last case was " + said + " days ago.” Now the record goes on.";
    revealing = true; run(60);
  }
  function fmt(iso) { var d = new Date(iso + "T00:00:00Z"); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }
  function finish() {
    var L = cur.k.length, where = cur.z + ", from " + fmt(cur.f) + " (" + (cur.rec === "bdbv" ? "Congo and Ituri, 2026" : "North Kivu and Ituri, 2018–2020") + ")";
    var out, cls, txt;
    if (cur.b) {
      out = "new case, day " + (L + 1); cls = "case";
      txt = said === null
        ? "Before you said anything, <b class='case'>a new confirmed case came on day " + (L + 1) + "</b>."
        : "<b class='case'>A new confirmed case came on day " + (L + 1) + "</b>, " + (L + 1 - said) + " days after you said it was over. Your sentence was false, and it was day " + (L + 1) + " that made it so.";
    } else {
      out = "record ends, day " + L; cls = "held";
      txt = said === null
        ? "<b class='held'>The record ends on day " + L + "</b> with no new case, before you said anything."
        : "<b class='held'>The record ends on day " + L + "</b> with no new case. Your sentence is not false. It is not yet true either: only a record that goes on could write that.";
    }
    $("verdict").innerHTML = txt + "<br><span class='legend'>" + where + "</span>";
    $("over").hidden = true; $("next").hidden = false; $("next").focus({ preventScroll: true });
    log.push({ q: cur, said: said, out: out, cls: cls });
    ledger(); clock();
  }

  // ---------- what accumulates ----------
  function ledger() {
    $("ledger").hidden = false;
    $("rows").innerHTML = log.map(function (r, i) {
      return "<tr><td>" + (i + 1) + "</td><td>" + r.q.z + " " + r.q.f.slice(0, 4) + "</td><td>" + (r.said === null ? "—" : r.said) + "</td><td class='" + r.cls + "'>" + r.out + "</td></tr>";
    }).join("");
  }
  function median(a) { a = a.slice().sort(function (x, y) { return x - y; }); var m = a.length >> 1; return a.length % 2 ? a[m] : Math.round((a[m - 1] + a[m]) / 2); }
  function clock() {
    var s = log.filter(function (r) { return r.said !== null; }).map(function (r) { return r.said; });
    if (s.length < 3) return;
    var T = median(s), over = D.quiets.filter(function (q) { return q.k.length >= T; }), br = over.filter(function (q) { return q.b; }).length;
    var short = D.quiets.filter(function (q) { return q.k.length < T; }), sb = short.filter(function (q) { return q.b; }).length;
    $("clock").hidden = false;
    $("clocktext").innerHTML = "You said “over” on days " + s.join(", ") + ". As a rule, that is a clock of <b>" + T + " days</b>. On all 82 quiets of both records, a " + T + "-day clock calls <b>" + over.length + "</b> over, and <b>" + br + "</b> of those later wrote a new case" + (short.length ? "; of the " + short.length + " it never reaches, " + sb + " broke first" + (short.length - sb ? " and " + (short.length - sb) + " reach the record's end first" : "") : "") + ". The 42-day rule, for comparison, calls all 82 over, and 43 of them broke.";
    wall(T);
  }
  var shuffled = null;
  function wall(T) {
    var c = $("wall"), n = D.quiets.length, cols = 120;
    var g = sizeCanvas(c, Math.min(520, Math.max(260, n * 5))), x = g.x, rh = g.h / n, cw = g.w / cols, show = $("reveal").checked;
    x.clearRect(0, 0, g.w, g.h);
    shuffled.forEach(function (qi, r) {
      var q = D.quiets[qi];
      for (var i = 0; i < Math.min(cols, q.k.length); i++) {
        var k = q.k[i]; if (k === "n") continue;
        x.fillStyle = css(k === "w" ? "--w" : "--a"); x.globalAlpha = k === "w" ? 0.55 : 0.9;
        x.fillRect(i * cw, r * rh, Math.max(cw - 0.4, 0.6), Math.max(rh - 1, 1));
      }
      x.globalAlpha = 1;
      if (show && q.k.length < cols) {
        x.fillStyle = css(q.b ? "--case" : "--held");
        x.fillRect(q.k.length * cw, r * rh - 1, q.b ? Math.max(cw * 2, 3) : 2, rh + 1);
      }
    });
    if (T) { x.strokeStyle = css("--you"); x.lineWidth = 2; x.beginPath(); x.moveTo(T * cw, 0); x.lineTo(T * cw, g.h); x.stroke(); }
    x.strokeStyle = css("--mute"); x.setLineDash([3, 4]); x.lineWidth = 1; x.beginPath(); x.moveTo(42 * cw, 0); x.lineTo(42 * cw, g.h); x.stroke(); x.setLineDash([]);
  }

  // ---------- open ----------
  fetch("quiets.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; HOLE = d.records.kivuHole;
    order = d.quiets.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = order[i]; order[i] = order[j]; order[j] = t; }
    shuffled = order.slice().reverse();
    var F = d.facts;
    $("auc").innerHTML = "Of the 82 quiets, " + F.broke + " later broke. In their first 42 days, the ones that broke had a report naming the zone on " + Math.round(F.named42.broke * 100) + " % of days, the ones that held on " + Math.round(F.named42.held * 100) + " %; no report at all on " + (F.silent42.broke * 100).toFixed(1) + " % against " + (F.silent42.held * 100).toFixed(1) + " %. Told one that broke and one that held, a listener who bets on whichever had fewer named days picks the one that broke " + Math.round((1 - F.auc.named) * 100) + " times in 100; on whichever had more silence, " + Math.round(F.auc.silent * 100) + " times in 100. A coin does 50. What the first 42 days sound like does not say which quiets will hold. Only how long you wait does, and only by buying time: a 63-day clock still calls " + F.wait[63].over + " over, " + F.wait[63].brokeAfter + " of which broke; a 90-day clock " + F.wait[90].over + ", " + F.wait[90].brokeAfter + " of which broke.";
    drawStrip(); tally();
    if (/[?&]demo/.test(location.search)) demo();
  });
  $("go").onclick = start; $("next").onclick = start; $("over").onclick = declare;
  $("reveal").onchange = function () { var s = log.filter(function (r) { return r.said !== null; }).map(function (r) { return r.said; }); wall(s.length ? median(s) : 0); };
  $("pace").onchange = function () { if (timer && !revealing && said === null) run(+$("pace").value); };
  document.addEventListener("keydown", function (e) {
    if (e.code === "Space" && cur && said === null && !$("over").hidden && !$("over").disabled) { e.preventDefault(); declare(); }
  });
  window.addEventListener("resize", function () { drawStrip(); if (!$("clock").hidden) $("reveal").onchange(); });

  // ?demo: plays three quiets instantly with fixed declarations, for the process screenshot
  function demo() {
    $("snd").checked = false;
    var picks = [0, 1, 2].map(function (i) { return order[i]; }), says = [38, 47, 55];
    picks.forEach(function (qi, i) {
      cur = D.quiets[qi]; said = Math.min(says[i], cur.k.length); day = cur.k.length + (cur.b ? 1 : 0); finish();
    });
    ix = 2; cur = D.quiets[order[3]]; said = null; day = 31; tally(); drawStrip();
    $("go").hidden = true; $("next").hidden = true; $("over").hidden = false; $("over").disabled = false; $("verdict").textContent = "";
  }
})();
