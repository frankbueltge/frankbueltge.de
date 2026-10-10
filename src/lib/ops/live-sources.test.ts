// The signal log's live sources, each against a fixture shaped like its committed record. What
// every test here asks is the module's one question: does the row say what the record says — its
// day, its time, its figure — and nothing the record does not?
import { describe, expect, it } from 'vitest'
import { NAMING } from '@/config/naming'
import { GALLERY } from '@/config/gallery-wording'
import { WERKE, type Werk } from '@/data/werke'
import type { ArchFacts } from '@/lib/arch/facts'
import type { CycleState, PresentationEntry } from '@/lib/ecology/v3'
import { READOUTS } from '@/lib/experiments/readouts'
import type { RelayConvening } from '@/lib/ecology/convening'
import { houseNames, sortFeed } from './house-feed'
import {
  archSessionEntries,
  atlasEntries,
  conveningEntries,
  cycleEntries,
  datasetEntries,
  INSTRUMENTS,
  momentEntries,
  n1NightEntries,
  paperEntries,
  presentationEntries,
  projectEntries,
  readingEntries,
  recordDay,
  relayEntries,
  type DatasetProbe,
} from './live-sources'
import { parseRelay, type RelayState } from '@/lib/ecology/relay'

const S = NAMING.opsRoom.signal
const K = S.kindLabels
const names = houseNames()
const shelf = (id: string): Werk => WERKE.find((w) => w.id === id)!
const titleOf = (w: Werk) => (typeof w.title === 'string' ? w.title : w.title.en)

describe('the day a record belongs to', () => {
  it('is the record’s own date first', () => {
    expect(recordDay({ date: '2026-10-04', generated_at: '2026-10-05T01:00:00Z' }, '2026-10-03')).toBe('2026-10-04')
  })

  it('is the day its archive file is named for, where the record states none', () => {
    expect(recordDay({ generated_at: '2026-10-05T01:00:00Z' }, '2026-10-04')).toBe('2026-10-04')
  })

  it('is the day its stamp names, for a snapshot that keeps neither', () => {
    expect(recordDay({ generated_at: '2026-10-04T10:30:07Z' })).toBe('2026-10-04')
  })

  it('is no day at all when the record names none — never the day of the build', () => {
    expect(recordDay({ value: 1 })).toBeNull()
    expect(recordDay(null)).toBeNull()
    expect(recordDay({ date: 'yesterday' })).toBeNull()
  })
})

describe('the lab’s instruments: one row per reading', () => {
  const consensus = (date: string, at: string, outlets: number) => ({
    record: { date, generated_at: at, headline: { domain_count: outlets, span_hours: 11.2 } },
    fileDate: date,
  })

  it('names the instrument from the shelf and states the reading the gallery states', () => {
    const rows = readingEntries(
      { consensus: [consensus('2026-10-03', '2026-10-03T11:11:42+00:00', 206), consensus('2026-10-04', '2026-10-04T11:51:18+00:00', 157)] },
      WERKE,
      names,
    )
    expect(rows).toHaveLength(2)
    const newest = rows.find((r) => r.date === '2026-10-04')!
    expect(newest).toMatchObject({
      time: '2026-10-04T11:51:18.000Z',
      source: 'reading',
      house: 'lab',
      houseName: names.lab,
      title: titleOf(shelf('consensus')),
      kind: K.reading,
      href: shelf('consensus').href,
      voice: null,
      withdrawn: false,
    })
    expect(newest.fact).toBe(GALLERY.readouts.consensus('157', '11.2'))
  })

  it('links a reading to its own day where the instrument publishes one', () => {
    const day = { date: '2026-10-04', generated_at: '2026-10-04T10:00:54Z', entries: [{}, {}], index: { worsened: 1 } }
    const [protocol] = readingEntries({ protokoll: [{ record: day, fileDate: '2026-10-04' }] }, WERKE, names)
    expect(protocol!.href).toBe('/protocol/2026-10-04/')
    expect(protocol!.fact).toBe(READOUTS.protokoll(day))
  })

  it('keeps a reading whose record lacks the figures, and states no fact for it', () => {
    // the Protocol's first nights kept no index: the night happened, its finding is not in the record
    const [night] = readingEntries(
      { protokoll: [{ record: { date: '2026-06-11', generated_at: '2026-06-11T22:51:12Z', entries: [{}], index: null }, fileDate: '2026-06-11' }] },
      WERKE,
      names,
    )
    expect(night).toMatchObject({ date: '2026-06-11', fact: null })
  })

  it('drops a record that names no day, and an instrument the shelf does not carry', () => {
    expect(readingEntries({ pattern: [{ record: { headline: {} }, fileDate: null }] }, WERKE, names)).toEqual([])
    expect(readingEntries({ consensus: [consensus('2026-10-04', '2026-10-04T11:51:18Z', 1)] }, [], names)).toEqual([])
  })

  it('reads one day once: two records of a day show the later', () => {
    const rows = readingEntries(
      { consensus: [consensus('2026-10-04', '2026-10-04T09:00:00Z', 1), consensus('2026-10-04', '2026-10-04T11:00:00Z', 2)] },
      WERKE,
      names,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]!.fact).toBe(GALLERY.readouts.consensus('2', '11.2'))
  })

  it('files a snapshot without a date under the day its stamp names', () => {
    const [policy] = readingEntries(
      { praemie: [{ record: { generated_at: '2026-10-04T10:30:07Z', premium: { base_year: 1998, change_pct_since_base: 179.2 } }, fileDate: null }] },
      WERKE,
      names,
    )
    expect(policy).toMatchObject({ date: '2026-10-04', time: '2026-10-04T10:30:07.000Z' })
    // a year is a name: 1998, never "1,998"
    expect(policy!.fact).toBe(GALLERY.readouts.praemie('1998', '179%'))
  })

  it('counts the Watchtower’s satellites and Headroom’s reporting pages in their own words', () => {
    const rows = readingEntries(
      {
        ueberflug: [{ record: { generated_at: '2026-10-04T10:56:30Z', satellites: [{}, {}, {}] }, fileDate: null }],
        spielraum: [
          {
            record: { generated_at: '2026-10-03T11:42:02Z', sources: { a: { status: 'ok' }, b: { status: 'unreachable' } } },
            fileDate: null,
          },
        ],
      },
      WERKE,
      names,
    )
    const watchtower = rows.find((r) => r.title === titleOf(shelf('ueberflug')))!
    expect(watchtower.fact).toBe(S.facts.watchtower('3'))
    const headroom = rows.find((r) => r.title === titleOf(shelf('spielraum')))!
    expect(headroom).toMatchObject({ source: 'probe', kind: K.probe, date: '2026-10-03' })
    expect(headroom.fact).toBe(S.facts.headroom({ pages: '2', unreachable: '1' }))
  })

  it('reads only instruments the shelf knows, under their shelf ids', () => {
    for (const spec of Object.values(INSTRUMENTS)) {
      expect(WERKE.some((w) => w.id === spec.werk), spec.werk).toBe(true)
    }
  })
})

describe('Machine Attention: moments by day, projects by the day they began', () => {
  const moment = (occurred_at: string, over: Record<string, string> = {}) => ({
    project: 'foreknown',
    occurred_at,
    mode: 'resolution',
    statement: 'An announced future ran its course under watch.',
    subject: 'Flood Warning',
    enter: '/attention/future/x.html',
    evidence: 'foreknown/resolutions/x.json',
    ...over,
  })
  const file = (moments: unknown[]) => ({ $contract: 'stage-moments/1', moments })
  const exportFile = {
    $contract: 'attention-export/1',
    projects: [
      { id: 'foreknown', title: 'The Foreknown', since: '2026-08-08', site_route: '/attention', status: 'retired' },
      { id: 'memoryhole', title: 'Memory Hole', since: '2026-08-15', site_route: null, status: 'v0' },
    ],
  }

  it('shows a day of one moment as that moment — its subject, statement and door', () => {
    const rows = momentEntries(
      file([
        moment('2026-10-04T00:00:00Z', { mode: 'retirement', subject: 'The Foreknown', statement: 'It stopped.', enter: '/attention/' }),
        moment('2026-10-03T10:36:02+00:00'),
        moment('2026-10-03T10:36:03+00:00'),
      ]),
      exportFile,
      names,
    )
    const single = rows.find((r) => r.date === '2026-10-04')!
    expect(single).toMatchObject({
      title: 'The Foreknown',
      fact: 'It stopped.',
      href: '/attention/',
      kind: K.moment,
      time: '2026-10-04T00:00:00.000Z',
      house: 'attention',
      houseName: names.attention,
    })
  })

  it('counts a day of many in one row that leads to the stage, newest moment’s time', () => {
    const rows = momentEntries(
      file([moment('2026-10-04T09:00:00Z'), moment('2026-10-04T11:00:00Z'), moment('2026-10-04T10:00:00Z'), moment('2026-10-02T08:00:00Z')]),
      exportFile,
      names,
    )
    const counted = rows.find((r) => r.date === '2026-10-04')!
    expect(counted).toMatchObject({ title: 'The Foreknown', kind: K.moments, href: '/machine-attention', time: '2026-10-04T11:00:00.000Z' })
    expect(counted.fact).toBe(S.facts.moments({ count: '3', atLeast: false }))
  })

  it('says “at least” for the oldest day of the window, which the window may have cut', () => {
    const rows = momentEntries(file([moment('2026-10-04T09:00:00Z'), moment('2026-10-03T09:00:00Z'), moment('2026-10-03T10:00:00Z')]), exportFile, names)
    expect(rows.find((r) => r.date === '2026-10-03')!.fact).toBe(S.facts.moments({ count: '2', atLeast: true }))
  })

  it('keeps projects apart on one day', () => {
    const rows = momentEntries(
      file([moment('2026-10-04T09:00:00Z'), moment('2026-10-04T09:30:00Z', { project: 'memoryhole', subject: 'A page', statement: 'It changed.' })]),
      exportFile,
      names,
    )
    expect(rows.map((r) => r.title).sort()).toEqual(['A page', 'Flood Warning'])
  })

  it('refuses a file of an unknown contract, the way the stage refuses it', () => {
    expect(momentEntries({ $contract: 'stage-moments/2', moments: [moment('2026-10-04T09:00:00Z')] }, exportFile, names)).toEqual([])
    expect(projectEntries({ ...exportFile, $contract: 'attention-export/9' }, names)).toEqual([])
  })

  it('dates each project by the day it began, and leads to its stage where it has one', () => {
    expect(projectEntries(exportFile, names).map((r) => [r.date, r.title, r.href, r.kind])).toEqual([
      ['2026-08-08', 'The Foreknown', '/attention', K.project],
      ['2026-08-15', 'Memory Hole', '/machine-attention', K.project],
    ])
  })
})

describe('the catalogues: one counted row per day', () => {
  it('counts the papers the practices last used on each day, and says “last used”, not “entered”', () => {
    const rows = paperEntries(
      [{ zuletzt_gebraucht: '2026-10-04' }, { zuletzt_gebraucht: '2026-10-04' }, { zuletzt_gebraucht: '2026-10-02' }, { zuletzt_gebraucht: null }],
      names,
    )
    expect(rows.map((r) => [r.date, r.fact])).toEqual([
      ['2026-10-04', S.facts.papers({ count: '2', one: false })],
      ['2026-10-02', S.facts.papers({ count: '1', one: true })],
    ])
    expect(rows[0]).toMatchObject({ house: 'catalogues', houseName: names.catalogues, title: 'Paper Catalogue', kind: K.papers, href: '/papers', time: null })
    expect(rows[0]!.fact).toMatch(/last used/)
    expect(rows[1]!.fact).toMatch(/\b1 paper last used/)
  })

  it('counts the papers that entered on a day the catalogue dates, and keeps “last used” for the days before', () => {
    const rows = paperEntries(
      [
        // stamped by the builder: two entered on the 7th, one on the 9th
        { zuletzt_gebraucht: '2026-10-09', first_seen_on: '2026-10-07' },
        { zuletzt_gebraucht: '2026-10-07', first_seen_on: '2026-10-07' },
        { zuletzt_gebraucht: '2026-10-09', first_seen_on: '2026-10-09' },
        // there before the stamp began: its last use speaks only for a day before the first stamp
        { zuletzt_gebraucht: '2026-10-08', first_seen_on: null },
        { zuletzt_gebraucht: '2026-10-05', first_seen_on: null },
        { zuletzt_gebraucht: '2026-10-05' },
      ],
      names,
    )
    expect(rows.map((r) => [r.date, r.fact])).toEqual([
      ['2026-10-07', S.facts.papersEntered({ count: '2', one: false })],
      ['2026-10-09', S.facts.papersEntered({ count: '1', one: true })],
      ['2026-10-05', S.facts.papers({ count: '2', one: false })],
    ])
    // from the first stamped day on, a day nothing entered has no row — not a "last used" one
    expect(rows.some((r) => r.date === '2026-10-08')).toBe(false)
    expect(rows[0]!.fact).toMatch(/entered the catalogue/)
  })

  it('stays with “last used” wherever the catalogue dates no entry at all', () => {
    const rows = paperEntries([{ zuletzt_gebraucht: '2026-10-04', first_seen_on: null }, { zuletzt_gebraucht: '2026-10-04', first_seen_on: 'soon' }], names)
    expect(rows.map((r) => [r.date, r.fact])).toEqual([['2026-10-04', S.facts.papers({ count: '2', one: false })]])
  })

  const run = (gestartet_am: string, atlas_eintraege: number, atlas = 'werke') => ({ atlas, gestartet_am, atlas_eintraege })

  it('files the atlas’s growth under the day — and the first run — that counted it', () => {
    const rows = atlasEntries(
      [
        run('2026-09-28T11:23:45+00:00', 521),
        run('2026-09-29T06:09:16+00:00', 521),
        run('2026-09-29T11:03:48+00:00', 523),
        run('2026-09-29T11:03:49+00:00', 523),
        run('2026-10-01T11:19:43+00:00', 523),
      ],
      names,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]).toMatchObject({
      date: '2026-09-29',
      time: '2026-09-29T11:03:48.000Z',
      title: 'Atlas of Data Art',
      kind: K.atlas,
      href: '/atlas',
      fact: S.facts.atlas({ count: '2', one: false }),
    })
  })

  it('states no growth for the scout’s first count, for a fall, or for the other atlas', () => {
    expect(atlasEntries([run('2026-07-25T10:00:00Z', 214)], names)).toEqual([])
    expect(atlasEntries([run('2026-08-01T10:00:00Z', 473), run('2026-08-02T10:00:00Z', 470)], names)).toEqual([])
    expect(atlasEntries([run('2026-08-01T10:00:00Z', 90, 'theorie'), run('2026-08-02T10:00:00Z', 98, 'theorie')], names)).toEqual([])
  })

  describe('the dataset register: one row per day it dates', () => {
    const source = (over: Partial<DatasetProbe> = {}): DatasetProbe => ({ geprueft: true, ...over })

    it('states the probe pass of its day, and what was added and what changed', () => {
      const rows = datasetEntries(
        [
          source({ probed_on: '2026-10-07', first_seen_on: null }),
          source({ probed_on: '2026-10-07', first_seen_on: '2026-10-07' }),
          source({ geprueft: false, probed_on: '2026-10-07', first_seen_on: null, reachability_changed_on: '2026-10-07' }),
          source({ geprueft: false, probed_on: '2026-10-07', first_seen_on: '2026-10-06', reachability_changed_on: '2026-10-06' }),
          // a template: never probed, so it is not among the checked
          source({ geprueft: false, probed_on: null, first_seen_on: null }),
        ],
        names,
      )
      expect(rows.map((r) => [r.date, r.fact])).toEqual([
        [
          '2026-10-07',
          S.facts.datasets({ checked: { count: '4', one: false, confirmed: '2' }, added: { count: '1', one: true }, changed: '1' }),
        ],
        ['2026-10-06', S.facts.datasets({ checked: null, added: { count: '1', one: true }, changed: '1' })],
      ])
      expect(rows[0]).toMatchObject({ house: 'catalogues', title: 'Dataset Register', kind: K.datasets, href: '/datasets', time: null, source: 'datasets' })
      expect(rows[0]!.fact).toBe('4 sources checked, 2 with access confirmed · 1 source added · 1 changed reachability')
    })

    it('is silent while the register dates nothing — no day is given to it', () => {
      expect(datasetEntries([source(), source({ geprueft: false })], names)).toEqual([])
      expect(datasetEntries([source({ probed_on: 'today', first_seen_on: '' })], names)).toEqual([])
    })
  })

  it('compares a day’s last count with the day before’s last, whatever happened between', () => {
    const rows = atlasEntries(
      [run('2026-07-25T10:00:00Z', 214), run('2026-07-26T09:00:00Z', 314), run('2026-07-26T10:00:00Z', 368)],
      names,
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]!.fact).toBe(S.facts.atlas({ count: '154', one: false }))
    expect(rows[0]!.time).toBe('2026-07-26T10:00:00.000Z')
  })
})

describe('the ecology: the cycle’s turn and the practices’ presentations', () => {
  const cycle = (over: Partial<CycleState> = {}): CycleState => ({
    cycle: 4,
    phase: 'working',
    question: 'Missing Data Art, read through human extinction',
    source: 'continuing',
    opened: '2026-10-03',
    sessionsPerPractice: '3-5',
    defaults: { atelier: 'a', field: 'f', studio: 's' },
    ...over,
  })

  it('files the running cycle under the day it opened, with the question it carries', () => {
    const E = NAMING.frontDoor.ecologyLive
    expect(cycleEntries(cycle(), names)).toEqual([
      {
        date: '2026-10-03',
        time: null,
        source: 'cycle',
        house: 'ecology',
        houseName: names.ecology,
        title: S.facts.cycleOpened(E.cycleLabel(4)),
        fact: E.question('Missing Data Art, read through human extinction'),
        kind: K.turn,
        href: '/ecology',
        withdrawn: false,
        voice: null,
        seq: 40,
      },
    ])
  })

  it('says “the default themes” for a cycle without a question of its own', () => {
    expect(cycleEntries(cycle({ source: 'defaults', question: null }), names)[0]!.fact).toBe(NAMING.frontDoor.ecologyLive.defaultThemes)
  })

  it('states no turn without a dated opening', () => {
    expect(cycleEntries(null, names)).toEqual([])
    expect(cycleEntries(cycle({ opened: 'soon' }), names)).toEqual([])
  })

  it('files a presentation under its own day, in its practice’s colour, and leaves an undated one off', () => {
    const list: PresentationEntry[] = [
      { cycle: 3, practice: 'studio', href: '/studio/presentations/cycle-003/', files: 4, date: '2026-09-13', title: 'POINT AT ONE' },
      { cycle: 3, practice: 'field', href: '/field/presentations/cycle-003/', files: 4, date: null, title: 'Undated' },
      { cycle: 2, practice: 'atelier', href: '/atelier/presentations/cycle-002/', files: 2, date: '2026-09-07' },
    ]
    const rows = presentationEntries(list, names)
    expect(rows.map((r) => [r.date, r.title, r.voice, r.kind])).toEqual([
      ['2026-09-13', 'POINT AT ONE', 'ensemble', K.presentation],
      ['2026-09-07', S.facts.presentation(NAMING.frontDoor.ecologyLive.cycleLabel(2)), 'ulysses', K.presentation],
    ])
  })
})

describe('the ecology: the convening between two cycles (2026-10-08)', () => {
  const WON = 'What the archive refuses to count'
  const inConvening = (objected: string | null = null, over: Partial<CycleState> = {}): CycleState => ({
    cycle: 6,
    phase: 'convening',
    question: 'Missing Data Art, read through human extinction by AI',
    source: 'continuing',
    opened: '2026-10-07',
    sessionsPerPractice: '3-5',
    defaults: { atelier: 'a', field: 'f', studio: 's' },
    continuing: { question: 'Missing Data Art', since: '2026-10-03' },
    convening: { afterCycle: 6, opened: '2026-10-10', objected },
    ...over,
  })
  const next = (source: CycleState['source'], question: string, opened = '2026-10-13'): CycleState => ({
    ...inConvening(),
    cycle: 7,
    phase: 'working',
    question,
    source,
    opened,
    convening: null,
  })
  const relay = (talliedOn: string | null = '2026-10-12'): RelayConvening => ({
    afterCycle: 6,
    opened: '2026-10-10',
    proposals: [],
    rankings: [],
    result: talliedOn ? { question: WON, proposedBy: 'studio', scores: { studio: 5, field: 3, atelier: 1 }, talliedOn, rule: 'borda' } : null,
    skipped: 0,
  })
  const E = NAMING.frontDoor.ecologyLive
  const result = (fate: Parameters<typeof S.facts.conveningResult>[0]['fate']) =>
    S.facts.conveningResult({ question: E.question(WON), next: E.cycleLabel(7), fate })

  it('files the convening under the day cycle.json says it opened, as the ecology’s turn', () => {
    expect(conveningEntries(inConvening(), null, names)).toEqual([
      {
        date: '2026-10-10',
        time: null,
        source: 'cycle',
        house: 'ecology',
        houseName: names.ecology,
        title: 'convening after cycle 006 opened',
        fact: null,
        kind: K.turn,
        href: '/ecology#convening',
        withdrawn: false,
        voice: null,
        seq: 61,
      },
    ])
  })

  it('files the tally under the day the relay tallied it, with the winning question and the day it opens', () => {
    const rows = conveningEntries(inConvening(), relay(), names)
    expect(rows[1]).toEqual({
      date: '2026-10-12',
      time: null,
      source: 'cycle',
      house: 'ecology',
      houseName: names.ecology,
      title: 'convening after cycle 006 tallied',
      fact: `“${WON}” — opens cycle 007 on 2026-10-13 unless the architect objects`,
      kind: K.tally,
      href: '/ecology#convening',
      withdrawn: false,
      voice: null,
      seq: 62,
    })
  })

  it('says what became of the result as the record goes on: set aside, opened, or passed over', () => {
    const tally = (c: CycleState) => conveningEntries(c, relay(), names).find((r) => r.title.endsWith('tallied'))!
    expect(tally(inConvening('2026-10-12')).fact).toBe(result({ kind: 'set-aside', objected: '2026-10-12' }))
    expect(tally(inConvening('2026-10-12')).fact).toBe(`“${WON}” — set aside by the architect’s objection of 2026-10-12`)
    // once the next cycle opened, the convening is gone from cycle.json: the opened row goes with
    // it, the tally stays (the relay keeps it) and leads to the cycle panel, not a vanished anchor
    const onIt = conveningEntries(next('convening', WON), relay(), names)
    expect(onIt.map((r) => r.title)).toEqual(['convening after cycle 006 tallied'])
    expect(onIt[0]!.fact).toBe(`“${WON}” — opened cycle 007 on 2026-10-13`)
    expect(onIt[0]!.href).toBe('/ecology')
    expect(tally(next('continuing', 'Missing Data Art', '2026-10-17')).fact).toBe(
      `“${WON}” — cycle 007 opened on another question on 2026-10-17`,
    )
    // further on, the record no longer says: the question alone, nothing guessed
    expect(tally({ ...next('convening', WON), cycle: 8 }).fact).toBe(`“${WON}”`)
    // and without a continuing question no clock opens it, so no day is promised
    expect(tally(inConvening(null, { continuing: null })).fact).toBe(`“${WON}”`)
  })

  it('is an empty source without a convening or a result, and states no undated day', () => {
    expect(conveningEntries(null, null, names)).toEqual([])
    expect(conveningEntries(next('convening', WON), null, names)).toEqual([])
    expect(conveningEntries(next('convening', WON), relay(null), names)).toEqual([])
    expect(conveningEntries(inConvening(), relay(null), names).map((r) => r.title)).toEqual(['convening after cycle 006 opened'])
    expect(conveningEntries(inConvening(null, { convening: { afterCycle: 6, opened: 'soon', objected: null } }), null, names)).toEqual([])
  })

  it('stands newest first when the ecology turns twice in a day: the tally above the opening it followed', () => {
    const sameDay = conveningEntries(inConvening(null, { convening: { afterCycle: 6, opened: '2026-10-12', objected: null } }), relay(), names)
    const ordered = sortFeed([...cycleEntries(inConvening(null, { opened: '2026-10-12' }), names), ...sameDay])
    expect(ordered.map((r) => r.title)).toEqual(['convening after cycle 006 tallied', 'convening after cycle 006 opened', 'cycle 006 opened'])
  })
})

describe('the Middle’s relay: its load-bearing relations counted, and no row per handoff', () => {
  const ref = (repo: string) => ({ repo, path: 'BULLETIN.md', commit: 'abcdef1' })
  const relation = (id: string, date: string, kind: string, over: Record<string, unknown> = {}) => ({
    id,
    date,
    giver: 'atelier',
    taker: 'studio',
    kind,
    what: 'A line of the relay.',
    thread: null,
    giver_ref: ref('ulysses'),
    taker_ref: ref('studio'),
    ...over,
  })
  const handoff = (id: string, offered_on: string, status: string, over: Record<string, unknown> = {}) => ({
    id,
    offered_on,
    giver: 'atelier',
    to: ['studio'],
    offer: `The offer of ${id}.`,
    ref: ref('ulysses'),
    status,
    taken_by: null,
    ...over,
  })
  const relay = (relations: unknown[], handoffs: unknown[], to = '2026-10-05'): RelayState =>
    parseRelay({
      $contract: 'middle-relay/1',
      generated_at: `${to}T23:00:00Z`,
      cycle: 4,
      question: null,
      period: { from: '2026-09-07', to },
      relations,
      handoffs,
      counts: {},
    })

  it('counts a day’s built-on and answered relations in one row, and leaves the noted out', () => {
    const rows = relayEntries(
      relay(
        [
          relation('r1', '2026-10-04', 'built_on'),
          relation('r2', '2026-10-04', 'built_on'),
          relation('r3', '2026-10-04', 'answered'),
          relation('r4', '2026-10-04', 'noted'),
          relation('r5', '2026-10-03', 'noted'),
        ],
        [],
      ),
      names,
    )
    expect(rows).toEqual([
      {
        date: '2026-10-04',
        time: null,
        source: 'relay',
        house: 'middle',
        houseName: names.middle,
        title: 'The relay',
        fact: S.facts.relations({ count: '3', one: false, builtOn: '2', answered: '1' }),
        kind: K.relay,
        href: '/encounters#relay',
        withdrawn: false,
        voice: null,
      },
    ])
    expect(rows[0]!.fact).toBe('3 load-bearing relations (2 built on, 1 answered)')
  })

  it('takes the newest relation of a corrects chain, as the contract tells its readers to', () => {
    const rows = relayEntries(
      relay(
        [
          relation('r1', '2026-10-02', 'built_on'),
          // the relay corrects r1 on the 4th: it was a note, not a use
          relation('r2', '2026-10-04', 'noted', { corrects: 'r1' }),
          // a `corrects` in the relay's own words names no relation, and supersedes nothing
          relation('r3', '2026-10-03', 'answered', { corrects: 'the Field’s refusal rate' }),
        ],
        [],
      ),
      names,
    )
    expect(rows.map((r) => [r.date, r.fact])).toEqual([['2026-10-03', S.facts.relations({ count: '1', one: true, builtOn: null, answered: '1' })]])
  })

  it('gives a handoff no row of its own — /encounters draws those, the stream counts relations', () => {
    const rows = relayEntries(
      relay(
        [relation('r1', '2026-10-04', 'built_on')],
        [
          handoff('h-open', '2026-10-02', 'open', { to: ['studio', 'field'] }),
          handoff('h-taken', '2026-09-30', 'taken', { taken_by: { practice: 'studio', date: '2026-10-03', relation: 'r9' } }),
          handoff('h-declined', '2026-10-01', 'declined', {
            giver: 'field',
            to: ['atelier'],
            declined_by: { practice: 'atelier', date: '2026-10-04', relation: 'r8' },
          }),
          // offered 21 days before the 3rd: it lapsed on the 3rd, and that is no row either
          handoff('h-lapsed', '2026-09-12', 'lapsed'),
        ],
      ),
      names,
    )
    expect(rows.map((r) => [r.date, r.source, r.href])).toEqual([['2026-10-04', 'relay', '/encounters#relay']])
  })

  it('is an empty source while the relay is absent or unreadable', () => {
    expect(relayEntries(null, names)).toEqual([])
    expect(relayEntries({ status: 'absent' }, names)).toEqual([])
    expect(relayEntries({ status: 'invalid', reason: 'not a JSON object' }, names)).toEqual([])
    expect(relayEntries(parseRelay({ $contract: 'middle-relay/2', relations: [], handoffs: [] }), names)).toEqual([])
  })
})

describe('n-1’s nights and Arch’s sessions', () => {
  it('files each night under the day its heading names', () => {
    const rows = n1NightEntries(
      [
        { record: 68, date: '2026-10-04', title: 'Night 42 — project 2, session 4: declared, modest, closed' },
        { record: 1, date: 'undated', title: 'A founder note' },
      ],
      names,
    )
    expect(rows).toEqual([
      expect.objectContaining({ date: '2026-10-04', house: 'n-1', kind: K['n1-night'], href: '/n-1/record.html', source: 'n1-night' }),
    ])
  })

  it('leads a night to the page it built, and to the record where it built none — in the night’s own words either way', () => {
    const rows = n1NightEntries(
      [
        { record: 77, date: '2026-10-08', title: 'Night 51 — project 5, session 3: the rise is transit’s; put back', built: null },
        { record: 78, date: '2026-10-09', title: 'Night 52 — project 6, session 1: the order of admission', built: '/n-1/projects/unicode-admission/' },
        {
          record: 79,
          date: '2026-10-10',
          title: 'Night 53 — project 6, session 2: when a language is complete',
          built: '/n-1/projects/unicode-admission/languages.html',
        },
      ],
      names,
    )
    expect(rows.map((r) => r.href)).toEqual([
      '/n-1/record.html',
      '/n-1/projects/unicode-admission/',
      '/n-1/projects/unicode-admission/languages.html',
    ])
    // the row keeps the night's heading: the link changes, the wording does not
    expect(rows[2]).toMatchObject({ title: 'Night 53 — project 6, session 2: when a language is complete', kind: K['n1-night'], seq: 79 })
  })

  it('carries each night’s record number, so a day of several nights stands newest first', () => {
    const rows = n1NightEntries(
      [45, 46, 47, 48, 49].map((night, i) => ({ record: 71 + i, date: '2026-10-07', title: `Night ${night} — the day of five` })),
      names,
    )
    expect(rows.map((r) => r.seq)).toEqual([71, 72, 73, 74, 75])
  })

  it('files each Arch session under the day its file is named for, at its own reading page', () => {
    const facts = {
      protocols: [{ date: '2026-09-21', session: 34, title: 'Session 34 — the window closed', path: 'record/2026-09-21-session-34.md' }],
    } as unknown as ArchFacts
    expect(archSessionEntries(facts, names)).toEqual([
      expect.objectContaining({
        date: '2026-09-21',
        title: 'Session 34 — the window closed',
        href: '/arch/read/record/2026-09-21-session-34',
        kind: K['arch-session'],
        house: 'arch',
      }),
    ])
    expect(archSessionEntries(null, names)).toEqual([])
  })
})
