import { describe, expect, it } from 'vitest'
import {
  activeFilterCount,
  compareKeys,
  matchesCard,
  matchesText,
  normalise,
  titleSortKey,
  parseState,
  serialiseState,
} from './query'

describe('catalogue query', () => {
  it('normalises case, diacritics and whitespace', () => {
    expect(normalise('  Büchler   &  Ásmund ')).toBe('buchler & asmund')
  })

  it('files a title under its first letter, not its first symbol', () => {
    expect(titleSortKey('(t)error')).toBe('t)error')
    expect(titleSortKey('… arXiv 2602')).toBe('arxiv 2602')
    expect(titleSortKey('Éclat')).toBe('eclat')
  })

  it('needs every search term (AND), in any order', () => {
    expect(matchesText('Calculating Empires — Crawford & Joler', 'joler empires')).toBe(true)
    expect(matchesText('Calculating Empires — Crawford & Joler', 'joler atlas')).toBe(false)
    expect(matchesText('anything', '   ')).toBe(true)
  })

  it('tests multi-valued groups by membership and single-valued ones by equality', () => {
    const card = { facets: { cited: 'atelier field', decade: '2010' }, text: 'A title' }
    const multi = new Set(['cited'])
    const s = (filters: Record<string, string>, q = '') => ({ q, sort: 'x', filters })
    expect(matchesCard(card, s({ cited: 'field', decade: 'all' }), multi)).toBe(true)
    expect(matchesCard(card, s({ cited: 'studio' }), multi)).toBe(false)
    expect(matchesCard(card, s({ decade: '201' }), multi)).toBe(false)
    expect(matchesCard(card, s({ cited: 'atelier' }, 'title'), multi)).toBe(true)
    expect(matchesCard(card, s({ cited: 'atelier' }, 'nothing'), multi)).toBe(false)
  })

  it('round-trips a state through the address, leaving defaults out', () => {
    const groups = ['cited', 'field']
    const state = { q: 'glitch', sort: 'title', filters: { cited: 'field', field: 'all' } }
    const qs = serialiseState(state, 'recent')
    expect(qs).toBe('?q=glitch&cited=field&sort=title')
    expect(parseState(qs, groups, ['recent', 'title'], 'recent')).toEqual(state)
    expect(serialiseState({ q: '', sort: 'recent', filters: { cited: 'all' } }, 'recent')).toBe('')
  })

  it('ignores an unknown sort and unknown groups instead of trusting the link', () => {
    const st = parseState('?sort=bogus&nope=1&cited=x', ['cited'], ['recent'], 'recent')
    expect(st.sort).toBe('recent')
    expect(st.filters).toEqual({ cited: 'x' })
  })

  it('counts the narrowed groups', () => {
    expect(activeFilterCount({ q: '', sort: '', filters: { a: 'all', b: '1', c: '' } })).toBe(1)
  })

  it('sorts numbers numerically, strings by locale, and empty keys last either way', () => {
    const keys = ['2019', '', '2024', '1998']
    expect([...keys].sort((a, b) => compareKeys(a, b, true))).toEqual(['2024', '2019', '1998', ''])
    expect([...keys].sort((a, b) => compareKeys(a, b, false))).toEqual(['1998', '2019', '2024', ''])
    expect(['b', 'A', 'c'].sort((a, b) => compareKeys(a, b, false))).toEqual(['A', 'b', 'c'])
  })
})
