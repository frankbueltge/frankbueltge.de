import { describe, expect, it } from 'vitest'
import { ENTRIES, SOURCES, foldSameId, usedBy, userKind, werkLabel, type RegisterEntry } from './register'

describe('the dataset register as /datasets shows it', () => {
  it('shows every source once', () => {
    expect(new Set(SOURCES.map((e) => e.id)).size).toBe(SOURCES.length)
    expect(new Set(ENTRIES.map((e) => e.id)).size).toBe(SOURCES.length)
  })

  it('folds two records of one id into one card, keeping every finding and user', () => {
    const a = { id: 'd', fundstellen: ['x.md'], adressen: ['u'], benutzt_von: ['attention'], geprueft: false } as RegisterEntry
    const b = { id: 'd', fundstellen: ['y.json'], adressen: ['u'], benutzt_von: ['nightly'], geprueft: true } as RegisterEntry
    const [m, ...rest] = foldSameId([a, b])
    expect(rest).toHaveLength(0)
    expect(m.geprueft).toBe(true)
    expect(m.fundstellen).toEqual(['x.md', 'y.json'])
    expect(m.benutzt_von).toEqual(['attention', 'nightly'])
  })

  it('names every user it shows, and sorts each into a kind', () => {
    for (const w of new Set(SOURCES.flatMap(usedBy))) {
      expect(werkLabel(w) !== w || w === 'n-1', `raw key on the page: ${w}`).toBe(true)
      expect(['practice', 'instrument', 'infrastructure']).toContain(userKind(w))
    }
    expect(usedBy({ benutzt_von: ['meridian', 'field'] })).toEqual(['field'])
  })
})
