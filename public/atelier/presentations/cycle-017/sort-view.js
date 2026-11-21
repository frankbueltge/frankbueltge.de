// State 4, the presentation: the house's deeds sorted by what decides them, and each mending joined to its deed
// from Git alone. Draws data/sort.js (written by build4.py); every figure on the page comes from it.
// State 5 (2026-11-21, after the presentation): the same lanes read from the deed's end, from data/both.js
// (written by build5.py): every later commit that took out a line the deed wrote before its mending, as a tick.
(function () {
  'use strict';
  var S = window.SORT;
  if (!S) return;
  var NS = 'http://www.w3.org/2000/svg';
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function get(path) { return path.split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, S); }
  var A = S.act, D = A.deeds;
  var J = A.join;
  var derived = {
    'act.anyone': (J.same || 0) + (J.name || 0),
    'act.git': J.lines || 0,
    'act.reader': J.file || 0,
    'act.logonly': J.log || 0,
    'act.authority': D.filter(function (d) { return d.kind === 'authority'; }).length,
    'act.apart_unnamed': (J.lines || 0) + (J.file || 0) + (J.log || 0)
  };
  document.querySelectorAll('[data-so]').forEach(function (e) {
    var k = e.getAttribute('data-so'), v = Object.prototype.hasOwnProperty.call(derived, k) ? derived[k] : get(k);
    if (v != null) e.textContent = typeof v === 'number' ? fmt(v) : v;
  });

  // state 5: figures of the reading from both ends, from data/both.js
  if (window.BOTH) document.querySelectorAll('[data-bo]').forEach(function (e) {
    var v = e.getAttribute('data-bo').split('.').reduce(function (o, k) { return o == null ? o : o[k]; }, window.BOTH.results);
    if (v != null) e.textContent = typeof v === 'number' ? fmt(v) : v;
  });
  var svg = document.getElementById('sortf');
  if (!svg) return;
  var d0 = new Date(S.days[0] + 'T00:00:00Z'), d1 = new Date(S.days[1] + 'T00:00:00Z');
  var NDAY = Math.round((d1 - d0) / 864e5) + 1;
  var X0 = 210, X1 = 988, W = (X1 - X0) / NDAY;
  function ix(day) { return Math.round((new Date(day + 'T00:00:00Z') - d0) / 864e5); }
  function x(k) { return X0 + (k + 0.5) * W; }

  // months
  var g0 = el('g', {}, svg);
  ['2026-07-01', '2026-08-01', '2026-09-01', '2026-10-01', '2026-11-01'].forEach(function (m) {
    var k = ix(m); if (k < 0) return;
    el('line', { x1: X0 + k * W, x2: X0 + k * W, y1: 24, y2: 2000, class: 'grid' }, g0);
    var t = el('text', { x: X0 + k * W + 3, y: 18 }, g0); t.textContent = new Date(m + 'T00:00:00Z').toLocaleString('en', { month: 'short', timeZone: 'UTC' });
  });
  var t0 = el('text', { x: X0 + 3, y: 18 }, g0); t0.textContent = new Date(S.days[0] + 'T00:00:00Z').toLocaleString('en', { month: 'short', day: 'numeric', timeZone: 'UTC' });

  function label(y, a, b, c) {
    var t = el('text', { x: 0, y: y, class: 'rl' }, svg); t.textContent = a;
    var u = el('text', { x: 0, y: y + 14 }, svg); u.textContent = b;
    if (c) { var v = el('text', { x: 0, y: y + 28 }, svg); v.textContent = c; }
  }

  function tall(y, n) { var t = el('text', { x: X1, y: y - 3, 'text-anchor': 'end' }, svg); t.textContent = 'tallest day: ' + fmt(n) + ' items'; }

  // row 1: a rule names what it looks for
  var B1 = 106, H1 = 72;
  var max1 = 0; Object.keys(S.rule.by_day).forEach(function (k) { max1 = Math.max(max1, S.rule.by_day[k].kept || 0); });
  var g1 = el('g', { class: 'r1' }, svg);
  Object.keys(S.rule.by_day).forEach(function (k) {
    var n = S.rule.by_day[k].kept || 0, h = H1 * n / max1;
    el('rect', { x: x(+k) - W * 0.4, y: B1 - h, width: W * 0.8, height: Math.max(h, 0.6), class: 'kept' }, g1);
  });
  el('line', { x1: X0, x2: X1, y1: B1, y2: B1, class: 'base' }, svg);
  label(52, 'a rule names what it looks for', fmt(S.rule.n) + ' items', 'broken: ' + S.rule.broken + ', nothing below the line');
  tall(B1 - H1, max1);

  // row 2: a limit names no unit. Kept items rise as columns; every item over its limit hangs below the line as a dot
  var B2 = 222, H2 = 80, DOT = 3.3;
  var max2 = 0, maxo = 0; Object.keys(S.limit.by_day).forEach(function (k) { var c = S.limit.by_day[k]; max2 = Math.max(max2, c.kept || 0); maxo = Math.max(maxo, (c.one || 0) + (c.every || 0)); });
  var g2 = el('g', { class: 'r2' }, svg);
  Object.keys(S.limit.by_day).forEach(function (k) {
    var c = S.limit.by_day[k], n = c.kept || 0, h = H2 * n / max2, j = 0;
    if (n) el('rect', { x: x(+k) - W * 0.4, y: B2 - h, width: W * 0.8, height: Math.max(h, 0.6), class: 'kept' }, g2);
    ['every', 'one'].forEach(function (cl) {
      for (var m = 0; m < (c[cl] || 0); m++, j++) el('circle', { cx: x(+k), cy: B2 + 4 + j * DOT, r: Math.min(1.35, W * 0.42), class: 'o ' + cl }, g2);
    });
  });
  el('line', { x1: X0, x2: X1, y1: B2, y2: B2, class: 'base' }, svg);
  label(166, 'a limit names no unit', fmt(S.limit.n) + ' items · ' + fmt(S.limit.over) + ' over',
        fmt(S.limit.every) + ' on every reading');
  var tb = el('text', { x: X1, y: B2 + 4 + maxo * DOT + 10, 'text-anchor': 'end' }, svg); tb.textContent = 'below the line: one dot an item over';
  tall(B2 - H2, max2);

  // row 3: an act, in the log's sentence: one lane per deed, from the deed to its mending
  var T3 = B2 + 4 + maxo * DOT + 26, LANE = 2.9;
  var order = D.map(function (d, i) { return i; }).sort(function (a, b) {
    return ix(D[a].deed_day) - ix(D[b].deed_day) || D[a].row - D[b].row || D[a].n - D[b].n;
  });
  label(T3 + 20, 'an act, in the log\'s sentence', fmt(A.n) + ' deeds · ' + fmt(A.mended) + ' mended',
        'a lane each, deed to mending');
  var g3 = el('g', { class: 'r3' }, svg), lanes = [];
  order.forEach(function (i, j) {
    var d = D[i], y = T3 + 6 + j * LANE, a = x(ix(d.deed_day)), g = el('g', { class: 'dd j-' + (d.join || 'none') + ' k-' + d.kind }, g3);
    if (d.join && d.join !== 'same') {
      var b = x(ix(d.repair_day));
      el('line', { x1: a, x2: Math.max(b, a + 1.5), y1: y, y2: y, class: 'span' }, g);
      el('line', { x1: b, x2: b, y1: y - 1.3, y2: y + 1.3, class: 'end' }, g);
    } else if (!d.join) {
      el('line', { x1: a, x2: X1, y1: y, y2: y, class: 'span' }, g);
    }
    if (d.kind === 'authority') el('rect', { x: a - 2, y: y - 2, width: 4, height: 4, class: 'mk' }, g);
    else el('circle', { cx: a, cy: y, r: 1.5, class: 'mk' }, g);
    el('rect', { x: X0, y: y - LANE / 2, width: X1 - X0, height: LANE, class: 'hit', 'data-i': i }, g);
    lanes.push({ i: i, g: g });
  });
  // state 5: the lanes read from the deed's end
  var B = window.BOTH, BP = {};
  if (B) B.pairs.forEach(function (r) { BP[r.row + '|' + r.n] = r; });
  var LEAD = 0, TICKS = 0;
  order.forEach(function (i, j) {
    var d = D[i], y = T3 + 6 + j * LANE, a = x(ix(d.deed_day)), L = lanes[j], r = BP[d.row + '|' + d.n];
    if (!B || !d.join || d.join === 'file' || d.join === 'log') return;
    var g = el('g', { class: 'fo' }, L.g), b = x(ix(d.repair_day));
    if (d.join === 'same') { el('circle', { cx: a, cy: y, r: 2.2, class: 'lead-mk' }, g); L.g.classList.add('leads'); LEAD++; return; }
    if (!r) return;
    if (d.join === 'name' || !r.hands.length) {
      el('line', { x1: a, x2: Math.max(b, a + 1.5), y1: y, y2: y, class: 'lead' }, g);
      el('line', { x1: b, x2: b, y1: y - 1.4, y2: y + 1.4, class: 'lead' }, g);
      L.g.classList.add('leads'); LEAD++;
      if (d.join === 'name') return;
    }
    if (r.hands.length) {
      var f = x(ix(r.hands[0].day));
      el('line', { x1: a, x2: Math.max(f, a + 1), y1: y, y2: y, class: 'stray' }, g);
      el('line', { x1: f, x2: Math.max(b, f + 1), y1: y, y2: y, class: 'gap' }, g);
      el('line', { x1: b, x2: b, y1: y - 1.2, y2: y + 1.2, class: 'gap-end' }, g);
      r.hands.forEach(function (h, k) {
        el('line', { x1: x(ix(h.day)), x2: x(ix(h.day)), y1: y - 1.45, y2: y + 1.45, class: 'hand' + (k === 0 ? ' first' : '') }, g);
        TICKS++;
      });
    }
  });
  svg.setAttribute('data-lead', String(LEAD)); svg.setAttribute('data-ticks', String(TICKS));
  svg.setAttribute('viewBox', '0 0 1000 ' + Math.ceil(T3 + 12 + order.length * LANE));
  var sel = el('rect', { x: X0 - 4, y: 0, width: X1 - X0 + 8, height: LANE + 1, class: 'sel', visibility: 'hidden' }, svg);

  // what joins a mending to its deed, and who can still read it
  var WHO = {
    all: null,
    anyone: ['same', 'name'], git: ['lines'], reader: ['file'], logonly: ['log'], none: [null]
  };
  var SAY = {
    all: 'Each lane is one deed of the house\'s log, from the day of its first commit to the commit the log says mended it. Choose who can still join them, or touch a lane.',
    anyone: '<b>' + fmt(derived['act.anyone']) + '</b> of the ' + fmt(A.mended) + ' mendings join themselves: ' + fmt(J.same || 0) + ' are the deed\'s own commit, ' + fmt(J.name || 0) + ' names the deed\'s commit. Anyone who reads the mending has the join.',
    git: '<b>' + fmt(J.lines || 0) + '</b> take out lines with the text the deed wrote, in the same file. Anyone with Git who holds the mending can check it against the deed' + (B ? '; from the deed, the first later commit to take out one of its lines is the mending in only ' + fmt(B.results.first) + ' (read from the deed\'s end)' : '') + '. Git does not say it was a mending: that word is still a later reader\'s. <i>Corrected 2026-11-21: this said that anyone who follows the file from the deed comes to the mending.</i>',
    reader: '<b>' + fmt(J.file || 0) + '</b> change a file the deed changed and none of its lines. A reader must judge that the one answers the other, as a reader decides a limit that names no unit.',
    logonly: '<b>' + fmt(J.log || 0) + '</b> change nothing the deed changed, or lie in another repository. Only the log\'s sentence joins them, and the log is written by the house\'s sessions in the architect\'s name.',
    none: '<b>' + fmt(A.unmended) + '</b> deeds have no mending on record. Their lane runs on to today.'
  };
  var say = document.getElementById('ssay'), cur = 'all', q = false;
  var Q = A.neither;
  function apply() {
    var want = WHO[cur];
    lanes.forEach(function (L) {
      var d = D[L.i], on = (!want || want.indexOf(d.join) >= 0) && (!q || (d.join && d.join !== 'same' && d.join !== 'name' && !d.says_machine));
      L.g.setAttribute('class', L.g.getAttribute('class').replace(/ dim/g, '') + (on ? '' : ' dim'));
    });
    var s = SAY[cur];
    if (q) s = 'The Field asked: when a mending names neither the deed nor the machine, who can still join them once the log\'s writer is gone? Of those <b>' + fmt(Q.n) + '</b> mendings, ' + fmt(Q.join.lines || 0) + ' take out the deed\'s own lines (anyone with Git), ' + fmt(Q.join.file || 0) + ' share only a file (a reader must judge), ' + fmt(Q.join.log || 0) + ' shares nothing (the log\'s sentence alone).' + (cur === 'all' ? '' : ' ' + s);
    say.innerHTML = s;
  }
  document.querySelectorAll('#sortask button[data-w]').forEach(function (b) {
    b.addEventListener('click', function () {
      cur = b.getAttribute('data-w');
      document.querySelectorAll('#sortask button[data-w]').forEach(function (c) { c.setAttribute('aria-pressed', c === b ? 'true' : 'false'); });
      if (dir === 'fore') setDir('back'); else apply();
    });
  });
  var qb = document.getElementById('sortq');
  var dir = 'back', R5 = B ? B.results : null;
  var DSAY = R5 ? {
    back: null,
    fore: 'Read from the deed\'s end, Git leads to the mending in <b>' + fmt(R5.lead_all) + '</b> of the ' + fmt(A.mended) + ': ' + fmt(J.same || 0) + ' are the deed\'s own commit, ' + fmt(J.name || 0) + ' names the deed\'s hash in its message, and in ' + fmt(R5.first) + ' of the ' + fmt(R5.lines) + ' joined by lines the mending is the first later commit to take out a line the deed wrote. In the other ' + fmt(R5.lines - R5.first) + ', ' + fmt(R5.hands_total) + ' other commits did so first (ticks), a median of ' + fmt(R5.hands_median_any) + ' a lane; Git marks none of them, nor the mending, as an answer.'
  } : {};
  function setDir(v) {
    dir = v;
    if (v === 'fore') {
      cur = 'all'; q = false; qb.setAttribute('aria-pressed', 'false');
      document.querySelectorAll('#sortask button[data-w]').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-w') === 'all' ? 'true' : 'false'); });
      apply();
    }
    svg.classList.toggle('fore', v === 'fore');
    document.querySelectorAll('#dirask button').forEach(function (c) { c.setAttribute('aria-pressed', c.getAttribute('data-d') === v ? 'true' : 'false'); });
    if (v === 'fore') say.innerHTML = DSAY.fore; else apply();
  }
  document.querySelectorAll('#dirask button').forEach(function (b) { b.addEventListener('click', function () { setDir(b.getAttribute('data-d')); }); });
  qb.addEventListener('click', function () { q = !q; qb.setAttribute('aria-pressed', q ? 'true' : 'false'); if (dir === 'fore') setDir('back'); else apply(); });

  // one deed
  var det = document.getElementById('sdeed'), pick = document.getElementById('spick');
  pick.max = String(order.length - 1);
  var REPO = 'https://github.com/frankbueltge/';
  function link(rh) { return '<a class="mono" href="' + REPO + rh[0] + '/commit/' + rh[1] + '">' + rh[0] + ' ' + rh[1].slice(0, 7) + '</a>'; }
  var JN = {
    same: 'The deed\'s own commit mended it: deed and mending are one commit.',
    name: 'The mending names the deed\'s commit. Anyone who reads it has the join.',
    lines: 'Git joins them by their lines: the mending takes out ',
    file: 'Git joins them only by a file: the mending changes ',
    log: 'Only the log\'s sentence joins them: '
  };
  function show(j) {
    var i = order[j], d = D[i];
    pick.value = String(j);
    sel.setAttribute('y', String(T3 + 6 + j * LANE - LANE / 2 - 0.5)); sel.setAttribute('visibility', 'visible');
    var h = '<p class="meta">log row ' + d.row + (d.n > 1 ? ', deed ' + d.n : '') + ' · dated ' + d.log_date + ' · ' +
      (d.kind === 'authority' ? 'an act of authority' : 'a fault') + ' · ' + d.relation + ' its instructions · seen first, the row says, by ' + d.seer + '</p>';
    h += '<p class="said">' + d.deed_line.replace(/</g, '&lt;') + ' <span class="mute">(the Field\'s paraphrase of the row)</span></p>';
    h += '<p class="meta">the deed: ' + (d.commits.length ? d.commits.map(link).join(', ') : 'no commit in public Git (' + d.found + ')') + '</p>';
    if (d.join) {
      h += '<p class="meta">the mending: ' + link(d.repair) + ' · ' + d.repair_day + ' · ' + (d.lag_days === 0 ? 'the same day' : d.lag_days + ' days after') + ' · signed with ' + d.repair_signer + (d.says_machine ? ' · its message names a machine of the house' : ' · its message names no machine') + '</p>';
      var t = JN[d.join];
      if (d.join === 'lines') t += d.evidence.map(function (e) { return e[1] + ' line' + (e[1] > 1 ? 's' : '') + ' the deed wrote in <span class="mono">' + e[0] + '</span>'; }).join(', ') + '.';
      if (d.join === 'file') t += d.evidence.map(function (e) { return '<span class="mono">' + e + '</span>'; }).join(', ') + ', which the deed changed, and none of the deed\'s lines.';
      if (d.join === 'log') t += d.why + '.';
      h += '<p class="said"><b class="j">' + t + '</b></p>';
      var r = BP[d.row + '|' + d.n];
      if (r) {
        var lk = function (hh) { return '<a class="mono" href="' + REPO + r.repo + '/commit/' + hh + '">' + hh.slice(0, 7) + '</a>'; };
        var fw = r.hands.length
          ? 'From the deed\'s end: ' + r.hands.length + ' later commit' + (r.hands.length > 1 ? 's' : '') + ' took out lines the deed wrote before the mending did. The first, ' + lk(r.hands[0].h) + ', came ' + r.hands[0].hours + ' hours after the deed, signed with ' + r.hands[0].signer + (r.hands[0].mends_another ? ', and the log calls it the mending of another deed' : '') + '.'
          : 'From the deed\'s end: the mending is the first later commit to take out a line the deed wrote.';
        if (d.join === 'name') fw = 'From the deed\'s end: the mending carries the deed\'s hash in its message, so a search of later messages finds it. ' + (r.hands.length ? r.hands.length + ' later commit' + (r.hands.length > 1 ? 's' : '') + ' took out the deed\'s lines before it.' : '');
        var bk = 'From the mending\'s end: the lines it took out were written by ' + r.back.writers + ' commit' + (r.back.writers > 1 ? 's' : '') + '; the deed wrote ' + r.back.deed + ' of ' + r.back.lines + (r.back.deed_rank === 1 ? ', and no commit wrote more' : '') + '.';
        h += '<p class="meta both">' + fw + '</p><p class="meta both">' + bk + '</p>';
      } else if (B && (d.join === 'file' || d.join === 'log')) {
        h += '<p class="meta both">From the deed\'s end: Git cannot lead to a mending that takes out none of the deed\'s lines.</p>';
      } else if (B && d.join === 'same') {
        h += '<p class="meta both">From the deed\'s end: the deed is its own mending, read from either end.</p>';
      }
    } else {
      h += '<p class="said"><b class="j">No mending is on record for this deed.</b></p>';
    }
    det.innerHTML = h;
  }
  svg.addEventListener('click', function (ev) {
    var t = ev.target.closest('[data-i]'); if (!t) return;
    var i = +t.getAttribute('data-i'); show(order.indexOf(i));
  });
  pick.addEventListener('input', function () { show(+pick.value); });
  document.getElementById('sprev').addEventListener('click', function () { show(Math.max(0, +pick.value - 1)); });
  document.getElementById('snext').addEventListener('click', function () { show(Math.min(order.length - 1, +pick.value + 1)); });
  apply();
  // open on the deed that answers the Field's question with nothing but the log: the first such lane
  var first = order.findIndex(function (i) { return D[i].kind === 'authority' && D[i].join === 'log'; });
  show(first >= 0 ? first : 0);
  svg.setAttribute('data-done', '1');
}());
