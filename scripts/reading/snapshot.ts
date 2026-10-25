// scripts/reading/snapshot.ts — the nightly snapshot of Third Reading (2026-10-26).
// Usage: tsx scripts/reading/snapshot.ts [--source <url>] [--round <id>]
//
// Reads the public record of a round (GET /api/reading/record?round=, nothing the site does not
// publish anyway) and writes src/data/reading/<round>.json, only when the record changed since the
// committed file (duty 2 of .claude/rules/runtime-and-works.md). The workflow commits it. One file per
// round, rewritten; its nights live in git history. A record in standby writes nothing.
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { CURRENT_ROUND, roundById } from '../../src/lib/reading/rounds'
import { serializeRecord, toRecordFile } from '../../src/lib/reading/record'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const round = roundById(arg('round', CURRENT_ROUND.id))
if (!round) throw new Error('unknown round')
const source = `${arg('source', 'https://frankbueltge.de/api/reading/record')}?round=${round.id}`

const res = await fetch(source, { headers: { accept: 'application/json', 'user-agent': 'frankbueltge.de reading-snapshot' } })
const payload = (await res.json().catch(() => null)) as { ok?: boolean; reason?: string; detail?: string } | null
if (!payload?.ok) {
  const why = payload?.reason === 'standby' ? `standby (${payload.detail ?? 'unknown'})` : `HTTP ${res.status}`
  console.log(`[reading] the record answered ${why}: no snapshot written`)
  process.exit(0)
}

const text = serializeRecord(toRecordFile(payload, source))
const file = `src/data/reading/${round.id}.json`
if (existsSync(file) && readFileSync(file, 'utf8') === text) {
  console.log(`[reading] ${round.id}: the record is unchanged since the committed snapshot`)
} else {
  mkdirSync('src/data/reading', { recursive: true })
  writeFileSync(file, text)
  console.log(`[reading] ${round.id}: snapshot written`)
}
