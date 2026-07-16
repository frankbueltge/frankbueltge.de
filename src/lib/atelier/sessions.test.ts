// Guards the session-register derivation (die Praxis zählt in Sessions): the register is
// derived purely from committed journal filenames, and where a filename names its number
// explicitly the derived sequence must agree — numbering drift surfaces here instead of
// being renumbered silently. Runs against the REAL committed journal ids via glob.
import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { numberWord, sessionRegister, spineHeadline } from './sessions'

const JOURNAL_DIR = fileURLToPath(new URL('../../content/atelier/journal', import.meta.url))
const realIds = readdirSync(JOURNAL_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => `journal/${f}`)

describe('sessionRegister', () => {
  it('derives a sequential register from the committed filenames', () => {
    const reg = sessionRegister(realIds)
    expect(reg.length).toBe(realIds.length)
    expect(reg[0].n).toBe(1)
    expect(reg[reg.length - 1].n).toBe(realIds.length)
    // dates never go backwards
    for (let i = 1; i < reg.length; i++) {
      expect(reg[i].date >= reg[i - 1].date).toBe(true)
    }
  })

  it('agrees with every explicitly numbered filename (honesty check on real data)', () => {
    const reg = sessionRegister(realIds)
    for (const p of reg) expect(p, `${p.id} claims S${p.explicit}, register says S${p.n}`).toMatchObject({ matchesExplicit: true })
  })

  it('orders a day’s base file before its explicitly numbered siblings', () => {
    const reg = sessionRegister([
      'journal/2026-06-28-sitzung-2.md',
      'journal/2026-06-28.md',
    ])
    expect(reg.map((p) => p.id)).toEqual(['journal/2026-06-28.md', 'journal/2026-06-28-sitzung-2.md'])
    expect(reg.map((p) => p.n)).toEqual([1, 2])
  })

  it('accepts both filename dialects (sitzung-N and session-N)', () => {
    const reg = sessionRegister(['journal/2026-07-14.md', 'journal/2026-07-14-session-27.md', 'journal/2026-07-13-sitzung-25.md'])
    expect(reg.map((p) => p.explicit)).toEqual([25, null, 27])
  })
})

describe('spineHeadline (approved formula, counts in words)', () => {
  it('matches the design session’s own line for its own count', () => {
    expect(spineHeadline(28)).toBe('Twenty-eight nights; the next page is not written.')
  })

  it('speaks numbers as words', () => {
    expect(numberWord(30)).toBe('thirty')
    expect(numberWord(31)).toBe('thirty-one')
    expect(numberWord(7)).toBe('seven')
  })
})
