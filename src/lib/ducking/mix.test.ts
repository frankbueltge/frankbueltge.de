import { describe, expect, it } from 'vitest'
import type { TrendingDay } from '@/lib/trending/types'
import { capY, FADER, inkOf, INK_FLOOR, lanePath, positionAt, scaleY, SCALE } from './figure'
import { captionOf, countLedger, crowdCutoff, fmtCount, fmtShare, focusOf, shareAt, solve, spanOf, standing, toDb, toGain, toPosition, toShare, trailingShares } from './mix'

const signal = (label: string, links: string[] = []) => ({
  source: 'x',
  label,
  url: null,
  rank: 1,
  magnitude: null,
  magnitude_unit: '',
  geo: null,
  links: links.map((title) => ({ title, url: 'https://example.org', publisher: null })),
  meta: {},
})

const day = (date: string, labels: (string | [string, string[]])[]): TrendingDay =>
  ({
    date,
    signals: { x: labels.map((l) => (typeof l === 'string' ? signal(l) : signal(l[0], l[1]))) },
    topics: [],
  }) as unknown as TrendingDay

const channels = [
  { terms: ['Ebola'] },
  { terms: ['hunger'], exclude: ['Hunger Games'] },
]

describe('the count', () => {
  const ledger = countLedger(channels, [
    day('2026-10-02', ['nothing', ['a match', ['Ebola in Kenya']], 'The Hunger Games', 'hunger and Ebola']),
    day('2026-10-01', ['Ebola', 'nothing', 'nothing', 'hunger']),
  ])

  it('reads the days oldest first', () => {
    expect(ledger.days).toEqual(['2026-10-01', '2026-10-02'])
    expect(ledger.totals).toEqual([4, 4])
  })

  it('counts a label or a link title, by the whole word, and keeps the false friends out', () => {
    expect(ledger.counts[0]).toEqual([1, 1])
    expect(ledger.counts[1]![0]).toBe(1.5)
    expect(countLedger([{ terms: ['Iran'] }], [day('2026-10-01', ['Iranian', 'Iran.', 'Tirana'])]).counts[0]).toEqual([1])
  })

  it('splits a signal that names two matters, so nothing is counted twice', () => {
    expect(ledger.counts[1]).toEqual([1.5, 0.5])
  })
})

describe('the shares', () => {
  const ledger = {
    days: ['a', 'b', 'c'],
    totals: [100, 100, 200],
    counts: [[1, 0], [1, 2], [0, 0]],
  }

  it('reads a trailing span, shorter at the start of the record', () => {
    expect(spanOf(ledger, 2, 2)).toEqual({ counts: [1, 2], total: 300 })
    expect(spanOf(ledger, 0, 7)).toEqual({ counts: [1, 0], total: 100 })
  })

  it('sums to the whole, with everything else last', () => {
    const shares = trailingShares(ledger, 7)
    expect(shares[1]).toEqual([0.01, 0.01, 0.98])
    for (const row of shares) expect(row.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
  })
})

describe('the fader', () => {
  it('stands at the top for the whole, on the floor for nothing', () => {
    expect(toPosition(1)).toBe(1)
    expect(toPosition(0)).toBe(0)
  })

  it('climbs without a step, and stretches the top, where a channel can be heard', () => {
    const marks = [0.0001, 0.001, 0.01, 0.1, 1].map(toPosition)
    for (let i = 1; i < marks.length; i++) expect(marks[i]!).toBeGreaterThan(marks[i - 1]!)
    expect(marks[4]! - marks[3]!).toBeGreaterThan(marks[3]! - marks[2]!)
    expect(1 - toPosition(0.5)).toBeGreaterThan(0.1)
  })

  it('keeps zero apart from the quietest thing a week can hold', () => {
    expect(toPosition(1 / 6000)).toBeGreaterThan(0.1)
    expect(toPosition(1e-6)).toBe(0)
  })

  it('reads back what it was set to, and only the very floor is zero', () => {
    for (const share of [1, 0.4, 0.05, 0.003, 0.0002, 0.00005]) expect(toShare(toPosition(share))).toBeCloseTo(share, 10)
    expect(toShare(0)).toBe(0)
    expect(toShare(0.01)).toBeGreaterThan(0)
  })

  it('makes the share a share of power: one percent is minus twenty decibels', () => {
    expect(toDb(0.01)).toBeCloseTo(-20, 10)
    expect(toDb(0)).toBe(-Infinity)
    expect(20 * Math.log10(toGain(0.01))).toBeCloseTo(-20, 10)
  })
})

describe('holding', () => {
  const base = [0.001, 0.004, 0, 0.995]

  it('changes nothing when no hand is on the desk', () => {
    expect(solve(base, [null, null, null, null])).toEqual(base)
  })

  it('keeps the whole: what one takes, the others give, in their proportions', () => {
    const mix = solve(base, [0.5, null, null, null])
    expect(mix[0]).toBe(0.5)
    expect(mix.reduce((a, b) => a + b, 0)).toBeCloseTo(1, 12)
    expect(mix[3]! / mix[1]!).toBeCloseTo(base[3]! / base[1]!, 10)
  })

  it('gives nothing to a channel that measured zero', () => {
    expect(solve(base, [null, null, null, 0.1])[2]).toBe(0)
  })

  it('sends the room to the loud when everything else is pulled down', () => {
    const mix = solve(base, [null, null, null, 0])
    expect(mix[1]).toBeCloseTo(0.8, 10)
    expect(mix[0]).toBeCloseTo(0.2, 10)
  })

  it('lets a hand lift a channel off zero', () => {
    expect(solve(base, [null, null, 0.3, null])[2]).toBe(0.3)
  })

  it('scales hands that ask for more than the whole', () => {
    const mix = solve(base, [1, 1, null, null])
    expect(mix).toEqual([0.5, 0.5, 0, 0])
  })
})

describe('the ear', () => {
  it('leaves the crowd open with no hand, or a hand low on a fader', () => {
    expect(focusOf([])).toBe(0)
    expect(focusOf([0.1])).toBe(0)
    expect(crowdCutoff(0)).toBeGreaterThan(4000)
  })

  it('closes on the crowd as a matter comes up, and follows the highest hand', () => {
    expect(focusOf([0.5])).toBeGreaterThan(focusOf([0.3]))
    expect(focusOf([0.3, 0.9])).toBe(1)
    expect(crowdCutoff(1)).toBeLessThan(crowdCutoff(0.5))
  })
})

describe('the caption', () => {
  it('says what the crowd is, with its share', () => {
    expect(captionOf([], false, 0.9934)).toBe('The crowd is the rest of the web: 99.3 % of what its charts held this week.')
  })

  it('names the hands', () => {
    const ebola = { strip: 'EBOLA', share: 0.6 }
    expect(captionOf([ebola], false, 0.4)).toBe('You are holding EBOLA at 60.0 %. The crowd gives way to 40.0 %.')
    expect(captionOf([ebola, { strip: 'COP31', share: 0.1 }], false, 0.3)).toBe('You are holding EBOLA and COP31. The crowd gives way to 30.0 %.')
  })

  it('says where the room goes when the crowd itself is held', () => {
    expect(captionOf([], true, 0.03)).toContain('what was already loud')
  })
})

describe('a fader in motion', () => {
  const shares = [
    [0.1, 0.9],
    [0.3, 0.7],
  ]

  it('glides between two real days, and stands on them at whole days', () => {
    expect(shareAt(shares, 0)).toEqual([0.1, 0.9])
    expect(shareAt(shares, 1)).toEqual([0.3, 0.7])
    expect(shareAt(shares, 0.5)[0]).toBeCloseTo(0.2, 10)
  })

  it('stays on the record outside it', () => {
    expect(shareAt(shares, 9)).toEqual([0.3, 0.7])
    expect(shareAt(shares, -1)).toEqual([0.1, 0.9])
  })

  it('reads where it stands until it has arrived', () => {
    expect(standing(toPosition(0.01), 0.5)).toBeCloseTo(0.01, 10)
    expect(standing(toPosition(0.5) + 0.001, 0.5)).toBe(0.5)
    expect(standing(0, 0)).toBe(0)
  })
})

describe('the print', () => {
  it('does not round a quiet matter away', () => {
    expect(fmtShare(0.9934)).toBe('99.3 %')
    expect(fmtShare(0.0264)).toBe('2.64 %')
    expect(fmtShare(0.00265)).toBe('0.27 %')
    expect(fmtShare(0.00033)).toBe('0.033 %')
    expect(fmtShare(0)).toBe('0')
  })

  it('keeps halves and drops nothing else', () => {
    expect(fmtCount(6036)).toBe('6,036')
    expect(fmtCount(35.5)).toBe('35.5')
  })
})

describe('the geometry', () => {
  it('reads a cap back from its own middle', () => {
    for (const p of [0, 0.25, 0.8, 1]) expect(positionAt(capY(p) + FADER.capHeight / 2)).toBeCloseTo(p, 2)
  })

  it('clamps a pointer outside the slot', () => {
    expect(positionAt(-50)).toBe(1)
    expect(positionAt(FADER.height + 50)).toBe(0)
  })

  it('gives the top of the scale the most room, and keeps zero apart', () => {
    const ys = SCALE.filter((s) => s.share > 0).map((s) => scaleY(s.share))
    const steps = ys.slice(1).map((y, i) => y - ys[i]!)
    for (let i = 1; i < steps.length; i++) expect(steps[i]!).toBeLessThan(steps[i - 1]!)
    expect(ys[0]).toBe(FADER.capHeight / 2)
    expect(scaleY(0)).toBeGreaterThan(ys.at(-1)!)
  })

  it('keeps words off the floor and at full strength at the top', () => {
    expect(inkOf(1)).toBe(1)
    expect(inkOf(toPosition(0.0003))).toBeLessThan(INK_FLOOR)
    expect(inkOf(toPosition(0.5))).toBeGreaterThan(0.7)
  })

  it('draws the lane to its own peak, and nothing from one day', () => {
    expect(lanePath([0], 100, 10)).toBe('')
    expect(lanePath([0, 1], 100, 10)).toBe('M0 10 L0.0 10.0 L100.0 2.0 L100 10Z')
  })
})
