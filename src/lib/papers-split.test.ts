// The papers catalogue shows what the practices read; identifiers a work tested as its material
// are summarised, not listed (2026-11-09). These tests hold the rule and the merge.
import { describe, expect, it } from 'vitest'
import {
  PAPERS,
  READING,
  TESTED_IN_WORK,
  citedBy,
  isTestedInWork,
  mergeSameText,
  praxisLabel,
  testedInWorkSummary,
  workOfFinding,
  type PaperEntry,
} from './papers'

const entry = (over: Partial<PaperEntry>): PaperEntry => ({
  id: 'x', titel: 'A sufficiently long title of a paper', urheber: ['A'], jahr: 2020, ort: '',
  kennung: '10.1/x', weitere_kennungen: [], url: '', frei_zugaenglich: false, felder: [],
  zusammenfassung: '', relevanz: 'record', relevanz_herkunft: 'gebrauch', weg: 'praxis',
  aufnahmegrund: 'zitiert', fundstellen: ['field-research/notes/a.md'], geprueft: false,
  pruef_status: null, pruef_vermerk: null, zitiert_von: ['field'], zuletzt_gebraucht: null,
  verify_status: 'toVerify', ...over,
})

describe('read, or tested inside a work', () => {
  it('counts an entry as tested only when every finding is a data store', () => {
    expect(isTestedInWork(entry({ fundstellen: ['field-research/artifacts/w/data/ids.json'] }))).toBe(true)
    expect(isTestedInWork(entry({ fundstellen: ['studio/x/data.json', 'n-1/log.jsonl'] }))).toBe(true)
    expect(isTestedInWork(entry({
      fundstellen: ['field-research/artifacts/w/data/ids.json', 'field-research/artifacts/w/README.md'],
    }))).toBe(false)
    expect(isTestedInWork(entry({ fundstellen: [] }))).toBe(false)
  })

  it('names the work a finding belongs to', () => {
    expect(workOfFinding('field-research/artifacts/cycle-002/2026-09-04-the-dial/data/a/b.json'))
      .toBe('field-research/artifacts/cycle-002/2026-09-04-the-dial')
    expect(workOfFinding('studio/works/x/data.json')).toBe('studio/works/x')
  })

  it('partitions the register without losing an entry', () => {
    const merged = PAPERS.filter((p) => !isTestedInWork(p)).length - READING.length
    expect(merged).toBeGreaterThanOrEqual(0)
    expect(READING.length + merged + TESTED_IN_WORK.length).toBe(PAPERS.length)
    expect(READING.some(isTestedInWork)).toBe(false)
    const summed = testedInWorkSummary().reduce((s, w) => s + w.n, 0)
    expect(summed).toBeGreaterThanOrEqual(TESTED_IN_WORK.length)
  })

  it('shows Meridian and the Field as one practice', () => {
    expect(praxisLabel('meridian')).toBe(praxisLabel('field'))
    expect(citedBy(entry({ zitiert_von: ['atelier', 'meridian', 'field'] }))).toEqual(['atelier', 'field'])
  })
})

describe('one card per text', () => {
  it('folds a DOI and a handle of the same title and year, led by the DOI', () => {
    const a = entry({ id: 'a', kennung: 'http://hdl.handle.net/1', zitiert_von: ['atelier'],
      relevanz: 'Because…', relevanz_herkunft: 'praxis', verify_status: 'verified', zuletzt_gebraucht: '2026-10-01' })
    const b = entry({ id: 'b', kennung: '10.9/y', zitiert_von: ['meridian'], zuletzt_gebraucht: '2026-11-01' })
    const [m, ...rest] = mergeSameText([a, b])
    expect(rest).toHaveLength(0)
    expect(m.kennung).toBe('10.9/y')
    expect(m.weitere_kennungen).toEqual(['http://hdl.handle.net/1'])
    expect(m.relevanz_herkunft).toBe('praxis')
    expect(m.relevanz).toBe('Because…')
    expect(m.zitiert_von).toEqual(['atelier', 'meridian'])
    expect(m.zuletzt_gebraucht).toBe('2026-11-01')
  })

  it('never folds short titles or different years', () => {
    expect(mergeSameText([entry({ titel: 'Making' }), entry({ titel: 'Making' })])).toHaveLength(2)
    expect(mergeSameText([entry({ jahr: 2001 }), entry({ jahr: 2002 })])).toHaveLength(2)
  })
})
