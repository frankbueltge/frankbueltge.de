// mutate.js <parent index.html> <out dir> : the practice's own variation, without intention (Session 144).
// Four operators, named from the map's properties in A Thousand Plateaus p. 12 as Cartography, not Tracing
// cites them ("detachable, reversible, susceptible to constant modification ... torn, reversed, adapted to
// any kind of mounting, reworked"). Each acts only on the text inside the page's inline <script> blocks.
//   TEAR    delete 1-3 consecutive non-blank lines
//   REVERSE swap one binary operator for its counterpart (< >, + -, * /), n times
//   MOUNT   exchange two non-blank lines, n times
//   REWORK  multiply one numeric literal by 0.1, 0.5, 2 or 10, n times
// Three mutants per operator, n drawn 1-3, seed 144. Nothing is checked, repaired or discarded: every
// mutant is written and rendered, broken or not. Writes <out>/m01..m12/index.html and <out>/mutants.json.
const fs = require('fs'), path = require('path');
const SEED = 144;
function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
  t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
const rnd = mulberry32(SEED), pick = n => Math.floor(rnd() * n);
const [parentFile, outDir] = process.argv.slice(2);
const html = fs.readFileSync(parentFile, 'utf8');

// script regions: inline <script> ... </script> without src
const regions = []; const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi; let m;
while ((m = re.exec(html))) { const start = m.index + m[0].indexOf('>') + 1; regions.push([start, start + m[1].length]); }
if (!regions.length) { console.error('no inline script in parent'); process.exit(1); }
// all script lines as absolute [start,end) offsets
function scriptLines(src) { const out = []; for (const [a, b] of regions) { let i = a;
  while (i < b) { let j = src.indexOf('\n', i); if (j < 0 || j > b) j = b; if (src.slice(i, j).trim()) out.push([i, j]); i = j + 1; } } return out; }
const lines = scriptLines(html);
function inRegion(i) { return regions.some(([a, b]) => i >= a && i < b); }

const OPS = { '<': '>', '>': '<', '+': '-', '-': '+', '*': '/', '/': '*' };
function operatorSites(src) { const out = [];
  for (let i = 1; i < src.length - 1; i++) { const c = src[i]; if (!(c in OPS) || !inRegion(i)) continue;
    const p = src[i - 1], n = src[i + 1];
    if ('=<>+-*/!&|'.includes(p) || '=<>+-*/'.includes(n)) continue;            // <= => ++ -- // /* */ etc.
    const pp = src.slice(0, i).replace(/\s+$/, '').slice(-1);
    if (!/[\w\)\]]/.test(pp)) continue;                                            // must follow an operand
    if (c === '-' && /[eE]$/.test(src.slice(i - 2, i)) && /\d/.test(src[i - 2] || '')) continue; // 1e-3
    const lineStart = src.lastIndexOf('\n', i), seg = src.slice(lineStart, i);
    if ((seg.match(/["'`]/g) || []).length % 2) continue;                          // crude: inside a string
    if (seg.includes('//')) continue;                                              // inside a comment
    out.push(i); } return out; }
function numberSites(src) { const out = []; const r = /(?<![\w.#$])(\d+\.?\d*|\.\d+)(?![\w.])/g; let k;
  while ((k = r.exec(src))) { if (!inRegion(k.index)) continue;
    const lineStart = src.lastIndexOf('\n', k.index), seg = src.slice(lineStart, k.index);
    if ((seg.match(/["'`]/g) || []).length % 2 || seg.includes('//')) continue; out.push([k.index, k[0]]); } return out; }

const plan = []; const ops = ['TEAR', 'REVERSE', 'MOUNT', 'REWORK'];
for (const op of ops) for (let r = 0; r < 3; r++) plan.push({ op, n: 1 + pick(3) });
const result = [];
plan.forEach((p, idx) => {
  let src = html; const did = [];
  if (p.op === 'TEAR') { const k = p.n, s = pick(Math.max(1, lines.length - k + 1));
    const a = lines[s][0], b = lines[Math.min(s + k - 1, lines.length - 1)][1];
    did.push({ removed: src.slice(a, b) }); src = src.slice(0, a) + src.slice(b); }
  for (let t = 0; t < p.n && p.op !== 'TEAR'; t++) {
    if (p.op === 'REVERSE') { const sites = operatorSites(src); if (!sites.length) break; const i = sites[pick(sites.length)];
      did.push({ at: i, from: src[i], to: OPS[src[i]], context: src.slice(Math.max(0, i - 30), i + 30) });
      src = src.slice(0, i) + OPS[src[i]] + src.slice(i + 1); }
    if (p.op === 'MOUNT') { const L = scriptLines(src); const x = pick(L.length); let y = pick(L.length); if (y === x) y = (y + 1) % L.length;
      const [a, b] = x < y ? [L[x], L[y]] : [L[y], L[x]]; const A = src.slice(a[0], a[1]), B = src.slice(b[0], b[1]);
      did.push({ swapped: [A.trim(), B.trim()] }); src = src.slice(0, a[0]) + B + src.slice(a[1], b[0]) + A + src.slice(b[1]); }
    if (p.op === 'REWORK') { const sites = numberSites(src); if (!sites.length) break; const [i, tok] = sites[pick(sites.length)];
      const f = [0.1, 0.5, 2, 10][pick(4)]; let v = parseFloat(tok) * f; const nv = tok.includes('.') ? String(+v.toFixed(4)) : String(Math.round(v));
      did.push({ at: i, from: tok, factor: f, to: nv, context: src.slice(Math.max(0, i - 30), i + 30) });
      src = src.slice(0, i) + nv + src.slice(i + tok.length); }
  }
  const id = 'm' + String(idx + 1).padStart(2, '0'); const d = path.join(outDir, id); fs.mkdirSync(d, { recursive: true });
  fs.writeFileSync(path.join(d, 'index.html'), src);
  result.push({ id, op: p.op, n: p.n, did, identical: src === html });
});
fs.writeFileSync(path.join(outDir, 'mutants.json'), JSON.stringify({ seed: SEED, parent: path.basename(path.dirname(parentFile)), mutants: result }, null, 1));
console.log(result.map(r => r.id + ' ' + r.op + ' x' + r.n + (r.identical ? ' (identical)' : '')).join('\n'));
