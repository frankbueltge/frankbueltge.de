// On Its Own Account: the strip, the version panel, your browser's count, the cards. No library.
(function () {
  'use strict';
  var D = window.DIGEST, K = window.DEEDS, F = D.figures, CAP = D.cap;
  var V = D.versions, N = V.length, byH = {};
  V.forEach(function (v) { byH[v.h] = v; });
  var GH = 'https://github.com/frankbueltge/ulysses/';
  var NS = 'http://www.w3.org/2000/svg';
  function el(n, a, p) { var e = document.createElementNS(NS, n); for (var k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; }
  function h(t, a, txt) { var e = document.createElement(t); if (a) for (var k in a) e.setAttribute(k, a[k]); if (txt != null) e.textContent = txt; return e; }
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ','); }
  function day(s) { return s.slice(0, 10); }
  function hm(s) { return s.slice(11, 16); }
  document.getElementById('counter').textContent = D.counter.call + ', ICU ' + D.counter.icu + ', Unicode ' + D.counter.unicode + '; again in ' + D.browser.name;

  // —— which versions each reading lights
  var reports = D.reports, runs = D.runs;
  var offAbout = {}, seenV = {}, unseenV = {}, missedV = {}, fieldV = {}, repBy = {};
  reports.forEach(function (r) { (repBy[r.about] = repBy[r.about] || []).push(r); if (!r.agree) offAbout[r.about] = true; });
  runs.forEach(function (r) { r.versions.forEach(function (x) { if (r.status === 'seen') seenV[x] = r; else if (r.status === 'missed') missedV[x] = r; else unseenV[x] = r; }); });
  D.outside.forEach(function (o) { fieldV[o.about] = o; });
  var runOf = {}; runs.forEach(function (r) { r.versions.forEach(function (x) { runOf[x] = r; }); });

  // —— geometry
  var X0 = 46, X1 = 988, LO = 2250, HI = 2650, YT = 40, YB = 252;
  var step = (X1 - X0) / (N - 1);
  function x(i) { return X0 + i * step; }
  function y(n) { var c = Math.max(LO, Math.min(HI, n)); return YB - (c - LO) / (HI - LO) * (YB - YT); }
  var svg = document.getElementById('strip');
  var iDecl = V.findIndex(function (v) { return v.after; });
  el('rect', { x: X0 - step / 2, y: YT - 6, width: x(iDecl) - X0, height: YB - YT + 6, class: 'before' }, svg);
  var tb = el('text', { x: X0 + 2, y: YT + 6 }, svg); tb.textContent = 'before the rule';
  [2300, 2400, 2500, 2600].forEach(function (g) {
    el('line', { x1: X0 - 6, x2: X1 + 4, y1: y(g), y2: y(g), class: g === CAP ? 'cap' : 'grid' }, svg);
    var t = el('text', { x: X0 - 8, y: y(g) + 3, 'text-anchor': 'end' }, svg); t.textContent = g === CAP ? 'cap' : fmt(g);
  });
  var tc = el('text', { x: X1 + 4, y: y(CAP) - 4, 'text-anchor': 'end' }, svg); tc.textContent = '2,500 words';
  // a month's label at its first version; where two months start too close, the later keeps its label
  var lastMonth = '', lastX = -1e9, lastT = null;
  V.forEach(function (v, i) {
    var m = v.date.slice(0, 7);
    if (m === lastMonth) return;
    lastMonth = m;
    if (lastT && x(i) - lastX < 56) lastT.remove();
    el('line', { x1: x(i), x2: x(i), y1: YB, y2: YB + 5, class: 'grid' }, svg);
    lastT = el('text', { x: x(i) + 2, y: YB + 15 }, svg); lastX = x(i);
    lastT.textContent = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][+m.slice(5) - 1] + ' ' + m.slice(0, 4);
  });
  // runs over the cap, and who wrote them down
  var gRuns = el('g', {}, svg);
  runs.forEach(function (r) {
    var a = byH[r.versions[0]].i, b = byH[r.versions[r.versions.length - 1]].i;
    var g = el('g', { class: 'rg', 'data-run': r.k, 'data-status': r.status }, gRuns);
    el('path', { d: 'M' + (x(a) - 3) + ' 28 V22 H' + (x(b) + 3) + ' V28', class: 'run ' + r.status }, g);
    if (r.status === 'seen') {
      var back = byH[r.back_under];
      el('line', { x1: x(b) + 3, x2: x(back.i), y1: 22, y2: 22, class: 'run unseen' }, g);
      el('circle', { cx: x(back.i), cy: 22, r: 3.4, class: 'eye' }, g);
    }
  });
  D.outside.forEach(function (o) { var v = byH[o.about]; el('circle', { cx: x(v.i), cy: 11, r: 3.4, class: 'eye field', 'data-field': 1 }, gRuns); });
  var tr = el('text', { x: X0 - 8, y: 25, 'text-anchor': 'end' }, svg); tr.textContent = 'over';
  // the versions
  var gV = el('g', {}, svg), groups = [];
  V.forEach(function (v, i) {
    var g = el('g', { class: 'v', 'data-i': i }, gV);
    el('line', { x1: x(i), x2: x(i), y1: YB, y2: y(v.n), class: 'stem' + (v.over ? ' over' : '') }, g);
    el('circle', { cx: x(i), cy: y(v.n), r: 2.4, class: 'dot' + (v.over ? ' over' : '') }, g);
    (repBy[v.h] || []).forEach(function (r) {
      if (r.figure == null) return;
      el('line', { x1: x(i) - 5, x2: x(i) + 5, y1: y(r.figure), y2: y(r.figure), class: 'tick' + (r.agree ? '' : ' off'), 'data-r': r.id }, g);
    });
    groups.push(g);
  });
  // the sealed band: what the sessions saw while they worked
  el('rect', { x: X0 - step / 2, y: 284, width: X1 - X0 + step, height: 30, class: 'seal' }, svg);
  var ts = el('text', { x: X0 + 8, y: 303, class: 'sealt' }, svg); ts.textContent = 'the sessions themselves: what each saw while it worked, kept by the platform that ran it, not public';
  var sel = el('line', { x1: 0, x2: 0, y1: YT - 8, y2: YB, class: 'sel' }, svg);
  var rings = el('g', {}, svg);
  // hit areas
  var gHit = el('g', {}, svg);
  V.forEach(function (v, i) { el('rect', { x: x(i) - step / 2, y: 0, width: step, height: 280, class: 'hit', 'data-i': i }, gHit); });
  gHit.addEventListener('click', function (e) { var i = e.target.getAttribute('data-i'); if (i != null) choose(+i); });

  // —— readings
  var say = document.getElementById('say');
  var SAY = {
    over: '<b>' + F.over_after + '</b> of ' + F.versions_after + ' versions since the rule was declared stood over 2,500 words by it, in ' + F.runs + ' runs; the longest ran ' + Math.max.apply(null, runs.map(function (r) { return r.versions.length; })) + ' versions, the highest version counted ' + fmt(F.max_after) + '. Every run came back under.',
    off: '<b>' + F.off_side + '</b> of ' + F.end_reports + ' sentences in which a session gave its own count said "under" of a file that was over, by ' + F.off_min_gap + ' to ' + F.off_max_gap + ' words: ' + F.off_standin + ' had counted with a stand-in, ' + F.off_unstated + ' named no counter. One more session found its predecessor\'s file at "about 2,490" when the rule counts 2,576.',
    seen: 'In <b>' + F.runs_seen + '</b> of ' + F.runs + ' runs the next session counted the file at open by the declared rule, wrote down that it stood over, and trimmed it. Each time the one who saw was a later session of this practice, which had not done the deed.',
    unseen: 'In <b>' + F.runs_unseen + '</b> of ' + F.runs + ' runs no sentence of this practice says the file stood over; it came back under all the same, trimmed for room. ' + F.silent_over_versions + ' of the ' + F.over_after + ' versions over the cap are named by no sentence at all.',
    field: 'The Field\'s census of 2026-11-19 marks <b>' + F.field_over + '</b> version of this digest over the cap, by its own reading of a word (' + fmt(F.field_value) + '; the declared rule counts ' + fmt(F.field_n) + '). A session of this practice had written the same version down eleven days earlier.'
  };
  var lit = null;
  function light(k) {
    lit = lit === k ? null : k;
    document.querySelectorAll('.ask button').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-l') === lit)); });
    groups.forEach(function (g, i) {
      var v = V[i], on = !lit || (lit === 'over' && v.after && v.over) || (lit === 'off' && offAbout[v.h]) || (lit === 'seen' && seenV[v.h]) || (lit === 'unseen' && (unseenV[v.h] || missedV[v.h])) || (lit === 'field' && fieldV[v.h]);
      g.classList.toggle('dim', !on);
    });
    gRuns.querySelectorAll('.rg').forEach(function (g) {
      var s = g.getAttribute('data-status');
      var on = !lit || lit === 'over' || (lit === 'seen' && s === 'seen') || (lit === 'unseen' && s !== 'seen') || (lit === 'off' && s === 'missed') || (lit === 'field' && g.getAttribute('data-run') === String(runOf[D.outside[0].about].k));
      g.classList.toggle('dim', !on);
    });
    say.innerHTML = lit ? SAY[lit] : 'Each stem is one version of the digest, as a session committed it. Press a reading, or touch a stem to open its version.';
  }
  document.querySelectorAll('.ask button').forEach(function (b) { b.addEventListener('click', function () { light(b.getAttribute('data-l')); }); });

  // —— the version panel
  var det = document.getElementById('det'), pick = document.getElementById('pick'), txt = document.getElementById('text');
  pick.max = N - 1;
  var live = {}, cur = 0, textOpen = false;
  function choose(i) {
    cur = Math.max(0, Math.min(N - 1, i)); pick.value = cur;
    var v = V[cur];
    sel.setAttribute('x1', x(cur)); sel.setAttribute('x2', x(cur));
    var fig = document.getElementById('fig');
    if (fig.scrollWidth > fig.clientWidth + 1) {
      var px = x(cur) / 1000 * svg.getBoundingClientRect().width;
      if (px < fig.scrollLeft + 24 || px > fig.scrollLeft + fig.clientWidth - 24) fig.scrollLeft = px - fig.clientWidth / 2;
    }
    det.innerHTML = '';
    var meta = h('div', { class: 'meta' });
    meta.appendChild(document.createTextNode('version ' + (cur + 1) + ' of ' + N + ' · ' + day(v.date) + ' ' + hm(v.date) + ' UTC · signed ' + v.author + ' · '));
    var a = h('a', { href: GH + 'commit/' + v.H }, v.h); meta.appendChild(a);
    meta.appendChild(document.createTextNode(v.after ? '' : ' · before the rule was declared'));
    det.appendChild(meta);
    var nums = h('div', { class: 'nums' });
    function num(label, n, cls) { var s = h('span'); var b = h('b', cls ? { class: cls } : null, n == null ? '…' : fmt(n)); s.appendChild(b); s.appendChild(document.createTextNode(' ' + label)); nums.appendChild(s); return b; }
    num('by the declared rule (build)', v.n, v.over ? 'over' : '');
    num('by the same call in ' + D.browser.name.split('.')[0] + ' (build)', v.nb, v.nb > CAP ? 'over' : '');
    num('by your browser', live[v.h], live[v.h] > CAP ? 'over' : '').setAttribute('id', 'livenum');
    num('separated by spaces', v.ws);
    det.appendChild(nums);
    var said = repBy[v.h] || [];
    if (!said.length) det.appendChild(h('p', { class: 'said' }, v.after ? 'No sentence of this practice gives a count for this version.' : 'The rule was not yet declared.'));
    said.forEach(function (r) {
      var p = h('p', { class: 'said' });
      p.appendChild(document.createTextNode((r.kind === 'open' ? 'The session of ' + day(r.date) + ', at open: ' : 'Its own session (' + day(r.date) + '): ')));
      p.appendChild(h('q', null, r.quote));
      p.appendChild(document.createTextNode(' — counted with ' + ({ declared: 'the declared rule', 'stand-in': 'a stand-in', unstated: 'no counter named' })[r.method] + '; ' + (r.agree ? 'right side of the cap' : 'wrong side of the cap') + '. '));
      p.appendChild(h('a', { href: GH + 'blob/' + r.C + '/' + r.file }, r.file));
      if (!r.agree) p.classList.add('over');
      det.appendChild(p);
    });
    var run = runOf[v.h];
    if (run) {
      var t = 'Run ' + run.k + ' of ' + runs.length + ' over the cap (' + run.versions.length + (run.versions.length === 1 ? ' version' : ' versions') + ', up to ' + fmt(run.max) + '). ';
      if (run.status === 'seen') t += 'Written down by the next session, ' + day(run.seen_by[0].date) + '.';
      else if (run.status === 'missed') t += 'The next session counted it with a stand-in and found it under.';
      else t += 'No sentence says it stood over; it came back under on ' + day(run.back_date) + '.';
      if (fieldV[v.h]) t += ' The Field\'s census marks this version over by its own reading (' + fmt(fieldV[v.h].field_value) + ').';
      det.appendChild(h('p', { class: 'said' }, t));
    }
    if (textOpen) showText();
  }
  function showText() {
    var v = V[cur], t = window.TEXTS && window.TEXTS[v.h];
    txt.classList.add('open'); textOpen = true;
    document.getElementById('read').textContent = 'close the text';
    txt.textContent = '';
    if (!t) { txt.textContent = 'The texts are still loading.'; return; }
    if (!window.Intl || !Intl.Segmenter) { txt.textContent = t; return; }
    var seg = new Intl.Segmenter('en', { granularity: 'word' }), n = 0, buf = '', past = 0, first = null;
    var frag = document.createDocumentFragment();
    for (var s of seg.segment(t)) {
      if (s.isWordLike) n++;
      if (s.isWordLike && n > CAP) { if (buf) { frag.appendChild(document.createTextNode(buf)); buf = ''; } var m = h('mark', null, s.segment); frag.appendChild(m); if (!first) first = m; past++; }
      else buf += s.segment;
    }
    if (buf) frag.appendChild(document.createTextNode(buf));
    var head = h('span', { class: 'mono' }, past ? 'Past the 2,500th word, by your browser: ' + past + ' words, marked.\n\n' : 'Inside the cap by your browser: ' + n + ' words.\n\n');
    txt.appendChild(head); txt.appendChild(frag);
    if (first) txt.scrollTop = Math.max(0, first.offsetTop - txt.offsetTop - 60); else txt.scrollTop = 0;
  }
  document.getElementById('read').addEventListener('click', function () {
    if (textOpen) { txt.classList.remove('open'); textOpen = false; this.textContent = 'read this version'; } else showText();
  });
  pick.addEventListener('input', function () { choose(+pick.value); });
  document.getElementById('prev').addEventListener('click', function () { choose(cur - 1); });
  document.getElementById('next').addEventListener('click', function () { choose(cur + 1); });
  svg.addEventListener('keydown', function (e) { if (e.key === 'ArrowLeft') choose(cur - 1); if (e.key === 'ArrowRight') choose(cur + 1); });
  // open on the first version over the cap that nobody wrote down
  choose(byH[runs.filter(function (r) { return r.status === 'unseen'; })[0].versions[0]].i);

  // —— your browser runs the declared rule again
  var liveEl = document.getElementById('live');
  function recount() {
    if (!window.Intl || !Intl.Segmenter) { liveEl.textContent = 'Your browser has no word segmenter, so it cannot run the declared rule; the build\'s counts stand alone.'; return; }
    var seg = new Intl.Segmenter('en', { granularity: 'word' }), i = 0;
    function chunk() {
      for (var k = 0; k < 8 && i < N; k++, i++) {
        var v = V[i], n = 0; for (var s of seg.segment(window.TEXTS[v.h])) if (s.isWordLike) n++;
        live[v.h] = n;
        el('circle', { cx: x(i), cy: y(n), r: 4.4, class: 'ring', 'data-n': n }, rings);
      }
      if (i < N) { liveEl.textContent = 'Your browser is counting: ' + i + ' of ' + N + ' versions.'; setTimeout(chunk, 0); return; }
      var diff = V.filter(function (v) { return live[v.h] !== v.n; });
      var side = V.filter(function (v) { return v.after && (live[v.h] > CAP) !== v.over; });
      var maxd = diff.reduce(function (m, v) { return Math.max(m, Math.abs(live[v.h] - v.n)); }, 0);
      // does this browser break a word at a full stop or a colon between letters, where the default joins it?
      var joint = 0; for (var s of seg.segment('points.md')) if (s.isWordLike) joint++;
      liveEl.textContent = 'Your browser counted all ' + N + ' versions again with its own segmenter: ' + (N - diff.length) + ' agree with the build\'s count' + (diff.length ? ', ' + diff.length + ' differ by up to ' + maxd + ' words, and ' + side.length + ' change side of the cap.' : '.') + ' By your count, ' + V.filter(function (v) { return v.after && live[v.h] > CAP; }).length + ' of ' + F.versions_after + ' versions since the declaration stand over.' + (diff.length && joint > 1 ? ' Your browser takes points.md for ' + joint + ' words; the Unicode default, and the runtime the sessions worked in, take it for one.' : '');
      liveEl.classList.toggle('diff', diff.length > 0);
      liveEl.setAttribute('data-done', '1');
      choose(cur);
    }
    chunk();
  }
  var sc = document.createElement('script');
  sc.src = 'data/texts.js';
  sc.onload = recount;
  sc.onerror = function () { liveEl.textContent = 'The texts did not load, so your browser could not count them.'; };
  document.body.appendChild(sc);

  // —— the cards
  var cards = document.getElementById('cards');
  function dd(dl, label, nodes, cls) { dl.appendChild(h('dt', null, label)); var d = h('dd', cls ? { class: cls } : null); nodes.forEach(function (n) { d.appendChild(typeof n === 'string' ? document.createTextNode(n) : n); }); dl.appendChild(d); return d; }
  function src(q) { var base = q.repo === 'ulysses' ? GH : 'https://github.com/frankbueltge/' + q.repo + '/'; return h('a', { href: q.file === '@message' ? base + 'commit/' + q.commit : base + 'blob/' + q.commit + '/' + q.file }, q.file === '@message' ? 'commit ' + q.commit.slice(0, 7) : q.file.split('/').pop()); }
  K.deeds.forEach(function (d) {
    var c = h('article', { class: 'card', id: d.id });
    c.appendChild(h('div', { class: 'when' }, d.when));
    c.appendChild(h('h3', null, d.title));
    var dl = h('dl');
    var deed = [d.deed];
    if (d.deed_quote) { deed.push(' '); deed.push(h('q', null, d.deed_quote.quote)); deed.push(' '); deed.push(src(d.deed_quote)); }
    dd(dl, 'The deed', deed);
    if (d.own.length) { var o = []; d.own.forEach(function (q, j) { if (j) o.push(' '); o.push(h('q', null, q.quote)); o.push(' '); o.push(src(q)); }); dd(dl, 'Its own account', o); }
    else dd(dl, 'Its own account', [d.own_none]);
    if (d.writer) dd(dl, 'Written by', ['A line of the gate\'s workflow, in the file since 2026-07-18: ', h('code', null, d.writer.quote), ' ', src(d.writer)]);
    var s = d.sighting, sn = [s.who + ', ' + s.date + (s.quotes.length ? ': ' : '.')];
    s.quotes.forEach(function (q, j) { if (j) sn.push(' … '); sn.push(h('q', null, q)); });
    if (s.quotes.length) { sn.push(' '); sn.push(src(s)); }
    dd(dl, 'First seen by', sn);
    if (d.second_sighting) dd(dl, 'Seen again', [d.second_sighting]);
    var ck = [];
    d.checks.forEach(function (k, j) {
      var r = k.result, line = k.claim + ' ';
      if (k.count_of) line += '(the stem "' + k.count_of + '" occurs ' + r + ' times in v4.) ';
      else if (k.quote) { ck.push(line + '(v4, committed ' + k.date + ' in the name of ' + k.author + ': '); ck.push(h('q', null, k.quote)); ck.push(') '); line = ''; }
      else if (k.times_of) line += '(' + r.times.map(function (t) { return t.slice(11, 16); }).join(', ') + ' UTC on ' + r.times[0].slice(0, 10) + ': ' + r.span_minutes + ' minutes from first to last.) ';
      else if (k.after_tick_minutes_max && r) line += '(committed ' + r.log_time.slice(11, 16) + ' UTC, ' + r.minutes_after_third_tick + ' minutes after the third.) ';
      else if (k.field_signature) line += '(' + r + ' in the census\'s records.) ';
      else if (k.gate_commits) line += '(' + r + ' of ' + k.expect + ', ' + k.first + ' to ' + k.last + '.) ';
      if (line) ck.push(line);
    });
    dd(dl, 'What a stranger can check now', ck);
    dd(dl, 'What nobody outside can read', [d.unreadable], d.id === 'd3' ? null : 'sealed');
    dd(dl, 'Reading', [d.verdict], 'verdict');
    c.appendChild(dl);
    cards.appendChild(c);
  });
  var d3 = K.deeds.filter(function (d) { return d.id === 'd3'; })[0];
  document.querySelectorAll('[data-d="d3"]').forEach(function (e) { e.setAttribute('data-expect', d3.checks[1].result); });
})();
