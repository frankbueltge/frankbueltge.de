// src/lib/ecology/convening.ts — the convening and the programme, read (2026-10-07).
//
// Frank's decision of 2026-10-07 (wording private; decision record
// docs/design/2026-10-07-the-convening.md): between research cycles the three practices negotiate
// the next question in a CONVENING instead of the cycle clock turning the next round on the
// continuing question by itself, and over the cycles a shared research PROGRAMME emerges.
//
// Both are carried by the Middle's relay (research-ecology `relay/relay.json`, contract
// "middle-relay/1", extended additively by two optional sections) and mirrored to
// src/data/middle/relay.json. This module reads them with the relay loader's three rules
// (src/lib/ecology/relay.ts): absent is a legal state, loose and never fatal, and nothing the
// relay says is trusted where it can be checked. It also holds the convening's two dates — the
// architect's veto day and the fallback day — because the cycle clock (cycle-turn.ts) and the
// pages must agree on them to the day: the page says "opens on <date>" only because the clock
// opens on exactly that date.
import fs from 'node:fs'
import path from 'node:path'

import { addDays, evidenceUrl, parseRef, parseRelay, RELAY_PATH, type RelayRef } from './relay'
import { PRACTICES, type CycleSource, type CycleState, type PracticeId, type PresentationEntry } from './v3'

/** A result opens the next cycle this many days after it was tallied: the architect's veto
 *  window. His silence is consent. */
export const VETO_DAYS = 1
/** Without a result this many days after the convening opened, the next cycle opens on the
 *  continuing question — the fallback, so that no convening can hold the ecology still. */
export const CONVENING_DAYS = 7

export interface ConveningProposal {
  practice: PracticeId
  question: string
  /** how the proposal docks onto the programme so far, in the proposing practice's words */
  docksOnto: string | null
  date: string | null
  ref: RelayRef | null
}

export interface ConveningRanking {
  practice: PracticeId
  /** the proposals ranked, best first, named by the practice that proposed them */
  order: PracticeId[]
  date: string | null
  ref: RelayRef | null
}

export interface ConveningResult {
  question: string
  proposedBy: PracticeId | null
  /** the tally per proposing practice, as the relay states it */
  scores: Partial<Record<PracticeId, number>>
  talliedOn: string
  rule: string | null
}

export interface RelayConvening {
  afterCycle: number
  opened: string | null
  proposals: ConveningProposal[]
  rankings: ConveningRanking[]
  result: ConveningResult | null
  /** entries dropped because they did not hold the contract's shape */
  skipped: number
}

export interface ProgrammeFinding {
  practice: PracticeId
  line: string
  ref: RelayRef | null
}

export interface ProgrammeEntry {
  cycle: number
  question: string | null
  source: CycleSource | null
  opened: string | null
  closed: string | null
  findings: ProgrammeFinding[]
}

export interface RelayExtras {
  status: 'absent' | 'invalid' | 'ok'
  reason?: string
  /** null when the relay carries no convening (the section is optional, and null between them) */
  convening: RelayConvening | null
  /** null when the relay carries no programme section yet */
  programme: ProgrammeEntry[] | null
  /** programme entries and findings dropped as malformed */
  skipped: number
}

type Raw = Record<string, unknown>
const DATE = /^\d{4}-\d{2}-\d{2}$/
const SOURCES: readonly CycleSource[] = ['defaults', 'seed', 'continuing', 'convening']
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const isPractice = (v: unknown): v is PracticeId => typeof v === 'string' && (PRACTICES as string[]).includes(v)
const date = (v: unknown): string | null => (typeof v === 'string' && DATE.test(v) ? v : null)
const text = (v: unknown): string | null => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null)
const cycleNo = (v: unknown): number | null =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 ? v : null

// ——— parsing ————————————————————————————————————————————————————————————————————

function parseProposal(raw: unknown): ConveningProposal | null {
  if (!isObject(raw) || !isPractice(raw.practice)) return null
  const question = text(raw.question)
  if (!question) return null
  return { practice: raw.practice, question, docksOnto: text(raw.docks_onto), date: date(raw.date), ref: parseRef(raw.ref) }
}

function parseRanking(raw: unknown): ConveningRanking | null {
  if (!isObject(raw) || !isPractice(raw.practice) || !Array.isArray(raw.order)) return null
  const order = [...new Set(raw.order.filter(isPractice))]
  if (order.length === 0) return null
  return { practice: raw.practice, order, date: date(raw.date), ref: parseRef(raw.ref) }
}

function parseResult(raw: unknown): ConveningResult | null {
  if (!isObject(raw)) return null
  const question = text(raw.question)
  const talliedOn = date(raw.tallied_on)
  if (!question || !talliedOn) return null
  const scores: Partial<Record<PracticeId, number>> = {}
  if (isObject(raw.scores)) {
    for (const p of PRACTICES) {
      const s = raw.scores[p]
      if (typeof s === 'number' && Number.isFinite(s)) scores[p] = s
    }
  }
  return {
    question,
    proposedBy: isPractice(raw.proposed_by) ? raw.proposed_by : null,
    scores,
    talliedOn,
    rule: text(raw.rule),
  }
}

/** The relay's `convening` section, loosely: a section without a readable `after_cycle` is no
 *  convening at all (nothing could tie it to a cycle), a malformed entry is skipped and counted,
 *  and a result that names no question or no tally day is no result. */
export function parseConvening(raw: unknown): RelayConvening | null {
  if (!isObject(raw)) return null
  const afterCycle = cycleNo(raw.after_cycle)
  if (afterCycle === null) return null
  let skipped = 0
  const proposals: ConveningProposal[] = []
  for (const e of Array.isArray(raw.proposals) ? raw.proposals : []) {
    const p = parseProposal(e)
    if (p) proposals.push(p)
    else skipped++
  }
  const rankings: ConveningRanking[] = []
  for (const e of Array.isArray(raw.rankings) ? raw.rankings : []) {
    const r = parseRanking(e)
    if (r) rankings.push(r)
    else skipped++
  }
  const result = raw.result == null ? null : parseResult(raw.result)
  if (raw.result != null && result === null) skipped++
  const byPractice = (a: { practice: PracticeId }, b: { practice: PracticeId }) =>
    PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice)
  return {
    afterCycle,
    opened: date(raw.opened),
    proposals: proposals.sort(byPractice),
    rankings: rankings.sort(byPractice),
    result,
    skipped,
  }
}

/** The relay's `programme` section: one entry per cycle, oldest first; a cycle met twice keeps
 *  its first entry, as an id met twice does in the relay's relations. */
export function parseProgramme(raw: unknown): { entries: ProgrammeEntry[]; skipped: number } | null {
  if (!Array.isArray(raw)) return null
  const entries: ProgrammeEntry[] = []
  const seen = new Set<number>()
  let skipped = 0
  for (const e of raw) {
    const cycle = isObject(e) ? cycleNo(e.cycle) : null
    if (!isObject(e) || cycle === null || seen.has(cycle)) {
      skipped++
      continue
    }
    seen.add(cycle)
    const findings: ProgrammeFinding[] = []
    for (const f of Array.isArray(e.findings) ? e.findings : []) {
      const line = isObject(f) ? text(f.line) : null
      if (!isObject(f) || !isPractice(f.practice) || !line) {
        skipped++
        continue
      }
      findings.push({ practice: f.practice, line, ref: parseRef(f.ref) })
    }
    findings.sort((a, b) => PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice))
    entries.push({
      cycle,
      question: text(e.question),
      source: typeof e.source === 'string' && (SOURCES as readonly string[]).includes(e.source) ? (e.source as CycleSource) : null,
      opened: date(e.opened),
      closed: date(e.closed),
      findings,
    })
  }
  return { entries: entries.sort((a, b) => a.cycle - b.cycle), skipped }
}

/** Reads both sections from a parsed relay. A relay the relay loader would refuse (wrong
 *  contract, broken lists) is refused here too, so /ecology and /encounters never disagree on
 *  whether the relay can be read. */
export function readRelayExtras(raw: unknown): RelayExtras {
  const verdict = parseRelay(raw)
  if (verdict.status !== 'ok') {
    return { status: 'invalid', reason: verdict.status === 'invalid' ? verdict.reason : undefined, convening: null, programme: null, skipped: 0 }
  }
  const r = raw as Raw
  const programme = parseProgramme(r.programme)
  return {
    status: 'ok',
    convening: parseConvening(r.convening),
    programme: programme ? programme.entries : null,
    skipped: programme?.skipped ?? 0,
  }
}

/** The mirrored relay's convening and programme, at build time or in the cycle clock. A missing
 *  file and a file that does not parse are both empty states, never an exception. */
export function loadRelayExtras(root: string = process.cwd()): RelayExtras {
  const file = path.join(root, RELAY_PATH)
  if (!fs.existsSync(file)) return { status: 'absent', convening: null, programme: null, skipped: 0 }
  try {
    return readRelayExtras(JSON.parse(fs.readFileSync(file, 'utf8')))
  } catch (e) {
    return { status: 'invalid', reason: (e as Error).message, convening: null, programme: null, skipped: 0 }
  }
}

// ——— the two dates (shared by the clock and the pages) ——————————————————————————————

/** The day a tallied result opens the next cycle: the day after the tally. */
export function opensOn(result: ConveningResult): string {
  return addDays(result.talliedOn, VETO_DAYS)!
}

/** The day a convening without a result falls back to the continuing question. */
export function fallbackOn(conveningOpened: string): string {
  return addDays(conveningOpened, CONVENING_DAYS)!
}

/**
 * The result that may open the cycle after `afterCycle`, or null: the relay's result for that
 * very convening, unless the architect objected on or after the day it was tallied. A result
 * tallied after his objection stands again — the practices may tally anew.
 */
export function standingResult(
  afterCycle: number,
  objected: string | null,
  relay: RelayConvening | null,
): ConveningResult | null {
  if (!relay || relay.afterCycle !== afterCycle || !relay.result) return null
  if (objected && relay.result.talliedOn <= objected) return null
  return relay.result
}

// ——— the convening, as /ecology shows it ————————————————————————————————————————————

export interface ConveningView {
  afterCycle: number
  next: number
  opened: string
  fallbackOn: string
  /** the question the fallback opens, when one is set */
  continuing: string | null
  objected: string | null
  relayStatus: RelayExtras['status']
  /** the relay carries this convening (after_cycle equals the presented cycle) */
  recorded: boolean
  proposals: ConveningProposal[]
  rankings: ConveningRanking[]
  /** the relay's result for this convening, standing or objected to */
  result: ConveningResult | null
  /** the result is not set aside by an objection */
  stands: boolean
  /** the day the cycle clock opens the next cycle on a standing result — null without one, and
   *  null without a continuing question, because then the clock does not turn at all */
  opensOn: string | null
}

/** The convening the house is in, or null outside the convening phase. */
export function conveningView(cycle: CycleState, extras: RelayExtras): ConveningView | null {
  if (cycle.phase !== 'convening' || !cycle.convening) return null
  const c = cycle.convening
  const mine = extras.convening && extras.convening.afterCycle === c.afterCycle ? extras.convening : null
  const standing = standingResult(c.afterCycle, c.objected, mine)
  return {
    afterCycle: c.afterCycle,
    next: c.afterCycle + 1,
    opened: c.opened,
    fallbackOn: fallbackOn(c.opened),
    continuing: cycle.continuing?.question ?? null,
    objected: c.objected,
    relayStatus: extras.status,
    recorded: mine !== null,
    proposals: mine?.proposals ?? [],
    rankings: mine?.rankings ?? [],
    result: mine?.result ?? null,
    stands: standing !== null,
    opensOn: standing && cycle.continuing ? opensOn(standing) : null,
  }
}

/** The tally as the relay states it, highest first; ties keep the house order of the practices. */
export function rankedScores(result: ConveningResult): { practice: PracticeId; score: number }[] {
  return PRACTICES.flatMap((p) => (result.scores[p] === undefined ? [] : [{ practice: p, score: result.scores[p]! }])).sort(
    (a, b) => b.score - a.score,
  )
}

// ——— the programme, as /ecology shows it ————————————————————————————————————————————

export interface ProgrammeRowFinding {
  practice: PracticeId
  line: string
  /** the practice's own file at the commit the relay pinned, or null where it pinned none */
  href: string | null
}

export interface ProgrammeRowPresentation {
  practice: PracticeId
  title: string | null
  href: string
}

export interface ProgrammeRow {
  cycle: number
  question: string | null
  source: CycleSource | null
  opened: string | null
  closed: string | null
  /** the practices' "For the programme" lines — only the relay carries them */
  findings: ProgrammeRowFinding[]
  /** what the site's own shelf holds for the cycle, shown where the relay is silent */
  presented: ProgrammeRowPresentation[]
  /** the cycle cycle.json names — working, or presented and in its convening */
  running: boolean
  from: 'relay' | 'site'
}

export interface ProgrammeView {
  /** 'relay' when the relay carries a programme, 'site' when the chain is the site's own record */
  from: 'relay' | 'site'
  /** oldest first: the chain as it grew */
  rows: ProgrammeRow[]
}

/** The running cycle as cycle.json states it — the one cycle the site knows in full. */
function runningRow(cycle: CycleState, presented: ProgrammeRowPresentation[]): ProgrammeRow {
  return {
    cycle: cycle.cycle,
    question: cycle.source !== 'defaults' ? cycle.question : null,
    source: cycle.source,
    opened: cycle.opened,
    closed: null,
    findings: [],
    presented,
    running: true,
    from: 'site',
  }
}

/**
 * The chain of cycles. From the relay's programme when it carries one — with the running cycle
 * added from cycle.json when the relay has not reached it yet, since the relay is written after
 * the fact. Without a programme in the relay, the chain is what the site itself knows: the
 * running cycle, and every earlier cycle its presentation shelf holds, each with the
 * presentations' own titles. Nothing is inferred: a question the site does not hold is null.
 */
export function buildProgramme(
  relay: ProgrammeEntry[] | null,
  cycle: CycleState,
  shelf: readonly PresentationEntry[],
): ProgrammeView {
  const presentedIn = (n: number): ProgrammeRowPresentation[] =>
    shelf
      .filter((p) => p.cycle === n)
      .sort((a, b) => PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice))
      .map((p) => ({ practice: p.practice, title: p.title ?? null, href: p.href }))

  if (relay && relay.length > 0) {
    const rows: ProgrammeRow[] = relay.map((e) => ({
      cycle: e.cycle,
      question: e.question,
      source: e.source,
      opened: e.opened,
      closed: e.closed,
      findings: e.findings.map((f) => ({ practice: f.practice, line: f.line, href: evidenceUrl(f.ref) })),
      presented: [],
      running: e.cycle === cycle.cycle,
      from: 'relay',
    }))
    if (!relay.some((e) => e.cycle === cycle.cycle)) rows.push(runningRow(cycle, []))
    return { from: 'relay', rows: rows.sort((a, b) => a.cycle - b.cycle) }
  }

  const numbers = [...new Set([...shelf.map((p) => p.cycle), cycle.cycle])].sort((a, b) => a - b)
  const rows = numbers.map((n): ProgrammeRow =>
    n === cycle.cycle
      ? runningRow(cycle, presentedIn(n))
      : {
          cycle: n,
          question: null,
          source: null,
          opened: null,
          closed: null,
          findings: [],
          presented: presentedIn(n),
          running: false,
          from: 'site',
        },
  )
  return { from: 'site', rows }
}
