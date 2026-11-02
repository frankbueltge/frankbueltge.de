// scripts/briefing/attention.ts — the one attention count of a briefing (2026-11-01).
// Usage: npx tsx scripts/briefing/attention.ts <briefing.json> [--to YYYY-MM-DD]
//
// Reads the terms of a briefing's data file and counts them in Common Ground's committed day files by
// Third Reading's rule (src/lib/reading/attention.ts), over the thirty days to the briefing. Prints a
// Markdown table the briefing copies. There is one count in this house now, so that a number in a
// briefing, on Third Reading and on Ducking is the same number. Then the same count for the fields of
// the map (src/lib/briefing/map.ts), whose `signals` the map copies.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { readAttention } from '../../src/lib/reading/attention'
import type { TrendingDay } from '../../src/lib/trending/types'
import { attentionWord, type Briefing } from '../../src/lib/briefing/briefing'
import { ATTENTION_DAYS } from '../../src/lib/briefing/derive'
import { FIELDS } from '../../src/lib/briefing/map'

const file = process.argv[2]
if (!file) throw new Error('usage: attention.ts <briefing.json> [--to YYYY-MM-DD]')
const briefing = JSON.parse(readFileSync(file, 'utf8')) as Briefing
const toFlag = process.argv.indexOf('--to')
const dir = 'src/data/trending'
const days = readdirSync(dir)
  .filter((f) => /^\d{4}-\d{2}-\d{2}\.json$/.test(f))
  .sort()
const to = toFlag > 0 ? process.argv[toFlag + 1]! : (briefing.written ?? days.at(-1)!.slice(0, 10))
const from = (() => {
  const d = new Date(`${to}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - (ATTENTION_DAYS - 1))
  return d.toISOString().slice(0, 10)
})()
const parsed = days
  .filter((f) => f.slice(0, 10) >= from && f.slice(0, 10) <= to)
  .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as TrendingDay)
const matters = briefing.matters ?? []
const reading = readAttention({ matters, attention_window: { from, to } }, parsed)
const fields = readAttention(
  {
    matters: FIELDS.map((f) => ({
      id: f.id,
      terms: [...f.terms],
      exclude: 'exclude' in f ? [...f.exclude] : [],
      ...('requires' in f ? { requires: [...f.requires] } : {}),
    })),
    attention_window: { from, to },
  },
  parsed,
)

console.log(`Attention in Common Ground, ${from} to ${to}, ${reading.days.length} day files, by the one rule (scripts/briefing/attention.ts):\n`)
console.log('| Matter | Signals | Converged days | Reading |\n|---|---:|---:|---|')
for (const m of reading.matters) {
  const name = matters.find((x) => x.id === m.matter)?.short ?? m.matter
  console.log(`| ${name} | ${m.signals} | ${m.converged_days} | ${attentionWord(m.signals, m.converged_days)} |`)
}
console.log(`\nThe map's fields, the same way, of ${parsed.reduce((n, d) => n + Object.values(d.signals).flat().length, 0)} signals:\n`)
console.log('| Field | Signals | Converged days |\n|---|---:|---:|')
for (const f of fields.matters) console.log(`| ${f.matter} | ${f.signals} | ${f.converged_days} |`)
