// The Last Case — second movement: two quiets at once, one per ear. Which one breaks?
// The Atelier, cycle 012, session 2; state 3 (11-05) locks it until three quiets are heard and ends it on a tally. No library. Data: quiets.json (build.py).
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  var D, B, H, pair = null, day = 0, timer = null, trials = [], N = 42;

  var ac = null, out = {};
  function audio() {
    if (ac || !$("psnd").checked) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      var m = ac.createGain(); m.gain.value = 0.5; m.connect(ac.destination);
      ["A", "B"].forEach(function (s) {
        var p = ac.createStereoPanner ? ac.createStereoPanner() : ac.createGain();
        if (p.pan) p.pan.value = s === "A" ? -0.85 : 0.85;
        p.connect(m); out[s] = p;
      });
    } catch (e) { ac = null; }
  }
  function tick(kind, side) {
    if (!ac || !$("psnd").checked) return;
    var t = ac.currentTime + (side === "B" ? 0.035 : 0), o = ac.createOscillator(), g = ac.createGain();
    if (kind === "w") { o.type = "sine"; o.frequency.value = 1320; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.3, t + 0.004); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06); }
    else if (kind === "a") { o.type = "triangle"; o.frequency.value = 330; g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.22, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12); }
    else return;
    o.connect(g); g.connect(out[side]); o.start(t); o.stop(t + 0.2);
  }

  function sizeCanvas(c, h) {
    var r = window.devicePixelRatio || 1, w = c.clientWidth;
    c.width = Math.round(w * r); c.height = Math.round(h * r); c.style.height = h + "px";
    var x = c.getContext("2d"); x.setTransform(r, 0, 0, r, 0, 0); return { x: x, w: w, h: h };
  }
  function drawOne(id, q, shown, outcome) {
    var c = $(id), per = window.innerWidth < 600 ? 21 : 42, cell = Math.min(24, Math.floor(c.clientWidth / per));
    var rows = Math.ceil(N / per), g = sizeCanvas(c, rows * cell + 4), x = g.x;
    x.clearRect(0, 0, g.w, g.h);
    for (var i = 0; i < N; i++) {
      var X = (i % per) * cell, Y = Math.floor(i / per) * cell, s = cell - 3;
      if (!q || i >= shown) { x.strokeStyle = css("--line"); x.setLineDash([2, 3]); x.strokeRect(X + 0.5, Y + 0.5, s, s); x.setLineDash([]); continue; }
      var k = q.k[i];
      x.fillStyle = css(k === "w" ? "--w" : k === "a" ? "--a" : "--n"); x.fillRect(X, Y, s, s);
      if (k === "n") { x.strokeStyle = css("--nb"); x.lineWidth = 1; x.strokeRect(X + 0.5, Y + 0.5, s - 1, s - 1); }
    }
    if (outcome) { c.style.outline = "2px solid " + css(q.b ? "--case" : "--held"); c.style.outlineOffset = "4px"; }
    else c.style.outline = "none";
  }
  function draw(reveal) {
    drawOne("pa", pair && pair.A, day, reveal);
    drawOne("pb", pair && pair.B, day, reveal);
    $("pday").textContent = day;
  }
  function pick(a) { return a[Math.floor(Math.random() * a.length)]; }
  function startPair() {
    if ($("pair").classList.contains("locked")) return;
    audio(); if (ac && ac.state === "suspended") ac.resume();
    var b = pick(B), h = pick(H), flip = Math.random() < 0.5;
    pair = { A: flip ? b : h, B: flip ? h : b };
    day = 0; $("pgo").hidden = true; $("pA").disabled = true; $("pB").disabled = true;
    $("pA").hidden = false; $("pB").hidden = false; $("pverdict").textContent = "";
    $("oa").textContent = ""; $("ob").textContent = "";
    clearInterval(timer);
    timer = setInterval(function () {
      if (day >= N) {
        clearInterval(timer); $("pA").disabled = false; $("pB").disabled = false;
        $("pverdict").textContent = "Forty-two days, both. Which one will write a new case?"; $("pA").focus({ preventScroll: true }); return;
      }
      day++; tick(pair.A.k[day - 1], "A"); tick(pair.B.k[day - 1], "B"); draw(false);
    }, 1000 / +$("ppace").value);
  }
  function fmtOut(q) {
    var L = q.k.length, where = q.z + " " + q.f.slice(0, 4);
    return q.b ? "new case on day " + (L + 1) + " · " + where
               : "no new case to the record's end, day " + L + " · " + where;
  }
  function guess(side) {
    if (!pair || day < N || $("pA").disabled) return;
    $("pA").disabled = true; $("pB").disabled = true;
    var right = pair[side].b; trials.push(right);
    draw(true);
    $("oa").innerHTML = "<span class='" + (pair.A.b ? "case" : "held") + "'>" + fmtOut(pair.A) + "</span>";
    $("ob").innerHTML = "<span class='" + (pair.B.b ? "case" : "held") + "'>" + fmtOut(pair.B) + "</span>";
    $("pverdict").innerHTML = (right ? "<b class='held'>Right.</b> " : "<b class='case'>Wrong.</b> ") +
      "You bet on " + (side === "A" ? "the left" : "the right") + ". What decided it came after day 42, where no one listening could be.";
    $("pgo").hidden = false; $("pgo").textContent = "Another pair"; $("pA").hidden = true; $("pB").hidden = true;
    score();
  }
  function score() {
    var n = trials.length, k = trials.filter(Boolean).length, F = D.facts;
    var best = Math.round(Math.max(F.auc.named, 1 - F.auc.named, F.auc.silent, 1 - F.auc.silent) * 100);
    $("pscore").innerHTML = "You: <b>" + k + " of " + n + "</b>. A coin would expect " + (n / 2).toFixed(n % 2 ? 1 : 0) + ".";
    if (n < 5) { $("pend").hidden = true; return; }
    // after five bets, the visitor's tally stands beside the coin and the best bet the record allows
    $("pend").hidden = false;
    $("pend").innerHTML = "<div class='bars'>" + bar("you", Math.round(100 * k / n), "you, " + k + " of " + n) +
      bar("coin", 50, "a coin") + bar("best", best, (1 - F.auc.silent >= 1 - F.auc.named ? "less silence" : "more named days") + ", the best simple bet") + "</div>" +
      "<p>The quiets that broke had a report naming the zone on " + Math.round(F.named42.broke * 100) + " % of their first 42 days; the ones that held, on " +
      Math.round(F.named42.held * 100) + " %. Over all " + F.pairs.toLocaleString("en-GB") + " pairs this record holds, the best bet on what those days sound like is right <b>" + best +
      " times in 100</b>. That bet was found afterwards, by counting the outcomes, so it is itself a sentence only the later days could write. " +
      "A bet on a pair can be scored the day it is made. “The last case has been” cannot: the first 42 days do not turn it into a prediction.</p>";
  }
  function bar(cls, pct, label) {
    return "<div class='bar " + cls + "'><span style='width:" + Math.max(2, pct) + "%'></span><em>" + pct + " in 100</em> <small>" + label + "</small></div>";
  }

  fetch("quiets.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; B = d.quiets.filter(function (q) { return q.b; }); H = d.quiets.filter(function (q) { return !q.b; });
    draw(false);
    if (/[?&]demo/.test(location.search)) {
      $("psnd").checked = false; trials = [true, false, true, false];
      pair = { A: B[7], B: H[12] }; day = N; $("pA").disabled = false; guess("B");
    }
    if ($("pair").classList.contains("locked")) $("pgo").disabled = true;
  });
  $("pgo").onclick = startPair; $("pA").onclick = function () { guess("A"); }; $("pB").onclick = function () { guess("B"); };
  window.addEventListener("resize", function () { draw(!$("pgo").hidden && trials.length > 0); });
})();
