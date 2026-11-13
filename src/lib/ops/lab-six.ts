// src/lib/ops/lab-six.ts — the lab's six strongest experiments, the band the entrance opens with.
//
// Frank's decision of 2026-11-02 (wording private, paraphrased): the homepage leads with the lab's
// experiments. From 2026-11-03 to 2026-11-13 that was Ducking large over a carousel of nine. Since
// 2026-11-13 (Frank's request, wording private: the lab's six strongest works, shown differently)
// it is exactly the six EDITION.lab.six names, ranked, in three tiers: the first large, then two,
// then three (src/components/ops/LabSix.astro). No carousel and no script.
//
//   · a retired work, or an id the register does not hold, is passed over rather than shown;
//     the test holds the edition's own list to six works that are there and running.
//
// /experiments keeps listing every experiment; the band is a ranking, not the index.
//
// A card is read the way a pick of the selected works is read (readPick): title, kind, the day in
// words, the register's one line, the address through the publication rule, and the still — for a
// lab experiment, a shot of its own page as this site serves it (public/shelf/lab-<id>.webp, taken
// by npm run shelf:shots). A work whose page has no shot yet shows the miniature /experiments draws
// from its own record (src/lib/experiments/thumbnails.ts), never a picture made for it.

import { EDITION } from '@/config/edition-wording'
import { SELECTED_WORKS } from '@/config/selected-works'
import { EXPERIMENT_LINES, WERKE_HOLDINGS, type Werk } from '@/data/werke'
import { THUMBNAILS, type Thumbnail } from '@/lib/experiments/thumbnails'
import { readPick, type ShelfCard } from './selected-works'

export interface LabPick {
  id: string
  reason: string
}

/** The picks in the order given, each once, without a retired work or an id the register lacks. */
export function labOrder(werke: readonly Werk[], picks: readonly LabPick[]): { werk: Werk; reason: string }[] {
  const running = new Map(werke.filter((w) => !w.retired).map((w) => [w.id, w]))
  const seen = new Set<string>()
  return picks.flatMap((pick) => {
    const werk = running.get(pick.id)
    if (!werk || seen.has(pick.id)) return []
    seen.add(pick.id)
    return [{ werk, reason: pick.reason }]
  })
}

export interface LabCard extends ShelfCard {
  /** its place among the six, from 1 */
  rank: number
  /** the research line's label, as /experiments heads the work's group */
  line: string | null
  /** the miniature of the work's own record, for a card whose page has no still yet */
  mini: Thumbnail | null
}

/** The band's cards, strongest first. */
export function readLabSix(
  root: string = process.cwd(),
  picks: readonly LabPick[] = EDITION.lab.six,
  werke: readonly Werk[] = WERKE_HOLDINGS,
): LabCard[] {
  return labOrder(werke, picks).map(({ werk, reason }, i) => {
    // a lab experiment needs no presentation shelf to be read, hence the empty one
    const card = readPick({ work: { kind: 'experiment', id: werk.id }, reason }, root, [])
    return {
      ...card,
      rank: i + 1,
      line: EXPERIMENT_LINES.find((l) => l.id === werk.line)?.label ?? null,
      mini: card.still ? null : (THUMBNAILS.get(werk.id) ?? null),
    }
  })
}

/** The tier a rank stands in: the first alone and large, the second and third side by side, the
 *  rest three to a row. */
export function labTier(rank: number): 1 | 2 | 3 {
  return rank <= 1 ? 1 : rank <= 3 ? 2 : 3
}

/** The plate line for a card that has neither still nor miniature. */
export const labPlate = (card: LabCard): string => SELECTED_WORKS.plate(card.kind)
