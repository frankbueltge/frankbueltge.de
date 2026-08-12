// src/lib/ecology/pyramid/landings.ts — what each station last put on the record.
//
// This is the module behind the entrance's LAST NIGHT board and the map's per-node lines, and it
// exists because the four stations keep four different kinds of record and none of them can be
// read the way another one is:
//
//   · the Field and the Studio keep a CHRONICLE — one dated entry per collective session, whose
//     `move` field is the practice's own sentence about what that session did;
//   · the Atelier keeps a work-line RECORD — a trace and a journal per line, merged by the
//     dossier into dated moves, because under v5/v6 the unit of work is the line and not the
//     night;
//   · the Middle keeps a CROSSING REGISTER — encounters between practices, which carry an
//     as-of date but no session number, because a crossing is not a session.
//
// The board draws one row per station regardless. What it must never do is smooth the four
// records into one shape by inventing the parts a record does not have: a station whose record
// is silent gets a row that says so. `line: null` is a real answer and is rendered as one.

import type { PulseSnapshot } from '@/lib/pulse/render'
import { repoSeries } from '@/lib/ops/board'
import { allWorks } from '@/lib/engines/register'
import type { LatestWork } from '@/lib/engines/latest'
import { loadDossiers } from '@/lib/atelier/dossier-data'
import fieldChronicle from '@/data/field/chronicle.upstream.json'
import studioChronicle from '@/data/studio/chronicle.upstream.json'
import crossings from '@/data/begegnungen/register.json'
import inquiries from '@/data/begegnungen/joint-inquiries.json'
import { STATIONS, type Station, type StationId } from './model'

export interface ChronicleEntry {
  collective_session?: number | null
  date?: string
  move?: string
  summary?: string
}

export interface Landing {
  /** ISO date the record itself carries — never today's date standing in for it */
  date: string
  /** the record's own marker for the entry: S86, tick 57, enc-2026-006 — null where it has none */
  marker: string | null
  /** the record's own sentence, cut to one clause; null when the record carries no prose */
  line: string | null
}

export interface Arc {
  /** what this practice calls the state its current work is in */
  label: string
  /** the work itself, in the record's words */
  title: string
}

export interface StationLanding {
  station: Station
  landing: Landing | null
  arc: Arc | null
  /** commit bins for this practice's own checkout — null when the snapshot has no split for it */
  spark: number[] | null
  /** NIGHTLY for a practice that runs sessions, RECORDING for the Middle, which does not */
  status: 'NIGHTLY' | 'RECORDING'
}

/**
 * The record's first sentence, and no more of it.
 *
 * The chronicles' `move` fields run to several hundred words and the Atelier's trace entries are
 * markdown; a board row is one line of plain text. So this strips the markup and cuts at the
 * first sentence boundary — it keeps the practice's own WORDS rather than paraphrasing them,
 * which is the rule the whole site works under, and it drops only the asterisks.
 */
export function firstClause(text: string | undefined | null, max = 150): string | null {
  const clean = (text ?? '')
    // markdown, in the order that makes each pattern unambiguous: links to their label, then
    // code, then emphasis. A board row rendering "**Cascade (a)**" would be showing the reader
    // the practice's file format instead of the practice's sentence.
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]*)`/g, '$1')
    .replace(/(\*\*|__)(.*?)\1/g, '$2')
    .replace(/(^|\s)[*_]([^*_]+)[*_](?=\s|$|[.,;:!?])/g, '$1$2')
    .replace(/^#+\s*/, '')
    .replace(/\s+/g, ' ')
    .trim()
  if (!clean) return null
  // An em-dash clause break counts as a sentence end here: the chronicles use it as their main
  // joint ("session landed — the ledger extended, …"), and the half before it is the headline.
  const cut = clean.search(/(?<=[.!?])\s|\s—\s/)
  const head = cut > 0 ? clean.slice(0, cut) : clean
  if (head.length <= max) return head
  const soft = head.lastIndexOf(' ', max)
  return `${head.slice(0, soft > 0 ? soft : max)}…`
}

/**
 * The line a chronicle entry contributes to a log.
 *
 * `move` is the practice's declared move and `summary` is what it wrote at landing. Usually the
 * move is the better line. But the Studio's recent entries record the move as the single word
 * "build", and three rows reading "build · build · build" tell a visitor nothing the cadence row
 * did not already say. So a move too short to be a sentence yields to the summary — both are the
 * record's own words, and the longer one is the one that says something.
 */
export function recordLine(move: string | undefined | null, summary: string | undefined | null, max = 190): string | null {
  const short = (move ?? '').trim().length < 24
  return firstClause(short ? (summary ?? move) : move, max) ?? firstClause(summary, max)
}

const newestChronicle = (rows: ChronicleEntry[]): Landing | null => {
  const dated = rows.filter((r) => r.date)
  if (dated.length === 0) return null
  const newest = [...dated].sort((a, b) => {
    if (a.date! !== b.date!) return a.date! < b.date! ? -1 : 1
    return (a.collective_session ?? 0) - (b.collective_session ?? 0)
  }).at(-1)!
  return {
    date: newest.date!,
    marker: newest.collective_session ? `S${newest.collective_session}` : null,
    line: recordLine(newest.move, newest.summary, 150),
  }
}

/** The newest work of a practice, from the works register — the site's single counting point. */
const newestWork = (works: readonly LatestWork[], ns: 'atelier' | 'field' | 'studio'): LatestWork | undefined =>
  works.find((w) => w.ns === ns)

interface Crossing {
  encounter_id?: string
  title?: string
  status?: { as_of?: string }
}

interface Inquiry {
  inquiry_id?: string
  title?: string
  status?: string
  updated_at?: string
}

/** The Middle's newest crossing. Crossings are dated by their status block, and the two oldest
 *  carry no date at all — those simply cannot be "newest" and drop out rather than being given
 *  one. */
export function newestCrossing(rows: readonly Crossing[] = crossings as Crossing[]): Landing | null {
  const dated = rows.filter((c) => c.status?.as_of && c.title)
  if (dated.length === 0) return null
  const newest = [...dated].sort((a, b) => (a.status!.as_of! < b.status!.as_of! ? -1 : 1)).at(-1)!
  return {
    date: newest.status!.as_of!,
    marker: newest.encounter_id?.split('-').slice(0, 3).join('-') ?? null,
    line: firstClause(newest.title),
  }
}

/** The joint inquiry still in motion. ACTIVE and REVIEW are both "in motion" — a review is the
 *  inquiry being read, not the inquiry being over — and the newest one leads. */
export function runningInquiry(rows: readonly Inquiry[] = inquiries as Inquiry[]): Arc | null {
  const live = rows.filter((i) => i.status === 'ACTIVE' || i.status === 'REVIEW')
  if (live.length === 0) return null
  const newest = [...live].sort((a, b) => ((a.updated_at ?? '') < (b.updated_at ?? '') ? -1 : 1)).at(-1)!
  return {
    label: newest.status === 'REVIEW' ? 'in review' : 'running',
    title: `${newest.inquiry_id ?? 'a joint inquiry'} — ${newest.title ?? 'untitled'}`,
  }
}

/** The Atelier's running work-line, from its own dossiers. A line at the gate says so: the
 *  dossier already derives that distinction and the board does not get to flatten it. */
function atelierArc(): Arc | null {
  const running = loadDossiers().filter((d) => d.stand === 'RUNNING' || d.stand === 'PUBLICATION_CANDIDATE')
  if (running.length === 0) return null
  const lead = [...running].sort((a, b) => (a.lastMove < b.lastMove ? -1 : 1)).at(-1)!
  return {
    label: lead.stand === 'PUBLICATION_CANDIDATE' ? 'at the gate' : 'in work',
    title: lead.title,
  }
}

/** The Atelier's last landed move — trace and journal merged, newest first, by the dossier. */
function atelierLanding(): Landing | null {
  const moves = loadDossiers().flatMap((d) => d.moves.map((m) => ({ ...m, tick: m.number })))
  const dated = moves.filter((m) => m.date)
  if (dated.length === 0) return null
  const newest = [...dated].sort((a, b) => (a.date < b.date ? -1 : 1)).at(-1)!
  return {
    date: newest.date,
    marker: newest.tick ? `tick ${newest.tick}` : null,
    line: firstClause(newest.text ?? newest.title),
  }
}

export interface LandingsInput {
  snapshot: PulseSnapshot
  works?: readonly LatestWork[]
}

/**
 * One row per station, in map order. `works` is injectable so the derivation can be tested
 * against a fixture rather than against whatever the practices shipped last night.
 */
export function buildLandings({ snapshot, works = allWorks() }: LandingsInput): StationLanding[] {
  const arcOf: Record<StationId, () => Arc | null> = {
    atelier: atelierArc,
    field: () => {
      const work = newestWork(works, 'field')
      return work ? { label: 'in service', title: work.title } : null
    },
    studio: () => {
      const work = newestWork(works, 'studio')
      return work ? { label: 'on stage', title: work.title } : null
    },
    middle: () => runningInquiry(),
  }

  const landingOf: Record<StationId, () => Landing | null> = {
    atelier: atelierLanding,
    field: () => newestChronicle(fieldChronicle as ChronicleEntry[]),
    studio: () => newestChronicle(studioChronicle as ChronicleEntry[]),
    middle: () => newestCrossing(),
  }

  return STATIONS.map((station) => ({
    station,
    landing: landingOf[station.id](),
    arc: arcOf[station.id](),
    spark: repoSeries(snapshot, station.repo),
    status: station.id === 'middle' ? 'RECORDING' : 'NIGHTLY',
  }))
}
