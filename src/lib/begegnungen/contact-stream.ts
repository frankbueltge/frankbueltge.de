// src/lib/begegnungen/contact-stream.ts — the contact stream: every place one practice's own
// record explicitly names another, derived and dated.
//
// WHY IT EXISTS. The register of encounters undercounts the contact. It holds five formal
// crossings, each entered by hand after the fact, while the practices touch each other far
// more often than that in their own records — an offer filed in a team channel, a sibling's
// instrument named in a session summary, a shared question answered three ways, a standing
// agenda item where one house inspects what reached it from the others. None of that is an
// encounter in the register's sense, and pretending it is would corrupt the register. So it
// is gathered here instead, as what it is: a derived stream, dated, with every row naming
// the rule that put it there.
//
// EVERY RULE IS EXPLICIT NAMING. There is no rule in this file that infers a relationship
// from prose. A row exists only where a record writes another practice's proper name, or a
// crossing's id, in its own words. That is deliberately conservative and it deliberately
// MISSES things — the page says so rather than hiding it, because the alternative (matching
// on topic, or on lowercase common nouns) produced exactly the false positives the
// reconnaissance found: "an ensemble of six works", "empty in the middle", "the photography
// studio interview". A stream that reports those as contact would be worse than a short one.
//
// PURE BY CONSTRUCTION and DEFENSIVE BY OBLIGATION — same contract as crossings.ts. The
// inputs are four mirrored team channels that are rewritten several times a day and gate
// three repositories' publishing; nothing in this file may throw on content it has not seen.

import { normaliseVoice, VOICES, type VoiceId } from './crossings'

// ————————————————————————————————————————————————— the rules ————————————————

export type StreamRule =
  | 'requests-heading'
  | 'goods-inward'
  | 'chronicle-named'
  | 'journal-named'

/** Printed beside every row, completing the sentence "attached by …". A visitor should be able
 *  to read the rule and then go and check it. */
export const STREAM_RULE_LABELS: Record<StreamRule, string> = {
  'requests-heading':
    'a section heading in this practice’s own team channel naming another practice, or a crossing’s id',
  'goods-inward':
    'the Plenum’s own standing agenda item — its inspection of what reached it from this ecology',
  'chronicle-named':
    'this practice’s own session summary naming another practice, or a crossing’s id',
  'journal-named':
    'this practice’s own journal entry naming another practice, or a crossing’s id',
}

// ————————————————————————————————————————————————— the name test ————————————
//
// CASE-SENSITIVE ON PURPOSE for the three collective names. Every one of them is also an
// ordinary English word in the lowercase ("an ensemble of six works", "the photography
// studio", "in the field"), and the reconnaissance over the committed records found more
// false positives that way than true ones. A practice writing about a sibling writes the
// proper name. `data-snack`, `datavism` and `field-research` are repository names and carry
// no common-noun reading, so those match in any case.

interface NamePattern {
  voice: VoiceId
  re: RegExp
}

/** MRR comes FIRST and its match is cut out of the text before Meridian is tested — "the
 *  Meridian Research Runtime" names the tool, and counting it as the collective too would
 *  put one sentence on two voices. */
const NAME_PATTERNS: readonly NamePattern[] = [
  { voice: 'mrr', re: /\bMeridian Research Runtime\b|\bMRR\b/g },
  { voice: 'ulysses', re: /\bUlysses\b/g },
  { voice: 'meridian', re: /\bMeridian\b|\bfield-research\b/g },
  { voice: 'ensemble', re: /\bEnsemble\b/g },
  { voice: 'plenum', re: /\bdata-snack\b/gi },
  { voice: 'datavism', re: /\bdatavism\b/gi },
]

/** A crossing's own id, in the two families this ecology issues. */
const CROSSING_ID = /\b(?:ji|enc)-\d{4}-\d{3}\b/gi

/** Which voices a span of a record explicitly names, minus the one whose record it is.
 *  Never throws: anything that is not a string names nobody. */
export function namesIn(text: unknown, self: VoiceId): VoiceId[] {
  if (typeof text !== 'string' || text === '') return []
  let rest = text
  const found: VoiceId[] = []
  for (const { voice, re } of NAME_PATTERNS) {
    // A fresh regex each pass: the patterns are global and `lastIndex` would carry over.
    const local = new RegExp(re.source, re.flags)
    if (local.test(rest)) {
      if (voice !== self) found.push(voice)
      rest = rest.replace(new RegExp(re.source, re.flags), ' ')
    }
  }
  return found
}

/** Which crossings a span of a record names by id, lowercased. */
export function crossingIdsIn(text: unknown): string[] {
  if (typeof text !== 'string' || text === '') return []
  const ids = text.match(CROSSING_ID) ?? []
  return [...new Set(ids.map((s) => s.toLowerCase()))]
}

// ————————————————————————————————————————————————— the row ——————————————————

export interface StreamRow {
  /** stable across builds, so a deep link keeps meaning */
  id: string
  /** the record's own date, or null where it states none */
  date: string | null
  /** whose record wrote it */
  voice: VoiceId
  /** what it explicitly named */
  names: VoiceId[]
  /** crossing ids it named, lowercased */
  crossings: string[]
  /** what the record calls this — its own heading, session label, or agenda item */
  label: string
  /** the record's words, verbatim */
  text: string
  /** repo-relative path the words were read from */
  source: string
  /** where a reader can go on to read the whole entry, where such a page exists */
  href: string | null
  by: StreamRule
}

const ISO = /\d{4}-\d{2}-\d{2}/

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '')

/** A slug that is stable for the same row across builds — the date and a hash of the words.
 *  Not cryptographic; it only has to not collide inside one page. */
function rowId(prefix: string, date: string | null, text: string): string {
  let h = 0
  for (let i = 0; i < text.length; i++) h = (h * 31 + text.charCodeAt(i)) | 0
  return `${prefix}-${date ?? 'undated'}-${Math.abs(h).toString(36)}`
}

// ————————————————————————————————————————————————— REQUESTS mirrors —————————

/** `/src/content/field/REQUESTS.md` → `meridian`. An unknown folder yields `unknown`, and its
 *  rows still render — with the raw path printed, which is the honest failure mode. */
export function voiceFromContentPath(path: string): VoiceId {
  const ns = /\/content\/([^/]+)\//.exec(path)?.[1] ?? ''
  return normaliseVoice(ns)
}

/**
 * Reads a mirrored REQUESTS.md into the headings that explicitly name another practice.
 *
 * THE FILES DO NOT SHARE A GRAMMAR and this reads them as they are rather than declaring one
 * shape "the" format. Three things the reconnaissance over the four committed mirrors found,
 * each of which this handles:
 *
 *   · a heading's date sits in three different places (`## 2026-07-30 — …`,
 *     `## Team note — 2026-07-25 — …`, `## Response (Ulysses, 2026-07-26) — …`), so the date
 *     is simply the first ISO date anywhere in the heading, and a heading with none is undated
 *     rather than dropped;
 *   · roughly half the seed headings are written INSIDE a blockquote (`> ### 2026-08-01 — Seed:
 *     …`), so a leading quote marker is stripped before the heading test — otherwise sixteen
 *     real headings are invisible;
 *   · three of the four mirrors carry an unfilled template line, verbatim and identical
 *     (`> ## YYYY-MM-DD — Request title`). It is skipped by name. Without that, stripping the
 *     quote marker turns the instructions into a dated section.
 *
 * The Plenum's mirror has no per-request headings at all — its requests are bullets under
 * `## Open requests`. That is not worked around: it yields no rows under this rule, and the
 * page states the limit rather than reaching for a second, weaker rule to fill the gap.
 */
export function requestsRows(path: string, raw: unknown): StreamRow[] {
  const text = clean(raw)
  if (text === '') return []
  const self = voiceFromContentPath(path)
  const source = path.replace(/^\//, '')
  const rows: StreamRow[] = []

  for (const line of text.split(/\r?\n/)) {
    const bare = line.replace(/^[ \t]*(?:>[ \t]?)+/, '').trim()
    const m = /^(#{2,3})[ \t]+(.+?)[ \t]*$/.exec(bare)
    if (!m) continue
    const heading = m[2].trim()
    if (heading.includes('YYYY-MM-DD')) continue // the unfilled template, in three of four mirrors
    const names = namesIn(heading, self)
    const crossings = crossingIdsIn(heading)
    if (names.length === 0 && crossings.length === 0) continue
    // A `###` is a SUB-heading inside somebody's answer, and those name siblings constantly
    // without being contact ("### 1. What now exists on the MRR side"). It only earns a row
    // when it names a crossing by id, which is how the blockquoted Local Commitments are
    // written. Without this the stream filled up with the numbered points of one long reply.
    if (m[1].length === 3 && crossings.length === 0) continue
    const date = ISO.exec(heading)?.[0] ?? null
    rows.push({
      id: rowId('req', date, heading),
      date,
      voice: self,
      names,
      crossings,
      label: 'team channel',
      text: heading,
      source,
      href: null,
      by: 'requests-heading',
    })
  }
  return rows
}

// ————————————————————————————————————————————————— the Plenum's inspection ——

/** The shape `src/lib/plenum/dossier.ts` returns. Declared structurally rather than imported
 *  as a class so this module stays free of that one's content-collection dependency — the
 *  page hands over what `buildSittings` already produced, and nothing is parsed twice. */
export interface PlenumSittingLike {
  date?: unknown
  session?: unknown
  goodsInward?: { text?: unknown; source?: unknown; label?: unknown } | null
  ecologyNames?: unknown
  href?: unknown
  source?: unknown
}

/**
 * The Plenum's own standing agenda item — "Wareneingang", goods inward: the sitting at which
 * this collective inspects what reached it from this ecology. It is the clearest cross-house
 * record anywhere in the mirrors, because the house wrote it as a standing item rather than
 * as an aside, and the plenum dossier already extracts it and already lists the sibling
 * practices each sitting names. Both are reused; nothing here re-parses the minutes.
 */
export function plenumRows(sittings: readonly PlenumSittingLike[]): StreamRow[] {
  const rows: StreamRow[] = []
  for (const s of Array.isArray(sittings) ? sittings : []) {
    const gi = s?.goodsInward
    const text = clean(gi?.text)
    if (text === '') continue
    const date = ISO.exec(clean(s.date))?.[0] ?? null
    const named = Array.isArray(s.ecologyNames) ? s.ecologyNames.map(clean).filter(Boolean) : []
    // `ecologyNames` is the plenum module's own label list ("Meridian / the Field"); the voice
    // ids come from testing the same text, so one vocabulary reaches the page.
    const names = namesIn(`${text} ${named.join(' ')}`, 'plenum')
    rows.push({
      id: rowId('plenum', date, text),
      date,
      voice: 'plenum',
      names,
      crossings: crossingIdsIn(text),
      label: clean(gi?.label) || clean(s.session) || 'goods inward',
      text,
      source: clean(gi?.source) || clean(s.source),
      href: clean(s.href) || null,
      by: 'goods-inward',
    })
  }
  return rows
}

// ————————————————————————————————————————————————— chronicles ———————————————

/** The field's and the studio's chronicle entry, structurally. */
export interface ChronicleEntryLike {
  date?: unknown
  collective_session?: unknown
  move?: unknown
  summary?: unknown
  anchor?: unknown
}

export interface ChronicleSource {
  voice: VoiceId
  entries: readonly ChronicleEntryLike[]
  /** repo-relative path of the file the entries were read from */
  source: string
  /** builds the link to that practice's own page for an entry, where one exists */
  href?: (anchor: string) => string
}

/** A session summary that names a sibling by its proper name, or a crossing by its id. */
export function chronicleRows(input: ChronicleSource): StreamRow[] {
  const rows: StreamRow[] = []
  for (const e of Array.isArray(input.entries) ? input.entries : []) {
    const summary = clean(e?.summary)
    if (summary === '') continue
    const names = namesIn(summary, input.voice)
    const crossings = crossingIdsIn(summary)
    if (names.length === 0 && crossings.length === 0) continue
    const date = ISO.exec(clean(e.date))?.[0] ?? null
    const session = typeof e.collective_session === 'number' ? `session ${e.collective_session}` : null
    const anchor = clean(e.anchor)
    rows.push({
      id: rowId('chr', date, summary),
      date,
      voice: input.voice,
      names,
      crossings,
      label: [session, clean(e.move)].filter(Boolean).join(' · ') || 'session',
      text: summary,
      source: input.source,
      href: anchor && input.href ? input.href(anchor) : null,
      by: 'chronicle-named',
    })
  }
  return rows
}

// ————————————————————————————————————————————————— the atelier's journal ————

/** `/src/content/atelier/journal/2026-07-25-x.md` → `2026-07-25-x` */
export function journalSlug(path: string): string {
  return path.replace(/^.*\/journal\//, '').replace(/\.md$/, '')
}

/**
 * The atelier keeps no chronicle; it keeps a journal, one page per entry. A page qualifies on
 * the same test as a session summary — its own words naming a sibling or a crossing — and the
 * row quotes the entry's HEADING plus its opening sentence, never the whole page: a stream is
 * a list of contacts, and the entry has its own room for the rest.
 */
export function journalRows(path: string, raw: unknown, self: VoiceId = 'ulysses'): StreamRow[] {
  const text = clean(raw)
  if (text === '') return []
  const body = text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '')
  const heading = /^#[ \t]+(.+?)[ \t]*$/m.exec(body)?.[1]?.trim() ?? ''
  const slug = journalSlug(path)
  const names = namesIn(body, self)
  const crossings = crossingIdsIn(body)
  if (names.length === 0 && crossings.length === 0) return []

  // The opening paragraph, unwrapped — not a heading, quote, table row or list item.
  const afterHeading = heading ? body.slice(body.indexOf(heading) + heading.length) : body
  let lead = ''
  for (const para of afterHeading.split(/\r?\n\s*\r?\n/)) {
    const t = para.trim()
    if (!t) continue
    if (/^#{1,6}\s/.test(t) || /^[>|]/.test(t) || /^([-+*]|\d+[.)])\s/.test(t)) continue
    lead = t.replace(/\s*\r?\n\s*/g, ' ')
    break
  }
  const date = ISO.exec(heading)?.[0] ?? ISO.exec(slug)?.[0] ?? null
  const title = heading.replace(ISO, '').replace(/^[\s—–\-·:]+/, '').trim() || slug

  return [
    {
      id: rowId('jrn', date, slug),
      date,
      voice: self,
      names,
      crossings,
      label: title,
      text: lead || title,
      source: path.replace(/^\//, ''),
      href: `/atelier/journal/${slug}/`,
      by: 'journal-named',
    },
  ]
}

// ————————————————————————————————————————————————— assembly —————————————————

export interface ContactStreamInput {
  /** mirrored REQUESTS.md files keyed by path (an `import.meta.glob(?raw)` result) */
  requests: Readonly<Record<string, unknown>>
  /** sittings already built by src/lib/plenum/dossier.ts — reused, never re-parsed */
  plenum: readonly PlenumSittingLike[]
  chronicles: readonly ChronicleSource[]
  /** the atelier's journal, keyed by path */
  journal: Readonly<Record<string, unknown>>
}

/** Newest first; a row the record left undated sorts last rather than to the beginning of
 *  time, and ties fall back to the id so the build is stable. */
export function sortStream(rows: readonly StreamRow[]): StreamRow[] {
  return [...rows].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return b.date.localeCompare(a.date)
    if (a.date && !b.date) return -1
    if (!a.date && b.date) return 1
    return a.id.localeCompare(b.id)
  })
}

export function buildContactStream(input: ContactStreamInput): StreamRow[] {
  const rows: StreamRow[] = []
  const requests = input?.requests
  if (requests && typeof requests === 'object') {
    for (const [path, raw] of Object.entries(requests)) rows.push(...requestsRows(path, raw))
  }
  rows.push(...plenumRows(input?.plenum ?? []))
  for (const c of Array.isArray(input?.chronicles) ? input.chronicles : []) rows.push(...chronicleRows(c))
  const journal = input?.journal
  if (journal && typeof journal === 'object') {
    for (const [path, raw] of Object.entries(journal)) rows.push(...journalRows(path, raw))
  }
  // Two records can carry the same words — the four mirrors are synchronised broadcasts and
  // the same team note lands in each. Identical text on the same date from the same voice is
  // one contact, not four.
  const seen = new Set<string>()
  const unique = rows.filter((r) => {
    const key = `${r.voice}|${r.date}|${r.text}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return sortStream(unique)
}

/**
 * WHERE A ROW BELONGS. A row that names exactly one crossing, and that crossing is on this
 * page, is filed with it — it is that crossing's own traffic and reads as context there.
 * Everything else stays in the standing stream: contact the register never formalised, which
 * is the whole reason the stream exists.
 */
export function partitionStream(
  rows: readonly StreamRow[],
  crossings: readonly { id: string; matchIds: readonly string[] }[],
): { byCrossing: Record<string, StreamRow[]>; standing: StreamRow[] } {
  const list = Array.isArray(crossings) ? crossings.filter((c) => c && typeof c.id === 'string') : []
  const known = new Map<string, string>()
  for (const c of list) {
    for (const m of Array.isArray(c.matchIds) ? c.matchIds : []) known.set(String(m).toLowerCase(), c.id)
  }
  const byCrossing: Record<string, StreamRow[]> = Object.fromEntries(list.map((c) => [c.id, []]))
  const standing: StreamRow[] = []

  for (const row of rows) {
    const hits = [...new Set(row.crossings.map((c) => known.get(c)).filter((v): v is string => !!v))]
    if (hits.length === 1) byCrossing[hits[0]].push(row)
    else standing.push(row)
  }
  return { byCrossing, standing }
}

/** How many rows each rule contributed — printed under the stream, so the derivation can be
 *  audited without reading the code. */
export function streamTally(rows: readonly StreamRow[]): { rule: StreamRule; label: string; count: number }[] {
  const rules: StreamRule[] = ['requests-heading', 'goods-inward', 'chronicle-named', 'journal-named']
  return rules.map((rule) => ({
    rule,
    label: STREAM_RULE_LABELS[rule],
    count: rows.filter((r) => r.by === rule).length,
  }))
}

/** Every voice pairing the stream records, for the page's summary line. */
export function streamVoices(rows: readonly StreamRow[]): { voice: VoiceId; label: string; count: number }[] {
  const counts = new Map<VoiceId, number>()
  for (const r of rows) {
    counts.set(r.voice, (counts.get(r.voice) ?? 0) + 1)
    for (const n of r.names) counts.set(n, (counts.get(n) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([voice, count]) => ({ voice, label: VOICES[voice].label, count }))
}
