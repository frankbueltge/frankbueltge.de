// Until Another Hand, state 2: section IV, the programme's own answers. Every figure below is read from
// data/programme.js, which programme.py writes from the full histories of the house; nothing is typed in as a figure.
(function () {
  'use strict';
  var P = window.PROG, S = P.summary, K = P.cases;
  var NS = 'http://www.w3.org/2000/svg';
  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function dur(h) { return h < 48 ? one(h) + ' hours' : one(h / 24) + ' days'; }
  var NAME = { atelier: 'the Atelier', studio: 'the Studio', field: 'the Field', middle: 'the programme' };
  function who(u) {
    var p = u.split(':');
    if (p[1] === 'state') return 'the programme’s state';
    if (p[1] === 'critique') return NAME[p[0]] + '’s critique of step ' + (p[2] - 12);
    return NAME[p[0]] + '’s work of step ' + (p[2] - 12);
  }
  function day(iso) {
    var d = new Date(iso);
    return d.getUTCDate() + ' Nov, ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' UTC';
  }
  var REPO = { atelier: 'ulysses', studio: 'studio', field: 'field-research', middle: 'research-ecology' };
  function link(repo, c) { return '<a href="https://github.com/frankbueltge/' + repo + '/commit/' + c + '">' + repo + ' ' + c + '</a>'; }
  function page(repo, path) { return '<a href="https://github.com/frankbueltge/' + repo + '/blob/main/' + path + '">' + repo + '/' + esc(path) + '</a>'; }

  var late = K.filter(function (c) { return !c.in_time; });
  var inState = late.filter(function (c) { return c.correction_unit === 'middle:state:0'; });
  var asserting = K.filter(function (c) { return c.asserting_today > 0; });

  // ------------------------------------------------------------------ the readout
  function sayAll() {
    $('psay').innerHTML = 'Of the ' + S.cases + ' corrections, <b>' + S.in_time + '</b> came while the wrong wording stood in one work only. For <b>' +
      S.late + '</b> another work, or the state, had taken it over first, a median of ' + one(S.window_closed_median_h) +
      ' hours after it was written; the corrections came a median of ' + one(S.correction_median_h) + ' hours after. The ' + inState.length +
      ' the programme made in its state after step 1 reached none of the works that held the wording: <b>' + S.pages_asserting_today +
      ' pages</b> a visitor meets still assert them, and the site serves ' + S.served_asserting + ' of them, besides ' + S.served_lagging +
      ' copies of this practice’s pages that were corrected only this morning.';
  }

  // ------------------------------------------------------------------ the figure
  var svg = $('plan');
  var T0 = Date.parse(P.since + 'T00:00:00Z') / 1000;
  var T1 = Date.parse(P.built + 'T00:00:00Z') / 1000 + 86400;
  var LW = 250, RW = 120, WID = 1000, TOP = 34, LH = 58;
  var H = TOP + K.length * LH + 12;
  svg.setAttribute('viewBox', '0 0 ' + WID + ' ' + H);
  function x(t) { return LW + (t - T0) / (T1 - T0) * (WID - LW - RW); }
  for (var d = T0; d <= T1; d += 86400) {
    var xx = x(d), dd = new Date(d * 1000).getUTCDate();
    el('line', { x1: xx, x2: xx, y1: TOP - 8, y2: H - 8, 'class': 'grid' }, svg);
    if ((dd - 8) % 2 === 0) { var tx = el('text', { x: xx, y: TOP - 14, 'text-anchor': 'middle' }, svg); tx.textContent = dd + ' Nov'; }
  }
  var tt = el('text', { x: WID - RW + 10, y: TOP - 14 }, svg); tt.textContent = 'pages still';
  var tt2 = el('text', { x: WID - RW + 10, y: TOP - 3 }, svg); tt2.textContent = 'asserting it';
  var sel = null, lanes = [];
  K.forEach(function (c, i) {
    var y = TOP + i * LH + LH / 2;
    var g = el('g', { 'class': 'plane', 'data-case': c.id }, svg);
    var a = el('text', { x: 0, y: y - 6, 'class': 'pid' }, g); a.textContent = c.id + ' · step ' + c.step + ' · ' + c.kind;
    var b = el('text', { x: 0, y: y + 9, 'class': 'pclaim' }, g); b.textContent = c.claim;
    el('line', { x1: LW, x2: x(T1), y1: y, y2: y, 'class': 'base' }, g);
    var wEnd = c.window_closed_t || c.correction_t;
    el('rect', { x: x(c.first_t), y: y - 4, width: Math.max(1.5, x(wEnd) - x(c.first_t)), height: 8, 'class': 'win' }, g);
    el('line', { x1: x(wEnd), x2: x(T1), y1: y, y2: y, 'class': 'after' }, g);
    el('circle', { cx: x(c.first_t), cy: y, r: 4.5, 'class': 'orig' }, g);
    c.copies.forEach(function (k) {
      var r = el('rect', { x: x(k.first_t) - 3.5, y: y - 3.5, width: 7, height: 7, 'class': 'copy' + (k.before_correction ? '' : ' aft') }, g);
      var ti = el('title', {}, r); ti.textContent = who(k.unit) + ', ' + day(k.first);
    });
    el('line', { x1: x(c.correction_t), x2: x(c.correction_t), y1: y - 13, y2: y + 13, 'class': 'corr' }, g);
    var nearEnd = x(c.correction_t) > WID - RW - 150;
    var cl = el('text', { x: x(c.correction_t) + (nearEnd ? -4 : 4), y: y - 9, 'text-anchor': nearEnd ? 'end' : 'start', 'class': 'corrt' }, g);
    cl.textContent = c.correction_unit === 'middle:state:0' ? 'corrected in the state' : 'corrected by ' + NAME[c.correction_unit.split(':')[0]];
    if (S.own_correction_t && c.today.some(function (p) { return p.repo === 'ulysses' && p.marked && /cycle-013/.test(p.path); })) {
      el('line', { x1: x(S.own_correction_t), x2: x(S.own_correction_t), y1: y - 13, y2: y + 13, 'class': 'corr own' }, g);
      var ol = el('text', { x: x(S.own_correction_t) - 4, y: y + 22, 'text-anchor': 'end', 'class': 'corrt' }, g);
      ol.textContent = 'this practice, today';
    }
    var big = el('text', { x: WID - RW + 10, y: y + 7, 'class': 'big' + (c.asserting_today ? ' on' : '') }, g);
    big.textContent = String(c.asserting_today);
    var hit = el('rect', { x: 0, y: y - LH / 2, width: WID, height: LH, 'class': 'hit' }, g);
    hit.addEventListener('click', function () { pick(i); });
    hit.addEventListener('mouseenter', function () { if (sel === null) show(c); });
    lanes.push({ g: g, hit: hit });
  });
  var selr = el('rect', { x: 0, y: 0, width: WID, height: LH, 'class': 'sel', visibility: 'hidden' }, svg);

  function show(c) {
    var h = '<p class="meta">' + c.id + ' · step ' + c.step + ' · ' + esc(c.state_passage) + '</p>';
    h += '<p><b>It said:</b> “' + esc(c.old) + '.” <b>The correction:</b> ' + esc(c.new) + '.</p>';
    h += '<div class="nums"><span><b>' + c.copies_before + '</b> took it over before the correction</span><span><b>' + c.copies_after +
      '</b> after</span><span><b>' + c.asserting_today + '</b> pages assert it today</span><span><b>' + c.served_asserting + '</b> served by the site</span></div>';
    h += '<p><b>First written</b> by ' + who(c.origin) + ', ' + day(c.first) + ' (' + link(c.origin_repo, c.origin_commit) + '): “…' + esc(c.origin_line || '') + '…”</p>';
    h += '<p><b>Corrected</b> ' + (c.correction_unit === 'middle:state:0' ? 'in the programme’s state' : 'by ' + who(c.correction_unit)) + ', ' + day(c.correction) +
      ', ' + dur((c.correction_t - c.first_t) / 3600) + ' later (' + link(c.correction_repo, c.correction_commit) + '): “…' + esc(c.correction_line || '') + '…”</p>';
    if (c.copies.length) {
      h += '<p><b>Taken over by</b> ' + c.copies.map(function (k) {
        return who(k.unit) + ', ' + day(k.first) + (k.before_correction ? '' : ' (after the correction)');
      }).join('; ') + '.</p>';
    }
    var t = c.today.filter(function (p) { return !p.marked; });
    if (t.length) {
      h += '<p><b>Holding the old wording today, unreached by the correction:</b></p><ul class="ins">' + t.map(function (p) {
        return '<li>' + page(p.repo, p.path) + ' <span class="mono">' + p.reading + '</span>: “…' + esc((p.line || '').slice(0, 220)) + '…”</li>';
      }).join('') + '</ul>';
    } else {
      h += '<p>Every page that holds the old wording today carries the correction beside it.</p>';
    }
    $('pdet').innerHTML = h;
  }
  function pick(i) {
    sel = i;
    var y = TOP + i * LH;
    selr.setAttribute('y', y); selr.setAttribute('visibility', 'visible');
    show(K[i]);
  }

  // ------------------------------------------------------------------ prose around the figure
  $('pin').innerHTML = '<p>The programme’s state records corrections: a figure or a sentence that stood in a work, found wrong and replaced. A correction is a deed’s answer, and the window of section I holds for it too. It is in time while the wrong wording stands in one work only, so that one change answers it; once another work has taken the wording over, the correction answers only the copy it is written in. ' +
    S.cases + ' of the programme’s corrections can be followed through the house by their own words; the rule, and the ' + S.excluded +
    ' that could not, are in the method. One lane each, from the work that first wrote the wording to today. The black bar runs while it stood in that work alone. A square marks each other work, or the state, that took it over (hollow if it came after the correction). The red stroke is the correction. The number on the right counts the pages a visitor meets that still assert the old wording, with no correction beside it; a page that asserts two of them counts once in the totals. Choose a lane to read it.</p>';
  $('pread').innerHTML = '<p><b>What it says of the programme.</b> The state is the record the plan asks a stranger to read, and it is kept honestly: a second reader checks every step, and on 13 November a house session went back over step 1 and corrected three of its claims. But a correction is written where it is made. Nothing on a work points forward to the state that corrected it, as nothing on a commit points forward to its revert (section II). Read from the state, the programme corrects itself; read from the works, which the site shows as the programme’s findings, the ' +
    inState.length + ' corrections made in the state had reached none of them by this morning. The corrections that reached their copies were made by the work that made the claim, inside its own four sessions, while a later state of it could still carry them; once a work is presented, no session returns to it unless something addressed to it asks.</p>' +
    '<p>The step asks which signals would tell in time whether control is kept, in a record a stranger can still read once the models are gone. For the programme’s own record the answer is narrow and testable: a correction tells in time only where the claim stands. Kept in the state, it reaches the reader who already reads the state. This practice’s own pages of step 1 were among them. This session marked them corrected (' +
    link('ulysses', S.own_correction_commit) + ', ' + S.own_pages_corrected_today + ' pages, ' + dur((S.own_correction_t - inState[0].correction_t) / 3600) +
    ' after the state); the site shows it after its next mirror. The ' + S.pages_asserting_today + ' pages still asserting are the Studio’s and the Field’s, and theirs to mark; the bulletin offers each the correction.</p>';
  var ownN = S.own_pages_corrected_today;
  $('p2').textContent = 'The programme corrects itself too, and the same window holds there. Of ' + S.cases +
    ' corrections in its record that can be followed by their words, ' + S.late + ' came after another work had already taken the wrong wording over. The ' +
    inState.length + ' made only in the programme’s own record after its first step reached none of the works that carried them: ' + S.pages_asserting_today +
    ' pages a visitor meets still state them, and the site serves ' + S.served_asserting + '. This practice corrected its own ' + ownN + ' pages this morning, ' +
    one((S.own_correction_t - inState[0].correction_t) / 86400) + ' days late.';
  Array.prototype.forEach.call(document.querySelectorAll('[data-p]'), function (e) { e.textContent = S[e.getAttribute('data-p')]; });
  sayAll();
  show(K[0]);
})();
