// Until Another Hand, states 1 and 3. Every number below is read from data/window.js, data/clocks.js, data/sources.js and
// data/check.js, which build.py, sources.py and check.py write; nothing here is typed in as a figure.
(function () {
  'use strict';
  var W = window.WINDOW, C = window.CLOCKS, S = window.SOURCES, R = W.results, K = window.CHECK, KS = K.signer, KR = K.reverts;
  var NS = 'http://www.w3.org/2000/svg';
  var DRAWN = ['mended inside the window', 'mended after the window closed', 'unmended, window open at head', 'unmended, window closed'];
  var D = W.deeds.filter(function (r) { return DRAWN.indexOf(r.state) >= 0; });
  var mended = D.filter(function (r) { return r.repair_hours != null; });
  var inside = mended.filter(function (r) { return r.state === 'mended inside the window'; });
  var after = mended.filter(function (r) { return r.state === 'mended after the window closed'; });
  var closed = D.filter(function (r) { return r.closed_hours != null; });

  function $(id) { return document.getElementById(id); }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function median(a) {
    var s = a.slice().sort(function (x, y) { return x - y; }), n = s.length;
    return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
  }
  function one(x) { return (Math.round(x * 10) / 10).toFixed(1); }
  function dur(h) {
    var a = Math.abs(h);
    if (a < 1) return Math.round(a * 60) + ' minutes';
    if (a < 48) return one(a) + ' hours';
    return one(a / 24) + ' days';
  }
  function esc(t) { return String(t).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function commit(rc) { return '<a href="https://github.com/frankbueltge/' + rc[0] + '/commit/' + rc[1] + '">' + rc[0] + ' ' + rc[1].slice(0, 7) + '</a>'; }

  var closedMed = median(closed.map(function (r) { return r.closed_hours; }));
  var mendMed = median(mended.map(function (r) { return r.repair_hours; }));
  var knownLate = mended.filter(function (r) { return r.log_hours[1] > r.repair_hours; }).length;
  var closedBeforeLog = closed.filter(function (r) { return r.closed_hours < r.log_hours[0]; }).length;
  var within24 = closed.filter(function (r) { return r.closed_hours <= 24; }).length;
  var others = after.filter(function (r) { return !r.closed_by_mending; });
  var bySigner = {};
  others.forEach(function (r) { bySigner[r.closed_signer] = (bySigner[r.closed_signer] || 0) + 1; });
  var afterClosedMed = median(after.map(function (r) { return r.closed_hours; }));

  // ------------------------------------------------------------------ numbers in prose
  var N = { measured: D.length, one_commit: R.one_commit, landed_after: R.landed_after, closed_median_h: one(closedMed) };
  Array.prototype.forEach.call(document.querySelectorAll('[data-n]'), function (e) { e.textContent = N[e.getAttribute('data-n')]; });

  $('p1').textContent = 'A deed of this house could be undone by one command only until the next commit on the same lines came to rest on it, a median of ' +
    one(closedMed) + ' hours after the deed; ' + KS.same_signer + ' of the ' + KS.by_a_later_commit + ' later commits that closed a window bear the deed’s own name, so the record cannot say whether another hand closed it. Its mending came a median of ' +
    one(mendMed / 24) + ' days after the deed, and only ' + inside.length + ' of ' + mended.length + ' mendings came while a single revert would still have undone it; in ' +
    R.house_commits.toLocaleString('en') + ' commits no revert names its deed, and none of the ' + KR.acts + ' that undo a commit exactly undoes a deed of the log. The log, which writes a deed down when its answer is decided, dates it on the day of its mending, or later, for ' +
    knownLate + ' of ' + mended.length + '. The laws that set clocks for reporting AI incidents start them when the reporter learns of the incident, never at the deed.';

  var steps = [
    [inside.length + ' of ' + mended.length, 'mended in time', 'came while one revert could still undo the deed, without undoing anyone else’s work.'],
    [one(closedMed) + ' h', 'the window', 'median time from a deed to the first later commit that a revert of it would collide with; ' + KS.same_signer + ' of ' + KS.by_a_later_commit + ' such commits bear the deed’s own name.'],
    [knownLate + ' of ' + mended.length, 'the log’s day at the answer', 'deeds the log dates on the day of their mending or later: a decision log writes a deed down when its answer is decided.'],
    [String(KR.sentence), 'reverts that say so', 'in ' + R.house_commits.toLocaleString('en') + ' commits: Git’s own join from an answer to its deed. ' + KR.acts + ' more undo a commit exactly, without it; none undoes a deed of the log.']
  ];
  $('steps').innerHTML = steps.map(function (s) {
    return '<div><span class="w">' + s[1] + '</span><span class="n">' + s[0] + '</span><p>' + s[2] + '</p></div>';
  }).join('');

  // ------------------------------------------------------------------ the lanes
  var svg = $('lanes');
  var PADL = 16, PADR = 16, TOP = 44, LH = 8, WID = 1000;
  var order = D.slice().sort(function (a, b) {
    var ca = a.closed_hours == null ? 1e9 : a.closed_hours, cb = b.closed_hours == null ? 1e9 : b.closed_hours;
    return ca - cb || (a.repair_hours || 0) - (b.repair_hours || 0);
  });
  var H = TOP + order.length * LH + 26;
  svg.setAttribute('viewBox', '0 0 ' + WID + ' ' + H);
  function u(h) { return (h < 0 ? -1 : 1) * Math.log10(1 + Math.abs(h)); }
  var DOM = { deed: [0, u(3000)], log: [-u(3000), u(1500)] };
  var mode = 'deed', law = 0, cur = DOM.deed.slice(), t = 1, from = null, sel = null;
  function x(h, dom) { return PADL + (u(h) - dom[0]) / (dom[1] - dom[0]) * (WID - PADL - PADR); }
  function zero(r, m) { return m === 'log' ? r.log_hours[0] : 0; }

  var defs = el('defs', {}, svg), clip = el('clipPath', { id: 'plot' }, defs);
  el('rect', { x: PADL, y: 0, width: WID - PADL - PADR, height: H }, clip);
  var gAxis = el('g', {}, svg), gLaw = el('g', { 'clip-path': 'url(#plot)' }, svg), gLanes = el('g', { 'clip-path': 'url(#plot)' }, svg);
  var LAW = { 24: '24 hours', 72: '72 hours', 360: '15 days' };
  var lawRect = el('rect', { class: 'law', y: TOP - 6, height: order.length * LH + 10, x: 0, width: 0 }, gLaw);
  var lawText = el('text', { class: 'lawt', y: 26, x: 0 }, svg);
  var rows = order.map(function (r, i) {
    var g = el('g', { class: 'lane', transform: 'translate(0,' + (TOP + i * LH) + ')' }, gLanes);
    var o = {
      r: r,
      log: el('rect', { class: 'logday', y: 0, height: LH - 1 }, g),
      win: el('rect', { class: r.closed_hours == null ? 'win' : 'win', y: 1.6, height: LH - 4.2 }, g),
      aft: el('line', { class: 'after', y1: LH / 2 - .5, y2: LH / 2 - .5 }, g),
      mend: r.repair_hours == null ? null : el('circle', { class: 'mend' + (r.state === 'mended inside the window' ? '' : ' late'), cy: LH / 2 - .5, r: 2.6 }, g),
      hit: el('rect', { class: 'hit', x: 0, y: 0, width: WID, height: LH }, g),
      g: g
    };
    o.hit.addEventListener('click', function () { pick(o); });
    o.hit.addEventListener('mouseenter', function () { if (!sel) show(o.r); });
    return o;
  });
  var selBox = el('rect', { class: 'sel', x: 1, width: WID - 2, height: LH, y: -100 }, svg);

  var TICKS = [[0, '0'], [1, '1 h'], [6, '6 h'], [24, '1 day'], [168, '1 week'], [720, '30 days'], [2160, '90 days']];
  function axis(dom) {
    while (gAxis.firstChild) gAxis.removeChild(gAxis.firstChild);
    var all = [];
    TICKS.forEach(function (tk) { all.push(tk); if (tk[0] > 0) all.push([-tk[0], '−' + tk[1]]); });
    all.forEach(function (tk) {
      var v = u(tk[0]);
      if (v < dom[0] - 1e-9 || v > dom[1] + 1e-9) return;
      var xx = x(tk[0], dom);
      el('line', { class: tk[0] === 0 ? 'zero' : 'grid', x1: xx, x2: xx, y1: TOP - 4, y2: TOP + order.length * LH + 2 }, gAxis);
      var tx = el('text', { x: xx, y: TOP + order.length * LH + 15, 'text-anchor': 'middle' }, gAxis);
      tx.textContent = tk[1];
      var tt = el('text', { x: xx, y: TOP - 10, 'text-anchor': 'middle' }, gAxis);
      tt.textContent = tk[1];
    });
    var cap = el('text', { x: PADL, y: 14 }, gAxis);
    cap.textContent = mode === 'deed' ? 'hours after the deed (log scale)' : 'hours from the start of the day the log wrote the deed down (log scale both ways)';
  }

  function place(o, dom, m) {
    var r = o.r, z = zero(r, m);
    var x0 = x(0 - z, dom), xc = r.closed_hours == null ? WID - PADR : x(r.closed_hours - z, dom);
    o.log.setAttribute('x', x(r.log_hours[0] - z, dom));
    o.log.setAttribute('width', Math.max(1, x(r.log_hours[1] - z, dom) - x(r.log_hours[0] - z, dom)));
    o.win.setAttribute('x', Math.min(x0, xc));
    o.win.setAttribute('width', Math.max(1.2, Math.abs(xc - x0)));
    if (r.repair_hours != null) {
      var xm = x(r.repair_hours - z, dom);
      o.mend.setAttribute('cx', xm);
      o.aft.setAttribute('x1', xc); o.aft.setAttribute('x2', r.closed_hours != null && r.closed_hours < r.repair_hours ? xm : xc);
    } else {
      o.aft.setAttribute('x1', xc); o.aft.setAttribute('x2', r.closed_hours == null ? xc : WID - PADR);
    }
  }
  function lerp(a, b, k) { return [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k]; }
  function draw() {
    axis(cur);
    rows.forEach(function (o) { place(o, cur, mode); });
    if (law) {
      var a = x(0, cur), b = x(law, cur);
      lawRect.setAttribute('x', a); lawRect.setAttribute('width', b - a);
      lawText.setAttribute('x', b + 4);
      lawText.textContent = LAW[law] + ' from ' + (mode === 'deed' ? 'the deed' : 'the day the log knew');
    } else {
      lawRect.setAttribute('width', 0); lawText.textContent = '';
    }
    say();
  }
  // switching where the clock starts: lanes slide from one zero to the other
  function animate(to) {
    var start = null, a = DOM[mode === 'deed' ? 'log' : 'deed'], b = DOM[mode];
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function frame(ts) {
      if (start === null) start = ts;
      var k = reduce ? 1 : Math.min(1, (ts - start) / 650);
      var e = k < .5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
      cur = lerp(a, b, e);
      axis(cur);
      rows.forEach(function (o) {
        var r = o.r, zl = r.log_hours[0], z = to === 'log' ? zl * e : zl * (1 - e);
        var dz = z;
        var xs = function (h) { return x(h - dz, cur); };
        var xc = r.closed_hours == null ? WID - PADR : xs(r.closed_hours);
        o.log.setAttribute('x', xs(r.log_hours[0])); o.log.setAttribute('width', Math.max(1, xs(r.log_hours[1]) - xs(r.log_hours[0])));
        o.win.setAttribute('x', Math.min(xs(0), xc)); o.win.setAttribute('width', Math.max(1.2, Math.abs(xc - xs(0))));
        if (o.mend) { o.mend.setAttribute('cx', xs(r.repair_hours)); o.aft.setAttribute('x1', xc); o.aft.setAttribute('x2', r.closed_hours < r.repair_hours ? xs(r.repair_hours) : xc); }
      });
      if (k < 1) requestAnimationFrame(frame); else draw();
    }
    requestAnimationFrame(frame);
  }

  function say() {
    var s;
    if (mode === 'deed') {
      s = 'Counted from the deed, the window closed a median of <b>' + one(closedMed) + ' hours</b> after it, within a day for ' + within24 + ' of ' + closed.length +
        ', and the mending came a median of <b>' + one(mendMed / 24) + ' days</b> after it: ' + inside.length + ' of ' + mended.length +
        ' mendings came while one revert would still have undone the deed.';
      if (law) {
        var m = mended.filter(function (r) { return r.repair_hours <= law; }).length;
        var c = closed.filter(function (r) { return r.closed_hours <= law; }).length;
        s += ' A clock of ' + LAW[law] + ' from the deed would find ' + m + ' of ' + mended.length + ' mendings in time; by its end ' + c + ' of ' + closed.length + ' windows had closed.';
      }
    } else {
      var before = mended.filter(function (r) { return r.repair_hours < r.log_hours[0]; }).length;
      s = 'Counted from the start of the day the log wrote the deed down, ' + closedBeforeLog + ' of ' + closed.length +
        ' windows had closed <b>before the clock began</b>, and ' + knownLate + ' of ' + mended.length + ' mendings came by the end of that day, ' + before + ' of them before it.';
      if (law) {
        var m2 = mended.filter(function (r) { return r.repair_hours - r.log_hours[0] <= law; }).length;
        s += ' A clock of ' + LAW[law] + ' from that day would find <b>' + m2 + ' of ' + mended.length + '</b> mendings in time.';
      }
    }
    $('say').innerHTML = s;
  }

  function show(r) {
    var h = '<p class="meta">Log row ' + r.row + ', deed ' + r.n + ' · ' + (r.kind === 'authority' ? 'an act of authority' : 'a fault') + ', ' + r.relation +
      ' an instruction · who saw it first, as the Field codes the row: ' + esc(r.seer) + '</p>';
    h += '<p>' + esc(r.deed_line) + ' <span class="note">(the Field’s paraphrase of the log’s row)</span></p>';
    h += '<div class="nums"><span>deed <b>' + r.deed_time.replace('T', ' ') + '</b></span>';
    h += '<span>window <b>' + (r.closed_hours == null ? 'still open' : dur(r.closed_hours)) + '</b></span>';
    h += '<span>mending <b>' + (r.repair_hours == null ? 'none' : dur(r.repair_hours)) + '</b></span>';
    h += '<span>the log’s day <b>' + r.log_date + '</b></span></div>';
    var p = 'The deed: ' + r.commits.map(commit).join(', ') + '. ';
    if (r.closed_hours == null) p += 'No later commit on the main line collides with a revert of it: one command could still undo it today.';
    else if (r.closed_by_mending) p += 'Its window ran until its own mending, ' + commit(r.closed_by) + '.';
    else p += 'Its window closed at ' + commit(r.closed_by) + ', under ' + esc(r.closed_signer) + ', in ' + esc((r.closed_paths || []).join(', ')) + '.';
    if (r.repair) p += ' Mended by ' + commit(r.repair) + (r.state === 'mended inside the window' ? ', while a revert would still have applied.' : ', after the window had closed: by then undoing the deed meant undoing that later work too.');
    h += '<p>' + p + '</p>';
    $('det').innerHTML = h;
  }
  function pick(o) {
    sel = o;
    selBox.setAttribute('y', TOP + rows.indexOf(o) * LH);
    show(o.r);
  }

  Array.prototype.forEach.call(document.querySelectorAll('[data-zero]'), function (b) {
    b.addEventListener('click', function () {
      var to = b.getAttribute('data-zero');
      if (to === mode) return;
      Array.prototype.forEach.call(document.querySelectorAll('[data-zero]'), function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      mode = to;
      animate(to);
    });
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-law]'), function (b) {
    b.addEventListener('click', function () {
      Array.prototype.forEach.call(document.querySelectorAll('[data-law]'), function (c) { c.setAttribute('aria-pressed', String(c === b)); });
      law = +b.getAttribute('data-law');
      draw();
    });
  });
  draw();

  // ------------------------------------------------------------------ II. the answer the tool would join
  var sig = Object.keys(bySigner).sort(function (a, b) { return bySigner[b] - bySigner[a]; }).map(function (k) { return bySigner[k] + ' under ' + k; });
  var site = KR.list.filter(function (a) { return a.repo === 'frankbueltge.de'; }), nightly = KR.list.filter(function (a) { return a.repo === 'error-as-method'; });
  var mins = nightly.map(function (a) { return a.minutes; });
  var said = KR.list.filter(function (a) { return a.subject_says; });
  var j = '<p>A revert is the one answer whose record joins itself to its deed without anyone’s word: Git writes the sentence <span class="mono">This reverts commit</span> with the deed’s hash. In the ' +
    R.house_commits.toLocaleString('en') + ' commits of the house’s seven repositories that sentence stands <b>' + KR.sentence + '</b> times. Counted as an act, the house did undo: <b>' + KR.acts +
    '</b> commits change back, path by path, exactly what an earlier commit changed. ' + nightly.length + ' of them stand in the nightly line’s repository, where a feedback file of its landing workflow was written and taken out again under one name within ' +
    Math.round(Math.min.apply(null, mins)) + ' to ' + Math.round(Math.max.apply(null, mins)) + ' minutes; ' + site.length + ' in the site’s, ' + site.map(function (a) {
      return commit([a.repo, a.undo]) + ' (“' + esc(a.undo_subject.split(' — ')[0].split(' (')[0]) + '”, ' + Math.round(a.minutes) + ' minutes after ' + commit([a.repo, a.deed]) + ')';
    }).join(', ') + '. ' + said.length + ' of the ' + KR.acts + ' says in its subject that it reverts, and none names the commit it undoes, so Git joins none of them to its deed. None undoes a deed of the log: every mending here was a new deed.</p>';
  var byMend = after.length - others.length;
  j += '<p>For ' + inside.length + ' of the ' + mended.length + ' mendings the revert would still have applied; ' + inside.filter(function (r) { return r.closed_by_mending; }).length +
    ' of these mendings were themselves the commit that closed the window. For the other ' + after.length + ' the window had been closed a median of ' + one(afterClosedMed) + ' hours after the deed' +
    (byMend ? ', ' + byMend + ' times by the mending and ' + others.length + ' times by a later commit: ' : ' by a later commit: ') + sig.join(', ') +
    '. From then on, to undo the deed is to undo that later work as well, and what is left is a repair, which Git joins to its deed from the repair\u2019s end only (<a href="https://github.com/frankbueltge/ulysses/tree/main/artifacts/cycle-017/on-its-own-account"><i>On Its Own Account</i></a>, state 5).</p>';
  j += '<p><b>Whose hand.</b> Of all ' + KS.by_a_later_commit + ' windows a later commit closed, <b>' + KS.same_signer + '</b> closed under one of the deed’s own Git names and addresses (' +
    Object.keys(KS.same_by_name).sort(function (a, b) { return KS.same_by_name[b] - KS.same_by_name[a]; }).map(function (k) { return KS.same_by_name[k] + ' ' + (k === 'Frank Bültge' ? 'under the architect’s name' : 'as ' + esc(k)); }).join(', ') +
    '), ' + KS.same_within_1h + ' of them within the hour; ' + KS.other_signer + ' under another name. Under the architect’s name sign both he and the sessions that work for him, and the Field’s study 87 found deed after deed of the log standing under that name with nothing outside the log to say whether a session made it (<a href="https://github.com/frankbueltge/field-research/blob/main/artifacts/cycle-017/what-the-house-did-unasked/commits87.json">commits87.json</a>). So the record cannot tell a second hand from the same hand returning. What closes the window is the next deed on the deed’s lines, whoever made it; the title keeps the question the record leaves open, and the step’s clause, whether a machine or a person acted, cannot be read here from the name.</p>';
  var FQ = K.field_question.classes, fqAt = (FQ['a later write over the deed\u2019s lines, which closed the window'] || 0) + (FQ['the mending, which closed the window'] || 0);
  var fqBefore = (FQ['the window closed first, at a commit that rewrote none of the deed\u2019s lines'] || 0) + (FQ['the mending, after it'] || 0);
  j += '<p><b>A clock of reading?</b> The Field asked whether the window is a clock of reading as much as of undoing, since in ' + K.field_question.field_hours_at + ' of the ' + K.field_question.pairs + ' deeds it carried the house’s earliest later trace was the commit that closed the window. Compared by commit rather than by hours (the Field’s first-hand hours ran from a deed’s last commit, this work’s from its first, which differ for ' + K.field_question.two_zeros +
    ' of the ' + K.field_question.pairs + '), the earliest trace is the closing commit in <b>' + fqAt + '</b>: ' + FQ['a later write over the deed\u2019s lines, which closed the window'] + ' times the first later commit that rewrote a line the deed wrote, ' + FQ['the mending, which closed the window'] +
    ' times the mending itself. Before ' + fqBefore + ' more the window had closed at a commit that rewrote none of the deed’s lines; the Field’s own check of 23 November reads the same. So it is not a clock of reading. Where the two meet they are one event, the first write over the deed: Git shows a reading only when it writes, and a reading that writes over a deed’s lines is the one that ends its clean undo. A reader who only sees, the reader the step asks who is placed to be, writes nothing, and no window clocks them.</p>';
  j += '<p>The ' + inside.length + ' mendings that came in time:</p><ul class="ins">' + inside.slice().sort(function (a, b) { return a.repair_hours - b.repair_hours; }).map(function (r) {
    return '<li>' + esc(r.deed_line) + ' <span class="note">mended after ' + dur(r.repair_hours) + ' by ' + commit(r.repair) + '</span></li>';
  }).join('') + '</ul>';
  var open = D.filter(function (r) { return r.state === 'unmended, window open at head'; });
  if (open.length) j += '<p>' + open.length + ' deeds were never mended and no later commit collides with their revert: one command could still undo them today.</p>';
  $('joined').innerHTML = j;

  // ------------------------------------------------------------------ III. the law's clocks
  var aw = C.clocks.filter(function (c) { return c.clock === 'awareness'; }), none = C.clocks.filter(function (c) { return c.clock === 'none'; });
  var words = function (list) { return list.filter(function (c) { return c.words; }).map(function (c) { return '“' + c.words + '”'; }).join(', '); };
  var lawN = C.clocks.filter(function (c) { return c.binding === 'law'; }), volN = C.clocks.filter(function (c) { return c.binding !== 'law'; });
  var lawAw = lawN.filter(function (c) { return c.clock === 'awareness'; }).length, lawNone = lawN.filter(function (c) { return c.clock === 'none'; });
  var L = '<p>The Field’s study 90 codes ' + C.signals + ' signals that eleven public instruments set up. ' + C.clocks.length + ' of them are set off by an event and carry a deadline or a call for speed: ' + lawN.length + ' set by law and ' + volN.length + ' by voluntary codes. ' +
    aw.length + ' count from the reporter’s knowing (' + words(aw) + '); ' + none.length + ' give no point to count from at all (' + words(none) + '). Of the ' + lawN.length + ' in law, ' + lawAw + ' count from knowing and ' + lawNone.length + ', the ' + lawNone.map(function (c) { return esc(c.instrument); }).join(', ') + '’s, names no start. None counts from the event, and none asks whether what was done can still be undone. The Field’s blind second coding (check 92, 23 November) kept the clock of all seven; it differed on whether three of them are set off by harm or by an event short of it, which moves none of them out of this table.</p>';
  L += '<p>The Field asked this practice whether, then, “in time” is a property of the event or of its reporter. In this house the dated record of knowing is the log, a decision log, and it dates the knowing on the day of the mending or later for ' + knownLate + ' of ' + mended.length +
    ' deeds, as its genre makes it do. A clock that runs from the reporter’s knowing, read from the reporter’s own record, finds every answer prompt. So by these texts “in time” belongs to the reporter’s account. What they leave unclocked is the stretch between the deed and that account, and that is where, in this house, the window closed: for ' + closedBeforeLog + ' of ' + closed.length + ' deeds before the log’s day began.</p>';
  $('lawtext').innerHTML = L;
  function dl(c) {
    if (c.deadline_h === 'prompt') return 'no number';
    var f = function (h) { return h <= 72 ? h + ' hours' : Math.round(h / 24) + ' days'; };
    return c.deadline_max_h ? Math.round(c.deadline_h / 24) + ' to ' + f(c.deadline_max_h) : f(c.deadline_h);
  }
  function marked(c) {
    var q = esc(c.quote);
    return c.words ? q.replace(esc(c.words), '<mark>' + esc(c.words) + '</mark>') : q;
  }
  var T = '<tr><th>signal</th><th>deadline</th><th>counts from</th><th>the passage, as the Field quotes it</th><th>first reader</th></tr>';
  T += C.clocks.map(function (c) {
    return '<tr><td class="k">' + c.id + '<br>' + esc(c.instrument) + '<br>' + c.binding + '</td><td class="k">' + dl(c) + '</td><td class="k">' +
      (c.clock === 'awareness' ? 'the reporter’s knowing' : 'nothing stated') + '</td><td><q>' + marked(c) + '</q> <span class="note">' + esc(c.ref) + '</span></td><td>' + esc(c.receiver) + (c.public === 'public' ? '' : ' <span class="note">(' + c.public + ')</span>') + '</td></tr>';
  }).join('');
  $('clk').innerHTML = T;

  // ------------------------------------------------------------------ IV. quotations and sources
  var P = {};
  S.forEach(function (s) { s.passages.forEach(function (p, i) { P[s.id + (i + 1)] = p.text; }); });
  Array.prototype.forEach.call(document.querySelectorAll('q[id^="q-"]'), function (q) { q.textContent = P[q.id.slice(2)] || '[missing]'; });
  $('sources').innerHTML = '<p>' + S.map(function (s) {
    return esc(s.cite) + ', <a href="' + s.url + '">' + s.url.replace(/^https:\/\//, '') + '</a>; read ' + esc(s.read) + (s.sha256 ? '; sha256 ' + s.sha256.slice(0, 16) + '…' : '') + '.';
  }).join('</p><p>') + '</p><p>The Field’s study 90 at field-research <span class="mono">' + C.field_at.slice(0, 7) + '</span> (<a href="https://github.com/frankbueltge/field-research/tree/' + C.field_at +
    '/artifacts/cycle-018/told-in-time">told-in-time/signals90.json</a>), offered to this practice with its question on 22 November. The house’s deeds: <a href="https://github.com/frankbueltge/ulysses/blob/' + W.sort_at +
    '/artifacts/cycle-017/on-its-own-account/data/sort.json">sort.json</a> at ulysses ' + W.sort_at.slice(0, 7) + ', from the Field’s study 85. The histories: full clones of seven repositories of the house, heads ' +
    Object.keys(R.heads).map(function (k) { return k + ' ' + R.heads[k].slice(0, 7); }).join(', ') + ' (sections I and II, and the check of them). For the Field’s question in section II, its house91.json at field-research ' + K.field_question.at.slice(0, 7) +
    ' and its check 92 at <a href="https://github.com/frankbueltge/field-research/commit/809bab980be2ac8eb60a307b593b8c030e65321b">field-research 809bab9</a>. Passages and hashes in <a href="sources.json">sources.json</a>; the texts themselves are not copied here.</p>';
})();
