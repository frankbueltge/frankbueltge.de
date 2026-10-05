// src/lib/ops/house-feed.ts — THE SIGNAL LOG's model: what one row is, whose house it belongs to,
// in which order rows stand, and where the log is cut.
//
// What changed on 2026-09-03 (Frank): the signal log used to read allWorks() and nothing else,
// so it showed the three ecology practices and — mislabelled as "The Atelier" — the nightly
// line's fork. Arch, n-1 and the lab's own experiments were invisible on it, although all three
// land dated work. A log headed "what landed last" that silently means "what landed last in
// three of the six places" is the kind of half-truth this site's own honesty line forbids.
//
// What changed on 2026-10-05 (Frank's decision, wording private): the log became the stream of
// the house's LIVE UPDATES — not only what the houses land, but everything that changes daily and
// can be dated by its own record. The lab's nightly readings, the ecology's cycle turn and
// presentations, Machine Attention's moments, n-1's nights, Arch's sessions, the paper catalogue
// and the atlas joined the works below — and, later that day, the Middle's relay and the dataset
// register; their readers are in live-sources.ts, the assembly from the committed record in
// live-feed.ts. The entrance shows the newest FEED_TOP rows, /now the newest FEED_DEPTH, paged.
//
// The house sources this module still reads itself, each from its OWN record, in its OWN noun:
//
//   the three practices   works · instruments · premieres, from their committed meta.json
//   their cycles          the artifacts each session leaves (ecology v3), from the practices'
//                         own artifact and window directories — the Field and the Atelier land
//                         these outside the works register, and until 2026-09-07 the log showed
//                         the Atelier's last work of July while it shipped an artifact a day
//   Error as Method       the fork's nights, split out of the same register by the directory
//                         they were mirrored from — same practice by descent, own address
//   Arch                  its work candidates, dated by the day the current iteration was built
//   n-1                   the works it has laid down, dated by their own form documents
//   the lab               the experiments and instruments on /experiments, dated by `since`
//
// Three rules every source keeps, learned from the derivations this module sits beside:
//
//   · NOTHING IS AUTHORED HERE. Every title, date, number and address comes from the record it
//     belongs to. The house NAMES come from NAMING (the doors and the overview cards), so a
//     reworded practice moves this feed with it and the log can never call a house something its
//     own door does not. Wording that wraps a figure is a function in NAMING taking that figure.
//   · A SILENT SOURCE IS A SHORTER FEED, NEVER A GUESS. A row whose record carries no date drops
//     out rather than appearing under today's — an undated row at the top of a log sorted by
//     date is a lie about what happened last. Nothing here reads the clock.
//   · THE ORDER IS THE RECORD'S, AND IT DOES NOT MOVE BETWEEN BUILDS. Newest day first. Within a
//     day the sources take turns (since the evening of 2026-10-05): every source's newest row of
//     the day comes before any source's second, so a night of a dozen readings cannot push the
//     catalogues or the relay off the entrance. Within one source, newest first by the time its
//     record names; within one turn, the rows whose records name a time first, then the fixed
//     order of SOURCE_ORDER, then house, title and address. See streamOf and sortFeed.
//
// The register on /ecology is deliberately NOT this: it stays the three practices' catalogue
// (src/lib/engines/register.ts, buildRegister), because that is what it claims to be — their
// works and, since 2026-10-04, their session artifacts, with the nightly line's works under the
// line's own name; Arch, n-1 and the lab stay off it. One house, two readings, each answering
// its own question.

import { NAMING } from '@/config/naming'
import type { Werk } from '@/data/werke'
import type { ArchFacts } from '@/lib/arch/facts'
import type { N1Work } from '@/lib/n1/works'
import type { LatestWork } from '@/lib/engines/latest'
import { isListedArtifact, NIGHTLY_FORK_DIR } from '@/lib/engines/register'
import type { ArtifactEntry } from '@/lib/ecology/v3'

/** Every house that lands dated work or a dated update on this site. Not a namespace — `EngineNs`
 *  is the works register's three practices and stays that; this is the wider set the entrance
 *  speaks for. */
export type HouseId =
  | 'atelier'
  | 'field'
  | 'studio'
  | 'nightly-line'
  | 'arch'
  | 'n-1'
  | 'lab'
  | 'attention'
  | 'ecology'
  | 'catalogues'
  | 'middle'

/**
 * Which reader produced a row. The ORDER of this list is the fixed order in which rows of one turn
 * stand when their records name no time (or name the same one): the ecology first — its cycle,
 * its presentations, the artifacts and works of its sessions, the relay between its practices —
 * then the other houses' own records, then Machine Attention, then the lab's instruments and
 * catalogues, and the lab's shelf last, because an experiment's `since` is the oldest kind of
 * news a day can carry.
 */
export const SOURCE_ORDER = [
  'cycle',
  'presentation',
  'artifact',
  'work',
  'relay',
  'n1-night',
  'n1-work',
  'arch-session',
  'arch-work',
  'moment',
  'project',
  'reading',
  'probe',
  'papers',
  'atlas',
  'datasets',
  'shelf',
] as const
export type SourceId = (typeof SOURCE_ORDER)[number]
const SOURCE_RANK = new Map<SourceId, number>(SOURCE_ORDER.map((s, i) => [s, i]))

/** The identity colours a row may wear — the ecology's three voices, and nothing else. */
export type Voice = 'ulysses' | 'meridian' | 'ensemble'

export interface FeedEntry {
  /** ISO date, from the entry's own record */
  date: string
  /** the instant the record names, ISO UTC, when it names one ON `date` — null otherwise */
  time: string | null
  /** the reader that produced the row */
  source: SourceId
  house: HouseId
  /** the house's own name, from its door or its overview card */
  houseName: string
  title: string
  /** the one headline fact the record carries, worded by NAMING — null where it carries none */
  fact: string | null
  /** the noun that house uses for what it makes or records */
  kind: string
  href: string
  withdrawn: boolean
  /** the identity colour this row wears; null for everything outside the ecology quartet */
  voice: Voice | null
}

/** Which door names each practice, and which colour that practice wears — the same mapping the
 *  board keeps, in the same place for the same reason: ids and namespaces cannot be derived
 *  from one another. */
export const PRACTICE: Record<'atelier' | 'field' | 'studio', { door: string; voice: Voice }> = {
  atelier: { door: 'ulysses', voice: 'ulysses' },
  field: { door: 'meridian', voice: 'meridian' },
  studio: { door: 'ensemble', voice: 'ensemble' },
}

export type HouseNames = Record<HouseId, string>

/** House names, read from the strings the doors and the cards already render. */
export function houseNames(): HouseNames {
  const doors = new Map(NAMING.doors.items.map((d) => [d.id, d.name]))
  const cards = new Map(NAMING.overview.items.map((c) => [c.id, c.title]))
  const S = NAMING.opsRoom.signal
  return {
    atelier: doors.get('ulysses') ?? S.houseFallback.atelier,
    field: doors.get('meridian') ?? S.houseFallback.field,
    studio: doors.get('ensemble') ?? S.houseFallback.studio,
    'nightly-line': cards.get('nightly-line') ?? S.houseFallback['nightly-line'],
    arch: cards.get('arch') ?? S.houseFallback.arch,
    'n-1': cards.get('n-1') ?? S.houseFallback['n-1'],
    lab: S.houseFallback.lab,
    attention: cards.get('attention') ?? S.houseFallback.attention,
    ecology: cards.get('ecology') ?? S.houseFallback.ecology,
    catalogues: S.houseFallback.catalogues,
    // the fourth door: the contact zone, kept by the conductor rather than by a practice
    middle: doors.get('conductor') ?? S.houseFallback.middle,
  }
}

/** The lab's own two nouns for what stands on its shelf, from the entry's tier. `studie` is the
 *  field's German legacy key in werke.ts; the site says it in English, like everything else. */
function labKind(tier: Werk['tier']): string {
  const K = NAMING.opsRoom.signal.kindLabels
  if (tier === 'instrument') return K.instrument
  if (tier === 'studie') return K.study
  return K.experiment
}

/** An experiment's English title — werke.ts keeps a few bilingual for the German legacy pages. */
export const werkTitle = (w: Werk): string => (typeof w.title === 'string' ? w.title : w.title.en)

/** The entries the lab contributes: everything /experiments renders, which is exactly the set
 *  carrying a research line (werke.test.ts holds that rule from the other side). The practice
 *  doors and the other houses' cards live in the same array and are NOT the lab's. */
export function labEntries(werke: readonly Werk[], names = houseNames()): FeedEntry[] {
  return werke
    .filter((w) => w.line && w.since)
    .map((w) => ({
      date: w.since,
      time: null,
      source: 'shelf' as const,
      house: 'lab' as const,
      houseName: names.lab,
      title: werkTitle(w),
      fact: null,
      kind: labKind(w.tier),
      href: w.href,
      withdrawn: false,
      voice: null,
    }))
}

/** Arch's shelf. A candidate whose README states no build date is known but not datable, and is
 *  left off rather than dated by the session record standing next to it. */
export function archEntries(facts: ArchFacts, names = houseNames()): FeedEntry[] {
  const K = NAMING.opsRoom.signal.kindLabels
  return facts.works
    .filter((w) => w.built)
    .map((w) => ({
      date: w.built!,
      time: null,
      source: 'arch-work' as const,
      house: 'arch' as const,
      houseName: names.arch,
      title: w.title,
      fact: null,
      kind: K.arch,
      href: '/arch#works',
      withdrawn: false,
      voice: null,
    }))
}

/** n-1's shelf, from the practice's own mirror. */
export function n1Entries(works: readonly N1Work[], names = houseNames()): FeedEntry[] {
  const K = NAMING.opsRoom.signal.kindLabels
  return works.map((w) => ({
    date: w.date,
    time: null,
    source: 'n1-work' as const,
    house: 'n-1' as const,
    houseName: names['n-1'],
    title: w.title,
    fact: null,
    kind: K['n-1'],
    href: w.href,
    withdrawn: false,
    voice: null,
  }))
}

/** The works register's rows, split back into the two houses that produced them: the fork's
 *  works are Error as Method's, whatever namespace they carry by descent. */
export function registerEntries(works: readonly LatestWork[], names = houseNames()): FeedEntry[] {
  const K = NAMING.opsRoom.signal.kindLabels
  return works.map((w) => {
    const forked = w.dir === NIGHTLY_FORK_DIR
    const p = PRACTICE[w.ns]
    return {
      date: w.date,
      time: null,
      source: 'work' as const,
      house: forked ? ('nightly-line' as const) : (w.ns as HouseId),
      houseName: forked ? names['nightly-line'] : names[w.ns],
      title: w.title,
      fact: null,
      kind: forked ? K['nightly-line'] : K[w.ns],
      href: w.href,
      withdrawn: w.state === 'withdrawn',
      // The fork keeps the Atelier's colour: it IS the Atelier by descent, and giving it one of
      // its own would have drawn a fourth practice into a quartet that has three.
      voice: p?.voice ?? null,
    }
  })
}

/** The practices' cycle artifacts — research ecology v3: every session leaves one. The Field
 *  writes them to `artifacts/cycle-NNN/<date>-<slug>/` (and, since 2026-09-14, the flat
 *  `artifacts/<date>-<slug>/`), the Atelier to `window/cycle-NNN-session-n/`; neither is a work
 *  in the register's sense, so the register never saw them. The Studio ships its artifacts as
 *  works (and the Atelier did too, before it moved to window/), which the register already
 *  carries — `fromWorksRegister` names exactly those entries, so they are left to the register
 *  here rather than shown twice. A window whose journal names no day drops out rather than
 *  being dated. */
export function artifactEntries(artifacts: readonly ArtifactEntry[], names = houseNames()): FeedEntry[] {
  const K = NAMING.opsRoom.signal.kindLabels
  return artifacts.flatMap((a) => {
    // the register's own predicate, so the log and the register list the same artifacts
    if (!isListedArtifact(a) || a.date === null) return []
    return [
      {
        date: a.date,
        time: null,
        source: 'artifact' as const,
        house: a.practice as HouseId,
        houseName: names[a.practice],
        title: a.title ?? a.slug,
        fact: null,
        kind: K.artifact,
        href: a.href,
        withdrawn: false,
        voice: PRACTICE[a.practice].voice,
      },
    ]
  })
}

// ── the order ────────────────────────────────────────────────────────────────────────────────

const DAY = /^\d{4}-\d{2}-\d{2}$/
/** An instant written with a time of day — a bare date is not one, however Date.parse reads it. */
const STAMP = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/

/**
 * The instant a record names, normalised to ISO UTC — but only when it falls on `date`, the day
 * the row is filed under. A reading of one day written just after midnight of the next would
 * otherwise be ordered among rows it does not belong with; its time is then dropped and the row
 * counts as untimed, never moved to another day.
 */
export function instantOn(date: string, stamp: unknown): string | null {
  if (!DAY.test(date) || typeof stamp !== 'string' || !STAMP.test(stamp)) return null
  const ms = Date.parse(stamp)
  if (!Number.isFinite(ms)) return null
  const iso = new Date(ms).toISOString()
  return iso.slice(0, 10) === date ? iso : null
}

/** Plain code-unit order: ISO dates and instants sort correctly by it, and it is the same on
 *  every machine — a locale-aware compare would not promise that for the tie-breaks either. */
const byCode = (a: string, b: string): number => (a < b ? -1 : a > b ? 1 : 0)

/**
 * The order of rows that stand together: newest day first; within a day, rows whose record names
 * a time first, newest first — a row whose record names only its day is read as standing at that
 * day's start: the day is all it claims, and the start is the one reading of it that never lifts
 * the row above a record that names its hour. Rows still tied stand in SOURCE_ORDER, then by
 * house, title and address — so a rebuild is never a re-ordering, and the comparator never
 * returns 0 for two different rows.
 *
 * It is the order WITHIN one source and WITHIN one turn; sortFeed decides the turns.
 */
export function compareFeed(a: FeedEntry, b: FeedEntry): number {
  return (
    byCode(b.date, a.date) ||
    (a.time && b.time ? byCode(b.time, a.time) : a.time ? -1 : b.time ? 1 : 0) ||
    (SOURCE_RANK.get(a.source) ?? SOURCE_ORDER.length) - (SOURCE_RANK.get(b.source) ?? SOURCE_ORDER.length) ||
    byCode(a.houseName, b.houseName) ||
    byCode(a.title, b.title) ||
    byCode(a.href, b.href)
  )
}

/**
 * Whose turn a row is — what the request of 2026-10-05 calls a SOURCE (Frank's decision, wording
 * private): the unit that takes turns within a day. Not the reader (`source`): a practice is one
 * source whatever it lands — works, artifacts, presentations — and the lab's readings are one,
 * however many instruments read that night (Headroom's probe is one of them). Each catalogue is
 * one, because the three count different things. Everything else is its house: Error as Method,
 * Machine Attention (its moments and its projects), the relay, n-1, Arch, the ecology's own
 * turn. The lab's shelf stands apart from its readings: an experiment arriving is not one more
 * reading, and would otherwise wait behind a dozen of them.
 */
export function streamOf(e: Pick<FeedEntry, 'source' | 'house'>): string {
  switch (e.source) {
    case 'papers':
    case 'atlas':
    case 'datasets':
      return e.source
    case 'reading':
    case 'probe':
      return 'lab-readings'
    case 'shelf':
      return 'lab-shelf'
    default:
      return e.house
  }
}

/**
 * The rows newest first, dropping any whose record named no day. Within a day, round-robin by
 * source (streamOf): each source's rows stand in compareFeed's order, and its n-th row takes the
 * n-th turn — so every source's newest row of the day comes before any source's second. Within a
 * turn, compareFeed again. Days never mix: the last turn of a day stands above the first of the
 * day before. Pure arithmetic over the rows' own fields — the same rows give the same order,
 * whatever order they arrive in.
 */
export function sortFeed(entries: readonly FeedEntry[]): FeedEntry[] {
  const ordered = entries.filter((e) => DAY.test(e.date)).sort(compareFeed)
  const turn = new Map<FeedEntry, number>()
  const taken = new Map<string, number>()
  for (const e of ordered) {
    const key = `${e.date}|${streamOf(e)}`
    const n = taken.get(key) ?? 0
    turn.set(e, n)
    taken.set(key, n + 1)
  }
  return ordered.sort((a, b) => byCode(b.date, a.date) || turn.get(a)! - turn.get(b)! || compareFeed(a, b))
}

// ── the cuts ─────────────────────────────────────────────────────────────────────────────────

/** How many rows the entrance shows (Frank, 2026-10-05): the newest twenty, all in view. */
export const FEED_TOP = 20

/** How deep the longer log on /now reaches: twenty pages of FEED_PAGE_SIZE. Every page ships in
 *  the HTML (SignalLog.astro), so the depth is a size, and a week of the stream is what fits. */
export const FEED_DEPTH = 140

/** How the longer log is paged: seven rows in view, the rest one click away (Frank, 2026-09-03). */
export const FEED_PAGE_SIZE = 7

/** The newest `n` rows of an already-ordered feed — a cut, never a re-ordering. */
export function topOf<T>(entries: readonly T[], n: number = FEED_TOP): T[] {
  return entries.slice(0, Math.max(0, n))
}

/** The feed cut into pages of `size`. An empty feed yields no pages at all — a pager offering
 *  "page 1 of 1" over nothing would be furniture around an absence. */
export function paginate<T>(entries: readonly T[], size = FEED_PAGE_SIZE): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < entries.length; i += size) pages.push(entries.slice(i, i + size))
  return pages
}
