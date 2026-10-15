// The reading of the day, per experiment, from one record (readouts.ts) — shared since 2026-10-05
// by the gallery's cards and the signal log. Two promises are tested here: a record that lacks a
// figure yields no sentence rather than a zero, and the figures are formatted the one way the
// house formats them.
import { describe, expect, it } from 'vitest'
import { GALLERY } from '@/config/gallery-wording'
import { count, decimal, percent, READOUTS, year, type ReadoutId } from './readouts'

describe('a record without the figures states nothing', () => {
  it.each(Object.keys(READOUTS) as ReadoutId[])('%s', (id) => {
    expect(READOUTS[id]({})).toBeNull()
    expect(READOUTS[id](null)).toBeNull()
    expect(READOUTS[id]('not a record')).toBeNull()
  })

  it('reads a missing figure as missing, never as zero', () => {
    // Bycatch's first runs measured from two vantages that no longer exist: no automat, no sentence
    expect(READOUTS.beifang({ vantages: { us: { results: [] }, eu: { results: [] } } })).toBeNull()
    // the Protocol's first nights kept no index
    expect(READOUTS.protokoll({ entries: [{}, {}], index: null })).toBeNull()
    // a cascade with no span is not a cascade of zero hours
    expect(READOUTS.consensus({ headline: { domain_count: 12 } })).toBeNull()
  })
})

describe('the figures, formatted once', () => {
  it('prints a year as a name and a count with its separator', () => {
    expect(year(1998)).toBe('1998')
    expect(count(1998)).toBe('1,998')
    expect(decimal(-0.987, 2)).toBe('-0.99')
    expect(percent(1.792)).toBe('179%')
  })

  it('states the Policy’s base year and the Invoked Past’s year as years', () => {
    expect(READOUTS.praemie({ premium: { base_year: 1998, change_pct_since_base: 179.2 } })).toBe(
      GALLERY.readouts.praemie('1998', '179%'),
    )
    expect(READOUTS['invoked-past']({ headline: { year: 1812, times_its_neighbourhood: 17 } })).toBe(
      GALLERY.readouts['invoked-past']('1812', '17.0'),
    )
  })

  it('names the picked defendant and the verdict the pipeline wrote', () => {
    const record = {
      pick: 'b',
      series: [
        { id: 'a', name: 'First', benford: { verdict: 'close' } },
        { id: 'b', name: 'Second', benford: { verdict: 'marginal' } },
      ],
    }
    expect(READOUTS['round-number'](record)).toBe(GALLERY.readouts['round-number']('Second', 'marginal'))
    expect(READOUTS['round-number']({ ...record, pick: 'nobody' })).toBeNull()
  })

  it('takes the picked vessel, or the first where the record picks none', () => {
    const events = [
      { id: 'a', duration_hours: 100, vessel: { name: 'ALPHA' } },
      { id: 'b', duration_hours: 1367, vessel: { name: 'ALMIRANTE 1' } },
    ]
    expect(READOUTS['ghost-fleet']({ pick: 'b', events })).toBe(GALLERY.readouts['ghost-fleet']('ALMIRANTE 1', '1,367'))
    expect(READOUTS['ghost-fleet']({ pick: null, events })).toBe(GALLERY.readouts['ghost-fleet']('ALPHA', '100'))
  })

  it('counts the pages Bycatch measured and the ones that refused the reader', () => {
    const run = { vantages: { automat: { results: [{ third_party_requests: 4 }, { third_party_requests: null }, { third_party_requests: 0 }] } } }
    expect(READOUTS.beifang(run)).toBe(GALLERY.readouts.beifang('2', '1'))
  })

  it('takes the fewest platforms a converging topic ran on', () => {
    const day = { summary: { converging: 3 }, topics: [{ platform_count: 4 }, { platform_count: 2 }, { platform_count: 3 }] }
    expect(READOUTS.trending(day)).toBe(GALLERY.readouts.trending('3', '2'))
  })
})
