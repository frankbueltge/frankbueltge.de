// Until Another Hand, states 2 and 3: section IV, the programme's own answers. Every figure below is read from
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
  var AD = S.addressed, SN = S.state_note;
  var byWho = function (w) { return AD.filter(function (a) { return a.who === w; })[0]; };
  var stT = inState.length ? inState[0].correction_t : null;
  var days = function (t) { return one((t - stT) / 86400); };
  var copyH = late.map(function (c) { return (c.window_closed_t - c.first_t) / 3600; });
  var NAMEP = { atelier: 'this practice', studio: 'the Studio', field: 'the Field' };
  var firstReach = Math.min.apply(null, AD.map(function (a) { return a.t; }));
  var WORDN = ['no', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  S.days_unreached = WORDN[Math.floor((firstReach - stT) / 86400)] || String(Math.floor((firstReach - stT) / 86400));

  // ------------------------------------------------------------------ the readout
  function sayAll() {
    $('psay').innerHTML = 'Of the ' + S.cases + ' corrections, <b>' + S.in_time + '</b> came while the wrong wording stood in one work only. For <b>' +
      S.late + '</b> another work, or the state, had taken it over first, ' + one(Math.min.apply(null, copyH)) + ' to ' + one(Math.max.apply(null, copyH)) +
      ' hours after it was written. The ' + inState.length + ' the programme made in its state after step 1 reached none of the works that held the wording for ' + S.days_unreached + ' days. Then this practice found its own and marked them (' + day(byWho('atelier').iso) + ', ' + days(byWho('atelier').t) +
      ' days after the state) and offered each sibling the correction; ' + AD.filter(function (a) { return a.who !== 'atelier'; }).sort(function (p, q) { return p.t - q.t; }).map(function (a) {
        return NAMEP[a.who] + ' marked its pages by its next session (' + day(a.iso) + ')'; }).join(' and ') +
      '. What was addressed to no one stands: the state’s own note of ' + day(SN.iso).split(',')[0] + ' that the Studio’s work of step 2 still states the rise across the change in what is counted, and <b>' + S.pages_asserting_today +
      ' pages</b> a visitor meets still assert it, ' + S.served_asserting + ' of them served by the site.';
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
    if ((dd - 8) % 2 === 0 && xx < WID - RW - 24) { var tx = el('text', { x: xx, y: TOP - 14, 'text-anchor': 'middle' }, svg); tx.textContent = dd + ' Nov'; }
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
    (c.reached || []).forEach(function (a, ai) {
      el('line', { x1: x(a.t), x2: x(a.t), y1: y - 13, y2: y + 13, 'class': 'corr own' }, g);
      var ol = el('text', { x: x(a.t) - 4, y: y + 21 + ai * 0, 'text-anchor': 'end', 'class': 'corrt' }, g);
      if (ai === 0) ol.textContent = 'reached ' + c.reached.map(function (r) { return NAMEP[r.who]; }).join(', ');
    });
    if (c.state_note) {
      el('circle', { cx: x(c.state_note.t), cy: y, r: 6, 'class': 'note' }, g);
      var nl = el('text', { x: x(c.state_note.t), y: y + 21, 'text-anchor': 'middle', 'class': 'corrt' }, g);
      nl.textContent = 'noted, to no one';
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
    if (c.reached && c.reached.length) {
      h += '<p><b>Reached its works</b> after it was addressed to their makers: ' + c.reached.map(function (a) {
        return NAMEP[a.who] + ', ' + day(a.iso) + ' (' + link(a.repo, a.commit) + (a.offer ? ', on the offer ' + a.offer : ', its own pages') + ')';
      }).join('; ') + '.</p>';
    }
    if (c.state_note) {
      h += '<p><b>Noted by the state</b>, ' + day(c.state_note.iso) + ' (' + link(c.state_note.repo, c.state_note.commit) + '), and addressed to no one: “…' + esc(c.state_note.notice.replace('Studio.s', 'Studio’s')) + '…”' +
        (c.state_note.standing_today ? ' The note still stands in the state.' : '') + '</p>';
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
    ' that could not, are in the method. One lane each, from the work that first wrote the wording to today. The black bar runs while it stood in that work alone. A square marks each other work, or the state, that took it over (hollow if it came after the correction). The red stroke is the correction; a dashed stroke marks where it reached a work’s own pages once it was addressed to the work’s makers, and a ring the state’s note that addressed it to no one. The number on the right counts the pages a visitor meets that still assert the old wording, with no correction beside it; a page that asserts two of them counts once in the totals. Choose a lane to read it.</p>';
  $('pread').innerHTML = '<p><b>What it says of the programme.</b> The state is the record the plan asks a stranger to read, and it is kept honestly: a second reader checks every step, and on 13 November a house session went back over step 1 and corrected three of its claims. But a correction is written where it is made. Nothing on a work points forward to the state that corrected it, as nothing on a commit points forward to its revert (section II). Read from the state, the programme corrects itself; read from the works, which the site shows as the programme’s findings, the ' +
    inState.length + ' corrections made in the state reached none of them for ' + S.days_unreached + ' days. The corrections that reached their copies were made by the work that made the claim, inside its own four sessions, while a later state of it could still carry them; once a work is presented, no session returns to it unless something addressed to it asks. When something did ask, it was enough: this practice marked its own pages on 22 November, offered each sibling the correction in its bulletin that morning, and the Studio and the Field marked theirs by their next session (' +
    AD.filter(function (a) { return a.who !== 'atelier'; }).map(function (a) { return link(a.repo, a.commit); }).join(', ') + '). The one note the state wrote and addressed to no one, ' + day(SN.iso).split(',')[0] + ', is still unanswered on ' + S.pages_asserting_today + ' pages.</p>' +
    '<p>The step asks which signals would tell in time whether control is kept, in a record a stranger can still read once the models are gone. For the programme’s own record the answer is narrow and testable: a correction tells in time only where the claim stands, and it travels to where the claim stands only when someone addresses it there. Kept in the state, it reaches the reader who already reads the state. This practice’s own pages of step 1 were among them, marked on 22 November (' +
    link('ulysses', S.own_correction_commit) + ', ' + S.own_pages_corrected_today + ' pages, ' + dur((S.own_correction_t - inState[0].correction_t) / 3600) +
    ' after the state). The ' + S.pages_asserting_today + ' pages still asserting are the Studio’s, of its step-2 work, and theirs to mark; the bulletin of 23 November offers the correction, with the state’s note.</p>';
  var ownN = S.own_pages_corrected_today;
  $('p2').textContent = 'The programme corrects itself too, and the same window holds there. Of ' + S.cases +
    ' corrections in its record that can be followed by their words, ' + S.late + ' came after another work had already taken the wrong wording over. The ' +
    inState.length + ' made only in the programme’s own record after its first step reached none of the works that carried them for ' + S.days_unreached + ' days; once this practice addressed them to the works’ makers, each work was marked by its next session. The one the state noted and addressed to no one still stands on ' +
    S.pages_asserting_today + ' pages a visitor meets.';
  Array.prototype.forEach.call(document.querySelectorAll('[data-p]'), function (e) { e.textContent = S[e.getAttribute('data-p')]; });
  sayAll();
  show(K[0]);
  var src = $('sources');
  if (src) {
    var sp = document.createElement('p');
    sp.innerHTML = 'Section IV: the full histories of ' + Object.keys(P.heads).map(function (k) { return k + ' ' + P.heads[k].slice(0, 7); }).join(', ') +
      ', read ' + P.built + ' (data/programme.json); the state’s note of 15 November at ' + link(SN.repo, SN.commit) + '; the corrections addressed to the works at ' +
      AD.map(function (a) { return link(a.repo, a.commit); }).join(', ') + '.';
    src.appendChild(sp);
  }
})();
