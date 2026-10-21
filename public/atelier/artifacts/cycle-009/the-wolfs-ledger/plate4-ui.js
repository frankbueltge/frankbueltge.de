// Plate IV, The Burden and the Loss: Hand's line drawn across the stated words, and four books of who pays for the empties.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const esc = t => String(t).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const f1 = x => (100 * x).toFixed(1) + ' %', fi = n => n.toLocaleString('en-US');
  const NAME = { R: 'radar indicated', O: 'observed', RC: 'radar ind., considerable', OC: 'observed, considerable', CAT: 'catastrophic', N: 'no tag line' };
  const COLS = ['N', 'R', 'O', 'RC', 'OC', 'CAT'];
  const C = P4.classes, offs = Object.keys(P4.offices_mid).sort();
  const st = { b: P4.band_mid, rec: 'hour', wfo: '' };
  // the books, computed here from the classes (a second path to plate4.py's curve)
  const book = (b, rec) => { let owed = 0, all = 0; for (const w of COLS) { const e = C[w]['empty_' + rec]; all += e; if (C[w]['P_' + rec] > b) owed += e; } return { owed, charged: all - owed, all }; };
  const unpack = c => ({ word: P3.order[c >> 2], hour: (c >> 1) & 1, later: c & 1 });
  const office = (wfo, b, rec) => { let owed = 0, ch = 0; for (const x of P3.seq[wfo]) { const u = unpack(x[1]); if (u[rec]) continue; if (C[u.word]['P_' + rec] > b) owed++; else ch++; } return { owed, charged: ch, all: owed + ch }; };
  const sel = $('p4-off');
  sel.innerHTML = '<option value="">the whole Service (' + fi(P4.era_warnings) + ' warnings)</option>' + offs.map(w => `<option value="${w}">${w} (${fi(P4.offices_mid[w].n)} warnings)</option>`).join('');
  function draw() {
    const cv = $('p4-line'), dpr = window.devicePixelRatio || 1, W = Math.max(280, cv.clientWidth || 820), narrow = W < 600, H = narrow ? 380 : 400;
    cv.width = W * dpr; cv.height = H * dpr; cv.style.height = H + 'px';
    const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, W, H);
    g.font = '11px system-ui';
    // upper panel: one column per stated word, its height the word's chance in the chosen record
    const L = 34, R = 8, T = 10, top = narrow ? 200 : 215, ph = top - T - 34;
    const y = p => T + ph * (1 - p), tot = COLS.reduce((a, w) => a + Math.sqrt(C[w].n), 0), gap = 6, usable = W - L - R - gap * (COLS.length - 1);
    g.fillStyle = css('--mute'); g.textBaseline = 'middle';
    for (const p of [0, 0.25, 0.5, 0.75, 1]) { g.fillText(String(p), 4, y(p)); g.strokeStyle = css('--rule'); g.beginPath(); g.moveTo(L, y(p)); g.lineTo(W - R, y(p)); g.stroke(); }
    const raw = COLS.map(w => Math.max(narrow ? 18 : 30, usable * Math.sqrt(C[w].n) / tot)), sc = Math.min(1, usable / raw.reduce((a, v) => a + v, 0));
    let x = L; const cols = [];
    for (const [i, w] of COLS.entries()) {
      const cw = raw[i] * sc, P = C[w]['P_' + st.rec], owed = P > st.b;
      cols.push({ w, x, cw, owed });
      g.fillStyle = owed ? css('--calm') : css('--accent'); g.globalAlpha = 0.85; g.fillRect(x, y(P), cw, y(0) - y(P)); g.globalAlpha = 1;
      g.fillStyle = css('--ink'); g.textBaseline = 'alphabetic'; g.fillText((100 * P).toFixed(0) + '%', x + 2, y(P) - 3);
      g.fillStyle = css('--mute'); g.textBaseline = 'top'; g.fillText(cw >= 120 ? NAME[w] : w, x, y(0) + 4);
      if (cw >= 80) g.fillText(fi(C[w]['empty_' + st.rec]) + ' empty', x, y(0) + 17);
      x += cw + gap;
    }
    g.strokeStyle = css('--ink'); g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(L, y(st.b)); g.lineTo(W - R, y(st.b)); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    g.fillStyle = css('--ink'); g.textBaseline = 'alphabetic'; g.font = '600 12px system-ui'; if (!narrow) { const lab = 'B / L = ' + st.b.toFixed(3), tw = g.measureText(lab).width; g.fillStyle = css('--bg'); g.fillRect(W - R - tw - 10, y(st.b) + 3, tw + 8, 15); g.fillStyle = css('--ink'); g.textBaseline = 'top'; g.fillText(lab, W - R - tw - 6, y(st.b) + 5); g.textBaseline = 'alphabetic'; } g.font = '11px system-ui';
    // lower panel: the empties Hand charges to the warner, as B/L moves, under both records
    const lt = top + 22, lb = H - 24, lh = lb - lt, X = b => L + (W - L - R) * b, Y = (n, all) => lb - lh * n / all;
    const [b0, b1] = P4.band; g.fillStyle = css('--amber'); g.globalAlpha = 0.18; g.fillRect(X(b0), lt, X(b1) - X(b0), lh); g.globalAlpha = 1;
    g.strokeStyle = css('--rule'); g.strokeRect(L, lt, W - L - R, lh);
    for (const [rec, col] of [['hour', '--calm'], ['later', '--amber']]) {
      g.strokeStyle = css(col); g.lineWidth = rec === st.rec ? 2.4 : 1.2; g.beginPath();
      P4.curve[rec].forEach(([b, n], i) => { const all = rec === 'hour' ? P4.empty_hour : P4.empty_later; i ? g.lineTo(X(b), Y(n, all)) : g.moveTo(X(b), Y(n, all)); }); g.stroke(); g.lineWidth = 1;
    }
    g.strokeStyle = css('--ink'); g.setLineDash([3, 3]); g.beginPath(); g.moveTo(X(st.b), lt); g.lineTo(X(st.b), lb); g.stroke(); g.setLineDash([]);
    g.fillStyle = css('--mute'); g.textBaseline = 'top';
    for (const b of [0, 0.25, 0.5, 0.75, 1]) g.fillText(String(b), Math.min(X(b), W - R - 18), lb + 4);
    g.textBaseline = 'alphabetic'; g.fillText(narrow ? 'share of empties charged to the warner' : 'share of the empty warnings Hand charges to the warner, as B / L moves', L + 4, lt - 5);
    // the books
    const nb = book(st.b, st.rec), o = st.wfo ? office(st.wfo, st.b, st.rec) : nb, who = st.wfo ? `<b>${st.wfo}</b>` : '<b>the whole Service</b>';
    const recw = st.rec === 'hour' ? "the hour's ledger" : 'the record written later';
    const inBand = st.b > b0 && st.b <= b1;
    $('p4-books').innerHTML = [
      ['The false-alarm ratio', `all ${fi(o.all)} empty warnings`, 'the people under the next warning, if it is believed less'],
      [`Hand's line at B / L = ${st.b.toFixed(3)}, by ${recw}`, `<b>${fi(o.charged)}</b> of ${fi(o.all)} (${f1(o.all ? o.charged / o.all : 0)})`, `the other ${fi(o.owed)} were owed: their cost is a burden the formula leaves on the people who took cover`],
      ['<i>Brown v. United States</i> (1986)', 'nothing for any forecast', 'a prediction is a discretionary function; the public bears every empty warning, and every miss'],
      ['The warner’s own word (the Studio’s 400)', `nothing: ${fi(P4.predictions.R4.not_needed_hits.length)} of 400 statements say a warning was not needed`, `${f1(P4.statements.shares.moved)} say first that the storm moved out of the area`],
    ].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td class="note">${r[2]}</td></tr>`).join('');
    $('p4-read').innerHTML = `${who}, ${recw}, at B / L = <b>${st.b.toFixed(3)}</b>: Hand charges the warner for ${fi(o.charged)} of ${fi(o.all)} empty warnings. ` +
      (inBand ? `<b>This price lies in the amber band</b>, between the chance of “radar indicated” at the hour (${f1(b0)}) and in the later record (${f1(b1)}). Here the choice of record alone decides whether nearly all of the empties were the warner's over-warning or the public's owed burden.`
        : st.b <= P4.absolve_below[st.rec] ? 'At this price every class of warning the Service issues is owed, and Hand charges nothing to the warner: the empties are the price of the hits.'
        : 'Move the line into the amber band to see the two records part.');
    window.__p4 = { b: st.b, rec: st.rec, wfo: st.wfo, ...o, inBand, owedCols: cols.filter(c => c.owed).map(c => c.w) };
  }
  $('p4-b').oninput = e => { st.b = +e.target.value; $('p4-bv').textContent = st.b.toFixed(3); draw(); };
  const recs = { 'p4-hour': 'hour', 'p4-later': 'later' };
  for (const [id, r] of Object.entries(recs)) $(id).onclick = () => { st.rec = r; for (const k of Object.keys(recs)) $(k).setAttribute('aria-pressed', String(k === id)); draw(); };
  sel.onchange = () => { st.wfo = sel.value; draw(); };
  addEventListener('resize', draw);
  $('p4-b').value = st.b; $('p4-bv').textContent = st.b.toFixed(3);
  // the warner's own word: statements that ended a warning early, drawn from the Studio's fixed sample
  let k = 0; const S = P4.statements.sample, order = S.map((_, i) => i).sort((a, b) => ((a * 7919) % 400) - ((b * 7919) % 400));
  const deal = () => { $('p4-cards').innerHTML = order.slice(k, k + 4).map(i => `<div class="card" data-cls="other"><span class="d">${esc(S[i].h.toLowerCase())}</span>${esc(S[i].f)}</div>`).join(''); k = (k + 4) % 400; };
  $('p4-more').onclick = deal; deal();
  // checks for verify.mjs: the curve and every office's books recomputed here, against plate4.py's
  window.__p4check = () => ['hour', 'later'].every(r => P4.curve[r].every(([b, n]) => book(b, r).charged === n)) &&
    offs.every(w => { const a = office(w, P4.band_mid, 'hour'), z = office(w, P4.band_mid, 'later'), j = P4.offices_mid[w];
      return a.charged === j.charged_hour && z.charged === j.charged_later && a.all === j.empty_hour && z.all === j.empty_later; });
  // the figures in the prose
  const fill = (id, v) => { const e = $(id); if (e) e.textContent = v; };
  const mid = book(P4.band_mid, 'hour'), midL = book(P4.band_mid, 'later');
  fill('p4f-b0', f1(P4.band[0])); fill('p4f-b1', f1(P4.band[1])); fill('p4f-share', f1(P4.band_share));
  fill('p4f-chH', fi(mid.charged)); fill('p4f-allH', fi(mid.all)); fill('p4f-pH', f1(mid.charged / mid.all));
  fill('p4f-chL', fi(midL.charged)); fill('p4f-allL', fi(midL.all)); fill('p4f-pL', f1(midL.charged / midL.all));
  fill('p4f-abs', f1(P4.absolve_below.hour)); fill('p4f-absL', f1(P4.absolve_below.later));
  fill('p4f-oe', fi(P4.observed.empty_hour)); fill('p4f-of', fi(P4.observed.filled_later)); fill('p4f-ou', fi(P4.observed.unbacked));
  fill('p4f-moved', f1(P4.statements.shares.moved)); fill('p4f-pop', fi(P4.sources.studio_words.population));
  draw();
})();
