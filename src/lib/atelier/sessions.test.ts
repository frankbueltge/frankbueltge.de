// Guards the session-register derivation (die Praxis zählt in Sessions): the register is
// derived purely from committed journal filenames, and where a filename names its number
// explicitly the derived sequence must agree — numbering drift surfaces here instead of
// being renumbered silently. Runs against the REAL committed journal ids via glob.
//
// Since Protocol v4 the journal also carries UNNUMBERED notes (dispatcher ticks) that are
// not sessions. The invariant is that the split is total: every committed journal file is
// either a counted session or a note, and nothing is silently lost between the two.
import { describe, expect, it } from 'vitest'
import { readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { isSessionId, journalNotes, numberWord, sessionRegister, spineHeadline } from './sessions'

const JOURNAL_DIR = fileURLToPath(new URL('../../content/atelier/journal', import.meta.url))
const realIds = readdirSync(JOURNAL_DIR)
  .filter((f) => f.endsWith('.md'))
  .map((f) => `journal/${f}`)

describe('sessionRegister', () => {
  it('derives a sequential register from every session filename (notes excluded, nothing lost)', () => {
    const reg = sessionRegister(realIds)
    // the register counts exactly the sessions; the rest are unnumbered notes …
    expect(reg.length).toBe(realIds.filter(isSessionId).length)
    // … and together sessions + notes account for every committed file (no silent drop)
    expect(reg.length + journalNotes(realIds).length).toBe(realIds.length)
    expect(reg[0].n).toBe(1)
    expect(reg[reg.length - 1].n).toBe(reg.length)
    // dates never go backwards
    for (let i = 1; i < reg.length; i++) {
      expect(reg[i].date >= reg[i - 1].date).toBe(true)
    }
  })

  it('classifies unnumbered dated notes (v4 dispatcher ticks) as notes, not sessions', () => {
    const ids = [
      'journal/2026-07-18.md',
      'journal/2026-07-18-session-41.md',
      'journal/2026-07-18-first-v4-tick.md',
    ]
    expect(ids.filter(isSessionId)).toEqual(['journal/2026-07-18.md', 'journal/2026-07-18-session-41.md'])
    const notes = journalNotes(ids)
    expect(notes.map((n) => n.id)).toEqual(['journal/2026-07-18-first-v4-tick.md'])
    expect(notes[0]).toMatchObject({ date: '2026-07-18', slug: 'first-v4-tick' })
    // and a note never appears in the numbered register
    const reg = sessionRegister(ids)
    expect(reg.some((p) => p.id === notes[0].id)).toBe(false)
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

describe('spineHeadline (approved formula, counts in words; v4 revision 2026-07-18)', () => {
  it('speaks the closed nightly register for its own count', () => {
    expect(spineHeadline(28)).toBe('Twenty-eight nights — the nightly register closed 18 July 2026.')
  })

  it('speaks numbers as words', () => {
    expect(numberWord(30)).toBe('thirty')
    expect(numberWord(31)).toBe('thirty-one')
    expect(numberWord(7)).toBe('seven')
  })
})
