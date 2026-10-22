// Coda II, The Price of an Hour: each stated word's hourly price below which Hand's line owes it, by both records, at the Field's prices.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const f1 = x => (100 * x).toFixed(1) + ' %', usd = x => '$' + x.toFixed(2);
  const PR = window.PRICE, P4 = window.P4, ORD = ['N', 'R', 'O', 'RC', 'OC', 'CAT'];
  const NAME = { N: 'no tag line', R: 'radar indicated', O: 'observed', RC: 'radar ind., considerable', OC: 'observed, considerable', CAT: 'catastrophic' };
  const st = { v: PR.min_wage };
  // a second path to price.py: the empties Hand's line charges at v dollars an hour, from plate IV's classes
  const charged = (v, rec) => { const b = v * PR.k[rec]; let n = 0; for (const w of ORD) if (!(P4.classes[w]['P_' + rec] > b)) n += P4.classes[w]['empty_' + rec]; return n; };
  const fix = (cv, h) => { const r = window.devicePixelRatio || 1, wd = cv.clientWidth; cv.width = wd * r; cv.height = h * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return [g, wd, h]; };
  function draw() {
    const [g, W, H] = fix($('pr-c'), 260), nar = W < 600, L = nar ? 96 : 170, R = W - 12, T = 12, B = H - 40, x = v => L + (R - L) * (v - 1) / 29, rh = (B - T) / ORD.length;
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.textBaseline = 'middle';
    g.fillStyle = css('--amber'); g.globalAlpha = .25; g.fillRect(x(PR.band_dollars[0]) - 1, T, Math.max(2, x(PR.band_dollars[1]) - x(PR.band_dollars[0]) + 2), B - T); g.globalAlpha = 1;
    g.strokeStyle = css('--rule'); g.fillStyle = css('--mute'); g.textAlign = 'center';
    for (const v of [1, 5, 10, 15, 20, 25, 30]) { g.beginPath(); g.moveTo(x(v), T); g.lineTo(x(v), B); g.stroke(); g.fillText('$' + v, x(v), B + 12); }
    g.textAlign = 'left'; g.fillText(nar ? 'an hour is worth' : 'what an hour under a warning is worth (the Field’s other prices held)', L, H - 5);
    ORD.forEach((w, i) => {
      const yy = T + rh * (i + .5);
      g.fillStyle = css('--ink'); g.fillText(nar ? w : NAME[w], 4, yy);
      const a = PR.vstar.hour[w], b = PR.vstar.later[w];
      g.strokeStyle = css('--mute'); g.beginPath(); g.moveTo(x(a), yy); g.lineTo(x(b), yy); g.stroke();
      for (const [v, c] of [[a, '--calm'], [b, '--amber']]) { g.fillStyle = css(c); g.beginPath(); g.arc(x(v), yy, 5, 0, 7); g.fill(); }
    });
    g.strokeStyle = css('--ink'); g.lineWidth = 2; g.setLineDash([6, 4]); g.beginPath(); g.moveTo(x(st.v), T); g.lineTo(x(st.v), B); g.stroke(); g.setLineDash([]); g.lineWidth = 1;
    const owed = r => ORD.filter(w => st.v < PR.vstar[r][w]), cH = charged(st.v, 'hour'), cL = charged(st.v, 'later');
    $('pr-read').innerHTML = `At <b>${usd(st.v)}</b> an hour, B / L is ${(st.v * PR.k.hour).toFixed(3)} by the hour's ledger and ${(st.v * PR.k.later).toFixed(3)} by the later record. ` +
      `Hand's line charges the warner for <b>${f1(cH / P4.empty_hour)}</b> of the empty warnings by the hour's ledger and <b>${f1(cL / P4.empty_later)}</b> by the later record. ` +
      (st.v >= PR.band_dollars[0] && st.v < PR.band_dollars[1] ? 'This price lies inside the five-cent band, the only place the two records part on “radar indicated”.' :
        `“Radar indicated” is ${owed('hour').includes('R') ? 'owed' : 'over-warning'} by both records.`);
    window.__price = { v: st.v, cH, cL, owedH: owed('hour'), owedL: owed('later') };
  }
  const set = v => { st.v = v; $('pr-v').value = v; $('pr-vv').textContent = usd(v); draw(); };
  $('pr-v').oninput = e => set(+e.target.value);
  $('pr-mw').onclick = () => set(PR.min_wage); $('pr-15').onclick = () => set(15);
  addEventListener('resize', draw);
  window.__pricecheck = () => ['7.25', '15'].every(v => ['hour', 'later'].every(r => charged(+v, r) === PR.at[v][r].charged)) &&
    ['hour', 'later'].every(r => Math.abs(1 - ORD.reduce((a, w) => a + P4.classes[w]['empty_' + r], 0) / ORD.reduce((a, w) => a + P4.classes[w].n, 0) - PR.P_met[r]) < 1e-12);
  const fill = (id, t) => { const e = $(id); if (e) e.textContent = t; };
  fill('pr-b15h', PR.at['15'].hour.b.toFixed(3)); fill('pr-b15l', PR.at['15'].later.b.toFixed(3));
  fill('pr-r0', f1(PR.band_ratio[0])); fill('pr-r1', f1(PR.band_ratio[1]));
  fill('pr-d0', usd(PR.band_dollars[0])); fill('pr-d1', usd(PR.band_dollars[1])); fill('pr-d0b', usd(PR.vstar.later.R)); fill('pr-d1b', usd(PR.vstar.hour.R));
  for (const [v, k] of [['7.25', 'mw'], ['15', '15']]) { fill(`pr-${k}h`, f1(PR.at[v].hour.charged / PR.at[v].hour.all)); fill(`pr-${k}l`, f1(PR.at[v].later.charged / PR.at[v].later.all)); }
  fill('pr-cath', usd(PR.vstar.hour.CAT)); fill('pr-catl', usd(PR.vstar.later.CAT));
  set(PR.min_wage);
})();
