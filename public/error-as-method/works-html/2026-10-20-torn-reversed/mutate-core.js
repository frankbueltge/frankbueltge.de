// mutate-core.js: the face's copy of mutate.js (Session 144), the same four operators as functions that run in a
// browser or in node. mutate.js is the registered instrument and stays unchanged; this file reproduces its twelve
// mutants byte for byte from seed 144 (checked by check-core.js), quirks included: script regions and TEAR's
// lines are found once on the unmutated page, as mutate.js finds them.
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  const OPS = { '<': '>', '>': '<', '+': '-', '-': '+', '*': '/', '/': '*' };
  function prepare(html) {
    const regions = []; const re = /<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/gi; let m;
    while ((m = re.exec(html))) { const start = m.index + m[0].indexOf('>') + 1; regions.push([start, start + m[1].length]); }
    const inRegion = i => regions.some(([a, b]) => i >= a && i < b);
    function scriptLines(src) { const out = []; for (const [a, b] of regions) { let i = a;
      while (i < b) { let j = src.indexOf('\n', i); if (j < 0 || j > b) j = b; if (src.slice(i, j).trim()) out.push([i, j]); i = j + 1; } } return out; }
    function operatorSites(src) { const out = [];
      for (let i = 1; i < src.length - 1; i++) { const c = src[i]; if (!(c in OPS) || !inRegion(i)) continue;
        const p = src[i - 1], n = src[i + 1];
        if ('=<>+-*/!&|'.includes(p) || '=<>+-*/'.includes(n)) continue;
        const pp = src.slice(0, i).replace(/\s+$/, '').slice(-1);
        if (!/[\w\)\]]/.test(pp)) continue;
        if (c === '-' && /[eE]$/.test(src.slice(i - 2, i)) && /\d/.test(src[i - 2] || '')) continue;
        const lineStart = src.lastIndexOf('\n', i), seg = src.slice(lineStart, i);
        if ((seg.match(/["'`]/g) || []).length % 2) continue;
        if (seg.includes('//')) continue;
        out.push(i); } return out; }
    function numberSites(src) { const out = []; const r = /(?<![\w.#$])(\d+\.?\d*|\.\d+)(?![\w.])/g; let k;
      while ((k = r.exec(src))) { if (!inRegion(k.index)) continue;
        const lineStart = src.lastIndexOf('\n', k.index), seg = src.slice(lineStart, k.index);
        if ((seg.match(/["'`]/g) || []).length % 2 || seg.includes('//')) continue; out.push([k.index, k[0]]); } return out; }
    return { regions, scriptLines, operatorSites, numberSites, lines: scriptLines(html) };
  }
  function apply(html, P, op, n, pick) {
    let src = html; const did = [];
    if (op === 'TEAR') { const k = n, s = pick(Math.max(1, P.lines.length - k + 1));
      const a = P.lines[s][0], b = P.lines[Math.min(s + k - 1, P.lines.length - 1)][1];
      did.push({ removed: src.slice(a, b) }); src = src.slice(0, a) + src.slice(b); }
    for (let t = 0; t < n && op !== 'TEAR'; t++) {
      if (op === 'REVERSE') { const sites = P.operatorSites(src); if (!sites.length) break; const i = sites[pick(sites.length)];
        did.push({ at: i, from: src[i], to: OPS[src[i]], context: src.slice(Math.max(0, i - 30), i + 30) });
        src = src.slice(0, i) + OPS[src[i]] + src.slice(i + 1); }
      if (op === 'MOUNT') { const L = P.scriptLines(src); const x = pick(L.length); let y = pick(L.length); if (y === x) y = (y + 1) % L.length;
        const [a, b] = x < y ? [L[x], L[y]] : [L[y], L[x]]; const A = src.slice(a[0], a[1]), B = src.slice(b[0], b[1]);
        did.push({ swapped: [A.trim(), B.trim()] }); src = src.slice(0, a[0]) + B + src.slice(a[1], b[0]) + A + src.slice(b[1]); }
      if (op === 'REWORK') { const sites = P.numberSites(src); if (!sites.length) break; const [i, tok] = sites[pick(sites.length)];
        const f = [0.1, 0.5, 2, 10][pick(4)]; let v = parseFloat(tok) * f; const nv = tok.includes('.') ? String(+v.toFixed(4)) : String(Math.round(v));
        did.push({ at: i, from: tok, factor: f, to: nv, context: src.slice(Math.max(0, i - 30), i + 30) });
        src = src.slice(0, i) + nv + src.slice(i + tok.length); }
    }
    return { src, did };
  }
  // the night's twelve, exactly as mutate.js drew them
  function night(html, seed) { const rnd = mulberry32(seed), pick = n => Math.floor(rnd() * n); const P = prepare(html);
    const plan = []; for (const op of ['TEAR', 'REVERSE', 'MOUNT', 'REWORK']) for (let r = 0; r < 3; r++) plan.push({ op, n: 1 + pick(3) });
    return plan.map((p, i) => Object.assign({ id: 'm' + String(i + 1).padStart(2, '0'), op: p.op, n: p.n }, apply(html, P, p.op, p.n, pick))); }
  // one more, for the visitor: operator (or any), n drawn 1-3, from a seed
  function one(html, seed, op) { const rnd = mulberry32(seed), pick = n => Math.floor(rnd() * n); const P = prepare(html);
    const ops = ['TEAR', 'REVERSE', 'MOUNT', 'REWORK']; const o = op || ops[pick(4)]; const n = 1 + pick(3);
    return Object.assign({ op: o, n, seed }, apply(html, P, o, n, pick)); }
  const api = { night, one };
  if (typeof module !== 'undefined') module.exports = api; else root.MutateCore = api;
})(this);
