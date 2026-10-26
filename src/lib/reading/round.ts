// src/lib/reading/round.ts — a round of Third Reading (2026-10-26; docs/design/2026-10-26-third-reading.md).
//
// A round reads the matters of one briefing of the Middle (research-ecology `briefings/`), pinned to
// the commit it was written in. It is committed data, never fetched: the matters, their one-line
// gist, the briefing's own "urgent but quiet" order, the terms the attention count matches, and the
// estimates a visitor may be asked, each with the figure and the page it comes from.
//
// A gist never states a figure an estimate asks for, or the pairs would hand the answer over before
// the question (round.test.ts holds that).

export type EstimateKind = 'count' | 'percent' | 'degrees'

export interface Matter {
  id: string
  /** a name short enough to label a mark in the figure */
  short: string
  title: string
  gist: string
  /** place in the briefing's "Urgent but quiet" list, best first; null when the briefing does not list it */
  quiet_rank: number | null
  /** what the attention count matches in Common Ground's day files (src/lib/reading/attention.ts) */
  terms: string[]
}

export interface EstimateItem {
  id: string
  /** a short name for the reader's result and the page's table */
  label: string
  matter: string
  question: string
  kind: EstimateKind
  unit: string
  truth: number
  truth_label: string
  source: { label: string; url: string }
}

export interface Round {
  $contract: 'third-reading-round/1'
  id: string
  briefing: { title: string; written: string; url: string }
  attention_window: { from: string; to: string }
  consent_version: string
  /** the one question every pair asks — the same in every round, so rounds can be compared */
  question: string
  pairs_per_reading: number
  estimates_per_reading: number
  matters: Matter[]
  estimates: EstimateItem[]
}

const ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
/** the longest label a mark of the figure carries */
export const SHORT_MAX = 28
const DAY = /^\d{4}-\d{2}-\d{2}$/

/** The range an answer may take, per kind — anything outside is refused, not clamped. */
export const ESTIMATE_RANGE: Record<EstimateKind, { min: number; max: number }> = {
  count: { min: 0, max: 1e10 },
  percent: { min: 0, max: 100 },
  degrees: { min: -5, max: 10 },
}

/** Every rule a round file must keep, as a list of complaints (empty = valid). */
export function roundProblems(r: Round): string[] {
  const out: string[] = []
  if (r.$contract !== 'third-reading-round/1') out.push('contract')
  if (!ID.test(r.id)) out.push(`id ${r.id}`)
  if (!r.briefing?.url?.startsWith('https://github.com/frankbueltge/research-ecology/blob/')) out.push('briefing url is not a pinned research-ecology file')
  if (!DAY.test(r.briefing?.written ?? '')) out.push('briefing date')
  if (!DAY.test(r.attention_window?.from ?? '') || !DAY.test(r.attention_window?.to ?? '') || r.attention_window.from > r.attention_window.to) out.push('attention window')
  if (!DAY.test(r.consent_version ?? '')) out.push('consent version')
  if (typeof r.question !== 'string' || !r.question.trim().endsWith('?')) out.push('question')
  const ids = new Set<string>()
  for (const m of r.matters) {
    if (!ID.test(m.id) || ids.has(m.id)) out.push(`matter id ${m.id}`)
    ids.add(m.id)
    if (!m.title || !m.gist) out.push(`matter ${m.id} text`)
    if (!m.short || m.short.length > SHORT_MAX) out.push(`matter ${m.id} short name`)
    if (!m.terms.length || m.terms.some((t) => t.trim().length < 2)) out.push(`matter ${m.id} terms`)
  }
  if (r.matters.length < 4) out.push('fewer than four matters')
  const pairs = (r.matters.length * (r.matters.length - 1)) / 2
  if (!Number.isInteger(r.pairs_per_reading) || r.pairs_per_reading < 1 || r.pairs_per_reading > pairs) out.push('pairs per reading')
  const quiet = r.matters.map((m) => m.quiet_rank).filter((q): q is number => q !== null).sort((a, b) => a - b)
  if (quiet.some((q, i) => q !== i + 1)) out.push('quiet ranks are not 1..n')
  const eids = new Set<string>()
  for (const e of r.estimates) {
    if (!ID.test(e.id) || eids.has(e.id)) out.push(`estimate id ${e.id}`)
    eids.add(e.id)
    if (!ids.has(e.matter)) out.push(`estimate ${e.id} names unknown matter ${e.matter}`)
    if (!e.label?.trim() || !e.question?.trim().endsWith('?')) out.push(`estimate ${e.id} text`)
    const range = ESTIMATE_RANGE[e.kind]
    if (!range) out.push(`estimate ${e.id} kind`)
    else if (!(e.truth > range.min && e.truth <= range.max)) out.push(`estimate ${e.id} truth out of range`)
    if (!e.source?.url?.startsWith('https://')) out.push(`estimate ${e.id} source`)
  }
  if (!Number.isInteger(r.estimates_per_reading) || r.estimates_per_reading < 0 || r.estimates_per_reading > r.estimates.length) out.push('estimates per reading')
  return out
}

/** Rounds in the order of their briefings, each checked; a file that breaks a rule stops the build. */
export function validRounds(rounds: Round[]): readonly Round[] {
  for (const r of rounds) {
    const problems = roundProblems(r)
    if (problems.length) throw new Error(`reading round ${r.id}: ${problems.join('; ')}`)
  }
  return [...rounds].sort((a, b) => a.briefing.written.localeCompare(b.briefing.written))
}

/** The round a visitor takes part in: the newest. */
export function currentRound(rounds: readonly Round[]): Round {
  const r = rounds.at(-1)
  if (!r) throw new Error('no reading round is committed')
  return r
}

export const matterById = (round: Round, id: string): Matter | undefined => round.matters.find((m) => m.id === id)
