// src/lib/study/record.ts — what the public sees of a study's answers, and the committed file (2026-10-27).
//
// The release rule of Third Reading (src/lib/reading/record.ts), for every study: only answers of
// finished UTC days, in whole batches of BATCH_SIZE, oldest first, each without its day — a batch
// number instead, and a random id — and with the SHA-256 of the manifest it answered, so a study whose
// changed file passed the check again shows which answers belong to which version of its questions.
// Polling the record shows nothing arrive, and each night's addition to it, and to git history, holds
// a batch or nothing. The nightly snapshot commits the record as
// src/data/studies/records/<study>.json under CC0, one answer set per line, and hands a copy to the
// practice that asked (scripts/study/snapshot.ts).
import type { Answers } from './answers'
import type { StoredAnswers } from './store'

export const BATCH_SIZE = 5
export const RECORD_CONTRACT = 'study-record/1'
export const ENTRY_ID = /^s-[0-9a-f]{16}$/
const SHA256 = /^[0-9a-f]{64}$/

export interface PublicAnswers {
  id: string
  batch: number
  consent: string
  manifest: string
  answers: Answers
}

export interface StudyRecordFile {
  $contract: typeof RECORD_CONTRACT
  study: string
  work: string
  source: string
  licence: 'CC0-1.0'
  batch_size: number
  entries_count: number
  entries: PublicAnswers[]
}

export function releaseBatches(finished: readonly StoredAnswers[], size = BATCH_SIZE): PublicAnswers[] {
  const released = Math.floor(finished.length / size) * size
  return finished
    .slice(0, released)
    .map((e, i) => ({ id: e.id, batch: Math.floor(i / size) + 1, consent: e.consent, manifest: e.manifest, answers: e.answers }))
    .sort((a, b) => a.batch - b.batch || a.id.localeCompare(b.id))
}

/** Only what the record promises passes; a malformed answer writes nothing rather than half a file. */
export function toRecordFile(payload: unknown, source: string): StudyRecordFile {
  const p = payload as { ok?: unknown; study?: unknown; work?: unknown; batch_size?: unknown; entries?: unknown }
  if (p?.ok !== true || typeof p.study !== 'string' || typeof p.work !== 'string' || !Array.isArray(p.entries) || !Number.isInteger(p.batch_size)) {
    throw new Error('not a study record')
  }
  const entries = p.entries.map((raw) => {
    const e = raw as Record<string, unknown>
    if (typeof e.id !== 'string' || !ENTRY_ID.test(e.id) || !Number.isInteger(e.batch) || (e.batch as number) < 1 || typeof e.consent !== 'string') throw new Error('malformed answer set')
    if ('day' in e) throw new Error(`answer set ${e.id} carries its day`)
    if (typeof e.manifest !== 'string' || !SHA256.test(e.manifest)) throw new Error(`answer set ${e.id} does not name its manifest`)
    if (!e.answers || typeof e.answers !== 'object' || Array.isArray(e.answers)) throw new Error(`malformed answers in ${e.id}`)
    return { id: e.id, batch: e.batch as number, consent: e.consent, manifest: e.manifest, answers: e.answers as Answers }
  })
  entries.sort((a, b) => a.batch - b.batch || a.id.localeCompare(b.id))
  return { $contract: RECORD_CONTRACT, study: p.study, work: p.work, source, licence: 'CC0-1.0', batch_size: p.batch_size as number, entries_count: entries.length, entries }
}

export function serializeRecord(f: StudyRecordFile): string {
  const head = JSON.stringify(
    { $contract: f.$contract, study: f.study, work: f.work, source: f.source, licence: f.licence, batch_size: f.batch_size, entries_count: f.entries_count },
    null,
    2,
  )
  const body = f.entries.map((e) => `    ${JSON.stringify(e)}`).join(',\n')
  return `${head.slice(0, -2)},\n  "entries": [${f.entries.length ? `\n${body}\n  ` : ''}]\n}\n`
}
