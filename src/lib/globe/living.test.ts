// The model is where the layers stop being separate. What can go wrong here is arithmetic that
// looks right: a day axis that quietly drops the oldest day of one layer, a count that disagrees
// with the frame it counted, a lookup that answers a day nobody holds with the nearest day it
// does hold — all three would leave a globe that draws and a page that reads, and both would be
// wrong.
import { describe, expect, it } from 'vitest'
import { LAYERS } from './layers'
import { buildLivingGlobe, frameAt, markCount } from './living'
import { EMPTY_FRAME, type GlobeLayer } from './layers/types'

const model = buildLivingGlobe()

const stub = (id: string, days: string[], per: number): GlobeLayer => ({
  id,
  title: id,
  kind: 'points',
  owner: { line: 'counter-measurement' },
  asOf: days[days.length - 1] ?? '2026-01-01',
  source: { file: 'src/data/none.json', name: 'none', url: 'https://example.invalid/', license: 'CC0' },
  days,
  frame: (day) =>
    days.includes(day)
      ? {
          day,
          records: Array.from({ length: per }, (_, n) => ({
            key: `${id}:${day}:${n}`,
            at: [0, 0] as [number, number],
            labelKind: 'point' as const,
            receipt: { file: 'src/data/none.json', locator: `n=${n}`, words: 'none' },
          })),
        }
      : EMPTY_FRAME(day),
  readout: {},
})

describe('the day axis is the union of what the archive holds', () => {
  it('unions the layers’ own days, ascending and unique', () => {
    const built = buildLivingGlobe([stub('a', ['2026-01-02', '2026-01-01'], 1), stub('b', ['2026-01-02'], 1)])
    expect(built.days).toEqual(['2026-01-01', '2026-01-02'])
    expect(built.newest).toBe('2026-01-02')
  })

  it('loses no day of any registered layer', () => {
    const days = new Set(model.days)
    for (const layer of LAYERS) for (const day of layer.days) expect(days.has(day), `${layer.id} ${day}`).toBe(true)
    expect(model.days).toEqual([...new Set(model.days)].sort())
  })

  it('takes its newest day from the data, and every registered layer’s as-of is one of its days', () => {
    expect(model.newest).toBe(model.days[model.days.length - 1])
    for (const layer of LAYERS) {
      // a static layer holds no days of its own at all (G3, third evening) — its as-of is the
      // newest RECORD's own date, not a day on an axis it does not have
      if (layer.days.length === 0) {
        expect(layer.static, layer.id).toBeTruthy()
        continue
      }
      expect(layer.days, layer.id).toContain(layer.asOf)
    }
  })
})

describe('the counts are the frames', () => {
  it('counts what each layer actually draws, day by day', () => {
    for (const layer of LAYERS) {
      if (layer.days.length === 0 && layer.static) {
        // static: the one frame's own count, repeated identically for every day of the union —
        // never summed across days, because it is not "per day it holds" (it holds none)
        const n = layer.static.records.length
        for (const day of model.days) expect(model.counts[layer.id][day], `${layer.id} ${day}`).toBe(n)
        expect(model.totals[layer.id], layer.id).toBe(n)
        continue
      }
      for (const day of layer.days) {
        expect(model.counts[layer.id][day], `${layer.id} ${day}`).toBe(layer.frame(day).records.length)
      }
      const total = Object.values(model.counts[layer.id]).reduce((a, b) => a + b, 0)
      expect(model.totals[layer.id], layer.id).toBe(total)
    }
  })

  it('adds up over a day the same way the frames do', () => {
    const moment = frameAt(model, model.newest)
    const fromCounts = LAYERS.reduce((sum, layer) => sum + (model.counts[layer.id][model.newest] ?? 0), 0)
    expect(markCount(moment)).toBe(fromCounts)
  })
})

describe('a day the model does not hold', () => {
  it('gives empty frames and never reaches for a neighbouring day — except a static layer, which has no day to reach past', () => {
    const moment = frameAt(model, '1999-01-01')
    expect(moment.day).toBe('1999-01-01')
    let staticMarks = 0
    for (const layer of LAYERS) {
      if (layer.days.length === 0 && layer.static) {
        // a static layer's marks stand on every day there is, by design — including one no
        // other layer's archive holds anything for at all
        expect(moment.layers[layer.id].records, layer.id).toEqual(layer.static.records)
        staticMarks += layer.static.records.length
        continue
      }
      expect(moment.layers[layer.id].records, layer.id).toEqual([])
    }
    expect(markCount(moment)).toBe(staticMarks)
  })

  it('holds a frame for every registered layer, on every day of the axis', () => {
    const moment = frameAt(model, model.days[0])
    expect(Object.keys(moment.layers).sort()).toEqual(LAYERS.map((l) => l.id).sort())
  })
})

// G3, third evening: the first STATIC layers — `days: []`, one fixed frame carried in `static`.
// A stub isolates the mechanism from the real archives (admissions and the mirrored warnings),
// which the generic suites above already exercise for real.
const staticStub = (id: string, per: number): GlobeLayer => {
  const frame = {
    day: '2026-08-27',
    records: Array.from({ length: per }, (_, n) => ({
      key: `${id}:static:${n}`,
      at: [0, 0] as [number, number],
      labelKind: 'centroid' as const,
      receipt: { file: 'src/data/none.json', locator: `n=${n}`, words: 'none' },
    })),
  }
  return {
    id,
    title: id,
    kind: 'points',
    owner: { line: 'counter-measurement' },
    asOf: '2026-08-27',
    source: { file: 'src/data/none.json', name: 'none', url: 'https://example.invalid/', license: 'CC0' },
    days: [],
    frame: () => frame,
    static: frame,
    readout: {},
  }
}

describe('a static layer draws the same frame on every day there is', () => {
  it('contributes no day of its own to the union', () => {
    const built = buildLivingGlobe([staticStub('s', 3), stub('a', ['2026-01-01'], 1)])
    expect(built.days).toEqual(['2026-01-01'])
  })

  it('counts its one frame’s records on every day of the union, and totals them once, not per day', () => {
    const built = buildLivingGlobe([staticStub('s', 3), stub('a', ['2026-01-01', '2026-01-02'], 1)])
    expect(built.counts['s']).toEqual({ '2026-01-01': 3, '2026-01-02': 3 })
    expect(built.totals['s']).toBe(3)
  })

  it('answers a day none of its fellow layers hold either, the same way', () => {
    const built = buildLivingGlobe([staticStub('s', 2)])
    const moment = frameAt(built, '1999-01-01')
    expect(moment.layers['s'].records).toHaveLength(2)
  })
})

describe('the registry the model is built from', () => {
  it('is not empty, and every layer names an owner', () => {
    expect(LAYERS.length).toBeGreaterThan(0)
    for (const layer of LAYERS) {
      expect('line' in layer.owner || 'voice' in layer.owner, layer.id).toBe(true)
    }
  })

  it('is stable — two builds of the same commit give the same model', () => {
    const again = buildLivingGlobe()
    expect(again.days).toEqual(model.days)
    expect(again.counts).toEqual(model.counts)
  })
})
