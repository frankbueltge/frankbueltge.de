import { describe, expect, it } from 'vitest'
import {
  buildCrossings,
  buildPart,
  buildScore,
  CROSSINGS,
  cycleOn,
  dayAfter,
  dayAxis,
  lastDay,
  PART,
  PART_SIBLINGS,
  relationMatrix,
  SCORE,
  type ScoreInput,
  type ScoreRelation,
} from './score'

const rel = (over: Partial<ScoreRelation>): ScoreRelation => ({
  id: 'rel-x',
  date: '2026-09-07',
  giver: 'atelier',
  taker: 'field',
  kind: 'noted',
  what: 'a relation',
  ...over,
})

/** ten days, two cycles: 001 from 30 Aug, 002 from 3 Sep and running */
const input: ScoreInput = {
  since: '2026-08-30',
  until: '2026-09-08',
  cycles: [
    { n: 1, opened: '2026-08-30', closed: '2026-09-03', question: null },
    { n: 2, opened: '2026-09-03', closed: null, question: 'Missing Data Art' },
  ],
  sessions: [
    { practice: 'field', date: '2026-08-30', title: 'Session 1', href: '/field/journal/cs-1/' },
    { practice: 'field', date: '2026-09-03', title: 'Session 2', href: '/field/journal/cs-2/' },
    { practice: 'field', date: '2026-09-03', title: 'Session 3', href: '/field/journal/cs-3/' },
    { practice: 'studio', date: '2026-09-07', title: 'Session 9', href: '/studio/journal/cs-9/' },
    { practice: 'atelier', date: '2026-08-01', title: 'before the order', href: '/atelier/journal/x/' },
  ],
  pieces: [
    { practice: 'field', date: '2026-09-03', title: 'An artifact' },
    { practice: 'studio', date: '2026-09-07', title: 'A work' },
  ],
  presentations: [
    { practice: 'field', cycle: 1, date: null },
    { practice: 'atelier', cycle: 1, date: '2026-09-01' },
    { practice: 'studio', cycle: 2, date: null },
  ],
  relations: [
    rel({ id: 'a', date: '2026-09-07', giver: 'field', taker: 'studio', kind: 'built_on' }),
    rel({ id: 'b', date: '2026-09-07', giver: 'atelier', taker: 'field', kind: 'answered' }),
    rel({ id: 'c', date: '2026-09-08', giver: 'studio', taker: 'atelier', kind: 'noted' }),
  ],
  convening: null,
}

describe('the day ruler', () => {
  const axis = dayAxis('2026-08-30', '2026-09-08', 150, 1000)

  it('holds both its ends, and gives every day the same width', () => {
    expect(axis.days).toBe(10)
    expect(axis.unit).toBe(100)
  })

  it('places a day by its left edge, its middle and its right edge', () => {
    expect(axis.x('2026-08-30', 0)).toBe(150)
    expect(axis.x('2026-08-30')).toBe(200)
    expect(axis.x('2026-09-08', 1)).toBe(1150)
  })

  it('ends on the newest day a record names, and refuses to end on nothing', () => {
    expect(lastDay(['2026-09-01', null, '2026-09-08', undefined, '2026-08-30'])).toBe('2026-09-08')
    expect(() => lastDay([null, undefined])).toThrow(/nothing to end the ruler on/)
  })
})

describe('the cycle a day belongs to', () => {
  it('is the one that opened on it — the day between two cycles is the later one’s', () => {
    expect(cycleOn('2026-09-02', input.cycles, input.until)?.n).toBe(1)
    expect(cycleOn('2026-09-03', input.cycles, input.until)?.n).toBe(2)
  })

  it('reaches to the end of the ruler for the running cycle, and no further', () => {
    expect(cycleOn('2026-09-08', input.cycles, input.until)?.n).toBe(2)
    expect(cycleOn(dayAfter('2026-09-08'), input.cycles, input.until)).toBeNull()
    expect(cycleOn('2026-08-29', input.cycles, input.until)).toBeNull()
  })
})

describe('the score', () => {
  const score = buildScore(input)

  it('draws three staves of five lines, in the house order', () => {
    expect(score.staves.map((s) => s.practice)).toEqual(['field', 'atelier', 'studio'])
    expect(score.staves[0].lines).toEqual([78, 84, 90, 96, 102])
  })

  it('draws a notehead for every session since the order came into force, and none before', () => {
    expect(score.notes).toHaveLength(4)
    expect(score.notes.some((n) => n.title === 'before the order')).toBe(false)
  })

  it('keeps every note inside the ruler', () => {
    for (const note of score.notes) {
      expect(note.x).toBeGreaterThanOrEqual(SCORE.left)
      expect(note.x).toBeLessThanOrEqual(SCORE.left + SCORE.plot)
    }
  })

  it('stacks the sessions of one day upward', () => {
    const [first, second] = score.notes.filter((n) => n.practice === 'field' && n.date === '2026-09-03')
    expect(second.x).toBe(first.x)
    expect(second.y).toBeLessThan(first.y)
  })

  it('fills as many notes of a day as that day left pieces, from the first', () => {
    const day = score.notes.filter((n) => n.practice === 'field' && n.date === '2026-09-03')
    expect(day.map((n) => n.filled)).toEqual([true, false])
    expect(score.notes.find((n) => n.date === '2026-08-30')!.filled).toBe(false)
    expect(score.notes.find((n) => n.practice === 'studio')!.filled).toBe(true)
  })

  it('gives every mark the cycle its day belongs to', () => {
    expect(score.notes.find((n) => n.date === '2026-08-30')!.cycle).toBe(1)
    expect(score.notes.find((n) => n.practice === 'studio')!.cycle).toBe(2)
    expect(score.slurs.every((s) => s.cycle === 2)).toBe(true)
  })

  // 2026-10-17: the record hands the score what each session left and the cycle its note names.
  // A day of two sessions where the second made the piece, and a Studio night of two increments
  // of one long work, which leaves one folder between them.
  const tied: ScoreInput = {
    ...input,
    sessions: [
      { practice: 'field', date: '2026-09-03', title: 'Session 2', href: '/field/journal/cs-2/', cycle: 1, pieces: [] },
      { practice: 'field', date: '2026-09-03', title: 'Session 3', href: '/field/journal/cs-3/', cycle: 2, pieces: ['An artifact'] },
      { practice: 'studio', date: '2026-09-07', title: 'Session 9', href: '/studio/journal/cs-9/', cycle: 2, pieces: ['A LONG WORK'] },
      { practice: 'studio', date: '2026-09-07', title: 'Session 10', href: '/studio/journal/cs-10/', cycle: 2, pieces: ['A LONG WORK'] },
      { practice: 'atelier', date: '2026-09-08', title: 'a convening session', href: '/atelier/journal/c/', cycle: null, pieces: [] },
    ],
    pieces: [],
  }
  const drawn = buildScore(tied)

  it('fills the note of the session the record ties a piece to, not the day’s first', () => {
    const day = drawn.notes.filter((n) => n.practice === 'field' && n.date === '2026-09-03')
    expect(day.map((n) => [n.title, n.filled])).toEqual([
      ['Session 2', false],
      ['Session 3', true],
    ])
  })

  it('fills every session that advanced a long work, though only one folder stands', () => {
    expect(drawn.notes.filter((n) => n.practice === 'studio').map((n) => n.filled)).toEqual([true, true])
  })

  it('gives a note the cycle its own label names, and a convening session none', () => {
    const day = drawn.notes.filter((n) => n.practice === 'field' && n.date === '2026-09-03')
    expect(day.map((n) => n.cycle)).toEqual([1, 2])
    expect(drawn.notes.find((n) => n.practice === 'atelier')!.cycle).toBeNull()
  })

  it('counts the pieces no session claims on their day, filling only the unclaimed sessions', () => {
    const mixed = buildScore({
      ...input,
      sessions: [
        { practice: 'field', date: '2026-09-03', title: 'Session 2', href: '/field/journal/cs-2/', pieces: ['A tied artifact'] },
        { practice: 'field', date: '2026-09-03', title: 'Session 3', href: '/field/journal/cs-3/' },
      ],
      pieces: [{ practice: 'field', date: '2026-09-03', title: 'An untied artifact' }],
    })
    expect(mixed.notes.map((n) => n.filled)).toEqual([true, true])
  })

  it('draws a slur from the giver’s stave to the taker’s', () => {
    const slur = score.slurs.find((s) => s.id === 'a')!
    // field (top 78) gave, studio (top 246) took: the curve runs from y 90 down to y 258
    expect(slur.d).toMatch(/^M[\d.]+ 90Q[\d.]+ 174 [\d.]+ 258$/)
    expect(slur.y).toBe(90)
  })

  it('fans the slurs of one day out, so they stay separate lines', () => {
    const [a, b] = score.slurs.filter((s) => s.date === '2026-09-07')
    expect(a.x).not.toBe(b.x)
  })

  it('opens a band where each cycle opens, the running one reaching the end of the ruler', () => {
    expect(score.bands.map((b) => [b.cycle, b.running])).toEqual([[1, false], [2, true]])
    expect(score.bands[0].x).toBe(SCORE.left)
    expect(score.bands[1].x + score.bands[1].width).toBeCloseTo(score.endX, 1)
  })

  it('captions a cycle only where there is room for its question', () => {
    expect(score.bands.find((b) => b.cycle === 1)!.captioned).toBe(true) // 4 days × 114 px
    const narrow = buildScore({ ...input, since: '2026-06-01' })
    expect(narrow.bands.every((b) => !b.captioned)).toBe(true)
  })

  it('marks a presentation at the end of the day its own summary names', () => {
    const atelier = score.presentations.find((p) => p.practice === 'atelier')!
    expect(atelier).toMatchObject({ cycle: 1, date: '2026-09-01', y: 162 })
    expect(atelier.x).toBeCloseTo(score.axis.x('2026-09-01', 1) - 5, 1)
  })

  it('falls back to the last day of the cycle where the summary names none', () => {
    const field = score.presentations.find((p) => p.practice === 'field')!
    expect(field.date).toBe('2026-09-02')
    expect(field.x).toBeLessThan(score.bands[1].x)
  })

  it('marks none for a cycle still running whose presentation names no day', () => {
    expect(score.presentations.map((p) => p.practice)).toEqual(['field', 'atelier'])
  })

  it('draws the convening from the day it opened to the day the next cycle did', () => {
    const closed = buildScore({
      ...input,
      cycles: [
        { n: 1, opened: '2026-08-30', closed: '2026-09-05', question: null },
        { n: 2, opened: '2026-09-05', closed: null, question: null },
      ],
      convening: { after: 1, opened: '2026-09-03' },
    })
    expect(closed.convening).toMatchObject({ after: 1 })
    expect(closed.convening!.width).toBeCloseTo(2 * closed.axis.unit, 0)
    const open = buildScore({ ...input, convening: { after: 2, opened: '2026-09-07' } })
    expect(open.convening!.x + open.convening!.width).toBeCloseTo(open.endX, 0)
  })

  it('is the same drawing for the same record', () => {
    expect(JSON.stringify(buildScore(input))).toBe(JSON.stringify(score))
  })
})

describe('a practice’s part', () => {
  const part = buildPart(input, 'field')

  it('names the piece a night left on the practice’s own note', () => {
    const own = part.notes
    expect(own).toHaveLength(3)
    expect(own.find((n) => n.filled)!.piece).toBe('An artifact')
    expect(own.filter((n) => !n.filled).every((n) => n.piece === null)).toBe(true)
  })

  it('names on each own note the piece its own session left', () => {
    const own = buildPart(
      {
        ...input,
        sessions: [
          { practice: 'field', date: '2026-09-03', title: 'Session 2', href: '/field/journal/cs-2/', pieces: [] },
          { practice: 'field', date: '2026-09-03', title: 'Session 3', href: '/field/journal/cs-3/', pieces: ['An artifact'] },
        ],
        pieces: [],
      },
      'field',
    ).notes
    expect(own.map((n) => [n.title, n.piece])).toEqual([
      ['Session 2', null],
      ['Session 3', 'An artifact'],
    ])
  })

  it('keeps only the relations that reach this practice, and says which way each ran', () => {
    expect(part.crossings.map((c) => c.id).sort()).toEqual(['a', 'b'])
    expect(part.crossings.find((c) => c.id === 'a')).toMatchObject({ took: false, other: 'studio' })
    expect(part.crossings.find((c) => c.id === 'b')).toMatchObject({ took: true, other: 'atelier' })
  })

  it('stands what it took above its sessions and hangs what it gave below them', () => {
    for (const c of part.crossings) {
      if (c.took) expect(c.y + c.height).toBeLessThanOrEqual(PART.tookFloor)
      else expect(c.y).toBeGreaterThanOrEqual(PART.gaveCeil)
    }
    for (const n of part.notes) {
      expect(n.y).toBeGreaterThan(PART.tookFloor)
      expect(n.y).toBeLessThan(PART.gaveCeil)
    }
  })

  it('gives every relation a cell of its own: no two overlap, however full the night', () => {
    const kinds = ['built_on', 'answered', 'noted'] as const
    const full = buildPart(
      {
        ...input,
        relations: Array.from({ length: 40 }, (_, i) =>
          rel({ id: `r${i}`, date: '2026-09-05', giver: i % 2 ? 'atelier' : 'studio', taker: 'field', kind: kinds[i % 3] }),
        ),
      },
      'field',
    )
    expect(full.peak).toBe(40)
    const cells = [...full.crossings].sort((a, b) => a.y - b.y)
    expect(cells[0].y).toBeGreaterThanOrEqual(PART.tookFloor - PART.reach)
    for (let i = 1; i < cells.length; i++) expect(cells[i].y).toBeGreaterThanOrEqual(cells[i - 1].y + cells[i - 1].height)
    // a sibling's cells lie together, the first-named sibling nearest the sessions, and within
    // a sibling the weightiest kind lies nearest
    const up = [...cells].reverse()
    expect(up.map((c) => c.other).join('').replace(/(studio)+/, 'S').replace(/(atelier)+/, 'A')).toBe('SA')
    expect(up.filter((c) => c.other === 'studio').map((c) => c.kind)).toEqual(
      [...up.filter((c) => c.other === 'studio').map((c) => c.kind)].sort((a, b) => kinds.indexOf(a) - kinds.indexOf(b)),
    )
  })

  it('counts per sibling what was taken and given', () => {
    expect(part.siblings.map((s) => s.practice)).toEqual([...PART_SIBLINGS.field])
    expect(part.siblings.reduce((n, s) => n + s.took + s.gave, 0)).toBe(part.crossings.length)
  })

  it('numbers every cycle where it opens', () => {
    expect(part.marks.map((m) => m.cycle)).toEqual([1, 2])
    expect(part.barlines).toHaveLength(3)
  })
})

describe('the crossings, night by night', () => {
  const model = buildCrossings(input.relations, input.cycles, input.until)!

  it('begins on the relay’s first day and ends where the ruler does', () => {
    expect(model.axis.since).toBe('2026-09-07')
    expect(model.axis.days).toBe(2)
    expect(model.nights).toBe(2)
  })

  it('stacks a night from the floor up — built on, answered, noted — to one scale', () => {
    const [first, second] = model.bars
    expect(first.total).toBe(2)
    expect(model.peak).toBe(2)
    expect(first.segments.built_on.y + first.segments.built_on.height).toBe(CROSSINGS.floor)
    expect(first.segments.answered.y + first.segments.answered.height).toBe(first.segments.built_on.y)
    expect(second.segments.noted.height).toBe(CROSSINGS.floor / 2)
  })

  it('is null without a relation — an empty chart is not drawn', () => {
    expect(buildCrossings([], input.cycles, input.until)).toBeNull()
  })
})

describe('who took what from whom', () => {
  const { rows, peak } = relationMatrix([
    ...input.relations,
    rel({ id: 'd', giver: 'field', taker: 'studio', kind: 'noted' }),
  ])

  it('has no diagonal: a practice does not take from itself', () => {
    expect(rows.map((r) => r.cells.map((c) => c === null))).toEqual([
      [true, false, false],
      [false, true, false],
      [false, false, true],
    ])
  })

  it('counts each directed pair by kind, and tints against the fullest cell', () => {
    const fieldToStudio = rows[0].cells[2]!
    expect(fieldToStudio.counts).toEqual({ built_on: 1, answered: 0, noted: 1 })
    expect(peak).toBe(2)
    expect(fieldToStudio.tint).toBe(6)
    expect(rows[1].cells[0]!.tint).toBe(3)
    expect(rows[0].cells[1]!.tint).toBe(0)
  })
})
