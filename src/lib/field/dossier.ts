// src/lib/field/dossier.ts — the instrument dossier: what an instrument measures, the verdict
// it locked, where it stands, and every move of the register that names it.
//
// WHY THIS EXISTS. /field used to be ONE instrument's record strip with a guided tour bolted on
// top: a visitor who wanted instrument 007 got a link to another page, and the tour drove a
// figure that stayed on the tour's own week no matter what else the page said. This module is
// the other arrangement — every instrument gets the same dossier, and the entrance switches the
// WHOLE dossier when the selection changes. The protagonist is the ROLE (the instrument in
// service), never a hand-set actor: `inService` is position in the committed order, exactly the
// derivation latest.ts already makes for the header, so the band and the dossier cannot disagree.
//
// THE HOUSE RULE. Nothing here is written, summarised or rounded. Every string this module
// returns is a span of a committed file, carried with the repo-relative path it came from so the
// page can print it beside the quote. Where the record says nothing this returns null and the
// page says so in words — an invented value would be a lie in an archive whose whole claim is
// that it can be checked. No visitor-facing COPY lives here either: this module returns the
// record's own words plus a `role`/`key` token, and src/config/field-wording.ts supplies the
// labels around them.
//
// PURE BY CONSTRUCTION, with ONE deliberate exception: `entriesForWork` and the verdict
// vocabulary are imported from ./chronicle rather than restated, because a second copy of the
// attachment rule is exactly how two surfaces start telling different stories about the same
// register. Everything else is handed in by the caller, so this module is unit-testable against
// the real committed files.
//
// ————————————————————————————————————————————————————————————————————————————————————————————
// THE THREE ATTACHMENT RULES, and why each is deliberately conservative. Misfiling a record is
// worse than omitting it, because a misfiled record still reads as evidence.
//
//   1. REGISTER → INSTRUMENT. Only the chronicle entry's own `works` array counts. No filename
//      match, no date match, no prose match. Consequences, both of them honest and visible: the
//      register names four work slugs that the committed mirror does not carry yet (the engine
//      shipped past the sync), and those entries attach to nothing; and one committed instrument
//      is named by no entry at all, whose dossier says so instead of borrowing a neighbour's.
//   2. ENCOUNTER → INSTRUMENT. An encounter's ledger attaches only where the encounter's own
//      `akte` path names the instrument (`/akte/encounters/enc-2026-001-calibration-gap-travels`
//      names `calibration-gap`). Longest instrument name wins, so a longer name cannot be
//      captured by a shorter one it contains. An encounter naming no instrument attaches to
//      none. This REPLACES the entrance's previous wiring, which hung whichever encounter
//      happened to be current onto whichever instrument happened to be newest — two moving parts
//      with nothing tying them together (and, by 2026-08-01, silently drawing no marks at all,
//      because the current encounter carries none of the event types that wiring looked for).
//   3. CONTESTED CLAIM → INSTRUMENT. The runtime's parallax export names no instrument slug
//      anywhere, so this module does NOT guess: the caller passes the slug the committed record
//      ties the claim to (the gauntlet tour's own module names it), and the dossier carries the
//      claim plate there and nowhere else.

import { entriesForWork, VERDICTS, type ChronicleEntry } from './chronicle'
import { orderInstruments, type InstrumentMeta } from './latest'
import { plateSpan } from './strip'

// ————————————————————————————————————————————————— quotations ————————————————

/** A span of a committed file, carried with the path it was read from. */
export interface Quoted {
  /** the record's words, verbatim */
  text: string
  /** repo-relative path it was read from — printed with the quote */
  source: string
}

/**
 * A verdict the work locked into its own record: an all-caps label, plus the sentence it stands
 * in, both verbatim.
 *
 * WHAT COUNTS AS ONE. Meridian writes its locked labels in capitals inside the work's own
 * description — `NO SIGNAL BEYOND ORDINARY DRIFT`, `UNABLE-TO-RING-ITS-OWN-BELL`, `FILED IN
 * PART`, `AS REPORTED` / `AS THE GRID SAW IT`. So: a run of two or more capitalised words, or a
 * single hyphenated capitalised token of at least eight characters. Two exclusions keep the rule
 * from inventing verdicts out of vocabulary — a bare acronym (`MTLD`, `CSP`) is not a label, and
 * neither is a token with an all-digit part (`HTTP-200` is a status code, not a finding).
 */
export interface LockedLabel {
  /** the label itself, verbatim */
  label: string
  /** the sentence the label stands in, verbatim */
  sentence: string
  source: string
}

const CAPS_RUN = /\b[A-Z][A-Z0-9'’]*(?:-[A-Z0-9'’]+)*(?:\s+[A-Z][A-Z0-9'’]*(?:-[A-Z0-9'’]+)*)*\b/g

export function isLockedLabel(run: string): boolean {
  const words = run.split(/\s+/)
  if (words.some((word) => word.length < 2)) return false
  if (words.length >= 2) return true
  const [only] = words
  if (!only.includes('-')) return false
  if (only.split('-').some((part) => /^[0-9]+$/.test(part))) return false
  return only.length >= 8
}

/** The sentence a span sits in, verbatim — bounded by sentence punctuation, never mid-word. */
export function sentenceAround(text: string, at: number, length: number): string {
  let start = 0
  for (const m of text.slice(0, at).matchAll(/[.!?](?=\s)/g)) start = (m.index ?? 0) + 1
  const rest = text.slice(at + length)
  const end = /[.!?](?=\s|$)/.exec(rest)
  return text.slice(start, at + length + (end ? end.index + 1 : rest.length)).trim()
}

/** Every locked label in the record's own fields, in the order the record writes them. A label
 *  the record repeats is carried once — the second occurrence is the same verdict, not a second
 *  one — and the first occurrence keeps its own sentence. */
export function readLockedLabels(
  fields: readonly { text: string | undefined; source: string }[],
): LockedLabel[] {
  const out: LockedLabel[] = []
  const seen = new Set<string>()
  for (const { text, source } of fields) {
    if (!text) continue
    for (const m of text.matchAll(CAPS_RUN)) {
      const label = m[0]
      const at = m.index ?? 0
      if (!isLockedLabel(label) || seen.has(label)) continue
      seen.add(label)
      out.push({ label, sentence: sentenceAround(text, at, label.length), source })
    }
  }
  return out
}

// ————————————————————————————————————————————————— where it stands ———————————

/**
 * Where an instrument stands, in four shapes — and every one of them is a fact somebody can
 * check, not a grade this site awards:
 *
 *   · `in-service`   — it is the newest instrument in the committed order. Derived exactly as
 *                      latest.ts derives the header's own pointer, so the two cannot disagree.
 *   · `reviewed`     — the register's latest entry for it words its verdict with one of the
 *                      chronicle's own known review words, which the page can name in plain
 *                      language (chronicle.ts VERDICTS).
 *   · `recorded`     — the register HAS a verdict for it and words that verdict itself, in a
 *                      sentence of its own. The page prints it verbatim rather than squeezing a
 *                      free sentence into a vocabulary it was not written in.
 *   · `unregistered` — no chronicle entry names this instrument. Stated, never filled in.
 */
export type StandKey = 'in-service' | 'reviewed' | 'recorded' | 'unregistered'

export interface Stand {
  key: StandKey
  /** the chronicle's own review word where its latest verdict opens with one, else null */
  verdictWord: string | null
  /** that latest verdict, verbatim; null where the register records none */
  verdictText: string | null
  /** the register entry the stand was read from, or null for the derived in-service position */
  from: { date: string; session: number | null; anchor: string } | null
}

const KNOWN_VERDICTS = new Set<string>(VERDICTS)

/**
 * The chronicle's own review word for a verdict, where the verdict opens with one.
 *
 * The upstream half of the register words its verdicts freely — `'deferred — built as a draft,
 * full gauntlet owed before it ships'` opens with a known word and means it; `'shipped as
 * instrument 019, an offer: …'` does not, and must not be forced into one. So: the LEADING word
 * only, and only from the vocabulary chronicle.ts already declares.
 */
export function verdictWord(verdict: string | null | undefined): string | null {
  const lead = /^\s*([a-z]+)/.exec((verdict ?? '').toLowerCase())?.[1]
  return lead && KNOWN_VERDICTS.has(lead) ? lead : null
}

export function standOf(moves: readonly DossierMove[], inService: boolean): Stand {
  const latest = moves[0] ?? null // moves arrive newest first
  const word = verdictWord(latest?.verdict)
  const from = latest ? { date: latest.date, session: latest.session, anchor: latest.anchor } : null
  const key: StandKey = inService
    ? 'in-service'
    : !latest
      ? 'unregistered'
      : word
        ? 'reviewed'
        : 'recorded'
  return { key, verdictWord: word, verdictText: latest?.verdict ?? null, from }
}

// ————————————————————————————————————————————————— the register's moves ——————

/** One chronicle entry that names this instrument — every field verbatim. */
export interface DossierMove {
  /** the chronicle's own monotonic ordinal */
  seq: number
  date: string
  /** the number the collective's own prose uses; null for the pre-constitution sessions */
  session: number | null
  /** the entry's `move` line, verbatim */
  move: string
  /** the entry's `verdict`, verbatim; null where it records none */
  verdict: string | null
  /** the entry's plain-language summary, verbatim — the whole point of the register */
  summary: string
  /** the session's own page under /field/journal/ */
  anchor: string
  source: string
}

const CURATED = 'src/data/field/chronicle.curated.json'
const UPSTREAM = 'src/data/field/chronicle.upstream.json'

export function chronicleSource(entry: ChronicleEntry): string {
  return entry.source === 'upstream' ? UPSTREAM : CURATED
}

/** The register's entries for one instrument, newest first — attachment rule 1. */
export function movesFor(chronicle: readonly ChronicleEntry[], slug: string): DossierMove[] {
  return entriesForWork([...chronicle], slug)
    .map((e) => ({
      seq: e.seq,
      date: e.date,
      session: e.collective_session,
      move: e.move,
      verdict: e.verdict,
      summary: e.summary,
      anchor: e.anchor,
      source: chronicleSource(e),
    }))
    .sort((a, b) => b.seq - a.seq)
}

// ————————————————————————————————————————————————— the encounter ledger ——————

/** The shape this module needs out of an encounter's score export (lib/begegnungen/score.ts). */
export interface EncounterScore {
  encounter_id: string
  headline: string
  akte: string
  status: { as_of: string; statusLine: string }
  events: {
    event_type: string
    date: string
    lane: string
    infra: boolean
    quote?: string | null
    attribution?: string | null
  }[]
  obligations: { id: string; label: string; lane: string; status: string; clause_text?: string }[]
}

export interface LedgerEvent {
  type: string
  date: string
  lane: string
  /** the ledger's own quote, verbatim; null where the event carries none */
  quote: string | null
  /** the ledger's own attribution, verbatim; null where the event carries none */
  attribution: string | null
}

export interface LedgerObligation {
  label: string
  status: string
  /** the obligation's own clause, verbatim; null where the ledger states none */
  clause: string | null
}

export interface DossierLedger {
  encounterId: string
  /** the encounter's own headline, verbatim */
  headline: string
  /** the encounter's own status line, verbatim */
  statusLine: string
  asOf: string
  events: LedgerEvent[]
  obligations: LedgerObligation[]
  source: string
  href: string
}

/** `2026-07-01-calibration-gap` → `calibration-gap` — the part an akte path can name. */
export function instrumentName(slug: string): string {
  return slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

/**
 * Which instrument an encounter's ledger belongs to — attachment rule 2. The akte path and the
 * encounter id are the two places an encounter names its subject; longest instrument name wins,
 * so `the-edition` cannot swallow an encounter about `the-edition-ii`. No name in either string
 * means the ledger attaches to no dossier at all.
 */
export function ledgerSubject(score: EncounterScore, slugs: readonly string[]): string | null {
  const haystack = `${score.akte} ${score.encounter_id}`
  return (
    [...slugs]
      .sort((a, b) => instrumentName(b).length - instrumentName(a).length)
      .find((slug) => haystack.includes(instrumentName(slug))) ?? null
  )
}

/** `enc-2026-001-calibration-gap-travels` → `enc-2026-001` */
export function encounterId(score: EncounterScore): string {
  return score.encounter_id.split('-').slice(0, 3).join('-')
}

// ————————————————————————————————————————————————— the record plate ——————————

/** What a mark on the Kontrollblatt is, in the practice's own mark grammar. */
export type PlateKind = 'instr' | 'stamp' | 'flag' | 'splicein'

/** What the mark records — the page turns this into a label; the lib never words one. */
export type MarkRole = 'built' | 'session' | 'contract' | 'correction-issued' | 'ledger-event'

export interface PlateMark {
  /** stable identity, unique on its own plate */
  key: string
  role: MarkRole
  date: string
  kind: PlateKind
  /** stamp letter (the move's own initial); only for kind 'stamp' */
  letter?: string
  /** the record's own words for this mark, verbatim; empty where the record carries none */
  text: string
  source: string
}

/**
 * The ledger events this practice's OWN plate draws: the ones on Meridian's lane, plus the
 * correction that arrives from outside (the splice — it is the whole reason the plate has a
 * splice glyph). The encounter's other lanes are the receiving practice's moves; they belong to
 * The Middle, which the dossier links, and they are all listed verbatim in the ledger block
 * anyway. Drawing them here would put five marks on one day of a plate whose fan holds four.
 */
export function drawnLedgerEvents(score: EncounterScore): EncounterScore['events'] {
  return score.events.filter((e) => !e.infra && (e.lane === 'meridian' || e.event_type === 'correction.issued'))
}

/** `correction.applied` → `A`; `steer` → `S`. The record's own initial, never a chosen letter. */
export function stampLetter(word: string): string {
  const last = word.split('.').at(-1) ?? word
  return (last.trim().charAt(0) || '?').toUpperCase()
}

function ledgerKind(eventType: string): PlateKind {
  if (eventType.startsWith('contract')) return 'flag'
  if (eventType === 'correction.issued') return 'splicein'
  return 'stamp'
}

function ledgerRole(eventType: string): MarkRole {
  if (eventType.startsWith('contract')) return 'contract'
  if (eventType === 'correction.issued') return 'correction-issued'
  return 'ledger-event'
}

// ————————————————————————————————————————————————— the dossier ———————————————

export interface DossierSource {
  /** the file's name as it sits in the instrument's folder */
  label: string
  path: string
}

export interface FieldDossier {
  slug: string
  /** the instrument's derived number: its position in the committed order, zero-padded */
  no: string
  /** the work's own committed title */
  title: string
  /** the work's own committed date */
  date: string
  href: string
  /** the newest instrument in the committed order — the practice's current protagonist */
  inService: boolean
  stand: Stand
  /** what it measures and what it found — the work's own `embodies`, verbatim */
  measures: Quoted | null
  /** what it is made of — the work's own `medium`, verbatim */
  makeup: Quoted | null
  /** the verdicts the work locked into its own record, verbatim */
  locked: LockedLabel[]
  /** every register entry that names it, newest first, verbatim */
  moves: DossierMove[]
  /** the encounter ledger that names it, where one does */
  ledger: DossierLedger | null
  /** the plate's marks, chronological */
  marks: PlateMark[]
  /** the plate's wall-clock span */
  days: string[]
  /** where the standing obligation band starts, and the obligations' own labels */
  obligation: { fromDate: string; labels: string[] } | null
  /** the instrument carries the contested-claim plate (attachment rule 3) */
  hasClaim: boolean
  /** the guided tour walks this instrument */
  inTour: boolean
  sources: DossierSource[]
}

export interface DossierInput {
  /** `[slug, meta]` for every committed instrument — the werke mirror's meta.json glob */
  instruments: [string, InstrumentMeta][]
  /** the merged register (chronicle.ts loadChronicle) */
  chronicle: readonly ChronicleEntry[]
  /** every committed encounter score export */
  encounters: readonly EncounterScore[]
  /** every file path in the werke mirror — what an instrument's record CONSISTS of */
  files: readonly string[]
  /** the slug the committed record ties the contested claim to (attachment rule 3) */
  claimOf?: string
  /** the slugs the guided tour walks */
  tourOf?: readonly string[]
}

/**
 * The date the committed record currently ends on — the newest thing in the whole mirror.
 *
 * WHY EVERY PLATE RUNS TO IT. The Kontrollblatt is a strip chart of ONE tape, the practice's own,
 * and the field's data edge is a resting pen with the tape running on past it ("the pen has not
 * lifted — the tape runs on", FIELD_GRAMMAR). An instrument's plate is a window on that tape from
 * where the instrument enters to where the record currently ends, so twenty plates share one
 * right-hand edge and can be read against each other: a long quiet run after an instrument's last
 * mark is not empty decoration, it is the true statement that nothing further was recorded about
 * it while the practice kept working.
 *
 * The alternative — cropping each plate to its own marks — was built first and thrown away: an
 * instrument whose whole record is one day cropped to a nearly square box and drew, at column
 * width, a plate about as tall as a phone. Derived from committed dates only; never a clock.
 */
export function recordHorizon(input: DossierInput): string {
  const dates = [
    ...input.instruments.map(([, m]) => m.date ?? ''),
    ...input.chronicle.map((e) => e.date),
    ...input.encounters.map((e) => e.status.as_of),
  ].filter(Boolean)
  return dates.sort().at(-1) ?? ''
}

const WERKE = 'src/components/field/werke'

/**
 * Every instrument's dossier — the one in service first, then the earlier ones newest-first.
 *
 * That order is the page's argument, not a preference: the entrance leads with the instrument
 * currently in service, and the practice's own band reads newest-to-oldest behind it.
 */
export function buildFieldDossiers(input: DossierInput): FieldDossier[] {
  const ordered = orderInstruments(input.instruments)
  const slugs = ordered.map(([slug]) => slug)
  const newest = slugs.at(-1)
  const horizon = recordHorizon(input)

  const ledgerBySlug = new Map<string, DossierLedger>()
  for (const score of input.encounters) {
    const slug = ledgerSubject(score, slugs)
    if (!slug) continue
    const id = encounterId(score)
    ledgerBySlug.set(slug, {
      encounterId: id,
      headline: score.headline,
      statusLine: score.status.statusLine,
      asOf: score.status.as_of,
      events: score.events.map((e) => ({
        type: e.event_type,
        date: e.date,
        lane: e.lane,
        quote: e.quote?.trim() ? e.quote : null,
        attribution: e.attribution?.trim() ? e.attribution : null,
      })),
      obligations: score.obligations.map((o) => ({
        label: o.label,
        status: o.status,
        clause: o.clause_text?.trim() ? o.clause_text : null,
      })),
      source: `src/data/begegnungen/${id}/score.json`,
      href: '/encounters',
    })
  }
  // The plate needs the raw events again (drawnLedgerEvents reads `infra`/`lane`), so keep the
  // score beside the flattened ledger rather than re-deriving the filter from the flat shape.
  const scoreBySlug = new Map<string, EncounterScore>()
  for (const score of input.encounters) {
    const slug = ledgerSubject(score, slugs)
    if (slug) scoreBySlug.set(slug, score)
  }

  const dossiers = ordered.map(([slug, meta], i) => {
    const no = String(i + 1).padStart(3, '0')
    const metaSource = `${WERKE}/${slug}/meta.json`
    const date = meta.date ?? slug.slice(0, 10)
    const moves = movesFor(input.chronicle, slug)
    const inService = slug === newest
    const ledger = ledgerBySlug.get(slug) ?? null
    const score = scoreBySlug.get(slug) ?? null

    const marks: PlateMark[] = [
      {
        key: 'built',
        role: 'built' as const,
        date,
        kind: 'instr' as const,
        text: meta.title ?? slug,
        source: metaSource,
      },
      ...moves.map((m) => ({
        key: `session-${m.seq}`,
        role: 'session' as const,
        date: m.date,
        kind: 'stamp' as const,
        letter: stampLetter(m.move),
        text: m.verdict ? `${m.move} · ${m.verdict}` : m.move,
        source: m.source,
      })),
      ...(score
        ? drawnLedgerEvents(score).map((e, k): PlateMark => {
            const kind = ledgerKind(e.event_type)
            return {
              key: `ledger-${k}`,
              role: ledgerRole(e.event_type),
              date: e.date,
              kind,
              letter: kind === 'stamp' ? stampLetter(e.event_type) : undefined,
              text: [e.event_type, e.quote?.trim(), e.attribution?.trim()].filter(Boolean).join(' — '),
              source: ledger!.source,
            }
          })
        : []),
    ].sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key))

    // The build date is a mark like any other, so the span starts at the earliest mark; every
    // plate then runs on to the record's shared horizon (see recordHorizon above).
    const days = plateSpan(date, marks.map((m) => m.date), horizon || ledger?.asOf || date)

    const obligationFrom = marks.find((m) => m.role === 'contract')?.date ?? null

    const files = input.files
      .filter((p) => p.includes(`/werke/${slug}/`))
      .map((p) => p.replace(/^.*\/werke\//, '').split('/').slice(1).join('/'))
      .sort()

    return {
      slug,
      no,
      title: meta.title ?? slug,
      date,
      href: `/field/werke/${slug}`,
      inService,
      stand: standOf(moves, inService),
      measures: meta.embodies ? { text: meta.embodies, source: metaSource } : null,
      makeup: meta.medium ? { text: meta.medium, source: metaSource } : null,
      locked: readLockedLabels([
        { text: meta.embodies, source: metaSource },
        { text: meta.medium, source: metaSource },
      ]),
      moves,
      ledger,
      marks,
      days,
      obligation:
        ledger && obligationFrom && ledger.obligations.length > 0
          ? { fromDate: obligationFrom, labels: ledger.obligations.map((o) => o.label) }
          : null,
      hasClaim: slug === input.claimOf,
      inTour: (input.tourOf ?? []).includes(slug),
      sources: files.map((name) => ({ label: name, path: `${WERKE}/${slug}/${name}` })),
    } satisfies FieldDossier
  })

  return sortDossiers(dossiers)
}

/** In service first — the entrance is about the present tense — then the earlier ones newest
 *  first, which is the order the practice's own band and instruments room already read in. */
export function sortDossiers(dossiers: readonly FieldDossier[]): FieldDossier[] {
  return [...dossiers].sort(
    (a, b) =>
      Number(b.inService) - Number(a.inService) ||
      b.date.localeCompare(a.date) ||
      b.no.localeCompare(a.no),
  )
}
