import { describe, expect, it } from 'vitest'
import { latestInstrument, orderInstruments, type InstrumentMeta } from './latest'

// Regression guard for the "Instrument 001" freeze: the /field header must follow Meridian's
// newest committed instrument on its own. These tests pin the derivation so re-introducing a
// hand-set pointer (or a find-first bug) breaks the build instead of silently going stale.

const entries = (m: Record<string, InstrumentMeta>): [string, InstrumentMeta][] =>
  Object.entries(m)

describe('orderInstruments', () => {
  it('orders by committed date ascending', () => {
    const ordered = orderInstruments(
      entries({
        b: { date: '2026-07-20' },
        a: { date: '2026-07-01' },
        c: { date: '2026-07-11' },
      }),
    )
    expect(ordered.map(([s]) => s)).toEqual(['a', 'c', 'b'])
  })

  it('breaks same-date ties by slug', () => {
    const ordered = orderInstruments(
      entries({
        'z-work': { date: '2026-07-11' },
        'a-work': { date: '2026-07-11' },
      }),
    )
    expect(ordered.map(([s]) => s)).toEqual(['a-work', 'z-work'])
  })
})

describe('latestInstrument', () => {
  it('features the newest committed instrument, not the first', () => {
    const latest = latestInstrument(
      entries({
        '2026-07-01-calibration-gap': { date: '2026-07-01', title: 'Calibration Gap' },
        '2026-07-20-coverage-not-custody': { date: '2026-07-20', title: 'Coverage, Not Custody' },
        '2026-07-11-split-seal': { date: '2026-07-11', title: 'Split Seal' },
      }),
    )
    expect(latest.slug).toBe('2026-07-20-coverage-not-custody')
    expect(latest.meta.title).toBe('Coverage, Not Custody')
  })

  it('numbers the instrument by its position in the ordered list (newest = count)', () => {
    const latest = latestInstrument(
      entries({
        a: { date: '2026-07-01' },
        b: { date: '2026-07-11' },
        c: { date: '2026-07-20' },
      }),
    )
    expect(latest.instrumentNo).toBe('003')
  })

  it('zero-pads the instrument number to three digits', () => {
    const latest = latestInstrument(entries({ a: { date: '2026-07-01' } }))
    expect(latest.instrumentNo).toBe('001')
  })

  it('fails loud on an empty mirror rather than falling back to a stale default', () => {
    expect(() => latestInstrument([])).toThrow(/no committed instruments/)
  })

  it('fails loud when the newest instrument has no committed date', () => {
    // a dateless work sorts to the front, so it is only "newest" when it is the sole entry —
    // which is precisely the mirror state that must break the build, not ship a blank header.
    expect(() => latestInstrument(entries({ a: {} }))).toThrow(/no committed meta date/)
  })
})
