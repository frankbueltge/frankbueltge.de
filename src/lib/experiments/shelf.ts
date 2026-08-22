// The facets of the /experiments shelf (Frank, 2026-08-22, second pass: a filter and a page a
// visitor can survey without scrolling through sixteen full descriptions).
//
// Why this is a module and not inline in the page: the counts on the filter buttons are claims
// about the shelf ("counter-measurement 9"), and a claim rendered from a hand-written number is
// exactly the kind of thing that goes stale a week later. Everything here is derived from the
// cards the page actually renders, and shelf.test.ts checks that the facet counts and the shown
// rows can never disagree.
import type { Werk } from '@/data/werke'

/** What a row IS — the register's `tier` translated into the shelf's own vocabulary, plus
 *  `practice` for the two houses beside the lab, which are not works at all. */
export type ShelfKind = 'experiment' | 'study' | 'instrument' | 'practice'

export const KIND_LABEL: Record<ShelfKind, string> = {
  experiment: 'experiment',
  study: 'study',
  instrument: 'instrument',
  practice: 'practice',
}

/** `tier` is optional in the register and means "experiment" when absent (werke.ts), so the
 *  mapping is written out rather than cast: an unmapped tier must fail loudly here instead of
 *  quietly becoming an experiment on the page. */
export function kindOf(werk: Werk): ShelfKind {
  switch (werk.tier) {
    case undefined:
    case 'experiment':
      return 'experiment'
    case 'studie':
      return 'study'
    case 'instrument':
      return 'instrument'
    default:
      throw new Error(`shelf: werk "${werk.id}" carries tier "${werk.tier}", which the shelf has no row for`)
  }
}

/** One row of the shelf, reduced to what the filter needs. `group` is the line id for an
 *  experiment and BESIDE_GROUP for the practices — one axis, so filtering a line hides the
 *  practices too instead of leaving a headless section behind. */
export interface ShelfCard {
  id: string
  group: string
  kind: ShelfKind
  live: boolean
}

export const BESIDE_GROUP = 'beside'

export interface FacetOption {
  value: string
  label: string
  n: number
}

export interface Facet {
  /** the data-attribute suffix the page filters on: data-group / data-kind / data-live */
  group: 'group' | 'kind' | 'live'
  title: string
  options: FacetOption[]
}

/**
 * The three facet rows, counted from the cards themselves.
 *
 * Rules that keep the bar honest:
 *   · an option with zero cards is never offered — a filter that yields an empty page is a
 *     dead end, and offering it claims the shelf holds something it does not;
 *   · a facet with a single option is dropped entirely (nothing to choose);
 *   · group order follows `groupOrder`, so the buttons read in the same order as the page;
 *     kinds follow the register's own hierarchy, not alphabet.
 */
export function shelfFacets(
  cards: readonly ShelfCard[],
  groupLabels: ReadonlyMap<string, string>,
  groupOrder: readonly string[],
): Facet[] {
  const count = <T>(pick: (c: ShelfCard) => T, value: T) => cards.filter((c) => pick(c) === value).length

  const groupOptions = groupOrder
    .map((g) => ({ value: g, label: (groupLabels.get(g) ?? g).toLowerCase(), n: count((c) => c.group, g) }))
    .filter((o) => o.n > 0)

  const kindOptions = (['experiment', 'study', 'instrument', 'practice'] as ShelfKind[])
    .map((k) => ({ value: k, label: KIND_LABEL[k], n: count((c) => c.kind, k) }))
    .filter((o) => o.n > 0)

  const liveOptions = [
    { value: 'live', label: 'live data', n: count((c) => c.live, true) },
    { value: 'static', label: 'no daily data', n: count((c) => c.live, false) },
  ].filter((o) => o.n > 0)

  return [
    { group: 'group' as const, title: 'line', options: groupOptions },
    { group: 'kind' as const, title: 'kind', options: kindOptions },
    { group: 'live' as const, title: 'data', options: liveOptions },
  ].filter((f) => f.options.length > 1)
}
