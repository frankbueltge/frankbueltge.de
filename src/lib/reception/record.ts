// src/lib/reception/record.ts — what /reception shows of the record (2026-10-17): the architect's notes
// first, the best-received works, the newest visitors' notes. Pure, so the page renders the committed
// snapshot at build time and its script renders the live record with the same rules.

import type { Snapshot, SnapshotNote, SnapshotWork } from './snapshot'

/** The ranking pulls every average toward 3 by three phantom ratings, so one enthusiastic rating cannot
 *  top the list; the page shows the plain average and says so. */
export const PRIOR_MEAN = 3
export const PRIOR_WEIGHT = 3

export function damped(w: Pick<SnapshotWork, 'count' | 'distribution'>): number {
  const sum = w.distribution.reduce((a, n, i) => a + n * (i + 1), 0)
  return (sum + PRIOR_MEAN * PRIOR_WEIGHT) / (w.count + PRIOR_WEIGHT)
}

export function rankWorks(works: readonly SnapshotWork[], limit = 12): SnapshotWork[] {
  return works
    .filter((w) => w.count > 0)
    .sort((a, b) => damped(b) - damped(a) || b.count - a.count || (a.id < b.id ? -1 : 1))
    .slice(0, limit)
}

const newestFirst = (a: SnapshotNote, b: SnapshotNote) => (a.at < b.at ? 1 : a.at > b.at ? -1 : a.id < b.id ? -1 : 1)

export function architectNotes(snap: Pick<Snapshot, 'notes'>, limit = 20): SnapshotNote[] {
  return snap.notes.filter((n) => n.owner).sort(newestFirst).slice(0, limit)
}

export function visitorNotes(snap: Pick<Snapshot, 'notes'>, limit = 30): SnapshotNote[] {
  return snap.notes.filter((n) => !n.owner).sort(newestFirst).slice(0, limit)
}

/** A note's work as the page links it: its title and address from the record, its id otherwise. */
export function workLabel(snap: Pick<Snapshot, 'works'>, id: string): { title: string; href: string | null } {
  const w = snap.works.find((x) => x.id === id)
  return { title: w?.title ?? id, href: w?.href ?? null }
}

export const scoreText = (n: number): string => `${'★'.repeat(n)}${'☆'.repeat(5 - n)}`
