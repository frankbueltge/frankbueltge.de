// scripts/reception/snapshot.ts — the nightly snapshot of the reception (2026-10-17).
// Usage: tsx scripts/reception/snapshot.ts [--out <dir>] [--source <url>] [--date YYYY-MM-DD]
//
// Reads the public record (GET /api/reception/record, nothing the site does not already show), and
//   · writes src/data/reception/latest.json and src/data/reception/snapshots/<date>.json, only when the
//     record changed since the committed latest.json (duty 2 of .claude/rules/runtime-and-works.md);
//   · writes <out>/<practice>.md for every practice that receives a reception file, and
//     <out>/deliveries.tsv naming where each goes and with which secret (src/lib/reception/ids.ts).
// The workflow commits the first and delivers the second, each only where the bytes differ.
// A record in standby writes nothing and leaves <out>/STANDBY, so nothing stale is delivered.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { DELIVERY, type ReceptionPractice } from '../../src/lib/reception/ids'
import { receptionMarkdown, serializeSnapshot, toSnapshot } from '../../src/lib/reception/snapshot'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const out = arg('out', '/tmp/reception')
const source = arg('source', 'https://frankbueltge.de/api/reception/record')
const date = arg('date', new Date().toISOString().slice(0, 10))
if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error(`not a date: ${date}`)

mkdirSync(out, { recursive: true })
const res = await fetch(source, { headers: { accept: 'application/json', 'user-agent': 'frankbueltge.de reception-snapshot' } })
const payload = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string; detail?: string } | null
if (!payload?.ok) {
  const why = payload?.reason === 'standby' ? `standby (${payload.detail ?? 'unknown'})` : `HTTP ${res.status}`
  writeFileSync(join(out, 'STANDBY'), `${why}\n`)
  console.log(`[reception] the record answered ${why}: no snapshot written, nothing delivered`)
  process.exit(0)
}

const snapshot = toSnapshot(payload, source)
const text = serializeSnapshot(snapshot)
const latest = 'src/data/reception/latest.json'
const before = existsSync(latest) ? readFileSync(latest, 'utf8') : ''
if (before === text) {
  console.log('[reception] the record is unchanged since the committed snapshot')
} else {
  mkdirSync('src/data/reception/snapshots', { recursive: true })
  writeFileSync(latest, text)
  writeFileSync(`src/data/reception/snapshots/${date}.json`, text)
  console.log(`[reception] snapshot of ${date}: ${snapshot.works.length} work(s) rated, ${snapshot.notes.length} note(s), ${snapshot.hidden.length} hidden`)
}

const rows: string[] = []
for (const [practice, d] of Object.entries(DELIVERY) as [ReceptionPractice, NonNullable<(typeof DELIVERY)[ReceptionPractice]>][]) {
  writeFileSync(join(out, `${practice}.md`), receptionMarkdown(snapshot, practice))
  rows.push([practice, d.repo, d.path, d.secret].join('\t'))
}
writeFileSync(join(out, 'deliveries.tsv'), `${rows.join('\n')}\n`)
console.log(`[reception] ${rows.length} reception file(s) ready in ${out}`)
