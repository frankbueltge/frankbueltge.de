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
import { buildSessionEntries, isSessionId, journalNotes, numberWord, sessionRegister, spineHeadline } from './sessions'

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

  // Regression, 2026-09-01: research ecology v3 (2026-08-30) restarted the practice on a
  // constitution that counts in cycles, so `2026-09-01-session-2.md` claims cycle 001's
  // second session — not the register's second. Read as a global claim it read as drift and
  // turned the whole atelier integrate red, holding back the night's mirror.
  it('reads a number on a post-v3 filename as cycle-scoped, not as a global register claim', () => {
    const ids = [
      'journal/2026-07-13-sitzung-25.md',
      'journal/2026-08-31-what-the-record-remembers.md',
      'journal/2026-09-01-session-2.md',
    ]
    const reg = sessionRegister(ids)
    // still a counted session, still numbered globally by the register …
    expect(reg.map((p) => p.id)).toEqual(['journal/2026-07-13-sitzung-25.md', 'journal/2026-09-01-session-2.md'])
    expect(reg.map((p) => p.n)).toEqual([1, 2])
    // … but its claimed 2 counts within cycle 001, so the global comparison does not apply
    expect(reg[1]).toMatchObject({ explicit: 2, explicitScope: 'cycle', matchesExplicit: true })
  })

  it('still catches genuine drift in the pre-v3 era, where the number did count globally', () => {
    const reg = sessionRegister(['journal/2026-07-13.md', 'journal/2026-07-14-session-27.md'])
    expect(reg[1]).toMatchObject({ explicit: 27, explicitScope: 'global', matchesExplicit: false })
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

// Etappe 2 (2026-08-01): each page of the journal has its own route, so the register needs a
// flat, ordered list whose slug IS the DOM anchor the register always carried.
describe('buildSessionEntries', () => {
  const files = [
    { id: 'journal/2026-06-28', body: '# Session 01 — the first night\nalpha' },
    { id: 'journal/2026-06-28-sitzung-2', body: '# Session 02 — later that night\nbeta' },
    { id: 'journal/2026-07-18-first-v4-tick', body: '# First v4 tick\ngamma' },
    { id: 'journal/2026-07-19-null-island-expose', body: 'no heading at all' },
    { id: 'REQUESTS', body: 'not a journal file' },
  ]

  it('numbers the sessions, names the notes, and puts the register before the notes', () => {
    const entries = buildSessionEntries(files)
    expect(entries.map((e) => e.slug)).toEqual([
      's1',
      's2',
      'note-first-v4-tick',
      'note-null-island-expose',
    ])
    expect(entries.map((e) => e.kind)).toEqual(['session', 'session', 'note', 'note'])
    expect(entries.map((e) => e.n)).toEqual([1, 2, null, null])
  })

  it('takes the H1 as the heading and strips it from the text', () => {
    const [first] = buildSessionEntries(files)
    expect(first.heading).toBe('Session 01 — the first night')
    expect(first.text.trim()).toBe('alpha')
  })

  it('falls back to the date when a file carries no H1', () => {
    const note = buildSessionEntries(files).find((e) => e.slug === 'note-null-island-expose')!
    expect(note.heading).toBe('2026-07-19')
    expect(note.text).toBe('no heading at all')
  })

  it('gives the list clean edges for prev/next: first has no prev, last has no next', () => {
    const entries = buildSessionEntries(files)
    expect(entries[-1]).toBeUndefined()
    expect(entries[entries.length]).toBeUndefined()
    expect(entries[0].slug).toBe('s1')
    expect(entries[entries.length - 1].slug).toBe('note-null-island-expose')
  })

  it('never throws on a missing body or an empty mirror (the nightly integrate must not break)', () => {
    expect(() => buildSessionEntries([{ id: 'journal/2026-08-01' }])).not.toThrow()
    expect(buildSessionEntries([{ id: 'journal/2026-08-01' }])[0].text).toBe('')
    expect(buildSessionEntries([])).toEqual([])
  })

  it('covers every real committed journal file exactly once, with a unique slug', () => {
    const entries = buildSessionEntries(realIds.map((id) => ({ id, body: '' })))
    expect(entries).toHaveLength(realIds.length)
    expect(new Set(entries.map((e) => e.slug)).size).toBe(realIds.length)
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
