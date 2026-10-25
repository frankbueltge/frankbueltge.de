// src/lib/reading/record.ts — the committed record of a round (2026-10-26).
//
// The nightly snapshot (scripts/reading/snapshot.ts) reads the public record and commits it as
// src/data/reading/<round>.json: every reading, as stored, under CC0. The file is rewritten when the
// record changed; its nights live in git history. Written one reading per line, so a night's diff is
// the readings that night added and nothing else.
import type { EstimateTuple, StoredReading, VoteTuple } from './reading'

export const RECORD_CONTRACT = 'third-reading-record/1'

export interface RecordFile {
  $contract: typeof RECORD_CONTRACT
  round: string
  source: string
  licence: 'CC0-1.0'
  readings: number
  entries: StoredReading[]
}

const ENTRY_ID = /^t-\d{8}-[0-9a-f]{12}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/

const isVote = (v: unknown): v is VoteTuple =>
  Array.isArray(v) && v.length === 4 && typeof v[0] === 'string' && typeof v[1] === 'string' && (v[2] === 0 || v[2] === 1 || v[2] === 2 || v[2] === null) && Number.isInteger(v[3])
const isEstimate = (e: unknown): e is EstimateTuple =>
  Array.isArray(e) && e.length === 3 && typeof e[0] === 'string' && (e[1] === null || (typeof e[1] === 'number' && Number.isFinite(e[1]))) && Number.isInteger(e[2])

/** Only what the record promises passes; a malformed answer writes nothing rather than half a file. */
export function toRecordFile(payload: unknown, source: string): RecordFile {
  const p = payload as { ok?: unknown; round?: unknown; entries?: unknown }
  if (p?.ok !== true || typeof p.round !== 'string' || !Array.isArray(p.entries)) throw new Error('not a reading record')
  const entries = p.entries.map((raw) => {
    const e = raw as Record<string, unknown>
    if (typeof e.id !== 'string' || !ENTRY_ID.test(e.id) || typeof e.day !== 'string' || !DAY.test(e.day) || typeof e.consent !== 'string' || typeof e.primed !== 'boolean') throw new Error('malformed reading')
    if (!Array.isArray(e.votes) || !e.votes.every(isVote) || !Array.isArray(e.estimates) || !e.estimates.every(isEstimate)) throw new Error(`malformed reading ${e.id}`)
    return { id: e.id, day: e.day, consent: e.consent, primed: e.primed, votes: e.votes as VoteTuple[], estimates: e.estimates as EstimateTuple[] }
  })
  entries.sort((a, b) => a.id.localeCompare(b.id))
  return { $contract: RECORD_CONTRACT, round: p.round, source, licence: 'CC0-1.0', readings: entries.length, entries }
}

/** Stable text: the header pretty, each reading on one line. */
export function serializeRecord(f: RecordFile): string {
  const head = JSON.stringify({ $contract: f.$contract, round: f.round, source: f.source, licence: f.licence, readings: f.readings }, null, 2)
  const body = f.entries.map((e) => `    ${JSON.stringify(e)}`).join(',\n')
  return `${head.slice(0, -2)},\n  "entries": [${f.entries.length ? `\n${body}\n  ` : ''}]\n}\n`
}
