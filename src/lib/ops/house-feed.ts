// src/lib/ops/house-feed.ts — THE SIGNAL LOG's feed: everything this house has landed, from
// every practice in it, newest first.
//
// What changed on 2026-09-03 (Frank): the signal log used to read allWorks() and nothing else,
// so it showed the three ecology practices and — mislabelled as "The Atelier" — the nightly
// line's fork. Arch, n-1 and the lab's own experiments were invisible on it, although all three
// land dated work. A log headed "what landed last" that silently means "what landed last in
// three of the six places" is the kind of half-truth this site's own honesty line forbids.
//
// So the feed is assembled here, from each house's OWN record, in each house's OWN noun:
//
//   the three practices   works · instruments · premieres, from their committed meta.json
//   Error as Method       the fork's nights, split out of the same register by the directory
//                         they were mirrored from — same practice by descent, own address
//   Arch                  its work candidates, dated by the day the current iteration was built
//   n-1                   the works it has laid down, dated by their own form documents
//   the lab               the experiments and instruments on /experiments, dated by `since`
//
// Two rules this module keeps, both learned from the derivations it sits beside:
//
//   · NOTHING IS AUTHORED HERE. Every title, date and address comes from the record it belongs
//     to. The house NAMES come from NAMING (the doors and the overview cards), so a reworded
//     practice moves this feed with it and the log can never call a house something its own
//     door does not.
//   · A SILENT SOURCE IS A SHORTER FEED, NEVER A GUESS. A work whose record carries no date
//     drops out rather than appearing under today's — an undated row at the top of a log
//     sorted by date is a lie about what landed last.
//
// The register on /ecology is deliberately NOT this: it stays the three practices' catalogue
// (src/lib/engines/register.ts), because that is what it claims to be. One house, two readings,
// each answering its own question.

import { NAMING } from '@/config/naming'
import { WERKE, type Werk } from '@/data/werke'
import { readArchFacts, type ArchFacts } from '@/lib/arch/facts'
import { readN1Works, type N1Work } from '@/lib/n1/works'
import type { LatestWork } from '@/lib/engines/latest'
import { allWorks, NIGHTLY_FORK_DIR } from '@/lib/engines/register'

/** Every house that lands dated work on this site. Not a namespace — `EngineNs` is the works
 *  register's three practices and stays that; this is the wider set the entrance speaks for. */
export type HouseId = 'atelier' | 'field' | 'studio' | 'nightly-line' | 'arch' | 'n-1' | 'lab'

export interface FeedEntry {
  /** ISO date, from the entry's own record */
  date: string
  house: HouseId
  /** the house's own name, from its door or its overview card */
  houseName: string
  title: string
  /** the noun that house uses for what it makes */
  kind: string
  href: string
  withdrawn: boolean
  /** the identity colour this row wears; null for the houses outside the ecology quartet */
  voice: 'ulysses' | 'meridian' | 'ensemble' | null
}

/** Which door names each practice, and which colour that practice wears — the same mapping the
 *  board keeps, in the same place for the same reason: ids and namespaces cannot be derived
 *  from one another. */
const PRACTICE: Record<'atelier' | 'field' | 'studio', { door: string; voice: 'ulysses' | 'meridian' | 'ensemble' }> = {
  atelier: { door: 'ulysses', voice: 'ulysses' },
  field: { door: 'meridian', voice: 'meridian' },
  studio: { door: 'ensemble', voice: 'ensemble' },
}

/** House names, read from the strings the doors and the cards already render. */
export function houseNames(): Record<HouseId, string> {
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

/** The entries the lab contributes: everything /experiments renders, which is exactly the set
 *  carrying a research line (werke.test.ts holds that rule from the other side). The practice
 *  doors and the other houses' cards live in the same array and are NOT the lab's. */
export function labEntries(werke: readonly Werk[] = WERKE, names = houseNames()): FeedEntry[] {
  return werke
    .filter((w) => w.line && w.since)
    .map((w) => ({
      date: w.since,
      house: 'lab' as const,
      houseName: names.lab,
      title: typeof w.title === 'string' ? w.title : w.title.en,
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
      house: 'arch' as const,
      houseName: names.arch,
      title: w.title,
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
    house: 'n-1' as const,
    houseName: names['n-1'],
    title: w.title,
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
      house: forked ? ('nightly-line' as const) : (w.ns as HouseId),
      houseName: forked ? names['nightly-line'] : names[w.ns],
      title: w.title,
      kind: forked ? K['nightly-line'] : K[w.ns],
      href: w.href,
      withdrawn: w.state === 'withdrawn',
      // The fork keeps the Atelier's colour: it IS the Atelier by descent, and giving it one of
      // its own would have drawn a fourth practice into a quartet that has three.
      voice: p?.voice ?? null,
    }
  })
}

export interface FeedSources {
  works?: readonly LatestWork[]
  arch?: ArchFacts | null
  n1?: readonly N1Work[]
  werke?: readonly Werk[]
}

/**
 * The whole feed, newest first. Every source is injectable so the derivation can be tested
 * against fixtures rather than against whatever the practices shipped last night; left out,
 * each reads its own committed record.
 *
 * The tie-break on title keeps a rebuild from being a re-ordering: a dozen entries share a date
 * on any given night, and a comparator that never returns 0 leaves the order to engine internals.
 */
export function buildHouseFeed(sources: FeedSources = {}): FeedEntry[] {
  const names = houseNames()
  const works = sources.works ?? allWorks()
  const arch = sources.arch !== undefined ? sources.arch : readArchFacts()
  const n1 = sources.n1 ?? readN1Works()

  return [
    ...registerEntries(works, names),
    ...(arch ? archEntries(arch, names) : []),
    ...n1Entries(n1, names),
    ...labEntries(sources.werke ?? WERKE, names),
  ]
    .filter((e) => e.date)
    .sort((a, b) => b.date.localeCompare(a.date) || a.houseName.localeCompare(b.houseName) || a.title.localeCompare(b.title))
}

/** How the log is paged: seven rows in view, the rest one click away (Frank, 2026-09-03). */
export const FEED_PAGE_SIZE = 7

/** The feed cut into pages of `size`. An empty feed yields no pages at all — a pager offering
 *  "page 1 of 1" over nothing would be furniture around an absence. */
export function paginate<T>(entries: readonly T[], size = FEED_PAGE_SIZE): T[][] {
  const pages: T[][] = []
  for (let i = 0; i < entries.length; i += size) pages.push(entries.slice(i, i + size))
  return pages
}
