// Coda IV, The Number and the Sentence: what the survey narratives write of the injured that pull the Field's ratio, and one count read two ways.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const S = window.SURVEY, V = S.villages, M = S.mcloud, esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const CLS = { states: ['counts them', '--calm'], part: ['counts some of them', '--amber'], mentions: ['mentions them, no count', '--amber'], silent: ['says nothing of anyone hurt', '--accent'] };
  const VN = { learning: 'the village that learns', habit: 'the village of habit', total_disbelief: 'the village that stops listening' };
  const fix = (cv, h) => { const r = window.devicePixelRatio || 1, wd = cv.clientWidth; cv.width = wd * r; cv.height = h * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return [g, wd, h]; };
  const st = { row: 0, n: 32 };

  // the fifteen, as cards in the order of their pull
  const maxd = Math.max(...S.rows.map(r => Math.abs(r.delta)));
  $('sv-cards').innerHTML = S.rows.map((r, i) => `<button class="card" data-i="${i}" data-sv="${r.class}" aria-pressed="false" style="border-left-color:var(${CLS[r.class][1]})">` +
    `<b>${r.inj} injured</b>, ${r.mu} expected <span class="d">${r.st}, ${r.date}, EF${r.ef}, ${r.cat === 'hit' ? 'right after a hit' : 'after a run of empties'}</span>` +
    `<span style="display:block;height:5px;margin:5px 0 3px;background:var(${CLS[r.class][1]});width:${(100 * Math.abs(r.delta) / maxd).toFixed(1)}%"></span>` +
    `<span class="d">the narrative ${CLS[r.class][0]}</span></button>`).join('');
  function card(i) {
    st.row = i; const r = S.rows[i];
    document.querySelectorAll('#sv-cards .card').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.i === i)));
    const segs = r.segments.map(s => `<p style="margin:.4em 0"><b>${esc(s.county)}</b>, ${esc(s.begin)}, ${s.inj} injured recorded (Storm Events ${s.event_id}): ` +
      (s.sentences.length ? s.sentences.map(x => `“${esc(x)}”`).join(' ') : '<i>no sentence of its narrative speaks of anyone hurt.</i>') + '</p>').join('');
    $('sv-read').innerHTML = `<b>${r.st}, ${r.date}: ${r.inj} injured where the Field's model expected ${r.mu}.</b> Its pull on the ratio ranks ${r.rank_delta} of 9,295. ` +
      `The narrative accounts with a number for ${r.accounted} of the ${r.inj}.${segs}` +
      (r.om === 315890 ? `<p style="margin:.4em 0">This is the tornado the second figure below reads two ways.</p>` : '');
  }
  document.querySelectorAll('#sv-cards .card').forEach(c => c.onclick = () => card(+c.dataset.i));

  // the two accounts of the McLoud tornado
  const cut = M.oun_narrative.indexOf(M.dropped);
  $('sv-oun').innerHTML = esc(M.oun_narrative.slice(0, cut)) + `<mark data-c="laugh">${esc(M.dropped)}</mark>` + esc(M.oun_narrative.slice(cut + M.dropped.length));
  $('sv-se').textContent = M.storm_events_narrative;

  // the count read two ways: the Field's model refit at each count from 0 to 32
  function draw() {
    const s = S.sweep[st.n], [g, W, H] = fix($('sv-int'), 190), L = 20, R = W - 20, T = 26, B = H - 46;
    const lo = Math.log(0.75), hi = Math.log(2.1), x = v => L + (R - L) * (Math.log(v) - lo) / (hi - lo);
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.textAlign = 'center';
    g.strokeStyle = css('--rule'); g.lineWidth = 1; g.beginPath(); g.moveTo(L, B); g.lineTo(R, B); g.stroke();
    for (const v of [0.8, 1, 1.2, 1.4, 1.6, 1.8, 2]) { g.fillStyle = css('--mute'); g.fillText(v.toFixed(1), x(v), B + 16); g.beginPath(); g.moveTo(x(v), B - 3); g.lineTo(x(v), B + 3); g.stroke(); }
    g.fillText('injured after a run of empty warnings, times the injured right after a hit', W / 2, H - 6);
    g.setLineDash([4, 4]); g.strokeStyle = css('--mute'); g.beginPath(); g.moveTo(x(S.crossing), T - 12); g.lineTo(x(S.crossing), B); g.stroke(); g.setLineDash([]);
    g.fillStyle = css('--mute'); g.fillText(W < 600 ? 'parting' : 'where learning and habit part', x(S.crossing), T - 14);
    const vy = { learning: T + 10, habit: T + 10, total_disbelief: T + 10 }, vc = { learning: '--calm', habit: '--amber', total_disbelief: '--accent' };
    for (const k of Object.keys(V)) { g.fillStyle = css(vc[k]); g.fillRect(x(V[k]) - 1.5, T, 3, B - T); g.fillText(k === 'total_disbelief' ? 'stops' : k, x(V[k]), vy[k] - 14 + (k === 'habit' ? 0 : 0)); }
    const y = (T + B) / 2 + 12;
    g.strokeStyle = css('--ink'); g.lineWidth = 3; g.beginPath(); g.moveTo(x(s.lo), y); g.lineTo(x(s.hi), y); g.stroke();
    for (const e of [s.lo, s.hi]) { g.beginPath(); g.moveTo(x(e), y - 7); g.lineTo(x(e), y + 7); g.stroke(); }
    g.fillStyle = css('--ink'); g.beginPath(); g.arc(x(s.irr), y, 6, 0, 7); g.fill();
    for (const n of [1, 32]) { const o = S.sweep[n]; g.strokeStyle = css('--mute'); g.lineWidth = 1.2; g.beginPath(); g.arc(x(o.irr), y + 20, 3.5, 0, 7); g.stroke(); g.fillStyle = css('--mute'); g.fillText(n === 1 ? 'page' : 'database', x(o.irr), y + 36); }
  }
  function read() {
    const s = S.sweep[st.n], f = s.first_of_two, o = f === 'learning' ? 'habit' : 'learning', m = s.multiple_to_exclude;
    const who = st.n === 1 ? ', the count the forecast office’s own page gives' : st.n === 32 ? ', the count the national database gives, and the one the Field fitted' : '';
    $('sv-n').textContent = st.n;
    document.querySelectorAll('#sv-btns button').forEach(b => b.setAttribute('aria-pressed', String(+b.dataset.n === st.n)));
    $('sv-iread').innerHTML = `<b>McLoud at ${st.n} injured${who}.</b> The Field's model then reads the ratio at <b>${s.irr.toFixed(3)}</b> (95 % interval ${s.lo.toFixed(3)}–${s.hi.toFixed(3)}). ` +
      `${s.all_inside ? 'The interval still holds all three villages.' : 'The interval no longer holds all three villages.'} ` +
      `If the point stayed there, a longer record would rule out ${VN[f]} first, at about ${m[f].toFixed(1)} times the record, and ${VN[o]} at about ${m[o].toFixed(1)} times. ` +
      (f === 'learning' ? `<b>The order is reversed</b> from the one coda I read off the record as fitted.` : `That is the order coda I read off the record as fitted.`);
  }
  function go() { draw(); read(); }
  $('sv-k').oninput = e => { st.n = +e.target.value; go(); };
  document.querySelectorAll('#sv-btns button').forEach(b => b.onclick = () => { st.n = +b.dataset.n; $('sv-k').value = st.n; go(); });
  for (const [id, v] of Object.entries({ 'svf-st': S.counts.states, 'svf-part': S.counts.part, 'svf-men': S.counts.mentions, 'svf-sil': S.counts.silent,
    'svf-share': Math.round(100 * S.pull_share_silent) + ' %', 'svf-flip': S.habit_first_from, 'svf-p1': S.sweep[1].irr.toFixed(3), 'svf-p32': S.sweep[32].irr.toFixed(3),
    'svf-loo': S.field.without_315890.irr.toFixed(3), 'svf-day': M.oun_day_injuries, 'svf-sday': M.storm_events_day_injuries_ok, 'svf-ounj': M.oun_injured, 'svf-sej': M.storm_events_injured })) $(id).textContent = v;
  window.__survey = () => ({ n: st.n, irr: S.sweep[st.n].irr, first: S.sweep[st.n].first_of_two, iread: $('sv-iread').innerText, read: $('sv-read').innerText, row: S.rows[st.row].om });
  card(0); go(); addEventListener('resize', draw);
})();
