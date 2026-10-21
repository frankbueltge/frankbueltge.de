// Plate II, The Run Before: one county's tornado warnings in the record's order, and dealt again within each year.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = x => (100 * x).toFixed(1) + ' %', f2 = x => x.toFixed(2), fi = n => n.toLocaleString('en-US');
  const st = { ci: Math.max(0, P2C.findIndex(c => c[0] === P2.longest_run.county)), h: P2.h, seq: null, dealt: false, deals: 0 };
  let seed = 20261020;
  const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  const runs = seq => { const out = []; let r = 0; seq.forEach((m, p) => { if (m) { out.push([p, r]); r = 0; } else r++; }); return out; };
  const charge = r => 1 - st.h ** r;
  const mean = v => v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0;
  function record() { const c = P2C[st.ci]; return [...c[3]].map(Number); }
  function deal() {
    const c = P2C[st.ci], seq = record(), by = {};
    c[4].forEach((y, p) => (by[y] = by[y] || []).push(p));
    const out = seq.slice();
    for (const ps of Object.values(by)) {
      const v = ps.map(p => seq[p]);
      for (let i = v.length - 1; i > 0; i--) { const j = Math.floor(rnd() * (i + 1)); [v[i], v[j]] = [v[j], v[i]]; }
      ps.forEach((p, k) => out[p] = v[k]);
    }
    return out;
  }
  // the county picker
  const sel = $('p2-county');
  sel.innerHTML = P2C.map((c, i) => `<option value="${i}">${c[1]} (${c[0].slice(0, 2)}, ${c[2]}, ${c[3].length})</option>`).join('');
  sel.value = st.ci;
  function draw() {
    const c = P2C[st.ci], seq = st.seq, R = runs(seq), cv = $('p2-strip');
    const dpr = window.devicePixelRatio || 1, W = Math.max(280, cv.clientWidth || 820), H = W < 600 ? 190 : 220;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const L = 8, Rr = 8, base = H - 40, top = 14, n = seq.length, bw = (W - L - Rr) / n;
    // year ticks
    g.fillStyle = css('--mute'); g.strokeStyle = css('--rule'); g.font = '11px system-ui'; let last = -1, lastx = -99;
    c[4].forEach((y, p) => { if (y !== last) { const x = L + p * bw; g.beginPath(); g.moveTo(x, base + 4); g.lineTo(x, base + 14); g.stroke(); if (x - lastx > 34) { g.fillText(String(2008 + y), x + 2, base + 26); lastx = x; } last = y; } });
    // the warnings
    seq.forEach((m, p) => { g.fillStyle = m ? css('--calm') : css('--grey'); g.fillRect(L + p * bw, base - 10, Math.max(1, bw - (bw > 3 ? 1 : 0)), 10); });
    // the charge on each met warning
    g.fillStyle = css('--accent');
    for (const [p, r] of R) { const hgt = (base - 16 - top) * charge(r); g.fillRect(L + p * bw, base - 14 - hgt, Math.max(1.5, bw - (bw > 3 ? 1 : 0)), hgt); }
    g.strokeStyle = css('--rule'); g.beginPath(); g.moveTo(L, top); g.lineTo(W - Rr, top); g.stroke();
    g.fillStyle = css('--mute'); g.fillText('charge 1', L, top - 3);
    // the readout
    const met = R.length, ch = R.map(x => charge(x[1])), a3 = R.filter(x => x[1] >= 3).length, mx = R.reduce((a, x) => x[1] > a[1] ? x : a, [-1, -1]);
    const rec = runs(record()).map(x => charge(x[1]));
    $('p2-read').innerHTML = `<b>${c[1]}</b>, warned by the ${c[2]} office: ${fi(n)} warnings touched it, ${fi(met)} met by a tornado report, ${fi(n - met)} empty. ` +
      (st.dealt ? `<b>Dealt again</b> (deal ${st.deals}): the same number of hits in each year, in another order. ` : `<b>The record's order.</b> `) +
      `${a3} of its ${met} met warnings came after three or more empty ones. The longest run of empties before a hit is ${mx[1]}. ` +
      `A public that reads only the run withholds on average <b>${f1(mean(ch))}</b> of its readiness from the warnings that were met` +
      (st.dealt ? ` (in the record's order: ${f1(mean(rec))}).` : '.') + ` Nothing the office decided differs between the two orders.`;
    window.__p2 = { ci: st.ci, county: c[0], n, met, a3, charge: mean(ch), rec: mean(rec), dealt: st.dealt, perYear: perYear(seq) };
  }
  function perYear(seq) { const o = {}; P2C[st.ci][4].forEach((y, p) => o[y] = (o[y] || 0) + seq[p]); return o; }
  function set(ci) { st.ci = ci; sel.value = ci; st.seq = record(); st.dealt = false; st.deals = 0; draw(); }
  sel.onchange = () => set(+sel.value);
  $('p2-deal').onclick = () => { st.seq = deal(); st.dealt = true; st.deals++; draw(); };
  $('p2-rec').onclick = () => { st.seq = record(); st.dealt = false; draw(); };
  $('p2-any').onclick = () => set(Math.floor(rnd() * P2C.length));
  $('p2-long').onclick = () => set(P2C.findIndex(c => c[0] === P2.longest_run.county));
  $('p2-h').oninput = e => { st.h = +e.target.value; $('p2-hv').textContent = f2(st.h); draw(); hist(); };
  // the whole record: runs before a hit, as recorded and as dealt
  function hist() {
    const cv = $('p2-hist'), dpr = window.devicePixelRatio || 1, W = Math.max(280, cv.clientWidth || 820), H = W < 600 ? 220 : 260;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const obs = Array.from({ length: 11 }, (_, k) => 0); for (const [k, v] of Object.entries(P2.runs)) obs[Math.min(+k, 10)] += v;
    const dl = Array.from({ length: 11 }, (_, k) => P2.deal_runs_mean[String(k)] || 0);
    const L = 46, Rr = 8, T = 10, B = 34, mx = Math.max(...obs, ...dl), slot = (W - L - Rr) / 11;
    const Y = v => T + (H - T - B) * (1 - v / mx);
    g.fillStyle = css('--mute'); g.font = '11px system-ui'; g.strokeStyle = css('--rule');
    for (const v of [0, 4000, 8000, 12000]) { g.beginPath(); g.moveTo(L, Y(v)); g.lineTo(W - Rr, Y(v)); g.stroke(); g.fillText(fi(v), 2, Y(v) + 4); }
    for (let k = 0; k < 11; k++) {
      const x = L + k * slot, w = slot * 0.36;
      g.fillStyle = css('--calm'); g.fillRect(x + slot * 0.1, Y(obs[k]), w, Y(0) - Y(obs[k]));
      g.fillStyle = css('--grey'); g.fillRect(x + slot * 0.1 + w, Y(dl[k]), w, Y(0) - Y(dl[k]));
      g.fillStyle = css('--accent'); g.fillRect(x + slot * 0.1, Y(0) + 3, 2 * w * charge(k), 3);
      g.fillStyle = css('--mute'); g.fillText(k === 10 ? '10+' : String(k), x + slot * 0.3, H - 12);
    }
  }
  // the figures in the prose
  const Rz = P2.results, put = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  put('p2f-met', fi(P2.met_entries)); put('p2f-a3', fi(P2.after3)); put('p2f-obs', f1(Rz.observed_after3)); put('p2f-obs2', f1(Rz.observed_after3));
  put('p2f-deal', f1(Rz.deal_after3_mean)); put('p2f-dlo', f1(Rz.deal_after3_lo)); put('p2f-dhi', f1(Rz.deal_after3_hi));
  put('p2f-r2', f1(Rz.r2_rate)); put('p2f-luck', f1(Rz.luck_share)); put('p2f-off', f1(Rz.between_office_share));
  put('p2f-o0', fi(P2.runs['0'])); put('p2f-d0', fi(Math.round(P2.deal_runs_mean['0'])));
  const long = Object.entries(P2.runs).filter(([k]) => +k >= 10).reduce((a, [, v]) => a + v, 0);
  put('p2f-o10', fi(long)); put('p2f-d10', fi(Math.round(P2.deal_runs_mean['10'])));
  put('p2f-shown', fi(P2.counties_shown)); put('p2f-lr', P2.longest_run.run);
  put('p2f-osp', f1(P2.office_spread[0]) + ' to ' + f1(P2.office_spread[1])); put('p2f-on', P2.offices_100plus);
  window.__p2check = () => { // the browser's own runs over the counties it holds
    const h = {}; for (const c of P2C) for (const [, r] of runs([...c[3]].map(Number))) { const k = String(Math.min(r, 10)); h[k] = (h[k] || 0) + 1; }
    return JSON.stringify(h) === JSON.stringify(Object.fromEntries(Object.entries(P2.shown_runs)));
  };
  set(st.ci); hist();
  addEventListener('resize', () => { draw(); hist(); });
})();
