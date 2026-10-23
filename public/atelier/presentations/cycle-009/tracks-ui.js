// Coda IV, corrected again (2026-10-23, seventh session): one tornado, two rows. The Field's correction (ho-2026-10-22-field-7), checked.
(() => {
  const $ = id => document.getElementById(id), css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const T = window.TRACKS, V = T.villages, esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const VN = { learning: 'the village that learns', habit: 'the village of habit' };
  const fix = (cv, h) => { const r = window.devicePixelRatio || 1, wd = cv.clientWidth; cv.width = wd * r; cv.height = h * r; const g = cv.getContext('2d'); g.setTransform(r, 0, 0, r, 0, 0); return [g, wd, h]; };
  const st = { mc: 32, la: 'two rows' };
  const cell = () => T.cells.find(c => c.mcloud === st.mc && c.louisiana === st.la);

  // the track, drawn from the database's own coordinates
  function track() {
    const [g, W, H] = fix($('tr-map'), 170), S = T.track.segments, one = st.la === 'one track';
    const pts = S.flatMap(s => [s.start, s.stop]).map(p => p.map(Number));
    const la0 = Math.min(...pts.map(p => p[0])), la1 = Math.max(...pts.map(p => p[0])), lo0 = Math.min(...pts.map(p => p[1])), lo1 = Math.max(...pts.map(p => p[1]));
    const k = Math.min((W - 60) / ((lo1 - lo0) * Math.cos(30 * Math.PI / 180)), (H - 70) / (la1 - la0));
    const ox = (W - (lo1 - lo0) * Math.cos(30 * Math.PI / 180) * k) / 2, x = p => ox + (p[1] - lo0) * Math.cos(30 * Math.PI / 180) * k, y = p => H - 40 - (p[0] - la0) * k;
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.lineCap = 'round';
    S.forEach((s, i) => {
      const a = s.start.map(Number), b = s.stop.map(Number);
      g.strokeStyle = css(one ? '--ink' : (i ? '--accent' : '--amber')); g.lineWidth = one ? 5 : 4 + (i ? 0 : 0);
      g.beginPath(); g.moveTo(x(a), y(a)); g.lineTo(x(b), y(b)); g.stroke();
      g.fillStyle = css('--mute'); g.textAlign = i ? 'right' : 'left';
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
      if (!one) { g.textAlign = i ? 'right' : 'left'; g.fillText(W < 600 ? `${s.parish}: ${s.ef}, ${s.inj} injured` : `${s.parish}: ${s.ef}, ${s.len_mi} mi, ${s.inj} injured${s.deaths ? ', ' + s.deaths + ' dead' : ''}`, x(m) + (i ? -12 : 12), i ? y(m) - 10 : y(m) + 18); }
    });
    const j = S[0].stop.map(Number);
    g.fillStyle = css('--bg'); g.strokeStyle = css('--ink'); g.lineWidth = 1.5; g.beginPath(); g.arc(x(j), y(j), 5, 0, 7); g.fill(); g.stroke();
    g.fillStyle = css('--mute'); g.textAlign = 'center';
    g.fillText(one ? (W < 600 ? 'one tornado: EF3, 20.73 mi, 75 injured' : 'one tornado: EF3, 20.73 mi, 75 injured, 2 dead (the narratives’ reading)') : (W < 600 ? `one ends where the next begins, ${S[0].end.slice(10, 15)}` : `${S[0].end.slice(10, 15)}, ${j[0]}, ${j[1]}: one segment ends where the next begins`), W / 2, H - 8);
  }

  // the Field's ratio, refitted on each reading
  function draw() {
    const s = cell(), [g, W, H] = fix($('tr-int'), 200), L = 20, R = W - 20, Tp = 26, B = H - 46;
    const lo = Math.log(0.75), hi = Math.log(2.15), x = v => L + (R - L) * (Math.log(v) - lo) / (hi - lo);
    g.clearRect(0, 0, W, H); g.font = '12px system-ui'; g.textAlign = 'center';
    g.strokeStyle = css('--rule'); g.lineWidth = 1; g.beginPath(); g.moveTo(L, B); g.lineTo(R, B); g.stroke();
    for (const v of [0.8, 1, 1.2, 1.4, 1.6, 1.8, 2]) { g.fillStyle = css('--mute'); g.fillText(v.toFixed(1), x(v), B + 16); g.beginPath(); g.moveTo(x(v), B - 3); g.lineTo(x(v), B + 3); g.stroke(); }
    g.fillText('injured after a run of empty warnings, times the injured right after a hit', W / 2, H - 6);
    g.setLineDash([4, 4]); g.strokeStyle = css('--mute'); g.beginPath(); g.moveTo(x(T.crossing), Tp - 12); g.lineTo(x(T.crossing), B); g.stroke(); g.setLineDash([]);
    g.fillStyle = css('--mute'); g.fillText(W < 600 ? 'parting' : 'where learning and habit part', x(T.crossing), Tp - 14);
    const vc = { learning: '--calm', habit: '--amber', total_disbelief: '--accent' };
    for (const k of Object.keys(V)) { g.fillStyle = css(vc[k]); g.fillRect(x(V[k]) - 1.5, Tp + 4, 3, B - Tp - 4); g.fillText(k === 'total_disbelief' ? 'stops' : k, x(V[k]) + (k === 'learning' ? -26 : 22), Tp + 14); }
    const y = (Tp + B) / 2 + 4;
    g.strokeStyle = css('--ink'); g.lineWidth = 3; g.beginPath(); g.moveTo(x(s.lo), y); g.lineTo(x(s.hi), y); g.stroke();
    for (const e of [s.lo, s.hi]) { g.beginPath(); g.moveTo(x(e), y - 7); g.lineTo(x(e), y + 7); g.stroke(); }
    g.fillStyle = css('--ink'); g.beginPath(); g.arc(x(s.irr), y, 6, 0, 7); g.fill();
    T.cells.forEach((c, i) => { // the four readings, as small rings under the axis line
      const yy = y + 22, on = c === s; g.strokeStyle = css(on ? '--ink' : '--mute'); g.lineWidth = on ? 2 : 1.2;
      g.beginPath(); g.arc(x(c.irr), yy, 3.5, 0, 7); g.stroke();
    });
  }
  function read() {
    const s = cell(), f = s.first_of_two, o = f === 'learning' ? 'habit' : 'learning', m = s.multiple_to_exclude;
    document.querySelectorAll('#tr-cards .card').forEach(c => c.setAttribute('aria-pressed', String(+c.dataset.mc === st.mc && c.dataset.la === st.la)));
    const rec = st.mc === T.official_mcloud && st.la === 'two rows';
    $('tr-read').innerHTML = `<b>McLoud at ${st.mc} injured (${st.mc === T.official_mcloud ? 'the office’s official report' : 'the office’s event page'}); the Louisiana tornado as ${st.la === 'two rows' ? 'the SPC file’s two tornadoes' : 'the one track its two narratives describe'}.</b> ` +
      `The Field's model reads <b>${s.irr.toFixed(3)}</b> (95 % interval ${s.lo.toFixed(3)}–${s.hi.toFixed(3)}), ${s.above_parting ? 'above' : 'below'} the parting at ${T.crossing.toFixed(3)}. ` +
      `${s.all_inside ? 'The interval still holds all three villages.' : 'The interval no longer holds all three villages.'} ` +
      `If the point stayed there, a longer record would rule out ${VN[f]} first, at about ${m[f].toFixed(1)} times the record, and ${VN[o]} at about ${m[o].toFixed(1)} times. ` +
      (rec ? 'This is the record as the Field fitted it, and the order coda I read.' : f === 'learning' ? '<b>The order coda I read is reversed.</b>' : 'The order coda I read holds.');
    track(); draw();
  }
  $('tr-cards').innerHTML = T.cells.map(c => `<button class="card" data-mc="${c.mcloud}" data-la="${c.louisiana}" aria-pressed="false" style="border-left-color:var(${c.first_of_two === 'habit' ? '--calm' : '--accent'})">` +
    `<b>${c.irr.toFixed(3)}</b> <span class="d">McLoud ${c.mcloud} injured (${c.mcloud === T.official_mcloud ? 'official report' : 'event page'})</span><span class="d">Louisiana as ${c.louisiana === 'two rows' ? 'two rows (SPC)' : 'one track (narratives)'}</span></button>`).join('');
  document.querySelectorAll('#tr-cards .card').forEach(c => c.onclick = () => { st.mc = +c.dataset.mc; st.la = c.dataset.la; read(); });
  $('tr-s0').textContent = T.track.segments[0].crossing_sentence; $('tr-s1').textContent = T.track.segments[1].crossing_sentence;
  const one = T.cells.find(c => c.mcloud === T.official_mcloud && c.louisiana === 'one track');
  for (const [id, v] of Object.entries({ 'trf-one': one.irr.toFixed(3), 'trf-cross': T.crossing.toFixed(3), 'trf-l': one.multiple_to_exclude.learning.toFixed(1), 'trf-h': one.multiple_to_exclude.habit.toFixed(1) })) $(id).textContent = v;
  window.__tracks = () => ({ mc: st.mc, la: st.la, irr: cell().irr, first: cell().first_of_two, read: $('tr-read').innerText });
  read(); addEventListener('resize', () => { track(); draw(); });
})();
