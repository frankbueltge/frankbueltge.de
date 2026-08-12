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
// what Frank saw: „hier sind beide Ulysses Linien überall vermischt."

import { NIGHTLY_FORK_DIR } from '@/lib/engines/register'
import type { LatestWork } from '@/lib/engines/latest'

/** The last night of the first nightly era. The line was stopped here, not finished: everything
 *  up to and including this date was made under Protocol v2/v3, and it lives in the Atelier's own
 *  mirror. Kept in step with `LINE_END` in scripts/nightly/mirror.mjs, which cuts the same date
 *  for the same reason — a work must not arrive at two addresses. */
export const NIGHTLY_ERA_END = '2026-07-18'

export type LineId = 'nightly' | 'work-line'

export interface LineFacts {
  id: LineId
  /** what the site calls it, in the canon's words */
  label: string
  /** the namespace whose mirrored PROTOCOL.md governs this line */
  protocolNs: string
  /** one clause a stranger can use — never the protocol number, which moves */
  gloss: string
}

/** The Atelier's two lines, in the order the record made them. */
export const ATELIER_LINES: readonly LineFacts[] = [
  {
    id: 'nightly',
    label: 'the nightly line',
    protocolNs: 'nightly',
    gloss: 'one night, one work or one reading — stopped 2026-07-18, restored 2026-08-10 in a fork',
  },
  {
    id: 'work-line',
    label: 'the work-line',
    protocolNs: 'atelier',
    gloss: 'one line of work over months, in numbered ticks, shipped or ended at its arc gate',
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
 */
export function lineOfWork(work: Pick<LatestWork, 'ns' | 'date' | 'dir'>): LineId | null {
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

/** How many works each line has on the record. Counted, never carried in prose. */
export function countByLine(works: readonly LatestWork[]): Record<LineId, number> {
  const counts: Record<LineId, number> = { nightly: 0, 'work-line': 0 }
  for (const w of works) {
    const id = lineOfWork(w)
    if (id) counts[id] += 1
  }
  return counts
}
