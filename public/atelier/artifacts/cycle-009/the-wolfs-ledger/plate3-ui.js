// Plate III, The Stated Word: one office's warnings in the lanes of what they said, read by the hour, by the later record, or against the word.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = x => (100 * x).toFixed(1) + ' %', fi = n => n.toLocaleString('en-US');
  const NAME = { R: 'radar indicated', O: 'observed', RC: 'radar indicated, considerable', OC: 'observed, considerable', CAT: 'catastrophic', N: 'no tag line' };
  const LANES = ['N', 'R', 'O', 'RC', 'OC', 'CAT'];  // bottom to top: what the instruction says each word asserts
  const offs = Object.keys(P3.offices).sort();
  const st = { wfo: offs.includes('MAF') ? 'MAF' : offs[0], mode: 'hour' };
  const unpack = c => ({ word: P3.order[c >> 2], hour: (c >> 1) & 1, later: c & 1 });
  // the national table
  const tb = document.querySelector('#p3-tab tbody');
  const bar = (x, col) => `<span style="display:inline-block;width:${Math.round(70 * x)}px;max-width:18vw;height:.65em;background:var(${col});margin-right:6px;border-radius:2px"></span>`;
  tb.innerHTML = LANES.slice().reverse().map(w => { const c = P3.classes[w];
    return `<tr data-w="${w}"><td>${NAME[w]}</td><td>${fi(c.n)}</td><td>${bar(c.hit_hour, '--calm')}${f1(c.hit_hour)}</td><td>${bar(c.hit_later, '--amber')}${f1(c.hit_later)}</td><td>${fi(c.empty_filled_later)} of ${fi(c.empty_hour)} (${f1(c.empty_filled_later / c.empty_hour)})</td></tr>`; }).join('');
  // the office picker
  const sel = $('p3-off');
  sel.innerHTML = offs.map(w => `<option value="${w}">${w} (${fi(P3.offices[w].n)} warnings)</option>`).join('');
  sel.value = st.wfo;
  function tally(w) {
    const seq = P3.seq[w].map(x => unpack(x[1])), n = seq.length;
    const empH = seq.filter(x => !x.hour).length, empL = seq.filter(x => !x.later).length;
    const exp = seq.reduce((a, x) => a + 1 - P3.chance[x.word], 0), said = seq.filter(x => !x.hour).reduce((a, x) => a + P3.chance[x.word], 0);
    const flip = seq.filter(x => x.hour !== x.later).length;
    return { n, far: empH / n, far_later: empL / n, far_words: exp / n, excess: (empH - exp) / n, said, flip, seq };
  }
  function draw() {
    const t = tally(st.wfo), cv = $('p3-strip'), dpr = window.devicePixelRatio || 1, W = Math.max(280, cv.clientWidth || 820), H = W < 600 ? 230 : 260;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    const L = W < 600 ? 62 : 200, Rr = 8, T = 8, B = 26, lh = (H - T - B) / LANES.length, n = t.n, bw = (W - L - Rr) / n;
    g.font = '11px system-ui'; g.textBaseline = 'middle';
    LANES.forEach((w, k) => { const y = H - B - (k + 0.5) * lh; g.fillStyle = css('--mute');
      g.fillText(W < 600 ? w : NAME[w], 4, y); g.strokeStyle = css('--rule'); g.beginPath(); g.moveTo(L, y + lh / 2); g.lineTo(W - Rr, y + lh / 2); g.stroke(); });
    // year ticks
    const t0 = Date.parse(P3.t0.replace('Z', ':00Z')); let last = -1, lastx = -99; g.textBaseline = 'alphabetic';
    P3.seq[st.wfo].forEach((x, p) => { const y = new Date(t0 + x[0] * 60000).getUTCFullYear(); if (y !== last) { const xx = L + p * bw;
      g.strokeStyle = css('--rule'); g.beginPath(); g.moveTo(xx, H - B); g.lineTo(xx, H - B + 6); g.stroke();
      if (xx - lastx > 34) { g.fillStyle = css('--mute'); g.fillText(String(y), xx + 2, H - 8); lastx = xx; } last = y; } });
    t.seq.forEach((x, p) => {
      const k = LANES.indexOf(x.word), y0 = H - B - (k + 1) * lh + 3, h = lh - 6, xx = L + p * bw, w = Math.max(1, bw - (bw > 3 ? 1 : 0));
      if (st.mode === 'hour') { g.fillStyle = x.hour ? css('--calm') : css('--grey'); g.fillRect(xx, y0, w, h); }
      else if (st.mode === 'later') { g.fillStyle = x.later ? css('--calm') : css('--grey'); g.fillRect(xx, y0, w, h);
        if (x.later !== x.hour) { g.fillStyle = css('--amber'); g.fillRect(xx, y0 - 2, w, 3); g.fillRect(xx, y0 + h - 1, w, 3); } }
      else { if (x.hour) { g.fillStyle = css('--calm'); g.fillRect(xx, y0 + h - 3, w, 3); }
        else { const c = P3.chance[x.word]; g.fillStyle = css('--grey'); g.fillRect(xx, y0, w, h); g.fillStyle = css('--accent'); g.fillRect(xx, y0 + h * (1 - c), w, h * c); } }
    });
    const o = P3.offices[st.wfo], head = `<b>${st.wfo}</b>: ${fi(t.n)} tornado warnings, 2015–2024. `;
    const body = st.mode === 'hour'
      ? `<b>The hour's ledger.</b> ${fi(Math.round(t.far * t.n))} empty, <b>${f1(t.far)}</b>. Every empty warning costs one, whatever it said.`
      : st.mode === 'later'
      ? `<b>The record written later.</b> Empty: <b>${f1(t.far_later)}</b> (at the hour, ${f1(t.far)}). ${fi(t.flip)} of its verdicts are overturned, marked in amber.`
      : `<b>Against what was said.</b> Its own words predicted ${f1(t.far_words)} empty; ${f1(t.far)} were. An empty warning costs the chance its word claimed, so its ${fi(Math.round(t.far * t.n))} empties cost ${t.said.toFixed(1)} in all. What its words do not account for: <b>${(t.excess >= 0 ? '+' : '−') + f1(Math.abs(t.excess))}</b> of its warnings.`;
    $('p3-read').innerHTML = head + body;
    window.__p3 = { wfo: st.wfo, mode: st.mode, ...t, seq: undefined, json: o };
  }
  const modes = { 'p3-hour': 'hour', 'p3-later': 'later', 'p3-said': 'said' };
  for (const [id, m] of Object.entries(modes)) $(id).onclick = () => { st.mode = m; for (const b of Object.keys(modes)) $(b).setAttribute('aria-pressed', String(b === id)); draw(); };
  sel.onchange = () => { st.wfo = sel.value; draw(); };
  addEventListener('resize', draw);
  // a second path: the browser recomputes every office from the sequences and checks plate3.js's own figures
  window.__p3check = () => offs.every(w => { const t = tally(w), o = P3.offices[w], e = 1e-9;
    return t.n === o.n && Math.abs(t.far - o.far) < e && Math.abs(t.far_words - o.far_words) < e && Math.abs(t.excess - o.excess) < e && Math.abs(t.far_later - o.far_later) < e; });
  window.__p3moves = () => { const rank = k => { const s = offs.slice().sort((a, b) => (P3.offices[a][k] - P3.offices[b][k]) || (a < b ? -1 : 1)); return Object.fromEntries(s.map((w, i) => [w, i])); };
    const a = rank('far'), b = rank('excess'), m = offs.map(w => Math.abs(a[w] - b[w])).sort((x, y) => x - y); return m[Math.floor(m.length / 2)]; };
  // the figures in the prose
  const c = P3.classes, fill = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  fill('p3f-n', fi(P3.join.matched)); fill('p3f-match', fi(P3.join.matched)); fill('p3f-era', fi(P3.join.era_warnings)); fill('p3f-amb', fi(P3.join.ambiguous));
  fill('p3f-cR', P3.chance.R.toFixed(2)); fill('p3f-cC', P3.chance.CAT.toFixed(2));
  for (const w of P3.order) fill('p3f-h' + w, f1(c[w].hit_hour));
  fill('p3f-fO', f1(P3.fill[0])); fill('p3f-fR', f1(P3.fill[1])); fill('p3f-ratio', (P3.fill[0] / P3.fill[1]).toFixed(1) + ' times');
  fill('p3f-offn', String(offs.length)); fill('p3f-offn2', String(offs.length)); fill('p3f-r2', f1(P3.r2)); fill('p3f-move', String(P3.move_median));
  draw();
})();
