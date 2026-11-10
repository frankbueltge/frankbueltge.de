// Who the Curve Speaks For (studies 56 and 58). Every number on the page is read from data56.js (analyse56.py) and data58.js (analyse58.py).
(function () {
  const D = window.DATA56, P = window.PRED56, D58 = window.DATA58, P58 = window.PRED58;
  let off = 0;   // 0: day 1 is the day after the rise (as counted); 1: day 1 is the rise day
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const MON = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const day = (rec, i) => { const t = new Date(rec.first + 'T00:00:00Z'); t.setUTCDate(t.getUTCDate() + i); return t; };
  const fmt = t => t.getUTCDate() + ' ' + MON[t.getUTCMonth()] + ' ' + t.getUTCFullYear();
  const pct = (k, n) => n ? Math.round(100 * k / n) + ' %' : '–';
  const longQ = rec => rec.quiets.filter(q => (q.L === null ? rec.N - 1 - q.a : q.L) >= 21).sort((x, y) => x.a - y.a || x.z.localeCompare(y.z));
  // status of a quiet at day d, by study 53's own rule; o = 1 reads the rise day as day 1 (study 58)
  function status(rec, q, d, o = off) {
    const e = d - o;
    if (q.L !== null && q.L <= e) return 'gone';
    if (q.a + e + 42 > rec.N - 1) return 'edge';
    return (q.L !== null && q.L <= e + 42) ? 'brk' : 'hld';
  }
  function tally(rec, d, o = off) {
    const c = { gone: 0, edge: 0, brk: 0, hld: 0 };
    for (const q of longQ(rec)) c[status(rec, q, d, o)]++;
    return c;
  }
  let R = 'Congo 2026', d = 42;

  // the answer, from the data
  (function answer() {
    const k = D['Kivu 2018-2020'], c = D['Congo 2026'];
    const p60 = c.quiets.filter(q => status(c, q, 60, 0) === 'brk' || status(c, q, 60, 0) === 'hld');
    const a0 = Math.min(...p60.map(q => q.a)), a1 = Math.max(...p60.map(q => q.a));
    let kFirst = null; for (let x = 21; x <= 120 && kFirst === null; x++) if (tally(k, x, 0).edge > 0) kFirst = x;
    const inK = (q, x) => status(k, q, x, 0) === 'brk' || status(k, q, x, 0) === 'hld';
    const drop = k.quiets.filter(q => inK(q, 42) && !inK(q, 60));
    const dropBroke = drop.filter(q => status(k, q, 60, 0) === 'gone').length, dropEarly = drop.filter(q => q.a < k.p42.medStart).length;
    document.getElementById('ans').innerHTML =
      '<p><b>In Kivu, not at all.</b> Between day 42 and day 60 the record\'s end removes no quiet from the count: all ' + k.p42.n +
      ' quiets counted at day 42 rose early enough to be counted at 60 too. The edge first removes a quiet at day ' + kFirst +
      '. The ' + k.p60.n + ' counted at day 60 even rose later on the median (' + fmt(new Date(k.p60.medStartDate + 'T00:00:00Z')) + ' against ' +
      fmt(new Date(k.p42.medStartDate + 'T00:00:00Z')) + '): of the ' + drop.length + ' that dropped out, ' + dropBroke + ' broke, and ' + dropEarly + ' of them had risen before the median. Between day 42 and day 60 Kivu\'s curve changes by who breaks, not by where the record ends.</p>' +
      '<p><b>In Congo 2026, yes.</b> Of the ' + c.p42.n + ' quiets counted at day 42, ' + c.band.n + ' rose after ' + fmt(day(c, c.cutoff60)) +
      ' and are left out at day 60 by the record\'s end alone; ' + (c.p42.n - c.band.n - c.p60.n) + ' more broke before day 60. The curve at day 60 speaks for ' + c.p60.n +
      ' quiets, whose counts rose between ' + fmt(day(c, a0)) + ' and ' + fmt(day(c, a1)) + '.</p>' +
      '<p><b>Does the edge alone move the 2026 answer?</b> Not measurably. At day 42, ' + c.p42.k + ' of ' + c.p42.n + ' broke (' + pct(c.p42.k, c.p42.n) +
      '); among the ' + c.matched.n + ' that rose early enough to count at 60, ' + c.matched.k + ' of ' + c.matched.n + ' (' + pct(c.matched.k, c.matched.n) +
      '). The gap, ' + String(Math.round(100 * c.gap)).replace('-', '−') + ' points, has an interval from ' + Math.round(100 * c.gapCI[0]) + ' to +' + Math.round(100 * c.gapCI[1]) +
      ': the direction we predicted, too few quiets to tell it from chance.</p>';
  })();

  // Figure 1
  const cal = document.getElementById('cal'), rd = document.getElementById('rd');
  function setup(cv, h) {
    const w = cv.clientWidth, r = window.devicePixelRatio || 1;
    cv.width = w * r; cv.height = h * r; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return [g, w];
  }
  let hover = null;
  function drawCal() {
    const rec = D[R], qs = longQ(rec), N = rec.N;
    const rowH = Math.max(2, Math.min(6, Math.floor(380 / qs.length)));
    const top = 18, h = top + qs.length * rowH + 30;
    const [g, w] = setup(cal, h);
    const L = 8, Rr = w - 8, x = i => L + (Rr - L) * i / (N - 1);
    const latest = N - 1 - d - 42 + off;
    g.fillStyle = css('--shade'); g.fillRect(x(Math.max(0, latest)), top - 6, Rr - x(Math.max(0, latest)), qs.length * rowH + 8);
    g.strokeStyle = css('--edge'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(x(Math.max(0, latest)), top - 8); g.lineTo(x(Math.max(0, latest)), top + qs.length * rowH + 2); g.stroke();
    const col = { gone: css('--gone'), edge: css('--edge'), brk: css('--brk'), hld: css('--hld') };
    qs.forEach((q, i) => {
      const s = status(rec, q, d), end = q.L === null ? N - 1 : q.a + q.L;
      g.fillStyle = col[s]; g.globalAlpha = s === 'gone' ? 0.8 : 1;
      g.fillRect(x(q.a), top + i * rowH, Math.max(1.5, x(end) - x(q.a)), Math.max(1, rowH - 1));
      if (s !== 'gone') { g.globalAlpha = 1; g.fillStyle = css('--fg'); g.fillRect(x(Math.min(q.a + d - off, N - 1)), top + i * rowH, 1.2, Math.max(1, rowH - 1)); }
    });
    g.globalAlpha = 1;
    if (hover !== null && qs[hover]) { g.strokeStyle = css('--fg'); g.lineWidth = 1; g.strokeRect(L - 2, top + hover * rowH - 1, Rr - L + 4, rowH + 1); }
    // axis: months
    g.fillStyle = css('--mute'); g.font = '12px system-ui,sans-serif'; g.textAlign = 'center';
    let lastX = -99;
    for (let i = 0; i < N; i++) {
      const t = day(rec, i);
      if (t.getUTCDate() !== 1) continue;
      const step = N > 300 ? (t.getUTCMonth() % 3 === 0) : true;
      if (!step || x(i) - lastX < 44) continue;
      lastX = x(i);
      g.fillText(MON[t.getUTCMonth()] + (t.getUTCMonth() === 0 || N <= 300 && i < 31 ? ' ' + t.getUTCFullYear() : ''), x(i), top + qs.length * rowH + 18);
    }
    g.textAlign = 'right'; g.fillStyle = css('--edge');
    g.fillText(latest >= 0 ? 'latest rise counted: ' + fmt(day(rec, latest)) : 'no start can be counted', Rr, 12);
    cal._geo = { top, rowH, n: qs.length, x, L, Rr, N };
    readCal();
  }
  function readCal() {
    const rec = D[R], c = tally(rec, d), pd = rec.perD.find(p => p.d === d - off);
    let s = '<b>' + d + ' days quiet, ' + R.replace('-', '–') + (off ? ', the rise day as day 1' : '') + ':</b> ';
    if (pd) s += 'the curve counts ' + pd.n + ' quiets, ' + pd.k + ' broke within 42 days (' + pct(pd.k, pd.n) + '), median rise ' + fmt(day(rec, pd.med)) + '. ';
    else s += 'the curve counts no quiet here. ';
    s += c.edge + ' are left out by the record\'s end; ' + c.gone + ' had broken before day ' + d + '.';
    if (hover !== null) {
      const q = longQ(rec)[hover];
      if (q) s += '<br>' + q.z + ': count rose ' + fmt(day(rec, q.a)) + ', quiet from ' + fmt(day(rec, q.a + 1 - off)) + (q.L === null ? ', still quiet at the record\'s end' : ', broke after ' + q.L + ' days') + ' — ' +
        { gone: 'broke before day ' + d, edge: 'left out at day ' + d + ' (its 42 days run past ' + fmt(day(rec, rec.N - 1)) + ')', brk: 'counted, broke within 42 days', hld: 'counted, held 42 days' }[status(rec, q, d)] + '.';
    }
    rd.innerHTML = s;
  }
  cal.addEventListener('pointermove', e => {
    const g = cal._geo; if (!g) return;
    const r = cal.getBoundingClientRect(), i = Math.floor((e.clientY - r.top - g.top) / g.rowH);
    const h = i >= 0 && i < g.n ? i : null; if (h !== hover) { hover = h; drawCal(); }
  });
  cal.addEventListener('pointerleave', () => { hover = null; drawCal(); });

  // Figure 2
  const stk = document.getElementById('stk'), rd2 = document.getElementById('rd2');
  let hd = null;
  function drawStk() {
    const rec = D[R], [g, w] = setup(stk, 260), L = 40, Rr = w - 10, T = 12, B = 226;
    const ds = []; for (let x = 21; x <= 120; x++) ds.push([x, tally(rec, x)]);
    const tot = longQ(rec).length, X = x => L + (Rr - L) * (x - 21) / 99, Y = v => B - (B - T) * v / tot;
    const layers = [['brk', '--brk'], ['hld', '--hld'], ['edge', '--edge'], ['gone', '--gone']];
    let base = ds.map(() => 0);
    for (const [k, c] of layers) {
      g.fillStyle = css(c); g.beginPath();
      ds.forEach(([x, t], i) => { const y = Y(base[i] + t[k]); i ? g.lineTo(X(x), y) : g.moveTo(X(x), y); });
      for (let i = ds.length - 1; i >= 0; i--) g.lineTo(X(ds[i][0]), Y(base[i]));
      g.closePath(); g.fill();
      base = base.map((b, i) => b + ds[i][1][k]);
    }
    g.strokeStyle = css('--fg'); g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(d), T); g.lineTo(X(d), B); g.stroke();
    if (hd !== null) { g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(hd), T); g.lineTo(X(hd), B); g.stroke(); g.setLineDash([]); }
    g.fillStyle = css('--mute'); g.font = '12px system-ui,sans-serif'; g.textAlign = 'center';
    for (const x of [21, 42, 60, 80, 100, 120]) g.fillText(x, X(x), B + 16);
    g.fillText('days quiet', (L + Rr) / 2, B + 31);
    g.textAlign = 'right'; g.fillText(tot, L - 6, T + 4); g.fillText('0', L - 6, B);
    stk._geo = { X, L, Rr };
    const x = hd === null ? d : hd, t = tally(rec, x);
    rd2.innerHTML = '<b>Day ' + x + ', ' + R.replace('-', '–') + (off ? ', the rise day as day 1' : '') + ':</b> of ' + tot + ' quiets that reached three weeks, ' + (t.brk + t.hld) + ' counted (' + t.brk + ' broke within 42, ' + t.hld + ' held), ' + t.edge + ' left out at the edge, ' + t.gone + ' broke earlier.';
  }
  stk.addEventListener('pointermove', e => {
    const g = stk._geo; if (!g) return;
    const r = stk.getBoundingClientRect(), x = Math.round(21 + 99 * (e.clientX - r.left - g.L) / (g.Rr - g.L));
    const h = x >= 21 && x <= 120 ? x : null; if (h !== hd) { hd = h; drawStk(); }
  });
  stk.addEventListener('pointerleave', () => { hd = null; drawStk(); });

  // study 58: where a quiet begins
  (function answer58() {
    const k = D58['Kivu 2018-2020'], c = D58['Congo 2026'], P26 = P58.P26.value;
    const fr = a => a[0] + ' of ' + a[1];
    const vb = P58.P24.value, flips = Object.keys(vb.A).filter(x => vb.A[x] !== vb.B[x]);
    document.getElementById('ans58').innerHTML =
      '<p><b>On the day after, as it should.</b> Studies 53 and 56 count a quiet as having reached day <i>d</i> when no rise falls on the <i>d</i> days after the rise, so the rise day is day 0. A second implementation, written from calendar dates, reproduces every one of study 53\'s observations that way (' +
      P26['Kivu 2018-2020'].observations[1].toLocaleString('en') + ' in Kivu, ' + P26['Congo 2026'].observations[1].toLocaleString('en') + ' in 2026). The page did call the rise date the day a quiet "began"; that wording is corrected.</p>' +
      '<p><b>Read the other way, the whole curve moves one day to the right</b>: day <i>d</i> then shows what day <i>d</i> − 1 shows now. In Kivu that changes nothing at day 42 (' + fr(k.A.p42) + ' broke, both ways) and moves each threshold by a day: the edge first bites at day ' + k.B.firstEdge + ' (not ' + k.A.firstEdge + '), the share stays below one in ten from day ' + k.B.below10 + ' (not ' + k.A.below10 + ') and below one in twenty from day ' + k.B.below5 + ' (not ' + k.A.below5 + ').</p>' +
      '<p><b>In 2026 the one day matters.</b> At day 42 it is ' + fr(c.B.p42) + ' instead of ' + fr(c.A.p42) + '. The record\'s end leaves out ' + c.B.band[1] + ' of them at day 60, not ' + c.A.band[1] + ', so study 56\'s ' + flips.join(', ') + ' would fail where it held, and the quiets counted at day 60 rose later on the median, not earlier (' + fmt(new Date(c.B.med60 + 'T00:00:00Z')) + ' against ' + fmt(new Date(c.B.med42 + 'T00:00:00Z')) + '). Study 56\'s statement that day 60 speaks for older quiets in 2026 holds only to the day; it rests on a handful of quiets and should be read as that fragile.</p>';
    const tb = document.querySelector('#pred58 tbody');
    const ex58 = {
      P23: v => 'Kivu ' + fr(v.Kivu[0]) + ' → ' + fr(v.Kivu[1]) + '; 2026 ' + fr(v['2026'][0]) + ' → ' + fr(v['2026'][1]),
      P24: v => Object.keys(v.A).filter(x => v.A[x] !== v.B[x]).map(x => x + ': ' + (v.A[x] ? 'held' : 'failed') + ' → ' + (v.B[x] ? 'held' : 'failed')).join('; ') || 'none changes',
      P25: v => v[0] + ' → ' + v[1],
      P26: v => Object.entries(v).map(([l, x]) => l.replace('-', '–') + ': ' + x.observations[0].toLocaleString('en') + ' observations, ' + (x.identical ? 'identical' : 'different')).join('; ')
    };
    for (const [id, p] of Object.entries(P58)) {
      const tr = document.createElement('tr');
      tr.innerHTML = '<td>' + id + '</td><td>' + p.text + '</td><td>' + ex58[id](p.value) + '</td><td class="' + (p.held ? 'held' : 'failed') + '">' + (p.held ? 'held' : 'failed') + '</td>';
      tb.appendChild(tr);
    }
  })();

  // predictions
  const ex = {
    P15: v => 'Kivu ' + v['Kivu 2018-2020'][0] + ' → ' + v['Kivu 2018-2020'][1] + '; 2026 ' + v['Congo 2026'][0] + ' → ' + v['Congo 2026'][1],
    P16: v => '2026 ' + Math.round(100 * v['2026']) + ' %; Kivu ' + Math.round(100 * v.Kivu) + ' %',
    P17: v => 'gap ' + (100 * v.gap).toFixed(1) + ' points, interval ' + (100 * v.ci[0]).toFixed(1) + ' to ' + (100 * v.ci[1]).toFixed(1) + ': no quiet in Kivu\'s edge band, so nothing to compare',
    P18: v => 'gap ' + (100 * v.gap).toFixed(1) + ' points (' + (100 * v.ci[0]).toFixed(1) + ' to +' + (100 * v.ci[1]).toFixed(1) + ')'
  };
  const tb = document.querySelector('#pred tbody');
  for (const [id, p] of Object.entries(P)) {
    const uninf = id === 'P17';
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + id + '</td><td>' + p.text + '</td><td>' + ex[id](p.value) + '</td><td class="' + (uninf ? 'held uninf' : p.held ? 'held' : 'failed') + '">' + (p.held ? (uninf ? 'held, uninformative' : 'held') : 'failed') + '</td>';
    tb.appendChild(tr);
  }

  function all() { document.getElementById('dv').textContent = d; drawCal(); drawStk(); }
  document.getElementById('d').addEventListener('input', e => { d = +e.target.value; all(); });
  document.querySelectorAll('button[data-r]').forEach(b => b.addEventListener('click', () => {
    R = b.dataset.r; hover = null;
    document.querySelectorAll('button[data-r]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); all();
  }));
  document.querySelectorAll('button[data-o]').forEach(b => b.addEventListener('click', () => {
    off = +b.dataset.o; hover = null;
    document.querySelectorAll('button[data-o]').forEach(o => o.setAttribute('aria-pressed', String(o === b))); all();
  }));
  window.addEventListener('resize', all);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', all);
  all();
})();
