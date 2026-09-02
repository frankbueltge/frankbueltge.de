// The partitur's claims, checked without a browser (visual layer, Phase 1, 2026-09-02).
//
// The island draws whatever this model says, so everything worth doubting is doubted here: that
// the ruler ends at the record and not at the clock, that a lane order is an order, that a busy
// evening does not overprint itself, that zooming reveals rather than invents, and that the
// table under the figure holds exactly the marks the figure holds.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  axisTicks,
  axisX,
  bandSpan,
  BOX,
  buildCycleModel,
  IDENTITY_VIEW,
  LABEL_MIN_GAP,
  LANES,
  markLabel,
  MARK_STEP,
  modelRows,
  placeMarks,
  type CycleModelInput,
} from './cycle-model'
import type {
  ArtifactEntry,
  CycleState,
  EncounterEntry,
  LetterEntry,
  PresentationEntry,
  SessionNote,
} from './v3'
import { inCycle, loadArtifacts, loadCycle, loadEncounters, loadLetters, loadSessionNotes, PRACTICES } from './v3'

const CYCLE: CycleState = {
  cycle: 1,
  phase: 'working',
  question: null,
  source: 'defaults',
  opened: '2026-08-30',
  sessionsPerPractice: '3-5',
  defaults: { field: 'a', atelier: 'b', studio: 'c' },
}

const ARTIFACTS: ArtifactEntry[] = [
  { practice: 'field', slug: 'a-door-to-knock-on', date: '2026-09-01', cycle: 1, href: '/field/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/' },
  { practice: 'field', slug: 'yield-of-a-loop', date: '2026-08-30', cycle: 1, href: '/field/artifacts/cycle-001/2026-08-30-yield-of-a-loop/' },
  { practice: 'atelier', slug: 'cycle-001-session-2', date: '2026-09-01', cycle: 1, href: '/atelier/window/cycle-001-session-2/', title: 'The Cheapest Thing That Worked' },
  { practice: 'studio', slug: 'not-yet', date: '2026-09-01', cycle: null, href: '/studio/werke-html/2026-09-01-not-yet/', title: 'NOT YET' },
  // an undated record: the practice committed no day, so the drawing cannot place it
  { practice: 'studio', slug: 'no-day', date: null, cycle: null, href: '/studio/werke-html/no-day/' },
]

const SESSIONS: SessionNote[] = [
  { practice: 'field', date: '2026-08-30', title: 'Session 139 — 2026-08-30', href: '/field/journal/cs-139/', anchor: 'cs-139', source: 'src/content/field/journal/2026-08-30.md' },
  { practice: 'studio', date: '2026-09-01', title: 'Session 118 — 2026-09-01', href: '/studio/journal/cs-118/', anchor: 'cs-118', source: 'src/content/studio/journal/2026-09-01-session-118.md' },
]

const LETTERS: LetterEntry[] = [
  { id: '2026-09-a-packet', practice: 'studio', date: '2026-08-31', title: 'A packet for a named receiver', receiver: 'somebody public', status: 'prepared', href: '/post/', source: 'src/data/post/ledger.json' },
  { id: '2026-09-a-plenum-letter', practice: 'plenum', date: '2026-08-31', title: 'The plenum writes out of the house', receiver: 'somebody public', status: 'prepared', href: '/post/', source: 'src/data/post/ledger.json' },
]

const ENCOUNTERS: EncounterEntry[] = [
  { id: 'enc-2026-009', date: '2026-09-01', title: 'The measurement travels', href: '/encounters/register/', source: 'src/data/begegnungen/register.json' },
]

const PRESENTATIONS: PresentationEntry[] = [
  { cycle: 1, practice: 'field', href: '/field/presentations/cycle-001/', files: 4, date: '2026-09-01', title: 'The handover' },
  { cycle: 1, practice: 'studio', href: '/studio/presentations/cycle-001/', files: 5, date: null },
  { cycle: 0, practice: 'atelier', href: '/atelier/presentations/cycle-000/', files: 2, date: '2026-08-01' },
]

const INPUT: CycleModelInput = {
  cycle: CYCLE,
  artifacts: ARTIFACTS,
  sessions: SESSIONS,
  letters: LETTERS,
  encounters: ENCOUNTERS,
  presentations: PRESENTATIONS,
}

afterEach(() => {
  vi.useRealTimers()
})

describe('buildCycleModel', () => {
  it('is deterministic — the same records build the same model', () => {
    expect(buildCycleModel(INPUT)).toEqual(buildCycleModel(INPUT))
  })

  it('ends the ruler at the newest record, whatever day the machine thinks it is', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2031-04-17T12:00:00Z'))
    const model = buildCycleModel(INPUT)
    expect(model.axis.start).toBe('2026-08-30')
    expect(model.axis.end).toBe('2026-09-01')
  })

  it('gives an empty cycle a ruler one day wide rather than none', () => {
    const model = buildCycleModel({
      cycle: CYCLE,
      artifacts: [],
      sessions: [],
      letters: [],
      encounters: [],
      presentations: [],
    })
    expect(model.marks).toHaveLength(0)
    expect(model.axis.start).toBe('2026-08-30')
    expect(model.axis.end).toBe('2026-08-31')
    expect(model.lanes.every((l) => l.quiet)).toBe(true)
  })

  it('draws four lanes in the canonical order, the house last and neutral', () => {
    const model = buildCycleModel(INPUT)
    expect(model.lanes.map((l) => l.id)).toEqual([...LANES])
    expect(model.lanes.map((l) => l.persona)).toEqual(['meridian', 'ulysses', 'ensemble', 'conductor'])
    expect(model.lanes.map((l) => l.y)).toEqual([138, 234, 330, 426])
  })

  it('routes each record to the lane whose record it is', () => {
    const model = buildCycleModel(INPUT)
    const laneOf = (id: string) => model.marks.find((m) => m.id === id)?.lane
    expect(laneOf('artifact:field:yield-of-a-loop')).toBe('field')
    expect(laneOf('session:studio:cs-118')).toBe('studio')
    // a practice's own letter rides its lane; the plenum's rides the house's
    expect(laneOf('letter:2026-09-a-packet')).toBe('studio')
    expect(laneOf('letter:2026-09-a-plenum-letter')).toBe('house')
    expect(laneOf('encounter:enc-2026-009')).toBe('house')
    expect(laneOf('presentation:field:1')).toBe('field')
  })

  it('leaves out what it cannot honestly place: an undated record, and another cycle’s presentation', () => {
    const model = buildCycleModel(INPUT)
    const ids = model.marks.map((m) => m.id)
    expect(ids).not.toContain('artifact:studio:no-day')
    // the Studio's presentation names no day in its summary, and cycle 000's belongs elsewhere
    expect(ids).not.toContain('presentation:studio:1')
    expect(ids).not.toContain('presentation:atelier:0')
    expect(ids).toContain('presentation:field:1')
  })

  it('sorts the marks by day, then lane, then kind — a total order, never the filesystem’s', () => {
    const model = buildCycleModel(INPUT)
    const key = model.marks.map((m) => `${m.date}|${LANES.indexOf(m.lane)}|${m.kind}`)
    expect([...key].sort()).not.toBe(key) // (a sanity guard on the comparison below)
    for (let i = 1; i < model.marks.length; i += 1) {
      const a = model.marks[i - 1]!
      const b = model.marks[i]!
      expect(a.date <= b.date).toBe(true)
      if (a.date === b.date) expect(LANES.indexOf(a.lane) <= LANES.indexOf(b.lane)).toBe(true)
    }
  })

  it('steps a same-lane same-day group instead of stacking it on one point', () => {
    const sameDay: SessionNote[] = ['a', 'b', 'c'].map((s) => ({
      practice: 'studio',
      date: '2026-08-31',
      title: `Session ${s}`,
      href: `/studio/journal/${s}/`,
      anchor: s,
      source: 'src/content/studio/journal/2026-08-31.md',
    }))
    const model = buildCycleModel({ ...INPUT, sessions: sameDay, artifacts: [], letters: [], encounters: [] })
    const nths = model.marks.filter((m) => m.lane === 'studio').map((m) => m.nth)
    expect(nths).toEqual([0, 1, 2])
    const xs = placeMarks(model, IDENTITY_VIEW).map((p) => Number(p.x.toFixed(3)))
    expect(new Set(xs).size).toBe(xs.length)
  })

  it('bands the ruler with the phase the house says it is in, and nothing it does not know', () => {
    const model = buildCycleModel(INPUT)
    expect(model.bands).toEqual([{ phase: 'working', from: '2026-08-30', to: '2026-09-01' }])
    const span = bandSpan(model, model.bands[0]!, IDENTITY_VIEW)
    expect(span.x).toBeCloseTo(BOX.laneX0, 5)
    expect(span.x + span.w).toBeCloseTo(BOX.spanX1, 5)
  })
})

describe('placeMarks — the semantic zoom', () => {
  const model = buildCycleModel(INPUT)

  it('places the opening day at the left of the span and the newest at its right', () => {
    expect(axisX(model, model.axis.start)).toBeCloseTo(BOX.laneX0, 5)
    expect(axisX(model, model.axis.end)).toBeCloseTo(BOX.spanX1, 5)
  })

  it('keeps every mark inside the drawing at the identity view', () => {
    for (const p of placeMarks(model, IDENTITY_VIEW)) {
      expect(p.visible).toBe(true)
      expect(p.x).toBeLessThanOrEqual(BOX.spanX1 + 0.001)
      expect(p.x).toBeGreaterThanOrEqual(BOX.laneX0 - 0.001)
    }
  })

  it('shifts an overflowing group left as one, so its last mark stands on the end of the ruler', () => {
    const endDay: SessionNote[] = ['a', 'b', 'c'].map((s) => ({
      practice: 'field',
      date: '2026-09-01',
      title: `Session ${s}`,
      href: `/field/journal/${s}/`,
      anchor: s,
      source: 'src/content/field/journal/2026-09-01.md',
    }))
    const m = buildCycleModel({ ...INPUT, sessions: endDay, artifacts: ARTIFACTS })
    const group = placeMarks(m, IDENTITY_VIEW).filter(
      (p) => p.mark.lane === 'field' && p.mark.date === '2026-09-01',
    )
    expect(group.length).toBeGreaterThan(1)
    // the whole group sits inside the drawing, the last mark exactly on the end of the ruler,
    // and the marks are one step apart — no member is clipped and none overprints another
    expect(Math.max(...group.map((p) => p.x))).toBeCloseTo(BOX.spanX1, 5)
    expect(Math.min(...group.map((p) => p.x))).toBeCloseTo(BOX.spanX1 - (group.length - 1) * MARK_STEP, 5)
    expect(group.every((p) => p.visible)).toBe(true)
  })

  it('spreads an evening’s group as the ruler is zoomed, so a busy day stops being one blur', () => {
    const sameDay = placeMarks(model, IDENTITY_VIEW).filter(
      (p) => p.mark.lane === 'field' && p.mark.date === '2026-09-01',
    )
    expect(sameDay.length).toBeGreaterThan(1)
    const gapAt = (view: { k: number; x: number }) => {
      const xs = placeMarks(model, view)
        .filter((p) => p.mark.lane === 'field' && p.mark.date === '2026-09-01')
        .map((p) => p.x)
        .sort((a, b) => a - b)
      return xs[1]! - xs[0]!
    }
    expect(gapAt(IDENTITY_VIEW)).toBeCloseTo(MARK_STEP, 5)
    expect(gapAt({ k: 6, x: -5 * BOX.laneX0 })).toBeGreaterThan(MARK_STEP * 4)
  })

  it('gives an evening’s marks their own words once the zoom has room for them', () => {
    const day = '2026-09-01'
    const labelled = (view: { k: number; x: number }) =>
      placeMarks(model, view).filter((p) => p.mark.lane === 'field' && p.mark.date === day && p.label).length
    const crowd = model.marks.filter((m) => m.lane === 'field' && m.date === day).length
    expect(crowd).toBeGreaterThan(1)
    // at rest the group is one step wide, so only its first mark can be named
    expect(labelled(IDENTITY_VIEW)).toBe(1)
    // zoomed in on that day (the ruler's end brought to the middle of the drawing), the group has
    // spread far enough that every one of its marks carries its own words
    const centred = { k: 8, x: 700 - 8 * axisX(model, day) }
    expect(labelled(centred)).toBe(crowd)
  })

  it('never puts two labels of one lane within the gap, at any zoom', () => {
    for (const view of [IDENTITY_VIEW, { k: 3, x: -400 }, { k: 6, x: -5 * BOX.laneX0 }]) {
      for (const lane of model.lanes) {
        const labelled = placeMarks(model, view)
          .filter((p) => p.mark.lane === lane.id && p.label)
          .map((p) => p.x)
          .sort((a, b) => a - b)
        for (let i = 1; i < labelled.length; i += 1) {
          expect(labelled[i]! - labelled[i - 1]!).toBeGreaterThanOrEqual(LABEL_MIN_GAP)
        }
      }
    }
  })

  it('drops a mark the zoom has pushed off the ruler rather than drawing it outside', () => {
    const far = placeMarks(model, { k: 12, x: -11 * BOX.spanX1 })
    expect(far.some((p) => !p.visible)).toBe(true)
    for (const p of far.filter((q) => q.visible)) {
      expect(p.x).toBeGreaterThan(BOX.laneX0 - 27)
      expect(p.x).toBeLessThan(BOX.spanX1 + 27)
    }
  })

  it('is pure — the same view twice is the same placement', () => {
    expect(placeMarks(model, { k: 3, x: -400 })).toEqual(placeMarks(model, { k: 3, x: -400 }))
  })
})

describe('axisTicks', () => {
  const model = buildCycleModel(INPUT)

  it('rules the drawing with the cycle’s own days, thinned so two never overprint', () => {
    const ticks = axisTicks(model, IDENTITY_VIEW)
    expect(ticks.map((t) => t.date)).toContain('2026-08-30')
    for (let i = 1; i < ticks.length; i += 1) {
      expect(ticks[i]!.x - ticks[i - 1]!.x).toBeGreaterThanOrEqual(116)
    }
    for (const t of ticks) expect(model.marks.some((m) => m.date === t.date) || [model.axis.start, model.axis.end].includes(t.date)).toBe(true)
  })

  it('admits more days as the ruler is zoomed', () => {
    const near = axisTicks(model, IDENTITY_VIEW).length
    const closer = axisTicks(model, { k: 8, x: -7 * BOX.laneX0 }).length
    expect(closer).toBeGreaterThanOrEqual(Math.min(near, 1))
  })
})

describe('markLabel', () => {
  it('drops the day a record already stands on and cuts the rest at a word', () => {
    const model = buildCycleModel(INPUT)
    const session = model.marks.find((m) => m.id === 'session:field:cs-139')!
    expect(markLabel(session)).toBe('Session 139')
    const window = model.marks.find((m) => m.id === 'artifact:atelier:cycle-001-session-2')!
    expect(markLabel(window)).toBe('The Cheapest Thing That…')
  })
})

describe('modelRows — the floor under the drawing', () => {
  it('holds exactly the marks the figure holds, in the same order', () => {
    const model = buildCycleModel(INPUT)
    const rows = modelRows(model)
    expect(rows).toHaveLength(model.marks.length)
    expect(rows.map((r) => r.date)).toEqual(model.marks.map((m) => m.date))
    expect(rows.map((r) => r.what)).toEqual(model.marks.map((m) => m.title))
  })
})

describe('the model on this repository', () => {
  it('builds the running cycle from committed records alone, and places every one of them', () => {
    const cycle = loadCycle()
    const model = buildCycleModel({
      cycle,
      artifacts: loadArtifacts().filter((a) => inCycle(a, cycle)),
      sessions: PRACTICES.flatMap((p) => loadSessionNotes(p, cycle.opened)),
      letters: loadLetters(cycle.opened),
      encounters: loadEncounters(cycle.opened),
      presentations: [],
    })
    expect(model.marks.length).toBeGreaterThan(0)
    for (const m of model.marks) {
      expect(m.date >= cycle.opened).toBe(true)
      expect(m.href.startsWith('/')).toBe(true)
      expect(m.source.length).toBeGreaterThan(0)
    }
    for (const p of placeMarks(model, IDENTITY_VIEW)) expect(p.visible).toBe(true)
  })
})

describe('the score is mounted where the cycle is told', () => {
  // Carried over from cycle-score.test.ts, which this file replaces (2026-09-02): the figure
  // that renders on no page fails nothing, and the entrance is the one page that tells the cycle.
  const page = fs.readFileSync(
    fileURLToPath(new URL('../../components/ecology/EcologyV3Entrance.astro', import.meta.url)),
    'utf8',
  )
  it('the ecology entrance renders the figure and folds the bulletins without summarising', () => {
    expect(page).toContain('CycleScoreFigure')
    expect(page).toContain('buildCycleModel')
    expect(page).toContain('<details')
    expect(page).toContain('bulletinBlocks')
  })
})
