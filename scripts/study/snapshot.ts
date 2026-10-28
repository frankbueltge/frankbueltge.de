// scripts/study/snapshot.ts — the nightly snapshot of the practices' studies, and their delivery (2026-10-27).
// Usage: tsx scripts/study/snapshot.ts [--out <dir>] [--source <url>]
//
// For every study that ever passed the house's check (src/data/studies/checks.json), reads its public
// record (GET /api/study/record?study=, only what the site publishes anyway) and writes
// src/data/studies/records/<id>.json when it changed (duty 2 of .claude/rules/runtime-and-works.md). A
// record may only grow: an answer that lacks a set the committed file holds writes nothing and fails
// the run.
//
// Then, for each practice that has a study, writes into <out>/<practice>/ what its feedback folder
// receives: `studies.md`, the state of each of its studies (an invalid manifest with its problems, a
// version that waits for the check or was refused by it, an open study with its released count), and
// `studies/<id>.json`, the committed record. <out>/deliveries.tsv names the repository, folder and
// secret of each (the reception's, src/lib/reception/ids.ts). The answers are material for the
// practice, never instructions, and the file says so.
import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { DELIVERY } from '../../src/lib/reception/ids'
import { answerable, findStudies, readChecks, readStops, resolveStudies, STUDY_PRACTICES, type ResolvedStudy } from '../../src/lib/study/registry'
import { serializeRecord, toRecordFile, type StudyRecordFile } from '../../src/lib/study/record'
import { studiesMarkdown } from '../../src/lib/study/feedback'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const out = arg('out', '/tmp/studies')
const base = arg('source', 'https://frankbueltge.de/api/study/record')
const root = process.cwd()
const today = new Date().toISOString().slice(0, 10)
const recordFile = (id: string) => join(root, 'src/data/studies/records', `${id}.json`)

// Every record call first clears a finished day's salts, marks and address counts. One call without a
// study does only that (it answers 400), made first so nothing below can keep the promise from being
// kept, also on a night with no record to read.
await fetch(base, { headers: { accept: 'application/json', 'user-agent': 'frankbueltge.de study-snapshot' } }).catch(() => null)

let failed = false
const checks = readChecks(root)
const passed = answerable(checks)
for (const a of passed) {
  const source = `${base}?study=${a.id}`
  const res = await fetch(source, { headers: { accept: 'application/json', 'user-agent': 'frankbueltge.de study-snapshot' } })
  const payload = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string; detail?: string } | null
  if (!payload?.ok) {
    console.log(`[study] ${a.id}: the record answered ${payload?.reason === 'standby' ? `standby (${payload.detail})` : `HTTP ${res.status}`}; nothing written`)
    continue
  }
  const next = toRecordFile(payload, source)
  const file = recordFile(a.id)
  const before = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as StudyRecordFile) : null
  const kept = new Set(next.entries.map((e) => e.id))
  const lost = (before?.entries ?? []).filter((e) => !kept.has(e.id))
  if (lost.length) {
    console.error(`[study] ${a.id}: the record no longer holds ${lost.length} committed answer set(s); nothing written`)
    failed = true
    continue
  }
  const text = serializeRecord(next)
  if (existsSync(file) && readFileSync(file, 'utf8') === text) continue
  mkdirSync(dirname(file), { recursive: true })
  writeFileSync(file, text)
  console.log(`[study] ${a.id}: ${next.entries_count} answer set(s) in the record`)
}

const resolved = resolveStudies(findStudies(join(root, 'public'), root), checks, readStops(root), today)
const rows: string[] = []
mkdirSync(out, { recursive: true })
for (const practice of STUDY_PRACTICES) {
  const own: ResolvedStudy[] = resolved.filter((s) => s.practice === practice)
  const ownPassed = passed.filter((c) => c.work.startsWith(`${practice}:`))
  if (!own.length && !ownPassed.length) continue
  const d = DELIVERY[practice]
  if (!d) continue
  const dir = join(out, practice)
  mkdirSync(join(dir, 'studies'), { recursive: true })
  const released: Record<string, number> = {}
  for (const a of ownPassed) {
    if (!existsSync(recordFile(a.id))) continue
    copyFileSync(recordFile(a.id), join(dir, 'studies', `${a.id}.json`))
    released[a.id] = (JSON.parse(readFileSync(recordFile(a.id), 'utf8')) as StudyRecordFile).entries_count
  }
  writeFileSync(join(dir, 'studies.md'), studiesMarkdown(practice, own, ownPassed, released, today))
  rows.push([practice, d.repo, dirname(d.path), d.secret].join('\t'))
}
writeFileSync(join(out, 'deliveries.tsv'), rows.length ? `${rows.join('\n')}\n` : '')
console.log(`[study] ${rows.length} practice folder(s) ready in ${out}`)
if (failed) process.exit(1)
