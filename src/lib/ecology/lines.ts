// src/lib/ecology/lines.ts — which LINE of a practice a work belongs to.
//
// The vocabulary is the canon's (docs/wording-kanon.md, "Ergänzung 2026-08-12"):
//
//   line          what runs — a constituted strand of a practice. The Atelier runs two.
//   constitution  what governs and separates them: "one founding text, two constitutions".
//   Protocol vN   the NUMBER of a constitution. Never the name of a line — the numbers move.
//
// And the rule that decides where this may appear at all: **the pyramid keeps three stations.
// A line lives INSIDE a station, never beside it** — otherwise the ecology grows a corner per
// fork and a visitor understands nothing (Frank, 2026-08-12). So nothing here adds a practice,
// a door or a node; it adds one dimension to works that already belong to the Atelier.
//
// Why it is needed: from 2026-08-10 the Atelier runs in two repositories at once, and the works
// register carries both under one namespace — correctly, because they ARE one practice by
// descent. The cost was that the two lines became indistinguishable on the surfaces, which is
// what Frank saw (wording private): the two lines are mixed together everywhere.

import { NIGHTLY_FORK_DIR } from '@/lib/engines/register'
import type { LatestWork } from '@/lib/engines/latest'

/** The last night of the first nightly era. The line was stopped here, not finished: everything
 *  up to and including this date was made under Protocol v2/v3, and it lives in the Atelier's own
 *  mirror. Kept in step with `LINE_END` in scripts/nightly/mirror.mjs, which cuts the same date
 *  for the same reason — a work must not arrive at two addresses. */
export const NIGHTLY_ERA_END = '2026-07-18'

export type LineId = 'nightly' | 'work-line' | 'n-1'

/** The lines whose output lands in the works register. n-1's does not: its repository IS its
 *  record, mirrored whole at public/n-1/ and served as the practice's own surface at /n-1 —
 *  the house states the line and opens a door, it never re-lists that record here. */
export type WorkBearingLineId = Exclude<LineId, 'n-1'>

/** One line's facts. A union discriminated on `id`, so the type system itself refuses the two
 *  mistakes this file exists to prevent: asking n-1 for a protocol version (its Dowry says
 *  "this practice has no protocol document" — no version exists BY DESIGN), and counting a
 *  work-bearing line's works anywhere but the register. */
export type LineFacts =
  | {
      id: WorkBearingLineId
      /** what the site calls it, in the canon's words */
      label: string
      /** the namespace whose mirrored "… Protocol vN" governs this line */
      law: { kind: 'protocol'; ns: string }
      /** one clause a stranger can use — never the protocol number, which moves */
      gloss: string
    }
  | {
      id: 'n-1'
      label: string
      law: { kind: 'founding' }
      gloss: string
    }

/** The Atelier's three lines, in the order the record made them (the third since 2026-08-15 —
 *  Frank's placement, wording private; descent: founded on this practice's own working paper). */
export const ATELIER_LINES: readonly LineFacts[] = [
  {
    id: 'nightly',
    label: 'the nightly line',
    law: { kind: 'protocol', ns: 'nightly' },
    gloss: 'one night, one work or one reading — stopped 2026-07-18, restored 2026-08-10 in a fork',
  },
  {
    id: 'work-line',
    label: 'the work-line',
    law: { kind: 'protocol', ns: 'atelier' },
    gloss: 'one line of work over months, in numbered ticks, shipped or ended at its arc gate',
  },
  {
    // The label is NOT hardcoded to stay: the practice's window declaration carries its current
    // title (a working title, by its own Dowry a placeholder), and the station sheet renders
    // that declaration via readN1Facts — this entry's label is the fallback the tests pin.
    id: 'n-1',
    label: 'n-1',
    law: { kind: 'founding' },
    gloss: 'founded on this practice’s own working paper — keeps its own record, on its own surface',
  },
] as const

/**
 * Which line a work belongs to, or null where the question does not arise.
 *
 * Only the Atelier runs more than one line today, and a marker on a practice that runs one is
 * noise. Two facts decide it, in this order:
 *
 *   1. the directory it was mirrored from — the fork's works are the nightly line's, whatever
 *      their date. This is why `LatestWork.dir` exists: the namespace stopped being sufficient
 *      when a second repository began contributing works to the same practice.
 *   2. otherwise the date, against the era that ended on 2026-07-18.
 *
 * Sniffing the href would work today and break the first time a route is renamed; the directory
 * is the fact.
 *
 * The return type is the WORK-BEARING lines only: nothing in this register can be n-1's,
 * because that line's record never lands here (see WorkBearingLineId).
 */
export function lineOfWork(work: Pick<LatestWork, 'ns' | 'date' | 'dir'>): WorkBearingLineId | null {
  if (work.ns !== 'atelier') return null
  if (work.dir === NIGHTLY_FORK_DIR) return 'nightly'
  return work.date <= NIGHTLY_ERA_END ? 'nightly' : 'work-line'
}

export const lineLabel = (id: LineId): string =>
  ATELIER_LINES.find((l) => l.id === id)?.label ?? id

/** The same name without its article, for places that set it as a chip or a key rather than
 *  reading it in a sentence. The canon's distinction survives either way: "**a** work-line" is a
 *  unit of work, "**the** work-line" is the line — so the chip drops the article rather than
 *  keeping the wrong one. */
export const lineShortLabel = (id: LineId): string => lineLabel(id).replace(/^the /, '')

/** How many works each work-bearing line has on the record. Counted, never carried in prose.
 *  n-1 has no entry here on purpose: a zero would say "this line made nothing", when the truth
 *  is that its record is kept elsewhere — a different statement entirely. */
export function countByLine(works: readonly LatestWork[]): Record<WorkBearingLineId, number> {
  const counts: Record<WorkBearingLineId, number> = { nightly: 0, 'work-line': 0 }
  for (const w of works) {
    const id = lineOfWork(w)
    if (id) counts[id] += 1
  }
  return counts
}
