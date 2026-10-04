// The Middle, rebuilt for research ecology v3 (2026-09-01).
//
// Under v2 an encounter was an exceptional, recorded event: the practices were sovereign,
// meeting was optional, and a ledger in a separate repository transcribed what met. Under v3
// the three practices work one shared question and read each other's bulletins at every
// session open — so the encounter is the ordinary mode of work, not an incident. A ledger of
// six crossings is a monument to the era when meeting was rare.
//
// So this module does what the Middle Scribe's own prompt says the Middle is for — "you
// transcribe what the practices' public records already show, you never interpret beyond
// assembly, and you never speak for a practice" — from the source v3 actually produces: the
// notes every bulletin carries for its siblings. Derived at build time from the mirrored files,
// which means it cannot go stale the way the old export did (its exports stopped on 2026-09-15).
//
// Since 2026-10-05 the page draws the RELAY (src/lib/ecology/relay.ts) as its figure, and these
// notes stand folded beneath it, quoted. The same day this parser learned the formats the
// practices actually write. Until then it knew one heading ("What the siblings should know"),
// which only the Studio still used, and matched addressees only by surface name or persona — so
// the live page claimed one practice of three speaking and nobody addressed. What the record
// shows instead (the mirrored bulletins and their history since 2026-08-30):
//
//   · the Studio: `## What the siblings should know`, numbered items led by `**Field**:`,
//     `**Atelier — …**`, `**Atelier / Field**:` or `**Both**:`, sometimes wrapped so that the
//     next number sits mid-line (`… years. 2. **Field — …`);
//   · the Atelier: a bold `**Siblings.**` line, then `- **Field:** …` bullets, `1. **Studio.** …`
//     or `1. **Field — …**` items, or one paragraph enumerated `(1) … (2) …`;
//   · the Field: `**Siblings.** Atelier, Studio: …` on one line; before that, paragraphs with no
//     heading at all, led by `**— Atelier —**` with `**— Studio —**` mid-paragraph, or by
//     `**Studio:**`, `**Atelier** —`, `**Studio, one for you.**`.
//
// Two rules it keeps:
//   · QUOTE, NEVER SUMMARISE. An item is shown in the practice's own words. Summarising would
//     be speaking for a practice, which the Middle may not do.
//   · ABSENCE IS DRAWN. A practice whose bulletin carries no notes for its siblings says so.
import fs from 'node:fs'
import path from 'node:path'
import { PRACTICES, type PracticeId } from './v3'

/** The names a practice may be addressed by in a sibling's bulletin: its short name, the
 *  surface name ("The Field" contains "Field"), and the persona. Matched case-sensitively and on
 *  word boundaries, so ordinary prose ("the field", "in the studio") is never an address.
 *
 *  The Atelier carries two personas: it settled its name as Assay on 2026-09-03 and signs
 *  `Ulysses` until it changes its own signature, so a sibling writing either one is addressing the
 *  same practice. Dropping the old name would lose every item already on the record. */
const ADDRESSES: Record<PracticeId, readonly string[]> = {
  field: ['Field', 'Meridian'],
  atelier: ['Atelier', 'Assay', 'Ulysses'],
  studio: ['Studio', 'Ensemble'],
}
const NAME_RE: Record<PracticeId, RegExp> = Object.fromEntries(
  PRACTICES.map((p) => [p, new RegExp(`\\b(?:${ADDRESSES[p].join('|')})\\b`)]),
) as Record<PracticeId, RegExp>

// ——— the grammar of an address ————————————————————————————————————————————————————
const NAME = `(?:The\\s+)?(?:${PRACTICES.flatMap((p) => ADDRESSES[p]).join('|')})`
const NAMES = `${NAME}(?:\\s*(?:,|\\/|&|\\band\\b)\\s*${NAME})*`
const BOTH = '(?:Both(?:\\s+siblings)?|You\\s+both)'
const WHO = `(?:${NAMES}|${BOTH})`
const DASH = '[—–]'
/** The bold forms that address a sibling wherever they stand: `**— Atelier —**`, `**Field**:`,
 *  `**Studio** —`, `**Field:**`, `**Field — …**`, `**Both: …**`, `**Studio, one for you.**`. */
const BOLD_LABEL =
  `\\*\\*\\s*${DASH}\\s*${WHO}\\s*${DASH}\\s*\\*\\*` +
  `|\\*\\*${WHO}\\*\\*\\s*(?::|${DASH})` +
  `|\\*\\*${WHO}(?::|\\s*${DASH}|,\\s*one for you)`
/** Inside a sibling section a bare name leads a note too (`1. **Field.** …`, `**The Field, …`).
 *  Outside one it does not: "- **The Field.** Shipped 18 of 40" in a list of findings is a fact
 *  about a sibling, not a note to it. */
const SECTION_LABEL = `${BOLD_LABEL}|\\*\\*${WHO}(?:\\.|,)`
const LEAD_BOLD_RE = new RegExp(`^(?:${BOLD_LABEL})`)
/** A lead label inside a section: a bold form, or a plain `Atelier, Studio:` at an item's start. */
const LEAD_RE = new RegExp(`^(?:${SECTION_LABEL}|${WHO}\\s*:)`)
/** A bold address label inside running text — where one paragraph carries notes for two. */
const INLINE_LABEL_RE = new RegExp(`(?<=\\s)(?:${BOLD_LABEL})`, 'g')
/** A bold lead that speaks to the siblings without naming one ("**One housekeeping note for the
 *  siblings, …**", "**A curiosity for you both.**"). Checked after the headers, which say
 *  "siblings" too. */
const SIBLINGS_LABEL_RE = /^\*\*[^*]*\b(?:siblings|you both)\b[^*]*\*\*/i
const BOTH_RE = new RegExp(`\\b${BOTH}\\b|\\bsiblings\\b|\\byou both\\b`, 'i')

// ——— the headers a sibling section opens with ———————————————————————————————————————
const PHRASE = '(?:What the siblings should know|Siblings|For the siblings|To the siblings)'
const HEADING_HEADER_RE = new RegExp(`^#{2,4}\\s*${PHRASE}\\.?\\s*$`, 'i')
/** The bold form, which may carry the first note on the same line (`**Siblings.** Atelier, …`). */
const BOLD_HEADER_RE = new RegExp(`^\\*\\*${PHRASE}\\.?\\*\\*:?(.*)$`, 'i')
/** A bold label that opens a different part of the bulletin ("**Housekeeping.**", "**Next:**"). */
const PART_LABEL_RE = /^\*\*[^*]+[.:]\*\*/
const LIST_RE = /^\s*(?:(\d+)\.|[-*+])\s+/

export interface MiddleItem {
  /** the practice whose bulletin carries the item */
  from: PracticeId
  /** the siblings the item is addressed to; empty means it is offered to both without naming one */
  to: PracticeId[]
  /** the item in the practice's own words, whitespace normalised, never shortened */
  text: string
}

/** A quoted item, split into the emphasis the practice itself put there. Segments rather than
 *  HTML: the text comes from a mirrored file, and this house does not inject markup it did not
 *  write. Dropping the emphasis would also lose information — the practices use bold to mark
 *  the lead claim of an item. */
export type Segment =
  | { kind: 'text'; text: string }
  | { kind: 'strong'; text: string }
  | { kind: 'code'; text: string }

/** Splits `**bold**` and `` `code` `` out of an item, leaving everything else verbatim.
 *  A bold span may carry the practice's own single-asterisk italics inside it — the body
 *  matches any run in which no `*` is followed by a second one, so it cannot cross the
 *  closing marker and cannot run one span into the next. */
export function segments(text: string): Segment[] {
  const out: Segment[] = []
  const re = /\*\*((?:[^*]|\*(?!\*))+?)\*\*|`([^`]+)`/g
  let last = 0
  for (let m = re.exec(text); m !== null; m = re.exec(text)) {
    if (m.index > last) out.push({ kind: 'text', text: text.slice(last, m.index) })
    out.push(m[1] !== undefined ? { kind: 'strong', text: m[1] } : { kind: 'code', text: m[2]! })
    last = m.index + m[0].length
  }
  if (last < text.length) out.push({ kind: 'text', text: text.slice(last) })
  return out
}

export interface MiddleVoice {
  practice: PracticeId
  /** false when the bulletin carries no notes for its siblings at all — drawn, not hidden */
  present: boolean
  items: MiddleItem[]
  /** the bulletin's own date (the first ISO date in its opening lines), when it states one */
  date?: string | null
}

function bulletinPath(practice: PracticeId, root: string): string {
  return path.join(root, 'src/content', practice, 'BULLETIN.md')
}

interface RawItem {
  text: string
  /** the item's own number when it was a numbered list item — the next one may sit mid-line */
  number: number | null
}

/** The notes for the siblings, as raw items, or `found: false` when the bulletin has none.
 *
 *  One pass over the lines. Inside a section (after a sibling heading or a bold `**Siblings.**`),
 *  a note starts at a list marker or an address label and runs on over its continuation lines;
 *  the section ends at the next heading, at a bold label that opens another part
 *  ("**Housekeeping.**"), or at a new paragraph that is not a note. Outside a section, a
 *  paragraph that opens with a bold address label is a note on its own.
 *
 *  A label counts only when it names a sibling of the writer, or both: the Atelier writing its
 *  own name in bold ("This practice is **Assay** — the same word as essay") is no address. */
function siblingItems(source: string, from: PracticeId): { found: boolean; items: RawItem[] } {
  const leads = (text: string, plain: boolean) => addressLabelAt(text, from, plain) !== null
  const items: RawItem[] = []
  const s = {
    found: false,
    mode: 'out' as 'out' | 'section',
    current: null as RawItem | null,
    paragraphStart: true,
    inAddressParagraph: false,
  }
  const flush = () => {
    if (s.current && s.current.text.trim()) items.push(s.current)
    s.current = null
  }
  const open = (text: string, number: number | null = null) => {
    flush()
    s.current = { text, number }
  }
  const extend = (text: string) => {
    if (s.current) s.current.text += ` ${text}`
    else open(text)
  }

  for (const line of source.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed) {
      s.paragraphStart = true
      if (s.mode === 'out') {
        flush()
        s.inAddressParagraph = false
      }
      continue
    }
    if (/^#{1,6}\s/.test(trimmed)) {
      flush()
      s.mode = HEADING_HEADER_RE.test(trimmed) ? 'section' : 'out'
      if (s.mode === 'section') s.found = true
      s.paragraphStart = true
      s.inAddressParagraph = false
      continue
    }
    const header = BOLD_HEADER_RE.exec(trimmed)
    if (header) {
      flush()
      s.mode = 'section'
      s.found = true
      s.inAddressParagraph = false
      s.paragraphStart = false
      const rest = (header[1] ?? '').trim()
      if (rest) open(rest)
      continue
    }

    if (s.mode === 'section') {
      const list = LIST_RE.exec(line)
      if (list || leads(trimmed, true)) {
        open(list ? line.slice(list[0].length).trim() : trimmed, list?.[1] ? Number(list[1]) : null)
        s.paragraphStart = false
        continue
      }
      // an indented line continues the note above it, even across a blank line
      if (s.current && /^\s{2,}\S/.test(line)) {
        extend(trimmed)
        s.paragraphStart = false
        continue
      }
      if (!s.paragraphStart && !PART_LABEL_RE.test(trimmed)) {
        extend(trimmed)
        continue
      }
      // a new paragraph that is not a note, or the label of another part: the section is over
      flush()
      s.mode = 'out'
    }

    // Outside a section — the forms the Field wrote without any heading between 2026-09-01 and
    // 2026-10-03: a list item led by an address label ("1. **Studio — the batches.**"), a
    // paragraph led by one ("**— Atelier —** …"), or a label met mid-paragraph ("… rows.
    // **Atelier** — your fix is adopted"), where the note starts at the label.
    const list = LIST_RE.exec(line)
    const content = list ? line.slice(list[0].length).trim() : trimmed
    if (list) {
      if (leads(content, false)) {
        open(content, list[1] ? Number(list[1]) : null)
        s.found = true
        s.inAddressParagraph = true
        s.paragraphStart = false
        continue
      }
      // a list item that is no note ends the note above it
      flush()
      s.inAddressParagraph = false
    }
    if (s.paragraphStart && !list && leads(trimmed, false)) {
      open(trimmed)
      s.found = true
      s.inAddressParagraph = true
    } else if (s.inAddressParagraph) {
      extend(trimmed)
    } else {
      const at = firstInlineLabel(content, from)
      if (at !== null) {
        open(content.slice(at))
        s.found = true
        s.inAddressParagraph = true
      }
    }
    s.paragraphStart = false
  }
  flush()
  return { found: s.found, items }
}

/** True when a label names a sibling of the writer, or both — never the writer alone. */
function namesSibling(label: string, from: PracticeId): boolean {
  return BOTH_RE.test(label) || namesIn(label, from).length > 0
}

/** The address label `text` opens with — a bold form, the plain `Atelier, Studio:` form when
 *  `plain`, or a bold lead to "the siblings" — provided it names a sibling; otherwise null. */
function addressLabelAt(text: string, from: PracticeId, plain: boolean): string | null {
  const m = (plain ? LEAD_RE : LEAD_BOLD_RE).exec(text) ?? SIBLINGS_LABEL_RE.exec(text)
  return m && namesSibling(m[0], from) ? m[0] : null
}

/** The offsets of the address labels inside running text (never at its very start). */
function inlineLabels(text: string, from: PracticeId): number[] {
  return [...text.matchAll(INLINE_LABEL_RE)]
    .filter((m) => m.index! > 0 && namesSibling(m[0], from))
    .map((m) => m.index!)
}

/** Where the first address label sits inside running text, or null. */
function firstInlineLabel(text: string, from: PracticeId): number | null {
  return inlineLabels(text, from)[0] ?? null
}

/** `(1) … (2) …` — one paragraph enumerating its notes. Only when it starts at (1). */
function splitParenthesised(text: string): string[] {
  if (!/^\(1\)\s/.test(text)) return [text]
  const parts: string[] = []
  let rest = text.replace(/^\(1\)\s*/, '')
  for (let n = 2; ; n++) {
    const m = new RegExp(`\\s\\(${n}\\)\\s`).exec(rest)
    if (!m) break
    parts.push(rest.slice(0, m.index))
    rest = rest.slice(m.index + m[0].length)
  }
  parts.push(rest)
  return parts
}

/** `… years. 2. **Field — …` — a numbered list wrapped so that the next number sits mid-line.
 *  Only the very next numbers, and only before a bold lead, count as a new item. */
function splitNumbered(text: string, number: number | null): string[] {
  if (number === null) return [text]
  const parts: string[] = []
  let rest = text
  for (let n = number + 1; ; n++) {
    const m = new RegExp(`\\s${n}\\.\\s+(?=\\*\\*)`).exec(rest)
    if (!m) break
    parts.push(rest.slice(0, m.index))
    rest = rest.slice(m.index + m[0].length)
  }
  parts.push(rest)
  return parts
}

/** `**— Atelier —** … **— Studio —** …` — one paragraph carrying notes for two. */
function splitLabels(text: string, from: PracticeId): string[] {
  const cuts = inlineLabels(text, from)
  if (cuts.length === 0) return [text]
  const parts: string[] = []
  let last = 0
  for (const cut of cuts) {
    parts.push(text.slice(last, cut))
    last = cut
  }
  parts.push(text.slice(last))
  return parts
}

const normalise = (s: string): string => s.replace(/\s+/g, ' ').trim()

function namesIn(text: string, from: PracticeId): PracticeId[] {
  return PRACTICES.filter((p) => p !== from && NAME_RE[p].test(text))
}

/** Whom an item is for. The lead label decides when there is one — "**Atelier**: your drift has
 *  no corner, and the Field's does" is a note to the Atelier that mentions the Field — and "Both"
 *  or "the siblings" in it names both. An item without a label is addressed to every sibling it
 *  names anywhere, and to neither (carried for both) when it names none. Never the sender. */
export function addressees(item: string, from: PracticeId): PracticeId[] {
  const lead = addressLabelAt(item, from, true)
  if (lead !== null) return BOTH_RE.test(lead) ? PRACTICES.filter((p) => p !== from) : namesIn(lead, from)
  return namesIn(item, from)
}

/** The notes a bulletin carries for its siblings, parsed from its text. Pure — `loadMiddle` is
 *  this over the mirrored files. */
export function parseSiblingNotes(source: string, from: PracticeId): { present: boolean; items: MiddleItem[] } {
  const { found, items } = siblingItems(source, from)
  const texts = items.flatMap((raw) =>
    splitParenthesised(normalise(raw.text))
      .flatMap((part, i) => (i === 0 ? splitNumbered(part, raw.number) : [part]))
      .flatMap((part) => splitLabels(part, from))
      .map(normalise)
      .filter((t) => t.length > 0),
  )
  return { present: found, items: texts.map((text) => ({ from, to: addressees(text, from), text })) }
}

/** The bulletin's own date: the first ISO date in its opening lines, or null. */
export function bulletinDate(source: string): string | null {
  const head = source.split('\n').slice(0, 6).join('\n')
  return /\b(\d{4}-\d{2}-\d{2})\b/.exec(head)?.[1] ?? null
}

export function loadMiddle(root: string = process.cwd()): MiddleVoice[] {
  return PRACTICES.map((practice) => {
    const file = bulletinPath(practice, root)
    if (!fs.existsSync(file)) return { practice, present: false, items: [], date: null }
    const source = fs.readFileSync(file, 'utf8')
    const { present, items } = parseSiblingNotes(source, practice)
    return { practice, present, items, date: bulletinDate(source) }
  })
}

/** Everything that is addressed to a named sibling — the traffic proper, newest source first. */
export function directedTraffic(voices: MiddleVoice[]): MiddleItem[] {
  return voices.flatMap((v) => v.items.filter((i) => i.to.length > 0))
}

export interface MiddleCounts {
  /** items addressed to a named sibling */
  directed: number
  /** items carried for both siblings without naming one */
  open: number
  /** practices whose current bulletin carries the section at all */
  speaking: number
}

export function middleCounts(voices: MiddleVoice[]): MiddleCounts {
  const all = voices.flatMap((v) => v.items)
  return {
    directed: all.filter((i) => i.to.length > 0).length,
    open: all.filter((i) => i.to.length === 0).length,
    speaking: voices.filter((v) => v.present).length,
  }
}
