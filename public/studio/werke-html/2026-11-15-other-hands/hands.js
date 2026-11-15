/* OTHER HANDS — the Studio, cycle 015. Own code, Apache-2.0, no library.
   One paragraph per incident, one word per report, set in the hand of whoever wrote it.
   Everything drawn follows from data.js; the only arbitrary thing is the length of a word. */
(function () {
  'use strict';
  var D = window.OH, M = D.meta, INC = D.inc;
  var C = { paper: '#f5f2ea', ink: '#1b1a17', soft: '#6d685d', type: '#9a958a', faint: '#d9d3c4', red: '#c4301c', blue: '#1d4fb8' };
  var sheet = document.getElementById('sheet'), sx = sheet.getContext('2d');
  var say = document.getElementById('say');
  var ROW = 5, BAR = 2.4, GAP = 2.2, PARA = 2.6, YEARH = 11;
  var L = null;                       // the layout
  var layers = {};                    // offscreen canvases: type, hand, seal
  var alpha = { type: 1, hand: 1, seal: 1 }, want = { type: 1, hand: 1, seal: 1 };
  var reading = 'all', picked = -1, playing = false, shown = 0, raf = 0;
  var counts = {};                    // what was actually drawn, for the check

  function rnd(a, b) {                // a fixed number in [0,1) from two integers
    var x = (Math.imul(a + 1, 73856093) ^ Math.imul(b + 7, 19349663)) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177) >>> 0; x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }

  /* ---------- layout: one virtual column, cut into the columns that fit ---------- */
  function layout(W) {
    var phone = W < 520;
    var gut = phone ? 10 : 18, target = phone ? 108 : 148;
    var cols = Math.max(2, Math.floor((W + gut) / (target + gut)));
    var cw = (W - gut * (cols - 1)) / cols;
    var words = [], paras = [], years = [];
    var y = 0, year = '';
    for (var i = 0; i < INC.length; i++) {
      var r = INC[i], id = r[0], hands = r[2], first = r[4], ans = r[5], tgt = r[6];
      var yr = r[1].slice(0, 4);
      if (yr !== year) { year = yr; years.push({ y: y, t: yr }); y += YEARH; }
      var x = 0, y0 = y, items = [];
      if (!hands) items.push({ t: '0', l: 16 });
      for (var j = 0; j < hands.length; j++) {
        var t = hands[j], l = 6 + rnd(id, j) * 9;
        if (j === 0) {
          l += 5;
          if (first === 'H') { t = 'H'; l = 44 + rnd(id, 99) * 14; }
          else if (first === 'w') { t = 'w'; l = 26 + rnd(id, 99) * 8; }
          else if (first === 'n') { t = 'n'; l = 16; }
          else if (first === 'x') { t = 'x'; l = 16; }
          else if (first === 'm') { t = 'm'; }
        }
        items.push({ t: t, l: l });
      }
      if (ans.indexOf('M') >= 0) items.push({ t: 'A', l: 6 });
      if (ans.indexOf('O') >= 0) items.push({ t: 'O', l: 6 });
      if (ans.indexOf('P') >= 0) items.push({ t: tgt === 'u' ? 'U' : 'K', l: 10 });
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (x > 0 && x + it.l > cw) { x = 0; y += ROW; }
        words.push({ x: x, y: y, l: it.l, t: it.t, i: i, k: k });
        x += it.l + GAP;
      }
      y += ROW + PARA;
      paras.push({ y0: y0, y1: y });
    }
    var hc = Math.ceil(y / cols / ROW) * ROW + ROW;
    return { W: W, cols: cols, cw: cw, gut: gut, hc: hc, H: hc + 8, words: words, paras: paras, years: years };
  }
  function place(v) {                 // virtual y -> column and y on the sheet
    var c = Math.min(L.cols - 1, Math.floor(v / L.hc));
    return { x: c * (L.cw + L.gut), y: v - c * L.hc + 4 };
  }

  /* ---------- the marks ---------- */
  function scribble(g, x, y, l, id, amp, col, lw) {
    var f = 0.62 + rnd(id, 3) * 0.5, ph = rnd(id, 4) * 6.28, n = Math.ceil(l * 2);
    g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath();
    for (var s = 0; s <= n; s++) {
      var t = s / 2, env = 0.55 + 0.45 * Math.sin(t * 0.21 + rnd(id, 5) * 6.28);
      var px = x + t + Math.sin(t * f + ph) * 1.7;
      var py = y + BAR / 2 - Math.cos(t * f + ph) * amp * env - Math.sin(t * 0.09 + ph) * 0.8;
      if (s) g.lineTo(px, py); else g.moveTo(px, py);
    }
    g.stroke();
  }
  function mark(w, only) {            // draws one word into its layer
    var p = place(w.y), x = p.x + w.x, y = p.y, id = INC[w.i][0], g;
    var t = w.t;
    var layer = t === 'H' ? 'hand' : (t === 'U' || t === 'K') ? 'seal' : 'type';
    if (only && only !== layer) return;
    g = layers[layer].g;
    counts[t] = (counts[t] || 0) + 1;
    if (t === 'p') { g.fillStyle = C.type; g.fillRect(x, y, w.l, BAR); }
    else if (t === 'r') {
      g.fillStyle = C.type; g.beginPath(); g.moveTo(x + 2, y - 0.6); g.lineTo(x + w.l + 2, y - 0.6);
      g.lineTo(x + w.l - 1, y + BAR + 0.6); g.lineTo(x - 1, y + BAR + 0.6); g.closePath(); g.fill();
      g.fillStyle = C.paper; for (var q = 3; q < w.l; q += 3) g.fillRect(x + q, y - 1, 0.8, BAR + 2);
    }
    else if (t === 'm') { g.fillStyle = C.ink; g.fillRect(x, y - 0.5, w.l, BAR + 1); }
    else if (t === 'g') { g.fillStyle = C.blue; g.fillRect(x, y - 0.2, w.l, BAR + 0.4); }
    else if (t === 's') { scribble(g, x, y, w.l - 1, id * 31 + w.k, 0.9, C.type, 0.8); }
    else if (t === 'u' || t === 'x') { g.fillStyle = C.type; for (var d = 0; d < w.l; d += 3) g.fillRect(x + d, y + 0.4, 1.4, 1.4); }
    else if (t === 'n' || t === '0') { g.strokeStyle = C.type; g.lineWidth = 0.7; g.strokeRect(x + 0.5, y - 0.6, w.l - 1, BAR + 1.2); }
    else if (t === 'w') { scribble(g, x, y, w.l, id, 2.2, C.soft, 0.85); }
    else if (t === 'H') { scribble(g, x, y, w.l, id, 4.3, C.red, 1.25); }
    else if (t === 'A' || t === 'O') {
      g.beginPath(); g.moveTo(x + 0.5, y - 1.2); g.lineTo(x + 5.5, y + BAR / 2); g.lineTo(x + 0.5, y + BAR + 1.2); g.closePath();
      if (t === 'A') { g.fillStyle = C.ink; g.fill(); } else { g.strokeStyle = C.soft; g.lineWidth = 0.8; g.stroke(); }
    }
    else if (t === 'U' || t === 'K') {
      var cx = x + 5, cy = y + BAR / 2;
      g.beginPath(); g.arc(cx, cy, 4.4, 0, 6.2832);
      if (t === 'U') { g.fillStyle = C.blue; g.fill(); g.fillStyle = C.paper; g.fillRect(cx - 2.4, cy - 0.5, 4.8, 1); }
      else { g.strokeStyle = C.blue; g.lineWidth = 1.6; g.stroke(); g.fillStyle = C.blue; g.fillRect(cx - 1.6, cy - 0.5, 3.2, 1); }
    }
  }
  function yearsOn(g) {
    g.font = '8px ui-monospace,Menlo,Consolas,monospace'; g.textBaseline = 'alphabetic';
    for (var i = 0; i < L.years.length; i++) {
      var p = place(L.years[i].y);
      g.fillStyle = C.ink; g.fillText(L.years[i].t, p.x, p.y + 6.5);
      g.fillStyle = C.faint; g.fillRect(p.x + 24, p.y + 3.5, L.cw - 24, 0.7);
    }
  }

  /* ---------- canvases ---------- */
  var DPR = 1;
  function make(name) {
    var c = document.createElement('canvas'); c.width = Math.round(L.W * DPR); c.height = Math.round(L.H * DPR);
    var g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    layers[name] = { c: c, g: g };
  }
  function build() {
    var W = Math.floor(sheet.parentNode.clientWidth - 32);
    W = Math.max(280, Math.min(1100, W));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    L = layout(W);
    sheet.style.height = L.H + 'px'; sheet.style.maxWidth = W + 'px';
    sheet.width = Math.round(W * DPR); sheet.height = Math.round(L.H * DPR);
    make('type'); make('hand'); make('seal');
    counts = {};
    yearsOn(layers.type.g);
    for (var i = 0; i < L.words.length; i++) mark(L.words[i]);
    shown = L.words.length;
    window.__oh = { drawn: counts, words: L.words.length, cols: L.cols, height: L.H };
    tally();
    paint();
  }
  function paint() {
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.fillStyle = C.paper; sx.fillRect(0, 0, sheet.width, sheet.height);
    sx.globalAlpha = alpha.type; sx.drawImage(layers.type.c, 0, 0);
    sx.globalAlpha = alpha.seal; sx.drawImage(layers.seal.c, 0, 0);
    sx.globalAlpha = alpha.hand; sx.drawImage(layers.hand.c, 0, 0);
    sx.globalAlpha = 1;
    if (picked >= 0) {
      var pa = L.paras[picked], a = place(pa.y0), b = place(pa.y1 - PARA - 0.01);
      sx.setTransform(DPR, 0, 0, DPR, 0, 0);
      sx.strokeStyle = C.ink; sx.lineWidth = 1;
      if (a.x === b.x) sx.strokeRect(a.x - 3.5, a.y - 5.5, L.cw + 7, b.y - a.y + 10);
      else {
        sx.strokeRect(a.x - 3.5, a.y - 5.5, L.cw + 7, L.hc - (a.y - 4) + 5);
        sx.strokeRect(b.x - 3.5, 0.5, L.cw + 7, b.y + 4);
      }
    }
  }
  function tick() {
    var moving = false;
    ['type', 'hand', 'seal'].forEach(function (k) {
      var d = want[k] - alpha[k];
      if (Math.abs(d) > 0.004) { alpha[k] += d * 0.14; moving = true; } else alpha[k] = want[k];
    });
    if (playing) { step(); moving = true; }
    paint();
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  /* ---------- the two counts under the sheet ---------- */
  function tally() {
    var c = document.getElementById('tally'), W = L.W, g = c.getContext('2d');
    var rows1 = [['p', M.first.press], ['g', M.first.public], ['r', M.first.research], ['m', M.first.maker],
      ['n', M.record_note], ['x', M.unreadable], ['w', M.witness], ['H', M.harmed]];
    // the two maker texts found on a platform are counted with the platform's 58, drawn black
    var items = [];
    rows1.forEach(function (r) { for (var i = 0; i < r[1]; i++) items.push(r[0]); });
    for (var i2 = 0; i2 < M.maker_on_platform; i2++) items.splice(items.indexOf('n'), 0, 'M2');
    var x = 0, y = 6, pos = [];
    items.forEach(function (t, i) {
      var l = t === 'H' ? 30 : t === 'w' ? 14 : (t === 'n' || t === 'x') ? 8 : 3;
      if (x + l > W) { x = 0; y += 12; }
      pos.push([t, x, y, l, i]); x += l + (t === 'p' ? 1 : 3);
    });
    var y2 = y + 34; x = 0;
    var rows2 = [['A', M.maker_answered], ['O', M.other_answered], ['U', M.on_user], ['K', M.on_maker]];
    var pos2 = [];
    rows2.forEach(function (r) {
      for (var i = 0; i < r[1]; i++) {
        var l = (r[0] === 'U' || r[0] === 'K') ? 12 : 8;
        if (x + l > W) { x = 0; y2 += 14; }
        pos2.push([r[0], x, y2, l, i]); x += l;
      }
      x += 14;
    });
    var H = y2 + 14;
    c.style.height = H + 'px'; c.style.maxWidth = W + 'px';
    c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    var keep = layers, keepL = L, keepCounts = counts;
    layers = { type: { g: g }, hand: { g: g }, seal: { g: g } }; counts = {};
    L = { cols: 1, hc: 1e9, cw: W, gut: 0 };
    pos.concat(pos2).forEach(function (p) {
      var t = p[0] === 'M2' ? 'm' : p[0];
      INC.push([900000 + p[4], '', '', '', '', '', '']);
      mark({ x: p[1], y: p[2] - 4, l: p[3], t: t, i: INC.length - 1, k: 0 });
      INC.pop();
    });
    window.__oh.tally = counts;
    layers = keep; L = keepL; counts = keepCounts;
  }

  /* ---------- readings, stepping, pointing ---------- */
  var sets = { all: [], hand: [], seal: [] };
  INC.forEach(function (r, i) { sets.all.push(i); if (r[4] === 'H') sets.hand.push(i); if (r[5].indexOf('P') >= 0) sets.seal.push(i); });
  var FIRST = { p: 'the press or another edited address', r: 'a research address', m: 'the maker\'s own address', g: 'a public body\'s address', s: 'a platform without an editor', u: 'an unknown address' };
  var HAND = { H: 'the person harmed', w: 'a witness', n: 'the database\'s own note', x: 'unreadable in the snapshot', m: 'the maker, on a platform' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function describe(i) {
    var r = INC[i], n = r[2].length, s = '<b>Incident ' + r[0] + '</b> · ' + r[1] + ' · ' + n + (n === 1 ? ' report' : ' reports') + '. ';
    if (!n) s += 'No report is attached. ';
    else {
      s += 'First written from ' + FIRST[r[2][0]];
      if (r[4]) s += ', read by the Field: ' + (r[4] === 'H' ? '<span class="hand">' + HAND.H + '</span>' : HAND[r[4]]) + (D.na[r[0]] ? ' (' + esc(D.na[r[0]]) + ')' : '');
      s += '. ';
    }
    if (r[5]) {
      var a = [];
      if (r[5].indexOf('M') >= 0) a.push('the maker');
      if (r[5].indexOf('O') >= 0) a.push('someone else');
      if (a.length) s += 'Answered by ' + a.join(' and ') + '. ';
      if (r[5].indexOf('P') >= 0) s += '<span class="seal">A public body acted</span>, on ' + (r[6] === 'u' ? 'the person who used the AI' : 'whoever made or ran it') + (D.nb[r[0]] ? ' (' + esc(D.nb[r[0]]) + ')' : '') + '. ';
    }
    return s + '<a href="https://incidentdatabase.ai/cite/' + r[0] + '/" target="_blank" rel="noopener">Open it in the database</a>';
  }
  var REST = {
    all: function () { return fmt(M.incidents) + ' paragraphs, ' + fmt(M.words) + ' words. ' + (('ontouchstart' in window) ? 'Tap' : 'Point at') + ' a paragraph, or step through them with the arrows.'; },
    hand: function () { return 'The type is lifted off. What stays is what the harmed wrote first themselves: ' + M.harmed + ' of ' + fmt(M.with_report) + ', as far as the Field has read. Step through them with the arrows.'; },
    seal: function () { return 'What stays is ' + M.public_acted + ' acts of public bodies: ' + M.on_user + ' full seals on the person who used the AI, ' + M.on_maker + ' rings on whoever made or ran it. Step through them with the arrows.'; }
  };
  function rest() { say.innerHTML = REST[reading](); }
  function setReading(r) {
    reading = r; picked = -1;
    want = r === 'all' ? { type: 1, hand: 1, seal: 1 } : r === 'hand' ? { type: 0.07, hand: 1, seal: 0.05 } : { type: 0.07, hand: 0.12, seal: 1 };
    [['rAll', 'all'], ['rHand', 'hand'], ['rSeal', 'seal']].forEach(function (b) { document.getElementById(b[0]).setAttribute('aria-pressed', String(b[1] === r)); });
    rest(); kick();
  }
  function pick(i, scroll) {
    picked = i;
    if (i < 0) { rest(); } else {
      say.innerHTML = describe(i);
      if (scroll) {
        var p = place(L.paras[i].y0), rct = sheet.getBoundingClientRect();
        var top = rct.top + window.scrollY + p.y - window.innerHeight * 0.6;
        if (Math.abs(top - window.scrollY) > window.innerHeight * 0.3) { quiet = performance.now() + 1200; window.scrollTo({ top: top, behavior: 'smooth' }); }
      }
      if (snd.on) voice(INC[i]);
    }
    kick();
  }
  function stepSet(d) {
    var s = sets[reading], at = s.indexOf(picked);
    if (at < 0) {                      // from a paragraph outside the set, go to the nearest one after or before it
      at = d > 0 ? -1 : s.length;
      if (picked >= 0) for (var i = 0; i < s.length; i++) { if (s[i] < picked) at = d > 0 ? i : i + 1; }
    }
    pick(s[(at + d + s.length) % s.length], true);
  }
  function hit(e) {
    var rc = sheet.getBoundingClientRect(), px = e.clientX - rc.left, py = e.clientY - rc.top;
    var c = Math.floor(px / (L.cw + L.gut));
    if (c < 0 || c >= L.cols || px - c * (L.cw + L.gut) > L.cw + 4) return -1;
    var v = c * L.hc + py - 4, lo = 0, hi = L.paras.length - 1;
    while (lo < hi) { var m = (lo + hi) >> 1; if (L.paras[m].y1 <= v) lo = m + 1; else hi = m; }
    return (v >= L.paras[lo].y0 - 3 && v < L.paras[lo].y1) ? lo : -1;
  }
  var quiet = 0;                      // while a step scrolls the page, the sheet passing under a resting pointer picks nothing
  sheet.addEventListener('mousemove', function (e) { if (playing || performance.now() < quiet) return; var i = hit(e); if (i !== picked && (i >= 0 || !('ontouchstart' in window))) pick(i, false); });
  sheet.addEventListener('mouseleave', function () { if (!playing && performance.now() >= quiet && !('ontouchstart' in window)) pick(-1, false); });
  sheet.addEventListener('click', function (e) { if (playing) return; pick(hit(e), false); });

  /* ---------- sound: keys for type, a pen for the harmed, a stamp for a seal ---------- */
  var snd = { on: false, ac: null, noise: null, out: null };
  function soundOn() {
    if (!snd.ac) {
      var AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      snd.ac = new AC();
      var n = snd.ac.sampleRate * 2, b = snd.ac.createBuffer(1, n, snd.ac.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
      snd.noise = b; snd.out = snd.ac.createGain(); snd.out.gain.value = 0.8; snd.out.connect(snd.ac.destination);
    }
    snd.ac.resume(); snd.on = true;
  }
  function burst(freq, q, dur, gain, pan, when, shape) {
    var ac = snd.ac, t = ac.currentTime + (when || 0), s = ac.createBufferSource(); s.buffer = snd.noise;
    var f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq; f.Q.value = q;
    var g = ac.createGain(); g.gain.setValueAtTime(0.0001, t);
    if (shape === 'pen') {             // an uneven scratch: several strokes of different weight
      var k = 7, u = dur / k;
      for (var i = 0; i < k; i++) { g.gain.linearRampToValueAtTime(gain * (0.45 + 0.55 * Math.random()), t + i * u + u * 0.3); g.gain.linearRampToValueAtTime(gain * 0.12, t + (i + 1) * u); }
      f.frequency.setValueAtTime(freq, t); f.frequency.linearRampToValueAtTime(freq * 1.5, t + dur);
    } else { g.gain.exponentialRampToValueAtTime(gain, t + 0.002); }
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 0.02);
    var last = g;
    if (pan && ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); last = p; }
    s.connect(f); f.connect(g); last.connect(snd.out);
    s.start(t, Math.random() * 1.5, dur + 0.05);
  }
  function thud(pan) {
    var ac = snd.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
    o.frequency.setValueAtTime(120, t); o.frequency.exponentialRampToValueAtTime(46, t + 0.18);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.7, t + 0.006); g.gain.exponentialRampToValueAtTime(0.0001, t + 0.34);
    var last = g; if (ac.createStereoPanner) { var p = ac.createStereoPanner(); p.pan.value = pan; g.connect(p); last = p; }
    o.connect(g); last.connect(snd.out); o.start(t); o.stop(t + 0.4);
    burst(900, 0.7, 0.03, 0.25, pan, 0);
  }
  function voice(r) {                 // one paragraph, said once
    if (r[4] === 'H') burst(2300, 1.6, 0.55, 0.5, 0, 0, 'pen'); else burst(3600, 2.5, 0.014, 0.12, 0, 0);
    if (r[5].indexOf('P') >= 0) setTimeout(function () { thud(r[6] === 'u' ? -0.75 : 0.75); }, 180);
  }

  /* ---------- the sheet writes itself ---------- */
  var t0 = 0, DUR = 46000;
  function play() {
    playing = true; picked = -1; shown = 0; t0 = performance.now();
    ['type', 'hand', 'seal'].forEach(function (k) { layers[k].g.clearRect(0, 0, L.W, L.H); });
    counts = {}; yearsOn(layers.type.g);
    document.getElementById('bPlay').setAttribute('aria-pressed', 'true');
    document.getElementById('bPlay').textContent = 'stop';
    say.setAttribute('aria-live', 'off');
    kick();
  }
  function stop() {
    for (var i = shown; i < L.words.length; i++) mark(L.words[i]);
    shown = L.words.length; playing = false;
    document.getElementById('bPlay').setAttribute('aria-pressed', 'false');
    document.getElementById('bPlay').textContent = 'write it from 1983';
    say.setAttribute('aria-live', 'polite');
    rest();
  }
  function step() {
    var p = Math.min(1, (performance.now() - t0) / DUR);
    // the first decades are slowed so that their few paragraphs can be seen being written
    var e = p < 0.12 ? (p / 0.12) * 0.035 : 0.035 + (p - 0.12) / 0.88 * 0.965;
    var to = Math.floor(e * L.words.length), keys = 0, hands = 0, seals = 0, pan = 0;
    for (var i = shown; i < to; i++) {
      var w = L.words[i]; mark(w);
      if (w.t === 'H') hands++; else if (w.t === 'U') { seals++; pan = -0.75; } else if (w.t === 'K') { seals++; pan = 0.75; } else keys++;
    }
    if (to > shown) {
      var r = INC[L.words[to - 1].i], h = counts.H || 0, s = (counts.U || 0) + (counts.K || 0);
      say.innerHTML = '<b>' + r[1].slice(0, 4) + '</b> · ' + fmt(L.words[to - 1].i + 1) + ' incidents · <span class="hand">' + h + ' begun in the hand of the harmed</span> · <span class="seal">' + s + ' acts of a public body</span>';
      if (snd.on) {
        for (var k = 0; k < Math.min(keys, 5); k++) burst(3000 + Math.random() * 1800, 2.5, 0.012, 0.07, Math.random() * 0.6 - 0.3, k * 0.012);
        if (hands) burst(2300, 1.6, 0.6, 0.55, 0, 0, 'pen');
        if (seals) thud(pan);
      }
    }
    shown = to;
    if (p >= 1) stop();
  }

  /* ---------- wiring ---------- */
  document.getElementById('rAll').addEventListener('click', function () { setReading('all'); });
  document.getElementById('rHand').addEventListener('click', function () { setReading('hand'); });
  document.getElementById('rSeal').addEventListener('click', function () { setReading('seal'); });
  document.getElementById('bPrev').addEventListener('click', function () { if (playing) stop(); stepSet(-1); });
  document.getElementById('bNext').addEventListener('click', function () { if (playing) stop(); stepSet(1); });
  document.getElementById('bPlay').addEventListener('click', function () { if (playing) { stop(); kick(); } else play(); });
  document.getElementById('bSound').addEventListener('click', function () {
    if (snd.on) { snd.on = false; } else soundOn();
    this.setAttribute('aria-pressed', String(snd.on));
  });
  document.addEventListener('keydown', function (e) {
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') { if (playing) stop(); stepSet(1); e.preventDefault(); }
    if (e.key === 'ArrowLeft') { if (playing) stop(); stepSet(-1); e.preventDefault(); }
  });
  var flat = { press: M.first.press, public: M.first.public, research: M.first.research, maker: M.first.maker, self: M.first.self };
  Array.prototype.forEach.call(document.querySelectorAll('[data-n]'), function (el) {
    var k = el.getAttribute('data-n'); el.textContent = fmt(k in flat ? flat[k] : M[k]);
  });
  var lastW = 0, rt = 0;
  function rebuild() { var w = sheet.parentNode.clientWidth; if (w === lastW) return; lastW = w; if (playing) stop(); picked = -1; build(); rest(); }
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(rebuild, 150); });
  lastW = sheet.parentNode.clientWidth; build(); rest();
})();
