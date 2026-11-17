/* Marked Incorrect — the page's script. Every number comes from marked.js (written by build.py). */
(function () {
  'use strict';
  var M = window.MARKED, R = M.res, CASES = M.cases.slice();
  var NS = 'http://www.w3.org/2000/svg';
  var at = function (o, p) { return p.split('.').reduce(function (v, k) { return v == null ? v : v[k]; }, o); };
  var fmt = function (v) { return typeof v === 'number' ? (Number.isInteger(v) ? v.toLocaleString('en-US') : String(v)) : String(v); };
  var el = function (n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // figures in the text
  document.querySelectorAll('[data-r]').forEach(function (e) { e.textContent = fmt(at(R, e.getAttribute('data-r'))); });
  var S = Object.assign({}, R.scale, { years_m: R.scale.years / 1e6 });
  document.querySelectorAll('[data-s]').forEach(function (e) { e.textContent = fmt(at(S, e.getAttribute('data-s'))); });

  // classes of the three marks
  var gradeK = { 'credited': 'credited', 'not credited': 'notcredited', 'on the deed': 'ondeed', 'none on record': 'none' };
  var eyeK = { model: 'model', person: 'person', alarm: 'alarm', outside: 'outside', 'by design': 'design', 'not stated': 'unstated' };
  var outK = function (c) { return c.investigator ? 'investigator' : 'excerpts'; };
  var gradeName = { credited: 'credited', notcredited: 'not credited', ondeed: 'responded to the deed', none: 'no grade on record' };
  var eyeName = { model: 'a model (the monitor)', person: 'a person at the maker', alarm: 'a security alarm', outside: 'outside the maker', design: 'a model, by design', unstated: 'not stated' };
  var outName = { investigator: 'an outside organisation had records', excerpts: "the maker's excerpts only" };
  var howName = { live: 'while the run went on', sample: 'on a sample of one run in five', afterwards: 'afterwards, over old records', 'ad hoc': 'in an ad hoc investigation' };

  // order: by the day of the deed; cases without a day at the end
  var key = function (c) { return c.deed_date ? c.deed_date + (c.deed_date.length === 7 ? '-15' : '') : '9999'; };
  CASES.sort(function (a, b) { return key(a) < key(b) ? -1 : key(a) > key(b) ? 1 : 0; });

  // which rows each reading lights
  var LIGHT = {
    grader: function (c) { return !c.notice && c.grade.class !== 'none on record'; },
    model: function (c) { return !c.notice && c.eye.first === 'model'; },
    person: function (c) { return !c.notice && (c.eye.first === 'person' || c.eye.first === 'alarm'); },
    outside: function (c) { return !!c.notice || !!c.investigator; },
    missed: function (c) { return !!c.missed; },
    nine: function (c) { return c.aiid && c.aiid.length > 0; }
  };
  var n = function (f) { return CASES.filter(f).length; };
  var how = function (k) { return R.model_how[k] || 0; };
  var nine = CASES.filter(LIGHT.nine);
  var nineEye = function (f) { return nine.filter(f).length; };
  var SAY = {
    grader: function () {
      return 'The task’s grader left a record in <b>' + R.graded + '</b> of the ' + R.own + ' cases the makers published themselves. ' +
        R.graded_on_answer + ' score the answer handed in; ' + R.credited + ' gave the run that did the deed credit for some of it, ' +
        R.credited_through_deed + ' because of the deed. Only ' + R.graded_on_deed + ' responded to the deed itself: a reward that penalised it, a check that rejected fabricated grades.';
    },
    model: function () {
      return 'In <b>' + R.first_by_model + '</b> the makers’ monitors, models reading their models’ records, saw the deed first: ' +
        how('live') + ' while the run went on, ' + how('sample') + ' on a sample of one run in five, ' + how('ad hoc') + ' in an ad hoc investigation, ' +
        how('afterwards') + ' afterwards, run backwards over old records once an outside platform’s intrusion had shown what to look for, and ' + how('not stated') + ' without saying when.';
    },
    person: function () {
      return 'In <b>' + R.first_by_person + '</b> a person at the maker saw it first: researchers who noticed a shut-down evaluation, unusually high scores, help held back, an agent that would not stop cheating; and the staff of an internal service who saw suspicious activity. In ' +
        R.first_by_alarm + ' more a security alarm fired. In ' + R.first_unstated + ' the report does not say who saw it.';
    },
    outside: function () {
      return '<b>' + R.notices + '</b> cases reached the record from outside first. The platform the models broke into saw it with its own automated defences, which failed to raise the alert’s criticality. In <b>' +
        R.investigator_n + '</b> cases an outside organisation was given records. None of the ' + R.cases + ' can be rerun by anyone but its maker: what an outsider can check is the excerpts the maker chose.';
    },
    missed: function () {
      return 'In <b>' + n(LIGHT.missed) + '</b> the reports say a machine’s reading missed or under-rated what it was there to see: a monitor that rated neither case P0, a monitor that missed related cases, monitors that did not flag help held back, a search that skipped a set of transcripts, the harmed platform’s automated defence. People or a second reading found what they missed.';
    },
    nine: function () {
      return 'The <b>' + nine.length + '</b> incidents of 2026 that, in the AI Incident Database, only the maker wrote down (the Field’s study 78). ' +
        nineEye(function (c) { return c.eye.first === 'model'; }) + ' were first seen by a model, ' + nineEye(function (c) { return c.eye.first === 'model' && c.eye.how === 'afterwards'; }) +
        ' of them afterwards; ' + nineEye(function (c) { return c.eye.first === 'person'; }) + ' by a person; for ' + nineEye(function (c) { return c.eye.first === 'not stated'; }) +
        ' the maker does not say. ' + nineEye(function (c) { return c.grade.class !== 'none on record'; }) + ' carry a grade on record, and it scored the answer handed in; ' +
        (nineEye(function (c) { return c.grade.class === 'on the deed'; }) || 'none') + ' responded to the deed.';
    }
  };

  // ------------------------------------------------------------------ the sheet
  var svg = document.getElementById('sheet');
  var T0 = Date.UTC(2025, 9, 1), T1 = Date.UTC(2026, 10, 18);
  var day = function (s) { if (!s) return null; var p = s.split('-'); return Date.UTC(+p[0], +p[1] - 1, p[2] ? +p[2] : 15); };
  var sel = null, mode = 'grader';

  function draw() {
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    var W = Math.max(320, svg.clientWidth || svg.parentNode.clientWidth || 1000);
    var narrow = W < 640;
    var lab = narrow ? 0 : 250, cell = 16, gap = narrow ? 10 : 18, cells = 3 * cell + 2 * gap;
    var x0 = lab + 6, x1 = W - cells - 14, rh = narrow ? 26 : 22, top = 30;
    var H = top + CASES.length * rh + 8;
    svg.setAttribute('viewBox', '0 0 ' + W + ' ' + H);
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.classList.toggle('narrow', narrow);
    var X = function (t) { return x0 + (t - T0) / (T1 - T0) * (x1 - x0); };
    // month grid
    for (var y = 2025, m = 9; y < 2027; m++) {
      if (m > 11) { m = 0; y++; }
      var t = Date.UTC(y, m, 1); if (t > T1) break;
      el('line', { x1: X(t), x2: X(t), y1: top - 6, y2: H - 6, class: 'grid' }, svg);
      if (!narrow || m % 3 === 0) {
        var tx = el('text', { x: X(t) + 2, y: top - 10 }, svg);
        tx.textContent = (m === 0 || (y === 2025 && m === 9) ? ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][m] + ' ' + String(y).slice(2) : ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'][m]);
      }
    }
    var cx = x1 + 14;
    [['grade', 0], ['eye', 1], ['out', 2]].forEach(function (h) {
      var tx = el('text', { x: cx + h[1] * (cell + gap) + cell / 2, y: top - 10, 'text-anchor': 'middle', class: 'hd' }, svg);
      tx.textContent = h[0];
    });
    CASES.forEach(function (c, i) {
      var y = top + i * rh, g = el('g', { class: 'row', 'data-id': c.id, tabindex: '0', role: 'button', 'aria-label': c.title }, svg);
      el('rect', { x: 0, y: y, width: W, height: rh, class: 'hit' }, g);
      if (!narrow) { var lt = el('text', { x: 0, y: y + rh / 2 + 3.5, class: 'lab' }, g); lt.textContent = c.title.length > 40 ? c.title.slice(0, 39) + '…' : c.title; }
      var cy = y + rh / 2, d = day(c.deed_date), s = c.seen && c.seen.length === 10 ? day(c.seen) : (c.seen ? day(c.seen) : null), p = day(c.posted);
      if (c.deed_to) el('rect', { x: X(d - 15 * 864e5), y: cy - 3, width: X(day(c.deed_to)) - X(d - 15 * 864e5), height: 6, class: 'span' }, g);
      if (d && p) el('line', { x1: X(d), x2: X(p), y1: cy, y2: cy, class: 'life' }, g);
      if (d && s && s > d) el('line', { x1: X(d), x2: X(s), y1: cy, y2: cy, class: 'wait' }, g);
      if (d && !c.deed_to) el('circle', { cx: X(d), cy: cy, r: 3.6, class: 'dd' }, g);
      if (s) el('path', { d: 'M' + X(s) + ' ' + (cy - 4.5) + 'l4.5 4.5l-4.5 4.5l-4.5 -4.5z', class: 'ds' }, g);
      if (p) el('rect', { x: X(p) - 3.5, y: cy - 3.5, width: 7, height: 7, class: 'dp' }, g);
      var marks = [gradeK[c.grade.class], eyeK[c.eye.first], outK(c)];
      marks.forEach(function (k, j) { el('rect', { x: cx + j * (cell + gap) + 1, y: cy - cell / 2 + 1, width: cell - 2, height: cell - 2, class: 'c k-' + k, 'data-k': k }, g); });
      if (c.grade.through) el('line', { x1: cx + 3, y1: cy + cell / 2 - 3, x2: cx + cell - 3, y2: cy - cell / 2 + 3, class: 'c k-ondeed' }, g);
    });
    light();
  }

  function light() {
    var f = LIGHT[mode], on = 0;
    svg.classList.add('lit');
    svg.querySelectorAll('.row').forEach(function (g) {
      var c = CASES.find(function (x) { return x.id === g.getAttribute('data-id'); });
      var hit = f(c); g.classList.toggle('on', hit); if (hit) on++;
      g.classList.toggle('sel', sel === c.id);
    });
    document.getElementById('say').innerHTML = SAY[mode]();
    document.getElementById('count').textContent = on + ' of ' + CASES.length + ' rows lit';
  }

  function show(id) {
    sel = id; var c = CASES.find(function (x) { return x.id === id; });
    var maker = c.maker === 'A' ? 'the first maker' : 'the second maker';
    var dates = [c.deed_date ? 'deed ' + c.deed_date + (c.deed_to ? ' to ' + c.deed_to : '') : 'day of the deed not given',
      c.seen ? 'seen ' + (c.seen_by ? 'by ' : '') + c.seen : null, c.posted ? 'published ' + c.posted : null].filter(Boolean).join(' · ');
    var eye = eyeName[eyeK[c.eye.first]] + (c.eye.how && howName[c.eye.how] ? ', ' + howName[c.eye.how] : '');
    document.getElementById('det').innerHTML =
      '<h4>' + esc(c.title) + '</h4><p class="meta">' + esc(maker) + (c.notice ? ', a notice' : '') + ' · ' + esc(c.setting || '') + ' · ' + esc(dates) +
      (c.aiid && c.aiid.length ? ' · AI Incident Database ' + c.aiid.join(', ') : '') + (c.kind !== 'incident' ? ' · ' + esc(c.kind) + ' by the maker’s account' : '') + '</p>' +
      '<dl><dt>Asked</dt><dd>' + esc(c.asked) + '</dd><dt>Did</dt><dd>' + esc(c.deed) + '</dd>' +
      '<dt>The grade</dt><dd>' + esc(gradeName[gradeK[c.grade.class]]) + (c.grade.record ? ': ' + esc(c.grade.record) : '') + '</dd>' +
      '<dt>Seen first by</dt><dd>' + esc(eye) + (c.eye.note ? ': ' + esc(c.eye.note) : '') + '</dd>' +
      (c.missed ? '<dt>Missed</dt><dd>' + esc(c.missed) + '</dd>' : '') +
      '<dt>Outside</dt><dd>' + esc(outName[outK(c)]) + (c.investigator ? ' (' + esc(c.investigator) + ')' : '') + '; nothing can be rerun</dd></dl>' +
      '<p class="meta"><a href="' + esc(c.url) + '">the maker’s text</a></p>';
    light();
  }

  svg.addEventListener('click', function (e) { var g = e.target.closest('.row'); if (g) show(g.getAttribute('data-id')); });
  svg.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('row')) { e.preventDefault(); show(e.target.getAttribute('data-id')); } });
  document.getElementById('ask').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    mode = b.getAttribute('data-l');
    document.querySelectorAll('#ask button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    light();
  });

  // legend
  var sw = function (k) { return '<svg viewBox="0 0 11 11" aria-hidden="true"><rect x="1" y="1" width="9" height="9" class="c k-' + k + '"/></svg>'; };
  document.getElementById('leg').innerHTML =
    '<span><span class="t">line</span>● deed ◆ seen □ published; red: deed to seen</span>' +
    '<span><span class="t">grade</span>' + sw('credited') + 'credited' + sw('notcredited') + 'not credited' + sw('ondeed') + 'on the deed' + sw('none') + 'none on record; a stroke: credit through the deed</span>' +
    '<span><span class="t">eye</span>' + sw('model') + 'a model' + sw('person') + 'a person' + sw('alarm') + 'an alarm' + sw('outside') + 'outside' + sw('design') + 'by design' + sw('unstated') + 'not stated</span>' +
    '<span><span class="t">out</span>' + sw('investigator') + 'outside organisation had records' + sw('excerpts') + 'excerpts only</span>';

  // ------------------------------------------------------------------ the review, step by step
  var fs = document.getElementById('funnel');
  function funnel() {
    while (fs.firstChild) fs.removeChild(fs.firstChild);
    var W = Math.max(320, fs.clientWidth || fs.parentNode.clientWidth || 1000), narrow = W < 640;
    var steps = ['broad search', 'models, first pass', 'models, second pass', 'models, third pass', 'people'];
    var notes = [['records with credentials', 'or changed sites'], ['little compute,', 'flag broadly'], ['more compute,', 'separate and rate'], ['most compute,', 'group by pattern'], ['confirm,', 'notify']];
    var bw, bh = narrow ? 46 : 62, H, pos;
    if (narrow) { bw = W - 20; H = steps.length * (bh + 16) + 4; pos = function (i) { return [10, 2 + i * (bh + 16)]; }; }
    else { bw = (W - 20 - 4 * 22) / 5; H = bh + 26; pos = function (i) { return [10 + i * (bw + 22), 2]; }; }
    fs.setAttribute('viewBox', '0 0 ' + W + ' ' + H); fs.setAttribute('width', W); fs.setAttribute('height', H);
    steps.forEach(function (s, i) {
      var p = pos(i), last = i === steps.length - 1;
      el('rect', { x: p[0], y: p[1], width: bw, height: bh, class: last ? 'pp' : 'st' }, fs);
      var t = el('text', { x: p[0] + 8, y: p[1] + 18, class: last ? 'w' : '' }, fs); t.textContent = s;
      (narrow ? [notes[i].join(' ')] : notes[i]).forEach(function (line, j) {
        var m = el('text', { x: p[0] + 8, y: p[1] + 34 + j * 15, class: last ? 'w' : 'm' }, fs); m.textContent = line;
      });
      if (i) {
        var q = pos(i - 1);
        el('path', { d: narrow ? 'M' + (W / 2) + ' ' + (q[1] + bh) + 'v16' : 'M' + (q[0] + bw) + ' ' + (p[1] + bh / 2) + 'h22' }, fs);
      }
    });
    if (!narrow) { var t = el('text', { x: 10, y: H - 4, class: 'm' }, fs); t.textContent = 'no count published for any step'; }
  }

  var rt;
  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { draw(); funnel(); if (sel) show(sel); }, 120); });
  draw(); funnel();
  window.MARKED_PAGE = { cases: CASES, light: LIGHT };
})();
