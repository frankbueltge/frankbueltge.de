// Iteration 1: the form written in EXPECT.md, as written. Sixteen panels; constant-price and
// current-price index; the gap between them shaded.
const num = s => parseFloat(s.replace(',', '.'));
const states = [...new Set(DATA.map(d => d.state))];
const W = 250, H = 170, P = 28, NS = 'http://www.w3.org/2000/svg';
const svg = document.createElementNS(NS, 'svg'); svg.setAttribute('width', 4 * W); svg.setAttribute('height', 4 * H + 30);
const x = (y, i) => (i % 4) * W + P + (y - 2021) / 4 * (W - 2 * P);
const yv = (v, i) => Math.floor(i / 4) * H + 30 + (H - 2 * P) * (1 - (v - 90) / 65) + P / 2;
const el = (t, a) => { const e = document.createElementNS(NS, t); for (const k in a) e.setAttribute(k, a[k]); svg.appendChild(e); return e; };
el('text', { x: 4, y: 18, 'font-size': 15 }).textContent = 'Wholesale turnover index, 2021 = 100: current prices (dark) against constant prices (light); the gap shaded';
states.forEach((s, i) => {
  const r = DATA.filter(d => d.state === s);
  const nom = r.map(d => [x(d.year, i), yv(num(d.nom), i)]), real = r.map(d => [x(d.year, i), yv(num(d.real), i)]);
  el('path', { d: 'M' + nom.map(p => p.join(',')).join('L') + 'L' + real.reverse().map(p => p.join(',')).join('L') + 'Z', fill: '#c8a87a', opacity: .45 });
  el('polyline', { points: nom.map(p => p.join(',')).join(' '), fill: 'none', stroke: '#5a3b16', 'stroke-width': 2 });
  el('polyline', { points: r.map(d => [x(d.year, i), yv(num(d.real), i)].join(',')).join(' '), fill: 'none', stroke: '#9a8a70', 'stroke-width': 2 });
  el('line', { x1: x(2021, i), x2: x(2025, i), y1: yv(100, i), y2: yv(100, i), stroke: '#bbb', 'stroke-dasharray': '2 3' });
  el('text', { x: (i % 4) * W + P, y: Math.floor(i / 4) * H + 44, 'font-size': 12 }).textContent = s;
});
document.getElementById('root').appendChild(svg);
