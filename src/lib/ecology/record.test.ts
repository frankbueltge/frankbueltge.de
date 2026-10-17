import { existsSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import type { ProgrammeRow } from './convening'
import { sessionHref } from '@/lib/engines/publication-links'
import { buildScore, type ScoreCycle } from './score'
import {
  cycleOfThing,
  loadEcologyRecord,
  madeThings,
  newestPiece,
  piecesIn,
  piecesSince,
  scoreCycles,
  scoreInput,
  sessionCycle,
  sessionLabel,
  sessionsIn,
  settlePieces,
  tieSessions,
  windowSeq,
  type MadeThing,
} from './record'
import { registerCount, type Register } from '@/lib/engines/register'
import type { LongWork } from '@/lib/studio/long-work'
import type { PresentationEntry, SessionNote } from './v3'

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

// ── which session made what, and what a cycle counts (2026-10-17) ─────────────────────────────
//
// A fixed record modelled on the turn from cycle 007 to 008: the days of cycle 007 also hold the
// convening after it, the Atelier names its windows in its notes, the Field one artifact by path
// and one only by title, and the Studio's long work grows across two sessions of one day.

const turn: ScoreCycle[] = [
  { n: 7, opened: '2026-10-10', closed: '2026-10-15', question: 'near misses' },
  { n: 8, opened: '2026-10-15', closed: null, question: 'warnings' },
]
const turnUntil = '2026-10-16'

const note = (n: Partial<SessionNote> & Pick<SessionNote, 'practice' | 'date' | 'title' | 'anchor'>): SessionNote => ({
  href: `/${n.practice}/journal/${n.anchor}/`,
  source: `src/content/${n.practice}/journal/${n.date}.md`,
  label: null,
  number: null,
  names: [],
  ...n,
})

const made = (t: Partial<MadeThing> & Pick<MadeThing, 'house' | 'title' | 'date' | 'href'>): MadeThing => ({
  kind: 'artifact',
  paperHref: null,
  sortDay: t.date ?? '',
  cycle: 8,
  withdrawn: false,
  blurb: null,
  auditKey: null,
  withdrawnNote: null,
  withdrawnOn: null,
  session: null,
  countCycle: t.cycle ?? 8,
  seq: null,
  ...t,
})

const SESSIONS: SessionNote[] = [
  // the Field: one session of cycle 007, one of the convening after it, two of cycle 008
  note({ practice: 'field', date: '2026-10-11', title: 'Session 193 — study 8', anchor: 'cs-193', number: 193, label: { cycle: 7, convening: false, from: 'cycle.json' }, names: ['artifacts/2026-10-11-how-far-the-record-sees'] }),
  note({ practice: 'field', date: '2026-10-13', title: 'Session 196 — the convening proposal', anchor: 'cs-196', number: 196, label: { cycle: 7, convening: true, from: 'heading' }, names: ['artifacts/2026-10-13-seen-coming'] }),
  note({ practice: 'field', date: '2026-10-16', title: 'Session 203 — study 18: the clock and the record', anchor: 'cs-203', number: 203, label: { cycle: 8, convening: false, from: 'heading' }, names: ['artifacts/2026-10-16-the-clock-and-the-record', 'artifacts/2026-10-15-the-end-written-in-advance'] }),
  note({ practice: 'field', date: '2026-10-16', title: 'Session 204 — the Field presents; study 19, the fine for working', anchor: 'cs-204', number: 204, label: { cycle: 8, convening: false, from: 'heading' } }),
  // the Atelier: two sessions of one day, whose file names sort the other way round
  note({ practice: 'atelier', date: '2026-10-15', title: '2026-10-15 — Halley’s Comet and the Clock (cycle 008, session 1)', anchor: 'note-halleys-comet', number: 1, label: { cycle: 8, convening: false, from: 'heading' }, names: ['window/cycle-008-session-1'] }),
  note({ practice: 'atelier', date: '2026-10-15', title: '2026-10-15 — cycle 008, session 2: The Hundred Occasions', anchor: 'note-the-hundred-occasions', number: 2, label: { cycle: 8, convening: false, from: 'heading' }, names: ['window/cycle-008-session-2'] }),
  // the Studio: the long work's first increment and its critique, one day
  note({ practice: 'studio', date: '2026-10-16', title: 'Session 175 — Filed Under, increment 1 of 3 (cycle 008, session 3)', anchor: 'cs-175', number: 175, label: { cycle: 8, convening: false, from: 'heading' } }),
  note({ practice: 'studio', date: '2026-10-16', title: 'Session 176 — Filed Under, increment 2 of 3: the critique (cycle 008, session 4)', anchor: 'cs-176', number: 176, label: { cycle: 8, convening: false, from: 'heading' } }),
  // a note that names no cycle: the calendar places it
  note({ practice: 'studio', date: '2026-10-11', title: 'Session 165 — Long after', anchor: 'cs-165', number: 165 }),
]

const THINGS: MadeThing[] = [
  made({ house: 'field', title: 'How far the record sees', date: '2026-10-11', href: '/field/artifacts/2026-10-11-how-far-the-record-sees/', cycle: 7 }),
  made({ house: 'field', title: 'Seen coming', date: '2026-10-13', href: '/field/artifacts/2026-10-13-seen-coming/', cycle: 7 }),
  made({ house: 'field', title: 'The Clock and the Record', date: '2026-10-16', href: '/field/artifacts/2026-10-16-the-clock-and-the-record/' }),
  made({ house: 'field', title: 'The Fine for Working', date: '2026-10-16', href: '/field/artifacts/2026-10-16-the-fine-for-working/' }),
  made({ house: 'atelier', title: 'Halley’s Comet and the Clock — the Atelier', date: '2026-10-15', href: '/atelier/window/cycle-008-session-1/', seq: windowSeq('cycle-008-session-1') }),
  made({ house: 'atelier', title: 'The Hundred Occasions', date: '2026-10-15', href: '/atelier/window/cycle-008-session-2/', seq: windowSeq('cycle-008-session-2') }),
  made({ house: 'atelier', title: 'The Least the Words Allow', date: '2026-10-14', href: '/atelier/window/cycle-007-convening-3/', cycle: 7, countCycle: null, seq: windowSeq('cycle-007-convening-3') }),
  made({ house: 'studio', kind: 'work', title: 'FILED UNDER', date: '2026-10-16', href: '/studio/werke-html/2026-10-16-filed-under/' }),
  made({ house: 'atelier', kind: 'presentation', title: 'The Heeded Column', date: '2026-10-16', href: '/atelier/presentations/cycle-008/' }),
]

const CHRONICLE = [
  { collective_session: 175, date: '2026-10-16', move: 'build' as const, works: ['2026-10-16-filed-under'] },
  { collective_session: 176, date: '2026-10-16', move: 'verify' as const, works: ['2026-10-16-filed-under'] },
]
const LONG: LongWork[] = [
  {
    slug: '2026-10-16-filed-under',
    sessions: [
      { session: 175, date: '2026-10-16', move: 'build' },
      { session: 176, date: '2026-10-16', move: 'verify' },
    ],
    shipped: null,
  },
]

describe('which session made what', () => {
  const tied = tieSessions(THINGS, SESSIONS, CHRONICLE)
  const by = (title: string) => tied.find((t) => t.title === title)!

  it('ties a piece to the session whose note names its path', () => {
    expect(by('How far the record sees').session?.anchor).toBe('cs-193')
    expect(by('The Clock and the Record').session?.anchor).toBe('cs-203')
    expect(by('The Hundred Occasions').session?.anchor).toBe('note-the-hundred-occasions')
  })

  it('takes the session of the piece’s own day, not a later note that mentions it', () => {
    // cs-203 names the artifact of 2026-10-15 too; no session of that day does, so it stays untied
    const earlier = made({ house: 'field', title: 'The end written in advance', date: '2026-10-15', href: '/field/artifacts/2026-10-15-the-end-written-in-advance/' })
    expect(tieSessions([earlier], SESSIONS)[0]!.session).toBeNull()
  })

  it('ties a piece by its whole title where the note names no path', () => {
    expect(by('The Fine for Working').session?.anchor).toBe('cs-204')
  })

  it('ties a Studio work to the first session its chronicle names it under', () => {
    expect(by('FILED UNDER').session?.anchor).toBe('cs-175')
  })

  it('counts a tied piece toward its session’s own cycle, and a convening’s piece toward none', () => {
    expect(by('How far the record sees').countCycle).toBe(7)
    expect(by('Seen coming').countCycle).toBeNull()
    expect(by('The Least the Words Allow').countCycle).toBeNull()
  })

  it('leaves a presentation and an untied piece as they were', () => {
    expect(by('The Heeded Column').session).toBeNull()
    expect(by('The Least the Words Allow').session).toBeNull()
  })
})

describe('what each session left or advanced', () => {
  const { things, sessionPieces } = settlePieces(tieSessions(THINGS, SESSIONS, CHRONICLE), SESSIONS, LONG, turn, turnUntil)

  it('gives every increment of a long work its notehead, though only the first left a folder', () => {
    expect(sessionPieces.get('/studio/journal/cs-175/')).toEqual(['FILED UNDER'])
    expect(sessionPieces.get('/studio/journal/cs-176/')).toEqual(['FILED UNDER'])
  })

  it('gives a day’s sessions their own pieces, whatever the alphabet of their files says', () => {
    expect(sessionPieces.get('/atelier/journal/note-halleys-comet/')).toEqual(['Halley’s Comet and the Clock — the Atelier'])
    expect(sessionPieces.get('/atelier/journal/note-the-hundred-occasions/')).toEqual(['The Hundred Occasions'])
  })

  it('counts an untied piece with its day’s unclaimed session, and never names that session its maker', () => {
    const untied = made({ house: 'studio', kind: 'work', title: 'LONG AFTER', date: '2026-10-11', href: '/studio/werke-html/2026-10-11-long-after/', cycle: 7 })
    const settled = settlePieces([untied], SESSIONS, [], turn, turnUntil)
    expect(settled.sessionPieces.get('/studio/journal/cs-165/')).toEqual(['LONG AFTER'])
    expect(settled.things[0]!.session).toBeNull()
    expect(settled.things[0]!.countCycle).toBe(7)
  })

  it('keeps a convening’s window out of every cycle, whichever session the day gives it', () => {
    const window = made({ house: 'atelier', title: 'A window of the convening', date: '2026-10-15', href: '/atelier/window/cycle-007-convening-9/', cycle: 7, countCycle: null })
    const lone = note({ practice: 'atelier', date: '2026-10-15', title: 'an unlabelled note', anchor: 'note-x' })
    expect(settlePieces([window], [lone], [], turn, turnUntil).things[0]!.countCycle).toBeNull()
  })

  it('settles every piece the day can take, and keeps the ties it was handed', () => {
    expect(things.find((t) => t.title === 'FILED UNDER')!.session?.anchor).toBe('cs-175')
    expect(things.find((t) => t.title === 'The Fine for Working')!.countCycle).toBe(8)
  })
})

describe('what a cycle counts', () => {
  const settled = settlePieces(tieSessions(THINGS, SESSIONS, CHRONICLE), SESSIONS, LONG, turn, turnUntil)
  const record = { sessions: SESSIONS, cycles: turn, until: turnUntil }

  it('counts a cycle’s sessions by the label each note carries, not by the days the cycle spans', () => {
    // the convening session of 10-13 lies in cycle 007's days and belongs to none
    expect(sessionsIn(record, 'field', 7).map((s) => s.anchor)).toEqual(['cs-193'])
    expect(sessionsIn(record, 'field', 8).map((s) => s.anchor)).toEqual(['cs-203', 'cs-204'])
    expect(sessionCycle(SESSIONS[1]!, turn, turnUntil)).toBeNull()
  })

  it('places a note that names no cycle by its day, as before', () => {
    expect(sessionsIn(record, 'studio', 7).map((s) => s.anchor)).toEqual(['cs-165'])
  })

  it('counts a cycle’s pieces the same way, so the two numbers under the drawing agree', () => {
    expect(piecesIn(settled.things, 'field', 7).map((t) => t.title)).toEqual(['How far the record sees'])
    expect(piecesIn(settled.things, 'atelier', 7)).toEqual([])
    expect(piecesIn(settled.things, 'studio', 8).map((t) => t.title)).toEqual(['FILED UNDER'])
  })
})

describe('the newest piece of a practice', () => {
  const things = tieSessions(THINGS, SESSIONS, CHRONICLE)

  it('is, on a day of several, the piece of the day’s last session', () => {
    expect(newestPiece(things, 'field')?.title).toBe('The Fine for Working')
    expect(newestPiece(things, 'atelier')?.title).toBe('The Hundred Occasions')
  })

  it('is decided by its own record’s number where no session ties it', () => {
    const untied = things.map((t) => ({ ...t, session: null }))
    expect(newestPiece(untied, 'atelier')?.title).toBe('The Hundred Occasions')
    expect(newestPiece([...untied].reverse(), 'atelier')?.title).toBe('The Hundred Occasions')
  })

  it('carries the session that made it, for the line its page prints beside it', () => {
    expect(newestPiece(things, 'field')?.session?.anchor).toBe('cs-204')
  })
})

describe('a window’s place in the Atelier’s count', () => {
  it('rises with every session, and a convening comes after its cycle', () => {
    expect(windowSeq('cycle-008-session-2')!).toBeGreaterThan(windowSeq('cycle-008-session-1')!)
    expect(windowSeq('cycle-007-convening')!).toBeGreaterThan(windowSeq('cycle-007-session-4')!)
    expect(windowSeq('cycle-007-convening-3')!).toBeGreaterThan(windowSeq('cycle-007-convening')!)
    expect(windowSeq('cycle-008-session-1')!).toBeGreaterThan(windowSeq('cycle-007-convening-5')!)
    expect(windowSeq('cycle-001')).toBeNull()
    expect(windowSeq('cycle-006-convening-how-near')).toBeNull()
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

  // Until 2026-10-17 each note linked the session's page on this site. The publication rule of that
  // day retired the journal pages, so a note links the session's own file in the practice's
  // repository — the file the mirror read it from, which the repository holds under the same path.
  it('draws a note for every session since the order, each linking its own file in the practice’s repository', () => {
    expect(score.notes).toHaveLength(record.sessions.length)
    const repoOf = { atelier: 'ulysses', field: 'field-research', studio: 'studio' } as const
    for (const note of score.notes) {
      const m = /^https:\/\/github\.com\/frankbueltge\/([a-z-]+)\/blob\/main\/(journal\/.+\.md)$/.exec(note.href)
      expect(m, note.href).not.toBeNull()
      expect(m![1]).toBe(repoOf[note.practice])
      expect(existsSync(`src/content/${note.practice}/${m![2]}`), note.href).toBe(true)
    }
  })

  it('draws a slur for every relation the relay holds', () => {
    expect(score.slurs).toHaveLength(record.relations.length)
  })

  it('lists exactly as many things as the catalogues card counts for the register', () => {
    expect(record.things).toHaveLength(registerCount())
  })

  it('counts no session of a convening toward a cycle, and each other session toward one at most', () => {
    for (const p of ['field', 'atelier', 'studio'] as const) {
      const counted = record.cycles.flatMap((c) => sessionsIn(record, p, c.n).map((s) => s.href))
      expect(new Set(counted).size, p).toBe(counted.length)
      const convening = record.sessions.filter((s) => s.practice === p && s.label?.convening).map((s) => s.href)
      for (const href of convening) expect(counted, href).not.toContain(href)
    }
  })

  it('fills the notehead of every session the record ties a piece to', () => {
    // a note links its session's file since 2026-10-17 (see above), so the session is found by it
    const filled = new Set(score.notes.filter((n) => n.filled).map((n) => n.href))
    for (const t of record.things) if (t.session && t.date && t.date >= record.since) expect(filled.has(sessionHref(t.session)), t.title).toBe(true)
  })

  it('gives every piece of a practice dated under the order a cycle', () => {
    const lost = record.things.filter((t) => t.house !== 'nightly-line' && t.date && t.date >= record.since && t.cycle === null)
    expect(lost.map((t) => `${t.house} ${t.date} ${t.title}`)).toEqual([])
  })
}, 60_000)
