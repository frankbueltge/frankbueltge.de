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
import { repoPathOf } from '@/lib/ecology/session-label'
import {
  compareSessions,
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
import { loadChronicle } from '@/lib/studio/chronicle'
import { hasScore, longWorks, type ChronicleMove, type LongWork } from '@/lib/studio/long-work'

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
  /** the session that made it, where the practice's record ties the two (tieSessions); null
   *  where it does not */
  session: SessionNote | null
  /** the cycle it counts toward — the cycle its session's note names; none for a piece made in
   *  a convening; its own `cycle` where no session's label says otherwise */
  countCycle: number | null
  /** its place among a day's pieces where its own record numbers it — the session in a work's
   *  meta.json, the cycle and session in a window's path; null where nothing numbers it */
  seq: number | null
}

/** A window's place in the Atelier's own count, from its path: `cycle-005-session-2` is cycle 5,
 *  session 2; `cycle-007-convening-3` the third session of the convening after cycle 7, which
 *  comes after every session of that cycle; `cycle-007-convening` the convening's first. */
export function windowSeq(slug: string): number | null {
  const m = /^cycle-(\d+)-(session|convening)(?:-(\d+))?$/.exec(slug)
  if (!m || (m[2] === 'session' && !m[3])) return null
  return Number(m[1]) * 1000 + (m[2] === 'convening' ? 500 : 0) + Number(m[3] ?? 1)
}

/** A window of a convening (`cycle-007-convening-3`): made between two cycles, not in one. */
const isConveningWindow = (slug: string): boolean => /^cycle-\d+-convening(?:-|$)/.test(slug)

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
    const cycle = cycleOfThing({ house: row.house, date: row.date, named }, cycles, until)
    const convening = row.kind === 'artifact' && isConveningWindow(row.slug)
    things.push({
      house: row.house,
      kind: row.kind,
      paperHref: null,
      title: row.title,
      date: row.date,
      sortDay: row.date,
      cycle,
      href: row.href,
      withdrawn: row.kind === 'work' && row.work.state === 'withdrawn',
      blurb: row.kind === 'work' ? (row.work.blurb ?? null) : null,
      auditKey: row.kind === 'work' ? `${row.ns}/${row.slug}` : null,
      withdrawnNote: row.kind === 'work' ? (row.work.withdrawnNote ?? null) : null,
      withdrawnOn: row.kind === 'work' ? (row.work.withdrawnOn ?? null) : null,
      session: null,
      countCycle: convening ? null : cycle,
      seq: row.kind === 'work' ? (row.work.session ?? null) : windowSeq(row.slug),
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
      session: null,
      countCycle: isConveningWindow(a.slug) ? null : a.cycle,
      seq: windowSeq(a.slug),
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
      session: null,
      countCycle: p.cycle,
      seq: null,
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

// ── which session made what ──────────────────────────────────────────────────────────────────
//
// Until 2026-10-17 nothing tied a piece to the session that made it: the score filled the first
// N noteheads of a day that left N pieces, a practice page named a day's last session beside the
// day's newest piece, and both orders were the alphabet's. On a day of several sessions the house
// drew one session's piece under another's note (the Atelier's window of 10-15, session 1, beside
// the note of session 2). The practices' records do tie the two, each in its own way, and these
// are read here.

/** A title and a heading compared as words: case, quotes and punctuation do not count, nor the
 *  " — cycle 004, session 1" an Atelier window's <title> carries and its note's heading does not. */
const asWords = (s: string): string =>
  s
    .replace(/\s+[—–-]\s+cycle\s+\d+,\s*session\s+\d+\s*$/i, '')
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[^a-z0-9']+/g, ' ')
    .trim()

/**
 * Every piece with the session that made it, where the practice's record ties the two:
 *
 *   · the Studio's chronicle — the first session whose self-report names the work's directory;
 *   · the first session of the piece's own day whose note names the piece's path (`window/…`,
 *     `artifacts/…`, `works/…`) — what the Atelier's and the Field's notes do;
 *   · a session of the piece's own day whose heading carries the piece's whole title.
 *
 * A tied piece counts toward the cycle its session's note names, and toward none when that
 * session was one of a convening. Nothing else is inferred: a piece the record does not tie keeps
 * no session (settlePieces counts it with its day, as the score always did).
 */
export function tieSessions(
  things: readonly MadeThing[],
  sessions: readonly SessionNote[],
  chronicle: readonly ChronicleMove[] = [],
): MadeThing[] {
  const studioMaker = new Map<string, { session: number; date: string }>()
  const reports = [...chronicle].sort((a, b) => a.date.localeCompare(b.date) || (a.collective_session ?? 0) - (b.collective_session ?? 0))
  for (const e of reports) {
    if (e.collective_session === null) continue
    for (const slug of e.works) if (!studioMaker.has(slug)) studioMaker.set(slug, { session: e.collective_session, date: e.date })
  }
  const own = new Map<PracticeId, SessionNote[]>(PRACTICES.map((p) => [p, sessions.filter((s) => s.practice === p).sort(compareSessions)]))

  return things.map((t) => {
    if (t.kind === 'presentation' || !isPractice(t.house)) return t
    const notes = own.get(t.house) ?? []
    const path = repoPathOf(t.href)
    let session: SessionNote | undefined
    if (t.house === 'studio' && path?.startsWith('works/')) {
      const maker = studioMaker.get(path.slice('works/'.length))
      if (maker) session = notes.find((s) => s.number === maker.session && s.date === maker.date) ?? notes.find((s) => s.number === maker.session)
    }
    if (!session && path) session = notes.find((s) => (t.date === null || s.date === t.date) && s.names.includes(path))
    if (!session && t.date) {
      // whole words only, and a title of at least two: a one-word title is too easily a heading's
      const title = asWords(t.title)
      if (title.includes(' ')) session = notes.find((s) => s.date === t.date && ` ${asWords(s.title)} `.includes(` ${title} `))
    }
    if (!session) return t
    const label = session.label
    return { ...t, session, countCycle: label ? (label.convening ? null : label.cycle) : t.countCycle }
  })
}

/** The cycle a session counts toward: the one its note names, none for a session of a convening,
 *  and — only where the note names nothing — the cycle its day falls in. */
export function sessionCycle(s: SessionNote, cycles: readonly ScoreCycle[], until: string): number | null {
  if (s.label) return s.label.convening ? null : s.label.cycle
  return cycleOn(s.date, cycles, until)?.n ?? null
}

export interface SettledPieces {
  /** the things again, each counting toward the cycle of the session it was settled with */
  things: MadeThing[]
  /** what each session left or advanced, by the session's address */
  sessionPieces: Map<string, string[]>
}

/**
 * What each session left or advanced, by the session's address — and so what fills its notehead:
 *
 *   · the pieces tied to it (tieSessions);
 *   · the Studio's long works it advanced: every session the chronicle records under a long work
 *     (the score, each increment, the critique, the presentation) leaves that work in a new
 *     state, though only the first leaves a new folder (src/lib/studio/long-work.ts);
 *   · where the record ties nothing, a day's pieces with that day's unclaimed sessions, in order —
 *     the rule the score's noteheads always followed. Such a piece is counted toward its session's
 *     cycle, so the counts under the drawing and the drawing cannot disagree; it is never named
 *     as that session's piece anywhere a reader is told who made what (`session` stays null).
 */
export function settlePieces(
  things: readonly MadeThing[],
  sessions: readonly SessionNote[],
  long: readonly LongWork[],
  cycles: readonly ScoreCycle[],
  until: string,
): SettledPieces {
  const sessionPieces = new Map<string, string[]>()
  const add = (href: string, title: string) => {
    const list = sessionPieces.get(href) ?? []
    if (!list.includes(title)) list.push(title)
    sessionPieces.set(href, list)
  }
  for (const t of things) if (t.session && t.kind !== 'presentation') add(t.session.href, t.title)
  const studio = sessions.filter((s) => s.practice === 'studio')
  for (const work of long) {
    const title = things.find((t) => t.house === 'studio' && repoPathOf(t.href) === `works/${work.slug}`)?.title ?? work.slug
    for (const step of work.sessions) {
      const note = studio.find((s) => s.number === step.session && s.date === step.date) ?? studio.find((s) => s.number === step.session)
      if (note) add(note.href, title)
    }
  }

  const unclaimed = new Map<string, SessionNote[]>()
  for (const s of [...sessions].sort(compareSessions)) {
    if (sessionPieces.has(s.href)) continue
    const key = `${s.practice}|${s.date}`
    unclaimed.set(key, [...(unclaimed.get(key) ?? []), s])
  }
  const settled = things.map((t) => {
    if (t.session || t.kind === 'presentation' || !t.date || !isPractice(t.house)) return t
    const next = unclaimed.get(`${t.house}|${t.date}`)?.shift()
    if (!next) return t
    add(next.href, t.title)
    // a convening's window counts toward no cycle, whichever session the day's order gives it
    return { ...t, countCycle: t.countCycle === null ? null : sessionCycle(next, cycles, until) }
  })
  return { things: settled, sessionPieces }
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
  /** what each session left or advanced, by the session's address (settlePieces) */
  sessionPieces: Map<string, string[]>
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
  const chronicle = loadChronicle()
  const long = longWorks(chronicle, (slug) => hasScore(slug))

  const until = lastDay([
    cycle.opened,
    ...cycles.map((c) => c.opened),
    ...sessions.map((s) => s.date),
    ...relations.map((r) => r.date),
    ...register.rows.filter((r) => isPractice(r.house)).map((r) => r.date),
  ])
  const tied = tieSessions(madeThings(register, presentations, cycles, until, presentationTitle), sessions, chronicle)
  const { things, sessionPieces } = settlePieces(tied, sessions, long, cycles, until)

  return {
    since: V3_SINCE,
    until,
    cycle,
    programme,
    cycles,
    sessions,
    things,
    sessionPieces,
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
    // the score the day is the bar the note stands in, so the readout says the rest. Each note
    // carries the cycle its own label names and what the record ties to it (2026-10-17).
    sessions: record.sessions.map((s) => {
      const { label, line } = sessionLabel(s.title)
      return {
        practice: s.practice,
        date: s.date,
        title: [label, line].filter(Boolean).join(' — ') || s.title,
        href: s.href,
        cycle: sessionCycle(s, record.cycles, record.until),
        pieces: record.sessionPieces.get(s.href) ?? [],
      }
    }),
    // Every dated piece is already with a session (settlePieces): tied to the one that made it,
    // or counted with its day's unclaimed sessions in order. None is left for the score's own day
    // count, which stays for callers that hand in pieces without sessions.
    pieces: [],
    presentations: record.presentations.map((p) => ({ practice: p.practice, cycle: p.cycle, date: p.date })),
    relations: record.relations,
    convening: record.convening?.opened ? { after: record.convening.afterCycle, opened: record.convening.opened } : null,
  }
}

// ── counting ─────────────────────────────────────────────────────────────────────────────────

/** Whether a day lies in a cycle: the half-open interval the score uses (score.ts). */
export const inScoreCycle = (date: string, cycle: ScoreCycle, until: string): boolean => cycleOn(date, [cycle], until) !== null

/** A practice's sessions of a cycle, by the label each note carries (2026-10-17) — not by the
 *  days the cycle spans, which also hold the convening that follows it. */
export const sessionsIn = (record: Pick<EcologyRecord, 'sessions' | 'cycles' | 'until'>, practice: PracticeId, cycle: number): SessionNote[] =>
  record.sessions.filter((s) => s.practice === practice && sessionCycle(s, record.cycles, record.until) === cycle)

/** A practice's works and artifacts that count toward a cycle — never its presentation, and never
 *  a piece of the convening after it (countCycle). */
export const piecesIn = (things: readonly MadeThing[], practice: PracticeId, cycle: number): MadeThing[] =>
  things.filter((t) => t.house === practice && t.kind !== 'presentation' && t.countCycle === cycle)

/** Everything a practice made under the order: its works and artifacts of cycle one onward. */
export const piecesSince = (things: readonly MadeThing[], practice: PracticeId): MadeThing[] =>
  things.filter((t) => t.house === practice && t.kind !== 'presentation' && t.cycle !== null && t.cycle >= 1)

/** Of two pieces, the one whose session came later — 0 unless the record ties both. */
function laterSession(a: MadeThing, b: MadeThing): number {
  return a.session && b.session ? compareSessions(b.session, a.session) : 0
}

/**
 * The newest piece of a practice: by cycle, then by day, then — on a day of several pieces — the
 * one whose session came last, then the one its own record numbers higher. Until 2026-10-17 a day's
 * pieces stood in the alphabet's order here, and the Atelier's page led with the window of a
 * day's first session.
 */
export function newestPiece(things: readonly MadeThing[], practice: PracticeId): MadeThing | null {
  const own = piecesSince(things, practice)
  if (own.length === 0) return null
  return [...own].sort(
    (a, b) => b.cycle! - a.cycle! || b.sortDay.localeCompare(a.sortDay) || laterSession(a, b) || (b.seq ?? -1) - (a.seq ?? -1),
  )[0]
}
