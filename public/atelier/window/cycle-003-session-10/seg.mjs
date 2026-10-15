import fs from 'node:fs'
const payload = JSON.parse(fs.readFileSync(process.argv[2], 'utf8'))
const seg = new Intl.Segmenter('en', { granularity: 'word' })
const out = {}
for (const [id, text] of Object.entries(payload)) {
  let wordlike = 0, alpha = 0
  for (const s of seg.segment(text)) {
    if (!s.isWordLike) continue
    wordlike++
    if (/\p{L}/u.test(s.segment)) alpha++
  }
  out[id] = { w3: wordlike, w4: alpha }
}
process.stdout.write(JSON.stringify({ icu: process.versions.icu ?? null, unicode: process.versions.unicode ?? null, counts: out }))
