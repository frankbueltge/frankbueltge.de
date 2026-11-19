/* Marked Incorrect — the fifth state (2026-11-19, session 63): a mark on a test, or on a record.
   Every number comes from mark.js (written by build_five.py). Nothing is coded here. */
(function () {
  'use strict';
  var K = window.MARK, NS = 'http://www.w3.org/2000/svg';
  var at = function (o, p) { return p.split('.').reduce(function (v, k) { return v == null ? v : v[k]; }, o); };
  var el = function (n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var cap = function (t) { return t.charAt(0).toUpperCase() + t.slice(1); };
  document.querySelectorAll('[data-m]').forEach(function (e) { e.textContent = String(at(K, e.getAttribute('data-m'))); });

  // ------------------------------------------------------------------ the seven instruments, both sides
  var PASS = { 'none': 'none', 'left to the developer': 'left to the maker', 'power to set': 'a power, unused', 'set by the instrument': 'set' };
  var box = document.getElementById('inst'), iSel = null;
  K.instruments.forEach(function (x) {
    var b = document.createElement('button');
    b.type = 'button'; b.className = 'inst'; b.setAttribute('data-n', x.n); b.setAttribute('aria-pressed', 'false');
    b.innerHTML = '<span class="nm">' + esc(x.short) + '</span><span class="bd">' + esc(x.binding) + '</span>' +
      '<span class="half t"><span class="h">test</span><span class="v">evaluation ' + esc(x.evaluation) + '</span><span class="v">pass mark: ' + esc(PASS[x.pass_mark] || x.pass_mark) + '</span></span>' +
      '<span class="half r"><span class="h">record</span><span class="v rec-' + x.record + '">incidents ' + esc(x.record) + '</span>' +
      '<span class="v' + (x.entry.indexOf('conduct') >= 0 ? ' acc' : '') + '">a deed enters by: ' + esc(x.entry) + '</span>' +
      '<span class="v">level on it: none</span></span>';
    box.appendChild(b);
  });
  var CODE = { record: 'the record', entry: 'what lets a deed in', clock: 'from when', reach: 'how far it reaches', reader: 'who reads it', keeper: 'who keeps it', public: 'what the public reads', mark: 'a level on it' };
  function instShow(n) {
    iSel = n; var x = K.instruments.filter(function (y) { return y.n === n; })[0];
    box.querySelectorAll('button.inst').forEach(function (b) { b.setAttribute('aria-pressed', +b.getAttribute('data-n') === n ? 'true' : 'false'); });
    var q = x.quotes.map(function (q) { return '<li><span class="meta">' + esc(CODE[q.code] || q.code) + ' · ' + esc(q.where) + '</span> “' + esc(q.quote) + '”</li>'; }).join('');
    document.getElementById('instdet').innerHTML = '<p class="meta">' + esc(x.name) + ' · ' + esc(x.binding) + ' · record kept by ' + esc(x.keeper) + ', read by ' + esc(x.reader) +
      ' · clock: ' + esc(x.clock) + ' · the public reads: ' + esc(x.public) + '</p>' +
      '<p><b>The test</b> (the Field\'s study 83): evaluation ' + esc(x.evaluation) + ', “' + esc(x.test_quote.quote) + '” (' + esc(x.test_quote.where) + '); pass mark: ' + esc(x.pass_mark) + '.</p>' +
      '<p><b>The record</b> (this practice\'s reading):</p><ul class="qs">' + q + '</ul><p class="meta">' + esc(x.found) + '. <a href="' + esc(x.url) + '">The text</a>.</p>';
  }
  box.addEventListener('click', function (e) { var b = e.target.closest('button.inst'); if (b) instShow(+b.getAttribute('data-n')); });
  instShow(4);

  // ------------------------------------------------------------------ three lines between test and world, over the 34 deeds
  var sv = document.getElementById('lines'), want = null, dSel = null;
  var D = K.deeds, LN = K.lines;
  var BANDS = [
    { k: 'law', name: 'by the tester’s design (California)', short: 'tester’s design (California)', side: function (d) { return d.law; } },
    { k: 'run', name: 'by whether a test was running', short: 'a test was running', side: function (d) { return d.run; } },
    { k: 'model', name: 'by the model, as the makers report', short: 'the model, as reported', side: function (d) { return d.model === 'test' ? 'test' : 'unknown'; } }
  ];
  var FOR = { control: 'a test of conduct', 'by design': 'an experiment built to find it', skill: 'a test of skill', work: 'the maker’s own use', 'not stated': 'not stated' };
  var GROUP = [[['control', 'by design'], 'built to elicit'], [['skill'], 'tests of skill'], [['work'], 'own use'], [['not stated'], 'n.s.']];
  function linesDraw() {
    while (sv.firstChild) sv.removeChild(sv.firstChild);
    var W = Math.max(320, sv.clientWidth || sv.parentNode.clientWidth || 1000), narrow = W < 640;
    var perRow = narrow ? 17 : D.length, gap = narrow ? 4 : 3;
    var x0 = narrow ? 2 : 262, sq = Math.max(12, Math.min(18, Math.floor((W - x0 - 4) / perRow) - gap));
    var rows = Math.ceil(D.length / perRow), bandH = 22 + rows * (sq + gap) + 10, top = 6;
    BANDS.forEach(function (b, bi) {
      var y = top + bi * bandH, dim = want && want !== b.k;
      var g = el('g', { class: 'band' + (dim ? ' dim' : '') + (want === b.k ? ' sel' : ''), 'data-band': b.k }, sv);
      var nt = LN[b.k].test, nw = LN[b.k].world || 0, nu = LN[b.k].unknown || LN[b.k].no_sign || 0;
      var t = el('text', { x: narrow ? 0 : 0, y: y + 12, class: 'hd' }, g); t.textContent = narrow ? b.short : b.name;
      var c = el('text', { x: narrow ? W - 2 : 0, y: narrow ? y + 12 : y + 28, 'text-anchor': narrow ? 'end' : 'start' }, g);
      c.textContent = 'test ' + nt + (nw ? ' · world ' + nw : '') + (nu ? ' · ' + (b.k === 'model' ? 'no sign' : 'not stated') + ' ' + nu : '');
      D.forEach(function (d, i) {
        var s = b.side(d), cx = x0 + (i % perRow) * (sq + gap), cy = y + (narrow ? 20 : 4) + Math.floor(i / perRow) * (sq + gap);
        var on = want === b.k && s === 'test';
        var q = el('g', { class: 'dq s-' + s + (on ? ' on' : '') + (dSel === d.id ? ' sel' : ''), 'data-id': d.id, 'data-band': b.k, 'data-side': s, tabindex: bi === 0 ? '0' : '-1', role: 'button', 'aria-label': d.title + ', ' + b.short + ': ' + s }, g);
        el('rect', { x: cx, y: cy, width: sq, height: sq }, q);
      });
    });
    var H = top + BANDS.length * bandH;
    if (!narrow) {   // the groups of the second reading, under the bands
      var i0 = 0;
      GROUP.forEach(function (gr) {
        var n = D.filter(function (d) { return gr[0].indexOf(d.test_for) >= 0; }).length; if (!n) return;
        var xa = x0 + i0 * (sq + gap), xb = x0 + (i0 + n) * (sq + gap) - gap;
        el('line', { x1: xa, x2: xb, y1: H - 2, y2: H - 2, class: 'grp' }, sv);
        var t = el('text', { x: n > 2 ? (xa + xb) / 2 : xa, y: H + 12, 'text-anchor': n > 2 ? 'middle' : 'start' }, sv); t.textContent = n > 2 ? gr[1] + ' ' + n : gr[1];
        i0 += n;
      });
      H += 18;
    }
    sv.setAttribute('viewBox', '0 0 ' + W + ' ' + H); sv.setAttribute('width', W); sv.setAttribute('height', H);
    linesSay();
  }
  function linesSay() {
    var say = document.getElementById('linesay');
    if (want === 'law') {
      say.innerHTML = 'Drawn by the tester’s design, as California’s law draws it, <b>' + LN.law.test + '</b> deeds fall inside a test (a run built to test conduct, an experiment built to find the behaviour) and <b>' +
        LN.law.world + '</b> in the world, ' + LN.law_world_in_skill + ' of them done during tests of skill. A mark on a test would judge the ' + LN.law.test + '. A record holds the ' + LN.law.world + ' once someone sees them.';
    } else if (want === 'run') {
      say.innerHTML = 'Drawn by whether a test was running, <b>' + LN.run.test + '</b> deeds fall inside a test, ' + LN.run.world + ' in the world (the makers’ own use), and for ' + LN.run.unknown +
        ' it is not stated. On this line nearly every published deed belongs to a test, yet ' + LN.law_world_in_skill + ' of the ' + LN.run.test + ' ran in tests of skill, which no mark on conduct reads.';
    } else if (want === 'model') {
      say.innerHTML = 'Drawn by the model, where the makers report it: in <b>' + LN.model.test + '</b> deeds the model took the real systems it reached for its test. On California’s line all ' + LN.law_world_model_test +
        ' are the world’s. For the other ' + LN.model.no_sign + ' the makers’ text gives no sign.';
    } else {
      say.innerHTML = 'The three lines agree on <b>' + LN.agree + '</b> of the ' + D.length + ' deeds and part on <b>' + LN.parted + '</b>: each deed done during a test of skill belongs to a test by the running test and to the world by California’s line, and in ' +
        LN.law_world_model_test + ' of them the model, too, took real systems for its test. Choose a line to see what a mark drawn on it would judge.';
    }
  }
  function lineShow(id) {
    dSel = id; var d = D.filter(function (x) { return x.id === id; })[0];
    var EYE = { model: 'a model reading the record', person: 'a person at the maker', alarm: 'a security alarm', 'not stated': 'not stated', 'by design': 'a model, by design' };
    document.getElementById('linedet').innerHTML = '<p class="meta">' + esc(d.title) + ' · ' + esc(FOR[d.test_for]) + ' · California’s line: ' + d.law + ' · a test running: ' + d.run +
      ' · the model: ' + (d.model === 'test' ? 'took real systems for its test' : 'no sign') + ' · first seen by ' + esc(d.notice ? 'someone outside the maker' : (EYE[d.eye] || d.eye)) + '</p><p>' + esc(cap(d.deed)) + '.</p>';
    linesDraw();
  }
  document.getElementById('linesask').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    var w = b.getAttribute('data-l'); want = want === w ? null : w;
    document.querySelectorAll('#linesask button').forEach(function (x) { x.setAttribute('aria-pressed', x.getAttribute('data-l') === want ? 'true' : 'false'); });
    linesDraw();
  });
  sv.addEventListener('click', function (e) { var g = e.target.closest('.dq'); if (g) lineShow(g.getAttribute('data-id')); });
  sv.addEventListener('keydown', function (e) { var g = e.target.closest('.dq'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); lineShow(g.getAttribute('data-id')); } });
  var rt; window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(linesDraw, 120); });
  linesDraw();
  window.MARK_PAGE = { bands: BANDS.map(function (b) { return b.k; }) };
})();
