// rebind-core.js (Session 145, copied byte for byte below this line by Session 146): the one operator, shared by rebind.js (node) and the face.
// SWAP(a, b) exchanges two whole columns of ELEMENTS: every element's value under the name a goes under b and
// the reverse. Nothing in a page's code is touched; what changes is which values answer to which name.
// Three arms differ only in what the operator is allowed to know when it draws a pair:
//   U  any two of the 17 columns (blind to type and to the page);
//   T  two columns of the same declared type (numeric with numeric, string with string);
//   S  as T, and at least one of the two is a column name the parent page's code contains (it sees the page).
// Mutants 1-4 of an arm apply one swap, 5-8 two distinct swaps in order. Random: mulberry32.
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function pairs(arm, F, read) {
    const out = [];
    for (let i = 0; i < F.fields.length; i++) for (let j = i + 1; j < F.fields.length; j++) {
      const a = F.fields[i], b = F.fields[j], same = F.numeric.includes(a) === F.numeric.includes(b);
      if (arm === 'U' || (same && (arm === 'T' || (arm === 'S' && (read.includes(a) || read.includes(b)))))) out.push([a, b]);
    }
    return out;
  }
  function readBy(html, F) { return F.fields.filter(f => new RegExp('\\b' + f + '\\b').test(html)); }
  function draw(rand, arm, F, read, k) {
    const P = pairs(arm, F, read), got = [];
    while (got.length < k && got.length < P.length) {
      const p = P[Math.floor(rand() * P.length)];
      if (!got.some(g => g[0] === p[0] && g[1] === p[1])) got.push(p);
    }
    return got;
  }
  function apply(elements, swaps) {
    const E = elements.map(e => Object.assign({}, e));
    for (const [a, b] of swaps) for (const e of E) { const t = e[a]; e[a] = e[b]; e[b] = t; }
    return E;
  }
  function night(seed, F, read) {   // the night's 24 mutants: arms U, T, S in that order, eight each, one stream
    const rand = mulberry32(seed), out = [];
    for (const arm of ['U', 'T', 'S']) for (let i = 1; i <= 8; i++)
      out.push({ id: arm.toLowerCase() + i, arm, swaps: draw(rand, arm, F, read, i <= 4 ? 1 : 2) });
    return out;
  }
  const api = { mulberry32, pairs, readBy, draw, apply, night };
  if (typeof module !== 'undefined') module.exports = api; else root.Rebind = api;
})(this);
