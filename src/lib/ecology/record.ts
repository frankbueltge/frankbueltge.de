// src/lib/ecology/record.ts — the research ecology's record, assembled once for its pages.
//
// The pages of the design handoff of 2026-10-11 (/ecology, the three practice pages and
// /encounters) all draw the same few records: the chain of cycles, the practices' journal
// sessions, everything they made, their presentations, the Middle's relations and handoffs, the
// last convening, the bulletins. Each of those already has a loader and a home
// (src/lib/ecology/{v3,relay,convening}.ts, src/lib/engines/register.ts). This module reads them
// together, gives every made thing its cycle, and hands the pages one object — so two pages
// cannot count the same record apart.
//
// Nothing here is authored and no clock is read. `until`, the last day the score's ruler shows,
// is the newest day any of these records names.

import { loadRelay, V3_SINCE, type Handoff, type Relation, type RelayState } from '@/lib/ecology/relay'
import { buildProgramme, loadRelayExtras, type ProgrammeRow, type RelayConvening } from '@/lib/ecology/convening'
import { cycleOn, lastDay, type ScoreCycle, type ScoreInput } from '@/lib/ecology/score'
import {
  loadBulletin,
  loadCycle,
  loadPresentations,
  loadSessionNotes,
  PRACTICES,
  type Bulletin,
  type CycleState,
  type PracticeId,
  type PresentationEntry,
  type SessionNote,
} from '@/lib/ecology/v3'
import { buildRegister, type Register, type RegisterHouse } from '@/lib/engines/register'

/** One line of the register as the paper pages print it: a work, an artifact or a presentation. */
export interface MadeThing {
  house: RegisterHouse
  kind: 'work' | 'artifact' | 'presentation'
  /** a Field presentation that carries a paper */
  paperHref: string | null
  title: string
  /** the day its record names, or null where it names none (an Atelier window no journal note
   *  names; a presentation whose summary carries no day) */
  date: string | null
  /** what it sorts by: its day, or for an undated thing the day its cycle opened */
  sortDay: string
  /** the cycle it belongs to; 0 for a practice's work before the order of 2026-08-30; null for
   *  what stands outside the ecology's cycles (the nightly line) or names none */
  cycle: number | null
  href: string
  withdrawn: boolean
  /** what the work's own record says it embodies, where it carries that — a work's meta.json
   *  does, an artifact's page and a presentation's do not */
  blurb: string | null
  /** a WORK's key in the neighbour audit, `<namespace>/<slug>` — null for an artifact or a
   *  presentation, which never borrow a verdict from a work that shares their slug */
  auditKey: string | null
  /** a withdrawn work's own marker, verbatim, and the day inside it where it carries one */
  withdrawnNote: string | null
  withdrawnOn: string | null
}

export const isPractice = (house: RegisterHouse): house is PracticeId => (PRACTICES as string[]).includes(house)

/** The programme's rows that carry an opening day, as the score reads them. */
export function scoreCycles(rows: readonly ProgrammeRow[]): ScoreCycle[] {
  return rows
    .flatMap((r) => (r.opened ? [{ n: r.cycle, opened: r.opened, closed: r.closed, question: r.question }] : []))
    .sort((a, b) => a.n - b.n)
}

/**
 * The cycle a made thing belongs to. The cycle its own path names where it names one; else the
 * cycle its day falls in; else — for a practice's work dated before the order came into force —
 * zero, "before v3". The nightly line stands beside the ecology and has no cycle at all.
 */
export function cycleOfThing(
  thing: { house: RegisterHouse; date: string | null; named: number | null },
  cycles: readonly ScoreCycle[],
  until: string,
  since: string = V3_SINCE,
): number | null {
  if (!isPractice(thing.house)) return null
  if (thing.named !== null) return thing.named
  if (!thing.date) return null
  if (thing.date < since) return 0
  return cycleOn(thing.date, cycles, until)?.n ?? null
}

/**
 * Everything the register lists and everything the presentation shelf holds, as one list with a
 * cycle on every line. Order: newest first by `sortDay`, then the houses in the register's own
 * order, a presentation after the pieces of its day.
 */
export function madeThings(
  register: Register,
  presentations: readonly PresentationEntry[],
  cycles: readonly ScoreCycle[],
  until: string,
  presentationTitle: (cycle: number) => string,
): MadeThing[] {
  const openedOn = new Map(cycles.map((c) => [c.n, c.opened]))
  const closedOn = new Map(cycles.map((c) => [c.n, c.closed]))
  const things: MadeThing[] = []

  for (const row of register.rows) {
    const named = row.kind === 'artifact' ? row.artifact.cycle : null
    things.push({
      house: row.house,
      kind: row.kind,
      paperHref: null,
      title: row.title,
      date: row.date,
      sortDay: row.date,
      cycle: cycleOfThing({ house: row.house, date: row.date, named }, cycles, until),
      href: row.href,
      withdrawn: row.kind === 'work' && row.work.state === 'withdrawn',
      blurb: row.kind === 'work' ? (row.work.blurb ?? null) : null,
      auditKey: row.kind === 'work' ? `${row.ns}/${row.slug}` : null,
      withdrawnNote: row.kind === 'work' ? (row.work.withdrawnNote ?? null) : null,
      withdrawnOn: row.kind === 'work' ? (row.work.withdrawnOn ?? null) : null,
    })
  }
  for (const a of register.undated) {
    things.push({
      house: a.practice,
      kind: 'artifact',
      paperHref: null,
      title: a.title ?? a.slug.replace(/-/g, ' '),
      date: null,
      sortDay: (a.cycle !== null ? openedOn.get(a.cycle) : undefined) ?? '',
      cycle: a.cycle,
      href: a.href,
      withdrawn: false,
      blurb: null,
      auditKey: null,
      withdrawnNote: null,
      withdrawnOn: null,
    })
  }
  for (const p of presentations) {
    things.push({
      house: p.practice,
      kind: 'presentation',
      paperHref: p.paperHref ?? null,
      title: p.title ?? presentationTitle(p.cycle),
      date: p.date,
      // a presentation closes its cycle: without a day of its own it sorts on the day the cycle closed
      sortDay: p.date ?? closedOn.get(p.cycle) ?? openedOn.get(p.cycle) ?? '',
      cycle: p.cycle,
      href: p.href,
      withdrawn: false,
      blurb: null,
      auditKey: null,
      withdrawnNote: null,
      withdrawnOn: null,
    })
  }

  const houseRank = (h: RegisterHouse) => ['field', 'atelier', 'studio', 'nightly-line'].indexOf(h)
  const kindRank = (k: MadeThing['kind']) => (k === 'presentation' ? 1 : 0)
  const order = new Map(things.map((t, i) => [t, i]))
  return things.sort(
    (a, b) =>
      b.sortDay.localeCompare(a.sortDay) ||
      houseRank(a.house) - houseRank(b.house) ||
      kindRank(a.kind) - kindRank(b.kind) ||
      order.get(a)! - order.get(b)!,
  )
}

/**
 * A journal note's heading, read for a list: the session's own label where the practice numbers
 * its sessions ("Session 192"), and what the session was about. The three practices head their
 * notes differently — "Session 192 — 2026-10-10 — the tally stands", "2026-10-10 — The Hinge
 * (cycle 007, session 1)" — so the day (which the list prints in its own column) is dropped
 * wherever it stands, a leading "Session N" becomes the label, and the rest is the line.
 */
export function sessionLabel(title: string): { label: string | null; line: string } {
  const parts = title
    .split(/\s+[—–]\s+/)
    .map((p) => p.trim())
    // the day, also where the practice numbered a second note of it: "2026-10-08 (2)"
    .filter((p) => p && !/^\d{4}-\d{2}-\d{2}(\s*\(\d+\))?$/.test(p))
  const label = parts.length > 0 && /^Session\s+\d+/i.test(parts[0]) ? parts.shift()! : null
  return { label, line: parts.join(' — ') }
}

export interface EcologyRecord {
  since: string
  /** the newest day any record below names — where the score's ruler ends */
  until: string
  cycle: CycleState
  /** the chain of cycles, oldest first */
  programme: ProgrammeRow[]
  cycles: ScoreCycle[]
  sessions: SessionNote[]
  things: MadeThing[]
  presentations: PresentationEntry[]
  relay: RelayState['status']
  relations: Relation[]
  handoffs: Handoff[]
  /** the newest convening the relay records, whatever phase the house is in */
  convening: RelayConvening | null
  bulletins: Record<PracticeId, Bulletin>
}

/** The record, read from the committed files. `presentationTitle` words a presentation whose
 *  page names no title of its own. */
export function loadEcologyRecord(presentationTitle: (cycle: number) => string): EcologyRecord {
  const cycle = loadCycle()
  const presentations = loadPresentations()
  const extras = loadRelayExtras()
  const programme = buildProgramme(extras.programme, cycle, presentations).rows
  const cycles = scoreCycles(programme)
  const relayState = loadRelay()
  const relations = relayState.status === 'ok' ? relayState.relay.relations : []
  const handoffs = relayState.status === 'ok' ? relayState.relay.handoffs : []
  const sessions = PRACTICES.flatMap((p) => loadSessionNotes(p, V3_SINCE))
  const register = buildRegister()

  const until = lastDay([
    cycle.opened,
    ...cycles.map((c) => c.opened),
    ...sessions.map((s) => s.date),
    ...relations.map((r) => r.date),
    ...register.rows.filter((r) => isPractice(r.house)).map((r) => r.date),
  ])

  return {
    since: V3_SINCE,
    until,
    cycle,
    programme,
    cycles,
    sessions,
    things: madeThings(register, presentations, cycles, until, presentationTitle),
    presentations,
    relay: relayState.status,
    relations: [...relations].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id)),
    handoffs,
    convening: extras.convening,
    bulletins: Object.fromEntries(PRACTICES.map((p) => [p, loadBulletin(p)])) as Record<PracticeId, Bulletin>,
  }
}

/** The record as the score's geometry reads it. A piece is a dated work or artifact of one of
 *  the three practices; a presentation is not a piece — it has a mark of its own. */
export function scoreInput(record: EcologyRecord): ScoreInput {
  return {
    since: record.since,
    until: record.until,
    cycles: record.cycles,
    // A note's heading carries its own day ("Session 192 — 2026-10-10 — the tally stands"); on
    // the score the day is the bar the note stands in, so the readout says the rest.
    sessions: record.sessions.map((s) => {
      const { label, line } = sessionLabel(s.title)
      return { practice: s.practice, date: s.date, title: [label, line].filter(Boolean).join(' — ') || s.title, href: s.href }
    }),
    pieces: record.things.flatMap((t) =>
      t.kind !== 'presentation' && t.date && isPractice(t.house) ? [{ practice: t.house, date: t.date, title: t.title }] : [],
    ),
    presentations: record.presentations.map((p) => ({ practice: p.practice, cycle: p.cycle, date: p.date })),
    relations: record.relations,
    convening: record.convening?.opened ? { after: record.convening.afterCycle, opened: record.convening.opened } : null,
  }
}

// ── counting ─────────────────────────────────────────────────────────────────────────────────

/** Whether a day lies in a cycle: the half-open interval the score uses (score.ts). */
export const inScoreCycle = (date: string, cycle: ScoreCycle, until: string): boolean => cycleOn(date, [cycle], until) !== null

/** A practice's works and artifacts in a cycle — never its presentation. */
export const piecesIn = (things: readonly MadeThing[], practice: PracticeId, cycle: number): MadeThing[] =>
  things.filter((t) => t.house === practice && t.kind !== 'presentation' && t.cycle === cycle)

/** Everything a practice made under the order: its works and artifacts of cycle one onward. */
export const piecesSince = (things: readonly MadeThing[], practice: PracticeId): MadeThing[] =>
  things.filter((t) => t.house === practice && t.kind !== 'presentation' && t.cycle !== null && t.cycle >= 1)

/** The newest piece of a practice: by cycle, then by day. */
export function newestPiece(things: readonly MadeThing[], practice: PracticeId): MadeThing | null {
  const own = piecesSince(things, practice)
  if (own.length === 0) return null
  return [...own].sort((a, b) => b.cycle! - a.cycle! || b.sortDay.localeCompare(a.sortDay))[0]
}
