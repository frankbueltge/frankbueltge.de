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
import { houseNames } from './house-feed'
import {
  archSessionEntries,
  atlasEntries,
  cycleEntries,
  INSTRUMENTS,
  momentEntries,
  n1NightEntries,
  paperEntries,
  presentationEntries,
  projectEntries,
  readingEntries,
  recordDay,
} from './live-sources'

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
