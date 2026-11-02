import { describe, expect, it } from 'vitest'
import { countTest } from '@/lib/reading/attention'
import { STRIP_MAX } from './briefing'
import { earlierIds, FIELD_IDS, FIELDS, FIELDS_BEFORE_THE_MAP, FIRST_MAP_FIELDS, mapProblems, overdueFields, spreadProblems, type MapLine } from './map'

const line = (field: MapLine['field']): MapLine => ({
  field,
  state: 'A figure of 1,200 as of 2026.',
  as_of: '2026',
  direction: 'steady',
  compared_with: '1,190 in 2025',
  signals: 0,
  lines: [{ text: 'A figure of 1,200 as of 2026.', say: 'A figure of twelve hundred as of twenty twenty-six.' }],
  sources: [{ label: 'The agency', url: 'https://example.org/agency', kind: 'primary' }],
})
const map = (): MapLine[] => FIELD_IDS.map(line)

describe('the map', () => {
  it('has thirteen fields, each with what a fader needs, and the first edition’s eleven among them', () => {
    expect(FIELDS).toHaveLength(13)
    expect(new Set(FIELD_IDS).size).toBe(13)
    expect(FIRST_MAP_FIELDS).toHaveLength(11)
    for (const f of FIRST_MAP_FIELDS) expect(FIELD_IDS).toContain(f)
    for (const f of FIELDS) {
      expect(f.strip.length).toBeLessThanOrEqual(STRIP_MAX)
      expect(f.strip).toBe(f.strip.toUpperCase())
      expect(f.terms.length).toBeGreaterThan(0)
    }
  })

  it('counts by the one rule, and keeps the false friends out', () => {
    const names = (id: string, text: string): boolean => countTest(FIELDS.find((x) => x.id === id)!)(text)
    expect(names('war', 'Sudan: the siege of El Fasher')).toBe(true)
    expect(names('war', 'South Sudan vs Egypt')).toBe(false)
    expect(names('power', 'Temu: Shop Like a Billionaire')).toBe(false)
    expect(names('hunger', 'The Hunger Games')).toBe(false)
    // AI counts beside a harm only (2026-11-02): the warning, the job, the data centre; not the app or the tutorial
    expect(names('ai', 'OpenAI safety leader quits')).toBe(true)
    expect(names('ai', 'Barclays plans to cut 5,000 jobs as part of AI-driven cost cutting')).toBe(true)
    expect(names('ai', 'Data center community impacts')).toBe(true)
    expect(names('ai', 'My brief romance with an AI bird feeder')).toBe(false)
    expect(names('ai', 'OpenAI DevDay unveils new models')).toBe(false)
    expect(names('ai', 'MadsLorentzen/ai-job-search')).toBe(false)
    // the fields of 2026-11-02, with the false friends the audit found
    expect(names('economy', 'Kenya’s inflation trends from October 2025 to October 2026')).toBe(true)
    expect(names('economy', 'Counter-Strike: G2 vs PARIVISION - Map 2 Winner')).toBe(false)
    expect(names('economy', 'New constraints on cosmic inflation from the CMB')).toBe(false)
    expect(names('nature', "Lahore's air quality index crosses 530 as pollution reaches hazardous levels")).toBe(true)
    expect(names('climate', 'Monitored wildlife populations down 73 % on average')).toBe(false)
    expect(names('nature', 'Monitored wildlife populations down 73 % on average')).toBe(true)
    expect(names('war', 'Taxi violence in Cape Town')).toBe(true)
    expect(names('war', 'A shooting star over the Alps')).toBe(false)
  })

  it('passes a map that keeps every rule', () => {
    expect(mapProblems(map(), '2026-11-01')).toEqual([])
  })

  it('refuses a field missing or out of order', () => {
    expect(mapProblems(map().slice(1), '2026-11-01').join()).toContain('13 fields in order')
    expect(mapProblems(map().reverse(), '2026-11-01').join()).toContain('13 fields in order')
  })

  it('holds a file of the first edition to its eleven fields', () => {
    const first = FIRST_MAP_FIELDS.map(line)
    expect(mapProblems(first, '2026-11-01', FIRST_MAP_FIELDS)).toEqual([])
    expect(mapProblems(first, '2026-11-01').join()).toContain('13 fields in order')
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

  it('gives the voice no digit, and no more than it can read at once', () => {
    const broken = (patch: Partial<MapLine>) => {
      const m = map()
      m[3] = { ...m[3]!, ...patch }
      return mapProblems(m, '2026-11-01').join()
    }
    expect(broken({ lines: [{ text: 'A figure of 1,200.' }] })).toContain('a digit in what the voice is given')
    expect(broken({ lines: [] })).toContain('0 lines for the voice')
    expect(broken({ lines: Array.from({ length: 4 }, () => ({ text: 'A sentence.' })) })).toContain('4 lines for the voice')
    expect(broken({ lines: [{ text: 'x'.repeat(201) }] })).toContain('line too long')
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
