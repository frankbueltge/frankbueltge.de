/* OTHER HANDS — the Studio, cycle 015. Own code, Apache-2.0, no library.
   One paragraph per incident, one word per report, set in the hand of whoever wrote it.
   Third state (the check): the type is small and the exceptions are large. A hand is red and three rows high;
   a seal stands in the margin, left when the act lands on the person who used the AI, right when it concerns
   whoever made or ran it; a disc is an act concluded, a ring one only begun; black is an act in the maker's favour.
   Everything drawn follows from data.js; the only arbitrary thing is the length of a word. */
(function () {
  'use strict';
  var D = window.OH, M = D.meta, INC = D.inc;
  var C = { paper: '#f5f2ea', ink: '#1b1a17', soft: '#6d685d', type: '#9a958a', faint: '#d9d3c4', red: '#c4301c', blue: '#1d4fb8' };
  var sheet = document.getElementById('sheet'), sx = sheet.getContext('2d');
  var say = document.getElementById('say'), loupe = document.getElementById('loupe');
  var ROW = 3.2, BAR = 1.6, GAP = 1.4, PARA = 1.6, YEARH = 9;
  var L = null, layers = {}, LAYERS = ['years', 'type', 'hand', 'seal'];
  var alpha = { years: 1, type: 1, hand: 1, seal: 1 }, want = { years: 1, type: 1, hand: 1, seal: 1 };
  var reading = 'all', picked = -1, playing = false, shown = 0, raf = 0, DPR = 1;
  var counts = {};                    // what was actually drawn on the sheet, for the check

  function rnd(a, b) {                // a fixed number in [0,1) from two integers
    var x = (Math.imul(a + 1, 73856093) ^ Math.imul(b + 7, 19349663)) >>> 0;
    x = Math.imul(x ^ (x >>> 13), 1274126177) >>> 0; x ^= x >>> 16;
    return (x >>> 0) / 4294967296;
  }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function kind(r) {                  // what the first word of a paragraph is drawn as
    var f = r[4], v = r[9];
    if (f === 'H' || v === 'W') return 'hand';             // the harmed wrote it (on a platform, or printed by a publication)
    if (v === 'q' || v === 'b' || v === 'o' || v === 'f') return 'thread';   // their words stand inside it
    if (f === 'w') return 'witness';
    if (f === 'n' || f === 'x') return 'blank';
    return '';
  }

  /* ---------- layout: paragraphs are never broken across columns ---------- */
  function layout(W) {
    var phone = W < 520, MG = phone ? 12 : 13, R = phone ? 5 : 5.5, gut = phone ? 7 : 11, target = phone ? 82 : 100;
    var cols = Math.max(2, Math.floor((W + gut) / (target + gut)));
    var colW = (W - gut * (cols - 1)) / cols, cw = colW - 2 * MG;
    var paras = [], year = '', total = 0;
    for (var i = 0; i < INC.length; i++) {
      var r = INC[i], id = r[0], hands = r[2], k0 = kind(r), yr = r[1].slice(0, 4);
      var p = { i: i, words: [], year: null, seal: null }, y = 0;
      if (yr !== year) { year = yr; p.year = yr; y += YEARH; }
      var lead = k0 === 'hand' ? 8 : k0 === 'thread' ? 2.5 : k0 === 'witness' ? 1.5 : 0;
      var drop = k0 === 'hand' ? 5 : k0 === 'thread' ? 2 : k0 === 'witness' ? 1 : 0;
      y += lead;
      var x = 0, first = true, items = [];
      if (!hands) items.push({ t: '0', l: 8 });
      for (var j = 0; j < hands.length; j++) {
        var t = hands[j], l = 3 + rnd(id, j) * 5;
        if (j === 0) {
          l += 2;
          if (k0 === 'hand') { t = 'H'; l = Math.min(cw, 36 + rnd(id, 99) * 12); }
          else if (k0 === 'thread') { t = 'T'; l = 18 + rnd(id, 99) * 6; }
          else if (k0 === 'witness') { t = 'w'; l = 13 + rnd(id, 99) * 4; }
          else if (k0 === 'blank') { t = 'n'; l = 8; }
          else if (r[4] === 'm') t = 'm';
        }
        items.push({ t: t, l: l, b: hands[j] });
      }
      for (var k = 0; k < items.length; k++) {
        var it = items[k];
        if (x > 0 && x + it.l > cw) { x = 0; y += ROW + (first ? drop : 0); first = false; }
        p.words.push({ x: x, y: y, l: it.l, t: it.t, b: it.b, k: k });
        x += it.l + GAP;
      }
      y += ROW + (first ? drop : 0);
      if (r[5].indexOf('P') >= 0) {
        var top = p.year ? YEARH : 0, cy = Math.max(top + R + 0.5, top + lead + BAR / 2);
        p.seal = { side: r[6], state: r[7], fav: r[8].indexOf('v') >= 0, cy: cy };
        y = Math.max(y, cy + R + 0.5);
      }
      p.h = y + PARA; total += p.h; paras.push(p);
    }
    // columns: a paragraph starts a new column once the column has reached its share
    var share = total / cols, c = 0, at = 0, H = 0, byCol = [];
    for (var q = 0; q < paras.length; q++) {
      var pa = paras[q];
      if (at > 0 && at + pa.h / 2 > share && c < cols - 1) { c++; at = 0; }
      pa.c = c; pa.y0 = at + 4; pa.x0 = c * (colW + gut); at += pa.h; H = Math.max(H, at);
      (byCol[c] = byCol[c] || []).push(q);
    }
    var nwords = 0; paras.forEach(function (pp) { nwords += pp.words.length; });
    return { W: W, cols: cols, colW: colW, cw: cw, MG: MG, R: R, gut: gut, H: Math.ceil(H) + 10, paras: paras, byCol: byCol, nwords: nwords };
  }

  /* ---------- the marks ---------- */
  function scribble(g, x, y, l, id, amp, col, lw) {
    var f = 0.5 + rnd(id, 3) * 0.35, ph = rnd(id, 4) * 6.28, n = Math.ceil(l * 2);
    g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
    g.beginPath();
    for (var s = 0; s <= n; s++) {
      var t = s / 2, env = 0.55 + 0.45 * Math.sin(t * 0.21 + rnd(id, 5) * 6.28);
      var px = x + t + Math.sin(t * f + ph) * 1.6;
      var py = y + BAR / 2 - Math.cos(t * f + ph) * amp * env - Math.sin(t * 0.09 + ph) * 0.7;
      if (s) g.lineTo(px, py); else g.moveTo(px, py);
    }
    g.stroke();
  }
  function word(g, gh, t, b, x, y, l, id, k, tally) {    // one word; g is the type, gh the hand
    if (tally) tally[t] = (tally[t] || 0) + 1;
    if (t === 'p') { g.fillStyle = C.type; g.fillRect(x, y, l, BAR); }
    else if (t === 'r') { g.fillStyle = C.type; for (var q = 0; q < l; q += 2.4) g.fillRect(x + q, y - 0.5, 1.2, BAR + 1); }
    else if (t === 'm') { g.fillStyle = C.ink; g.fillRect(x, y - 0.4, l, BAR + 0.8); }
    else if (t === 'g') { g.fillStyle = C.blue; g.fillRect(x, y - 0.2, l, BAR + 0.4); }
    else if (t === 's') { scribble(g, x, y, l - 1, id * 31 + k, 0.8, C.type, 0.7); }
    else if (t === 'u') { g.fillStyle = C.type; for (var d = 0; d < l; d += 2.4) g.fillRect(x + d, y + 0.2, 1.1, 1.1); }
    else if (t === 'n' || t === '0') { g.strokeStyle = C.type; g.lineWidth = 0.6; g.strokeRect(x + 0.3, y - 0.4, l - 0.6, BAR + 0.8); }
    else if (t === 'w') { scribble(g, x, y, l, id, 1.7, C.soft, 0.8); }
    else if (t === 'H') { scribble(gh, x, y, l, id, 4.6, C.red, 1.5); }
    else if (t === 'G') { gh.save(); gh.globalAlpha = 0.32; gh.setLineDash([1.5, 2]); scribble(gh, x, y, l, id, 4.6, C.red, 1.2); gh.restore(); }
    else if (t === 'T') {             // type with the harmed's words inside: a red line through it
      word(g, gh, b || 'p', b, x, y, l, id, k, null);
      gh.strokeStyle = C.red; gh.lineWidth = 1.3; gh.lineJoin = 'round'; gh.lineCap = 'round';
      var f = 0.28 + rnd(id, 3) * 0.12, ph = rnd(id, 4) * 6.28; gh.beginPath();
      for (var s = 0; s <= l * 2; s++) { var tt = s / 2, py = y + BAR / 2 - Math.sin(tt * f + ph) * 1.3; if (s) gh.lineTo(x + tt, py); else gh.moveTo(x + tt, py); }
      gh.stroke();
    }
  }
  function seal(g, cx, cy, R, state, fav, tally) {      // a disc is an act concluded, a ring one only begun
    if (tally) { var key = (fav ? 'V' : 'S') + state; tally[key] = (tally[key] || 0) + 1; }
    g.beginPath();
    if (state === 'c') { g.arc(cx, cy, R, 0, 6.2832); g.fillStyle = fav ? C.ink : C.blue; g.fill(); }
    else { g.arc(cx, cy, R - 0.9, 0, 6.2832); g.strokeStyle = fav ? C.ink : C.blue; g.lineWidth = 1.8; g.stroke(); }
  }
  function sealX(p) { return p.seal.side === 'u' ? p.x0 + L.MG / 2 : p.x0 + L.colW - L.MG / 2; }
  function para(p) {                  // draws one paragraph into the layers
    var id = INC[p.i][0], gx = p.x0 + L.MG;
    if (p.year) {
      var gy = layers.years.g; gy.font = '7.5px ui-monospace,Menlo,Consolas,monospace'; gy.textBaseline = 'alphabetic';
      gy.fillStyle = C.ink; gy.fillText(p.year, gx, p.y0 + 6.5);
      gy.fillStyle = C.faint; gy.fillRect(gx + 21, p.y0 + 3.6, L.cw - 21, 0.6);
    }
    for (var k = 0; k < p.words.length; k++) { var w = p.words[k]; word(layers.type.g, layers.hand.g, w.t, w.b, gx + w.x, p.y0 + w.y, w.l, id, w.k, counts); }
    if (p.seal) {
      seal(layers.seal.g, sealX(p), p.y0 + p.seal.cy, L.R, p.seal.state, p.seal.fav, counts);
      counts[p.seal.side === 'u' ? 'left' : 'right'] = (counts[p.seal.side === 'u' ? 'left' : 'right'] || 0) + 1;
    }
  }

  function rules() {                  // a faint rule between columns, so a seal's side can be told
    var g = layers.years.g; g.fillStyle = C.faint;
    for (var c = 1; c < L.cols; c++) g.fillRect(c * (L.colW + L.gut) - L.gut / 2 - 0.3, 0, 0.6, L.H);
  }

  /* ---------- canvases ---------- */
  function make(name) {
    var c = document.createElement('canvas'); c.width = Math.round(L.W * DPR); c.height = Math.round(L.H * DPR);
    var g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    layers[name] = { c: c, g: g };
  }
  function build() {
    var W = Math.floor(sheet.parentNode.clientWidth - 32);   // main's padding
    W = Math.max(280, Math.min(1100, W));
    DPR = Math.min(2, window.devicePixelRatio || 1);
    L = layout(W);
    sheet.style.height = L.H + 'px'; sheet.style.maxWidth = W + 'px';
    sheet.width = Math.round(W * DPR); sheet.height = Math.round(L.H * DPR);
    LAYERS.forEach(make);
    counts = {};
    rules();
    for (var i = 0; i < L.paras.length; i++) para(L.paras[i]);
    shown = L.paras.length;
    window.__oh = { drawn: counts, words: L.nwords, cols: L.cols, height: L.H, sealR: L.R };
    tally(); key();
    paint();
  }
  function paint() {
    sx.setTransform(1, 0, 0, 1, 0, 0);
    sx.fillStyle = C.paper; sx.fillRect(0, 0, sheet.width, sheet.height);
    LAYERS.forEach(function (k) { if (alpha[k] > 0.003) { sx.globalAlpha = alpha[k]; sx.drawImage(layers[k].c, 0, 0); } });
    sx.globalAlpha = 1;
    if (picked >= 0) {
      var p = L.paras[picked];
      sx.setTransform(DPR, 0, 0, DPR, 0, 0);
      sx.strokeStyle = C.ink; sx.lineWidth = 1.2;
      sx.strokeRect(p.x0 + 0.6, p.y0 - 2.4 + (p.year ? YEARH : 0), L.colW - 1.2, p.h - (p.year ? YEARH : 0) + 2.2);
    }
  }
  function tick() {
    var moving = false;
    LAYERS.forEach(function (k) {
      var d = want[k] - alpha[k];
      if (Math.abs(d) > 0.004) { alpha[k] += d * 0.16; moving = true; } else alpha[k] = want[k];
    });
    if (playing) { step(); moving = true; }
    paint();
    raf = moving ? requestAnimationFrame(tick) : 0;
  }
  function kick() { if (!raf) raf = requestAnimationFrame(tick); }

  /* ---------- the counts under the sheet: one mark per incident, counted from the rows ---------- */
  function label(g, t, x, y) { g.font = '10px ui-monospace,Menlo,Consolas,monospace'; g.textBaseline = 'alphabetic'; g.fillStyle = C.ink; g.fillText(t, x, y); }
  function tally() {
    var c = document.getElementById('tally'), W = L.W, drawn = {}, ops = [], labels = [];
    var firsts = [], ORDER = 'prgmsun0wTH';
    INC.forEach(function (r) {
      if (!r[2]) return;
      var k0 = kind(r), b = r[2][0];
      firsts.push({ t: k0 === 'hand' ? 'H' : k0 === 'thread' ? 'T' : k0 === 'witness' ? 'w' : k0 === 'blank' ? 'n' : r[4] === 'm' ? 'm' : b, b: b, id: r[0] });
    });
    firsts.sort(function (a, b) { return ORDER.indexOf(a.t) - ORDER.indexOf(b.t); });
    var x = 0, y = 20;
    labels.push(['who wrote the first report of each incident · ' + fmt(firsts.length), 0, 10]);
    function flow(list, len, lead, lh) {
      list.forEach(function (it) {
        var l = len(it.t);
        if (x + l > W) { x = 0; y += lh; }
        ops.push({ t: it.t, b: it.b, id: it.id || 0, x: x, y: y, l: l }); x += l + lead;
      });
    }
    var small = firsts.filter(function (f) { return 'HTw'.indexOf(f.t) < 0; }), big = firsts.filter(function (f) { return 'HTw'.indexOf(f.t) >= 0; });
    flow(small, function () { return 3; }, 1, 4.2);
    x = 0; y += 16;
    flow(big, function (t) { return t === 'H' ? 38 : t === 'T' ? 20 : 14; }, 4, 14);
    x = 0; y += 34; labels.push(['written by the harmed, estimated and never found · ' + M.estimate_not_found, 0, y - 13]);
    var ghosts = []; for (var i = 0; i < M.estimate_not_found; i++) ghosts.push({ t: 'G', id: 7000 + i });
    flow(ghosts, function () { return 38; }, 4, 14);
    x = 0; y += 40;
    var R = 6.5, seals = [], groups = [['u', 'on the person who used the AI · ' + M.on_user], ['k', 'about whoever made or ran it · ' + M.on_maker]];
    groups.forEach(function (grp, n) {
      if (n && (W < 700 || x + 24 * (2 * R + 3) > W)) { x = 0; y += 40; } else if (n) x += 40;
      labels.push([grp[1], x, y - 13]);
      [['c', false], ['o', false], ['c', true], ['o', true]].forEach(function (v) {
        INC.forEach(function (r) {
          if (r[5].indexOf('P') < 0 || r[6] !== grp[0] || r[7] !== v[0] || (r[8].indexOf('v') >= 0) !== v[1]) return;
          if (x + 2 * R > W) { x = 0; y += 2 * R + 4; }
          seals.push({ x: x + R, y: y, s: r[7], fav: v[1] }); x += 2 * R + 3;
        });
      });
    });
    var H = y + R + 6;
    c.style.height = H + 'px'; c.style.maxWidth = W + 'px';
    c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
    var g = c.getContext('2d'); g.setTransform(DPR, 0, 0, DPR, 0, 0);
    ops.forEach(function (o) { word(g, g, o.t, o.b, o.x, o.y, o.l, o.id, 0, drawn); });
    seals.forEach(function (s) { seal(g, s.x, s.y, R, s.s, s.fav, drawn); });
    labels.forEach(function (l) { label(g, l[0], l[1], l[2]); });
    window.__oh.tally = drawn;
  }

  /* ---------- the key: every mark once, at twice its size on the sheet ---------- */
  var KEY = [
    ['p', 'the press'], ['m', 'the maker'], ['g', 'a public body'], ['r', 'research'], ['w', 'a witness, on a platform'],
    ['H', 'the harmed wrote it'], ['T', 'the harmed\'s words are in it'],
    ['L', 'left: on the person who used the AI'], ['Rt', 'right: on whoever made or ran it'],
    ['c', 'concluded'], ['o', 'only begun'], ['v', 'in the maker\'s favour']
  ];
  function key() {
    var c = document.getElementById('key'), W = L.W, g = c.getContext('2d'), S = 2;
    g.font = '11px ui-monospace,Menlo,Consolas,monospace';
    var x = 0, y = 12, pos = [];
    KEY.forEach(function (k) {
      var t = k[0], ml = t === 'H' ? 60 : t === 'T' ? 40 : t === 'w' ? 28 : t === 'L' || t === 'Rt' ? 34 : t.length === 1 && 'cov'.indexOf(t) >= 0 ? 14 : 16;
      var w = ml + 6 + g.measureText(k[1]).width + 18;
      if (x + w - 18 > W && x > 0) { x = 0; y += 24; }
      pos.push({ t: t, x: x, y: y, ml: ml, text: k[1] }); x += w;
    });
    var H = y + 14;
    c.style.height = H + 'px'; c.style.maxWidth = W + 'px';
    c.width = Math.round(W * DPR); c.height = Math.round(H * DPR);
    g.setTransform(DPR, 0, 0, DPR, 0, 0);
    pos.forEach(function (p, n) {
      g.save(); g.translate(p.x, p.y); g.scale(S, S);
      var t = p.t, m = p.ml / S;
      if (t === 'c') seal(g, m / 2, 0, 3.2, 'c', false);
      else if (t === 'o') seal(g, m / 2, 0, 3.2, 'o', false);
      else if (t === 'v') seal(g, m / 2, 0, 3.2, 'c', true);
      else if (t === 'L' || t === 'Rt') {
        g.fillStyle = C.type; for (var q = 0; q < 3; q++) g.fillRect(t === 'L' ? 7 : 0, -3 + q * 2.6, 9.5 - q * 2, 1.2);
        seal(g, t === 'L' ? 3 : 14, 0, 2.6, 'c', false);
      }
      else word(g, g, t, 'p', 0, -BAR / 2, t === 'H' ? 28 : t === 'T' ? 19 : t === 'w' ? 13 : 8, 4000 + n, 0, null);
      g.restore();
      g.font = '11px ui-monospace,Menlo,Consolas,monospace'; g.textBaseline = 'middle'; g.fillStyle = C.ink;
      g.fillText(p.text, p.x + p.ml + 6, p.y + 0.5);
    });
  }

  /* ---------- readings, stepping, pointing ---------- */
  var sets = { all: [], hand: [], seal: [] };
  INC.forEach(function (r, i) { sets.all.push(i); var k0 = kind(r); if (k0 === 'hand' || k0 === 'thread') sets.hand.push(i); if (r[5].indexOf('P') >= 0) sets.seal.push(i); });
  var FIRST = { p: 'the press or another edited address', r: 'a research address', m: 'the maker\'s own address', g: 'a public body\'s address', s: 'a platform without an editor', u: 'an unknown address' };
  var VOICE = {
    W: '<span class="hand">Written by the harmed</span>, printed by a publication',
    q: '<span class="hand">The harmed speak in it in their own words</span>',
    b: '<span class="hand">The harmed is an organisation, and its statement is quoted</span>',
    o: '<span class="hand">The harmed\'s words reach it through someone else</span>',
    f: '<span class="hand">It quotes or carries words of the harmed</span>',
    e: 'Read for the harmed\'s words: none'
  };
  var HAND = { H: '<span class="hand">Written by the harmed</span>', w: 'Written by a witness', n: 'The database\'s own note', x: 'Unreadable in the snapshot', m: 'Written by the maker, on a platform' };
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function describe(i) {
    var r = INC[i], n = r[2].length, s = '<b>Incident ' + r[0] + '</b> · ' + r[1] + ' · ' + n + (n === 1 ? ' report' : ' reports') + ', the first from ' + (n ? FIRST[r[2][0]] : 'nowhere: none is attached') + '. ';
    if (r[4]) s += HAND[r[4]] + (D.na[r[0]] ? ' (' + esc(D.na[r[0]]) + ')' : '') + '. ';
    if (r[9]) s += VOICE[r[9]] + (D.nv[r[0]] ? ' (' + esc(D.nv[r[0]]) + ')' : '') + '. ';
    if (r[5].indexOf('P') >= 0) {
      var a = D.act[r[0]], f = r[8];
      s += '<span class="seal">' + esc(a[0]) + '</span>: ' + esc(a[1]) + (a[2] ? ' (' + esc(a[2]) + ')' : '') + '. ' + (r[7] === 'c' ? 'Concluded' : 'Only begun') +
        (f.indexOf('s') >= 0 ? ' (corrected by this work\'s check)' : '') + ', ' +
        (r[6] === 'u' ? 'on the person who used the AI' : f.indexOf('v') >= 0 ? '<b>in the maker\'s favour</b>' : f.indexOf('b') >= 0 ? 'on whoever ran it, itself a public body' : f.indexOf('g') >= 0 ? 'about a maker of a general model' : 'on whoever made or ran it') + '. ';
    }
    return s + '<a href="https://incidentdatabase.ai/cite/' + r[0] + '/" target="_blank" rel="noopener">Open it in the database</a>';
  }
  var REST = {
    all: function () { return fmt(M.incidents) + ' incidents, ' + fmt(M.words) + ' reports. Grey is the press. ' + (('ontouchstart' in window) ? 'Tap' : 'Point at') + ' a paragraph, or step through them with the arrows.'; },
    hand: function () { return 'The type is lifted off. Of ' + M.first_read + ' first reports that were read, <span class="hand">the harmed wrote ' + M.wrote_found + '</span>, and their words stand in ' + M.words_inside + ' more. The other ' + fmt(M.never_read) + ' were never read for this.'; },
    seal: function () { return '<span class="seal">' + M.public_acted + ' acts of public bodies.</span> Left of a column: ' + M.on_user + ' on the person who used the AI. Right: ' + M.on_maker + ' about whoever made or ran it, ' + M.for_maker + ' of them in the maker\'s favour (black). A ring is an act only begun: ' + M.begun + ' of the ' + M.public_acted + '.'; }
  };
  function rest() { say.innerHTML = REST[reading](); drawLoupe(-1); }
  function setReading(r) {
    reading = r; picked = -1;
    want = r === 'all' ? { years: 1, type: 1, hand: 1, seal: 1 } : r === 'hand' ? { years: 1, type: 0, hand: 1, seal: 0 } : { years: 1, type: 0, hand: 0, seal: 1 };
    [['rAll', 'all'], ['rHand', 'hand'], ['rSeal', 'seal']].forEach(function (b) { document.getElementById(b[0]).setAttribute('aria-pressed', String(b[1] === r)); });
    rest(); kick();
  }
  function drawLoupe(i) {             // the picked paragraph, four times its size
    var S = 4, g = loupe.getContext('2d');
    if (i < 0) { loupe.style.display = 'none'; return; }
    var p = L.paras[i], top = p.year ? YEARH : 0, h = Math.min(p.h - top + 3, 22), w = L.colW;
    loupe.style.display = 'block'; loupe.style.width = w * S + 'px'; loupe.style.height = h * S + 'px';
    loupe.width = Math.round(w * S * DPR); loupe.height = Math.round(h * S * DPR);
    g.setTransform(DPR * S, 0, 0, DPR * S, 0, 0); g.clearRect(0, 0, w, h);
    g.translate(0, 2 - top);
    var id = INC[p.i][0];
    p.words.forEach(function (wd) { word(g, g, wd.t, wd.b, L.MG + wd.x, wd.y, wd.l, id, wd.k, null); });
    if (p.seal) seal(g, p.seal.side === 'u' ? L.MG / 2 : w - L.MG / 2, p.seal.cy, L.R, p.seal.state, p.seal.fav, null);
  }
  function pick(i, scroll) {
    picked = i;
    if (i < 0) { rest(); } else {
      say.innerHTML = describe(i); drawLoupe(i);
      if (scroll) {
        var p = L.paras[i], rct = sheet.getBoundingClientRect();
        var top = rct.top + window.scrollY + p.y0 - window.innerHeight * 0.4;
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
    var c = Math.floor(px / (L.colW + L.gut));
    if (c < 0 || c >= L.cols || !L.byCol[c]) return -1;
    var list = L.byCol[c], lo = 0, hi = list.length - 1;
    while (lo < hi) { var m = (lo + hi) >> 1, p = L.paras[list[m]]; if (p.y0 + p.h <= py) lo = m + 1; else hi = m; }
    var q = L.paras[list[lo]];
    return (py >= q.y0 - 3 && py < q.y0 + q.h + 2) ? list[lo] : -1;
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
    var k0 = kind(r);
    if (k0 === 'hand') burst(2300, 1.6, 0.55, 0.5, 0, 0, 'pen'); else if (k0 === 'thread') burst(2600, 1.6, 0.22, 0.3, 0, 0, 'pen'); else burst(3600, 2.5, 0.014, 0.12, 0, 0);
    if (r[5].indexOf('P') >= 0) setTimeout(function () { thud(r[6] === 'u' ? -0.75 : 0.75); }, 180);
  }

  /* ---------- the sheet writes itself ---------- */
  var t0 = 0, DUR = 30000;
  function play() {
    playing = true; picked = -1; shown = 0; t0 = performance.now(); drawLoupe(-1);
    LAYERS.forEach(function (k) { layers[k].g.clearRect(0, 0, L.W, L.H); });
    counts = {}; rules();
    document.getElementById('bPlay').setAttribute('aria-pressed', 'true');
    document.getElementById('bPlay').textContent = 'stop';
    say.setAttribute('aria-live', 'off');
    kick();
  }
  function stop() {
    for (var i = shown; i < L.paras.length; i++) para(L.paras[i]);
    shown = L.paras.length; playing = false;
    document.getElementById('bPlay').setAttribute('aria-pressed', 'false');
    document.getElementById('bPlay').textContent = 'write it from 1983';
    say.setAttribute('aria-live', 'polite');
    rest();
  }
  function step() {
    var p = Math.min(1, (performance.now() - t0) / DUR);
    // the first decades are slowed a little so that their few paragraphs can be seen being written
    var e = p < 0.06 ? (p / 0.06) * 0.03 : 0.03 + (p - 0.06) / 0.94 * 0.97;
    var to = Math.floor(e * L.paras.length), keys = 0, hands = 0, quotes = 0, seals = 0, pan = 0;
    for (var i = shown; i < to; i++) {
      var pa = L.paras[i], k0 = kind(INC[pa.i]); para(pa); keys += pa.words.length;
      if (k0 === 'hand') hands++; else if (k0 === 'thread') quotes++;
      if (pa.seal) { seals++; pan = pa.seal.side === 'u' ? -0.75 : 0.75; }
    }
    if (to > shown) {
      var r = INC[to - 1], s = (counts.Sc || 0) + (counts.So || 0) + (counts.Vc || 0) + (counts.Vo || 0);
      say.innerHTML = '<b>' + r[1].slice(0, 4) + '</b> · ' + fmt(to) + ' incidents · <span class="hand">' + (counts.H || 0) + ' written by the harmed</span> · <span class="seal">' + s + ' acts of a public body</span>';
      if (snd.on) {
        for (var k = 0; k < Math.min(keys, 5); k++) burst(3000 + Math.random() * 1800, 2.5, 0.012, 0.07, Math.random() * 0.6 - 0.3, k * 0.012);
        if (hands) burst(2300, 1.6, 0.6, 0.55, 0, 0, 'pen'); else if (quotes) burst(2600, 1.6, 0.22, 0.3, 0, 0, 'pen');
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
  var flat = { press: M.first.press, not_press: M.with_report - M.first.press, self: M.first.self, state_differ: M.state_read_again - M.state_agree };
  Array.prototype.forEach.call(document.querySelectorAll('[data-n]'), function (el) {
    var k = el.getAttribute('data-n'); el.textContent = fmt(k in flat ? flat[k] : M[k]);
  });
  var lastW = 0, rt = 0;
  function rebuild() { var w = sheet.parentNode.clientWidth; if (w === lastW) return; lastW = w; if (playing) stop(); picked = -1; build(); rest(); }
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(rebuild, 150); });
  lastW = sheet.parentNode.clientWidth; build(); rest();
})();
