// Coda, The Fifteen-Minute Clause: the later record's verdict on each word as the join window moves, and the Field's interval against plate V's villages.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = x => (100 * x).toFixed(1) + ' %', fi = n => n.toLocaleString('en-US');
  const C = window.CODA, WS = C.windows, ORD = ['N', 'R', 'O', 'RC', 'OC', 'CAT'];
  const NAME = { N: 'no tag line', R: 'radar indicated', O: 'observed', RC: 'radar indicated, considerable', OC: 'observed, considerable', CAT: 'catastrophic' };
  const st = { w: 0, k: 1 };
  const fix = (cv, h) => { const r = window.devicePixelRatio || 1, wd = cv.clientWidth; cv.width = wd * r; cv.height = h * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return [g, wd, h]; };
  const col = w => ({ N: css('--grey'), R: css('--calm'), O: css('--amber'), RC: css('--calm'), OC: css('--amber'), CAT: css('--accent') })[w];
  const dash = w => (w === 'RC' || w === 'OC') ? [5, 4] : [];

  function drawWin() {
    const [g, W, H] = fix($('cd-win'), 300), L = 44, R = W - 112, T = 14, B = H - 34, x = i => L + (R - L) * (i + 1) / WS.length, y = v => B - (B - T) * v;
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.fillStyle = css('--mute'); g.strokeStyle = css('--rule'); g.lineWidth = 1;
    for (const v of [0, .25, .5, .75, 1]) { g.beginPath(); g.moveTo(L, y(v)); g.lineTo(R, y(v)); g.stroke(); g.fillText(Math.round(100 * v) + '%', 4, y(v) + 4); }
    const nar = W < 600; g.textAlign = 'center'; g.fillText('hour', L, B + 16); WS.forEach((w, i) => g.fillText(nar ? String(w.min) : w.min + ' min', x(i), B + 16));
    g.textAlign = 'left'; g.fillText(nar ? 'minutes it may have begun before' : 'how long before the warning a tornado may have begun', L, H - 4);
    g.fillStyle = css('--accent'); g.globalAlpha = .12; g.fillRect(x(st.w) - 14, T, 28, B - T); g.globalAlpha = 1;
    for (const w of ORD) {
      g.strokeStyle = col(w); g.fillStyle = col(w); g.lineWidth = w === 'CAT' ? 3 : 1.6; g.setLineDash(dash(w));
      g.beginPath(); g.moveTo(L, y(WS[0].hour[w])); WS.forEach((s, i) => g.lineTo(x(i), y(s.later[w]))); g.stroke(); g.setLineDash([]);
      g.beginPath(); g.arc(L, y(WS[0].hour[w]), 3.5, 0, 7); g.fill();
      g.beginPath(); g.arc(x(st.w), y(WS[st.w].later[w]), 4, 0, 7); g.fill();
    }
    // labels at the right edge, nudged apart
    const lab = ORD.map(w => ({ w, v: y(WS[WS.length - 1].later[w]) })).sort((a, b) => a.v - b.v);
    for (let i = 1; i < lab.length; i++) lab[i].v = Math.max(lab[i].v, lab[i - 1].v + 13);
    for (const { w, v } of lab) { g.fillStyle = col(w); g.fillText(w === 'N' ? 'none' : w, R + 8, v + 4); }
  }

  function table() {
    const s = WS[st.w];
    $('cd-tab').innerHTML = ORD.map(w => `<tr${w === 'CAT' ? ' style="font-weight:600"' : ''}><td>${NAME[w]}</td><td>${fi(s.n[w])}</td><td>${f1(s.hour[w])}</td><td>${f1(WS[0].later[w])}</td><td>${f1(s.later[w])}</td></tr>`).join('');
    $('cd-th').textContent = `met, by the record written later at ${s.min} minutes`;
  }

  function readWin() {
    const s = WS[st.w], c = s.later.CAT, h = s.hour.CAT;
    $('cd-read').innerHTML = `<b>${s.min} minutes${s.min === 15 ? ', the Studio’s rule and the one plates III to V used' : ''}.</b> “Catastrophic” is met <b>${f1(c)}</b> by the record written later, against ${f1(h)} by the hour’s ledger. ` +
      (s.later_rank_as_words ? `The later record now ranks the words as the instruction does: radar indicated below observed, observed below observed and considerable, catastrophic highest. `
        : `The later record ranks “catastrophic” below “observed” and “observed, considerable”: the strongest word reads as the least kept. `) +
      `Plate III’s overturn ratio: of warnings empty at the hour, the later record fills ${f1(s.p3_obs)} of those that said OBSERVED and ${f1(s.p3_radar)} of those that said RADAR INDICATED, <b>${s.p3_ratio.toFixed(2)} times</b> as often (predicted at least 1.5). ` +
      `Plate IV’s amber band for “radar indicated” runs from ${f1(C.plate4_band_low)} to <b>${f1(s.later.R)}</b>. Across all warnings, ${fi(s.empty_filled_later_all)} empties are filled later and ${fi(s.met_no_track_all)} hits have no track.`;
  }

  function drawInt() {
    const [g, W, H] = fix($('cd-int'), 170), L = 16, R = W - 16, lo = Math.log(0.7), hi = Math.log(2.1), x = v => L + (R - L) * (Math.log(v) - lo) / (hi - lo);
    const F = C.field, lp = Math.log(F.irr), se = F.se_log / Math.sqrt(st.k), a = Math.exp(lp - 1.96 * se), b = Math.exp(lp + 1.96 * se), mid = 74;
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.strokeStyle = css('--rule'); g.fillStyle = css('--mute'); g.lineWidth = 1;
    g.beginPath(); g.moveTo(L, mid + 30); g.lineTo(R, mid + 30); g.stroke();
    for (const v of [0.8, 1, 1.25, 1.5, 2]) { g.beginPath(); g.moveTo(x(v), mid + 26); g.lineTo(x(v), mid + 34); g.stroke(); g.fillText(v.toFixed(2), x(v) - 12, mid + 48); }
    g.fillText('injured after a run of 3+ empties, per injured right after a hit', L, H - 6);
    g.fillStyle = css('--ink'); g.globalAlpha = .14; g.fillRect(x(a), mid - 12, x(b) - x(a), 24); g.globalAlpha = 1;
    g.strokeStyle = css('--ink'); g.lineWidth = 2; g.beginPath(); g.moveTo(x(a), mid); g.lineTo(x(b), mid); g.stroke();
    g.beginPath(); g.arc(x(F.irr), mid, 4, 0, 7); g.fillStyle = css('--ink'); g.fill();
    const V = [['learning', css('--calm'), 'learns'], ['habit', css('--accent'), 'habit'], ['total_disbelief', css('--grey'), 'stops listening']];
    V.forEach(([k, c, t], i) => { const v = C.villages[k], inside = v >= a && v <= b; g.strokeStyle = c; g.fillStyle = c; g.lineWidth = 3; g.setLineDash(inside ? [] : [3, 3]);
      g.beginPath(); g.moveTo(x(v), mid - 30); g.lineTo(x(v), mid + 22); g.stroke(); g.setLineDash([]); g.fillText(`${t} ${v.toFixed(2)}`, Math.min(x(v) - 10, R - 110), 14 + 13 * i); });
  }

  function readInt() {
    const F = C.field, se = F.se_log / Math.sqrt(st.k), lp = Math.log(F.irr), a = Math.exp(lp - 1.96 * se), b = Math.exp(lp + 1.96 * se);
    const yrs = (F.years[1] - F.years[0] + 1) * st.k, inn = Object.entries(C.villages).filter(([, v]) => v >= a && v <= b).map(([k]) => ({ learning: 'the village that learns', habit: 'the village of habit', total_disbelief: 'the village that stops listening' })[k]);
    $('cd-iread').innerHTML = `<b>${st.k === 1 ? 'The record as it is' : st.k + ' times the record'}</b>: ${fi(Math.round(F.n_warned * st.k))} warned tornadoes, about ${Math.round(yrs)} years at the rate of ${F.years[0]}–${F.years[1]}${st.k > 1 ? ', ending about ' + Math.round(F.years[0] + yrs - 1) : ''}. Interval ${a.toFixed(2)}–${b.toFixed(2)}. ` +
      (inn.length ? `Still inside: ${inn.join(', ')}.` : 'No village is left inside.') + (st.k > 1 ? ' <i>An estimate: it assumes the point stays at ' + F.irr.toFixed(2) + ', which nobody can know, and that the warnings keep their words.</i>' : '');
  }

  const btns = $('cd-btns'); btns.innerHTML = WS.map((w, i) => `<button data-i="${i}" aria-pressed="${i === st.w}">${w.min} min</button>`).join('');
  btns.addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; st.w = +b.dataset.i; btns.querySelectorAll('button').forEach(x => x.setAttribute('aria-pressed', x === b)); go(); });
  $('cd-k').addEventListener('input', e => { st.k = +e.target.value; $('cd-kv').textContent = st.k + '×'; drawInt(); readInt(); });
  const fill = (id, v) => { $(id).textContent = v; };
  const E = C.estimate_multiple_to_exclude, Y = C.field.years[1] - C.field.years[0] + 1;
  fill('cdf-cat15', f1(WS[0].later.CAT)); fill('cdf-cat60', f1(WS[2].later.CAT)); fill('cdf-cat120', f1(WS[3].later.CAT)); fill('cdf-cath', f1(WS[0].hour.CAT));
  fill('cdf-p3lo', Math.min(...WS.map(w => w.p3_ratio)).toFixed(2)); fill('cdf-p3hi', Math.max(...WS.map(w => w.p3_ratio)).toFixed(2));
  fill('cdf-r15', f1(WS[0].later.R)); fill('cdf-r240', f1(WS[WS.length - 1].later.R)); fill('cdf-rh', f1(C.plate4_band_low));
  fill('cdf-nw', fi(C.studio.warnings)); fill('cdf-n3', fi(C.studio.plate3_era_warnings));
  fill('cdf-irr', `${C.field.irr.toFixed(2)} (${C.field.lo.toFixed(2)}–${C.field.hi.toFixed(2)})`);
  fill('cdf-xd', E.total_disbelief.toFixed(1)); fill('cdf-xh', E.habit.toFixed(1)); fill('cdf-xl', E.learning.toFixed(1));
  fill('cdf-yd', Math.round(C.field.years[0] + Y * E.total_disbelief - 1)); fill('cdf-yh', Math.round(C.field.years[0] + Y * E.habit - 1)); fill('cdf-yl', Math.round(C.field.years[0] + Y * E.learning - 1));
  function go() { drawWin(); table(); readWin(); }
  window.__coda = () => ({ win: WS[st.w].min, cat: WS[st.w].later.CAT, k: st.k, read: $('cd-read').textContent, iread: $('cd-iread').textContent });
  go(); drawInt(); readInt(); addEventListener('resize', () => { drawWin(); drawInt(); });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { drawWin(); drawInt(); });
})();
