const els=[];function mk(t){return {t,a:{},kids:[],setAttribute(k,v){this.a[k]=v},appendChild(c){this.kids.push(c);els.push(c)},set textContent(v){this.tx=v}}}
const document={getElementById:()=>mk('svg'),createElementNS:(n,t)=>mk(t)};

// The whole of the material: the 19 x 6 grey values of record.jpg, row by row, top to bottom.

// The whole of the material: the 19 x 6 grey values of record.jpg, row by row, top to bottom.
const P = [
 [255,255,254,253,252,251,250,250,255,255,232,255,255,18,0,255,253,255,255],
 [251,251,252,254,255,255,255,255,255,255,247,255,245,94,63,242,247,249,252],
 [24,25,28,32,36,39,42,44,10,38,26,15,22,0,0,27,26,29,32],
 [15,16,18,21,24,26,28,29,6,17,25,17,20,53,62,30,28,30,33],
 [12,11,11,11,11,10,10,10,38,15,28,31,8,22,35,2,22,24,27],
 [27,26,25,24,23,21,20,20,43,10,21,42,21,9,21,21,28,30,33]
];
const W = 19, H = 6, N = 1464;
const svg = document.getElementById('w');
const NS = 'http://www.w3.org/2000/svg';
function el(t, a, parent) { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); (parent||svg).appendChild(e); return e; }
function txt(s, a) { const e = el('text', a); e.textContent = s; return e; }

// 1. hours per column: 1464 shared across 19 columns by largest remainder (77 each, one column 78)
const per = N / W, colN = [], rem = [];
let used = 0;
for (let x = 0; x < W; x++) { const lo = Math.floor(per*(x+1)) - Math.floor(per*x); colN.push(lo); used += lo; }
// 2. within each column, hours shared among the six cells in proportion to ink (255 - grey)
const counts = P.map(r => r.map(() => 0));
for (let x = 0; x < W; x++) {
  const ink = P.map(r => Math.max(0, 255 - r[x]));
  const tot = ink.reduce((a,b)=>a+b, 0);
  const raw = ink.map(v => v / tot * colN[x]);
  const fl = raw.map(Math.floor);
  let left = colN[x] - fl.reduce((a,b)=>a+b,0);
  const order = raw.map((v,i)=>[v-fl[i], i]).sort((a,b)=>b[0]-a[0]);
  for (let k = 0; k < left; k++) fl[order[k][1]]++;
  for (let y = 0; y < H; y++) counts[y][x] = fl[y];
}

// seeded random, so the image is the same every time
let s = 1464;
function rnd() { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }

const C = 52, GX = (1100 - W*C) / 2, GY = 168;

// title
txt('Seventy-Seven to a Column', { x: GX, y: 78, 'font-size': 30, 'letter-spacing': '0.5', fill: 'var(--ink)' });
txt('1,464 hourly dots were drawn into a picture 19 pixels wide and 6 high. Here each pixel is opened again,', { x: GX, y: 110, 'font-size': 14.5, fill: 'var(--faint)', 'font-style':'italic' });
txt('and the hours it was given are put back in, as many as its ink can account for.', { x: GX, y: 130, 'font-size': 14.5, fill: 'var(--faint)', 'font-style':'italic' });

// the pixels themselves, very faint, as ground
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const g = P[y][x];
  const a = (255 - g) / 255 * 0.16;
  el('rect', { x: GX + x*C, y: GY + y*C, width: C, height: C, fill: `rgba(29,28,26,${a.toFixed(3)})` });
}
// cell seams
for (let x = 0; x <= W; x++) el('line', { x1: GX + x*C, y1: GY, x2: GX + x*C, y2: GY + H*C, stroke: 'var(--rule)', 'stroke-width': (x===8||x===16) ? 1.4 : 0.6, 'stroke-dasharray': (x===8||x===16) ? '' : '2 3' });
for (let y = 0; y <= H; y++) el('line', { x1: GX, y1: GY + y*C, x2: GX + W*C, y2: GY + y*C, stroke: 'var(--rule)', 'stroke-width': 0.6, 'stroke-dasharray': '2 3' });

// the hours: jittered placement inside each cell
const pad = 4, g = el('g', { fill: 'var(--ink)' });
let drawn = 0;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
  const n = counts[y][x]; if (!n) continue;
  const k = Math.ceil(Math.sqrt(n)), step = (C - 2*pad) / k;
  const slots = []; for (let i = 0; i < k*k; i++) slots.push(i);
  for (let i = slots.length - 1; i > 0; i--) { const j = Math.floor(rnd()*(i+1)); [slots[i], slots[j]] = [slots[j], slots[i]]; }
  for (let i = 0; i < n; i++) {
    const sl = slots[i], cx = GX + x*C + pad + (sl % k + 0.2 + rnd()*0.6) * step, cy = GY + y*C + pad + (Math.floor(sl / k) + 0.2 + rnd()*0.6) * step;
    el('circle', { cx: cx.toFixed(2), cy: cy.toFixed(2), r: 1.9 }, g);
    drawn++;
  }
}

// counts under each column
const by = GY + H*C;
for (let x = 0; x < W; x++) txt(String(colN[x]), { x: GX + x*C + C/2, y: by + 20, 'font-size': 11, 'text-anchor': 'middle', fill: 'var(--faint)' });

// the days the columns cut across: 61 ticks against 19 seams
const dy = by + 46, dw = W*C;
el('line', { x1: GX, y1: dy, x2: GX + dw, y2: dy, stroke: 'var(--ink)', 'stroke-width': 0.8 });
for (let d = 0; d <= 61; d++) { const xx = GX + d/61*dw; el('line', { x1: xx, y1: dy - (d%7===0?7:4), x2: xx, y2: dy, stroke: 'var(--ink)', 'stroke-width': 0.8 }); }
for (let x = 0; x <= W; x++) { const xx = GX + x*C; el('line', { x1: xx, y1: dy, x2: xx, y2: dy + 6, stroke: 'var(--faint)', 'stroke-width': 0.8 }); }
txt('61 days above the line, 19 columns below it: no column holds whole days (each is 3.21 of them).', { x: GX, y: dy + 28, 'font-size': 12, fill: 'var(--faint)' });

// the source, at its true size, and the notes
const sx = GX, sy = 636;
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const v = P[y][x]; el('rect', { x: sx + x, y: sy + y, width: 1, height: 1, fill: `rgb(${v},${v},${v})` }); }
el('rect', { x: sx - 3, y: sy - 3, width: W + 6, height: H + 6, fill: 'none', stroke: 'var(--rule)', 'stroke-width': 0.6 });
txt('← the whole record, actual size', { x: sx + 30, y: sy + 6, 'font-size': 12, fill: 'var(--faint)' });
const notes = [
  'Each column takes 77 hours (one takes 78). Within a column the hours are shared out among the six cells in proportion to each cell’s ink.',
  'Where a dot sits inside its cell is not known and is set by a fixed random seed; only the count per cell comes from the file.',
  'Solid seams after columns 8 and 16 mark the JPEG’s 8-pixel blocks; the smooth fade across the first eight columns is compression, not record.',
];
notes.forEach((t, i) => txt(t, { x: GX, y: 690 + i*20, 'font-size': 12, fill: 'var(--faint)' }));
txt(drawn.toLocaleString('en') + ' dots', { x: GX + dw, y: 78, 'font-size': 13, 'text-anchor': 'end', fill: 'var(--faint)' });
