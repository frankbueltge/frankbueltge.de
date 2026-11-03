// From the Ecology (2026-11-03): the entrance's shelf of the practices' pieces —
// docs/design_handoff_homepage_calm/README.md §4. Newest first, chips by house with their
// counts, a random draw, six at a time; the rules held here are the ones the script runs.
import { describe, expect, it } from 'vitest'
import { SELECTED_WORKS } from '@/config/selected-works'
import { ECOLOGY_STEP, ecologyChips, ecologyView, houseOfCard, newestFirst, type EcologyHouse } from './ecology-shelf'
import { readPool, withoutLab } from './shelf-pool'
import { shuffledOrder } from './shelf-order'

const pool = withoutLab(readPool())

describe('the order', () => {
  it('is newest first by the day a card is dated by, an undated card last, a tie as given', () => {
    const cards = [
      { key: 'a', day: '2026-10-01' },
      { key: 'b', day: '' },
      { key: 'c', day: '2026-10-30' },
      { key: 'd', day: '2026-10-01' },
    ]
    expect(newestFirst(cards).map((c) => c.key)).toEqual(['c', 'a', 'd', 'b'])
    expect(cards.map((c) => c.key)).toEqual(['a', 'b', 'c', 'd'])
  })

  it('puts the newest piece of the pool first', () => {
    const ordered = newestFirst(pool)
    const days = ordered.map((c) => c.day)
    expect(days).toEqual([...days].sort().reverse())
  })
})

describe('the houses and the chips', () => {
  it('knows a practice by its voice and n-1 by its key; anything else has no chip of its own', () => {
    expect(houseOfCard({ voice: 'studio', key: 'studio-x' })).toBe('studio')
    expect(houseOfCard({ voice: null, key: 'n-1-works-x' })).toBe('n-1')
    expect(houseOfCard({ voice: null, key: 'attention-foreknown' })).toBeNull()
  })

  it('offers All and the four houses of the handoff, in its order, each with its count', () => {
    const houses = pool.map(houseOfCard)
    const chips = ecologyChips(houses, SELECTED_WORKS.ecology.filters)
    expect(chips.map((c) => c.label)).toEqual(['All', 'The Atelier', 'The Field', 'The Studio', 'n-1'])
    expect(chips[0].count).toBe(pool.length)
    for (const chip of chips.slice(1)) expect(chip.count).toBe(houses.filter((h) => h === chip.id).length)
  })

  it('draws no chip for a house with nothing on the shelf', () => {
    const chips = ecologyChips(['studio', 'studio', null], SELECTED_WORKS.ecology.filters)
    expect(chips.map((c) => c.id)).toEqual(['all', 'studio'])
  })

  it('holds no lab piece: the lab leads the page above', () => {
    expect(pool.some((c) => c.lab)).toBe(false)
  })
})

describe('a view', () => {
  const houses: (EcologyHouse | null)[] = ['studio', 'field', 'studio', 'n-1', null, 'studio', 'atelier', 'studio']
  const newest = houses.map((_, i) => i)

  it('shows six at first, and as many as there are where there are fewer', () => {
    expect(ECOLOGY_STEP).toBe(6)
    expect(ecologyView(newest, houses, 'all', ECOLOGY_STEP)).toEqual({ visible: [0, 1, 2, 3, 4, 5], total: 8 })
    expect(ecologyView(newest, houses, 'studio', ECOLOGY_STEP)).toEqual({ visible: [0, 2, 5, 7], total: 4 })
  })

  it('shows six more on each press, never more than the filter holds', () => {
    expect(ecologyView(newest, houses, 'all', ECOLOGY_STEP * 2).visible).toEqual(newest)
  })

  it('keeps the order it is handed, a random draw among them', () => {
    const order = shuffledOrder(houses.length, () => 0.3)
    const view = ecologyView(order, houses, 'studio', ECOLOGY_STEP)
    expect(view.visible).toEqual(order.filter((i) => houses[i] === 'studio'))
  })
})

describe('the words', () => {
  const E = SELECTED_WORKS.ecology
  const strings = [SELECTED_WORKS.title, SELECTED_WORKS.sub, E.filterLabel, E.chip, E.modeLabel, E.more, E.status, ...Object.values(E.filters), ...Object.values(E.modes), ...Object.values(E.modeWords)]

  it('calls the shelf From the Ecology', () => {
    expect(SELECTED_WORKS.title).toBe('From the Ecology')
  })

  it.each(strings.map((s) => [s] as const))('%s carries no typed digit', (text) => {
    expect(text.replace(/n-1/g, '')).not.toMatch(/\d/)
  })

  it('leaves the numbers of the status line to the template', () => {
    for (const key of ['{shown}', '{total}', '{mode}']) expect(E.status).toContain(key)
  })
})
