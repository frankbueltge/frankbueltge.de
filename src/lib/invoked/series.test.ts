import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { paletteById } from '@/lib/dataviz/palette'
import type { InvokedData } from './types'
import { buildStandoutFigure, dodge, standoutSeries, standoutTable } from './series'

// ——— synthetic archive ————————————————————————————————————————————————————————————

const METHOD_STANDOUT =
  'the published finding is the year that most exceeds the median of the +/-5 years around it, scored as excess'

const day = (
  date: string,
  standout: { year: number; mentions?: number; anniversary?: boolean } | null,
  opts: { failed?: boolean; maximum?: number; years?: [number, number] } = {},
): InvokedData => {
  const [lo, hi] = opts.years ?? [1801, 2014]
  return {
    generated_at: `${date}T12:00:00+00:00`,
    date,
    method: { standout: METHOD_STANDOUT, year_window: [1800, 'current year'] } as unknown as InvokedData['method'],
    headline:
      opts.failed || !standout
        ? null
        : ({
            year: standout.year,
            mentions: standout.mentions ?? 100,
            per_1000_articles: 1,
            neighbourhood_median: 10,
            times_its_neighbourhood: (standout.mentions ?? 100) / 10,
            surprise: ((standout.mentions ?? 100) - 10) / Math.sqrt(10),
            top_country_share: null,
            invoked_by: [],
            why:
              standout.anniversary === undefined
                ? undefined
                : {
                    articles: 1,
                    top_exact_dates: [],
                    anniversary: { date: `${standout.year}-01-01`, mentions: 1, matches_today: standout.anniversary, today: date },
                    themes: [],
                    persons: [],
                    organisations: [],
                    headlines: [],
                  },
          } as InvokedData['headline']),
    most_invoked: opts.failed ? null : { year: opts.maximum ?? hi, mentions: 500, per_1000_articles: 5 },
    years: opts.failed ? [] : [{ year: lo, mentions: 1 }, { year: hi, mentions: 500 }],
    top_years: [],
    age_profile: [],
    exact_dates_top: [],
    tracked_events: null,
    law_test: { status: 'not_built', reason: 'test reason' },
    stats: { slots_fetched: opts.failed ? 0 : 96, max_year_observed: opts.failed ? 0 : hi } as InvokedData['stats'],
    source: { name: 'GDELT', url: 'https://example.org', license: 'open', retrieved_utc: date },
  }
}

const files = (...days: InvokedData[]) =>
  Object.fromEntries(days.map((d) => [`/src/data/invoked/${d.date}.json`, { default: d }]))

const synthetic = standoutSeries(
  files(
    day('2026-08-01', { year: 1947, anniversary: true }),
    day('2026-08-02', { year: 1947, anniversary: false }),
    day('2026-08-03', { year: 1900 }, { maximum: 1992 }),
    day('2026-08-04', null),
    day('2026-08-05', null, { failed: true }),
    // 2026-08-06: no file
    day('2026-08-07', { year: 1947 }),
  ),
)

describe('standoutSeries — the file’s own finding, day by day', () => {
  it('classes every calendar day: measured, quiet, failed, missing', () => {
    expect(synthetic.days.map((d) => [d.date, d.kind, d.standout?.year ?? null])).toEqual([
      ['2026-08-01', 'measured', 1947],
      ['2026-08-02', 'measured', 1947],
      ['2026-08-03', 'measured', 1900],
      ['2026-08-04', 'measured', null],
      ['2026-08-05', 'failed', null],
      ['2026-08-06', 'missing', null],
      ['2026-08-07', 'measured', 1947],
    ])
    expect([synthetic.measured, synthetic.quiet, synthetic.failed, synthetic.missing]).toEqual([5, 1, 1, 1])
    expect(synthetic.withStandout).toBe(4)
    expect(synthetic.distinctYears).toBe(2)
  })

  it('counts recurrence and the longest run — a gap ends a run, it is never bridged', () => {
    expect(synthetic.recurring).toEqual([{ year: 1947, days: 3, first: '2026-08-01', last: '2026-08-07', longestRun: 2 }])
    expect(synthetic.longestRun).toEqual({ year: 1947, days: 2, from: '2026-08-01', to: '2026-08-02' })
  })

  it('reads the anniversary arithmetic and the wall off each file', () => {
    expect(synthetic.anniversaries).toBe(1)
    // the raw maximum sat on the ceiling on every measured day but the one that says 1992
    expect(synthetic.maximumAtCeiling).toBe(4)
  })

  it('reads the neighbourhood window from the method sentence, and the eligible range from it', () => {
    expect(synthetic.window).toBe(5)
    expect(synthetic.days[0].eligible).toEqual([1806, 2009])
    expect(synthetic.days[4].eligible).toBeNull()
  })

  it('an empty archive is an empty series', () => {
    const none = standoutSeries({})
    expect(none.days).toEqual([])
    expect(none.longestRun).toBeNull()
    expect(buildStandoutFigure(none).empty).toBe(true)
  })
})

describe('the table carries every drawn value', () => {
  it('one row per calendar day, newest first, a gap in words', () => {
    const t = standoutTable(synthetic)
    expect(t.rows).toHaveLength(synthetic.days.length)
    expect(t.rows[0]).toMatchObject({ date: '2026-08-07', year: '1947' })
    expect(t.rows.find((r) => r.date === '2026-08-06')?.year).toBe('no committed file')
    expect(t.rows.find((r) => r.date === '2026-08-05')?.year).toMatch(/source unreachable/)
    expect(t.rows.find((r) => r.date === '2026-08-04')?.year).toMatch(/quiet day/)
    expect(t.rows.find((r) => r.date === '2026-08-03')?.maximum).toBe('1992')
    expect(t.rows.find((r) => r.date === '2026-08-02')?.maximum).toBe('2014 (at the wall)')
  })
})

describe('dodge — labels keep their order and their distance', () => {
  it('leaves well-spaced targets where they are', () => {
    expect(dodge([10, 40, 80], 11, 0, 100)).toEqual([10, 40, 80])
  })

  it('pushes crowded labels apart without reordering them', () => {
    const ys = dodge([50, 51, 52], 11, 0, 200)
    expect(ys).toEqual([50, 61, 72])
  })

  it('stays inside its bounds, pushing up from the floor when it must', () => {
    const ys = dodge([95, 96, 97], 11, 0, 100)
    expect(ys).toEqual([78, 89, 100])
  })

  it('returns positions in the order of the targets it was given', () => {
    const ys = dodge([80, 10, 81], 11, 0, 200)
    expect(ys[1]).toBe(10)
    expect(ys[2] - ys[0]).toBeGreaterThanOrEqual(11)
  })
})

describe('buildStandoutFigure — geometry from the records', () => {
  const m = buildStandoutFigure(synthetic)

  it('one mark per standout day, quiet days on their own lane, gaps hatched', () => {
    expect(m.marks.map((k) => k.date)).toEqual(['2026-08-01', '2026-08-02', '2026-08-03', '2026-08-07'])
    expect(m.quiet.map((q) => q.date)).toEqual(['2026-08-04'])
    expect(m.quietY).toBeGreaterThan(m.plotBottom)
    expect(m.columns.map((c) => [c.date, c.kind])).toEqual([
      ['2026-08-05', 'failed'],
      ['2026-08-06', 'missing'],
    ])
  })

  it('a later year sits higher, and every mark sits inside the plot', () => {
    const y1947 = m.marks.find((k) => k.standout.year === 1947)!.y
    const y1900 = m.marks.find((k) => k.standout.year === 1900)!.y
    expect(y1947).toBeLessThan(y1900)
    for (const k of m.marks) {
      expect(k.y).toBeGreaterThan(m.plotTop)
      expect(k.y).toBeLessThan(m.plotBottom)
      expect(k.x).toBeGreaterThan(m.plotLeft)
      expect(k.x).toBeLessThan(m.plotRight)
    }
    expect(m.marks.filter((k) => k.recurring).map((k) => k.standout.year)).toEqual([1947, 1947, 1947])
  })

  it('draws the years the source never emits as one band above the ceiling', () => {
    expect(m.ceilingBands).toHaveLength(2) // the failed and missing days split the run
    for (const b of m.ceilingBands) {
      expect([b.from, b.to]).toEqual([2015, 2026])
      expect(b.y).toBeCloseTo(m.plotTop, 1)
      for (const k of m.marks) expect(k.y).toBeGreaterThan(b.y + b.height)
    }
  })

  it('marks the edges no standout can occupy, and nothing inside the eligible range', () => {
    const ranges = m.edgeBands.map((b) => [b.from, b.to])
    expect(ranges).toContainEqual([1800, 1805])
    expect(ranges).toContainEqual([2010, 2014])
  })

  it('one guide and one label per recurring year, the guide starting on its first day', () => {
    expect(m.guides).toEqual([{ year: 1947, y: m.marks[0].y, x1: m.marks[0].x, x2: m.plotRight }])
    expect(m.labels.map((l) => l.text)).toEqual(['1947 · 3 days'])
  })
})

describe('the series stylesheet inherits invoked-memory, it does not extend it', () => {
  const css = readFileSync('src/styles/invoked-series.css', 'utf8')
  const set = paletteById('invoked-memory')!

  it('is claimed by the record, and carries its marker', () => {
    expect(set.usedBy).toContain('src/styles/invoked-series.css')
    expect(css).toContain('PALETTE: invoked-memory')
  })

  it('wears the standout ember in both modes, and no other hex at all', () => {
    const ember = set.slots[0]
    expect(ember.name).toMatch(/standout/)
    const hexes = new Set(css.match(/#[0-9a-fA-F]{6}\b/g) ?? [])
    expect(hexes).toEqual(new Set([ember.light, ember.dark]))
  })
})

// ——— the committed archive ————————————————————————————————————————————————————————

const archive = import.meta.glob('/src/data/invoked/2*.json', { eager: true, import: 'default' })
const real = standoutSeries(archive)
const realFigure = buildStandoutFigure(real)

describe('the committed Invoked Past archive', () => {
  it('every standout is the file’s own headline', () => {
    for (const d of real.days) {
      const file = archive[`/src/data/invoked/${d.date}.json`] as InvokedData | undefined
      if (d.kind === 'missing') {
        expect(file).toBeUndefined()
        continue
      }
      expect(d.standout?.year ?? null).toBe(file!.headline?.year ?? null)
      expect(d.standout?.mentions ?? null).toBe(file!.headline?.mentions ?? null)
      expect(d.maximum).toBe(file!.most_invoked?.year ?? null)
    }
  })

  it('every count adds up', () => {
    expect(real.withStandout + real.quiet).toBe(real.measured)
    expect(real.measured + real.failed + real.missing).toBe(real.days.length)
    expect(real.recurring.reduce((s, r) => s + r.days, 0)).toBeLessThanOrEqual(real.withStandout)
    expect(real.maximumAtCeiling).toBeLessThanOrEqual(real.measured)
    for (const r of real.recurring) {
      expect(r.days).toBeGreaterThan(1)
      expect(r.longestRun).toBeLessThanOrEqual(r.days)
    }
  })

  it('keeps every mark inside the plot and below the band the source never emits', () => {
    expect(realFigure.empty).toBe(false)
    for (const k of realFigure.marks) {
      expect(k.y).toBeGreaterThan(realFigure.plotTop)
      expect(k.y).toBeLessThan(realFigure.plotBottom)
      for (const b of realFigure.ceilingBands) expect(k.y).toBeGreaterThan(b.y + b.height)
    }
  })

  it('keeps every label legible: inside the figure and never on top of another', () => {
    const ys = realFigure.labels.map((l) => l.y).sort((a, b) => a - b)
    for (let i = 1; i < ys.length; i++) expect(ys[i] - ys[i - 1]).toBeGreaterThanOrEqual(10.99)
    for (const y of ys) {
      expect(y).toBeGreaterThanOrEqual(realFigure.plotTop)
      expect(y).toBeLessThanOrEqual(realFigure.plotBottom)
    }
  })
})
