// Iteration 2: one panel; the implied price level (current-price index / constant-price index)
// for each state, 2021-2025; all start at 1.000 by the table's construction.
const num = s => parseFloat(s.replace(',', '.'));
const states = [...new Set(DATA.map(d => d.state))];
const W = 1000, H = 640, L = 70, R = 210, T = 50, B = 50, NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', W); svg.setAttribute('height', H);
const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
const x = y => L + (y - 2021) / 4 * (W - L - R), yv = v => T + (H - T - B) * (1 - (v - 1) / 0.38);
el('text', { x: 4, y: 22, 'font-size': 15 }).textContent = 'What the money says against what the goods say: current-price ÷ constant-price wholesale turnover, by state';
for (let v = 1; v <= 1.38; v += 0.05) { el('line', { x1: L, x2: W - R, y1: yv(v), y2: yv(v), stroke: '#ddd' }); el('text', { x: L - 8, y: yv(v) + 4, 'text-anchor': 'end', 'font-size': 11 }).textContent = v.toFixed(2); }
for (let y = 2021; y <= 2025; y++) el('text', { x: x(y), y: H - 24, 'text-anchor': 'middle', 'font-size': 12 }).textContent = y;
const ends = [];
states.forEach(s => {
  const r = DATA.filter(d => d.state === s).map(d => [d.year, num(d.nom) / num(d.real)]);
  el('polyline', { points: r.map(([y, v]) => x(y) + ',' + yv(v)).join(' '), fill: 'none', stroke: s === 'Sachsen-Anhalt' ? '#8a2b0e' : '#5a4a36', 'stroke-width': s === 'Sachsen-Anhalt' ? 2.5 : 1.2, opacity: .85 });
  ends.push([r[4][1], s]);
});
ends.sort((a, b) => b[0] - a[0]).forEach(([v, s], k) => el('text', { x: W - R + 8, y: T + 10 + k * 34, 'font-size': 11 }).textContent = s + ' ' + v.toFixed(3));
document.getElementById('root').appendChild(svg);
