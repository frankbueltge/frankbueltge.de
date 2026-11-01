// src/lib/briefing/briefing.ts — a briefing as data (2026-11-01; docs/design/2026-11-01-the-checked-briefing.md).
//
// Until 2026-11-01 a briefing was one Markdown file, read by the practices and retyped by hand into
// everything else. Beside the text now stands `briefings/after-cycle-NNN.json` in research-ecology,
// the same matters as data. The site reads nothing else: Third Reading, Ducking and Common Ground's
// watchlist are derived from this file (./derive.ts), so what reaches a visitor has passed the check
// that a briefing's second session must pass before it is linked.
//
// `briefingProblems` is the part of that check a machine can do. It cannot say that a figure is true.
// It can refuse a file that does not record who checked it, that names no original source, or that
// would hand a voice a digit to guess at. Since 2026-11-01 a briefing also opens with the map of the
// world's state and takes its matters from it (./map.ts), from cycle 012 on, contract `briefing/2`.
import { ESTIMATE_RANGE, SHORT_MAX, type EstimateItem } from '@/lib/reading/round'
import { MAP_FROM_CYCLE, mapProblems, spreadProblems, type FieldId, type MapLine } from './map'

export type SourceKind = 'primary' | 'report'

export interface BriefingSource {
  label: string
  url: string
  /** primary: the body that made the figure. report: someone reporting it. */
  kind: SourceKind
}

/** One sentence a voice reads. `say` is the spoken form, wherever `text` holds a digit. */
export interface BriefingLine {
  text: string
  say?: string
}

export interface BriefingMatter {
  /** stable: the same id when a matter returns, so it can be read across rounds */
  id: string
  title: string
  /** a name short enough to label a mark in a figure */
  short: string
  /** what stands on a fader */
  strip: string
  /** one line for Third Reading; it may not give away what an estimate asks */
  gist: string
  /** its field on the map; every matter has one from cycle 012 on */
  field?: FieldId
  /** place in "Urgent but quiet", best first; null when the briefing does not list it */
  quiet_rank: number | null
  /** what the one attention count matches (src/lib/reading/attention.ts) */
  terms: string[]
  exclude?: string[]
  lines: BriefingLine[]
  sources: BriefingSource[]
}

export interface BriefingCheck {
  /** the day the second session finished */
  on: string
  /** every claim it read against its source */
  claims: number
  held: number
  corrected: number
  dropped: number
}

export interface Briefing {
  $contract: 'briefing/1' | 'briefing/2'
  id: string
  written: string
  checked: BriefingCheck
  /** one line per field, from cycle 012 on */
  map?: MapLine[]
  matters: BriefingMatter[]
  estimates: EstimateItem[]
  fallback: string
}

export const MATTERS_MIN = 8
export const MATTERS_MAX = 12
export const STRIP_MAX = 14
const LINES_MIN = 2
const LINES_MAX = 6
const LINE_MAX = 200

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const ROUND_ID = /^after-cycle-\d{3}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/
const SPOKEN_HINT = /\b(quiet|loud|trend\w*|attention)\b/i

/** Every rule a briefing's data must keep, as a list of complaints (empty = valid). `earlier` holds the
 *  fields of the two briefings before it, newest first, for the rule that no field stays empty for long. */
export function briefingProblems(b: Briefing, earlier: readonly (readonly FieldId[])[] = []): string[] {
  const out: string[] = []
  const mapped = Number(b.id?.slice(-3)) >= MAP_FROM_CYCLE
  if (b.$contract !== (mapped ? 'briefing/2' : 'briefing/1')) out.push('contract')
  if (!ROUND_ID.test(b.id ?? '')) out.push(`id ${b.id}`)
  if (!DAY.test(b.written ?? '')) out.push('written')
  if (!b.fallback?.trim().endsWith('?')) out.push('fallback is not a question')

  const c = b.checked
  if (!c || !DAY.test(c.on ?? '')) out.push('not checked: a second session must record the day it finished')
  else if (!(c.claims > 0) || c.held + c.corrected + c.dropped !== c.claims) out.push('check does not add up')

  const matters = b.matters ?? []
  if (matters.length < MATTERS_MIN || matters.length > MATTERS_MAX) out.push(`${matters.length} matters`)
  const ids = new Set<string>()
  for (const m of matters) {
    if (!ID.test(m.id) || ids.has(m.id)) out.push(`matter id ${m.id}`)
    ids.add(m.id)
    if (!m.title?.trim() || !m.gist?.trim()) out.push(`${m.id}: text`)
    if (!m.short || m.short.length > SHORT_MAX) out.push(`${m.id}: short name`)
    if (!m.strip || m.strip.length > STRIP_MAX || m.strip !== m.strip.toUpperCase()) out.push(`${m.id}: strip`)
    if (SPOKEN_HINT.test(`${m.title} ${m.gist}`)) out.push(`${m.id}: title or gist says how loud the web was`)
    if (!m.terms?.length || m.terms.some((t) => t.trim().length < 2)) out.push(`${m.id}: terms`)
    const lines = m.lines ?? []
    if (lines.length < LINES_MIN || lines.length > LINES_MAX) out.push(`${m.id}: ${lines.length} lines`)
    for (const l of lines) {
      if (!l.text?.trim() || l.text.length > LINE_MAX) out.push(`${m.id}: line too long or empty`)
      if (/\d/.test(l.say ?? l.text ?? '')) out.push(`${m.id}: a digit in what the voice is given: ${(l.say ?? l.text).slice(0, 40)}`)
    }
    const sources = m.sources ?? []
    if (sources.some((s) => !s.url?.startsWith('https://') || !s.label?.trim())) out.push(`${m.id}: source`)
    if (sources.some((s) => s.kind !== 'primary' && s.kind !== 'report')) out.push(`${m.id}: source kind`)
    if (!sources.some((s) => s.kind === 'primary')) out.push(`${m.id}: no primary source`)
  }
  if (mapped) out.push(...mapProblems(b.map ?? [], b.written), ...spreadProblems(matters, earlier))
  const quiet = matters.map((m) => m.quiet_rank).filter((q): q is number => q !== null).sort((x, y) => x - y)
  if (quiet.length === 0 || quiet.some((q, i) => q !== i + 1)) out.push('quiet ranks are not 1..n')

  const shown = matters.map((m) => `${m.title} ${m.gist}`).join(' ').toLowerCase()
  const eids = new Set<string>()
  for (const e of b.estimates ?? []) {
    if (!ID.test(e.id) || eids.has(e.id)) out.push(`estimate id ${e.id}`)
    eids.add(e.id)
    if (!ids.has(e.matter)) out.push(`estimate ${e.id} names unknown matter ${e.matter}`)
    if (!e.question?.trim().endsWith('?') || !e.label?.trim() || !e.truth_label?.trim()) out.push(`estimate ${e.id}: text`)
    const range = ESTIMATE_RANGE[e.kind]
    if (!range || !(e.truth > range.min && e.truth <= range.max)) out.push(`estimate ${e.id}: truth`)
    if (!e.source?.url?.startsWith('https://')) out.push(`estimate ${e.id}: source`)
    if (shown.includes(String(e.truth))) out.push(`estimate ${e.id}: a title or gist gives away ${e.truth}`)
  }
  if (eids.size < 3) out.push('fewer than three estimates')
  return out
}

/** How the one count reads a matter. Converged on any day is loud; ten signals in the window is
 *  quiet; below that it is absent. A fixed rule, so that a word in one briefing means what it meant
 *  in the last one. */
export const QUIET_FROM = 10

export type AttentionWord = 'loud' | 'quiet' | 'absent'

export const attentionWord = (signals: number, convergedDays: number): AttentionWord =>
  convergedDays > 0 ? 'loud' : signals >= QUIET_FROM ? 'quiet' : 'absent'
