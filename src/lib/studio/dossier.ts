// src/lib/studio/dossier.ts — the house dossier: one body of work, read out of the record.
//
// WHY THIS EXISTS. /studio's entrance answered "what has this house done" with two figures and a
// table. It never answered "what is on tonight, and what happened to it" in the house's own
// sentences — the one thing a visitor standing in front of a stage wants. This module is that
// answer, for every body the house has produced: the five premiered works (one of them withdrawn
// after the fact) and the seven positions struck at concept.
//
// THE HOUSE RULE HOLDS THROUGHOUT: nothing here is written, summarised or rounded. Every string
// this module returns is a span of a committed file, carried with the repo-relative path it was
// read from, so the page can print the path beside the quotation. Where the record says nothing,
// this returns null and the page says so in words. An invented value would be a lie in an archive
// whose whole claim is that it can be checked — and this house has twice buried its own work for
// exactly that (session 43: "what a stranger sees is settled in pixels and never in propositions";
// session 46: "check the artefact you are making the claim about").
//
// ATTRIBUTION IS THE HARD PART, and it is deliberately conservative. See `attribute` below: an
// entry the record does not attach to a body is OMITTED, never guessed onto the nearest name.
//
// PURE BY CONSTRUCTION. No import.meta.glob, no fs — the caller injects the committed data
// (dossier-data.ts does the binding), so this module is unit-testable against fixtures AND against
// the real committed files.

import { roman } from './stage'

// ————————————————————————————————————————————————— injected inputs ——————————

/** The fields of a work's own meta.json this module reads. */
export interface DossierWorkMeta {
  title?: string
  date?: string
  author?: string
  medium?: string
  embodies?: string
}

/** The fields of a merged chronicle entry this module reads (src/lib/studio/chronicle.ts). */
export interface DossierChronicleEntry {
  date: string
  collective_session: number | null
  move: string
  summary: string
  works: string[]
  verdict: string | null
  anchor: string
}

/** One struck position, as src/data/studio/stage.curated.json carries it. */
export interface DossierKill {
  name: string
  session: string
  /** verbatim quote from the session commit — never summarised */
  reason: string
  source: string
}

export interface StudioDossierInput {
  chronicle: readonly DossierChronicleEntry[]
  /** work slug → its committed meta.json */
  metas: Record<string, DossierWorkMeta>
  kills: readonly DossierKill[]
}

// ————————————————————————————————————————————————— quoting ——————————————————

/** A span of a committed file, carried with where it came from and what the record calls it. */
export interface Quoted {
  text: string
  /** repo-relative path — printed with the quotation */
  source: string
  /** which field of the record it is, in the record's own vocabulary */
  label: string
}

const WORKS_DIR = 'src/content/studio/works'
const CHRONICLE_PATH = 'src/data/studio/chronicle.upstream.json'
const KILLS_PATH = 'src/data/studio/stage.curated.json'

const metaPath = (slug: string) => `${WORKS_DIR}/${slug}/meta.json`

// ————————————————————————————————————————————————— the withdrawal ———————————
//
// A withdrawal is machine-readable in the work's own meta.json — the same test /studio's stage and
// the season floor already apply to decide which premiere is live. It is NOT an error state: the
// house withdrew One Tap itself, in writing, after the eye rejected three stagings, and the record
// calls that "a killed work, kept as record". A completed honest act.

const WITHDRAWN_HEAD = /^WITHDRAWN\s+(\d{4}-\d{2}-\d{2})(?:\s*\(collective session (\d+)\))?/i

export interface Withdrawal {
  date: string
  /** 'S43', or '' where the record states no session */
  session: string
  /** the work's own withdrawal sentence, verbatim */
  note: Quoted
}

/** True when the work's own meta declares it withdrawn. */
export function isWithdrawn(meta: DossierWorkMeta): boolean {
  return WITHDRAWN_HEAD.test(meta.medium ?? '')
}

/**
 * The withdrawal as the work states it: date and session parsed off the machine-readable head, and
 * the whole first sentence of `embodies` — which is where this house wrote the reason — quoted
 * verbatim. Both fields carry the same head; `embodies` is the one that carries the reason with it,
 * so that is the sentence the dossier prints. Returns null where the head is absent from `medium`,
 * because that field is the declaration the rest of the site already reads.
 */
export function readWithdrawal(slug: string, meta: DossierWorkMeta): Withdrawal | null {
  const head = WITHDRAWN_HEAD.exec(meta.medium ?? '')
  if (!head) return null
  const from = meta.embodies ?? meta.medium ?? ''
  return {
    date: head[1],
    session: head[2] ? `S${head[2]}` : '',
    note: {
      text: firstSentence(from),
      source: metaPath(slug),
      label: meta.embodies ? 'embodies' : 'medium',
    },
  }
}

/** A text's first sentence, ending at the first `. ` boundary — the record's own prose style, not a
 *  general tokenizer. A text with no such boundary is returned whole: an over-long quotation is
 *  honest, a truncated one is not. */
export function firstSentence(text: string): string {
  const at = text.indexOf('. ')
  return at < 0 ? text.trim() : text.slice(0, at + 1).trim()
}

// ————————————————————————————————————————————————— honesty tiers ————————————
//
// The house's own vocabulary for what a work stands on. It writes them as a labelled clause —
// "SOURCED spine: …", "IMAGINED: …" — and only some of the works declare any, which is itself
// worth showing: the dossier says so rather than inventing a tier for the ones that do not. (The
// count used to stand here as "two of the five"; the house keeps shipping, so the prose says what
// the rule is and the test counts.)
//
// The colon is load-bearing. One Tap's description ALSO contains the sentence "The SOURCED spine
// below is unaffected and was never in question", inside its correction notice; that is a claim
// about the tier, not the tier's declaration, and matching a bare keyword would have quoted it as
// though it were one.

export const TIER_WORDS = ['VERIFIED', 'SOURCED', 'IMAGINED'] as const
export type TierWord = (typeof TIER_WORDS)[number]

const TIER_DECLARATION = /\b(VERIFIED|SOURCED|IMAGINED)\b([^.;:]{0,24}):/g

/**
 * Every tier the work's own meta DECLARES, verbatim, in the order it declares them. The clause runs
 * from the tier word to the first `;` or sentence end after it — the boundaries this house's own
 * tier lines use. Nothing is added: where a work declares no tier, this returns an empty list and
 * the page states the gap.
 */
export function readTiers(slug: string, meta: DossierWorkMeta): Quoted[] {
  const out: Quoted[] = []
  for (const [field, text] of [
    ['embodies', meta.embodies],
    ['medium', meta.medium],
  ] as const) {
    if (!text) continue
    for (const m of text.matchAll(TIER_DECLARATION)) {
      const from = m.index ?? 0
      const rest = text.slice(from)
      // to the first `;` or `. ` after the colon, whichever comes first
      const afterColon = m[0].length
      const semi = rest.indexOf(';', afterColon)
      const stop = rest.indexOf('. ', afterColon)
      const end =
        semi >= 0 && (stop < 0 || semi < stop) ? semi : stop >= 0 ? stop + 1 : rest.length
      out.push({
        text: rest.slice(0, end).trim(),
        source: metaPath(slug),
        label: `${field} — ${m[1].toLowerCase()} tier`,
      })
    }
    if (out.length > 0) break // the tier line lives in one field; do not quote it twice
  }
  return out
}

// ————————————————————————————————————————————————— the eye's returns ————————
//
// A return is not a field in any committed file — the chronicle states it in prose, in the two
// forms the collective has actually used. So it is MATCHED, not assumed, and the match is the
// evidence. This is the same derivation src/lib/studio/season.ts draws the floor's violet arcs
// from, exported here so the figure and the dossier cannot disagree about how many times the human
// eye sent a work back.

const RETURN_PATTERNS = (title: string): RegExp[] => [
  new RegExp(`the human eye returned ${escapeRe(title)}`, 'i'),
  new RegExp(`${escapeRe(title)} returned by the human eye`, 'i'),
]

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The sentence a return is stated in, plus the sentence after it when THAT one carries the
 *  quotation the first only announces — which is how this collective actually writes a return up.
 *  Mirrors season.ts's `recordAround`; the two are tested against the same committed entries. */
export function recordAround(summary: string, re: RegExp): string {
  const at = summary.search(re)
  if (at < 0) return summary
  const start = summary.lastIndexOf('. ', at)
  const from = start < 0 ? 0 : start + 2
  const firstEnd = summary.indexOf('. ', at)
  if (firstEnd < 0) return summary.slice(from).trim()
  let to = firstEnd + 1
  if (!carriesTheSaying(summary.slice(from, to))) {
    const secondEnd = summary.indexOf('. ', to + 1)
    const next = summary.slice(to, secondEnd < 0 ? summary.length : secondEnd + 1)
    if (carriesTheSaying(next)) to = secondEnd < 0 ? summary.length : secondEnd + 1
  }
  return summary.slice(from, to).trim()
}

/** The marker the studio writes where it has withheld the architect's own wording. Its privacy rule
 *  of 2026-08-15 — his messages are recorded as dated paraphrase, never quoted — reached the
 *  chronicle on 2026-08-16, so from that date a return is written up with no quotation mark in it
 *  at all. Both derivations below have to know that, or they read the new record as a record that
 *  says nothing. */
export const PRIVATE_MARKER = /wording private/i

/** Does this sentence carry WHAT WAS SAID — as a quotation, or as a paraphrase the record itself
 *  marks as standing in for withheld wording? Before 2026-08-15 only the first case existed. */
const carriesTheSaying = (s: string) => /[“"]/.test(s) || PRIVATE_MARKER.test(s)

/** The eye's own words inside a record, where the record still carries them. All three pairings
 *  occur in the chronicle as it was written before the privacy rule (S43 used “…”, S32 "…", S28
 *  '…'). Returns '' when there is nothing quoted to find — the caller then keeps the whole
 *  sentence and nothing is invented.
 *
 *  A passage marked `wording private` yields NOTHING, deliberately: what stands in it is this
 *  house's paraphrase, and paraphrase lifted into a field named `quote` — rendered by
 *  Dossier.astro as a blockquote of the eye's own words — would put back, as a regex, exactly what
 *  the rule removed. The suppression is deliberately whole-passage: a real quotation of someone
 *  else sharing a sentence with a withheld one is dropped too, which is the safe direction. */
export function quotedFragment(text: string): string {
  if (PRIVATE_MARKER.test(text)) return ''
  for (const re of [/“([^”]{8,}?)”/, /"([^"]{8,}?)"/, /'([^']{8,}?)'/]) {
    const m = re.exec(text)
    if (m) return m[1]
  }
  return ''
}

// ————————————————————————————————————————————————— attribution ——————————————
//
// WHICH ENTRIES BELONG TO WHICH BODY. The atelier's dossier hit this exact question and answered
// it "byline beats filename": the record's own explicit marker outranks a name that merely appears
// in a path. The studio's analogue is stronger, because its record carries a machine-readable
// marker of its own — every chronicle entry has a `works` array, written by the house, naming the
// work that session touched.
//
// So there are exactly TWO rules, both explicit, and nothing else attaches an entry to a body:
//
//   1. DECLARED — the entry's own `works` array names the slug. This is the house's own
//      attribution and it is authoritative.
//   2. RETURN PATTERN — the entry's prose states, in one of the two forms this collective uses,
//      that the human eye returned the work. Matched by the same patterns the season floor's arcs
//      are drawn from, whose count is locked by a test against the real record.
//
// A NAIVE THIRD RULE — "the summary mentions the title" — was considered and REJECTED against the
// committed data, not on principle:
//
//   · session 46's summary contains "nine record that a named Justice took no part", which is the
//     Supreme Court's own phrase and not this house's work NO PART;
//   · seventeen entries mention "One Tap" only to state that it is still waiting on the human eye
//     while the session did something else entirely (season reviews, form études, repair nights).
//     Filing those under One Tap would tell a visitor the work moved on evenings it did not.
//
// The cost of the strict rule is stated on the page rather than hidden: the build sessions before
// a premiere carry no `works` entry, so they are NOT in the dossier, and the dossier says which
// room does carry them (the journal, one page per session).

export type Attribution = 'declared' | 'return-pattern' | 'kill list' | 'the evening'

export interface DossierEvent {
  /** what kind of move this was, in the dossier's own small vocabulary */
  kind: 'premiere' | 'return' | 'session' | 'withdrawal' | 'strike' | 'evening'
  date: string
  /** 'S31', or '' where the record carries no session number */
  session: string
  /** the chronicle's own move word ('ship', 'verify', 'steer' …), or the state word */
  move: string
  /** the record's words, verbatim */
  text: string
  /** repo-relative path the words were read from */
  source: string
  /** where a reader can go on to read the whole session, where such a page exists */
  href: string | null
  /** returns only: the eye's own quoted words, lifted out of the record */
  quote?: string
  /** returns only: 1, 2, 3 … in the order the chronicle records them */
  ordinal?: number
  /** returns only: the ordinal in the house's own Roman lettering, as the floor letters it */
  ordinalRoman?: string
  /** which rule attached this entry to this body — printed, so attribution can be checked */
  by: Attribution
}

/**
 * The house's own spelling for a session number: two digits, zero-padded. That is how the curated
 * kill list writes it ("S01", "S05", "S12"), and a struck body's dossier prints BOTH — its own
 * verbatim label from that list and the derived label of the evening it was struck. Deriving "S5"
 * beside a verbatim "S05" made one session look like two. Nothing above session 9 changes, so this
 * cannot put the dossier out of step with the season floor, whose premieres all start at S10.
 */
const sessionLabel = (n: number | null) => (n === null ? '' : `S${String(n).padStart(2, '0')}`)
const journalHref = (anchor: string) => `/studio/journal/${anchor}/`

// ————————————————————————————————————————————————— the dossier ——————————————

export type BodyState = 'premiered' | 'withdrawn' | 'struck'

export interface DossierSource {
  path: string
  /** what that file is, in one clause */
  note: string
}

export interface StudioDossier {
  /** URL-safe id — the work's own slug, or `struck-<name>`. Deep links are `/studio#work-<id>`. */
  id: string
  /** the season floor's own key for this body's mark, so figure and dossier select each other */
  markKey: string
  state: BodyState
  /** the work's title as its meta states it, or the struck position's name from the kill list */
  title: string
  /** true for the one work currently in the spotlight — derived, never typed */
  spotlight: boolean
  slug: string | null
  date: string
  /** false when the date had to be taken from the season's opening — an honest gap, marked */
  dateKnown: boolean
  session: string
  author: string | null
  /** the record's own `medium` line — what form the thing takes */
  form: Quoted | null
  /** the record's own `embodies` — what the thing is */
  description: Quoted | null
  /** the tiers the work's meta declares, verbatim; empty where it declares none */
  tiers: Quoted[]
  /** struck bodies only: the kill reason verbatim */
  killReason: Quoted | null
  withdrawal: Withdrawal | null
  /** every attributed move, oldest first — the state history as the record tells it */
  events: DossierEvent[]
  /** the eye's verdicts alone, for the page's own emphasis */
  returns: DossierEvent[]
  /** the built work's own stage page, where one exists */
  stageHref: string | null
  sources: DossierSource[]
}

/**
 * The work currently in the spotlight — the newest LIVE premiere, exactly as /studio's stage has
 * always derived it: walk the chronicle from the newest ship backwards past any work its own
 * meta.json marks WITHDRAWN. Derived, never typed: a premiere can be withdrawn after the fact
 * (One Tap, session 43), and a hardcoded protagonist would keep a struck light on.
 *
 * Returns null where the mirror carries no live premiere at all — the caller decides whether that
 * is a build failure (it is, for /studio) or an empty state.
 */
export function currentPremiere(
  chronicle: readonly DossierChronicleEntry[],
  metas: Record<string, DossierWorkMeta>,
): string | null {
  for (let i = chronicle.length - 1; i >= 0; i--) {
    const e = chronicle[i]
    if (e.move !== 'ship') continue
    const slug = e.works[0]
    if (!slug) continue
    const meta = metas[slug]
    if (meta && !isWithdrawn(meta)) return slug
  }
  return null
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

const FILE_NOTES: Record<string, string> = {
  [CHRONICLE_PATH]: 'the chronicle mirror — one entry per session, the house’s own summary',
  [KILLS_PATH]: 'the curated kill list — session-commit quotes the mirror itself does not carry',
}

/**
 * Builds one dossier per body of the house — every premiered work (including the withdrawn one) and
 * every struck position — with the current premiere first.
 *
 * `descriptionOf` is the whole `embodies` field and is NOT bounded: this is the one place on the
 * site where a work says what it is in its own words, and a dossier that trims the record to fit a
 * layout is the same failure the house killed One Tap for.
 */
export function buildStudioDossiers(input: StudioDossierInput): StudioDossier[] {
  const { chronicle, metas, kills } = input
  const spotlight = currentPremiere(chronicle, metas)

  // the first evening a session number was seen — how a strike gets its date, same rule as the floor
  const sessionDate = new Map<number, string>()
  const sessionEntry = new Map<number, DossierChronicleEntry>()
  for (const e of chronicle) {
    if (e.collective_session === null) continue
    if (!sessionDate.has(e.collective_session)) sessionDate.set(e.collective_session, e.date)
    if (!sessionEntry.has(e.collective_session)) sessionEntry.set(e.collective_session, e)
  }
  const firstDate = [...chronicle.map((e) => e.date)].sort()[0] ?? ''

  // ——— the premiered works, in the order the chronicle shipped them ————————————
  const shipped: string[] = []
  for (const e of chronicle) {
    if (e.move !== 'ship') continue
    const slug = e.works[0]
    if (slug && metas[slug] && !shipped.includes(slug)) shipped.push(slug)
  }

  const works: StudioDossier[] = shipped.map((slug) => {
    const meta = metas[slug]
    const title = meta.title ?? slug
    const withdrawal = readWithdrawal(slug, meta)
    const state: BodyState = withdrawal ? 'withdrawn' : 'premiered'

    const events: DossierEvent[] = []
    const returns: DossierEvent[] = []

    // ONE ROW PER CHRONICLE ENTRY, whichever rule reached it — an evening is one evening. The two
    // rules are not two lists to concatenate: session 32 is both DECLARED under One Tap and states
    // the eye's second return in its own prose, and pushing it twice printed the same evening as
    // two moves of the same work.
    //
    // How much of the entry an event carries is decided by which rule reached it, and that is the
    // conservative half of the attribution rule made visible:
    //
    //   · DECLARED — the house filed the whole session under this work, so the whole summary is its
    //     record here;
    //   · RETURN PATTERN ONLY — the house filed this session under something ELSE (session 28's
    //     `works` names Recovery; its prose states One Tap's first return), so this dossier carries
    //     the sentence that names this work and not the evening that belonged to another.
    let ordinal = 0
    for (const e of chronicle) {
      const declared = e.works.includes(slug)
      const hit = RETURN_PATTERNS(title).find((re) => re.test(e.summary))
      if (!declared && !hit) continue

      const record = hit ? recordAround(e.summary, hit) : e.summary
      const base = {
        date: e.date,
        session: sessionLabel(e.collective_session),
        move: e.move,
        text: declared ? e.summary : record,
        source: `${CHRONICLE_PATH}, verbatim`,
        href: journalHref(e.anchor),
        by: (declared ? 'declared' : 'return-pattern') as Attribution,
      }

      if (hit) {
        ordinal += 1
        // The eye's own block always carries the RETURN SENTENCE, never the whole evening: that
        // block is the verdict, and an evening is not a verdict.
        returns.push({
          ...base,
          kind: 'return',
          text: record,
          quote: quotedFragment(record) || undefined,
          ordinal,
          ordinalRoman: roman(ordinal),
        })
        events.push({ ...base, kind: 'return', ordinal, ordinalRoman: roman(ordinal) })
      } else {
        events.push({ ...base, kind: e.move === 'ship' ? 'premiere' : 'session' })
      }
    }

    if (withdrawal) {
      events.push({
        kind: 'withdrawal',
        date: withdrawal.date,
        session: withdrawal.session,
        move: 'withdrawn',
        text: withdrawal.note.text,
        source: `${withdrawal.note.source}, verbatim`,
        href: null,
        by: 'declared',
      })
    }

    return {
      id: slug,
      markKey: `${state}:${slug}`,
      state,
      title,
      spotlight: slug === spotlight,
      slug,
      date: meta.date ?? firstDate,
      dateKnown: Boolean(meta.date),
      session: sessionLabel(
        chronicle.find((e) => e.move === 'ship' && e.works.includes(slug))?.collective_session ?? null,
      ),
      author: meta.author ?? null,
      form: meta.medium ? { text: meta.medium, source: metaPath(slug), label: 'medium' } : null,
      description: meta.embodies
        ? { text: meta.embodies, source: metaPath(slug), label: 'embodies' }
        : null,
      tiers: readTiers(slug, meta),
      killReason: null,
      withdrawal,
      events: order(events),
      returns,
      stageHref: `/studio/werke-html/${slug}/`,
      sources: [
        { path: metaPath(slug), note: 'the work’s own record — what it is, and what became of it' },
        { path: CHRONICLE_PATH, note: FILE_NOTES[CHRONICLE_PATH] },
      ],
    } satisfies StudioDossier
  })

  // ——— the struck positions, from the curated kill list ————————————————————————
  const struck: StudioDossier[] = kills.map((k) => {
    const n = Number.parseInt(String(k.session).replace(/\D/g, ''), 10)
    const known = sessionDate.get(n)
    const evening = sessionEntry.get(n)
    const events: DossierEvent[] = [
      {
        kind: 'strike',
        date: known ?? firstDate,
        session: k.session,
        move: 'struck',
        text: k.reason,
        source: k.source,
        href: null,
        by: 'kill list',
      },
    ]
    if (evening) {
      events.push({
        kind: 'evening',
        date: evening.date,
        session: sessionLabel(evening.collective_session),
        move: evening.move,
        text: evening.summary,
        source: `${CHRONICLE_PATH}, verbatim`,
        href: journalHref(evening.anchor),
        by: 'the evening',
      })
    }
    return {
      id: `struck-${slugify(k.name)}`,
      markKey: `struck:${slugify(k.name)}`,
      state: 'struck' as const,
      title: k.name,
      spotlight: false,
      slug: null,
      date: known ?? firstDate,
      dateKnown: known !== undefined,
      session: k.session,
      author: null,
      form: null,
      description: null,
      tiers: [],
      killReason: { text: k.reason, source: KILLS_PATH, label: k.source },
      withdrawal: null,
      events,
      returns: [],
      stageHref: null,
      sources: [
        { path: KILLS_PATH, note: FILE_NOTES[KILLS_PATH] },
        { path: CHRONICLE_PATH, note: FILE_NOTES[CHRONICLE_PATH] },
      ],
    } satisfies StudioDossier
  })

  return sortDossiers([...works, ...struck])
}

/** Oldest first inside one body's own history — a work is premiered before it can be returned, and
 *  a strike's evening reads after the strike itself. Total and stable, so the build is too. */
const EVENT_ORDER: Record<DossierEvent['kind'], number> = {
  strike: 0,
  premiere: 1,
  session: 2,
  return: 3,
  evening: 4,
  withdrawal: 5,
}

function order(events: DossierEvent[]): DossierEvent[] {
  return [...events].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      EVENT_ORDER[a.kind] - EVENT_ORDER[b.kind] ||
      (a.ordinal ?? 0) - (b.ordinal ?? 0),
  )
}

/**
 * The order the entrance reads in: the work in the spotlight, then the rest of the lit season
 * newest first, then the withdrawn position, then the struck ones newest first.
 *
 * Withdrawn AFTER premiered is not a judgement — the section headings say what each state is, and
 * a withdrawal wears the house's curtain colour, never a warning. It sits there because a visitor
 * reads what is on before what came off.
 */
const STATE_ORDER: Record<BodyState, number> = { premiered: 0, withdrawn: 1, struck: 2 }

export function sortDossiers(dossiers: readonly StudioDossier[]): StudioDossier[] {
  return [...dossiers].sort(
    (a, b) =>
      Number(b.spotlight) - Number(a.spotlight) ||
      STATE_ORDER[a.state] - STATE_ORDER[b.state] ||
      b.date.localeCompare(a.date) ||
      a.id.localeCompare(b.id),
  )
}

/** The dossier a season-floor mark belongs to. Returns are marks of their own on the floor
 *  (`returned:<slug>:<n>`) but belong to the work they were returned from, which is what makes the
 *  floor a switchboard rather than a second, disagreeing index. */
export function dossierIdForMark(markKey: string, dossiers: readonly StudioDossier[]): string | null {
  const direct = dossiers.find((d) => d.markKey === markKey)
  if (direct) return direct.id
  const ret = /^returned:(.+):\d+$/.exec(markKey)
  if (ret) return dossiers.find((d) => d.slug === ret[1])?.id ?? null
  return null
}

/** The pairing the client script needs, as plain data: which floor mark each dossier selects, and
 *  which dossier each floor mark belongs to. Built here so the page ships one derived table
 *  instead of two hand-kept ones. */
export function markIndex(
  dossiers: readonly StudioDossier[],
  markKeys: readonly string[],
): { byDossier: Record<string, string>; byMark: Record<string, string> } {
  const byDossier: Record<string, string> = {}
  for (const d of dossiers) byDossier[d.id] = d.markKey
  const byMark: Record<string, string> = {}
  for (const key of markKeys) {
    const id = dossierIdForMark(key, dossiers)
    if (id) byMark[key] = id
  }
  return { byDossier, byMark }
}
