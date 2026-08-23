import { describe, it, expect } from 'vitest'
import { EXPERIMENT_LINES, WERKE_BY_LINE, WERKE_HOLDINGS } from '@/data/werke'
import { BESIDE_GROUP, kindOf, shelfFacets, type ShelfCard } from './shelf'

/** The cards the page builds: every shelf entry, plus the two practices beside the lab. */
const cards: ShelfCard[] = [
  ...WERKE_BY_LINE.flatMap((g) =>
    g.werke.map((w) => ({ id: w.id, group: g.line.id, kind: kindOf(w), live: Boolean(w.live) })),
  ),
  { id: 'nightly-line', group: BESIDE_GROUP, kind: 'practice' as const, live: false },
  { id: 'n-1', group: BESIDE_GROUP, kind: 'practice' as const, live: false },
  { id: 'arch', group: BESIDE_GROUP, kind: 'practice' as const, live: false },
]

const labels = new Map<string, string>([
  ...EXPERIMENT_LINES.map((l) => [l.id, l.label] as [string, string]),
  [BESIDE_GROUP, 'BESIDE THE LAB'],
])
const order = [...EXPERIMENT_LINES.map((l) => l.id), BESIDE_GROUP]

describe('kindOf — the register’s tier in the shelf’s vocabulary', () => {
  it('reads an absent tier as an experiment (werke.ts default)', () => {
    expect(kindOf({ id: 'x' } as never)).toBe('experiment')
  })
  it('translates the register’s three named tiers', () => {
    expect(kindOf({ tier: 'experiment' } as never)).toBe('experiment')
    expect(kindOf({ tier: 'studie' } as never)).toBe('study')
    expect(kindOf({ tier: 'instrument' } as never)).toBe('instrument')
  })
  it('fails loudly on a tier the shelf has no row for', () => {
    // 'project' exists in the register (Machine Attention) and is deliberately NOT on this
    // shelf. If it ever arrives, the page must break rather than call a project an experiment.
    expect(() => kindOf({ id: 'attention', tier: 'project' } as never)).toThrow(/no row for/)
  })
})

describe('shelfFacets', () => {
  const facets = shelfFacets(cards, labels, order)

  it('offers the three axes in page order', () => {
    expect(facets.map((f) => f.group)).toEqual(['group', 'kind', 'live'])
  })

  it('counts every card exactly once per axis — the bar cannot disagree with the page', () => {
    for (const facet of facets) {
      const summed = facet.options.reduce((n, o) => n + o.n, 0)
      expect(summed, `axis ${facet.group}`).toBe(cards.length)
    }
  })

  it('lists the lines in the page’s own order, practices last', () => {
    const groups = facets.find((f) => f.group === 'group')!
    expect(groups.options.map((o) => o.value)).toEqual(order)
    expect(groups.options.at(-1)!.value).toBe(BESIDE_GROUP)
  })

  it('never offers an option that would empty the page', () => {
    for (const facet of facets) for (const option of facet.options) expect(option.n).toBeGreaterThan(0)
  })

  it('drops an axis that has nothing to choose', () => {
    const single: ShelfCard[] = [{ id: 'a', group: 'counter-measurement', kind: 'experiment', live: true }]
    // one group, one kind, one data state → no axis left worth a button
    expect(shelfFacets(single, labels, order)).toEqual([])
  })

  it('keeps the shelf’s totals: sixteen experiments and the three practices', () => {
    expect(cards.filter((c) => c.kind !== 'practice')).toHaveLength(WERKE_HOLDINGS.length)
    expect(cards.filter((c) => c.kind === 'practice')).toHaveLength(3)
  })
})
