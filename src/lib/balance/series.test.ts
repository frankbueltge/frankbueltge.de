import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { BalanceCountry, BalanceData } from './types'
import {
  balanceSeries,
  buildSeriesFigure,
  bySelection,
  dayCell,
  figureRows,
  headlineTally,
  median,
  persistenceExtremes,
  persistenceTable,
  seriesTable,
} from './series'

// ——— synthetic archive ————————————————————————————————————————————————————————————

const country = (fips: string, gap: number, lo: number, hi: number, nSelf = 100, nForeign = 1000): BalanceCountry => ({
  fips,
  name: `Country ${fips}`,
  n_self: nSelf,
  n_foreign: nForeign,
  dims: { tone: { self: gap, foreign: 0, gap_ci95: [lo, hi], significant: lo > 0 || hi < 0 } },
})

const day = (date: string, countries: BalanceCountry[], failed = false): BalanceData => {
  const sig = countries.filter((c) => c.dims.tone?.significant)
  const top = [...sig].sort((a, b) => Math.abs(b.dims.tone!.self) - Math.abs(a.dims.tone!.self))[0]
  return {
    generated_at: `${date}T10:00:00+00:00`,
    date,
    method: {
      version: 'v1',
      since: '2026-08-14',
      min_pool: 25,
      min_words: 100,
      bootstrap: { resamples: 800, subsample_cap: 2000 },
      dimensions: { tone: { label: 'Tone', unit: 'tone -100..+100' } },
      stream: 'test',
    },
    headline:
      failed || !top
        ? null
        : {
            fips: top.fips,
            name: top.name,
            n_self: top.n_self,
            n_foreign: top.n_foreign,
            tone_self: top.dims.tone!.self,
            tone_foreign: 0,
            gap: top.dims.tone!.self,
            gap_ci95: top.dims.tone!.gap_ci95,
            direction: top.dims.tone!.self > 0 ? 'self_brighter' : 'world_brighter',
          },
    countries: failed ? [] : countries,
    stats: {
      articles_scanned: failed ? 0 : 1000,
      articles_mapped: failed ? 0 : 600,
      mapping_rate: 0.7,
      domains_seen: 10,
      slots_expected: 96,
      slots_fetched: failed ? 0 : 96,
      slots_missing: [],
      window: 'test UTC',
    },
    source: { name: 'GDELT', url: 'https://example.org', license: 'open', retrieved_utc: date },
  }
}

const files = (...days: BalanceData[]) =>
  Object.fromEntries(days.map((d) => [`/src/data/balance/${d.date}.json`, { default: d }]))

// AA: present, absent, failed day, missing day, present.  BB: present every measured day.
const synthetic = balanceSeries({
  ...files(
    day('2026-08-01', [country('AA', 2, 1, 3), country('BB', -1, -1.5, -0.5, 400, 4000)]),
    day('2026-08-02', [country('BB', -1.2, -1.6, -0.8, 400, 4000)]),
    day('2026-08-03', [], true),
    day('2026-08-05', [country('AA', 0.2, -0.4, 0.8), country('BB', 0.1, -0.3, 0.5, 400, 4000)]),
  ),
  '/src/data/balance/latest.json': { default: day('2026-08-05', []) },
})
const AA = synthetic.countries.find((c) => c.fips === 'AA')!
const BB = synthetic.countries.find((c) => c.fips === 'BB')!

describe('balanceSeries — what each day says, and only that', () => {
  it('runs over every calendar day, and classes failed and missing days as unmeasured', () => {
    expect(synthetic.days.map((d) => [d.date, d.kind])).toEqual([
      ['2026-08-01', 'measured'],
      ['2026-08-02', 'measured'],
      ['2026-08-03', 'failed'],
      ['2026-08-04', 'missing'],
      ['2026-08-05', 'measured'],
    ])
    expect([synthetic.measured, synthetic.failed, synthetic.missing]).toEqual([3, 1, 1])
    expect(synthetic.first).toBe('2026-08-01')
    expect(synthetic.last).toBe('2026-08-05')
    expect(synthetic.minPool).toBe(25)
  })

  it('a country below the floor on a measured day is absent, never zero', () => {
    expect(AA.days.map((d) => d.state)).toEqual(['measured', 'absent', 'unmeasured', 'unmeasured', 'measured'])
    expect(AA.absent).toBe(1)
    expect(AA.listed).toBe(2)
    const unmeasured = AA.days.filter((d) => d.state === 'unmeasured')
    expect(unmeasured.map((d) => (d.state === 'unmeasured' ? d.kind : null))).toEqual(['failed', 'missing'])
  })

  it('reads direction off the recorded interval, and counts the rest as not significant', () => {
    expect(AA.ownBrighter).toBe(1)
    expect(AA.notSignificant).toBe(1)
    expect(BB.worldBrighter).toBe(2)
    expect(BB.notSignificant).toBe(1)
    for (const c of synthetic.countries) {
      expect(c.ownBrighter + c.worldBrighter + c.notSignificant).toBe(c.listed)
    }
  })

  it('a run ends at any day that is not significant the same way — a gap is never bridged', () => {
    expect(BB.longestRun).toEqual({ direction: 'world', days: 2, from: '2026-08-01', to: '2026-08-02' })
    expect(AA.longestRun).toEqual({ direction: 'own', days: 1, from: '2026-08-01', to: '2026-08-01' })
  })

  it('selects on the measurement: most days listed, then the deeper smaller pool', () => {
    expect(synthetic.countries.map((c) => c.fips)).toEqual(['BB', 'AA'])
    expect(BB.medianSmallerPool).toBe(400)
    const tie = { ...AA, listed: BB.listed }
    expect(bySelection(BB, tie)).toBeLessThan(0) // deeper pool first
  })

  it('draws the selected rows from the brightest self-image down', () => {
    const rows = figureRows(synthetic, 2)
    expect(rows.map((c) => c.fips)).toEqual(['AA', 'BB'])
    expect(rows[0].medianGap).toBeGreaterThan(rows[1].medianGap!)
  })

  it('tallies the headline and the depth of its self pool — a day without one counts for nobody', () => {
    const t = headlineTally(synthetic)
    // 08-01 → AA, 08-02 → BB, 08-03 failed, 08-04 missing, 08-05 nothing significant
    expect(t.days).toBe(2)
    expect(t.tally.map((x) => [x.fips, x.days])).toEqual([
      ['AA', 1],
      ['BB', 1],
    ])
    expect(t.medianSelfPool).toBe(250)
  })

  it('names the persistence extremes, or nobody', () => {
    const ex = persistenceExtremes(figureRows(synthetic, 2))
    expect(ex.own?.fips).toBe('AA')
    expect(ex.world?.fips).toBe('BB')
    expect(persistenceExtremes([]).own).toBeNull()
  })

  it('median is the textbook one', () => {
    expect(median([])).toBeNull()
    expect(median([3, 1, 2])).toBe(2)
    expect(median([4, 1, 2, 3])).toBe(2.5)
  })
})

describe('the tables carry every drawn value', () => {
  it('prints a cell for every state, in words where there is no number', () => {
    expect(dayCell(AA.days[0])).toBe('+2.00 [1.00 … 3.00]')
    expect(dayCell(AA.days[1])).toBe('below floor')
    expect(dayCell(AA.days[2])).toBe('source unreachable')
    expect(dayCell(AA.days[3])).toBe('no file')
    expect(dayCell(AA.days[4])).toBe('+0.20 [−0.40 … 0.80] n.s.')
  })

  it('the figure table runs newest first with one column per drawn country', () => {
    const t = seriesTable(synthetic, figureRows(synthetic, 2))
    expect(t.rows).toHaveLength(synthetic.days.length)
    expect(t.rows[0].date).toBe('2026-08-05')
    expect(t.columns.map((c) => c.key)).toEqual(['date', 'AA', 'BB'])
  })

  it('the ledger lists everyone listed on at least half the measured days', () => {
    const t = persistenceTable(synthetic)
    expect(t.floor).toBe(2)
    expect(t.rows.map((r) => r.name)).toEqual(['Country BB', 'Country AA'])
  })
})

describe('buildSeriesFigure — geometry from the records', () => {
  const rows = figureRows(synthetic, 2)
  const m = buildSeriesFigure(synthetic, rows)

  it('one band per row, one slot per calendar day', () => {
    expect(m.rows).toHaveLength(2)
    expect(m.step).toBeCloseTo((m.plotRight - m.plotLeft) / synthetic.days.length, 1)
    expect(m.empty).toBe(false)
  })

  it('hatches failed and missing days across every row', () => {
    expect(m.columns.map((c) => [c.date, c.kind])).toEqual([
      ['2026-08-03', 'failed'],
      ['2026-08-04', 'missing'],
    ])
  })

  it('a shared, honest value scale: zero inside it, brighter self-image drawn higher', () => {
    expect(m.yMin).toBeLessThanOrEqual(0)
    expect(m.yMax).toBeGreaterThanOrEqual(0)
    for (const r of m.rows) {
      expect(r.zeroY).toBeGreaterThanOrEqual(r.bandTop)
      expect(r.zeroY).toBeLessThanOrEqual(r.bandBottom)
      for (const k of r.marks) {
        expect(k.yHi).toBeLessThanOrEqual(k.y)
        expect(k.y).toBeLessThanOrEqual(k.yLo)
        expect(k.yHi).toBeGreaterThanOrEqual(r.bandTop - 0.01)
        expect(k.yLo).toBeLessThanOrEqual(r.bandBottom + 0.01)
        if (k.gap > 0) expect(k.y).toBeLessThan(r.zeroY)
        if (k.gap < 0) expect(k.y).toBeGreaterThan(r.zeroY)
        expect(k.x).toBeGreaterThan(m.plotLeft)
        expect(k.x).toBeLessThan(m.plotRight)
      }
    }
  })

  it('draws every interval of a row as one path, one vertical stroke per mark', () => {
    for (const r of m.rows) {
      const strokes = r.ciPath.match(/M[\d.]+ [\d.]+V[\d.]+/g) ?? []
      expect(strokes).toHaveLength(r.marks.length)
      r.marks.forEach((k, i) => expect(strokes[i]).toBe(`M${k.x} ${k.yHi}V${k.yLo}`))
    }
  })

  it('an absence is a tick on the rail below the band, not a mark at zero', () => {
    const aa = m.rows.find((r) => r.series.fips === 'AA')!
    expect(aa.absences.map((a) => a.date)).toEqual(['2026-08-02'])
    expect(aa.railY).toBeGreaterThan(aa.bandBottom)
    expect(aa.marks.map((k) => k.date)).toEqual(['2026-08-01', '2026-08-05'])
  })

  it('an empty archive draws nothing', () => {
    const none = balanceSeries({})
    expect(buildSeriesFigure(none, []).empty).toBe(true)
  })
})

describe('the series stylesheet gives direction no colour', () => {
  it('wears the frame’s ink tokens only: no hex, so no palette to validate or to drift', () => {
    const css = readFileSync('src/styles/balance-series.css', 'utf8')
    expect(css.match(/#[0-9a-fA-F]{3,8}\b/g)).toBeNull()
    expect(css).not.toContain('PALETTE:')
    expect(css).not.toContain('--balf-self')
    expect(css).not.toContain('--balf-world')
  })
})

// ——— the committed archive ————————————————————————————————————————————————————————

const archive = import.meta.glob('/src/data/balance/2*.json', { eager: true, import: 'default' })
const real = balanceSeries(archive)
const realRows = figureRows(real)
const realFigure = buildSeriesFigure(real, realRows)

describe('the committed Balance archive', () => {
  it('covers every calendar day from its first file to its last', () => {
    const fileDays = Object.keys(archive)
      .map((p) => /(\d{4}-\d{2}-\d{2})\.json$/.exec(p)?.[1])
      .filter(Boolean)
      .sort()
    expect(real.first).toBe(fileDays[0])
    expect(real.last).toBe(fileDays[fileDays.length - 1])
    expect(real.measured + real.failed + real.missing).toBe(real.days.length)
    expect(real.days.length - real.missing).toBe(fileDays.length)
  })

  it('every drawn value is the file’s own', () => {
    for (const c of realRows) {
      c.days.forEach((d, i) => {
        const file = archive[`/src/data/balance/${real.days[i].date}.json`] as BalanceData | undefined
        const row = file?.countries.find((x) => x.fips === c.fips)
        if (d.state === 'measured') {
          expect(row?.dims.tone).toBeDefined()
          expect(d.gap).toBeCloseTo(row!.dims.tone!.self - row!.dims.tone!.foreign, 3)
          expect([d.lo, d.hi]).toEqual(row!.dims.tone!.gap_ci95)
          expect(d.significant).toBe(row!.dims.tone!.significant)
        } else if (d.state === 'absent') {
          expect(row).toBeUndefined()
          expect(file?.stats.slots_fetched).toBeGreaterThan(0)
        }
      })
    }
  })

  it('the rows are the countries the selection rule picks, and nobody else', () => {
    const picked = new Set(realRows.map((c) => c.fips))
    const top = [...real.countries].sort(bySelection).slice(0, realRows.length)
    expect(picked).toEqual(new Set(top.map((c) => c.fips)))
    for (const c of real.countries.slice(realRows.length)) {
      expect(bySelection(top[top.length - 1], c)).toBeLessThan(0)
    }
  })

  it('every count adds up to the calendar', () => {
    for (const c of real.countries) {
      const unmeasured = c.days.filter((d) => d.state === 'unmeasured').length
      expect(c.listed + c.absent + c.withheld + unmeasured).toBe(real.days.length)
      expect(c.ownBrighter + c.worldBrighter + c.notSignificant).toBe(c.listed)
    }
    const t = headlineTally(real)
    expect(t.tally.reduce((s, x) => s + x.days, 0)).toBe(t.days)
  })

  it('keeps every mark inside its row', () => {
    expect(realFigure.empty).toBe(false)
    for (const r of realFigure.rows) {
      for (const k of r.marks) {
        expect(k.yHi).toBeGreaterThanOrEqual(r.bandTop - 0.01)
        expect(k.yLo).toBeLessThanOrEqual(r.bandBottom + 0.01)
        expect(k.x).toBeGreaterThan(realFigure.plotLeft)
        expect(k.x).toBeLessThan(realFigure.plotRight)
      }
    }
    for (const t of realFigure.ticks) {
      expect(t.x).toBeGreaterThanOrEqual(realFigure.plotLeft)
      expect(t.x).toBeLessThanOrEqual(realFigure.plotRight)
    }
  })
})
