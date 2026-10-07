import { describe, expect, it } from 'vitest'
import {
  archEntries,
  compareFeed,
  FEED_DEPTH,
  FEED_PAGE_SIZE,
  FEED_TOP,
  houseNames,
  instantOn,
  labEntries,
  n1Entries,
  paginate,
  registerEntries,
  sortFeed,
  SOURCE_ORDER,
  streamOf,
  topOf,
  windowOrdinal,
  type FeedEntry,
  type HouseId,
  type SourceId,
} from './house-feed'
import { buildFeed } from './live-feed'
import { NAMING } from '@/config/naming'
import type { Werk } from '@/data/werke'
import type { ArchFacts } from '@/lib/arch/facts'
import type { N1Work } from '@/lib/n1/works'
import type { LatestWork } from '@/lib/engines/latest'
import type { ArtifactEntry } from '@/lib/ecology/v3'
import { NIGHTLY_FORK_DIR } from '@/lib/engines/register'

const WORKS: LatestWork[] = [
  { ns: 'field', kind: 'astro', slug: 'b', title: 'A field instrument', date: '2026-08-05', href: '/field/werke/b', state: 'published' },
  { ns: 'atelier', kind: 'html', slug: 'a', title: 'An atelier work', date: '2026-08-01', href: '/atelier/werke-html/a/', state: 'published' },
  { ns: 'studio', kind: 'html', slug: 'c', title: 'A withdrawn premiere', date: '2026-07-30', href: '/studio/werke-html/c/', state: 'withdrawn' },
  { ns: 'atelier', kind: 'html', slug: 'n', title: 'A night in the fork', date: '2026-08-20', href: '/error-as-method/n/', state: 'published', dir: NIGHTLY_FORK_DIR },
]

const ARCH: ArchFacts = {
  founded: '2026-08-22',
  law: 'the Dowry',
  window: null,
  protocols: [],
  registers: [],
  reading: [],
  works: [
    { id: 'arrival', title: 'Arrival', instances: [], built: '2026-09-03' },
    { id: 'undated', title: 'A candidate with no build date', instances: [] },
  ],
}

const N1: N1Work[] = [
  { id: 'two-nights-deep', title: 'Two Nights Deep', date: '2026-08-25', href: '/n-1/works/two-nights-deep/' },
]

const LAB: Werk[] = [
  { id: 'x', line: 'ledger', title: 'A lab experiment', subtitle: { de: '', en: '' }, status: 'live', href: '/x', description: { de: '', en: '' }, since: '2026-08-10', tier: 'experiment' },
  { id: 'y', line: 'watchers', title: 'A lab instrument', subtitle: { de: '', en: '' }, status: 'live', href: '/y', description: { de: '', en: '' }, since: '2026-08-02', tier: 'instrument' },
  // a practice door: same array, not the lab's shelf — it carries no research line
  { id: 'door', title: 'A practice door', subtitle: { de: '', en: '' }, status: 'live', href: '/d', description: { de: '', en: '' }, since: '2026-09-02' },
]

const ARTIFACTS: ArtifactEntry[] = [
  { practice: 'atelier', slug: 'cycle-002-session-4', date: '2026-09-06', href: '/atelier/window/cycle-002-session-4/', cycle: 2, title: 'Dials', fromWorksRegister: false },
  { practice: 'field', slug: 'does-it-know', date: '2026-09-06', href: '/field/artifacts/cycle-002/2026-09-06-does-it-know/', cycle: 2, fromWorksRegister: false },
  // the Field's flat layout (since 2026-09-14): no cycle wrapper, so the path names no cycle —
  // but unlike a Studio work, it is not in the register anywhere else, and must still show
  { practice: 'field', slug: 'a-refusal-announces-itself', date: '2026-09-14', href: '/field/artifacts/2026-09-14-a-refusal-announces-itself/', cycle: null, fromWorksRegister: false },
  // a window whose journal names no day — dropped, never dated by the feed
  { practice: 'atelier', slug: 'cycle-002-session-1', date: null, href: '/atelier/window/cycle-002-session-1/', cycle: 2, title: 'An undated window', fromWorksRegister: false },
  // the Studio ships its artifact as a work; the register already carries it, so it names no cycle
  { practice: 'studio', slug: 'c', date: '2026-07-30', href: '/studio/werke-html/c/', cycle: null, title: 'A withdrawn premiere', fromWorksRegister: true },
]

const feed = () => buildFeed({ works: WORKS, arch: ARCH, n1: N1, werke: LAB, artifacts: ARTIFACTS })

/** A row with only what an ordering test needs to vary. */
const row = (over: Partial<FeedEntry>): FeedEntry => ({
  date: '2026-10-04',
  time: null,
  source: 'work',
  house: 'field',
  houseName: 'The Field',
  title: 'A row',
  fact: null,
  kind: 'work',
  href: '/a',
  withdrawn: false,
  voice: null,
  ...over,
})

describe('the signal log speaks for the whole house', () => {
  it('carries every house that lands dated work, not only the ecology’s three practices', () => {
    const houses = new Set(feed().map((e) => e.house))
    expect(houses).toEqual(new Set<HouseId>(['field', 'atelier', 'studio', 'nightly-line', 'arch', 'n-1', 'lab']))
  })

  it('is newest first, and the order does not move between builds', () => {
    const dates = feed().map((e) => e.date)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(feed().map((e) => e.title)).toEqual(feed().map((e) => e.title))
  })

  it('names the fork as its own house rather than as the Atelier it descends from', () => {
    const night = feed().find((e) => e.title === 'A night in the fork')!
    expect(night.house).toBe('nightly-line')
    expect(night.houseName).toBe(NAMING.overview.items.find((c) => c.id === 'nightly-line')!.title)
    // …while keeping the Atelier's colour: one practice, two addresses, three voices in the quartet.
    expect(night.voice).toBe('ulysses')
  })

  it('keeps a withdrawn work listed and marked — the record keeps every mark', () => {
    expect(feed().find((e) => e.title === 'A withdrawn premiere')!.withdrawn).toBe(true)
  })

  it('drops an entry whose record carries no date rather than dating it itself', () => {
    expect(feed().some((e) => e.title === 'A candidate with no build date')).toBe(false)
  })

  it('gives the house sources no time and no fact: a work is dated by its day, and is its own news', () => {
    for (const e of feed()) {
      expect(e.time, e.title).toBeNull()
      expect(e.fact, e.title).toBeNull()
    }
  })
})

describe('each house is named and counted by its own record', () => {
  it('takes the practices’ names from the doors and the others’ from their cards', () => {
    const names = houseNames()
    expect(names.atelier).toBe(NAMING.doors.items.find((d) => d.id === 'ulysses')!.name)
    expect(names.field).toBe(NAMING.doors.items.find((d) => d.id === 'meridian')!.name)
    expect(names.studio).toBe(NAMING.doors.items.find((d) => d.id === 'ensemble')!.name)
    expect(names.arch).toBe(NAMING.overview.items.find((c) => c.id === 'arch')!.title)
    expect(names['n-1']).toBe(NAMING.overview.items.find((c) => c.id === 'n-1')!.title)
    expect(names.attention).toBe(NAMING.overview.items.find((c) => c.id === 'attention')!.title)
    expect(names.ecology).toBe(NAMING.overview.items.find((c) => c.id === 'ecology')!.title)
  })

  it('uses each house’s own noun for what it makes', () => {
    const K = NAMING.opsRoom.signal.kindLabels
    const byTitle = new Map(feed().map((e) => [e.title, e.kind]))
    expect(byTitle.get('A field instrument')).toBe(K.field)
    expect(byTitle.get('An atelier work')).toBe(K.atelier)
    expect(byTitle.get('A withdrawn premiere')).toBe(K.studio)
    expect(byTitle.get('A night in the fork')).toBe(K['nightly-line'])
    expect(byTitle.get('Arrival')).toBe(K.arch)
    expect(byTitle.get('Two Nights Deep')).toBe(K['n-1'])
    expect(byTitle.get('A lab experiment')).toBe(K.experiment)
    expect(byTitle.get('A lab instrument')).toBe(K.instrument)
    expect(byTitle.get('Dials')).toBe(K.artifact)
  })

  it('lists the Field’s and the Atelier’s cycle artifacts under their own houses, in their own colour', () => {
    const rows = feed()
      .filter((e) => e.kind === NAMING.opsRoom.signal.kindLabels.artifact)
      .sort((a, b) => a.house.localeCompare(b.house) || b.date.localeCompare(a.date))
    expect(rows.map((e) => [e.house, e.title, e.date, e.href])).toEqual([
      ['atelier', 'Dials', '2026-09-06', '/atelier/window/cycle-002-session-4/'],
      ['field', 'a-refusal-announces-itself', '2026-09-14', '/field/artifacts/2026-09-14-a-refusal-announces-itself/'],
      ['field', 'does-it-know', '2026-09-06', '/field/artifacts/cycle-002/2026-09-06-does-it-know/'],
    ])
    expect(rows.map((e) => e.voice)).toEqual(['ulysses', 'meridian', 'meridian'])
  })

  it('keeps a Field artifact in the flat, unwrapped layout — it names no cycle, but it is not a work', () => {
    const r = feed().find((e) => e.href === '/field/artifacts/2026-09-14-a-refusal-announces-itself/')
    expect(r?.kind).toBe(NAMING.opsRoom.signal.kindLabels.artifact)
    expect(r?.date).toBe('2026-09-14')
  })

  it('leaves a work-shaped artifact to the register — one row, not two', () => {
    expect(feed().filter((e) => e.href === '/studio/werke-html/c/')).toHaveLength(1)
  })

  it('drops a window whose journal names no day rather than dating it itself', () => {
    expect(feed().some((e) => e.href === '/atelier/window/cycle-002-session-1/')).toBe(false)
  })

  it('takes only the lab’s own shelf from werke.ts — a practice door is not an experiment', () => {
    expect(labEntries(LAB).map((e) => e.title)).toEqual(['A lab experiment', 'A lab instrument'])
  })

  it('dates Arch by the day its current iteration was built, from the work’s own README', () => {
    expect(archEntries(ARCH)).toEqual([expect.objectContaining({ title: 'Arrival', date: '2026-09-03' })])
  })

  it('dates n-1 by the day its form says the work was laid down', () => {
    expect(n1Entries(N1)[0]).toMatchObject({ date: '2026-08-25', href: '/n-1/works/two-nights-deep/' })
  })

  it('gives no colour to a house outside the ecology quartet', () => {
    for (const e of feed()) {
      if (['arch', 'n-1', 'lab'].includes(e.house)) expect(e.voice, e.title).toBeNull()
    }
  })
})

describe('the order of one day (Frank, 2026-10-05: deterministic, and tested)', () => {
  it('reads a time only where the record names one on the row’s own day', () => {
    expect(instantOn('2026-10-04', '2026-10-04T11:51:18+00:00')).toBe('2026-10-04T11:51:18.000Z')
    expect(instantOn('2026-10-04', '2026-10-04T10:19:49Z')).toBe('2026-10-04T10:19:49.000Z')
    // a reading of the 4th written after midnight would be ordered among rows it does not belong to
    expect(instantOn('2026-10-04', '2026-10-05T00:12:00Z')).toBeNull()
    // a bare date is no time, however Date.parse reads it
    expect(instantOn('2026-10-04', '2026-10-04')).toBeNull()
    expect(instantOn('2026-10-04', 'not a time')).toBeNull()
    expect(instantOn('2026-10-04', undefined)).toBeNull()
  })

  it('puts the newest day first, whatever the time of the older day says', () => {
    const older = row({ date: '2026-10-03', time: '2026-10-03T23:59:00.000Z' })
    const newer = row({ date: '2026-10-04' })
    expect(sortFeed([older, newer])).toEqual([newer, older])
  })

  it('lets every source of a day speak once before any speaks twice', () => {
    // the night the request was made about: eleven readings, each naming its hour, and the
    // catalogues and a practice naming only their day — which used to stand below all eleven
    const readings = [...Array(11).keys()].map((i) =>
      row({ source: 'reading', house: 'lab', houseName: 'The Lab', title: `reading ${i}`, time: `2026-10-04T${10 + i}:00:00.000Z` }),
    )
    const papers = row({ source: 'papers', house: 'catalogues', houseName: 'Catalogues', title: 'Paper Catalogue' })
    const atlas = row({ source: 'atlas', house: 'catalogues', houseName: 'Catalogues', title: 'Atlas of Data Art' })
    const artifact = row({ source: 'artifact', house: 'atelier', houseName: 'The Atelier', title: 'An artifact' })
    const sorted = sortFeed([...readings, papers, atlas, artifact])
    // the first turn: the newest reading (it names its hour), then the untimed rows in source order
    expect(sorted.slice(0, 4).map((e) => e.title)).toEqual(['reading 10', 'An artifact', 'Paper Catalogue', 'Atlas of Data Art'])
    // every later turn belongs to the only source with rows left: the readings, newest first
    expect(sorted.slice(4).map((e) => e.title)).toEqual([...Array(10).keys()].map((i) => `reading ${9 - i}`))
  })

  it('stands one source’s rows newest first by the time they name, the untimed after', () => {
    const early = row({ source: 'moment', house: 'attention', title: 'early', time: '2026-10-04T08:00:00.000Z' })
    const late = row({ source: 'moment', house: 'attention', title: 'late', time: '2026-10-04T12:00:00.000Z' })
    const project = row({ source: 'project', house: 'attention', title: 'a project' })
    expect(sortFeed([project, early, late]).map((e) => e.title)).toEqual(['late', 'early', 'a project'])
  })

  it('within one turn, puts the rows that name a time first, the latest first', () => {
    const lab = row({ source: 'reading', house: 'lab', title: 'lab', time: '2026-10-04T08:00:00.000Z' })
    const stage = row({ source: 'moment', house: 'attention', title: 'stage', time: '2026-10-04T12:00:00.000Z' })
    const turn = row({ source: 'cycle', house: 'ecology', title: 'turn' })
    expect(sortFeed([turn, lab, stage]).map((e) => e.title)).toEqual(['stage', 'lab', 'turn'])
  })

  it('stands the untimed rows of one turn in the fixed source order', () => {
    // each row a house of its own, so each is a source of its own and all take the first turn —
    // all but Headroom's probe, which is one of the lab's readings and waits for the second
    const shuffled = [...SOURCE_ORDER].reverse().map((source) => row({ source, title: source, house: `h-${source}` as HouseId }))
    expect(sortFeed(shuffled).map((e) => e.source)).toEqual([...SOURCE_ORDER.filter((s) => s !== 'probe'), 'probe'])
  })

  it('counts a source as the request did: the lab’s readings one, each practice one, each catalogue one, the relay one', () => {
    const s = (source: SourceId, house: HouseId) => streamOf({ source, house })
    // the lab's readings, however many instruments read — Headroom's probe among them
    expect(s('reading', 'lab')).toBe(s('probe', 'lab'))
    // a practice is one source whatever it lands, and each practice its own
    expect(new Set([s('work', 'atelier'), s('artifact', 'atelier'), s('presentation', 'atelier')]).size).toBe(1)
    expect(new Set([s('artifact', 'atelier'), s('artifact', 'field'), s('work', 'studio')]).size).toBe(3)
    // Error as Method is one, though its works come out of the Atelier's register
    expect(s('work', 'nightly-line')).not.toBe(s('work', 'atelier'))
    // Machine Attention is one: its moments and its projects
    expect(s('moment', 'attention')).toBe(s('project', 'attention'))
    // papers, atlas and datasets are one each, though they share a house
    expect(new Set([s('papers', 'catalogues'), s('atlas', 'catalogues'), s('datasets', 'catalogues')]).size).toBe(3)
    // the relay is one, the Middle's own: not a practice's, not a catalogue's
    expect(new Set([s('relay', 'middle'), s('work', 'atelier'), s('papers', 'catalogues')]).size).toBe(3)
    // and an experiment arriving on the lab's shelf is not one more reading
    expect(s('shelf', 'lab')).not.toBe(s('reading', 'lab'))
  })

  it('never mixes days: a day’s last turn stands above the first of the day before', () => {
    const today = [...Array(3).keys()].map((i) =>
      row({ source: 'reading', house: 'lab', title: `r${i}`, time: `2026-10-04T0${i}:00:00.000Z` }),
    )
    const yesterday = row({ date: '2026-10-03', source: 'cycle', house: 'ecology', title: 'turn' })
    expect(sortFeed([yesterday, ...today]).at(-1)).toBe(yesterday)
  })

  it('gives one order however the rows arrive', () => {
    const rows = [
      ...feed(),
      row({ source: 'reading', house: 'lab', title: 'a', time: '2026-09-06T10:00:00.000Z', date: '2026-09-06' }),
      row({ source: 'reading', house: 'lab', title: 'b', time: '2026-09-06T11:00:00.000Z', date: '2026-09-06' }),
      row({ source: 'papers', house: 'catalogues', title: 'Paper Catalogue', date: '2026-09-06' }),
    ]
    const once = sortFeed(rows)
    expect(sortFeed([...rows].reverse())).toEqual(once)
    expect(sortFeed([...rows.slice(5), ...rows.slice(0, 5)])).toEqual(once)
  })

  it('breaks the last ties by house, title and address — never by the input order', () => {
    const rows = [
      row({ houseName: 'The Studio', title: 'b' }),
      row({ houseName: 'The Atelier', title: 'b', href: '/z' }),
      row({ houseName: 'The Atelier', title: 'b', href: '/a' }),
      row({ houseName: 'The Atelier', title: 'a' }),
    ]
    const expected = [rows[3], rows[2], rows[1], rows[0]]
    expect(sortFeed(rows)).toEqual(expected)
    expect(sortFeed([...rows].reverse())).toEqual(expected)
  })

  // 2026-10-07: five sessions per practice in one day. Their records name the day, not the hour, so
  // a house's rows of that day stood in the order of their titles — and the entrance's twenty showed
  // n-1's nights 45 and 46 while 47 to 49, the newest, stood below the cut.
  it('stands a house’s untimed rows of one day by the record’s own number, newest first', () => {
    const nights = [45, 46, 47, 48, 49].map((n) =>
      row({ source: 'n1-night', house: 'n-1', houseName: 'n-1', title: `Night ${n}`, seq: 26 + n, href: '/n-1/record.html' }),
    )
    const papers = row({ source: 'papers', house: 'catalogues', houseName: 'Catalogues', title: 'Paper Catalogue' })
    const sorted = sortFeed([...nights, papers])
    // the first turn: n-1's newest night, then the catalogue; the older nights after
    expect(sorted.map((e) => e.title)).toEqual(['Night 49', 'Paper Catalogue', 'Night 48', 'Night 47', 'Night 46', 'Night 45'])
  })

  it('puts a house’s numbered rows before its unnumbered ones, and never orders two houses by number', () => {
    const numbered = row({ title: 'z numbered', seq: 1 })
    const unnumbered = row({ title: 'a unnumbered' })
    expect(sortFeed([unnumbered, numbered]).map((e) => e.title)).toEqual(['z numbered', 'a unnumbered'])
    // across houses the house decides, whatever the numbers say
    const atelier = row({ house: 'atelier', houseName: 'The Atelier', title: 'low', seq: 1 })
    const studio = row({ house: 'studio', houseName: 'The Studio', title: 'high', seq: 999 })
    expect([studio, atelier].sort(compareFeed).map((e) => e.title)).toEqual(['low', 'high'])
  })

  it('numbers the Atelier’s windows by cycle and session, and a work by the session its record names', () => {
    expect(windowOrdinal('cycle-005-session-2')).toBeGreaterThan(windowOrdinal('cycle-005-session-1')!)
    expect(windowOrdinal('cycle-005-session-1')).toBeGreaterThan(windowOrdinal('cycle-004-session-6')!)
    expect(windowOrdinal('cycle-001')).toBeNull()
    expect(windowOrdinal('2026-10-07-the-count-corrected')).toBeNull()
    const works = registerEntries([
      { ns: 'studio', kind: 'html', slug: 's', title: 'THE LOCKED SHELF', date: '2026-10-07', href: '/s', state: 'premiered', session: 158 },
      { ns: 'studio', kind: 'html', slug: 'u', title: 'THE UNSHOWN', date: '2026-10-07', href: '/u', state: 'premiered', session: 155 },
    ])
    expect(sortFeed(works).map((e) => e.title)).toEqual(['THE LOCKED SHELF', 'THE UNSHOWN'])
  })

  it('never calls two different rows equal', () => {
    const a = row({ title: 'same', href: '/one' })
    const b = row({ title: 'same', href: '/two' })
    expect(compareFeed(a, b)).not.toBe(0)
    expect(Math.sign(compareFeed(a, b))).toBe(-Math.sign(compareFeed(b, a)))
  })

  it('drops a row whose date is not a day', () => {
    expect(sortFeed([row({ date: '' }), row({ date: 'today' }), row({})])).toHaveLength(1)
  })
})

describe('the cuts', () => {
  it('shows the newest twenty on the entrance, and pages the longer log seven at a time', () => {
    expect(FEED_TOP).toBe(20)
    expect(FEED_PAGE_SIZE).toBe(7)
    expect(FEED_DEPTH).toBeGreaterThan(FEED_TOP)
    expect(FEED_DEPTH % FEED_PAGE_SIZE).toBe(0)
  })

  it('cuts without re-ordering, and never past what there is', () => {
    const entries = [...Array(30).keys()]
    expect(topOf(entries)).toEqual(entries.slice(0, FEED_TOP))
    expect(topOf(entries, 5)).toEqual([0, 1, 2, 3, 4])
    expect(topOf(entries.slice(0, 3))).toEqual([0, 1, 2])
    expect(topOf(entries, -1)).toEqual([])
  })

  it('pages: seven, seven, and the rest', () => {
    const pages = paginate([...Array(17).keys()])
    expect(pages.map((p) => p.length)).toEqual([7, 7, 3])
  })

  it('offers no pages at all over an empty feed', () => {
    expect(paginate([])).toEqual([])
  })

  it('loses nothing and reorders nothing', () => {
    const entries = feed()
    expect(paginate(entries).flat()).toEqual(entries)
  })

  it('makes the entrance’s twenty one page, so it carries no pager', () => {
    expect(paginate([...Array(FEED_TOP).keys()], FEED_TOP)).toHaveLength(1)
  })
})

describe('the wording', () => {
  it('carries no digits — the figures arrive as arguments', () => {
    const S = NAMING.opsRoom.signal
    // n-1 is a practice's name, not a figure; every other string here is wording
    const { 'n-1': _name, ...houses } = S.houseFallback
    const strings = [S.kicker, S.kickerSub, S.link.label, S.foot, ...Object.values(S.kindLabels), ...Object.values(houses)]
    for (const s of strings) expect(s, s).not.toMatch(/\d/)
  })

  it('says what the log now is: live updates, newest first — not only what landed', () => {
    expect(NAMING.opsRoom.signal.kickerSub).toMatch(/LIVE UPDATES/)
    expect(NAMING.opsRoom.signal.kickerSub).toMatch(/NEWEST FIRST/)
  })

  it('names one noun per kind of update', () => {
    const K = NAMING.opsRoom.signal.kindLabels
    expect([K.reading, K.probe, K.papers, K.atlas, K.moment, K.turn, K.presentation, K.relay, K.datasets]).toEqual([
      'reading',
      'probe',
      'papers',
      'works',
      'moment',
      'turn',
      'presentation',
      'relations',
      'sources',
    ])
  })
})

describe('the register on /ecology keeps its own, narrower claim', () => {
  it('does not fold Arch, n-1 or the lab into the three practices’ catalogue', () => {
    // registerEntries is the ONLY part of the feed the works register shares; it must speak for
    // the register's sources and nothing else, or the count on /ecology stops being checkable.
    const houses = new Set(registerEntries(WORKS).map((e) => e.house))
    expect(houses).toEqual(new Set<HouseId>(['field', 'atelier', 'studio', 'nightly-line']))
  })
})
