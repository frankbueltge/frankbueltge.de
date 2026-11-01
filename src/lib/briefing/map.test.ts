import { describe, expect, it } from 'vitest'
import { namer } from '@/lib/reading/attention'
import { STRIP_MAX } from './briefing'
import { earlierIds, FIELD_IDS, FIELDS, FIELDS_BEFORE_THE_MAP, mapProblems, overdueFields, spreadProblems, type MapLine } from './map'

const line = (field: MapLine['field']): MapLine => ({
  field,
  state: 'A figure of 1,200 as of 2026.',
  as_of: '2026',
  direction: 'steady',
  compared_with: '1,190 in 2025',
  signals: 0,
  sources: [{ label: 'The agency', url: 'https://example.org/agency', kind: 'primary' }],
})
const map = (): MapLine[] => FIELD_IDS.map(line)

describe('the map', () => {
  it('has eleven fields, each with what a fader needs', () => {
    expect(FIELDS).toHaveLength(11)
    expect(new Set(FIELD_IDS).size).toBe(11)
    for (const f of FIELDS) {
      expect(f.strip.length).toBeLessThanOrEqual(STRIP_MAX)
      expect(f.strip).toBe(f.strip.toUpperCase())
      expect(f.terms.length).toBeGreaterThan(0)
    }
  })

  it('counts by the one rule, and keeps the false friends out', () => {
    const names = (id: string, text: string): boolean => {
      const f = FIELDS.find((x) => x.id === id)!
      return namer(f.terms)(text) && !namer('exclude' in f ? f.exclude : [])(text)
    }
    expect(names('war', 'Sudan: the siege of El Fasher')).toBe(true)
    expect(names('war', 'South Sudan vs Egypt')).toBe(false)
    expect(names('power', 'Temu: Shop Like a Billionaire')).toBe(false)
    expect(names('hunger', 'The Hunger Games')).toBe(false)
    expect(names('ai', 'Ai Weiwei opens a show')).toBe(true) // the rule folds case: a known limit of the count
  })

  it('passes a map that keeps every rule', () => {
    expect(mapProblems(map(), '2026-11-01')).toEqual([])
  })

  it('refuses a field missing or out of order', () => {
    expect(mapProblems(map().slice(1), '2026-11-01').join()).toContain('eleven fields')
    expect(mapProblems(map().reverse(), '2026-11-01').join()).toContain('eleven fields')
  })

  it('refuses a line with no figure, no date, no original or too old a date', () => {
    const broken = (patch: Partial<MapLine>) => {
      const m = map()
      m[3] = { ...m[3]!, ...patch }
      return mapProblems(m, '2026-11-01').join()
    }
    expect(broken({ state: 'Things are bad.' })).toContain('no figure')
    expect(broken({ as_of: 'last year' })).toContain('as_of')
    expect(broken({ as_of: '2023' })).toContain('stale')
    expect(broken({ sources: [{ label: 'A paper', url: 'https://example.org/p', kind: 'report' }] })).toContain('no primary source')
    expect(broken({ state: 'x1'.repeat(150) })).toContain('over 280')
  })

  it('wants a comparison behind every direction but unclear', () => {
    const m = map()
    m[0] = { ...m[0]!, direction: 'worse', compared_with: '' }
    expect(mapProblems(m, '2026-11-01').join()).toContain('nothing to compare')
    m[0] = { ...m[0]!, direction: 'unclear' }
    expect(mapProblems(m, '2026-11-01')).toEqual([])
  })

  it('knows the two briefings before it, and only with fields of the map', () => {
    expect(earlierIds('after-cycle-012')).toEqual(['after-cycle-011', 'after-cycle-010'])
    for (const fields of Object.values(FIELDS_BEFORE_THE_MAP)) {
      expect(fields).toHaveLength(10)
      for (const f of fields) expect(FIELD_IDS).toContain(f)
    }
  })

  it('finds what the first two briefings left out', () => {
    const earlier = earlierIds('after-cycle-012').map((id) => FIELDS_BEFORE_THE_MAP[id]!)
    expect(overdueFields(earlier)).toEqual(['poverty', 'inequality', 'power', 'democracy'])
    expect(overdueFields(earlier.slice(0, 1))).toEqual([])
  })

  it('wants a field on every matter', () => {
    expect(spreadProblems([{ id: 'a' }], [])).toEqual(['a: no field of the map'])
  })
})
