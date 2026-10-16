// src/lib/ops/board.ts — THE BOARD: every system running on this site, one row each, assembled
// from the records those systems already keep.
//
// Nothing on a row is authored here. The name, the link and the one-line description of the four
// ecology stations come from NAMING.doors — the same strings the doors on /ecology render, so a
// reworded practice moves the board with it and the entrance can never describe a house
// differently from the house's own door. The two rows beside the ecology read the same way from
// NAMING.overview.items. The last landed output is read from the ecology's own record — each
// practice's newest piece as its own page leads with it, the Middle's newest relation from the
// relay — or from the house's own record beside the ecology (moments, pages, nights). The
// sparkline is that repository's own commit bins out of the committed pulse snapshot.
//
// Until 2026-10-17 the ecology's rows read the sources of the order before v3: the works
// register's meta.json files (the Field's newest of those dates from 2026-08-05, while it lands
// an artifact a session) with the nightly line's fork counted as the Atelier's, and the Middle's
// crossings register of six, which stopped with that order while the relay records hundreds.
//
// The one thing this module DOES decide is what happens when a source is silent: the row still
// appears, and says so. A board that hides a station because its record is empty is a board that
// tells you everything is fine.

import { NAMING } from '@/config/naming'
import { SCORE_WORDING } from '@/config/score-wording'
import type { PulseSnapshot } from '@/lib/pulse/render'
import { loadEcologyRecord, newestPiece, type MadeThing } from '@/lib/ecology/record'
import { KINDS, supersededIds, type Relation } from '@/lib/ecology/relay'
import type { PracticeId } from '@/lib/ecology/v3'
import { nightlyLine } from '@/lib/engines/nightly-line'
import { WERKE } from '@/data/werke'
import attentionMoments from '@/data/attention/moments.json'
import { lastN1Night, N1_RECORD_HREF, newestN1Page } from '@/lib/n1/works'
import { withoutHouseSuffix } from '@/lib/ops/edition'

/** Which door id drives which practice — the only mapping the board needs, and the reason it is
 *  written down: the ids are the practices' resident names, the practices are the record's own
 *  keys, and neither can be derived from the other. */
const DOOR_PRACTICE: Record<string, PracticeId> = { ulysses: 'atelier', meridian: 'field', ensemble: 'studio' }

/** What the ecology's rows read: the record /ecology and the practice pages draw from. */
export interface BoardSources {
  /** everything the three practices made, with the session that made it (src/lib/ecology/record.ts) */
  things: readonly MadeThing[]
  /** the Middle's relay */
  relations: readonly Relation[]
}

/** The committed record, read the way the ecology's own pages read it. */
export function boardSources(): BoardSources {
  const record = loadEcologyRecord(SCORE_WORDING.presentationTitle)
  return { things: record.things, relations: record.relations }
}

export interface BoardLast {
  title: string
  /** a date for a work, a stated phrase where the record carries none — never an invented date */
  meta: string
  href?: string
}

export interface BoardRow {
  id: string
  name: string
  href: string
  /** the row's own one-liner, verbatim from the door or the overview card */
  what: string
  /** "resident: Assay", or the relation a row has instead of a resident */
  resident: string
  status: string
  /** the voice whose identity colour this row wears; null = no voice of the ecology quartet */
  voice: 'ulysses' | 'meridian' | 'ensemble' | 'conductor' | null
  /** commit activity of this row's own repository, or null when the snapshot has no split for it */
  spark: number[] | null
  last: BoardLast | null
}

export interface BoardGroup {
  label: string
  rows: BoardRow[]
}

/**
 * A repository's own recent commit activity, bucketed for a 96px sparkline: the last `buckets`
 * half-days of the snapshot's window, newest at the right.
 *
 * Returns null — and the row draws no line — when the snapshot carries no per-repo split
 * (`by_repo` arrived on 2026-08-11; older snapshots have only the aggregate) or when this repo
 * has no bins in it. Slicing the row's line out of the aggregate, as the design mock did, would
 * have produced a plausible picture of a repository that was never measured.
 */
export function repoSeries(snapshot: PulseSnapshot, repo: string, buckets = 28): number[] | null {
  const perWeek = snapshot.bins_per_week
  const flat: number[] = []
  for (const week of snapshot.weeks.slice(-2)) {
    if (!week.by_repo) return null
    const own = week.by_repo[repo]
    // A repo with no commits in a week is absent from that week's split; that is a real zero.
    const bins = own ?? new Array<number>(perWeek).fill(0)
    const elapsed = Math.max(0, Math.min(week.cutoff_bin ?? perWeek, perWeek))
    flat.push(...bins.slice(0, elapsed))
  }
  if (flat.length === 0) return null
  if (!snapshot.weeks.slice(-2).some((w) => (w.by_repo?.[repo]?.some((b) => b > 0) ?? false))) return null

  const size = Math.max(1, Math.ceil(flat.length / buckets))
  const out: number[] = []
  for (let i = 0; i < flat.length; i += size) {
    out.push(flat.slice(i, i + size).reduce((a, b) => a + b, 0))
  }
  return out
}

/**
 * A practice's newest piece — the one its own page leads with (record.ts, newestPiece): its works
 * and the artifacts its sessions leave, never the nightly line's, which stands beside the ecology
 * under its own name. The title without the practice's own name after it, the day its record
 * names, or — for a window no journal note dates — its cycle, never an invented day.
 */
function lastPieceOf(things: readonly MadeThing[], practice: PracticeId, houseName: string): BoardLast | null {
  const piece = newestPiece(things, practice)
  if (!piece) return null
  return {
    title: withoutHouseSuffix(piece.title, houseName),
    meta: piece.date ?? SCORE_WORDING.cycleLabel(piece.cycle!),
    href: piece.href,
  }
}

/**
 * The Middle's newest relation, in the relay's own words, and the count the relay holds — the
 * same count /encounters prints. On the newest day a relation that carries something (built on,
 * then answered) stands before a note, and one a later relation corrects is never the one shown.
 */
export function lastRelation(relations: readonly Relation[]): BoardLast | null {
  if (relations.length === 0) return null
  const superseded = supersededIds([...relations])
  const standing = relations.filter((r) => !superseded.has(r.id))
  const newest = [...(standing.length > 0 ? standing : relations)].sort(
    (a, b) => b.date.localeCompare(a.date) || KINDS.indexOf(a.kind) - KINDS.indexOf(b.kind) || a.id.localeCompare(b.id),
  )[0]!
  return { title: newest.what, meta: `${relations.length} crossings on the record`, href: '/encounters' }
}

interface AttentionMoment {
  occurred_at?: string
  subject?: string
  statement?: string
}

/** A board cell holds one line; a subject longer than this is a document, not a title. */
const MOMENT_TITLE_MAX = 90

/** Mirrored moment subjects arrive as the source wrote them, and sources dump lists: a GDACS
 *  drought subject is a run of twenty-five country names with doubled spaces and a trailing
 *  ", ,". The snapshot is the record and stays byte-exact — the cleaning lives here, in the
 *  derivation, and only tidies what is shown: whitespace runs collapse, empty list items and
 *  trailing separators fall, and anything past the cell's width is cut at a word with an
 *  ellipsis. (Found on the entrance board 2026-09-01.) */
export function cleanMomentTitle(raw: string): string {
  const tidy = raw
    .replace(/\s+/g, ' ')
    .replace(/(,\s*)+,/g, ',')
    .replace(/[,\s]+$/g, '')
    .trim()
  if (tidy.length <= MOMENT_TITLE_MAX) return tidy
  const cut = tidy.slice(0, MOMENT_TITLE_MAX)
  const atWord = cut.slice(0, cut.lastIndexOf(' '))
  return `${(atWord || cut).replace(/[,\s]+$/g, '')} …`
}

/** Many mirrored moments share one timestamp (a feed lands in batches), and a sort whose
 *  comparator never returns 0 leaves the pick among equals to engine internals. The tie-break
 *  on the shown text keeps the same snapshot giving the same board row on every build. */
export function newestMoment(list: AttentionMoment[]): AttentionMoment | null {
  if (list.length === 0) return null
  return [...list].sort(
    (a, b) =>
      b.occurred_at!.localeCompare(a.occurred_at!) ||
      (a.subject ?? a.statement ?? '').localeCompare(b.subject ?? b.statement ?? ''),
  )[0]
}

/** Machine Attention publishes moments rather than works; its newest one is what last landed. */
function lastMoment(): BoardLast | null {
  const list = ((attentionMoments as { moments?: AttentionMoment[] }).moments ?? []).filter((m) => m.occurred_at)
  const newest = newestMoment(list)
  if (!newest) return null
  return {
    title: cleanMomentTitle(newest.subject ?? newest.statement ?? 'a moment on the record'),
    meta: newest.occurred_at!.slice(0, 10),
    href: '/attention',
  }
}

/** n-1's row names the newest page of the practice a visitor can open — a work or a study, by
 *  the page's own title and the day its record says it was built (src/lib/n1/shelf.ts). Until
 *  2026-10-10 the row named the newest night instead ("Night 53 — project 6, session 2: …"): a
 *  count of sessions, on a row whose link leads to a front page where what those sessions built
 *  could not be found. The nights still stand in the signal log, each leading to its page. A
 *  mirror in which no page can be dated falls back to the newest night and the record, the way
 *  the row read before. */
function lastN1(): BoardLast | null {
  const page = newestN1Page()
  if (page) return { title: page.title, meta: page.date, href: page.href }
  const night = lastN1Night()
  return night ? { title: night.title, meta: night.date, href: N1_RECORD_HREF } : null
}

/** The forked nightly line: its newest mirrored work, from the same metadata /error-as-method counts. */
function lastNightly(): BoardLast | null {
  const work = nightlyLine().works[0]
  return work ? { title: work.title, meta: work.date, href: work.href } : null
}

/* THE SIGNAL LOG moved out of this module on 2026-09-03. It used to read allWorks() here and
   show the three ecology practices only; Frank widened it to every house that lands dated work,
   which needed sources this module has no business knowing about (Arch's mirror, n-1's forms,
   the lab's shelf). It now lives in src/lib/ops/house-feed.ts — buildHouseFeed() — and this
   module keeps to the board. */

/**
 * The board, group by group. The ecology's record is injectable so the derivation can be tested
 * against a fixture instead of against whatever the practices shipped last night; left out, it
 * reads the committed record.
 */
export function buildBoard(snapshot: PulseSnapshot, sources: BoardSources = boardSources()): BoardGroup[] {
  const doors = new Map(NAMING.doors.items.map((d) => [d.id, d]))
  const cards = new Map(NAMING.overview.items.map((c) => [c.id, c]))
  const werke = new Map(WERKE.map((w) => [w.id, w]))

  return NAMING.opsRoom.board.groups.map((group) => ({
    label: group.label,
    rows: group.rows.map((spec): BoardRow => {
      const spark = repoSeries(snapshot, spec.repo)

      if ('door' in spec) {
        const door = doors.get(spec.door)!
        const practice = DOOR_PRACTICE[spec.door]
        return {
          id: spec.door,
          name: door.name,
          href: door.href,
          what: door.description,
          // The persona comes from the door, never from its id: a door addresses the repository
          // (`ulysses`), the resident line names the practice (Assay since 2026-09-03).
          resident: door.noResident ?? `resident: ${door.persona ?? door.name}`,
          status: spec.status,
          voice: spec.door,
          spark,
          last: practice ? lastPieceOf(sources.things, practice, door.name) : lastRelation(sources.relations),
        }
      }

      const card = cards.get(spec.card)!
      const werk = werke.get(spec.card)
      return {
        id: spec.card,
        name: card.title ?? werk?.title?.toString() ?? spec.card,
        href: card.href ?? werk?.href ?? '/experiments',
        what: card.line ?? werk?.subtitle.en ?? '',
        resident: spec.resident,
        status: spec.status,
        voice: null,
        spark,
        // each card beside the ecology states its last landed output from its OWN record — a
        // third card reading the nightly line's would have put another practice's work on it
        // (Arch's branch — its newest session protocol — went with its row on 2026-10-11.)
        last:
          spec.card === 'attention' ? lastMoment()
          : spec.card === 'n-1' ? lastN1()
          : lastNightly(),
      }
    }),
  }))
}
