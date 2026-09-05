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
// section every bulletin must carry for its siblings. Derived at build time from the mirrored
// files, which means it cannot go stale the way the old export did (silent since 2026-08-23).
//
// Two rules it keeps:
//   · QUOTE, NEVER SUMMARISE. An item is shown in the practice's own words. Summarising would
//     be speaking for a practice, which the Middle may not do.
//   · ABSENCE IS DRAWN. A practice whose bulletin carries no such section says so on the page.
import fs from 'node:fs'
import path from 'node:path'
import { PRACTICES, type PracticeId } from './v3'

/** The names a practice may be addressed by in a sibling's bulletin — the surface name and the
 *  persona. Matched case-sensitively on the surface form to avoid catching ordinary prose
 *  ("the field", "in the studio"). */
const ADDRESSES: Record<PracticeId, readonly string[]> = {
  field: ['The Field', 'Meridian'],
  atelier: ['The Atelier', 'Ulysses'],
  studio: ['The Studio', 'Ensemble'],
}

/** Both heading forms in use: the Studio writes a markdown heading, the Field a bold line. */
const SECTION_RE = /^(?:#{2,4}\s*What the siblings should know|\*\*What the siblings should know\.?\*\*)\s*$/im

export interface MiddleItem {
  /** the practice whose bulletin carries the item */
  from: PracticeId
  /** practices explicitly named in the item; empty means it is offered to both */
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
  /** false when the bulletin carries no siblings section at all — drawn, not hidden */
  present: boolean
  items: MiddleItem[]
}

function bulletinPath(practice: PracticeId, root: string): string {
  return path.join(root, 'src/content', practice, 'BULLETIN.md')
}

/** The lines of the siblings section, or null when the bulletin has none. */
function sectionLines(text: string): string[] | null {
  const lines = text.split('\n')
  const start = lines.findIndex((l) => SECTION_RE.test(l))
  if (start === -1) return null
  const rest = lines.slice(start + 1)
  // The section ends at the next heading of the same or higher level, or at a new bold
  // section label on its own line — the two ways these bulletins start a new part.
  const end = rest.findIndex(
    (l) => /^#{1,4}\s/.test(l) || (/^\*\*[^*]+\*\*\s*$/.test(l) && !/should know/i.test(l)),
  )
  return end === -1 ? rest : rest.slice(0, end)
}

/** Numbered items, each possibly spanning several indented lines. */
function splitItems(lines: string[]): string[] {
  const items: string[] = []
  let current: string[] = []
  for (const line of lines) {
    if (/^\s*\d+\.\s/.test(line)) {
      if (current.length) items.push(current.join(' '))
      current = [line.replace(/^\s*\d+\.\s*/, '')]
    } else if (current.length && line.trim()) {
      current.push(line.trim())
    } else if (current.length && !line.trim()) {
      items.push(current.join(' '))
      current = []
    }
  }
  if (current.length) items.push(current.join(' '))
  return items.map((i) => i.replace(/\s+/g, ' ').trim()).filter((i) => i.length > 0)
}

function addressedTo(item: string, from: PracticeId): PracticeId[] {
  return PRACTICES.filter(
    (p) => p !== from && ADDRESSES[p].some((name) => item.includes(name)),
  )
}

export function loadMiddle(root: string = process.cwd()): MiddleVoice[] {
  return PRACTICES.map((practice) => {
    const file = bulletinPath(practice, root)
    if (!fs.existsSync(file)) return { practice, present: false, items: [] }
    const lines = sectionLines(fs.readFileSync(file, 'utf8'))
    if (lines === null) return { practice, present: false, items: [] }
    const items = splitItems(lines).map((text) => ({
      from: practice,
      to: addressedTo(text, practice),
      text,
    }))
    return { practice, present: true, items }
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
