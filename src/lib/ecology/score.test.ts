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

  it('sets the practice’s own stave between its siblings, as the pages were drawn', () => {
    expect(part.staves.map((s) => [s.practice, s.own])).toEqual([
      [PART_SIBLINGS.field[0], false],
      ['field', true],
      [PART_SIBLINGS.field[1], false],
    ])
    expect(part.staves[1].lines[1] - part.staves[1].lines[0]).toBe(PART.ownStep)
    expect(part.staves[0].lines[1] - part.staves[0].lines[0]).toBe(PART.ghostStep)
  })

  it('names the piece a night left on the practice’s own note', () => {
    const own = part.notes.filter((n) => n.own)
    expect(own).toHaveLength(3)
    expect(own.find((n) => n.filled)!.piece).toBe('An artifact')
    expect(own.filter((n) => !n.filled).every((n) => n.piece === null)).toBe(true)
  })

  it('draws the siblings’ sessions as hollow ghosts', () => {
    const ghosts = part.notes.filter((n) => !n.own)
    expect(ghosts.map((n) => n.practice)).toEqual(['studio'])
    expect(ghosts.every((n) => !n.filled)).toBe(true)
  })

  it('keeps only the slurs that reach this practice, and says which way each ran', () => {
    expect(part.slurs.map((s) => s.id)).toEqual(['a', 'b'])
    expect(part.slurs.find((s) => s.id === 'a')).toMatchObject({ took: false, other: 'studio' })
    expect(part.slurs.find((s) => s.id === 'b')).toMatchObject({ took: true, other: 'atelier' })
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
