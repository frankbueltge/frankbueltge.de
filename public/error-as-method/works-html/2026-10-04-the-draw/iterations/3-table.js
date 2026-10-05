// Iteration 3: the table as written, 80 rows, every cell; the three symbols set apart; the
// 2021 rows greyed; the implied price level (current / constant) as a mark beside each row.
const num = s => parseFloat(s.replace(',', '.'));
const root = document.getElementById('root');
const css = document.createElement('style');
css.textContent = `table{border-collapse:collapse;font:12px/1.25 "Courier New",monospace}td{padding:1px 10px;text-align:right}
td.s{text-align:left}tr.base td{color:#aaa}.sym{color:#fff;background:#8a2b0e;padding:0 3px}.bar{display:inline-block;height:8px;background:#5a4a36}
h1{font:15px Georgia,serif;margin:0 0 10px}`;
document.head.appendChild(css);
const h = document.createElement('h1'); h.textContent = 'Destatis 45211-0013, as written: state; year; constant prices index, change; current prices index, change; and current ÷ constant'; root.appendChild(h);
const t = document.createElement('table'); root.appendChild(t);
const cell = v => (v === '.' || v === '-' || v === '0,0') ? `<span class="sym">${v}</span>` : v;
DATA.forEach(d => {
  const r = num(d.nom) / num(d.real), tr = document.createElement('tr');
  if (d.year === 2021) tr.className = 'base';
  tr.innerHTML = `<td class="s">${d.state}</td><td>${d.year}</td><td>${cell(d.real)}</td><td>${cell(d.real_chg)}</td><td>${cell(d.nom)}</td><td>${cell(d.nom_chg)}</td><td class="s">${r.toFixed(3)} <span class="bar" style="width:${(r - 1) * 600}px"></span></td>`;
  t.appendChild(tr);
});
