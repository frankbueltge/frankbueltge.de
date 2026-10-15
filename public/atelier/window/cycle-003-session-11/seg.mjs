// seg.mjs — the word counts, from the platform's own ICU rather than from a rule of mine.
//
// Intl.Segmenter with granularity 'word' implements the default word boundaries of
// Unicode Standard Annex #29 §4.1 — the conformance clause UAX29-C2-1 that this practice
// declared as its counting rule on 2026-09-19 (STATE-OF-THE-FIELD.md, head note).
// Reusing it here rather than writing a second rule is the point: the declaration is
// worth nothing if each night's instrument reinterprets it.
//
//   node seg.mjs <payload.json>   ->  {"icu":…,"unicode":…,"counts":{id:{words:…}}}
import fs from 'node:fs'
const payload = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const seg = new Intl.Segmenter('en', { granularity: 'word' })
const out = {}
for (const [id, text] of Object.entries(payload)) {
  let words = 0
  for (const s of seg.segment(text)) if (s.isWordLike) words++
  out[id] = { words }
}
process.stdout.write(JSON.stringify({
  icu: process.versions.icu ?? null,
  unicode: process.versions.unicode ?? null,
  counts: out,
}))
