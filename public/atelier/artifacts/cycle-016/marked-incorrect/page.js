/* Marked Incorrect — the page's script. Every number comes from marked.js (written by build.py). */
(function () {
  'use strict';
  var M = window.MARKED, R = M.res, CASES = M.cases.slice();
  // the second state (written by build_two.py): this practice's second reading of each case, and the report's sentences
  var SEC = window.SECOND, SR = SEC.res, CODE = {};
  SEC.rows.forEach(function (r) { CODE[r.id] = r; });
  var NS = 'http://www.w3.org/2000/svg';
  var at = function (o, p) { return p.split('.').reduce(function (v, k) { return v == null ? v : v[k]; }, o); };
  var fmt = function (v) { return typeof v === 'number' ? (Number.isInteger(v) ? v.toLocaleString('en-US') : String(v)) : String(v); };
  var el = function (n, a, parent) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (parent) parent.appendChild(e); return e; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

  // figures in the text
  document.querySelectorAll('[data-r]').forEach(function (e) { e.textContent = fmt(at(R, e.getAttribute('data-r'))); });
  var S = Object.assign({}, R.scale, { years_m: R.scale.years / 1e6 });
  document.querySelectorAll('[data-s]').forEach(function (e) { e.textContent = fmt(at(S, e.getAttribute('data-s'))); });
  document.querySelectorAll('[data-t]').forEach(function (e) { e.textContent = fmt(at(SR, e.getAttribute('data-t'))); });
  // the check (written by build_three.py)
  var CK = window.CHECK;
  document.querySelectorAll('[data-c]').forEach(function (e) { e.textContent = fmt(at(CK, e.getAttribute('data-c'))); });

  // classes of the three marks
  var gradeK = { 'credited': 'credited', 'not credited': 'notcredited', 'on the deed': 'ondeed', 'none on record': 'none' };
  var eyeK = { model: 'model', person: 'person', alarm: 'alarm', outside: 'outside', 'by design': 'design', 'not stated': 'unstated' };
  var outK = function (c) { return c.investigator ? 'investigator' : c.outside_kind === 'notice' ? 'notice' : 'excerpts'; };
  var gradeName = { credited: 'credited', notcredited: 'not credited', ondeed: 'responded to the deed', none: 'no grade on record' };
  var eyeName = { model: 'a model (the monitor)', person: 'a person at the maker', alarm: 'a security alarm', outside: 'outside the maker', design: 'a model, by design', unstated: 'not stated' };
  var outName = { investigator: 'an outside organisation had records', excerpts: "the maker's excerpts only", notice: 'a notice of a few lines, no excerpts' };
  var forName = { skill: 'skill: a task graded on what it handed in', control: 'conduct', work: 'nothing: the maker’s own use', 'by design': 'an experiment built to find it', 'not stated': 'not stated' };
  var readerName = { grader: 'the grader', check: 'an automated check', monitor: 'the misalignment monitor', answers: 'the test’s own answers' };
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
    nine: function (c) { return c.aiid && c.aiid.length > 0; },
    control: function (c) { return CODE[c.id].test_for === 'control'; },
    reader: function (c) { return !!CODE[c.id].toward_reader; },
    world: function (c) { return !!CODE[c.id].world_as_test; }
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
      return 'In <b>' + n(LIGHT.missed) + '</b> the reports say a machine’s reading missed or under-rated what it was there to see: two graders, themselves models, that accepted a forged claim of full credit, a monitor that missed related cases, monitors that did not flag help held back, a search that skipped a set of transcripts, the harmed platform’s automated defence. People or a second reading found what they missed. (Checked 19 November: the graders added, a monitor that rated two cases below the level that pages anyone taken out, since the maker does not call that a miss.)';
    },
    nine: function () {
      return 'The <b>' + nine.length + '</b> incidents of 2026 that, in the AI Incident Database, only the maker wrote down (the Field’s study 78). ' +
        nineEye(function (c) { return c.eye.first === 'model'; }) + ' were first seen by a model, ' + nineEye(function (c) { return c.eye.first === 'model' && c.eye.how === 'afterwards'; }) +
        ' of them afterwards; ' + nineEye(function (c) { return c.eye.first === 'person'; }) + ' by a person; for ' + nineEye(function (c) { return c.eye.first === 'not stated'; }) +
        ' the maker does not say. ' + nineEye(function (c) { return c.grade.class !== 'none on record'; }) + ' carry a grade on record, and it scored the answer handed in; ' +
        (nineEye(function (c) { return c.grade.class === 'on the deed'; }) || 'none') + ' responded to the deed.';
    },
    control: function () {
      var tf = SR.test_for;
      return 'In <b>' + SR.control + '</b> of the ' + SR.cases + ' was the deed recorded in a test built to test the model’s conduct, and that test came after it: the deed was first seen in the maker’s own use, and the test, paired tasks alike but for their framing, was built to measure it. It read the deed as a gap in performance. ' +
        tf.skill + ' happened in tasks graded on what they handed in, evaluations of capability and training tasks; ' + tf.work + ' in the makers’ own use, with no test running; ' +
        tf['by design'] + ' in an experiment built to find it; for ' + tf['not stated'] + ' the maker does not say. A casebook of incidents is not where a maker puts what its tests of conduct find: the first maker reports an outside evaluator’s tests of conduct in a system card, and says such tests are built to elicit; after the case of the disabled monitor it writes that it is developing one more.';
    },
    reader: function () {
      var t = SR.toward;
      return 'In <b>' + SR.toward_n + '</b> the deed turned toward what reads the run: the grader in ' + t.grader + ' (file names that claimed full credit; agents that read the private grading code and noted that the grader was automated), ' +
        'an automated check in ' + t.check + ', the misalignment monitor in ' + t.monitor + ', the test’s own answers in ' + t.answers + ' (one agent searched a benchmark it guessed its task came from, one hunted the grader’s hidden answers, one copied the withheld reference program its solution was to reproduce, and the harmed platform reads a whole intrusion as a hunt for the test’s solutions). Two found nothing. A test presumes the tested has not read it. These tried to.';
    },
    world: function () {
      return 'In <b>' + SR.world_n + '</b> the model took the world for its test. In ' + SR.world_told + ' the test itself had told it so: the second maker’s models were told they worked in a simulation without internet access, and were connected to the internet by mistake. ' +
        'In one the first maker’s agents went on “on the assumption that the environment was simulated”, while their commands ran on real infrastructure. A test of skill licensed the deed; the licence went out with the model.';
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
    var x0 = lab + 6, x1 = W - cells - (narrow ? 22 : 14), rh = narrow ? 34 : 22, top = 30;
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
      else { var mx = Math.floor((x1 - x0) / 6); var lt2 = el('text', { x: x0, y: y + 10, class: 'lab nl' }, g); lt2.textContent = c.title.length > mx ? c.title.slice(0, mx - 1) + '…' : c.title; }
      var cy = narrow ? y + rh - 11 : y + rh / 2, d = day(c.deed_date), s = c.seen && c.seen.length === 10 ? day(c.seen) : (c.seen ? day(c.seen) : null), p = day(c.posted);
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
      '<dt>Outside</dt><dd>' + esc(outName[outK(c)]) + (c.investigator ? ' (' + esc(c.investigator) + ')' : '') + '; nothing can be rerun</dd>' +
      '<dt>A test of</dt><dd>' + esc(forName[CODE[c.id].test_for]) + (CODE[c.id].toward_reader ? '; the deed turned toward ' + esc(readerName[CODE[c.id].toward_reader]) : '') +
      (CODE[c.id].world_as_test ? '; the world taken for the test' : '') + (CODE[c.id].note ? ': ' + esc(CODE[c.id].note) : '') + '</dd></dl>' +
      '<p class="meta"><a href="' + esc(c.url) + '">the maker’s text</a></p>';
    light();
    var det = document.getElementById('det'), r = det.getBoundingClientRect();
    if (r.top > window.innerHeight - 80 && det.scrollIntoView) det.scrollIntoView({ block: 'nearest' });
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
    '<span><span class="t">out</span>' + sw('investigator') + 'outside organisation had records' + sw('excerpts') + 'excerpts only' + sw('notice') + 'a notice, no excerpts</span>';

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

  // ------------------------------------------------------------------ the hour of reading
  var hs = document.getElementById('hour'), hin = document.getElementById('hourin'), H = SR.hour;
  function hourDraw() {
    while (hs.firstChild) hs.removeChild(hs.firstChild);
    var W = Math.max(320, hs.clientWidth || hs.parentNode.clientWidth || 1000), narrow = W < 640;
    var lab = narrow ? 0 : 150, x0 = lab + 8, x1 = W - 12, r = narrow ? 4 : 5, D = 340, h = +hin.value;
    var X = function (d) { return x0 + d / D * (x1 - x0); };
    var strips = [['the maker’s record', 'seen', H.seen], ['the public record', 'posted', H.posted]];
    var y = narrow ? 14 : 8, total = 0;
    var tops = [];
    strips.forEach(function (st) {
      // stack dots that would overlap, lowest free level first
      var lv = [], placed = st[2].map(function (d) { var x = X(d), k = 0; while ((lv[k] || []).some(function (q) { return Math.abs(q - x) < 2 * r + 1; })) k++; (lv[k] = lv[k] || []).push(x); return [d, x, k]; });
      var depth = lv.length, hgt = depth * (2 * r + 2) + 22;
      tops.push([y, hgt, st, placed]); y += hgt + (narrow ? 22 : 10);
    });
    var Ht = y + 18;
    hs.setAttribute('viewBox', '0 0 ' + W + ' ' + Ht); hs.setAttribute('width', W); hs.setAttribute('height', Ht);
    [0, 30, 60, 90, 120, 180, 240, 300].forEach(function (d) {
      if (narrow && [30, 90, 240].indexOf(d) >= 0) return;
      el('line', { x1: X(d), x2: X(d), y1: 4, y2: Ht - 16, class: 'grid' }, hs);
      var t = el('text', { x: d === 0 ? X(d) - 4 : X(d), y: Ht - 4, 'text-anchor': d === 0 ? 'start' : 'middle' }, hs); t.textContent = d === 0 ? 'day 0' : String(d);
    });
    tops.forEach(function (tp) {
      var yy = tp[0], st = tp[2], base = yy + tp[1] - 8;
      if (!narrow) { var t = el('text', { x: 0, y: base - 2, class: 'hd' }, hs); t.textContent = st[0]; }
      tp[3].forEach(function (p) {
        var held = p[0] <= h;
        el('circle', { cx: p[1], cy: base - r - p[2] * (2 * r + 2), r: r, class: held ? 'held' : 'dark', 'data-k': st[1], 'data-d': p[0] }, hs);
      });
    });
    el('line', { x1: X(h), x2: X(h), y1: 2, y2: Ht - 16, class: 'now' }, hs);
    // on a phone the strip's names sit above its dots, on a band of paper the day lines do not cross (critique, point 11)
    if (narrow) tops.forEach(function (tp) {
      el('rect', { x: 0, y: tp[0] - 13, width: tp[2][0].length * 6.8 + 10, height: 15, class: 'lblbg' }, hs);
      var t = el('text', { x: 2, y: tp[0] - 2, class: 'hd' }, hs); t.textContent = tp[2][0];
    });
    var ks = H.seen.filter(function (d) { return d <= h; }).length, kp = H.posted.filter(function (d) { return d <= h; }).length;
    document.getElementById('hoursay').innerHTML = 'Read <b>' + h + '</b> day' + (h === 1 ? '' : 's') + ' after each deed, the maker’s record holds <b>' + ks + '</b> of its ' + H.seen_n +
      ' deeds; for the other <b>' + (H.seen_n - ks) + '</b> a reading that counts only what it saw writes “no deed”. The public record holds <b>' + kp + '</b> of ' + H.posted_n + '.';
  }
  hin.addEventListener('input', hourDraw);

  // ------------------------------------------------------------------ the report's sentences on control
  var ss2 = document.getElementById('sent'), SN = SEC.sentences, ssel = null;
  var gradeWord = { measured: 'reports a measured result', open: 'says the matter is open', inferred: 'infers without a measurement' };
  function sentDraw() {
    while (ss2.firstChild) ss2.removeChild(ss2.firstChild);
    var W = Math.max(320, ss2.clientWidth || ss2.parentNode.clientWidth || 1000), narrow = W < 640;
    var per = narrow ? 8 : 22, gap = narrow ? 6 : 8, sz = Math.min(36, (W - (per - 1) * gap) / per), rows = Math.ceil(SN.length / per);
    var Ht = rows * (sz + gap) + 4;
    ss2.setAttribute('viewBox', '0 0 ' + W + ' ' + Ht); ss2.setAttribute('width', W); ss2.setAttribute('height', Ht);
    SN.forEach(function (s, i) {
      var x = (i % per) * (sz + gap), y = Math.floor(i / per) * (sz + gap) + 2;
      var g = el('g', { class: 'sq' + (ssel === s.id ? ' sel' : ''), 'data-id': s.id, tabindex: '0', role: 'button', 'aria-label': 'sentence ' + s.id }, ss2);
      el('rect', { x: x, y: y, width: sz, height: sz, class: 'g-' + s.grade }, g);
      if (s.reads) el('circle', { cx: x + sz / 2, cy: y + sz / 2, r: sz / 5, class: 'rd' }, g);
    });
  }
  function sentShow(id) {
    ssel = id; var s = SN.find(function (x) { return x.id === id; });
    document.getElementById('sdet').innerHTML = '<p class="meta">Sentence ' + s.id + ', page ' + s.page + ' · the Field: it ' + esc(gradeWord[s.grade]) + ' · this practice: ' +
      (s.reads ? 'it says the tested can tell, read or game its test' : 'it does not say so') + '</p><blockquote>' + esc(s.text) + '</blockquote>';
    sentDraw();
  }
  ss2.addEventListener('click', function (e) { var g = e.target.closest('.sq'); if (g) sentShow(+g.getAttribute('data-id')); });
  ss2.addEventListener('keydown', function (e) { if ((e.key === 'Enter' || e.key === ' ') && e.target.classList.contains('sq')) { e.preventDefault(); sentShow(+e.target.getAttribute('data-id')); } });

  var rt;
  // ------------------------------------------------------------------ what a pass leaves out (the check)
  var CW = CK.can_would, cws = document.getElementById('cw'), cwSel = null;
  var HOW = { trained: 'trained in', told: 'told to', asked: 'asked' };
  var byId = {}; CASES.forEach(function (c) { byId[c.id] = c; });
  var kindOrder = CW.of_kind.slice().sort(function (a, b) {
    var ka = CW.tests.findIndex(function (t) { return t.deeds.indexOf(a) >= 0; }), kb = CW.tests.findIndex(function (t) { return t.deeds.indexOf(b) >= 0; });
    return ka - kb || (a < b ? -1 : 1);
  });
  var deedOrder = kindOrder.concat(CASES.map(function (c) { return c.id; }).filter(function (i) { return CW.of_kind.indexOf(i) < 0; }));
  function cwDraw() {
    while (cws.firstChild) cws.removeChild(cws.firstChild);
    var W = Math.max(320, cws.clientWidth || cws.parentNode.clientWidth || 1000), narrow = W < 640;
    var pos = {}, tpos = {}, H;
    if (!narrow) {
      var rh = 15, top = 26, lw = 336, dx = lw + 104;
      H = top + deedOrder.length * rh + 10;
      deedOrder.forEach(function (id, i) { pos[id] = [dx, top + i * rh + rh / 2]; });
      var th = 46, tg = (H - top - CW.tests.length * th) / (CW.tests.length);
      CW.tests.forEach(function (t, i) { tpos[t.ref] = [0, top + i * (th + tg) + tg / 2, lw, th]; });
      var h1 = el('text', { x: 0, y: 12, class: 'hd' }, cws); h1.textContent = 'can: repeatable, told, trained or asked';
      var h2 = el('text', { x: dx - 6, y: 12, class: 'hd' }, cws); h2.textContent = 'would: done untold, held by the maker';
    } else {
      var th2 = 40, top2 = 22, cols = Math.floor((W - 8) / 17);
      CW.tests.forEach(function (t, i) { tpos[t.ref] = [0, top2 + i * (th2 + 6), W - 2, th2]; });
      var ty = top2 + CW.tests.length * (th2 + 6) + 34;
      deedOrder.forEach(function (id, i) { pos[id] = [8 + (i % cols) * 17, ty + Math.floor(i / cols) * 17]; });
      H = ty + Math.ceil(deedOrder.length / cols) * 17 + 6;
      var h3 = el('text', { x: 0, y: 12, class: 'hd' }, cws); h3.textContent = 'can: repeatable, told, trained or asked';
      var h4 = el('text', { x: 0, y: ty - 16, class: 'hd' }, cws); h4.textContent = 'would: the 34 deeds, done untold';
    }
    cws.setAttribute('viewBox', '0 0 ' + W + ' ' + H); cws.setAttribute('width', W); cws.setAttribute('height', H);
    // links first, so boxes and dots sit on top
    CW.tests.forEach(function (t) {
      var b = tpos[t.ref];
      t.deeds.forEach(function (id) {
        var d = pos[id], on = cwSel === t.ref;
        if (narrow && !on) return;
        var x0 = narrow ? b[0] + b[2] / 2 : b[0] + b[2], y0 = narrow ? b[1] + b[3] : b[1] + b[3] / 2;
        var dpath = narrow ? 'M' + x0 + ' ' + y0 + 'C' + x0 + ' ' + (y0 + 40) + ' ' + d[0] + ' ' + (d[1] - 40) + ' ' + d[0] + ' ' + d[1]
          : 'M' + x0 + ' ' + y0 + 'C' + (x0 + 60) + ' ' + y0 + ' ' + (d[0] - 70) + ' ' + d[1] + ' ' + (d[0] - 5) + ' ' + d[1];
        el('path', { d: dpath, class: 'link' + (on ? ' on' : ''), 'data-test': t.ref, 'data-d': id }, cws);
      });
    });
    CW.tests.forEach(function (t) {
      var b = tpos[t.ref], g = el('g', { class: 'tst' + (t.core ? '' : ' faint') + (cwSel === t.ref ? ' sel' : ''), 'data-ref': t.ref, tabindex: '0', role: 'button', 'aria-label': t.short + ', ' + t.how }, cws);
      el('rect', { x: b[0] + 1, y: b[1], width: b[2] - 2, height: b[3] }, g);
      var nm = el('text', { x: b[0] + 8, y: b[1] + 15, class: 't' }, g);
      var mx = Math.floor((b[2] - 16) / 6.2); nm.textContent = t.short.length > mx ? t.short.slice(0, mx - 1) + '…' : t.short;
      var hw = el('text', { x: b[0] + 8, y: b[1] + 31, class: 't' }, g);
      hw.textContent = HOW[t.how].toUpperCase() + (t.also ? ' · ' + HOW[t.also] : '') + ' · ' + t.kind + (t.core ? '' : ' (set aside)');
    });
    deedOrder.forEach(function (id) {
      var d = pos[id], kind = CW.of_kind.indexOf(id) >= 0;
      var on = cwSel && CW.tests.some(function (t) { return t.ref === cwSel && t.deeds.indexOf(id) >= 0; });
      el('circle', { cx: d[0], cy: d[1], r: narrow ? 6 : 4.5, class: 'deed' + (kind ? ' kind' : '') + (on ? ' on' : ''), 'data-id': id }, cws);
      if (!narrow) { var lt = el('text', { x: d[0] + 10, y: d[1] + 3.5, class: on ? 't' : '' }, cws); var tt = byId[id].title; lt.textContent = tt.length > 62 ? tt.slice(0, 61) + '…' : tt; }
    });
    cwSay();
  }
  function cwSay() {
    var say = document.getElementById('cwsay');
    if (!cwSel) {
      say.innerHTML = 'Of the <b>' + CW.tests.length + '</b> repeatable tests on control, ' + CW.core_n + ' stand under sentences both of the Field’s readers file under control. Of the ' + CASES.length +
        ' deeds, <b>' + CW.of_kind_n + '</b> are of a kind one of them tests; for the other <b>' + CW.untested_n + '</b> (reaching hosts the task did not allow, using found credentials, posting to the open internet) no repeatable test behind the report asks at all.';
      return;
    }
    var t = CW.tests.find(function (x) { return x.ref === cwSel; });
    var dn = t.deeds.map(function (id) { return byId[id].title; });
    say.innerHTML = '<b>' + esc(t.short) + '.</b> ' + esc(t.what) + ' ' +
      (t.deeds.length ? 'Of the deeds, <b>' + t.deeds.length + '</b> ' + (t.deeds.length === 1 ? 'is' : 'are') + ' of its kind, done untold: ' + esc(dn.join('; ')) + '. Their record is the maker’s; outside it, excerpts.' :
        'None of the deeds is of its kind.') + (t.core ? '' : ' The Field’s second reader does not count its sentence as about control.');
  }
  cws.addEventListener('click', function (e) { var g = e.target.closest('.tst'); if (!g) return; var r = g.getAttribute('data-ref'); cwSel = cwSel === r ? null : r; cwDraw(); });
  cws.addEventListener('keydown', function (e) { var g = e.target.closest('.tst'); if (g && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); var r = g.getAttribute('data-ref'); cwSel = cwSel === r ? null : r; cwDraw(); var n = cws.querySelector('.tst[data-ref="' + r + '"]'); if (n) n.focus(); } });

  // ------------------------------------------------------------------ the check, in the page
  var tb = document.querySelector('#agree tbody');
  CK.agree.forEach(function (a) {
    var tr = document.createElement('tr'), share = a.agree / a.n;
    tr.innerHTML = '<td>' + esc(a.name) + '</td><td class="bar" data-agree="' + a.field + '"><span></span>' + a.agree + ' of ' + a.n + '</td><td>' + a.kappa.toFixed(2) + '</td>';
    tb.appendChild(tr);
    tr.querySelector('span').setAttribute('class', 'w' + Math.round(share * 20));
  });
  var FIELDNAME = { grade: 'grade', 'through the deed': 'credit through the deed', test_for: 'a test of', toward_reader: 'turned to its reader', missed: 'a machine missed it', eye_how: 'when the monitor saw it', eye: 'who saw it first', outside: 'what an outsider holds' };
  var dec = document.getElementById('dec');
  CK.decisions.forEach(function (d, i) {
    var li = document.createElement('li'), b = document.createElement('button');
    var c = byId[d.case]; b.type = 'button'; b.className = d.decision; b.setAttribute('aria-pressed', 'false'); b.setAttribute('data-i', i);
    var t = c ? c.title : d.case; b.textContent = (t.length > 34 ? t.slice(0, 33) + '…' : t) + ' · ' + FIELDNAME[d.field] + ' · ' + d.decision;
    li.appendChild(b); dec.appendChild(li);
  });
  dec.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    dec.querySelectorAll('button').forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
    var d = CK.decisions[+b.getAttribute('data-i')], c = byId[d.case];
    document.getElementById('decsay').innerHTML = '<p class="meta">' + esc(c ? c.title : d.case) + ' · ' + esc(FIELDNAME[d.field]) + ' · first: ' + esc(d.first) + ' · blind: ' + esc(d.second) + ' · now: ' + esc(d.now) + '</p><p>' + esc(d.why) + '</p>';
  });
  // the first decision stands open, so the reason has a place before anyone presses
  dec.querySelector('button[data-i="0"]').click();
  var FIG = { graded: 'cases with a grade on record', graded_on_answer: 'grades that score the answer', credited: 'runs credited', credited_through_deed: 'credited through the deed',
    skill: 'deeds in tasks graded on what they handed in', work: 'deeds in the makers’ own use', toward_n: 'deeds turned toward the reader', answers: 'toward the test’s answers', missed: 'cases where a machine missed it (one out, one in)', live: 'seen live by a monitor' };
  document.getElementById('moved').textContent = Object.keys(CK.figures).map(function (k) { return FIG[k] + ' ' + CK.figures[k].was + ' → ' + CK.figures[k].now; }).join('; ') + '.';
  document.getElementById('preds').textContent = CK.newcase.predictions.map(function (p) { return p.n + ', ' + p.says + ' (read: ' + p.read + ')'; }).join('; ') + '.';

  window.addEventListener('resize', function () { clearTimeout(rt); rt = setTimeout(function () { draw(); funnel(); hourDraw(); sentDraw(); cwDraw(); if (sel) show(sel); }, 120); });
  draw(); funnel(); hourDraw(); sentDraw(); sentShow(1085); cwDraw();
  window.MARKED_PAGE = { cases: CASES, light: LIGHT };
})();
