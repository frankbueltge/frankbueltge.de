import { describe, expect, it } from 'vitest'
import type { ProgrammeRow } from './convening'
import { buildScore, type ScoreCycle } from './score'
import { cycleOfThing, loadEcologyRecord, madeThings, newestPiece, piecesIn, piecesSince, scoreCycles, scoreInput, sessionLabel } from './record'
import { registerCount, type Register } from '@/lib/engines/register'
import type { PresentationEntry } from './v3'

const cycles: ScoreCycle[] = [
  { n: 1, opened: '2026-08-30', closed: '2026-09-03', question: null },
  { n: 2, opened: '2026-09-03', closed: null, question: 'Missing Data Art' },
]
const until = '2026-09-10'

describe('the cycle of a made thing', () => {
  it('is the one its own path names, where it names one', () => {
    expect(cycleOfThing({ house: 'atelier', date: null, named: 2 }, cycles, until)).toBe(2)
    expect(cycleOfThing({ house: 'field', date: '2026-09-09', named: 1 }, cycles, until)).toBe(1)
  })

  it('is otherwise the cycle its day falls in', () => {
    expect(cycleOfThing({ house: 'studio', date: '2026-09-02', named: null }, cycles, until)).toBe(1)
    expect(cycleOfThing({ house: 'studio', date: '2026-09-03', named: null }, cycles, until)).toBe(2)
  })

  it('is zero for a practice’s work before the order came into force', () => {
    expect(cycleOfThing({ house: 'field', date: '2026-07-01', named: null }, cycles, until)).toBe(0)
  })

  it('is none for the nightly line, which stands beside the ecology', () => {
    expect(cycleOfThing({ house: 'nightly-line', date: '2026-09-05', named: null }, cycles, until)).toBeNull()
  })

  it('is none for a thing that names neither a cycle nor a day', () => {
    expect(cycleOfThing({ house: 'atelier', date: null, named: null }, cycles, until)).toBeNull()
  })
})

describe('the programme, as the score reads it', () => {
  it('keeps the rows that carry an opening day, oldest first', () => {
    const rows = [
      { cycle: 2, opened: '2026-09-03', closed: null, question: 'q' },
      { cycle: 9, opened: null, closed: null, question: null },
      { cycle: 1, opened: '2026-08-30', closed: '2026-09-03', question: null },
    ] as ProgrammeRow[]
    expect(scoreCycles(rows).map((c) => c.n)).toEqual([1, 2])
  })
})

describe('a journal note’s heading, read for a list', () => {
  it('takes a numbered session as its label and drops the day wherever it stands', () => {
    expect(sessionLabel('Session 192 — 2026-10-10 — the convening’s tally stands; study 7 reaches outside')).toEqual({
      label: 'Session 192',
      line: 'the convening’s tally stands; study 7 reaches outside',
    })
    expect(sessionLabel('2026-10-10 — The Hinge (cycle 007, session 1)')).toEqual({ label: null, line: 'The Hinge (cycle 007, session 1)' })
    expect(sessionLabel('2026-10-08 (2) — Who is left to write it')).toEqual({ label: null, line: 'Who is left to write it' })
  })

  it('leaves a heading without either as it is', () => {
    expect(sessionLabel('How near')).toEqual({ label: null, line: 'How near' })
    expect(sessionLabel('Session 12')).toEqual({ label: 'Session 12', line: '' })
  })
})

describe('everything made, as one list', () => {
  const register = {
    rows: [
      { kind: 'work', house: 'studio', ns: 'studio', slug: 'a', title: 'A work', date: '2026-09-04', href: '/studio/a/', work: { state: 'withdrawn' } },
      { kind: 'artifact', house: 'field', ns: 'field', slug: 'b', title: 'An artifact', date: '2026-09-04', href: '/field/b/', artifact: { cycle: null }, source: '' },
      { kind: 'work', house: 'nightly-line', ns: 'atelier', slug: 'n', title: 'A night', date: '2026-09-09', href: '/error-as-method/n/', work: { state: 'published' } },
      { kind: 'work', house: 'field', ns: 'field', slug: 'old', title: 'Before the order', date: '2026-07-02', href: '/field/old/', work: { state: 'published' } },
    ],
    undated: [{ practice: 'atelier', slug: 'cycle-002-session-1', date: null, href: '/atelier/window/cycle-002-session-1/', cycle: 2, fromWorksRegister: false }],
  } as unknown as Register
  const shelf = [
    { cycle: 1, practice: 'field', href: '/field/presentations/cycle-001/', files: 2, date: null, paperHref: '/field/papers/cycle-001/' },
  ] as PresentationEntry[]
  const things = madeThings(register, shelf, cycles, until, (n) => `Presentation, cycle ${n}`)

  it('carries every line of the register, every undated artifact and every presentation', () => {
    expect(things).toHaveLength(6)
  })

  it('stands newest first, an undated thing on the day its cycle opened', () => {
    expect(things.map((t) => t.title)).toEqual([
      'A night',
      'An artifact',
      'A work',
      'Presentation, cycle 1',
      'cycle 002 session 1',
      'Before the order',
    ])
  })

  it('gives each its cycle', () => {
    const cycleOf = (title: string) => things.find((t) => t.title === title)!.cycle
    expect(cycleOf('A work')).toBe(2)
    expect(cycleOf('A night')).toBeNull()
    expect(cycleOf('Before the order')).toBe(0)
    expect(cycleOf('cycle 002 session 1')).toBe(2)
    expect(cycleOf('Presentation, cycle 1')).toBe(1)
  })

  it('keeps a withdrawal, and a presentation’s paper', () => {
    expect(things.find((t) => t.title === 'A work')!.withdrawn).toBe(true)
    expect(things.find((t) => t.kind === 'presentation')!.paperHref).toBe('/field/papers/cycle-001/')
  })

  it('counts a practice’s pieces without its presentations', () => {
    expect(piecesIn(things, 'field', 2).map((t) => t.title)).toEqual(['An artifact'])
    expect(piecesIn(things, 'field', 1)).toEqual([])
    expect(piecesSince(things, 'field').map((t) => t.title)).toEqual(['An artifact'])
    expect(newestPiece(things, 'studio')?.title).toBe('A work')
    expect(newestPiece(things, 'atelier')?.title).toBe('cycle 002 session 1')
  })
})

describe('the committed record', () => {
  const record = loadEcologyRecord((n) => `Presentation, cycle ${n}`)
  const score = buildScore(scoreInput(record))

  it('ends its ruler on a day the record names, on or after the running cycle’s opening', () => {
    expect(record.until >= record.cycle.opened).toBe(true)
    expect(record.until).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  it('carries the running cycle as the last of the chain', () => {
    expect(record.cycles.at(-1)!.n).toBe(record.cycle.cycle)
    expect(record.cycles.at(-1)!.closed).toBeNull()
  })

  it('draws a note for every session since the order, each linking a page', () => {
    expect(score.notes).toHaveLength(record.sessions.length)
    for (const note of score.notes) expect(note.href).toMatch(/^\/(field|atelier|studio)\/journal\//)
  })

  it('draws a slur for every relation the relay holds', () => {
    expect(score.slurs).toHaveLength(record.relations.length)
  })

  it('lists exactly as many things as the catalogues card counts for the register', () => {
    expect(record.things).toHaveLength(registerCount())
  })

  it('gives every piece of a practice dated under the order a cycle', () => {
    const lost = record.things.filter((t) => t.house !== 'nightly-line' && t.date && t.date >= record.since && t.cycle === null)
    expect(lost.map((t) => `${t.house} ${t.date} ${t.title}`)).toEqual([])
  })
}, 60_000)
