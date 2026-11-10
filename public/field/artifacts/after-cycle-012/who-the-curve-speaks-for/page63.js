// Figure 3 (study 63): the same quiets under two windows. Every number is read from data63.js (analyse63.py).
(function () {
  const C = window.DATA63.curves, S = window.DATA63.summary, P = window.PRED63;
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const pc = x => Math.round(100 * x) + ' %';
  const at = (key, d) => C[key][d - 1];
  const kn = x => x.k + ' of ' + x.n;
  let rec = 'kivu', rule = 'out', hd = 63;

  // the answer
  (function () {
    const f60 = at('kivu|42|out', 60), a60 = at('kivu|90|out', 60), c60 = at('kivu|90|carried', 60);
    const c42 = at('kivu|90|carried', 42), c63 = at('kivu|90|carried', 63), o63 = at('kivu|90|out', 63), f63 = at('kivu|42|out', 63);
    const y60 = at('2026|90|out', 60);
    document.getElementById('ans63').innerHTML =
      '<p><b>The two figures agree; they answer different windows.</b> The Atelier\'s <i>The Edge</i> asks whether a quiet that reached a day broke within the next 90 days; the quiet curve asks within the next 42. Read from the same Kivu quiets with a 90-day window, this page gives the Atelier\'s numbers exactly: ' +
      kn(c42) + ' at day 42 (' + pc(c42.s) + ') and ' + kn(c63) + ' at day 63 (' + pc(c63.s) + '), counting every quiet that reached the day.</p>' +
      '<p><b>At day 60</b> the curve\'s figure is ' + kn(f60) + ' (' + pc(f60.s) + ') within 42 days, and ' + kn(a60) + ' (' + pc(a60.s) + ') within 90, two quiets left out because their 90 days run past the record. On the same ' + c60.n + ' quiets, counting all of them, ' + c60.k + ' broke within 90 days against ' + at('kivu|42|carried', 60).k + ' within 42: the longer window adds the breaks between day 103 and day 150. At day 63 the same move is ' + pc(f63.s) + ' to ' + pc(o63.s) + '.</p>' +
      '<p><b>Closing the windows changes almost nothing in Kivu.</b> Under the 90-day window, leaving out the quiets whose window runs past the record\'s end gives ' + pc(a60.s) + ' at day 60, counting them as unbroken gives ' + pc(c60.s) + '. Kivu\'s record ran long past its last quiets. In Congo 2026, ' + y60.n + ' quiets have a closed 90-day window at day 60, so this record cannot answer yet.</p>';
  })();

  const cv = document.getElementById('win'), rd = document.getElementById('rd63');
  let geo = null;
  function draw() {
    const w = cv.clientWidth, r = window.devicePixelRatio || 1, h = 300;
    cv.width = w * r; cv.height = h * r; cv.style.height = h + 'px';
    const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0);
    const L = 40, R = 12, T = 12, B = 30, d0 = 21, d1 = 150;
    const X = d => L + (d - d0) / (d1 - d0) * (w - L - R), Y = s => T + (1 - s) * (h - T - B);
    geo = { X, d0, d1, L, R, w };
    g.font = '12px system-ui,sans-serif'; g.fillStyle = css('--mute'); g.strokeStyle = css('--line'); g.lineWidth = 1;
    for (const s of [0, 0.25, 0.5, 0.75, 1]) { g.beginPath(); g.moveTo(L, Y(s)); g.lineTo(w - R, Y(s)); g.stroke(); g.fillText(Math.round(100 * s) + '%', 4, Y(s) + 4); }
    for (const d of [21, 42, 60, 63, 90, 120, 150]) { if (w < 500 && (d === 60 || d === 63)) continue; g.fillText(d, X(d) - 8, h - 10); }
    for (const d of [42, 60, 63]) { g.strokeStyle = css('--line'); g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(d), T); g.lineTo(X(d), h - B); g.stroke(); g.setLineDash([]); }
    const series = [[42, css('--hld')], [90, css('--brk')]];
    for (const [H, col] of series) {
      const c = C[rec + '|' + H + '|' + rule].filter(x => x.d >= d0 && x.n >= 5);
      g.globalAlpha = 0.16; g.fillStyle = col; g.beginPath();
      c.forEach((x, i) => i ? g.lineTo(X(x.d), Y(x.hi)) : g.moveTo(X(x.d), Y(x.hi)));
      [...c].reverse().forEach(x => g.lineTo(X(x.d), Y(x.lo))); g.closePath(); g.fill(); g.globalAlpha = 1;
      g.strokeStyle = col; g.lineWidth = 2; g.beginPath();
      c.forEach((x, i) => i ? g.lineTo(X(x.d), Y(x.s)) : g.moveTo(X(x.d), Y(x.s))); g.stroke();
    }
    g.strokeStyle = css('--fg'); g.lineWidth = 1; g.beginPath(); g.moveTo(X(hd), T); g.lineTo(X(hd), h - B); g.stroke();
    g.fillStyle = css('--fg');
    for (const [H] of series) { const x = at(rec + '|' + H + '|' + rule, hd); if (x.n >= 5) { g.beginPath(); g.arc(X(hd), Y(x.s), 3.5, 0, 7); g.fill(); } }
    read();
  }
  function read() {
    const a = at(rec + '|42|' + rule, hd), b = at(rec + '|90|' + rule, hd);
    const one = (x, H) => x.n ? kn(x) + ' broke within ' + H + ' days (' + pc(x.s) + (x.n >= 5 ? ', ' + pc(x.lo) + '–' + pc(x.hi) : '') + ')' : 'no quiet speaks within ' + H + ' days';
    rd.textContent = (rec === 'kivu' ? 'Kivu 2018–2020' : 'Congo 2026') + ', day ' + hd + ', ' + (rule === 'out' ? 'open windows left out' : 'open windows counted as unbroken') + ': ' + one(a, 42) + '; ' + one(b, 90) + '.';
  }
  function pick(e) {
    if (!geo) return; const rc = cv.getBoundingClientRect();
    const d = Math.round(geo.d0 + (e.clientX - rc.left - geo.L) / (geo.w - geo.L - geo.R) * (geo.d1 - geo.d0));
    hd = Math.max(geo.d0, Math.min(geo.d1, d)); draw();
  }
  cv.addEventListener('pointermove', pick); cv.addEventListener('pointerdown', pick);
  for (const bt of document.querySelectorAll('[data-r63]')) bt.addEventListener('click', () => {
    rec = bt.dataset.r63; document.querySelectorAll('[data-r63]').forEach(x => x.setAttribute('aria-pressed', x === bt)); draw();
  });
  for (const bt of document.querySelectorAll('[data-w63]')) bt.addEventListener('click', () => {
    rule = bt.dataset.w63; document.querySelectorAll('[data-w63]').forEach(x => x.setAttribute('aria-pressed', x === bt)); draw();
  });
  window.addEventListener('resize', draw);
  draw();

  // predictions
  const tb = document.querySelector('#pred63 tbody');
  const val = v => typeof v === 'object' ? JSON.stringify(v).replace(/[{}"]/g, '').replace(/,/g, ', ').replace(/:/g, ': ') : String(v);
  for (const [k, v] of Object.entries(P)) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>' + k + '</td><td>' + v.text + '</td><td>' + val(v.value) + '</td><td class="' + (v.held ? 'held">held' : 'failed">failed') + '</td>';
    tb.appendChild(tr);
  }
})();
