// Plate V, The Uncertain Village: three readers run over one office's real sequence; recomputed here from P3.seq (a second path to plate5.py).
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = x => (100 * x).toFixed(1) + ' %', fi = n => n.toLocaleString('en-US');
  const O = P3.order, CH = P3.chance, K = P3.classes;
  const NT = O.reduce((a, w) => a + K[w].n, 0), POOL = O.reduce((a, w) => a + K[w].n * CH[w], 0) / NT;
  const unpack = c => ({ w: O[c >> 2], hour: (c >> 1) & 1, later: c & 1 });
  const st = { n0: 20, h: 0.8, rec: 'hour', wfo: '' };
  // the same three readers as plate5.py: W keeps the words and learns, C keeps the count, H is habit
  function run(seq, n0, h, rec) {
    const a = {}, b = {}; for (const w of O) { a[w] = n0 * CH[w]; b[w] = n0 * (1 - CH[w]); }
    let ca = n0 * POOL, cb = n0 * (1 - POOL), runlen = 0, prev = null; const out = [];
    seq.forEach(([, code], i) => {
      const u = unpack(code), met = rec === 'hour' ? u.hour : (u.hour || u.later);
      out.push({ w: u.w, met, W: a[u.w] / (a[u.w] + b[u.w]) / CH[u.w], C: ca / (ca + cb) / POOL, H: h ** runlen, run: runlen, prev, i });
      a[u.w] += met; b[u.w] += 1 - met; ca += met; cb += 1 - met; runlen = met ? 0 : runlen + 1; prev = !!met;
    });
    return out;
  }
  function calibrated(seq) { let k = 0, n = 0; for (const [, c] of seq) { const u = unpack(c); if (u.w === 'R') { n++; k += u.hour; } } const p = CH.R; return n > 0 && Math.abs(k - n * p) <= 1.96 * Math.sqrt(n * p * (1 - p)); }
  const offs = Object.keys(P3.seq).sort(), CAL = offs.filter(o => calibrated(P3.seq[o]));
  const mean = xs => xs.reduce((a, v) => a + v, 0) / xs.length;
  function summary(n0, h, rec) {
    const R = [], half = [];
    for (const o of CAL) { const s = P3.seq[o]; for (const x of run(s, n0, h, rec)) if (x.w === 'R') { R.push(x); half.push(x.i >= s.length / 2); } }
    const ar = R.filter(x => x.run >= 3), ah = R.filter(x => x.prev === true);
    const f = R.filter((x, j) => x.run >= 3 && !half[j]), s2 = R.filter((x, j) => x.run >= 3 && half[j]);
    return { n: R.length, all: mean(R.map(x => x.W)), runW: mean(ar.map(x => x.W)), runC: mean(ar.map(x => x.C)), runH: mean(ar.map(x => x.H)), hitW: mean(ah.map(x => x.W)), first: 1 - mean(f.map(x => x.W)), second: 1 - mean(s2.map(x => x.W)) };
  }
  window.__p5check = () => { const s = summary(20, 0.8, 'hour'), near = (x, y) => Math.abs(x - y) < 1e-9;
    return CAL.length === P5.calibrated_on_R && s.n === P5.R_warnings && near(s.all, P5.mean_r_W) && near(s.runW, P5.after_run_r_W) && near(s.runC, P5.after_run_r_C) && near(s.runH, P5.after_run_r_H) && near(s.hitW, P5.after_hit_r_W) && near(s.first, P5.disc_first_half) && near(s.second, P5.disc_second_half); };
  const sel = $('p5-off'); st.wfo = CAL.includes('OUN') ? 'OUN' : CAL[0];
  sel.innerHTML = offs.map(o => `<option value="${o}">${o}${CAL.includes(o) ? ' · calibrated on “radar indicated”' : ''} (${fi(P3.seq[o].length)} warnings)</option>`).join(''); sel.value = st.wfo;
  function draw() {
    const cv = $('p5-run'), dpr = window.devicePixelRatio || 1, W = Math.max(280, cv.clientWidth || 820), H = W < 600 ? 300 : 320;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H); g.font = '11px system-ui';
    const rows = run(P3.seq[st.wfo], st.n0, st.h, st.rec), n = rows.length, L = 34, R = 8, T = 10, B = H - 40;
    const X = i => L + (W - L - R) * (i + 0.5) / n, lo = 0, hi = 1.6, Y = r => T + (B - T) * (1 - (Math.min(hi, r) - lo) / (hi - lo));
    g.fillStyle = css('--mute'); g.textBaseline = 'middle';
    for (const r of [0, 0.5, 1, 1.5]) { g.fillText(r.toFixed(1), 4, Y(r)); g.strokeStyle = css('--rule'); g.beginPath(); g.moveTo(L, Y(r)); g.lineTo(W - R, Y(r)); g.stroke(); }
    g.strokeStyle = css('--ink'); g.setLineDash([6, 4]); g.beginPath(); g.moveTo(L, Y(1)); g.lineTo(W - R, Y(1)); g.stroke(); g.setLineDash([]);
    for (const [k, col, wd] of [['H', '--accent', 1], ['C', '--amber', 1.5], ['W', '--calm', 2]]) {
      g.strokeStyle = css(col); g.lineWidth = wd; g.beginPath(); rows.forEach((x, i) => (i ? g.lineTo : g.moveTo).call(g, X(i), Y(x[k]))); g.stroke();
    }
    g.lineWidth = 1;
    const bw = Math.max(1, (W - L - R) / n);
    rows.forEach((x, i) => { g.fillStyle = x.met ? css('--calm') : css('--grey'); g.fillRect(X(i) - bw / 2, B + 8, bw, x.met ? 14 : 6); });
    g.fillStyle = css('--mute'); g.textBaseline = 'top'; g.fillText('each warning in order of issue · tall = met, short = empty', L, B + 25);
    const s = summary(st.n0, st.h, st.rec), mine = rows.filter(x => x.w === 'R' && x.run >= 3);
    window.__p5 = { wfo: st.wfo, n0: st.n0, h: st.h, rec: st.rec, rows: n, s };
    $('p5-read').innerHTML = `In <b>${st.wfo}</b>, ${fi(n)} warnings, ${CAL.includes(st.wfo) ? 'calibrated on “radar indicated” by the declared test' : '<b>not</b> calibrated on “radar indicated” by the declared test'}. ` +
      (mine.length ? `After three or more empty warnings, the village that keeps the words believes its next “radar indicated” at <b>${f1(mean(mine.map(x => x.W)))}</b> of the stated chance; the habit village at <b>${f1(mean(mine.map(x => x.H)))}</b>. ` : '') +
      `Over the ${CAL.length} calibrated offices, by ${st.rec === 'hour' ? "the hour's ledger" : 'the record written later'}: on average <b>${f1(s.all)}</b>; after a run <b>${f1(s.runW)}</b> (count only ${f1(s.runC)}, habit ${f1(s.runH)}); after a hit <b>${f1(s.hitW)}</b>. ` +
      `The discount after a run is ${f1(s.first)} in the first half of each office's ledger and ${f1(s.second)} in the second.` +
      (st.rec === 'later' ? ' <i>The later record fills empties the hour wrote, so the stated chance (the hour\'s) is now below what the village learns: it believes the warner more than its words.</i>' : '');
  }
  const set = (k, v) => { st[k] = v; draw(); };
  $('p5-n0').value = st.n0; $('p5-h').value = st.h;
  $('p5-n0').addEventListener('input', e => { $('p5-n0v').textContent = e.target.value; set('n0', +e.target.value); });
  $('p5-h').addEventListener('input', e => { $('p5-hv').textContent = (+e.target.value).toFixed(2); set('h', +e.target.value); });
  $('p5-n0v').textContent = st.n0; $('p5-hv').textContent = st.h.toFixed(2);
  sel.addEventListener('change', e => set('wfo', e.target.value));
  for (const r of ['hour', 'later']) $('p5-' + r).addEventListener('click', () => { $('p5-hour').setAttribute('aria-pressed', r === 'hour'); $('p5-later').setAttribute('aria-pressed', r === 'later'); set('rec', r); });
  // figures in the prose
  const fill = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  fill('p5f-cal', CAL.length); fill('p5f-off', offs.length); fill('p5f-n', fi(P5.R_warnings)); fill('p5f-all', f1(P5.mean_r_W)); fill('p5f-run', f1(P5.after_run_r_W));
  fill('p5f-runH', f1(P5.after_run_r_H)); fill('p5f-runC', f1(P5.after_run_r_C)); fill('p5f-hit', f1(P5.after_hit_r_W)); fill('p5f-first', f1(P5.disc_first_half)); fill('p5f-second', f1(P5.disc_second_half));
  fill('p5f-allrun', f1(P5.all_offices.after_run_r_W)); fill('p5f-arn', fi(P5.after_run_n));
  fill('p5f-rho', P5.second_record.spearman_far_hour_later.toFixed(2)); fill('p5f-mH', 'all ' + P5.second_record.offices_majority_charged_hour); fill('p5f-mL', P5.second_record.offices_majority_charged_later ? String(P5.second_record.offices_majority_charged_later) : 'none');
  const rp = P5.plate4_repair; fill('p5f-rH', fi(rp.hour.warnings)); fill('p5f-rL', fi(rp.later.warnings)); fill('p5f-rof', fi(rp.hour.of)); fill('p5f-rpH', f1(rp.hour.warnings / rp.hour.of)); fill('p5f-rpL', f1(rp.later.warnings / rp.later.of));
  draw(); addEventListener('resize', draw);
})();
