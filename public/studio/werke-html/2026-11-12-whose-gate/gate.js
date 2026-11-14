// WHOSE GATE — the stream, the gates, the stakes. This work's own code, Apache-2.0, no library.
(() => {
'use strict';
const D = DATA, cv = document.getElementById('cv'), cx = cv.getContext('2d');
const $ = id => document.getElementById(id);
const DAY = 86400000, YEAR = 365.25 * DAY, T0 = Date.parse(D.from);
const yr = iso => (Date.parse(iso) - T0) / YEAR;
const TMAX = yr(D.to), TCOUNT = yr(D.counted_to), TRAVEL = 0.22, MOUTH = 0.86, HW = 0.32, PLAY = 62;
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
// --- the acts of step 2: each keeps one lane on its gate, in order of its date ----------------------
const acts = D.acts.map(a => ({ ...a, t: Math.max(0, yr(a.date)), te: a.end ? yr(a.end) : null, gi: D.gates.findIndex(g => g.id === a.gate) }));
D.gates.forEach((g, i) => { const at = acts.filter(a => a.gi === i).sort((a, b) => a.t - b.t || (a.id < b.id ? -1 : 1)); at.forEach((a, k) => { a.k = k; a.n = at.length; }); });
const ENDED = a => a.te !== null && T >= a.te && (a.state === 'lifted' || a.state === 'superseded');
const LOOSE = a => a.state === 'loosened' && T >= a.te;
const AROUND = a => a.state === 'gone around' && T >= a.te;
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
  const pc = P(0.15, 0.80); pool = { x: pc[0], y: pc[1], sp: wide ? 4.3 : 3.5 };
  const cs = getComputedStyle(document.documentElement);
  for (const k of ['paper', 'ink', 'soft', 'faint', 'us', 'ca', 'eu', 'ie', 'it', 'nl', 'br', 'cl', 'id', 'sg']) col[k] = cs.getPropertyValue('--' + k).trim();
}
const P = (u, v) => wide ? [geo.o + u * geo.len, geo.mid + v * geo.half] : [geo.mid - v * geo.half, geo.o + u * geo.len];
function inv(x, y) { return wide ? [(x - geo.o) / geo.len, (y - geo.mid) / geo.half] : [(y - geo.o) / geo.len, (geo.mid - x) / geo.half]; }
function slotXY(k) {
  const row = Math.floor(k / basin.cols), j = k % basin.cols, c0 = Math.floor(basin.cols / 2);
  const c = clamp(c0 + (j % 2 ? (j + 1) / 2 : -j / 2), 0, basin.cols - 1);
  return [basin.x + (c + 0.5) * (basin.w / basin.cols) + (hash(k + 3) - 0.5) * 1.4, basin.y + basin.h - (row + 0.55) * basin.sp + (hash(k + 9) - 0.5) * 1.4];
}
// the smuggled chips leave before the border gate and run around it, outside the wall
const DET = [[0.08, HW - 0.03], [0.10, HW + 0.13], [0.16, HW + 0.13], [0.15, 0.80]];
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
  if (audio && dT > 0) {
    for (const s of stakes) if (s.t > before && s.t <= T) knock(s);
    for (const a of acts) { if (a.t > before && a.t <= T) tone(a, a.effect === 'stopped' ? 98 : a.effect === 'delayed' ? 147 : 330, 0.5);
      if (a.te !== null && a.te > before && a.te <= T) tone(a, a.state === 'gone around' ? 523 : 262, 0.25); }
  }
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
const stakeXY = s => s.gate === 'border' ? P(0.215 + border.indexOf(s) * (wide ? 0.017 : 0.023), wide ? 0.62 : 0.50) : P(GU[4] + 0.012 + model.indexOf(s) * 0.017, 0.46);

function lane(a) { const w = 2 * HW / a.n, c = -HW + (a.k + 0.5) * w; return [c, w * 0.42]; }
let holes = [];   // the standing stops' rectangles this frame: a grain passing one is drawn as a hole in it
function actMark(a, p) {
  const [c, l0] = lane(a), u = GU[a.gi], colr = col[a.public], du = (wide ? 13 : 10) / geo.len, ended = ENDED(a), loose = LOOSE(a);
  const l = loose ? l0 * 0.45 : l0;
  cx.globalAlpha = p * (ended ? 0.38 : 1); cx.strokeStyle = colr; cx.fillStyle = colr; cx.lineWidth = 1.5;
  const q0 = P(u - du, c - l), q1 = P(u + du, c + l), x = Math.min(q0[0], q1[0]), y = Math.min(q0[1], q1[1]), w = Math.abs(q1[0] - q0[0]), h = Math.abs(q1[1] - q0[1]);
  if (a.effect === 'conditioned') {
    const [px, py] = P(u, c), r = Math.min(6, Math.min(w, h) / 2 + 1);
    cx.beginPath(); cx.arc(px, py, r, 0, 7); (a.local || ended) ? cx.stroke() : cx.fill();
  } else if (a.effect === 'delayed') {
    cx.setLineDash([2, 2]); cx.strokeRect(x + 0.5, y + 0.5, w - 1, h - 1); cx.setLineDash([]);
    if (!a.local && !ended) { cx.globalAlpha *= 0.35; cx.fillRect(x, y, w, h); }
  } else { (a.local || ended) ? cx.strokeRect(x + 0.75, y + 0.75, w - 1.5, h - 1.5) : cx.fillRect(x, y, w, h); if (!ended) holes.push([x, y, w, h]); }
  // the chips it met: an empty dotted box after every mark, because no record counts them; then what it met, in its own unit
  { cx.globalAlpha = p; const s = Math.max(5, Math.min(11, 2 * l0 * geo.half - 3)), [bx, by] = P(u + du + 5 / geo.len + s / 2 / geo.len, c);
    cx.strokeStyle = col.ink; cx.lineWidth = 1; cx.setLineDash([1.5, 1.5]); cx.strokeRect(bx - s / 2 + 0.5, by - s / 2 + 0.5, s - 1, s - 1); cx.setLineDash([]); boxes++;
    if (wide) text(a.met_word, bx + s / 2 + 4, by + 3.5, { size: 9.5, b: !!a.size, fill: a.size ? col.ink : col.soft });
    if (a.id === D.virginia.act && !ended) { const r = Math.sqrt(D.virginia.sqft / 1e6) * (wide ? 3.2 : 2.4), [vx, vy] = P(u, -HW - 0.02); cx.strokeStyle = colr; cx.setLineDash([3, 3]); cx.beginPath(); cx.arc(vx, vy - r, r, 0, 7); cx.stroke(); cx.setLineDash([]);
      if (wide) text('floor: 21.7M sq ft · chips: none stated', vx + r + 4, vy - r + 3, { size: 9, fill: colr }); }
    cx.strokeStyle = colr; }
  if (selected === a.gi && !ended) { cx.globalAlpha = p; const [px, py] = P(u, c); cx.beginPath(); cx.arc(px, py, 1.4, 0, 7); cx.fillStyle = col.paper; cx.fill(); }
  let st = ended ? 'ended' : 'stands';
  if (AROUND(a)) {             // the way around: from before the gate, outside the wall, to after it
    st = 'around'; const side = c < 0 ? -1 : 1, e = clamp((T - a.te) / 0.05, 0, 1);
    const s0 = P(u - 0.035, c), m = P(u, side * (HW + 0.1 + 0.03 * a.k / Math.max(1, a.n))), s1 = P(u + 0.035 * e, c);
    cx.globalAlpha = p; cx.lineWidth = 1.3; cx.setLineDash([2, 3]); cx.beginPath(); cx.moveTo(...s0); cx.quadraticCurveTo(...m, ...s1); cx.stroke(); cx.setLineDash([]);
  }
  cx.globalAlpha = 1; cx.lineWidth = 1; return st;
}
let boxes = 0;
// after the last finished count the passage fills with hatching, from the chip end, as fast as grains would have come
function uncounted() {
  if (T <= TCOUNT) return; const front = Math.min(MOUTH, (T - TCOUNT) / TRAVEL * MOUTH);
  const a = P(0, -HW), b = P(front, HW), x = Math.min(a[0], b[0]), y = Math.min(a[1], b[1]), w = Math.abs(b[0] - a[0]), h = Math.abs(b[1] - a[1]);
  cx.save(); cx.beginPath(); cx.rect(x, y, w, h); cx.clip(); cx.strokeStyle = col.faint; cx.lineWidth = 1;
  for (let k = -h; k < w; k += 7) { cx.beginPath(); cx.moveTo(x + k, y + h); cx.lineTo(x + k + h, y); cx.stroke(); }
  cx.restore();
}
// what became of the stops, so far: one bar each, grouped by their afterwards
const FATE = [['stands', 'stand'], ['loosened', 'loosened in part'], ['gone around', 'gone around'], ['lifted', 'lifted'], ['superseded', 'replaced']];
function tally() {
  const st = acts.filter(a => a.effect === 'stopped' && T >= a.t), out = [];
  if (!st.length) return out;
  const fate = a => (a.te !== null && T >= a.te) ? a.state : 'stands';
  let u = wide ? 0.43 : 0.50; const v = wide ? 0.70 : 0.86, bw = wide ? 7 : 6, bh = wide ? 22 : 16;
  const [tx, ty] = P(u, v); text('THE STOPS, AT THIS DATE', wide ? tx : 4, wide ? ty - bh / 2 - 8 : ty - 22, { size: 9.5, b: true, fill: col.soft });
  cx.font = (wide ? 10 : 9) + 'px ui-monospace,SFMono-Regular,Menlo,Consolas,monospace';
  for (const [k, label] of FATE) {
    const g = st.filter(a => fate(a) === k); out.push(g.length); if (!g.length) continue;
    const u0 = u, lab = g.length + ' ' + (wide ? label : label.replace(' in part', '').replace('gone ', '')), lw = cx.measureText(lab).width;
    for (const a of g) {
      const [x, y] = P(u, v), c = col[a.public]; cx.fillStyle = c; cx.strokeStyle = c; cx.lineWidth = 1.5;
      const [w, h] = wide ? [bw, bh] : [bh, bw], rx = x - w / 2, ry = y - h / 2;
      if (k === 'lifted' || k === 'superseded') { cx.globalAlpha = 0.5; cx.strokeRect(rx + 0.75, ry + 0.75, w - 1.5, h - 1.5); cx.globalAlpha = 1; }
      else if (k === 'loosened') { wide ? cx.fillRect(rx, ry + h * 0.55, w, h * 0.45) : cx.fillRect(rx, ry, w * 0.45, h); cx.strokeRect(rx + 0.75, ry + 0.75, w - 1.5, h - 1.5); }
      else { a.local ? cx.strokeRect(rx + 0.75, ry + 0.75, w - 1.5, h - 1.5) : cx.fillRect(rx, ry, w, h);
        if (k === 'gone around') { cx.setLineDash([2, 2]); cx.beginPath(); wide ? cx.arc(x, ry, bw * 0.8, Math.PI, 0) : cx.arc(rx, y, bw * 0.8, Math.PI / 2, Math.PI * 1.5); cx.stroke(); cx.setLineDash([]); } }
      u += (bw + 4) / geo.len;
    }
    const [sx, sy] = P(u0, v);
    if (wide) { text(lab, sx - bw / 2, sy + bh / 2 + 14, { size: 10, fill: col.ink }); u = Math.max(u, u0 + (lw + 18) / geo.len); }
    else { text(lab, sx + bh / 2 + 6, sy + 3, { size: 9, fill: col.ink }); u += 8 / geo.len; }
    cx.lineWidth = 1;
  }
  return out;
}
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
    else { text('smuggled into China,', 6, pool.y - r - 20, { size: 9, fill: col.soft }); text('modelled: ' + D.smuggled.grains + ' (' + D.smuggled.range.join('–') + ')', 6, pool.y - r - 9, { size: 9, fill: col.soft }); }
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
    else { const here = acts.filter(a => a.gi === i && T >= a.t), n = here.length;
      text(D.acts.some(a => a.gate === g.id) ? (n ? n + (n === 1 ? ' act' : ' acts') + ' so far' : 'no act yet') : 'read: no act found', x, y, { it: !n, align: al, fill: col.soft }); y += step; }
    for (const l of laws) if (l.gi === i && T >= l.t) {
      const label = l.public_name.replace(/^the /, ''), w = cx.measureText(label).width, x0 = wide ? x - w / 2 - 7 : x;
      cx.fillStyle = col[l.public]; cx.strokeStyle = col[l.public];
      (l.tp === null || T >= l.tp) ? cx.fillRect(x0, y - 8, 8, 8) : cx.strokeRect(x0 + 0.5, y - 7.5, 7, 7);
      text(label, x0 + 13, y, { align: 'left', fill: col[l.public] }); y += step;
    }
    if (closed[i]) text('your hand: no public, no law', x, y, { it: true, align: al });
    cx.strokeStyle = col.ink;
  });
  // the acts: a bar for a stop, a comb for a delay, a ring for a condition; none of them holds a grain
  let standing = { stopped: 0, delayed: 0, conditioned: 0 }, around = 0, ended = 0, seen = 0, loose = 0; holes = []; boxes = 0;
  uncounted();
  for (const a of acts) if (T >= a.t) { seen++; const st = actMark(a, clamp((T - a.t) / 0.03, 0, 1)); if (st === 'ended') ended++; else { standing[a.effect]++; if (st === 'around') around++; if (LOOSE(a)) loose++; } }
  const tl = tally();
  // the grains
  let moving = 0, heldN = 0, inBasin = 0, inPool = 0, born = 0, through = 0;
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
    if (g.slot < 0 && holes.some(r => x > r[0] && x < r[0] + r[2] && y > r[1] && y < r[1] + r[3])) { through++; cx.fillStyle = col.paper; cx.fillRect(x - 1.6, y - 1.6, 3.2, 3.2); cx.fillStyle = col.ink; }
    else cx.fillRect(x - 1.2, y - 1.2, 2.4, 2.4);
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
    if (wide) { const x = P(0.215 + 6 * 0.017, 0)[0] + 4, y = P(0, 0.56)[1]; text(k + (k === 1 ? ' stake,' : ' stakes,'), x, y, c); text('planted after', x, y + 12, c); text('the chips left', x, y + 24, c); }
    else { const y = P(0.215 + 6 * 0.023, 0)[1] + 4; text(k + ' stakes, planted', 6, y, c); text('after the chips left', 6, y + 12, c); }
  }
  // the date, and the end of the count
  const d = new Date(T0 + T * YEAR), when = MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
  text(when, wide ? W - 16 : W - 8, wide ? H - 10 : 18, { size: 16, b: true, align: 'right' });
  if (T > TCOUNT + 0.02) {
    const s = 'not yet counted, not empty: no finished count after December 2025', a = clamp((T - TCOUNT) / TRAVEL, 0, 1); cx.globalAlpha = a;
    if (wide) text(s, P(0.47, 0)[0], P(0, HW)[1] + 16, { it: true, align: 'center', fill: col.soft });
    else { const [x, y] = P(0.56, HW - 0.07); cx.save(); cx.translate(x + 4, y); cx.rotate(-Math.PI / 2); text(s, 0, 0, { it: true, align: 'center', fill: col.soft }); cx.restore(); }
    cx.globalAlpha = 1;
  }
  Object.assign(cv.dataset, { born, moving, held: heldN, basin: inBasin, pool: inPool, stakes: planted, wide: wide ? 1 : 0,
    acts: seen, stops: standing.stopped, delays: standing.delayed, conditions: standing.conditioned, around, ended, loose, boxes, through,
    tally: tl.join(',') });
  if (audio) audio.gain.gain.setTargetAtTime(playing ? Math.min(0.22, Math.sqrt(moving) * 0.011) : 0, audio.ac.currentTime, 0.15);
  return { born, planted, moving, heldN, standing, around, ended, seen, loose };
}

// --- words ---------------------------------------------------------------------------------------
let said = '';
function say(st) {
  const kb = border.filter(s => T >= s.t).length, km = model.filter(s => T >= s.t).length;
  const h100 = st.born * D.grain, amount = h100 >= 1e6 ? (h100 / 1e6).toFixed(1) + ' million' : Math.round(h100 / 1e3) + ' thousand';
  let a = T > TCOUNT + TRAVEL ? 'The count ends in December 2025 at 20.9 million; after it the passage fills with hatching, because chips kept coming that nobody has counted yet.'
    : 'About ' + amount + ' H100-equivalents counted so far, ' + st.born + (st.born === 1 ? ' grain.' : ' grains.');
  const S = st.standing, n = (k, one, many) => k + ' ' + (k === 1 ? one : many);
  let b = !st.seen ? ' No public body has acted on the passage yet.'
    : ' Standing at this date: ' + n(S.stopped, 'stop', 'stops') + (st.around || st.loose ? ' (' + [st.around ? st.around + ' gone around' : '', st.loose ? st.loose + ' loosened in part' : ''].filter(Boolean).join(', ') + ')' : '') + ', ' + n(S.delayed, 'delay', 'delays') + ', ' + n(S.conditioned, 'condition', 'conditions')
      + (st.ended ? '; ' + st.ended + ' lifted or replaced' : '') + '. Every box after a mark is empty: no record counts the chips it met, so the stream passes through the bars.';
  if (st.heldN) b = ' Your hand holds ' + st.heldN + (st.heldN === 1 ? ' grain' : ' grains') + ' at the gate: the only stop here that answers to no public, no law and no ground. Let go.';
  const s = a + b; if (s !== said) $('say').textContent = said = s;
}
function panel(i) {
  selected = i; const g = D.gates[i], p = $('panel'); p.textContent = '';
  const h = document.createElement('h3'); h.textContent = g.name + ' · ' + g.at; p.append(h);
  if (D.unread.includes(g.id)) { const q = document.createElement('p'); q.textContent = 'Not read yet. The Field is reading this gate in the present step; nothing is drawn here until its record is published. It is empty because it is unread, not because nothing happened.'; p.append(q); return; }
  const ul = document.createElement('ul');
  const mine = acts.filter(a => a.gi === i).sort((a, b) => a.t - b.t);
  if (!mine.length) { const q = document.createElement('p'); q.textContent = 'Read, and no act found. The Field searched this gate in step 2 and found no merger or contract review that stopped, delayed or put conditions on compute. Its set is a found set, not a census.'; p.append(q); }
  const EFF = { stopped: 'stopped', delayed: 'delayed', conditioned: 'put conditions' };
  for (const a of mine) {
    const li = document.createElement('li'), sw = document.createElement('span'), r = document.createElement('a');
    sw.className = 'sw ' + a.public + (a.local ? ' local' : ''); r.href = a.url; r.textContent = 'the record'; r.rel = 'noopener';
    li.append(sw, a.when + ' · ' + a.body + (a.local ? ' (a local public, ' : ' (') + a.country + ') ' + EFF[a.effect] + (a.named ? ' · named: ' + a.named : '') + ' · ' + a.what
      + ' · what it met: ' + a.met + (a.size ? ' · size its record states: ' + a.size : ' · its record states no size') + ' · chips it met: no record says'
      + (a.corrected.includes('effect') ? ' · corrected by the Field\'s check of 14 November: a delay by its own word, first coded a stop' : '')
      + ' · on 13 November 2026: ' + (a.state === 'loosened' ? 'loosened in part (the Field codes it lifted; its own note and the release say in part)' : a.state) + '. ' + a.after + (a.end ? ' (drawn ' + (a.approx ? 'about ' : '') + a.end.slice(0, 7) + ')' : '') + (a.second_hand ? ' Read second-hand by the Field.' : '') + ' · ', r);
    ul.append(li);
  }
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

function tone(a, f, len) {
  const ac = audio.ac, t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(), pan = ac.createStereoPanner ? ac.createStereoPanner() : null;
  o.type = 'sine'; o.frequency.setValueAtTime(f, t); g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.35, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + len);
  if (pan) { pan.pan.value = GU[a.gi] * 2 - 1; o.connect(g).connect(pan).connect(ac.destination); } else o.connect(g).connect(ac.destination);
  o.start(t); o.stop(t + len + 0.05);
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
{ const lg = $('legend'), seen = new Map();
  for (const a of D.acts) seen.set(a.public, [a.country, (seen.get(a.public) || [0, 0])[1] + 1]);
  for (const [k, [name, n]] of [...seen].sort((a, b) => b[1][1] - a[1][1])) { const e = document.createElement('span'), sw = document.createElement('span'); sw.className = 'sw ' + k; e.append(sw, name + ' ' + n); lg.append(e); }
  for (const l of D.laws.filter(l => !seen.has(l.public))) { const e = document.createElement('span'), sw = document.createElement('span'); sw.className = 'sw ' + l.public; e.append(sw, l.public_name.replace(/^the /, '') + ' (law)'); lg.append(e); seen.set(l.public, 1); }
  const k = document.createElement('span'); k.className = 'key'; k.textContent = '▮ stop · ┆ delay · ● condition · hollow = a local public · faded = lifted or replaced · thinned = loosened in part · dotted path = gone around · ⬚ after each mark = the chips it met, empty in all 28 records · the word after it = what it met, in its own unit (bold where the record states a size; chips* = a threshold on chips, not a count) · a hole punched in a bar = a grain passing a stop that stands · hatched = not yet counted'; lg.append(k); }
$('s65').href = D.field.study65; $('s70').href = D.field.study70; $('s72').href = D.field.study72; $('s73').href = D.field.study73;

// --- open ----------------------------------------------------------------------------------------
layout(); $('panel').textContent = 'Press a gate\'s name in the drawing, or hold a gate below, to read every act on it with its record.';
const m = /t=(\d{4}-\d\d-\d\d)/.exec(location.hash), still = window.matchMedia('(prefers-reduced-motion:reduce)').matches;
if (m) seek(yr(m[1])); else if (still) seek(TCOUNT); else { seek(0); playing = true; sync(); }
window.WG = { seek: iso => seek(yr(iso)), step: years => { advance(years); return draw(); }, hold, pause: () => { playing = false; sync(); } };
requestAnimationFrame(frame);
})();
