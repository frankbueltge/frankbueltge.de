// State 2: the rules this practice never said how to count. Draws data/rules.js; every figure comes from it.
(function () {
  'use strict';
  var R = window.RULES, T = window.RTEXTS || {};
  if (!R) return;
  var NS = 'http://www.w3.org/2000/svg';
  var F = R.figures;
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, F); }
  var NAME = {
    file: 'a line of the file', text: 'a line with text', block: 'a paragraph or item',
    pairs: 'a sentence or two, the fewest lines', sentences: 'a sentence or two, the most lines',
    declared: "the digest's declared rule", browser: 'the same call in a browser engine', spaces: 'a run between spaces',
    field: "the Field's codebook", mine: 'your browser',
    points: 'code points', bytes: 'UTF-8 bytes', units: "a script's units (UTF-16)", graphemes: 'what the eye sees as one'
  };
  var ROWN = {
    'bulletin-lines': 'the bulletin, 40 lines, until 13 November',
    'bulletin-lines-defined': 'the bulletin, 40 lines "a sentence or two", from 13 November',
    'bulletin-words': 'the bulletin, 400 words, from 13 November',
    'journal-lines': 'a journal note, 40 lines, until 13 November',
    'journal-words': 'a journal entry, 150 words, from 13 November',
    'subject-chars': 'a commit subject, 100 characters, from 13 November',
    'score-lines': 'a score, 20 lines, from 22 October',
    'critique-lines': 'a critique, 20 lines, from 22 October'
  };

  // figures in the prose
  document.querySelectorAll('[data-rv]').forEach(function (e) {
    var v = get(e.getAttribute('data-rv'));
    if (v != null) e.textContent = typeof v === 'number' ? fmt(v) : v;
  });

  // your browser counts every text a word rule bound, again, while the page is read
  var seg = window.Intl && Intl.Segmenter ? new Intl.Segmenter('en', { granularity: 'word' }) : null;
  R.items.forEach(function (it) {
    if (seg && T[it.k] != null) { var n = 0; for (var s of seg.segment(T[it.k])) if (s.isWordLike) n++; it.n_mine = n; }
  });

  var rules = R.rules, byRule = {};
  rules.forEach(function (r) { byRule[r.id] = r; });
  var choice = { line: '', word: '', char: '' };

  // ———— the rows
  var svg = document.getElementById('rules');
  var X0 = 8, X1 = 800, RH = 60, GAP = 30, TOP = 24, LO = 0.5, HI = 1.7;
  var H = TOP + rules.length * (RH + GAP);
  svg.setAttribute('viewBox', '0 0 1000 ' + H);
  var rows = {};
  rules.forEach(function (r, ri) {
    var y0 = TOP + ri * (RH + GAP) + 14, I = R.items.filter(function (it) { return it.rule === r.id; });
    var g = el('g', { class: 'row', 'data-rule': r.id }, svg);
    el('text', { x: X0, y: y0 - 11, class: 'rl' }, g).textContent = ROWN[r.id] + ' · ' + I.length + ' items';
    // each row is scaled to its own items, so a row whose readings part by a few words is not drawn flat
    var lo = Math.max(LO, Math.min(0.9, Math.min.apply(null, I.map(function (it) { return it.lo / r.limit; })) - 0.04));
    var hi = Math.min(HI, Math.max(1.1, Math.max.apply(null, I.map(function (it) { return it.hi / r.limit; })) + 0.04));
    function yv(v) { var q = Math.max(lo, Math.min(hi, v / r.limit)); return y0 + RH - (q - lo) / (hi - lo) * RH; }
    el('rect', { x: X0, y: y0, width: X1 - X0, height: RH, class: 'bed' }, g);
    el('line', { x1: X0, x2: X1, y1: yv(r.limit), y2: yv(r.limit), class: 'lim' }, g);
    el('text', { x: X1 + 4, y: yv(r.limit) + 3, class: 'rl' }, g).textContent = fmt(r.limit);
    var step = (X1 - X0) / Math.max(I.length, 1);
    var marks = [];
    I.forEach(function (it, i) {
      var x = X0 + step * (i + 0.5);
      var m = el('g', { class: 'it ' + it.verdict.replace(' ', '-'), 'data-k': it.k, tabindex: -1 }, g);
      el('line', { x1: x, x2: x, y1: yv(it.lo), y2: Math.min(yv(it.hi), yv(it.lo) - 2), class: 'span' }, m);
      if (it.hi / r.limit > hi) el('path', { d: 'M' + (x - 2.5) + ',' + (y0 + 3) + 'l2.5,-4l2.5,4z', class: 'clip' }, m);
      if (it.census && it.census.breach) el('circle', { cx: x, cy: y0 - 0.5, r: 2.2, class: 'cen' }, m);
      if (it.seen) el('circle', { cx: x, cy: y0 - 6.5, r: 2.4, class: 'eye' }, m);
      var dot = el('circle', { cx: x, cy: 0, r: 2.6, class: 'pt', 'data-x': '' }, m);
      el('rect', { x: x - Math.max(step / 2, 2), y: y0 - 4, width: Math.max(step, 4), height: RH + 8, class: 'hit' }, m);
      m.addEventListener('click', function () { open(it); });
      marks.push({ it: it, g: m, dot: dot, yv: yv });
    });
    var tally = el('text', { x: X1 + 4, y: y0 + RH - 2, class: 'rt' }, g);
    rows[r.id] = { r: r, marks: marks, tally: tally };
  });

  function reading(r) {
    if (r.id === 'bulletin-lines-defined') return '';          // the text defines its own line: its range is always shown
    var x = choice[r.unit];
    return x && (r.readings.indexOf(x) >= 0 || (x === 'mine' && r.unit === 'word')) ? x : '';
  }
  function val(it, x) { return x === 'mine' ? it.n_mine : it.n[x]; }

  function draw() {
    var lit = 0, total = 0, any = false;
    rules.forEach(function (r) {
      var row = rows[r.id], x = reading(r), over = 0, bound = 0;
      row.marks.forEach(function (m) {
        var it = m.it, nb = it.verdict === 'not bound';
        if (!nb) bound++;
        if (x) {
          var v = val(it, x), o = v > r.limit;
          m.dot.setAttribute('cy', m.yv(v)); m.dot.setAttribute('data-x', x);
          m.dot.setAttribute('class', 'pt on' + (nb ? ' nb' : o ? ' over' : ''));
          if (o && !nb) over++;
        } else { m.dot.setAttribute('class', 'pt'); m.dot.setAttribute('data-x', ''); }
      });
      var f = F[r.id];
      if (x) { any = true; lit += over; total += bound; row.tally.textContent = 'over by this reading: ' + over + ' of ' + bound; row.tally.setAttribute('data-over', over); }
      else { row.tally.textContent = f.kept + ' kept · ' + f.broken + ' broken · ' + f.open + ' open'; row.tally.removeAttribute('data-over'); }
    });
    var say = document.getElementById('rsay');
    var parts = ['line', 'word', 'char'].filter(function (u) { return choice[u]; }).map(function (u) { return NAME[choice[u]]; });
    if (!any) say.innerHTML = 'Each mark is one item a rule bound, from its lowest reading to its highest; the line across a row is the limit. On every reading together <b>' + F.all.broken + '</b> are broken and <b>' + F.all.open + '</b> open. Choose how to count, or touch a mark to open it.';
    else say.innerHTML = 'Counted by ' + parts.join(', ') + ', <b data-lit="' + lit + '">' + lit + '</b> of the ' + total + ' items those rows hold stand over their limit. Each reading is a verdict someone could write; the rule chose none.';
  }

  document.querySelectorAll('.rask button').forEach(function (b) {
    b.addEventListener('click', function () {
      var u = b.getAttribute('data-u');
      choice[u] = b.getAttribute('data-x');
      document.querySelectorAll('.rask button[data-u="' + u + '"]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      draw();
    });
  });

  // ———— one item, opened
  var det = document.getElementById('rdet');
  function open(it) {
    var r = byRule[it.rule];
    document.querySelectorAll('#rules .it.sel').forEach(function (e) { e.classList.remove('sel'); });
    var g = document.querySelector('#rules .it[data-k="' + it.k + '"]'); if (g) g.classList.add('sel');
    var xs = r.readings.slice(); if (r.unit === 'word' && it.n_mine != null) xs.push('mine');
    var h = '<div class="meta">' + ROWN[r.id] + ' · ' + (it.path || 'commit subject') + ' · ' + it.date.replace('T', ' ') + ' UTC · <a href="https://github.com/frankbueltge/ulysses/commit/' + it.h + '">' + it.h + '</a></div><div class="nums">';
    xs.forEach(function (x) { var v = val(it, x); h += '<span data-x="' + x + '"' + (v > r.limit ? ' class="over"' : '') + '><b>' + fmt(v) + '</b> ' + NAME[x] + '</span>'; });
    h += '</div><p class="said">';
    if (it.verdict === 'not bound') h += 'Not bound: ' + it.exempt + '.';
    else h += '<b class="v-' + it.verdict + '">' + it.verdict + '</b>: ' + (it.verdict === 'kept' ? 'inside ' + fmt(r.limit) + ' on every reading.' : it.verdict === 'broken' ? 'over ' + fmt(r.limit) + ' on every reading.' : 'over ' + fmt(r.limit) + ' on some readings, inside on others; the rule as written does not decide.');
    if (it.seen) h += ' This practice named it over on ' + it.seen.date.slice(0, 10) + ' (<a href="https://github.com/frankbueltge/ulysses/commit/' + it.seen.by + '">' + it.seen.by + '</a>), ' + it.seen.lag + ' days after.';
    if (it.census) h += ' The Field\'s census read ' + fmt(it.census.value) + ' and marked it ' + (it.census.breach ? 'over' : 'kept') + '.';
    else h += ' The Field\'s census did not read it' + (it.date > F.census_time ? ': it came after.' : '.');
    det.innerHTML = h + '</p>';
  }

  // ———— the bulletin that counted itself
  var sv = document.getElementById('selfc'), S = R.self;
  var after = R.items.filter(function (it) { return it.rule === 'bulletin-lines' && it.date > F.self.last; }).slice(0, 7);
  var cells = S.map(function (s) { return { s: s }; }).concat(after.map(function (it) { return { none: it }; }));
  var cw = 1000 / cells.length;
  cells.forEach(function (c, i) {
    var form = c.none ? 'none' : (c.s.over_said ? 'over' : c.s.form === 'lines and words' || c.s.form === 'words' ? 'fig' : c.s.form === 'approximated' ? 'approx' : 'name');
    var g = el('g', { class: 'sc ' + form, 'data-form': form }, sv);
    el('rect', { x: i * cw + 1, y: 22, width: cw - 2, height: 40, class: 'cell' }, g);
    if (c.s && c.s.minutes && !c.s.over_said) el('rect', { x: i * cw + 1, y: 22, width: cw - 2, height: 40, class: 'atlim' }, g);
    var secs = c.s ? c.s.secs : F.self.after[i - S.length].secs;
    if (secs > 120) el('rect', { x: i * cw + 1, y: 65, width: cw - 2, height: 5, class: 'late' }, g);
    g.addEventListener('click', function () {
      var p = document.getElementById('sdet');
      var t = ' At 184 words a minute it reads in ' + Math.floor(secs / 60) + ' min ' + (secs % 60) + ' s' + (secs > 120 ? ', over two minutes.' : '.');
      if (c.none) { p.innerHTML = '<span class="mono">' + c.none.h + ' · ' + c.none.date.slice(0, 10) + '</span> No line about its own count.' + t; return; }
      var s = c.s, ex = Object.keys(s.said).length ? (s.exact ? ' Every figure in it is exact.' : ' A figure in it is not exact.') : '';
      p.innerHTML = '<span class="mono">' + s.h + ' · ' + s.date.slice(0, 10) + '</span> <q>' + s.line.replace(/\*/g, '').replace(/[<>&]/g, '') + '</q>' + ex + t;
    });
  });
  var mark = function (d, label) { var i = cells.findIndex(function (c) { return c.s && c.s.date.slice(0, 10) === d; }); if (i >= 0) { el('line', { x1: i * cw + 1, x2: i * cw + 1, y1: 8, y2: 66, class: 'sm' }, sv); el('text', { x: i * cw + 3, y: 16, class: 'rl' }, sv).textContent = label; } };
  mark(S[0].date.slice(0, 10), 'first line');
  mark(F.self.at_limit_date, 'on the limit');
  mark(F.self.approx_first, '"approximated"');
  el('text', { x: 1000 - 3, y: 80, class: 'rl', 'text-anchor': 'end' }, sv).textContent = 'after ' + F.self.last_day + ': no line';
  // open on the version that stood on the limit
  var li = cells.findIndex(function (c) { return c.s && c.s.minutes && !c.s.over_said; });
  if (li >= 0) sv.querySelectorAll('g.sc')[li].dispatchEvent(new Event('click'));
  draw();
  document.getElementById('rules').setAttribute('data-done', '1');
})();
