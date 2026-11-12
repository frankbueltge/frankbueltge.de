// WHOSE GATE — the stream, the gates, the stakes. This work's own code, Apache-2.0, no library.
(() => {
'use strict';
const D = DATA, cv = document.getElementById('cv'), cx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const DAY = 86400000, YEAR = 365.25 * DAY, T0 = Date.parse(D.from);
const yr = iso => (Date.parse(iso) - T0) / YEAR;
const TMAX = yr(D.to), TCOUNT = yr(D.counted_to), TRAVEL = 0.22, MOUTH = 0.86, HW = 0.15, PLAY = 62;
const GU = [0.13, 0.30, 0.47, 0.64, 0.81];
const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const hash = n => { let x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const clamp = (x, a, b) => Math.max(a, Math.min(b, x)), smooth = x => x * x * (3 - 2 * x);

// --- grains: one per ten thousand H100-equivalents, born evenly across its quarter ---------------
const grains = [];
{ let prevEnd = 0, n = 0;
  for (const q of D.quarters) {
    const end = yr(q.q) + 1 / 365.25, every = q.smuggled_grains ? q.grains / q.smuggled_grains : 0;
    let next = every / 2;
    for (let i = 0; i < q.grains; i++) {
      let smug = false; if (every && i >= Math.floor(next)) { smug = true; next += every; }
      grains.push({ b: prevEnd + (end - prevEnd) * (i + hash(n + 7) * 0.9) / q.grains, c: hash(n) * 2 - 1, smug, delay: 0, held: -1, hu: 0, slot: -1, n: n++ });
    }
    prevEnd = end;
  }
}
const NORMAL = grains.filter(g => !g.smug), SMUG = grains.filter(g => g.smug);
SMUG.forEach((g, i) => g.k = i);

// --- stakes and posts ----------------------------------------------------------------------------
const stakes = D.stakes.map(s => ({ ...s, t: yr(s.date), gi: D.gates.findIndex(g => g.id === s.gate) }));
const border = stakes.filter(s => s.gate === 'border'), model = stakes.filter(s => s.gate === 'model');
const laws = D.laws.map(l => ({ ...l, t: Math.max(0, yr(l.since)), tp: l.power_since ? yr(l.power_since) : null, gi: D.gates.findIndex(g => g.id === l.gate) }));

// --- state ---------------------------------------------------------------------------------------
let T = 0, playing = false, last = 0, W = 0, H = 0, wide = true, geo = {}, basin = {}, pool = {}, col = {};
const closed = [false, false, false, false, false], queue = [0, 0, 0, 0, 0];
let nextSlot = 0, selected = -1, audio = null;

function layout() {
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  W = cv.clientWidth; wide = W >= 700; H = wide ? Math.max(440, Math.round(W * 0.5)) : Math.round(W * 2.3);
  cv.style.height = H + 'px'; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr); cx.setTransform(dpr, 0, 0, dpr, 0, 0);
  geo = wide ? { o: 18, len: W - 32, mid: H * 0.45, half: H * 0.40 } : { o: 34, len: H - 48, mid: W * 0.40, half: W * 0.37 };
  if (wide) { const x = P(0.875, 0)[0]; basin = { x, y: geo.mid - geo.half * 1.02, w: W - 14 - x, h: geo.half * 2.04 }; }
  else { const y = P(0.89, 0)[1]; basin = { x: 8, y, w: W - 16, h: H - 8 - y }; }
  basin.sp = Math.sqrt(basin.w * basin.h / 2140); basin.cols = Math.floor(basin.w / basin.sp);
  const pc = P(0.30, 0.70); pool = { x: pc[0], y: pc[1], sp: wide ? 4.3 : 3.5 };
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['paper', 'ink', 'soft', 'faint', 'us', 'ca', 'eu']) col[k] = cs.getPropertyValue('--' + k).trim();
}
const P = (u, v) => wide ? [geo.o + u * geo.len, geo.mid + v * geo.half] : [geo.mid - v * geo.half, geo.o + u * geo.len];
function inv(x, y) { return wide ? [(x - geo.o) / geo.len, (y - geo.mid) / geo.half] : [(y - geo.o) / geo.len, (geo.mid - x) / geo.half]; }
function slotXY(k) {
  const row = Math.floor(k / basin.cols), j = k % basin.cols, c0 = Math.floor(basin.cols / 2);
  const c = clamp(c0 + (j % 2 ? (j + 1) / 2 : -j / 2), 0, basin.cols - 1);
  return [basin.x + (c + 0.5) * (basin.w / basin.cols) + (hash(k + 3) - 0.5) * 1.4, basin.y + basin.h - (row + 0.55) * basin.sp + (hash(k + 9) - 0.5) * 1.4];
}
const DET = [[0.08, 0.10], [0.115, 0.42], [0.20, 0.42], [0.30, 0.70]];
function detour(p) {
  const s = clamp(p, 0, 1) * (DET.length - 1), i = Math.min(DET.length - 2, Math.floor(s)), f = s - i;
  return [DET[i][0] + (DET[i + 1][0] - DET[i][0]) * f, DET[i][1] + (DET[i + 1][1] - DET[i][1]) * f];
}
const poolXY = k => { const r = pool.sp * Math.sqrt(k + 0.5), a = k * 2.39996; return [pool.x + r * Math.cos(a), pool.y + r * Math.sin(a)]; };

// --- time ----------------------------------------------------------------------------------------
const uOf = g => (T - g.b - g.delay) / TRAVEL * MOUTH;
function reset() {           // on any jump in time: holds are dropped, the basin is refilled in order of arrival
  nextSlot = 0; queue.fill(0);
  for (const g of NORMAL) { g.delay = 0; g.held = -1; g.slot = uOf(g) >= MOUTH ? nextSlot++ : -1; }
}
function advance(dT) {
  const before = T; T = clamp(T + dT, 0, TMAX);
  for (let i = 0; i < 5; i++) if (!closed[i]) queue[i] = 0;
  for (const g of NORMAL) {
    if (g.slot >= 0 || g.b > T) continue;
    if (g.held >= 0) {
      if (closed[g.held]) { g.delay = T - g.b - g.hu * TRAVEL / MOUTH; continue; }
      g.held = -1;
    }
    const u = uOf(g), u0 = (before - g.b - g.delay) / TRAVEL * MOUTH;
    for (let i = 0; i < 5; i++) if (closed[i] && u0 < GU[i] && u >= GU[i] - 0.004) {
      g.held = i; g.hu = GU[i] - 0.006 - Math.floor(queue[i]++ / 9) * 0.0042; g.delay = T - g.b - g.hu * TRAVEL / MOUTH; break;
    }
    if (g.held < 0 && u >= MOUTH) g.slot = nextSlot++;
  }
  if (audio && dT > 0) for (const s of stakes) if (s.t > before && s.t <= T) knock(s);
}
function seek(t) { T = clamp(t, 0, TMAX); reset(); sync(); }

// --- drawing -------------------------------------------------------------------------------------
function line(a, b, dash) { cx.beginPath(); cx.setLineDash(dash || []); cx.moveTo(a[0], a[1]); cx.lineTo(b[0], b[1]); cx.stroke(); cx.setLineDash([]); }
function text(s, x, y, o = {}) {
  cx.font = (o.it ? 'italic ' : '') + (o.b ? '700 ' : '') + (o.size || 11) + 'px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
  cx.fillStyle = o.fill || col.ink; cx.textAlign = o.align || 'left'; cx.fillText(s, x, y);
}
function stake(x, y, s, p) {
  const c = col[s.public], top = y - 17 - (1 - p) * 16; cx.globalAlpha = p; cx.strokeStyle = c; cx.fillStyle = c; cx.lineWidth = 1.6;
  line([x, y - (1 - p) * 16], [x, top]);
  if (s.rung === 'inquiry') { cx.beginPath(); cx.setLineDash([2.5, 2.5]); cx.arc(x + 6.5, top + 4, 5, 0, 7); cx.stroke(); cx.setLineDash([]); }
  else { cx.beginPath(); cx.moveTo(x, top); cx.lineTo(x + 11, top + 4); cx.lineTo(x, top + 8); cx.closePath(); s.rung === 'admitted' ? cx.fill() : cx.stroke(); }
  if (selected === s.gi) { cx.beginPath(); cx.arc(x, y, 2.2, 0, 7); cx.fill(); }
  cx.globalAlpha = 1; cx.lineWidth = 1;
}
const stakeXY = s => s.gate === 'border' ? P(0.118 + border.indexOf(s) * (wide ? 0.017 : 0.023), 0.62) : P(GU[4] + 0.012 + model.indexOf(s) * 0.017, 0.46);

function draw() {
  cx.clearRect(0, 0, W, H); cx.lineWidth = 1; cx.strokeStyle = col.ink;
  // the passage and the basin
  line(P(0, -HW), P(MOUTH, -HW)); line(P(0, HW), P(MOUTH, HW));
  cx.strokeRect(basin.x, basin.y, basin.w, basin.h);
  cx.fillStyle = col.paper; const m0 = P(MOUTH, -HW), m1 = P(MOUTH, HW);
  wide ? cx.fillRect(basin.x - 2, m0[1] + 1, 4, m1[1] - m0[1] - 2) : cx.fillRect(m1[0] + 1, basin.y - 2, m0[0] - m1[0] - 2, 4);
  if (wide) { line(m0, [basin.x, m0[1]]); line(m1, [basin.x, m1[1]]); } else { line(m0, [m0[0], basin.y]); line(m1, [m1[0], basin.y]); }
  text('THE CHIP', ...(wide ? [geo.o, geo.mid - geo.half * HW - 8] : [P(0, 0)[0], geo.o - 8]), { size: 10, fill: col.soft, align: wide ? 'left' : 'center' });
  text('RUNNING', basin.x + (wide ? 6 : 0), basin.y + (wide ? 14 : -6), { size: 10, fill: col.soft });
  // the detour of the smuggled chips and its pool
  cx.strokeStyle = col.soft;
  if (T >= yr(D.smuggled.first) - 0.25) {
    for (let i = 0; i < DET.length - 1; i++) line(P(...DET[i]), P(...DET[i + 1]), [1.5, 4]);
    for (const n of D.smuggled.range) { cx.beginPath(); cx.setLineDash([1.5, 4]); cx.arc(pool.x, pool.y, pool.sp * Math.sqrt(n), 0, 7); cx.stroke(); cx.setLineDash([]); }
    const r = pool.sp * Math.sqrt(D.smuggled.range[1]);
    if (wide) text('smuggled into China, modelled: ' + D.smuggled.grains + ' grains (' + D.smuggled.range.join('–') + ')', pool.x - r, pool.y + r + 14, { size: 10, fill: col.soft });
    else { text('smuggled into China,', 6, pool.y + r + 13, { size: 10, fill: col.soft }); text('modelled: ' + D.smuggled.grains + ' (' + D.smuggled.range.join('–') + ')', 6, pool.y + r + 25, { size: 10, fill: col.soft }); }
  }
  // the gates
  D.gates.forEach((g, i) => {
    const unread = D.unread.includes(g.id), a = P(GU[i], -HW - 0.06), b = P(GU[i], HW + 0.06);
    cx.strokeStyle = unread ? col.soft : col.ink; cx.lineWidth = selected === i ? 2 : 1;
    line(a, b, [3, 4]); cx.lineWidth = 1;
    for (const p of [a, b]) { cx.fillStyle = col.paper; cx.fillRect(p[0] - 3.5, p[1] - 3.5, 7, 7); unread ? (cx.setLineDash([2, 2]), cx.strokeRect(p[0] - 3.5, p[1] - 3.5, 7, 7), cx.setLineDash([])) : cx.strokeRect(p[0] - 3.5, p[1] - 3.5, 7, 7); }
    if (closed[i]) { cx.strokeStyle = col.ink; cx.lineWidth = 4; line(P(GU[i], -HW), P(GU[i], HW)); cx.lineWidth = 1; }
    let [x, y] = wide ? [a[0], geo.mid - geo.half * 0.74] : [P(0, -HW)[0] + 16, a[1] - 14];
    const al = wide ? 'center' : 'left', step = 14;
    text(g.name.toUpperCase(), x, y, { b: true, align: al, fill: unread ? col.soft : col.ink }); y += step;
    text(g.at, x, y, { align: al, fill: col.soft }); y += step;
    if (unread) { text('not read yet', x, y, { it: true, align: al, fill: col.soft }); y += step; }
    for (const l of laws) if (l.gi === i && T >= l.t) {
      const label = l.public_name.replace(/^the /, ''), w = cx.measureText(label).width, x0 = wide ? x - w / 2 - 7 : x;
      cx.fillStyle = col[l.public]; cx.strokeStyle = col[l.public];
      (l.tp === null || T >= l.tp) ? cx.fillRect(x0, y - 8, 8, 8) : cx.strokeRect(x0 + 0.5, y - 7.5, 7, 7);
      text(label, x0 + 13, y, { align: 'left', fill: col[l.public] }); y += step;
    }
    if (closed[i]) text('your hand', x, y, { it: true, align: al });
    cx.strokeStyle = col.ink;
  });
  // the grains
  let moving = 0, heldN = 0, inBasin = 0, inPool = 0, born = 0;
  cx.fillStyle = col.ink;
  for (const g of NORMAL) {
    if (g.b > T) continue; born++;
    let x, y;
    if (g.slot >= 0) {
      inBasin++; const e = smooth(clamp((uOf(g) - MOUTH) / 0.07, 0, 1)), s = slotXY(g.slot), m = P(MOUTH, g.c * HW * 0.86);
      x = m[0] + (s[0] - m[0]) * e; y = m[1] + (s[1] - m[1]) * e;
    } else {
      const held = g.held >= 0; held ? heldN++ : moving++;
      [x, y] = P(held ? g.hu : uOf(g), g.c * HW * 0.86);
    }
    cx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
  }
  cx.strokeStyle = col.ink;
  for (const g of SMUG) {
    if (g.b > T) continue; born++;
    const p = (T - g.b) / TRAVEL; let x, y;
    if (p < 0.3) [x, y] = P(p / 0.3 * 0.08, g.c * HW * 0.5 + HW * 0.4);
    else if (p < 1) [x, y] = P(...detour((p - 0.3) / 0.7));
    else { inPool++; [x, y] = poolXY(g.k); }
    if (p < 1) moving++;
    cx.strokeRect(x - 1.3, y - 1.3, 2.6, 2.6);
  }
  // the stakes
  let planted = 0;
  for (const s of stakes) if (T >= s.t) { planted++; stake(...stakeXY(s), s, clamp((T - s.t) / 0.03, 0, 1)); }
  if (T >= border[0].t) {
    const k = border.filter(s => T >= s.t).length, c = { size: 10, fill: col.us };
    if (wide) { const x = P(0.118, 0)[0] - 12, y = P(0, 0.52)[1]; c.align = 'right'; text(k + (k === 1 ? ' stake,' : ' stakes,'), x, y, c); text('planted after', x, y + 12, c); text('the chips left', x, y + 24, c); }
    else { text('planted after', 6, P(0.078, 0)[1], c); text('the chips left', 6, P(0.078, 0)[1] + 12, c); }
  }
  // the date, and the end of the count
  const d = new Date(T0 + T * YEAR), when = MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  text(when, wide ? W - 16 : W - 8, wide ? H - 10 : 18, { size: 16, b: true, align: 'right' });
  if (T > TCOUNT + 0.02) {
    const s = 'no finished count after December 2025', a = clamp((T - TCOUNT) / TRAVEL, 0, 1); cx.globalAlpha = a;
    if (wide) text(s, P(0.47, 0)[0], geo.mid + 4, { it: true, align: 'center', fill: col.soft });
    else { const [x, y] = P(0.56, 0); cx.save(); cx.translate(x + 4, y); cx.rotate(-Math.PI / 2); text(s, 0, 0, { it: true, align: 'center', fill: col.soft }); cx.restore(); }
    cx.globalAlpha = 1;
  }
  Object.assign(cv.dataset, { born, moving, held: heldN, basin: inBasin, pool: inPool, stakes: planted, wide: wide ? 1 : 0 });
  if (audio) audio.gain.gain.setTargetAtTime(playing ? Math.min(0.22, Math.sqrt(moving) * 0.011) : 0, audio.ac.currentTime, 0.15);
  return { born, planted, moving, heldN };
}

// --- words ---------------------------------------------------------------------------------------
let said = '';
function say(st) {
  const kb = border.filter(s => T >= s.t).length, km = model.filter(s => T >= s.t).length;
  const h100 = st.born * D.grain, amount = h100 >= 1e6 ? (h100 / 1e6).toFixed(1) + ' million' : Math.round(h100 / 1e3) + ' thousand';
  let a = T > TCOUNT + TRAVEL ? 'The count ends in December 2025 at 20.9 million; the passage runs empty because nothing later is finished, not because anything stopped.'
    : 'About ' + amount + ' H100-equivalents counted so far, ' + st.born + (st.born === 1 ? ' grain.' : ' grains.');
  let b = !kb ? ' No public body has left a mark on the passage yet.'
    : ' ' + kb + (kb === 1 ? ' stake stands' : ' stakes stand') + ' at the border, planted after the chips had left' + (km ? '; one open ring at the last gate, an inquiry.' : '.') + ' No grain has been held.';
  if (st.heldN) b = ' Your hand holds ' + st.heldN + (st.heldN === 1 ? ' grain' : ' grains') + ' at the gate. Let go.';
  const s = a + b; if (s !== said) $('say').textContent = said = s;
}
function panel(i) {
  selected = i; const g = D.gates[i], p = $('panel'); p.textContent = '';
  const h = document.createElement('h3'); h.textContent = g.name + ' · ' + g.at; p.append(h);
  if (D.unread.includes(g.id)) { const q = document.createElement('p'); q.textContent = 'Not read yet. The Field is reading this gate in the present step; nothing is drawn here until its record is published. It is empty because it is unread, not because nothing happened.'; p.append(q); return; }
  const ul = document.createElement('ul');
  for (const l of laws.filter(l => l.gi === i)) {
    const li = document.createElement('li'), sw = document.createElement('span'); sw.className = 'sw ' + l.public;
    li.append(sw, l.name + ' — ' + l.public_name + ', by ' + l.hand + '. ' + l.note); ul.append(li);
  }
  for (const s of stakes.filter(s => s.gi === i)) {
    const li = document.createElement('li'), a = document.createElement('a'); a.href = s.url; a.textContent = 'the release'; a.rel = 'noopener';
    const who = [s.persons ? s.persons + (s.persons === 1 ? ' person' : ' people') : '', s.companies ? s.companies + ' company' : '', ...s.named].filter(Boolean).join(', ');
    const kind = s.rung === 'admitted' ? 'guilty plea' : s.rung === 'inquiry' ? 'inquiry' : 'charge';
    li.append(s.date + ' · ' + kind + ' · ' + who + ' · ' + s.what + ' · ', a); ul.append(li);
  }
  p.append(ul);
}

// --- sound ---------------------------------------------------------------------------------------
function startAudio() {
  const ac = new (window.AudioContext || window.webkitAudioContext)(), n = ac.sampleRate * 2, buf = ac.createBuffer(1, n, ac.sampleRate), d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true;
  const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600; f.Q.value = 0.6;
  const gain = ac.createGain(); gain.gain.value = 0; src.connect(f).connect(gain).connect(ac.destination); src.start();
  audio = { ac, gain };
}
function knock(s) {
  const ac = audio.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  o.type = 'triangle'; o.frequency.setValueAtTime(s.rung === 'inquiry' ? 420 : 190, t); o.frequency.exponentialRampToValueAtTime(s.rung === 'inquiry' ? 380 : 70, t + 0.18);
  g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + (s.rung === 'admitted' ? 0.6 : 0.28));
  if (pan) { pan.pan.value = GU[s.gi] * 2 - 1; o.connect(g).connect(pan).connect(ac.destination); } else o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + 0.7);
}

// --- controls ------------------------------------------------------------------------------------
function sync() { $('scrub').value = Math.round(T / TMAX * 1000); $('bPlay').setAttribute('aria-pressed', playing); $('bPlay').textContent = playing ? 'pause' : 'play'; }
function frame(now) {
  const dt = Math.min(0.1, (now - last) / 1000 || 0); last = now;
  if (playing) { advance(dt * TMAX / PLAY); if (T >= TMAX) playing = false; sync(); }
  else if (closed.some(Boolean)) advance(0);
  say(draw()); requestAnimationFrame(frame);
}
function hold(i, on) { closed[i] = on; const b = $('holds').querySelectorAll('button')[i]; if (b) b.setAttribute('aria-pressed', on); if (on) panel(i); }
$('bPlay').onclick = () => { if (!playing && T >= TMAX) seek(0); playing = !playing; if (audio) audio.ac.resume(); sync(); };
$('bStart').onclick = () => { seek(0); playing = true; sync(); };
$('scrub').oninput = e => { playing = false; seek(e.target.value / 1000 * TMAX); };
$('bSound').onclick = e => { let on = true; if (!audio) startAudio(); else if (audio.ac.state === 'running') { audio.ac.suspend(); on = false; } else audio.ac.resume(); e.target.setAttribute('aria-pressed', on); };
D.gates.forEach((g, i) => {
  const b = document.createElement('button'); b.textContent = g.at.replace('the ', ''); b.setAttribute('aria-pressed', false); b.setAttribute('aria-label', 'hold the gate at ' + g.at);
  b.onpointerdown = () => hold(i, true); b.onpointerup = b.onpointerleave = b.onpointercancel = () => hold(i, false);
  b.onkeydown = e => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) hold(i, !closed[i]); if (e.key === ' ' || e.key === 'Enter') e.preventDefault(); };
  b.onclick = e => e.preventDefault(); $('holds').append(b);
});
let down = -1;
cv.onpointerdown = e => {
  const r = cv.getBoundingClientRect(), [u, v] = inv(e.clientX - r.left, e.clientY - r.top);
  let i = GU.findIndex(g => Math.abs(u - g) < 0.07); if (i < 0 || v > 0.75) return;
  if (Math.abs(v) < 0.4) { down = i; hold(i, true); cv.setPointerCapture(e.pointerId); } else panel(i);
};
cv.onpointerup = cv.onpointercancel = () => { if (down >= 0) hold(down, false); down = -1; };
window.addEventListener('resize', () => { layout(); });
window.matchMedia('(prefers-color-scheme:dark)').addEventListener('change', layout);
$('s65').href = D.field.study65; $('s70').href = D.field.study70;

// --- open ----------------------------------------------------------------------------------------
layout(); panel(0); selected = -1;
const m = /t=(\d{4}-\d\d-\d\d)/.exec(location.hash), still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
if (m) seek(yr(m[1])); else if (still) seek(TCOUNT); else { seek(0); playing = true; sync(); }
window.WG = { seek: iso => seek(yr(iso)), step: years => { advance(years); return draw(); }, hold, pause: () => { playing = false; sync(); } };
requestAnimationFrame(frame);
})();
