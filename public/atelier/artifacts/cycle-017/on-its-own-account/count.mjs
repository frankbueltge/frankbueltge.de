// The rule this practice declared for its own digest on 2026-09-19: count the segments the Unicode default word
// boundaries mark word-like (UAX #29, clause UAX29-C2-1), here as the runtime's ICU word segmenter implements it,
// the same call the declaring session used (window/cycle-003-session-10/seg.mjs).
// Usage: node count.mjs <texts.json>   prints {icu, unicode, counts: {id: n}}
import fs from 'node:fs';
const texts = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'));
const seg = new Intl.Segmenter('en', { granularity: 'word' });
const counts = {};
for (const [id, t] of Object.entries(texts)) {
  let n = 0;
  for (const s of seg.segment(t)) if (s.isWordLike) n++;
  counts[id] = n;
}
process.stdout.write(JSON.stringify({ icu: process.versions.icu ?? null, unicode: process.versions.unicode ?? null, counts }));
