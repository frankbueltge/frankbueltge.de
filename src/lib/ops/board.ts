// src/lib/ops/board.ts — THE BOARD: every system running on this site, one row each, assembled
// from the records those systems already keep.
//
// Nothing on a row is authored here. The name, the link and the one-line description of the four
// ecology stations come from NAMING.doors — the same strings the doors on /ecology render, so a
// reworded practice moves the board with it and the entrance can never describe a house
// differently from the house's own door. The two rows beside the ecology read the same way from
// NAMING.overview.items. The last landed output is read from the works' own committed metadata,
// the crossings register, or the practice's own exported moments. The sparkline is that
// repository's own commit bins out of the committed pulse snapshot.
//
// The one thing this module DOES decide is what happens when a source is silent: the row still
// appears, and says so. A board that hides a station because its record is empty is a board that
// tells you everything is fine.

import { NAMING } from '@/config/naming'
import type { PulseSnapshot } from '@/lib/pulse/render'
import type { EngineNs, LatestWork } from '@/lib/engines/latest'
import { allWorks } from '@/lib/engines/register'
import { nightlyLine } from '@/lib/engines/nightly-line'
import { WERKE } from '@/data/werke'
import encounters from '@/data/begegnungen/register.json'
import attentionMoments from '@/data/attention/moments.json'
import { lastArchProtocol } from '@/lib/arch/facts'
import { lastN1Night } from '@/lib/n1/works'

/** Which door id drives which practice namespace — the only mapping the board needs, and the
 *  reason it is written down: the ids are the practices' resident names, the namespaces are the
 *  directories their works live in, and neither can be derived from the other. */
const DOOR_NS: Record<string, EngineNs> = { ulysses: 'atelier', meridian: 'field', ensemble: 'studio' }

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
  /** "resident: Ulysses", or the relation a row has instead of a resident */
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

/** The newest work of a practice, from the works' own committed metadata. */
function lastWorkOf(works: readonly LatestWork[], ns: EngineNs): BoardLast | null {
  const work = works.find((w) => w.ns === ns)
  return work ? { title: work.title, meta: work.date, href: work.href } : null
}

interface EncounterEntry {
  encounter_id?: string
  title?: string
}

/** The Middle keeps crossings, and the crossings register carries no dates — so the row states
 *  the count instead of borrowing a date from somewhere else. */
function lastCrossing(): BoardLast | null {
  const list = (encounters as unknown as EncounterEntry[]).filter((e) => e.title)
  if (list.length === 0) return null
  const newest = [...list].sort((a, b) => (a.encounter_id ?? '').localeCompare(b.encounter_id ?? '')).at(-1)!
  return {
    title: newest.title!,
    meta: `${list.length} crossings on the record`,
    href: '/encounters',
  }
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

/** n-1 lands a night, not a work: its shelf holds two works and its record holds twenty nights,
 *  so the newest night is what this practice last landed — the same reading the Arch row makes
 *  of its session protocols. The link is the practice's own record surface; the house keeps no
 *  page per night, because the repository IS the record (its dowry's own arrangement). */
function lastN1(): BoardLast | null {
  const night = lastN1Night()
  return night ? { title: night.title, meta: night.date, href: '/n-1/record.html' } : null
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
 * The board, group by group. `works` is injectable so the derivation can be tested against a
 * fixture instead of against whatever the practices shipped last night; left out, it reads the
 * real register.
 */
export function buildBoard(snapshot: PulseSnapshot, works: readonly LatestWork[] = allWorks()): BoardGroup[] {
  const doors = new Map(NAMING.doors.items.map((d) => [d.id, d]))
  const cards = new Map(NAMING.overview.items.map((c) => [c.id, c]))
  const werke = new Map(WERKE.map((w) => [w.id, w]))

  return NAMING.opsRoom.board.groups.map((group) => ({
    label: group.label,
    rows: group.rows.map((spec): BoardRow => {
      const spark = repoSeries(snapshot, spec.repo)

      if ('door' in spec) {
        const door = doors.get(spec.door)!
        const ns = DOOR_NS[spec.door]
        return {
          id: spec.door,
          name: door.name,
          href: door.href,
          what: door.description,
          resident: door.noResident ?? `resident: ${spec.door[0].toUpperCase()}${spec.door.slice(1)}`,
          status: spec.status,
          voice: spec.door,
          spark,
          last: ns ? lastWorkOf(works, ns) : lastCrossing(),
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
        last:
          spec.card === 'attention' ? lastMoment()
          : spec.card === 'arch' ? lastArchProtocol()
          : spec.card === 'n-1' ? lastN1()
          : lastNightly(),
      }
    }),
  }))
}
