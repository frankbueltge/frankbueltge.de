// src/lib/ops/live-sources.ts — the signal log's LIVE sources (Frank's decision of 2026-10-05,
// wording private): everything in the house that changes daily and can be dated by its own
// record, each turned into rows of the one shape house-feed.ts defines.
//
//   the lab's instruments   one row per reading: every dated file of an archive, or the one
//                           snapshot an instrument keeps, with the reading of that day as its fact
//   Headroom's watch        the companies' reporting pages, checked — a probe, not a reading
//   Machine Attention       its stage moments, one row per day and project (a day of many is
//                           counted, a day of one is that moment), and its projects by `since`
//   the paper catalogue     one row per day: how many papers the practices last used that day
//   the atlas               one row per day its scout counted it larger than the day before
//   the ecology             the cycle's opening, and each practice's presentation
//   n-1 and Arch            n-1's nights and Arch's session protocols — what each lands daily
//
// High-volume sources are COUNTED, one row per source and day, so twenty rows show the breadth of
// the house instead of one catalogue's flood. Every function here is pure: it takes the parsed
// record and returns rows. Reading the files is live-feed.ts's job, so each reader is tested
// against fixtures, not against whatever the pipelines committed last night.

import { NAMING } from '@/config/naming'
import type { Werk } from '@/data/werke'
import type { ArchFacts } from '@/lib/arch/facts'
import { readMoments, type StageMoment } from '@/lib/attention/moments'
import type { CycleState, PresentationEntry } from '@/lib/ecology/v3'
import { count, READOUTS } from '@/lib/experiments/readouts'
import type { N1Night } from '@/lib/n1/works'
import { houseNames, instantOn, PRACTICE, werkTitle, type FeedEntry, type HouseNames } from './house-feed'

const DAY = /^\d{4}-\d{2}-\d{2}$/
const S = NAMING.opsRoom.signal
const K = S.kindLabels
const F = S.facts

type Rec = Record<string, unknown>
const obj = (v: unknown): Rec | null => (v !== null && typeof v === 'object' && !Array.isArray(v) ? (v as Rec) : null)
const str = (v: unknown): string | null => (typeof v === 'string' && v.trim().length > 0 ? v : null)
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const list = (v: unknown): unknown[] | null => (Array.isArray(v) ? v : null)
const field = (v: unknown, key: string): unknown => obj(v)?.[key]

/** An instant with a time of day, normalised to ISO UTC — or null. Its day is where it files. */
function instant(stamp: unknown): string | null {
  const s = str(stamp)
  if (!s || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/.test(s)) return null
  const ms = Date.parse(s)
  return Number.isFinite(ms) ? new Date(ms).toISOString() : null
}

// ── the lab's instruments ──────────────────────────────────────────────────────────────────

/** One committed record of an instrument, and the day its archive file is named for, if any. */
export interface InstrumentRecord {
  record: unknown
  /** the YYYY-MM-DD of an archive file's name — null for a snapshot that keeps no archive */
  fileDate: string | null
}

interface InstrumentSpec {
  /** the werke.ts id: the row's title and address come from the shelf, never from here */
  werk: string
  /** the reading's one fact, from the record — the gallery's composer wherever it reads the same file */
  fact: (record: unknown) => string | null
  /** the noun, and the source rank that goes with it */
  kind: 'reading' | 'probe'
  /** where one day's reading lives, for the instruments that publish a page per day */
  dayHref?: (date: string) => string
}

/** Headroom's watch: how many reporting pages it checked and how many did not answer — the page's
 *  own "reporting status" line (SpielraumPage.astro), as a count. */
function headroomFact(record: unknown): string | null {
  const sources = Object.values(obj(field(record, 'sources')) ?? {}).map(obj).filter((s): s is Rec => s !== null)
  if (sources.length === 0) return null
  const unreachable = sources.filter((s) => s.status !== 'ok').length
  return F.headroom({ pages: count(sources.length), unreachable: unreachable > 0 ? count(unreachable) : null })
}

/** All Along the Watchtower's nightly orbital data: the satellites it carries. */
function watchtowerFact(record: unknown): string | null {
  const satellites = list(field(record, 'satellites'))
  return satellites && satellites.length > 0 ? F.watchtower(count(satellites.length)) : null
}

/**
 * The instruments the log reads, keyed by the id their records are loaded under. The globe draws
 * other instruments' records and keeps none of its own; Society's room is a fixed layout; Spread is
 * unarchived and commits nothing; Admissions asks weekly and changes when a keeper publishes, about
 * once a year — none of them has a dated record of its own to read a live update from.
 */
export const INSTRUMENTS = {
  protokoll: { werk: 'protokoll', fact: READOUTS.protokoll, kind: 'reading', dayHref: (d: string) => `/protocol/${d}/` },
  trending: { werk: 'trending', fact: READOUTS.trending, kind: 'reading', dayHref: (d: string) => `/trending/${d}/` },
  consensus: { werk: 'consensus', fact: READOUTS.consensus, kind: 'reading' },
  'invoked-past': { werk: 'invoked-past', fact: READOUTS['invoked-past'], kind: 'reading' },
  balance: { werk: 'balance', fact: READOUTS.balance, kind: 'reading' },
  'ghost-fleet': { werk: 'ghost-fleet', fact: READOUTS['ghost-fleet'], kind: 'reading' },
  redaction: { werk: 'redaction', fact: READOUTS.redaction, kind: 'reading' },
  'round-number': { werk: 'round-number', fact: READOUTS['round-number'], kind: 'reading' },
  beifang: { werk: 'beifang', fact: READOUTS.beifang, kind: 'reading' },
  pattern: { werk: 'pattern', fact: READOUTS.pattern, kind: 'reading' },
  tell: { werk: 'tell', fact: READOUTS.tell, kind: 'reading' },
  correction: { werk: 'correction', fact: READOUTS.correction, kind: 'reading' },
  praemie: { werk: 'praemie', fact: READOUTS.praemie, kind: 'reading' },
  parallaxe: { werk: 'parallaxe', fact: READOUTS.parallaxe, kind: 'reading' },
  ueberflug: { werk: 'ueberflug', fact: watchtowerFact, kind: 'reading' },
  spielraum: { werk: 'spielraum', fact: headroomFact, kind: 'probe' },
} satisfies Record<string, InstrumentSpec>

export type InstrumentId = keyof typeof INSTRUMENTS
export type InstrumentRecords = Partial<Record<InstrumentId, readonly InstrumentRecord[]>>

/** The day a record belongs to: its own `date`, else the day its archive file is named for, else
 *  the day its `generated_at` names — never the day of the build. */
export function recordDay(record: unknown, fileDate: string | null = null): string | null {
  const own = str(field(record, 'date'))
  if (own && DAY.test(own)) return own
  if (fileDate && DAY.test(fileDate)) return fileDate
  return instant(field(record, 'generated_at'))?.slice(0, 10) ?? null
}

/**
 * One row per reading. An instrument the shelf does not carry has no name to show and drops out;
 * a record that names no day drops out; and an archive that holds two records for one day (it
 * should not) shows the later one, so a day is never read twice.
 */
export function readingEntries(records: InstrumentRecords, werke: readonly Werk[], names: HouseNames = houseNames()): FeedEntry[] {
  const shelf = new Map(werke.map((w) => [w.id, w]))
  const rows = new Map<string, FeedEntry>()
  for (const [id, spec] of Object.entries(INSTRUMENTS) as [InstrumentId, InstrumentSpec][]) {
    const werk = shelf.get(spec.werk)
    if (!werk) continue
    for (const { record, fileDate } of records[id] ?? []) {
      const date = recordDay(record, fileDate)
      if (!date) continue
      const row: FeedEntry = {
        date,
        time: instantOn(date, field(record, 'generated_at')),
        source: spec.kind,
        house: 'lab',
        houseName: names.lab,
        title: werkTitle(werk),
        fact: spec.fact(record),
        kind: K[spec.kind],
        href: spec.dayHref?.(date) ?? werk.href,
        withdrawn: false,
        voice: null,
      }
      const key = `${id}|${date}`
      const held = rows.get(key)
      if (!held || (row.time ?? '') > (held.time ?? '')) rows.set(key, row)
    }
  }
  return [...rows.values()]
}

// ── Machine Attention ──────────────────────────────────────────────────────────────────────

interface AttentionProject {
  id: string
  title: string
  since: string
  site_route: string | null
}

/** The projects of the mirrored export, behind its contract — an unknown version is refused, the
 *  way the stage itself refuses it, rather than read on a guess. */
function exportProjects(exportFile: unknown): AttentionProject[] {
  if (field(exportFile, '$contract') !== 'attention-export/1') return []
  return (list(field(exportFile, 'projects')) ?? []).flatMap((p): AttentionProject[] => {
    const id = str(field(p, 'id'))
    const title = str(field(p, 'title'))
    const since = str(field(p, 'since'))
    if (!id || !title || !since || !DAY.test(since)) return []
    return [{ id, title, since, site_route: str(field(p, 'site_route')) }]
  })
}

/** The stage's own address: where every moment of the practice is offered. */
const STAGE = '/machine-attention'

/**
 * The stage's moments, one row per day and project. A day that holds one moment IS that moment —
 * its subject, its statement, its door. A day that holds more is counted, in one row that leads to
 * the stage: the mirrored file held ninety-nine of the Foreknown's for 2026-10-03, and ninety-nine
 * rows would have been the whole log. The file holds a window of the newest moments (the producer
 * keeps a fixed number), so the window's OLDEST day may have been cut at its edge: that day's count
 * says "at least", which is true however many the window dropped.
 */
export function momentEntries(momentsFile: unknown, exportFile: unknown, names: HouseNames = houseNames()): FeedEntry[] {
  const moments = readMoments(momentsFile)
    .map((m) => ({ m, at: instant(m.occurred_at) }))
    .filter((x): x is { m: StageMoment; at: string } => x.at !== null)
  if (moments.length === 0) return []
  const titles = new Map(exportProjects(exportFile).map((p) => [p.id, p.title]))
  const edge = moments.reduce((oldest, x) => (x.at < oldest ? x.at : oldest), moments[0]!.at).slice(0, 10)

  const groups = new Map<string, { m: StageMoment; at: string }[]>()
  for (const x of moments) {
    const key = `${x.at.slice(0, 10)}|${x.m.project}`
    groups.set(key, [...(groups.get(key) ?? []), x])
  }

  return [...groups.entries()].map(([key, group]): FeedEntry => {
    const date = key.slice(0, 10)
    const newest = group.reduce((a, b) => (b.at > a.at ? b : a))
    const base = { date, time: newest.at, house: 'attention' as const, houseName: names.attention, withdrawn: false, voice: null }
    if (group.length === 1) {
      const { m } = group[0]!
      return { ...base, source: 'moment', title: m.subject, fact: m.statement, kind: K.moment, href: m.enter }
    }
    const project = newest.m.project
    return {
      ...base,
      source: 'moment',
      title: titles.get(project) ?? project,
      fact: F.moments({ count: count(group.length), atLeast: date === edge }),
      kind: K.moments,
      href: STAGE,
    }
  })
}

/** Machine Attention's projects, each on the day it began — how a new candidate enters the log:
 *  the practice adds it to its export with the day it was taken up. */
export function projectEntries(exportFile: unknown, names: HouseNames = houseNames()): FeedEntry[] {
  return exportProjects(exportFile).map((p) => ({
    date: p.since,
    time: null,
    source: 'project' as const,
    house: 'attention' as const,
    houseName: names.attention,
    title: p.title,
    fact: null,
    kind: K.project,
    href: p.site_route ?? STAGE,
    withdrawn: false,
    voice: null,
  }))
}

// ── the catalogues ─────────────────────────────────────────────────────────────────────────

/** A catalogue's own name, from the catalogues block the entrance already renders. */
const catalogueName = (href: string): string | null => NAMING.catalogues.items.find((c) => c.href === href)?.name ?? null

/** The one field of a paper entry the log reads: the last day a practice used it. */
export interface PaperUse {
  zuletzt_gebraucht: string | null
}

/**
 * The paper catalogue, one row per day. The catalogue records no day a paper ENTERED it — the
 * scout rebuilds it nightly from what the practices cite — so "new papers per day" is not in the
 * record. What is: the last day each paper was used (`zuletzt_gebraucht`, "last used" on /papers).
 * The row counts the papers whose last use fell on that day, and says exactly that.
 */
export function paperEntries(papers: readonly PaperUse[], names: HouseNames = houseNames()): FeedEntry[] {
  const title = catalogueName('/papers')
  if (!title) return []
  const byDay = new Map<string, number>()
  for (const p of papers) {
    const d = p.zuletzt_gebraucht
    if (d && DAY.test(d)) byDay.set(d, (byDay.get(d) ?? 0) + 1)
  }
  return [...byDay.entries()].map(([date, n]) => ({
    date,
    time: null,
    source: 'papers' as const,
    house: 'catalogues' as const,
    houseName: names.catalogues,
    title,
    fact: F.papers({ count: count(n), one: n === 1 }),
    kind: K.papers,
    href: '/papers',
    withdrawn: false,
    voice: null,
  }))
}

/**
 * The atlas, one row per day it grew. Its works carry no admission date; what is dated is the
 * scout's count of the atlas at the start of every run (`atlas_eintraege` at `gestartet_am`, in
 * pipelines/atlas-scout/kandidaten/werke/). A day whose last count stands above the previous day's
 * last count grew by the difference, and the row is filed under the day — and at the first run —
 * that counted it. The scout's first run is a baseline, not growth, and a count that fell states
 * nothing here.
 */
export function atlasEntries(runs: readonly unknown[], names: HouseNames = houseNames()): FeedEntry[] {
  const title = catalogueName('/atlas')
  if (!title) return []
  const counted = runs
    .filter((r) => field(r, 'atlas') === 'werke')
    .map((r) => ({ at: instant(field(r, 'gestartet_am')), n: num(field(r, 'atlas_eintraege')) }))
    .filter((r): r is { at: string; n: number } => r.at !== null && r.n !== null)
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0))
  // the count each day ended on — the runs are in time order, so the last one of a day wins
  const endOf = new Map<string, number>()
  for (const r of counted) endOf.set(r.at.slice(0, 10), r.n)

  const rows: FeedEntry[] = []
  let before: number | null = null
  for (const [date, end] of endOf) {
    if (before !== null && end > before) {
      const grown = end - before
      const first = counted.find((r) => r.at.slice(0, 10) === date && r.n === end)!
      rows.push({
        date,
        time: first.at,
        source: 'atlas',
        house: 'catalogues',
        houseName: names.catalogues,
        title,
        fact: F.atlas({ count: count(grown), one: grown === 1 }),
        kind: K.atlas,
        href: '/atlas',
        withdrawn: false,
        voice: null,
      })
    }
    before = end
  }
  return rows
}

// ── the ecology ────────────────────────────────────────────────────────────────────────────

/**
 * The ecology's cycle turn: the day the running cycle opened, with the question it carries. Only
 * the running cycle is in the committed state (cycle.json is rewritten at every turn, and earlier
 * turns live in its history), so the log shows that one turn — a silent past, not a guessed one.
 * The house lane is grey by declaration (the conductor is not a fourth practice), so the row
 * wears no voice.
 */
export function cycleEntries(cycle: CycleState | null, names: HouseNames = houseNames()): FeedEntry[] {
  if (!cycle || !DAY.test(cycle.opened)) return []
  const E = NAMING.frontDoor.ecologyLive
  return [
    {
      date: cycle.opened,
      time: null,
      source: 'cycle',
      house: 'ecology',
      houseName: names.ecology,
      title: F.cycleOpened(E.cycleLabel(cycle.cycle)),
      fact: cycle.source !== 'defaults' && cycle.question ? E.question(cycle.question) : E.defaultThemes,
      kind: K.turn,
      href: '/ecology',
      withdrawn: false,
      voice: null,
    },
  ]
}

/** Each practice's presentation of a cycle, on the day its own summary names — a presentation
 *  whose summary names none is listed on /ecology and left off this dated log. */
export function presentationEntries(presentations: readonly PresentationEntry[], names: HouseNames = houseNames()): FeedEntry[] {
  const E = NAMING.frontDoor.ecologyLive
  return presentations.flatMap((p) =>
    p.date && DAY.test(p.date)
      ? [
          {
            date: p.date,
            time: null,
            source: 'presentation' as const,
            house: p.practice,
            houseName: names[p.practice],
            title: p.title ?? F.presentation(E.cycleLabel(p.cycle)),
            fact: null,
            kind: K.presentation,
            href: p.href,
            withdrawn: false,
            voice: PRACTICE[p.practice].voice,
          },
        ]
      : [],
  )
}

// ── n-1 and Arch ───────────────────────────────────────────────────────────────────────────

/** n-1's nights, each on the day its own heading names. The record has no page per night; the
 *  board's row leads to the record, and so does this. */
export function n1NightEntries(nights: readonly N1Night[], names: HouseNames = houseNames()): FeedEntry[] {
  return nights
    .filter((n) => DAY.test(n.date))
    .map((n) => ({
      date: n.date,
      time: null,
      source: 'n1-night' as const,
      house: 'n-1' as const,
      houseName: names['n-1'],
      title: n.title,
      fact: null,
      kind: K['n1-night'],
      href: '/n-1/record.html',
      withdrawn: false,
      voice: null,
    }))
}

/** Arch's session protocols, on the day each file is named for — the practice's own dating. */
export function archSessionEntries(facts: ArchFacts | null, names: HouseNames = houseNames()): FeedEntry[] {
  return (facts?.protocols ?? []).map((p) => ({
    date: p.date,
    time: null,
    source: 'arch-session' as const,
    house: 'arch' as const,
    houseName: names.arch,
    title: p.title,
    fact: null,
    kind: K['arch-session'],
    href: `/arch/read/${p.path.replace(/\.md$/, '')}`,
    withdrawn: false,
    voice: null,
  }))
}
