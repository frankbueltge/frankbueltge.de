// shuffle-core.js (Session 147): the one operator, shared by shuffle.js (node) and the face.
// SHUFFLE(c) permutes the values of column c among the rows of BRIDGES: every value that was in the column is
// still in it, as often as before, under the same name; only which bridge it belongs to changes. Each column the
// operator touches gets its own permutation. Nothing in a page's code is touched, and every figure a page computes
// from one column alone (a count, a sum, a histogram, a range) comes out exactly as before.
// Two arms, per family work: O (one column the page's code names; o1-o3 take three such columns, drawn without
// replacement, cycling if the page names fewer than three) and A (every column the page's code names, each
// shuffled independently). If a page names none of the twelve, the operator takes all twelve (declared).
// Random: mulberry32, one stream for the night.
(function (root) {
  function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function readBy(html, F) { const r = F.fields.filter(f => new RegExp('\\b' + f + '\\b').test(html)); return r.length ? r : F.fields.slice(); }
  function perm(rand, n) { const p = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [p[i], p[j]] = [p[j], p[i]]; } return p; }
  function apply(rows, cols, rand) {   // returns new rows and the permutation used for each column
    const out = rows.map(r => Object.assign({}, r)), perms = {};
    for (const c of cols) { const p = perm(rand, rows.length); perms[c] = p; for (let i = 0; i < rows.length; i++) out[i][c] = rows[p[i]][c]; }
    return { rows: out, perms };
  }
  function pick(rand, read) {          // three columns for o1-o3: without replacement, cycling if fewer than three
    const got = [], pool = [];
    while (got.length < 3) { if (!pool.length) pool.push(...read); got.push(pool.splice(Math.floor(rand() * pool.length), 1)[0]); }
    return got;
  }
  function plan(rand, work, read) {
    const o = pick(rand, read);
    return o.map((c, i) => ({ id: work + 'o' + (i + 1), work, arm: 'O', cols: [c] })).concat([{ id: work + 'a', work, arm: 'A', cols: read.slice() }]);
  }
  const api = { mulberry32, readBy, perm, apply, pick, plan };
  if (typeof module !== 'undefined') module.exports = api; else root.Shuffle = api;
})(this);
