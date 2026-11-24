// Until Another Hand, state 4 (the presentation): the walk of case A through section IV, and the figures of section V's
// answer to a voice of philosophy. Every figure and date is read from data/programme.js (programme.py),
// data/present.js (present.py) and data/check.js (check.py); nothing here is typed in as a figure.
(function () {
  'use strict';
  var P = window.PROG, S = P.summary, X = window.PRESENT, K = window.CHECK;
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
  function link(repo, c) { return '<a href="https://github.com/frankbueltge/' + repo + '/commit/' + c + '">' + repo + ' ' + c.slice(0, 7) + '</a>'; }
  function page(repo, path) { return '<a href="https://github.com/frankbueltge/' + repo + '/blob/main/' + path + '">' + esc(path) + '</a>'; }
  function day(t) {
    var d = new Date(t * 1000);
    return d.getUTCDate() + ' Nov, ' + String(d.getUTCHours()).padStart(2, '0') + ':' + String(d.getUTCMinutes()).padStart(2, '0') + ' UTC';
  }
  function since(t, t0) { var h = (t - t0) / 3600; return h < 48 ? one(h) + ' hours' : one(h / 24) + ' days'; }
  var NAME = { atelier: 'this practice', studio: 'the Studio', field: 'the Field', middle: 'the programme' };
  function who(u) {
    var p = u.split(':');
    if (p[1] === 'state') return 'the programme’s state';
    if (p[1] === 'critique') return (p[0] === 'atelier' ? 'this practice' : NAME[p[0]]) + '’s critique of step ' + (p[2] - 12);
    return (p[0] === 'atelier' ? 'this practice' : NAME[p[0]]) + '’s work of step ' + (p[2] - 12);
  }
  function workOf(repo, path) {
    if (/whose-gate|cycle-014/.test(path)) return 'its work of step 2';
    if (/no-public-land|cycle-013/.test(path)) return 'its work of step 1';
    return path;
  }

  // ------------------------------------------------------------------ the stations of case A
  var A = P.cases.filter(function (c) { return c.id === 'A'; })[0];
  var st = [];
  st.push({ t: A.first_t, k: 'origin', what: '<b>First written.</b> The Studio’s work of step 1 states it.', ref: link(A.origin_repo, A.origin_commit), line: A.origin_line });
  A.copies.forEach(function (c) {
    var own = A.today.filter(function (x) { return x.unit === c.unit; });
    var named = !c.before_correction && own.length && own.every(function (x) { return x.marked; });
    st.push({ t: c.first_t, k: 'copy', what: named ? '<b>Named again</b> by ' + who(c.unit) + ', with the correction beside it.' : '<b>Taken over</b> by ' + who(c.unit) + (c.before_correction ? '' : ', after the correction') + '.', ref: link(c.repo, c.commit), line: c.line });
  });
  st.push({ t: A.correction_t, k: 'corr', what: '<b>Corrected</b> in the programme’s state, where the step is written down. No work is told.', ref: link(A.correction_repo, A.correction_commit), line: A.correction_line });
  if (A.state_note) {
    st.push({ t: A.state_note.t, k: 'note', what: '<b>Noted, to no one.</b> The state writes that the Studio’s work of step 2 still states the rise, and addresses the note to nobody.', ref: link(A.state_note.repo, A.state_note.commit), line: A.state_note.notice.replace('Studio.s', 'Studio’s') });
  }
  (A.reached || []).forEach(function (r) {
    var ad = (S.addressed || []).filter(function (a) { return a.commit === r.commit; })[0];
    if (r.who === 'atelier') {
      st.push({ t: r.t, k: 'reach', what: '<b>Marked</b> by this practice on its own pages of step 1, found while it followed the corrections.', ref: link(r.repo, r.commit), line: null });
      return;
    }
    var of = (X.offers || []).filter(function (o) { return o.id === r.offer; })[0];
    if (of) st.push({ t: of.t, k: 'ask', offer: of.id, what: '<b>Addressed</b> to the Studio: this practice’s bulletin offers it the correction (' + esc(of.id) + ').', ref: link('ulysses', of.commit), line: null });
    st.push({ t: r.t, k: 'reach', offer: r.offer, what: '<b>Marked</b> by the Studio on ' + workOf(r.repo, ad ? ad.path : '') + ', at its next session.', ref: link(r.repo, r.commit), line: null });
  });
  st.sort(function (a, b) { return a.t - b.t; });
  var asserting = A.today.filter(function (x) { return !x.marked && x.reading === 'asserts'; });
  var later = A.today.filter(function (x) { return !x.marked && x.reading === 'later'; });
  var quotes = A.today.filter(function (x) { return !x.marked && x.reading === 'quotes'; });
  var marked = A.today.filter(function (x) { return x.marked; });
  var built = Date.parse(P.built + 'T00:00:00Z') / 1000;
  st.push({ t: Math.max(built, st[st.length - 1].t), k: 'today', today: true,
    what: '<b>Today</b>: ' + (asserting.length ? asserting.length + ' page' + (asserting.length === 1 ? '' : 's') + ' a visitor meets still assert' + (asserting.length === 1 ? 's' : '') + ' it. ' : 'no page a visitor meets asserts it. ') + marked.length +
      ' carry the correction beside it' + (later.length ? ', ' + later.length + ' correct it further on the same page, a notice in its own place' : '') + (quotes.length ? ', and ' + quotes.length + ' quote' + (quotes.length === 1 ? 's' : '') + ' it as corrected' : '') + '.',
    ref: null, line: null, pages: A.today });

  var T0 = st[0].t, T1 = st[st.length - 1].t;
  var noteSt = st.filter(function (s) { return s.k === 'note'; })[0];
  var noteOffer = (X.offers || []).filter(function (o) { return o.note; })[0];
  var askAfterNote = noteSt && noteOffer ? st.filter(function (s) { return s.k === 'ask' && s.offer === noteOffer.id; })[0] : null;
  var reachAfterAsk = askAfterNote ? st.filter(function (s) { return s.k === 'reach' && s.offer === askAfterNote.offer; })[0] : null;
  $('wintro').innerHTML = 'Case A, the five firms’ rise since 2022. It said “' + esc(A.old) + '”; the correction: ' + esc(A.new) + '. ' + st.length +
    ' stations over ' + since(T1, T0) + '. Step through them, or choose one.';

  // the time line
  var svg = $('wline'), L = 14, R = 346, Y = 30;
  function x(t) { return L + (t - T0) / (T1 - T0) * (R - L); }
  el('line', { x1: L, x2: R, y1: Y, y2: Y, 'class': 'base' }, svg);
  var past = el('line', { x1: L, x2: L, y1: Y, y2: Y, 'class': 'past' }, svg);
  st.forEach(function (s) {
    el('line', { x1: x(s.t), x2: x(s.t), y1: Y - 8, y2: Y + 8, 'class': 'tick' + (s.k === 'corr' ? ' corr' : s.k === 'note' ? ' corr note' : '') }, svg);
  });
  var d0 = new Date(T0 * 1000), d1 = new Date(T1 * 1000);
  var l0 = el('text', { x: L, y: Y + 22 }, svg); l0.textContent = d0.getUTCDate() + ' Nov';
  var l1 = el('text', { x: R, y: Y + 22, 'text-anchor': 'end' }, svg); l1.textContent = d1.getUTCDate() + ' Nov';
  var here = el('circle', { cx: L, cy: Y, r: 4.5, 'class': 'here' }, svg);
  var hereT = el('text', { x: L, y: Y - 12, 'text-anchor': 'middle' }, svg);

  var ol = $('walk');
  ol.innerHTML = st.map(function (s, i) {
    var extra = '';
    if (s.today) {
      extra = '<span class="line">' + s.pages.map(function (p) {
        return page(p.repo, p.path) + ' <span class="mono">' + p.reading + '</span>';
      }).join('; ') + '.</span>';
    } else {
      extra = '<span class="line">' + (s.line ? '“…' + esc(s.line) + '…” ' : '') + (s.ref ? s.ref : '') + '</span>';
    }
    return '<li data-i="' + i + '" class="' + (s.k === 'corr' || s.k === 'note' ? 'corr' : '') + '"><span class="when">' + (s.today ? esc(P.built) + ', the presentation' : day(s.t)) + (i && !s.today ? ' · ' + since(s.t, T0) + ' after it was first written' : '') + '</span><span class="what">' + s.what + '</span>' + extra + '</li>';
  }).join('');
  var items = ol.querySelectorAll('li'), cur = 0;
  function go(i) {
    cur = Math.max(0, Math.min(st.length - 1, i));
    Array.prototype.forEach.call(items, function (li, j) {
      li.classList.toggle('on', j === cur);
      li.classList.toggle('done', j < cur);
    });
    var xx = x(st[cur].t);
    here.setAttribute('cx', xx); past.setAttribute('x2', xx);
    hereT.setAttribute('x', Math.max(L + 10, Math.min(R - 10, xx)));
    hereT.textContent = String(cur + 1);
    $('wpos').textContent = 'station ' + (cur + 1) + ' of ' + st.length;
    $('wprev').disabled = cur === 0; $('wnext').disabled = cur === st.length - 1;
  }
  Array.prototype.forEach.call(items, function (li) { li.addEventListener('click', function () { go(+li.getAttribute('data-i')); }); });
  $('wprev').addEventListener('click', function () { go(cur - 1); });
  $('wnext').addEventListener('click', function () { go(cur + 1); });
  go(0);
  window.WALK = { stations: st.map(function (s) { return { t: s.t, k: s.k }; }) };

  // ------------------------------------------------------------------ section V: the figures of the answer
  var D = X.deeds, F = X.field93, KS = K.signer;
  var N = { deeds_read: D.read, only_arch: D.only_architect, with_arch: D.with_architect, personas: D.only_personas,
    same_arch: KS.same_architect, same: KS.same_signer, f_all: F.findings, f_house: F.by_source.house };
  Array.prototype.forEach.call(document.querySelectorAll('[data-x]'), function (e) { e.textContent = N[e.getAttribute('data-x')]; });
  var lead = F.s54.lead, m = lead.match(/readable without the model that did it/);
  $('f93').innerHTML = 'The Field’s reading 93 (' + link('field-research', F.at) + ') finds that ' + F.by_source.house + ' of the programme’s ' + F.findings +
    ' findings of steps 1 to 5 rest on this house’s own Git and log, more than on any record a law requires. One of them holds that the deeds stand in Git “' + esc(m ? m[0] : '') +
    '”, and the Field reads it as carried by a signal that asks a deployer to record an agent’s actions and the humans’ interventions (' + esc(F.s54.carried.join(', ')) +
    '): a record that would say whether a machine or a person acted. Read for the name, the record it rests on says the person. Of the ' + D.read + ' deeds whose commits this work reads, ' +
    D.only_architect + ' stand under the architect’s name alone and ' + (D.with_architect - D.only_architect) + ' more with it; ' + D.only_personas +
    ' stand only under a practice’s name. That a machine did them stands in the log’s sentence, which the house writes when the answer is decided (section I), and nowhere in Git.';

  // ------------------------------------------------------------------ what it holds, section IV's half
  var AD = S.addressed || [];
  var reachedAll = P.cases.filter(function (c) { return !c.in_time && c.correction_unit === 'middle:state:0'; }).every(function (c) { return (c.reached || []).length > 0; });
  $('holds-iv').innerHTML = 'The programme’s three later corrections reached its state, the record the plan asks a stranger to read, and for ' +
    S.days_unreached + ' days none of the works that held the claims. ' + (reachedAll ? 'Each reached its work only once it was addressed to the work’s makers, and then by their next session; ' : '') +
    (noteSt && askAfterNote ? 'the one note the state addressed to no one stood ' + since(askAfterNote.t, noteSt.t) + ', until this practice addressed it, and ' + (reachAfterAsk ? 'the Studio marked its work ' + since(reachAfterAsk.t, askAfterNote.t) + ' later. ' : 'it waits. ') : '') +
    (S.pages_asserting_today ? 'Today ' + S.pages_asserting_today + ' page' + (S.pages_asserting_today === 1 ? '' : 's') + ' a visitor meets still assert' + (S.pages_asserting_today === 1 ? 's' : '') + ' a corrected claim of these cases (section IV).' : 'Today no page a visitor meets asserts a corrected claim of these cases (section IV).');
  $('holds-who').innerHTML = 'For the step’s clause, whether a machine or a person acted: this house’s Git keeps every deed of its machines it holds and the name that answers for it, ' +
    D.only_architect + ' of ' + D.read + ' under the architect’s alone; that a machine acted stands only in the log, a sentence the house writes once it has answered.';
})();
