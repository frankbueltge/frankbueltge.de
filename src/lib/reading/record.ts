// src/lib/reading/record.ts — the public record of a round, and the committed file (2026-10-26).
//
// What the public sees of a reading is released so that no one can tie it to the moment it was given:
//   · only readings of finished UTC days, never today's, so polling the record shows nothing arrive;
//   · in batches of BATCH_SIZE, oldest first, so each night's addition to the record — and to its git
//     history — holds at least that many readings or none;
//   · without the day: a batch number instead, and the random id.
// The nightly snapshot (scripts/reading/snapshot.ts) commits the record as src/data/reading/<round>.json
// under CC0, one reading per line, rewritten when it changed; its nights live in git history.
import type { EstimateTuple, PublicReading, StoredReading, VoteTuple } from './reading'

/** Readings a batch must hold before the record releases it. */
export const BATCH_SIZE = 5

export const RECORD_CONTRACT = 'third-reading-record/1'

export interface RecordFile {
  $contract: typeof RECORD_CONTRACT
  round: string
  source: string
  licence: 'CC0-1.0'
  batch_size: number
  readings: number
  entries: PublicReading[]
}

export const ENTRY_ID = /^t-[0-9a-f]{16}$/

/**
 * The readings of finished days, as the record may show them: the oldest whole batches, each reading
 * without its day. `finished` comes ordered by day and id (src/lib/reading/store.ts), and a finished
 * day never gains a reading, so a batch, once released, never changes.
 */
export function releaseBatches(finished: readonly StoredReading[], size = BATCH_SIZE): PublicReading[] {
  const released = Math.floor(finished.length / size) * size
  return finished
    .slice(0, released)
    .map((e, i) => ({ id: e.id, batch: Math.floor(i / size) + 1, consent: e.consent, primed: e.primed, votes: e.votes, estimates: e.estimates }))
    .sort((a, b) => a.batch - b.batch || a.id.localeCompare(b.id))
}

const isVote = (v: unknown): v is VoteTuple =>
  Array.isArray(v) && v.length === 4 && typeof v[0] === 'string' && typeof v[1] === 'string' && (v[2] === 0 || v[2] === 1 || v[2] === 2 || v[2] === null) && Number.isInteger(v[3])
const isEstimate = (e: unknown): e is EstimateTuple =>
  Array.isArray(e) && e.length === 3 && typeof e[0] === 'string' && (e[1] === null || (typeof e[1] === 'number' && Number.isFinite(e[1]))) && Number.isInteger(e[2])

/** Only what the record promises passes; a malformed answer writes nothing rather than half a file. */
export function toRecordFile(payload: unknown, source: string): RecordFile {
  const p = payload as { ok?: unknown; round?: unknown; batch_size?: unknown; entries?: unknown }
  if (p?.ok !== true || typeof p.round !== 'string' || !Array.isArray(p.entries) || !Number.isInteger(p.batch_size)) throw new Error('not a reading record')
  const entries = p.entries.map((raw) => {
    const e = raw as Record<string, unknown>
    if (typeof e.id !== 'string' || !ENTRY_ID.test(e.id) || !Number.isInteger(e.batch) || (e.batch as number) < 1 || typeof e.consent !== 'string' || typeof e.primed !== 'boolean') throw new Error('malformed reading')
    if ('day' in e) throw new Error(`reading ${e.id} carries its day`)
    if (!Array.isArray(e.votes) || !e.votes.every(isVote) || !Array.isArray(e.estimates) || !e.estimates.every(isEstimate)) throw new Error(`malformed reading ${e.id}`)
    return { id: e.id, batch: e.batch as number, consent: e.consent, primed: e.primed, votes: e.votes as VoteTuple[], estimates: e.estimates as EstimateTuple[] }
  })
  entries.sort((a, b) => a.batch - b.batch || a.id.localeCompare(b.id))
  return { $contract: RECORD_CONTRACT, round: p.round, source, licence: 'CC0-1.0', batch_size: p.batch_size as number, readings: entries.length, entries }
}

/** Stable text: the header pretty, each reading on one line. */
export function serializeRecord(f: RecordFile): string {
  const head = JSON.stringify({ $contract: f.$contract, round: f.round, source: f.source, licence: f.licence, batch_size: f.batch_size, readings: f.readings }, null, 2)
  const body = f.entries.map((e) => `    ${JSON.stringify(e)}`).join(',\n')
  return `${head.slice(0, -2)},\n  "entries": [${f.entries.length ? `\n${body}\n  ` : ''}]\n}\n`
}
