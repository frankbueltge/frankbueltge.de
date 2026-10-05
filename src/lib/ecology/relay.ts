// src/lib/ecology/relay.ts — the Middle's relay, read (2026-10-05).
//
// WHY THIS EXISTS. Until this day /encounters drew the bulletins' notes to the siblings and
// counted who addressed whom. A count of addresses cannot tell a courtesy from a dependency: a
// measurement of the v3 record (Frank's decision of 2026-10-05, wording private) found three in
// four sibling references to be courtesy and about one in six load-bearing, the Field never once
// building on or answering the Studio, and no joint work at all. So the page now draws a
// different record: the RELAY, which research-ecology publishes as `relay/relay.json` (contract
// "middle-relay/1") and the Ecology integrate workflow mirrors to src/data/middle/relay.json.
//
// A relation in the relay runs from a GIVER — the practice whose material it was — to a TAKER,
// the practice that did something with it, and says what: `built_on` (used as material),
// `answered` (a question or a number taken up and replied to), or `noted` (mentioned, nothing
// done with it). Both ends carry a commit-pinned reference, so every line on the page can be
// checked against the practice's own repository.
//
// Three rules this module keeps:
//   · ABSENT IS A LEGAL STATE. Until the relay first reports there is no file, and the page says
//     so rather than drawing an empty triangle that would read as "nothing passed".
//   · LOOSE, NEVER FATAL. A wrong contract, a file that does not parse, or a malformed entry
//     never fails the build: the first two are an honest empty state, the third is skipped and
//     counted, and the page says how many it skipped.
//   · RECOUNTED, NOT TRUSTED. The relay carries its own totals; every number the page shows is
//     recounted here from the relations, and the relay's own totals are only compared against it.
import fs from 'node:fs'
import path from 'node:path'

import { PRACTICES, type PracticeId } from './v3'

export const RELAY_CONTRACT = 'middle-relay/1'
/** Where the mirror lands the relay (.github/workflows/ecology-integrate.yml). */
export const RELAY_PATH = 'src/data/middle/relay.json'
/** The order in force since 2026-08-30 — research ecology v3, the shared question. */
export const V3_SINCE = '2026-08-30'

export type RelayKind = 'built_on' | 'answered' | 'noted'
/** In order of weight: the order the figure stacks them and the table lists them. */
export const KINDS: readonly RelayKind[] = ['built_on', 'answered', 'noted']
/** The kinds that carry something — a direction with none of these is drawn empty. */
export const LOAD_BEARING: readonly RelayKind[] = ['built_on', 'answered']

export type HandoffStatus = 'open' | 'taken' | 'declined' | 'lapsed'
const STATUSES: readonly HandoffStatus[] = ['open', 'taken', 'declined', 'lapsed']

/** The repositories a reference may point into — the three practices' own. */
export const RELAY_REPOS = ['field-research', 'ulysses', 'studio'] as const
export type RelayRepo = (typeof RELAY_REPOS)[number]

export interface RelayRef {
  repo: RelayRepo
  path: string
  commit: string
}

export interface Relation {
  id: string
  date: string
  giver: PracticeId
  taker: PracticeId
  kind: RelayKind
  /** the relay's own one-line account, at most 140 characters by contract */
  what: string
  thread: string | null
  /** null when the reference is missing or malformed — drawn as "no reference", never guessed */
  giverRef: RelayRef | null
  takerRef: RelayRef | null
  /** what this relation corrects, as the relay states it; an id when it names another relation */
  corrects: string | null
}

export interface HandoffTaken {
  practice: PracticeId
  date: string
  /** the id of the relation that took the handoff up */
  relation: string | null
}

export interface Handoff {
  id: string
  offeredOn: string
  giver: PracticeId
  to: PracticeId[]
  offer: string
  ref: RelayRef | null
  status: HandoffStatus
  takenBy: HandoffTaken | null
}

export type KindCounts = Record<RelayKind, number>

export interface RelayCounts extends KindCounts {
  open_handoffs: number
}

export interface Relay {
  generatedAt: string
  cycle: number | null
  question: string | null
  period: { from: string; to: string } | null
  relations: Relation[]
  handoffs: Handoff[]
  /** the relay's own totals, kept only to be compared with the recount */
  declaredCounts: Partial<RelayCounts> | null
  /** entries dropped because they did not hold the contract's shape */
  skipped: number
}

export type RelayState =
  | { status: 'absent' }
  | { status: 'invalid'; reason: string }
  | { status: 'ok'; relay: Relay }

const DATE = /^\d{4}-\d{2}-\d{2}$/
const COMMIT = /^[0-9a-f]{7,40}$/i

type Raw = Record<string, unknown>
const isObject = (v: unknown): v is Raw => typeof v === 'object' && v !== null && !Array.isArray(v)
const isPractice = (v: unknown): v is PracticeId => typeof v === 'string' && (PRACTICES as string[]).includes(v)
const isKind = (v: unknown): v is RelayKind => typeof v === 'string' && (KINDS as string[]).includes(v)
const isDate = (v: unknown): v is string => typeof v === 'string' && DATE.test(v)
const text = (v: unknown): string | null => (typeof v === 'string' && v.trim().length > 0 ? v.trim() : null)

/** A reference is usable only when all three parts are: an allowed repository, a path inside it,
 *  and a commit — a link that cannot be followed would be a claim of evidence without any. */
export function parseRef(raw: unknown): RelayRef | null {
  if (!isObject(raw)) return null
  const repo = raw.repo
  const refPath = text(raw.path)
  const commit = text(raw.commit)
  if (typeof repo !== 'string' || !(RELAY_REPOS as readonly string[]).includes(repo)) return null
  if (!refPath || refPath.split('/').includes('..')) return null
  if (!commit || !COMMIT.test(commit)) return null
  return { repo: repo as RelayRepo, path: refPath.replace(/^\/+/, ''), commit }
}

/** The evidence link of a reference: the file at the commit the relay pinned, in the practice's
 *  own repository. Each path segment is encoded; the separators are not. */
export function evidenceUrl(ref: RelayRef | null): string | null {
  if (!ref) return null
  const encoded = ref.path.split('/').map(encodeURIComponent).join('/')
  return `https://github.com/frankbueltge/${ref.repo}/blob/${ref.commit}/${encoded}`
}

function parseRelation(raw: unknown): Relation | null {
  if (!isObject(raw)) return null
  const id = text(raw.id)
  const what = text(raw.what)
  if (!id || !what || !isDate(raw.date) || !isKind(raw.kind)) return null
  if (!isPractice(raw.giver) || !isPractice(raw.taker) || raw.giver === raw.taker) return null
  return {
    id,
    date: raw.date,
    giver: raw.giver,
    taker: raw.taker,
    kind: raw.kind,
    what,
    thread: text(raw.thread),
    giverRef: parseRef(raw.giver_ref),
    takerRef: parseRef(raw.taker_ref),
    corrects: text(raw.corrects),
  }
}

function parseHandoff(raw: unknown): Handoff | null {
  if (!isObject(raw)) return null
  const id = text(raw.id)
  const offer = text(raw.offer)
  if (!id || !offer || !isDate(raw.offered_on) || !isPractice(raw.giver)) return null
  if (typeof raw.status !== 'string' || !(STATUSES as readonly string[]).includes(raw.status)) return null
  const giver = raw.giver
  const to = Array.isArray(raw.to) ? [...new Set(raw.to.filter(isPractice))].filter((p) => p !== giver) : []
  let takenBy: HandoffTaken | null = null
  if (isObject(raw.taken_by) && isPractice(raw.taken_by.practice) && isDate(raw.taken_by.date)) {
    takenBy = { practice: raw.taken_by.practice, date: raw.taken_by.date, relation: text(raw.taken_by.relation) }
  }
  return {
    id,
    offeredOn: raw.offered_on,
    giver,
    to,
    offer,
    ref: parseRef(raw.ref),
    status: raw.status as HandoffStatus,
    takenBy,
  }
}

/** Reads a parsed relay.json against the contract, loosely: the contract string and the two
 *  lists are required, every entry is checked on its own, and an entry that fails is skipped and
 *  counted rather than failing the whole record. */
export function parseRelay(raw: unknown): RelayState {
  if (!isObject(raw)) return { status: 'invalid', reason: 'not a JSON object' }
  if (raw.$contract !== RELAY_CONTRACT) {
    return { status: 'invalid', reason: `contract "${String(raw.$contract)}" is not "${RELAY_CONTRACT}"` }
  }
  if (!Array.isArray(raw.relations) || !Array.isArray(raw.handoffs)) {
    return { status: 'invalid', reason: 'relations or handoffs is not a list' }
  }
  const relations: Relation[] = []
  const handoffs: Handoff[] = []
  const seen = new Set<string>()
  let skipped = 0
  for (const entry of raw.relations) {
    const r = parseRelation(entry)
    // An id met twice is a record contradicting itself; the first stands, the second is skipped.
    if (r && !seen.has(r.id)) {
      seen.add(r.id)
      relations.push(r)
    } else skipped++
  }
  const seenHandoffs = new Set<string>()
  for (const entry of raw.handoffs) {
    const h = parseHandoff(entry)
    if (h && !seenHandoffs.has(h.id)) {
      seenHandoffs.add(h.id)
      handoffs.push(h)
    } else skipped++
  }
  const period =
    isObject(raw.period) && isDate(raw.period.from) && isDate(raw.period.to)
      ? { from: raw.period.from, to: raw.period.to }
      : null
  const declaredCounts = isObject(raw.counts)
    ? (Object.fromEntries(
        Object.entries(raw.counts).filter(([, v]) => typeof v === 'number' && Number.isFinite(v)),
      ) as Partial<RelayCounts>)
    : null
  return {
    status: 'ok',
    relay: {
      generatedAt: text(raw.generated_at) ?? '',
      cycle: typeof raw.cycle === 'number' && Number.isFinite(raw.cycle) ? raw.cycle : null,
      question: text(raw.question),
      period,
      relations: sortRelations(relations),
      handoffs,
      declaredCounts,
      skipped,
    },
  }
}

/** Reads the mirrored relay at build time. A file that is not there is the state before the
 *  relay first reports; a file that does not parse is an empty state too — never a failed build. */
export function loadRelay(root: string = process.cwd()): RelayState {
  const file = path.join(root, RELAY_PATH)
  if (!fs.existsSync(file)) return { status: 'absent' }
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch (e) {
    return { status: 'invalid', reason: `does not parse as JSON (${(e as Error).message})` }
  }
  return parseRelay(raw)
}

// ——— derivations ————————————————————————————————————————————————————————————————

/** Newest first; within a day, by id — so two builds of one relay print one order. */
export function sortRelations(relations: Relation[]): Relation[] {
  return [...relations].sort((a, b) => b.date.localeCompare(a.date) || a.id.localeCompare(b.id))
}

/** The relations dated on or after `since` — the window the figure is drawn for. */
export function relationsSince(relations: Relation[], since: string): Relation[] {
  return relations.filter((r) => r.date >= since)
}

export const zeroCounts = (): KindCounts => ({ built_on: 0, answered: 0, noted: 0 })

export function countKinds(relations: Relation[]): KindCounts {
  const out = zeroCounts()
  for (const r of relations) out[r.kind]++
  return out
}

export const loadBearing = (c: KindCounts): number => LOAD_BEARING.reduce((s, k) => s + c[k], 0)

/** The six directed pairs, in the house order of the practices — the same order everywhere. */
export const DIRECTED_PAIRS: readonly { giver: PracticeId; taker: PracticeId }[] = PRACTICES.flatMap((giver) =>
  PRACTICES.filter((taker) => taker !== giver).map((taker) => ({ giver, taker })),
)

export const pairId = (giver: PracticeId, taker: PracticeId): string => `${giver}-${taker}`

export interface PairCounts {
  id: string
  giver: PracticeId
  taker: PracticeId
  counts: KindCounts
  /** built on + answered */
  loadBearing: number
  /** the pair's relations, newest first */
  relations: Relation[]
}

/** Per directed pair giver → taker: the counts by kind, zeros included — an empty direction is
 *  a fact the figure draws, so it is never left out of the list. */
export function pairCounts(relations: Relation[]): PairCounts[] {
  return DIRECTED_PAIRS.map(({ giver, taker }) => {
    const mine = sortRelations(relations.filter((r) => r.giver === giver && r.taker === taker))
    const counts = countKinds(mine)
    return { id: pairId(giver, taker), giver, taker, counts, loadBearing: loadBearing(counts), relations: mine }
  })
}

export interface PracticeTotals {
  /** what the practice's material became in a sibling's hands */
  given: KindCounts
  /** what the practice did with a sibling's material */
  received: KindCounts
}

export function practiceTotals(relations: Relation[]): Record<PracticeId, PracticeTotals> {
  const out = Object.fromEntries(
    PRACTICES.map((p) => [p, { given: zeroCounts(), received: zeroCounts() }]),
  ) as Record<PracticeId, PracticeTotals>
  for (const r of relations) {
    out[r.giver].given[r.kind]++
    out[r.taker].received[r.kind]++
  }
  return out
}

/** The directions in which nothing load-bearing has passed — no relation built on and none
 *  answered. A direction with only notes is in this list: a mention carries nothing. */
export function isolation(relations: Relation[]): { giver: PracticeId; taker: PracticeId }[] {
  return pairCounts(relations)
    .filter((p) => p.loadBearing === 0)
    .map(({ giver, taker }) => ({ giver, taker }))
}

export interface Thread {
  id: string
  /** oldest first — a thread is read in the order it happened */
  relations: Relation[]
  practices: PracticeId[]
  first: string
  last: string
}

/** Relations grouped by the thread the relay assigned them; most recently active thread first. */
export function threads(relations: Relation[]): Thread[] {
  const byId = new Map<string, Relation[]>()
  for (const r of relations) {
    if (!r.thread) continue
    byId.set(r.thread, [...(byId.get(r.thread) ?? []), r])
  }
  return [...byId.entries()]
    .map(([id, rs]) => {
      const ordered = [...rs].sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
      const involved = new Set(ordered.flatMap((r) => [r.giver, r.taker]))
      return {
        id,
        relations: ordered,
        practices: PRACTICES.filter((p) => involved.has(p)),
        first: ordered[0]!.date,
        last: ordered[ordered.length - 1]!.date,
      }
    })
    .sort((a, b) => b.last.localeCompare(a.last) || a.id.localeCompare(b.id))
}

/** Whole days from `from` to `asOf`, both ISO dates; never negative. */
export function ageInDays(from: string, asOf: string): number {
  const ms = Date.parse(`${asOf.slice(0, 10)}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)
  return Number.isFinite(ms) ? Math.max(0, Math.round(ms / 86_400_000)) : 0
}

/** The open handoffs, newest offer first. */
export function openHandoffs(handoffs: Handoff[]): Handoff[] {
  return byOffer(handoffs.filter((h) => h.status === 'open'))
}

/** The rest — taken, declined, lapsed — newest offer first. */
export function closedHandoffs(handoffs: Handoff[]): Handoff[] {
  return byOffer(handoffs.filter((h) => h.status !== 'open'))
}

function byOffer(handoffs: Handoff[]): Handoff[] {
  return [...handoffs].sort((a, b) => b.offeredOn.localeCompare(a.offeredOn) || a.id.localeCompare(b.id))
}

export interface CountsCheck {
  /** true when the relay states no totals, or every total it states equals the recount */
  agrees: boolean
  /** the totals that differ, as [name, the relay's figure, the recount] */
  differences: [string, number, number][]
}

/** Holds the relay's own totals against the recount over its whole record. */
export function checkDeclaredCounts(relay: Relay): CountsCheck {
  const recount: RelayCounts = { ...countKinds(relay.relations), open_handoffs: openHandoffs(relay.handoffs).length }
  const differences: [string, number, number][] = []
  for (const [name, declared] of Object.entries(relay.declaredCounts ?? {})) {
    if (!(name in recount)) continue
    const mine = recount[name as keyof RelayCounts]
    if (declared !== mine) differences.push([name, declared as number, mine])
  }
  return { agrees: differences.length === 0, differences }
}
