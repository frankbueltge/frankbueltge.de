// src/lib/ops/ecology-shelf.ts — "From the Ecology", the shelf of the practices' pieces on the
// entrance (2026-11-03; it was "Selected works", drawn at random, from 2026-10-17).
//
// The calm homepage (docs/design_handoff_homepage_calm/README.md §4): the pool the shelf held since
// 2026-11-02 (src/lib/ops/shelf-pool.ts, withoutLab), now newest first by default, with chips that
// narrow it to one house, a switch to a random draw, and six cards at a time with "show more".
// Without JavaScript the first six by date stand and the controls stay hidden.
//
// Everything here is pure and runs at build time and in the edition's script alike: the order,
// which house a card belongs to, the chips with their counts, and which cards a view shows. The
// script owns no rule of its own; it moves the cards the build rendered.

import type { ShelfCard } from './selected-works'

/** The houses a chip can narrow the shelf to. Machine Attention's pieces stand under "all" only. */
export const ECOLOGY_HOUSES = ['atelier', 'field', 'studio', 'n-1'] as const
export type EcologyHouse = (typeof ECOLOGY_HOUSES)[number]
export type EcologyFilter = 'all' | EcologyHouse

/** How many cards a view shows at first, and how many "show more" adds. */
export const ECOLOGY_STEP = 6

/** The house a card belongs to, for the chips: a practice by its voice, n-1 by its key. */
export function houseOfCard(card: Pick<ShelfCard, 'voice' | 'key'>): EcologyHouse | null {
  if (card.voice) return card.voice
  return card.key.startsWith('n-1-') ? 'n-1' : null
}

/**
 * The shelf newest first, by the day each card is dated by. A card without a day goes to the end.
 * Cards of one day keep the order they were given in (Array.prototype.sort is stable).
 */
export function newestFirst<T extends Pick<ShelfCard, 'day'>>(cards: readonly T[]): T[] {
  const dated = (c: T) => /^\d{4}-\d{2}-\d{2}$/.test(c.day)
  return [...cards].sort((a, b) => {
    if (dated(a) !== dated(b)) return dated(a) ? -1 : 1
    return a.day < b.day ? 1 : a.day > b.day ? -1 : 0
  })
}

/** The chips: "all" first, then each house in its order, each with how many cards it holds. A
 *  house with no card gets no chip. */
export function ecologyChips(
  houses: readonly (EcologyHouse | null)[],
  labels: Record<EcologyFilter, string>,
): { id: EcologyFilter; label: string; count: number }[] {
  const chips: { id: EcologyFilter; label: string; count: number }[] = [{ id: 'all', label: labels.all, count: houses.length }]
  for (const house of ECOLOGY_HOUSES) {
    const count = houses.filter((h) => h === house).length
    if (count > 0) chips.push({ id: house, label: labels[house], count })
  }
  return chips
}

/**
 * Which cards a view shows, and in what order: `order` is a permutation of the cards' positions
 * (identity for newest first, a shuffle for the random draw), `houses` each position's house. The
 * view keeps the cards of the filter in that order and shows the first `shown` of them.
 */
export function ecologyView(
  order: readonly number[],
  houses: readonly (EcologyHouse | null)[],
  filter: EcologyFilter,
  shown: number,
): { visible: number[]; total: number } {
  const matching = order.filter((i) => filter === 'all' || houses[i] === filter)
  return { visible: matching.slice(0, Math.max(0, shown)), total: matching.length }
}
