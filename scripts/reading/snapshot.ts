// scripts/reading/snapshot.ts — the nightly snapshot of Third Reading (2026-10-26).
// Usage: tsx scripts/reading/snapshot.ts [--source <url>]
//
// For every committed round, reads its public record (GET /api/reading/record?round=, only what the
// site publishes anyway) and writes src/data/reading/<round>.json when the record changed since the
// committed file (duty 2 of .claude/rules/runtime-and-works.md). The workflow commits it. One file per
// round, rewritten; its nights live in git history.
//
// Every round, not only the current one: a round that has just been superseded still releases its last
// batches. And a record may only grow: an answer that lacks a reading the committed file holds — a new
// or emptied database answers `ok` with nothing in it — writes nothing and fails the run, so the
// archive cannot be emptied by accident. A record in standby writes nothing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { ROUNDS } from '../../src/lib/reading/rounds'
import { serializeRecord, toRecordFile, type RecordFile } from '../../src/lib/reading/record'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const base = arg('source', 'https://frankbueltge.de/api/reading/record')

let failed = false
for (const round of ROUNDS) {
  const source = `${base}?round=${round.id}`
  const res = await fetch(source, { headers: { accept: 'application/json', 'user-agent': 'frankbueltge.de reading-snapshot' } })
  const payload = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string; detail?: string } | null
  if (!payload?.ok) {
    const why = payload?.reason === 'standby' ? `standby (${payload.detail ?? 'unknown'})` : `HTTP ${res.status}`
    console.log(`[reading] ${round.id}: the record answered ${why}; nothing written`)
    continue
  }
  const next = toRecordFile(payload, source)
  const file = `src/data/reading/${round.id}.json`
  const before = existsSync(file) ? (JSON.parse(readFileSync(file, 'utf8')) as RecordFile) : null
  const kept = new Set(next.entries.map((e) => e.id))
  const lost = (before?.entries ?? []).filter((e) => !kept.has(e.id))
  if (lost.length) {
    console.error(`[reading] ${round.id}: the record no longer holds ${lost.length} committed reading(s); nothing written`)
    failed = true
    continue
  }
  const text = serializeRecord(next)
  if (existsSync(file) && readFileSync(file, 'utf8') === text) {
    console.log(`[reading] ${round.id}: unchanged since the committed snapshot`)
  } else {
    mkdirSync('src/data/reading', { recursive: true })
    writeFileSync(file, text)
    console.log(`[reading] ${round.id}: ${next.readings} reading(s) in the record`)
  }
}
if (failed) process.exit(1)
