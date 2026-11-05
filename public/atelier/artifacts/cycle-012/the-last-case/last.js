// The Last Case — the Atelier, cycle 012. No library. Data: quiets.json (build.py).
// State 3 (2026-11-05): the first three quiets are chosen, the clock and the wall are gone,
// the reveal can be skipped, the verdicts stand, and the pairs open after three quiets.
(function () {
  "use strict";
  var $ = function (id) { return document.getElementById(id); };
  var css = function (v) { return getComputedStyle(document.documentElement).getPropertyValue(v).trim(); };
  var D, order = [], ix = -1, cur = null, day = 0, timer = null, said = null, revealing = false;
  var log = []; // {q, said, broke, L}
  var PER_ROW = 30, HOLE = null, OPEN_PAIRS = 3;
  // The first three are chosen, and the page says so: a 2026 quiet with gaps in its reporting,
  // then the Kivu quiet that runs into the 94-day hole of 2020. The rest are drawn.
  var FIRST = [["Lubunga", "2026-07-10"], ["Beni", "2020-02-17"]];

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
    var c = $("strip"), shown = cur ? day : 0, total = Math.max(shown, 60);
    var per = window.innerWidth < 600 ? 15 : PER_ROW;
    // a long reveal shrinks the squares instead of growing the page without end
    if (total > per * 6) per = Math.ceil(total / 6);
    var rows = Math.ceil(Math.max(total, 1) / per), cell = Math.max(4, Math.min(26, Math.floor(c.clientWidth / per)));
    var g = sizeCanvas(c, Math.max(rows * cell + 4, cell * 2 + 4)), x = g.x, gap = cell > 10 ? 3 : 1;
    x.clearRect(0, 0, g.w, g.h);
    for (var i = 0; i < total; i++) {
      var X = (i % per) * cell, Y = Math.floor(i / per) * cell, s = cell - gap;
      if (i >= shown) { x.strokeStyle = css("--line"); x.lineWidth = 1; x.setLineDash([2, 3]); x.strokeRect(X + 0.5, Y + 0.5, s, s); x.setLineDash([]); continue; }
      var k = i < cur.k.length ? cur.k[i] : "X";
      if (k === "X") { x.fillStyle = css("--case"); x.beginPath(); x.arc(X + s / 2, Y + s / 2, Math.max(s / 2, 4), 0, 7); x.fill(); continue; }
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
  function nextIndex() {
    // never the same zone twice while a visitor is still listening to the first movement
    var seen = log.map(function (r) { return r.q.z; });
    for (var tries = 0; tries < order.length; tries++) {
      ix = (ix + 1) % order.length;
      if (seen.indexOf(D.quiets[order[ix]].z) < 0 || log.length >= 20) return order[ix];
    }
    return order[ix];
  }
  function start() {
    audio(); if (ac && ac.state === "suspended") ac.resume();
    cur = D.quiets[nextIndex()]; day = 0; said = null; revealing = false;
    $("go").hidden = true; $("next").hidden = true; $("over").disabled = false; $("over").hidden = false; $("skip").hidden = true;
    $("verdict").textContent = ""; $("where").textContent = "";
    run(+$("pace").value);
  }
  function run(rate) {
    clearInterval(timer);
    timer = setInterval(step, 1000 / rate);
  }
  function step() {
    var L = cur.k.length;
    if (day < L) {
      day++; if (!revealing) tick(cur.k[day - 1]); tally(); drawStrip(); return;
    }
    clearInterval(timer);
    if (cur.b) { day = L + 1; tick("case"); } else tick("end");
    drawStrip(); finish();
  }
  function declare() {
    if (said !== null || !cur) return;
    said = Math.min(day, cur.k.length); $("over").disabled = true; $("over").hidden = true;
    $("verdict").innerHTML = "You said it is over on day <b>" + said + "</b>: “the last case was " + said + " days ago.” Now the record goes on.";
    revealing = true; $("skip").hidden = false;
    // whatever is left plays in about three seconds
    run(Math.max(40, (cur.k.length - day) / 3));
  }
  function skip() {
    if (!revealing || !cur) return;
    clearInterval(timer); day = cur.k.length; tally(); step();
  }
  function fmt(iso) { var d = new Date(iso + "T00:00:00Z"); return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); }
  function addDays(iso, n) { var d = new Date(iso + "T00:00:00Z"); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }
  function holeNote(q) {
    // does this quiet run into the 94 days of 2020 when no report came at all?
    if (q.rec !== "kivu" || !HOLE) return "";
    var a = q.f, z = addDays(q.f, q.k.length);
    if (z < HOLE[0] || a > HOLE[1]) return "";
    var s = "After " + fmt(HOLE[0]) + " this record holds no report for any zone until " + fmt(HOLE[1]) + ": 94 days. Waiting longer through those days was waiting through silence, not through news.";
    if (q.b && addDays(q.f, q.k.length + 1) >= HOLE[1] && addDays(q.f, q.k.length + 1) <= addDays(HOLE[1], 3)) s += " The new case came with the first report after the silence.";
    return s;
  }
  function finish() {
    var L = cur.k.length, txt;
    if (cur.b) {
      txt = said === null
        ? "Before you said anything, <b class='case'>a new confirmed case came on day " + (L + 1) + "</b>."
        : "<b class='case'>A new confirmed case came on day " + (L + 1) + "</b>, " + (L + 1 - said) + " days after you said it was over. Your sentence was false, and it was day " + (L + 1) + " that made it so.";
    } else {
      txt = said === null
        ? "<b class='held'>The record ends on day " + L + "</b> with no new case, before you said anything."
        : "<b class='held'>The record ends on day " + L + "</b> with no new case. Your sentence is not false. It is not yet true either: only a record that goes on could write that.";
    }
    var h = holeNote(cur);
    $("verdict").innerHTML = txt + (h ? "<span class='hole'>" + h + "</span>" : "");
    $("where").textContent = cur.z + ", from " + fmt(cur.f) + " · " + (cur.rec === "bdbv" ? "Congo and Ituri, 2026" : "North Kivu and Ituri, 2018–2020");
    $("over").hidden = true; $("skip").hidden = true; revealing = false;
    $("next").hidden = false; $("next").focus({ preventScroll: true });
    log.push({ q: cur, said: said, broke: cur.b, L: L });
    ledger();
    if (log.length === OPEN_PAIRS) openPairs();
  }

  // ---------- what stands ----------
  function ledger() {
    $("ledger").hidden = false;
    $("rows").innerHTML = log.map(function (r) {
      var you = r.said === null ? "You said nothing." : "You said “over” on day " + r.said + ".";
      var came = r.broke ? "<span class='case'>A case came on day " + (r.L + 1) + ".</span>" : "<span class='held'>Nothing came; the record ends on day " + r.L + ".</span>";
      var verdict = r.said === null ? "" : r.broke ? " <i>False.</i>" : " <i>Not yet true.</i>";
      return "<li><span class='z'>" + r.q.z + " " + r.q.f.slice(0, 4) + "</span> " + you + " " + came + verdict + "</li>";
    }).join("");
    var left = OPEN_PAIRS - log.length;
    $("ledgernote").textContent = left > 0 ? (left === 1 ? "One more quiet, and the second movement opens." : left + " more quiets, and the second movement opens.") : "";
  }
  function openPairs() {
    var p = $("pair"); p.classList.remove("locked"); $("pgo").disabled = false;
    $("plock").textContent = "Three quiets heard. The second movement is open.";
    window.dispatchEvent(new Event("pairs-open"));
  }

  // ---------- open ----------
  fetch("quiets.json").then(function (r) { return r.json(); }).then(function (d) {
    D = d; HOLE = d.records.kivuHole;
    var rest = d.quiets.map(function (_, i) { return i; });
    var first = FIRST.map(function (zf) {
      for (var i = 0; i < d.quiets.length; i++) if (d.quiets[i].z === zf[0] && d.quiets[i].f === zf[1]) return i;
      return -1;
    }).filter(function (i) { return i >= 0; });
    rest = rest.filter(function (i) { return first.indexOf(i) < 0; });
    for (var i = rest.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)), t = rest[i]; rest[i] = rest[j]; rest[j] = t; }
    order = first.concat(rest);
    var F = d.facts;
    $("auc").innerHTML = "Of the 82 quiets, " + F.broke + " later broke. In their first 42 days, the ones that broke had a report naming the zone on " + Math.round(F.named42.broke * 100) + " % of days, the ones that held on " + Math.round(F.named42.held * 100) + " %; no report at all on " + (F.silent42.broke * 100).toFixed(1) + " % against " + (F.silent42.held * 100).toFixed(1) + " %. What the first 42 days sound like does not say which quiets will hold. Only how long you wait does, and only by buying time: a 63-day wait still calls " + F.wait[63].over + " quiets over, " + F.wait[63].brokeAfter + " of which broke; a 90-day wait " + F.wait[90].over + ", " + F.wait[90].brokeAfter + " of which broke.";
    drawStrip(); tally();
    if (/[?&]demo/.test(location.search)) demo();
  });
  $("go").onclick = start; $("next").onclick = start; $("over").onclick = declare; $("skip").onclick = skip;
  $("pace").onchange = function () { if (timer && !revealing && said === null) run(+$("pace").value); };
  document.addEventListener("keydown", function (e) {
    if (e.code !== "Space" || !cur) return;
    if (said === null && !$("over").hidden && !$("over").disabled) { e.preventDefault(); declare(); }
    else if (revealing) { e.preventDefault(); skip(); }
  });
  window.addEventListener("resize", drawStrip);

  // ?demo: plays the three first quiets instantly with fixed declarations, for the process screenshot
  function demo() {
    $("snd").checked = false;
    var says = [44, 38, 51];
    [0, 1, 2].forEach(function (n) {
      cur = D.quiets[nextIndex()]; said = Math.min(says[n], cur.k.length); day = cur.k.length + (cur.b ? 1 : 0); finish();
    });
    cur = D.quiets[order[1]]; said = 38; day = cur.k.length + 1; drawStrip(); tally();
    $("verdict").innerHTML = "<b class='case'>A new confirmed case came on day " + day + "</b>, " + (day - said) + " days after you said it was over. Your sentence was false, and it was day " + day + " that made it so.<span class='hole'>" + holeNote(cur) + "</span>";
    $("where").textContent = cur.z + ", from " + fmt(cur.f) + " · North Kivu and Ituri, 2018–2020";
  }
})();
