// The signal log against the real record — not only the fixtures. What the entrance shows on any
// given night depends on what the pipelines committed, so these tests assert what must hold on
// every night: every source speaks, the top twenty are the newest twenty and span the house, a
// reading in the log says what the experiment's own card says, and nothing depends on the clock.
import consensusLatest from '@/data/consensus/latest.json'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { NAMING } from '@/config/naming'
import { WERKE } from '@/data/werke'
import { loadArtifacts } from '@/lib/ecology/v3'
import { READOUTS, type ReadoutId } from '@/lib/experiments/readouts'
import { FEED_DEPTH, FEED_TOP, SOURCE_ORDER, topOf, type SourceId } from './house-feed'
import { buildFeed, buildHouseFeed, loadFeedInput, readArchive } from './live-feed'

const real = buildHouseFeed()

describe('the stream reads the whole house', () => {
  it('hears from every source it reads', () => {
    const sources = new Set(real.map((e) => e.source))
    for (const s of SOURCE_ORDER) expect(sources.has(s), `${s} contributes nothing to the signal log`).toBe(true)
  })

  it('carries the ecology, the lab, Machine Attention, the catalogues and the houses beside them', () => {
    const houses = new Set(real.map((e) => e.house))
    for (const h of ['atelier', 'field', 'studio', 'nightly-line', 'arch', 'n-1', 'lab', 'attention', 'ecology', 'catalogues'] as const) {
      expect(houses.has(h), `${h} contributes nothing`).toBe(true)
    }
  })

  it('completes every row from its record', () => {
    for (const e of real) {
      expect(e.date, e.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      if (e.time) expect(e.time.slice(0, 10), e.title).toBe(e.date)
      expect(e.title.length, e.href).toBeGreaterThan(0)
      expect(e.href, e.title).toMatch(/^(\/|https?:)/)
      expect(e.kind.length, e.title).toBeGreaterThan(0)
      expect(e.houseName.length, e.title).toBeGreaterThan(0)
      if (e.fact !== null) expect(e.fact.length, e.title).toBeGreaterThan(0)
    }
  })

  it('carries one row per thing per day', () => {
    const keys = real.map((e) => `${e.source}|${e.house}|${e.href}|${e.title}|${e.date}`)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('lists every lab experiment and instrument /experiments renders, on its shelf day', () => {
    const shelf = real.filter((e) => e.source === 'shelf')
    expect(shelf).toHaveLength(WERKE.filter((w) => w.line).length)
  })

  it('carries the practices’ cycle artifacts, so the Atelier’s newest row is not a work of July', () => {
    for (const practice of ['atelier', 'field'] as const) {
      const shipped = loadArtifacts().filter((a) => a.practice === practice && !a.fromWorksRegister && a.date)
      expect(shipped.length, `${practice} has committed no dated cycle artifact`).toBeGreaterThan(0)
      const rows = real.filter((e) => e.house === practice && e.source === 'artifact')
      expect(rows).toHaveLength(shipped.length)
      const newest = shipped.map((a) => a.date!).sort().at(-1)!
      expect(real.find((e) => e.house === practice)!.date >= newest).toBe(true)
    }
  })
})

describe('the entrance’s twenty', () => {
  const top = topOf(real, FEED_TOP)

  it('are the twenty newest, in the stream’s own order', () => {
    expect(top).toHaveLength(FEED_TOP)
    expect(top).toEqual(real.slice(0, FEED_TOP))
    const dates = top.map((e) => e.date)
    expect(dates).toEqual([...dates].sort().reverse())
  })

  it('show the breadth of the house, not one source’s flood', () => {
    const sources = new Set(top.map((e) => e.source))
    const houses = new Set(top.map((e) => e.house))
    expect(sources.size, [...sources].join(', ')).toBeGreaterThanOrEqual(4)
    expect(houses.size, [...houses].join(', ')).toBeGreaterThanOrEqual(4)
    // a counted source is one row a day: no catalogue or stage fills the entrance on its own
    for (const counted of ['papers', 'atlas'] as SourceId[]) {
      const days = top.filter((e) => e.source === counted).map((e) => e.date)
      expect(new Set(days).size, counted).toBe(days.length)
    }
  })

  it('leave the longer log to /now, which reaches further back', () => {
    expect(real.length).toBeGreaterThan(FEED_DEPTH)
    expect(topOf(real, FEED_DEPTH)).toHaveLength(FEED_DEPTH)
  })
})

describe('a reading says what the experiment’s own card says', () => {
  // The card on /experiments reads each experiment's newest file through READOUTS
  // (thumbnails.test.ts holds that half); the log reads every file of the same archive with the
  // same composer. So the log's newest reading of an instrument must state exactly the readout of
  // that instrument's newest committed record — and the card and the log are one sentence.
  const SAME_RECORD: ReadoutId[] = [
    'protokoll',
    'beifang',
    'trending',
    'round-number',
    'tell',
    'redaction',
    'pattern',
    'praemie',
    'parallaxe',
    'consensus',
    'invoked-past',
    'balance',
    'correction',
    'ghost-fleet',
  ]

  it.each(SAME_RECORD)('%s', (id) => {
    const werk = WERKE.find((w) => w.id === id)!
    const title = typeof werk.title === 'string' ? werk.title : werk.title.en
    const newest = real.find((e) => e.source === 'reading' && e.title === title)
    expect(newest, `${id} has no reading in the log`).toBeDefined()
    const records = loadFeedInput().instruments[id] ?? []
    const record = [...records].sort((a, b) => (a.fileDate ?? '').localeCompare(b.fileDate ?? '')).at(-1)!.record
    expect(newest!.fact).toBe(READOUTS[id](record))
    expect(newest!.fact, `${id}: the newest record states no reading`).not.toBeNull()
  })

  it('files the newest reading under the day its latest record names', () => {
    const newest = real.find((e) => e.source === 'reading' && e.title === 'Consensus')!
    expect(newest.date).toBe(consensusLatest.date)
    expect(newest.time).toBe(new Date(consensusLatest.generated_at).toISOString())
  })
})

describe('nothing depends on the clock', () => {
  afterEach(() => vi.useRealTimers())

  it('builds the same stream in 2020 and in 2030 from the same record', () => {
    const input = loadFeedInput()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2020-01-01T00:00:00Z'))
    const then = buildFeed(input)
    vi.setSystemTime(new Date('2030-12-31T23:59:59Z'))
    const later = buildFeed(input)
    expect(later).toEqual(then)
    expect(then).toEqual(real)
  })

  it('reads an archive’s days and nothing else — not its latest copy, not its other records', () => {
    const days = readArchive('src/data/redaction')
    expect(days.length).toBeGreaterThan(0)
    for (const d of days) expect(d.fileDate).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // redaction keeps a second record under world/ — another instrument's file, not a day of this one
    expect(days.every((d) => (d.record as { date?: string }).date === d.fileDate)).toBe(true)
    expect(readArchive('src/data/does-not-exist')).toEqual([])
  })
})

describe('the wording on the pages', () => {
  it('heads the log with the kicker the room has always had', () => {
    expect(NAMING.opsRoom.signal.kicker).toBe('SIGNAL LOG')
  })
})
