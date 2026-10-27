// src/lib/reading/record-data.ts — the committed records, for the pages only (2026-10-26).
// Vite's glob, so a round that has no snapshot yet simply has no file; never imported by the Functions.
import type { RecordFile } from './record'

const modules = import.meta.glob('../../data/reading/*.json', { eager: true, import: 'default' }) as Record<string, RecordFile>

/** The committed record of a round, or null before the first nightly snapshot of it. */
export function committedRecord(round: string): RecordFile | null {
  return Object.values(modules).find((f) => f?.round === round) ?? null
}
