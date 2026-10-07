// The convening and the programme as the relay carries them (2026-10-07): read loosely, never
// fatal, and the two dates the page prints are the two the cycle clock acts on.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import {
  buildProgramme,
  conveningView,
  fallbackOn,
  loadRelayExtras,
  opensOn,
  parseConvening,
  parseProgramme,
  rankedScores,
  readRelayExtras,
  standingResult,
  type RelayExtras,
} from './convening'
import { loadCycle, type CycleState, type PresentationEntry } from './v3'

const REF = { repo: 'studio', path: 'BULLETIN.md', commit: '697bea009cd3988f4a0b5249fe13817a8a41efdb' }

const RAW_CONVENING = {
  after_cycle: 6,
  opened: '2026-10-10',
  proposals: [
    { practice: 'studio', question: 'What the archive refuses to count', docks_onto: 'cycle 005’s rest read', date: '2026-10-11', ref: REF },
    { practice: 'field', question: 'Where does E2E research break on missing data?', docks_onto: 'the paper of cycle 006', date: '2026-10-10', ref: { ...REF, repo: 'field-research' } },
    { practice: 'atelier', question: 'Absence as form', date: '2026-10-10' },
    { practice: 'plenum', question: 'not a practice of the ecology' },
    { practice: 'field' },
  ],
  rankings: [
    { practice: 'field', order: ['studio', 'field', 'atelier'], date: '2026-10-11', ref: { ...REF, repo: 'field-research' } },
    { practice: 'studio', order: ['studio', 'studio', 'nobody', 'atelier'], date: '2026-10-11' },
    { practice: 'atelier', order: [] },
  ],
  result: { question: 'What the archive refuses to count', proposed_by: 'studio', scores: { field: 3, atelier: 1, studio: 5 }, tallied_on: '2026-10-12', rule: 'borda' },
}

const RAW_PROGRAMME = [
  {
    cycle: 6,
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    opened: '2026-10-07',
    closed: '2026-10-10',
    findings: [
      { practice: 'studio', line: 'A work that counts what is withheld.', ref: REF },
      { practice: 'field', line: 'The rest read: 0.58–3.6 % not living.', ref: { ...REF, repo: 'field-research' } },
      { practice: 'field' },
    ],
  },
  { cycle: 5, question: 'Missing Data Art', source: 'continuing', opened: '2026-10-06', closed: '2026-10-07', findings: [] },
  { cycle: 5, question: 'a second entry for one cycle' },
  { cycle: 'four' },
]

const relayWith = (extra: Record<string, unknown>) => ({
  $contract: 'middle-relay/1',
  generated_at: '2026-10-12T07:00:00Z',
  relations: [],
  handoffs: [],
  ...extra,
})

const CYCLE: CycleState = {
  cycle: 6,
  phase: 'convening',
  question: 'Missing Data Art, read through human extinction by AI',
  source: 'continuing',
  opened: '2026-10-07',
  sessionsPerPractice: '3-5',
  defaults: { field: 'f', atelier: 'a', studio: 's' },
  continuing: { question: 'Missing Data Art', since: '2026-10-03' },
  convening: { afterCycle: 6, opened: '2026-10-10', objected: null },
}

const shelf: PresentationEntry[] = [
  { cycle: 5, practice: 'studio', href: '/studio/presentations/cycle-005/', files: 3, date: '2026-10-07', title: 'The Long Read', paperHref: null },
  { cycle: 5, practice: 'field', href: '/field/presentations/cycle-005/', files: 8, date: '2026-10-07', title: 'The Rest Read', paperHref: null },
  { cycle: 4, practice: 'atelier', href: '/atelier/presentations/cycle-004/', files: 2, date: '2026-10-05', paperHref: null },
]

describe('reading the convening', () => {
  it('keeps the well-formed entries, in the house order, and counts what it drops', () => {
    const c = parseConvening(RAW_CONVENING)!
    expect(c.afterCycle).toBe(6)
    expect(c.proposals.map((p) => p.practice)).toEqual(['field', 'atelier', 'studio'])
    expect(c.proposals[0]).toMatchObject({ docksOnto: 'the paper of cycle 006', ref: { repo: 'field-research' } })
    expect(c.proposals[1]).toMatchObject({ docksOnto: null, ref: null })
    // the studio's ranking names itself twice and a stranger; both are dropped, the order kept
    expect(c.rankings.map((r) => [r.practice, r.order])).toEqual([
      ['field', ['studio', 'field', 'atelier']],
      ['studio', ['studio', 'atelier']],
    ])
    expect(c.result).toMatchObject({ question: 'What the archive refuses to count', proposedBy: 'studio', talliedOn: '2026-10-12', rule: 'borda' })
    // plenum proposal, empty proposal, empty ranking
    expect(c.skipped).toBe(3)
  })

  it('is no convening without a cycle to tie it to, and no result without a question or a day', () => {
    expect(parseConvening(null)).toBeNull()
    expect(parseConvening({ ...RAW_CONVENING, after_cycle: 'six' })).toBeNull()
    expect(parseConvening({ ...RAW_CONVENING, result: { question: 'q' } })!.result).toBeNull()
    expect(parseConvening({ ...RAW_CONVENING, result: null })!.result).toBeNull()
  })

  it('orders the tally highest first', () => {
    expect(rankedScores(parseConvening(RAW_CONVENING)!.result!)).toEqual([
      { practice: 'studio', score: 5 },
      { practice: 'field', score: 3 },
      { practice: 'atelier', score: 1 },
    ])
  })
})

describe('reading the programme', () => {
  it('keeps one entry per cycle, oldest first, and drops what has no cycle or no line', () => {
    const p = parseProgramme(RAW_PROGRAMME)!
    expect(p.entries.map((e) => e.cycle)).toEqual([5, 6])
    expect(p.entries[1]!.findings.map((f) => f.practice)).toEqual(['field', 'studio'])
    expect(p.skipped).toBe(3)
    expect(parseProgramme(undefined)).toBeNull()
  })
})

describe('the programme as research-ecology seeds it (PR #34)', () => {
  // The relay's own first entries: cycles 001 and 002 ran under the default themes and carry no
  // shared question — null, not missing, and never a reason to skip the cycle.
  const SEEDED = [
    { cycle: 1, question: null, source: 'defaults', opened: '2026-08-30', closed: '2026-09-03', findings: [] },
    { cycle: 2, question: null, source: 'defaults', opened: '2026-09-03', closed: '2026-09-07', findings: [] },
    { cycle: 3, question: 'Missing Data Art', source: 'seed', opened: '2026-09-07', closed: '2026-10-03', findings: [] },
    { cycle: 4, question: 'Missing Data Art, read through human extinction', source: 'continuing', opened: '2026-10-03', closed: '2026-10-06', findings: [] },
    { cycle: 5, question: 'Missing Data Art', source: 'continuing', opened: '2026-10-06', closed: '2026-10-07', findings: [] },
    { cycle: 6, question: 'Missing Data Art, read through human extinction by AI', source: 'continuing', opened: '2026-10-07', closed: null, findings: [] },
  ]

  it('keeps every cycle, the two of the default themes included', () => {
    const p = parseProgramme(SEEDED)!
    expect(p.skipped).toBe(0)
    expect(p.entries.map((e) => [e.cycle, e.question, e.source])).toEqual([
      [1, null, 'defaults'],
      [2, null, 'defaults'],
      [3, 'Missing Data Art', 'seed'],
      [4, 'Missing Data Art, read through human extinction', 'continuing'],
      [5, 'Missing Data Art', 'continuing'],
      [6, 'Missing Data Art, read through human extinction by AI', 'continuing'],
    ])
    expect(p.entries[5]).toMatchObject({ opened: '2026-10-07', closed: null })
  })

  it('draws the whole chain from the relay, the open cycle running, the default themes said as such', () => {
    const v = buildProgramme(parseProgramme(SEEDED)!.entries, { ...CYCLE, phase: 'working', convening: null }, shelf)
    expect(v.from).toBe('relay')
    expect(v.rows.map((r) => [r.cycle, r.running, r.from])).toEqual([
      [1, false, 'relay'],
      [2, false, 'relay'],
      [3, false, 'relay'],
      [4, false, 'relay'],
      [5, false, 'relay'],
      [6, true, 'relay'],
    ])
    const entrance = fs.readFileSync(path.join(process.cwd(), 'src/components/ecology/EcologyV3Entrance.astro'), 'utf8')
    expect(entrance).toContain("r.source === 'defaults' && <p")
    expect(entrance).toContain('W.programme.defaultThemes')
  })
})

describe('the relay as a whole', () => {
  it('reads both sections from a relay the relay loader accepts', () => {
    const x = readRelayExtras(relayWith({ convening: RAW_CONVENING, programme: RAW_PROGRAMME }))
    expect(x.status).toBe('ok')
    expect(x.convening?.afterCycle).toBe(6)
    expect(x.programme?.map((e) => e.cycle)).toEqual([5, 6])
  })

  it('is an honest empty state without the sections, with a wrong contract, or without a file', () => {
    expect(readRelayExtras(relayWith({}))).toMatchObject({ status: 'ok', convening: null, programme: null })
    expect(readRelayExtras(relayWith({ convening: null }))).toMatchObject({ status: 'ok', convening: null })
    expect(readRelayExtras({ ...relayWith({ convening: RAW_CONVENING }), $contract: 'middle-relay/2' })).toMatchObject({
      status: 'invalid',
      convening: null,
      programme: null,
    })
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'convening-'))
    expect(loadRelayExtras(root)).toMatchObject({ status: 'absent', convening: null, programme: null })
    fs.mkdirSync(path.join(root, 'src/data/middle'), { recursive: true })
    fs.writeFileSync(path.join(root, 'src/data/middle/relay.json'), '{ not json')
    expect(loadRelayExtras(root)).toMatchObject({ status: 'invalid', convening: null, programme: null })
  })

  it("reads this repository's own mirror without throwing", () => {
    const x = loadRelayExtras()
    expect(['absent', 'invalid', 'ok']).toContain(x.status)
  })
})

describe('the two dates', () => {
  it('a result opens the day after its tally; a convening falls back on its seventh day', () => {
    expect(opensOn(parseConvening(RAW_CONVENING)!.result!)).toBe('2026-10-13')
    expect(fallbackOn('2026-10-10')).toBe('2026-10-17')
    expect(fallbackOn('2026-10-28')).toBe('2026-11-04')
  })

  it("stands only for its own convening, and not once the architect objected on or after its tally", () => {
    const c = parseConvening(RAW_CONVENING)!
    expect(standingResult(6, null, c)).not.toBeNull()
    expect(standingResult(7, null, c)).toBeNull()
    expect(standingResult(6, '2026-10-12', c)).toBeNull()
    expect(standingResult(6, '2026-10-11', c)).not.toBeNull()
    expect(standingResult(6, null, null)).toBeNull()
  })
})

describe('the convening, as /ecology shows it', () => {
  const ok = (convening: unknown): RelayExtras => readRelayExtras(relayWith({ convening }))

  it('is nothing outside the convening phase', () => {
    expect(conveningView({ ...CYCLE, phase: 'working', convening: null }, ok(RAW_CONVENING))).toBeNull()
  })

  it('shows the proposals, the rankings and the result with the day it opens', () => {
    const v = conveningView(CYCLE, ok(RAW_CONVENING))!
    expect(v).toMatchObject({ afterCycle: 6, next: 7, opened: '2026-10-10', fallbackOn: '2026-10-17', recorded: true, stands: true, opensOn: '2026-10-13' })
    expect(v.proposals).toHaveLength(3)
    expect(v.rankings).toHaveLength(2)
  })

  it('says when the relay has not recorded this convening, and keeps the fallback in view', () => {
    const v = conveningView(CYCLE, ok({ ...RAW_CONVENING, after_cycle: 5 }))!
    expect(v).toMatchObject({ recorded: false, result: null, stands: false, opensOn: null, continuing: 'Missing Data Art' })
    const absent = conveningView(CYCLE, { status: 'absent', convening: null, programme: null, skipped: 0 })!
    expect(absent.recorded).toBe(false)
  })

  it('promises no opening day without a continuing question, because then the clock does not turn', () => {
    const v = conveningView({ ...CYCLE, continuing: null }, ok(RAW_CONVENING))!
    expect(v).toMatchObject({ stands: true, opensOn: null, continuing: null })
  })

  it('shows an objected result as set aside', () => {
    const v = conveningView({ ...CYCLE, convening: { afterCycle: 6, opened: '2026-10-10', objected: '2026-10-12' } }, ok(RAW_CONVENING))!
    expect(v).toMatchObject({ stands: false, opensOn: null, objected: '2026-10-12' })
    expect(v.result).not.toBeNull()
  })
})

describe('the programme, as /ecology shows it', () => {
  it("takes the relay's chain, links every finding to its pinned file, and adds the running cycle the relay has not reached", () => {
    const relay = parseProgramme(RAW_PROGRAMME)!.entries.filter((e) => e.cycle === 5)
    const v = buildProgramme(relay, CYCLE, shelf)
    expect(v.from).toBe('relay')
    expect(v.rows.map((r) => [r.cycle, r.from, r.running])).toEqual([
      [5, 'relay', false],
      [6, 'site', true],
    ])
    expect(v.rows[1]).toMatchObject({ question: CYCLE.question, source: 'continuing', opened: '2026-10-07' })
    const full = buildProgramme(parseProgramme(RAW_PROGRAMME)!.entries, CYCLE, shelf)
    expect(full.rows.map((r) => r.cycle)).toEqual([5, 6])
    expect(full.rows[1]!.running).toBe(true)
    expect(full.rows[1]!.findings[0]!.href).toBe(
      'https://github.com/frankbueltge/field-research/blob/697bea009cd3988f4a0b5249fe13817a8a41efdb/BULLETIN.md',
    )
  })

  it("falls back to the site's own record: the running cycle and the cycles on the shelf, with their presentations", () => {
    for (const relay of [null, []]) {
      const v = buildProgramme(relay, CYCLE, shelf)
      expect(v.from).toBe('site')
      expect(v.rows.map((r) => r.cycle)).toEqual([4, 5, 6])
      expect(v.rows[0]).toMatchObject({ question: null, source: null, running: false })
      expect(v.rows[1]!.presented.map((p) => [p.practice, p.title])).toEqual([
        ['field', 'The Rest Read'],
        ['studio', 'The Long Read'],
      ])
      expect(v.rows[2]).toMatchObject({ question: CYCLE.question, running: true })
    }
  })

  it('never states a question for the default themes', () => {
    const v = buildProgramme(null, { ...CYCLE, phase: 'working', convening: null, source: 'defaults', question: null }, [])
    expect(v.rows).toEqual([expect.objectContaining({ cycle: 6, question: null, source: 'defaults' })])
  })

  it("builds from this repository's own record", () => {
    const v = buildProgramme(loadRelayExtras().programme, loadCycle(), [])
    expect(v.rows.some((r) => r.running)).toBe(true)
  })
})
