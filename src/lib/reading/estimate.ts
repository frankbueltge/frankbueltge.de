// src/lib/reading/estimate.ts — an estimate against the figure it asks for (2026-10-26).
//
// What counts as "close" is a rule per kind, written here once: a count within a factor of 1.25 of the
// figure, a percentage within five points, a temperature within a tenth of a degree. Everything else is
// under or over. The page words a visitor's answer from these values; it computes none of them.
import type { EstimateItem, EstimateKind } from './round'

export type Direction = 'under' | 'close' | 'over'

export interface EstimateVerdict {
  direction: Direction
  /** count: how many times smaller or larger than the figure (≥ 1); others: null */
  factor: number | null
  /** percent and degrees: the answer minus the figure; count: null */
  difference: number | null
}

export function judge(kind: EstimateKind, value: number, truth: number): EstimateVerdict {
  if (kind === 'count') {
    const ratio = value / truth
    const factor = value <= 0 ? Infinity : ratio >= 1 ? ratio : 1 / ratio
    const direction: Direction = factor <= 1.25 ? 'close' : ratio < 1 ? 'under' : 'over'
    return { direction, factor, difference: null }
  }
  const difference = value - truth
  const band = kind === 'percent' ? 5 : 0.1
  const direction: Direction = Math.abs(difference) <= band + 1e-9 ? 'close' : difference < 0 ? 'under' : 'over'
  return { direction, factor: null, difference }
}

const fmtInt = new Intl.NumberFormat('en-GB', { maximumFractionDigits: 0 })

/** A count as people say it: 4,053 · 2.7 million · 1.2 billion. */
export function fmtCount(n: number): string {
  const abs = Math.abs(n)
  if (abs >= 1e9) return `${trim(n / 1e9)} billion`
  if (abs >= 1e6) return `${trim(n / 1e6)} million`
  return fmtInt.format(n)
}
const trim = (x: number): string => (Math.abs(x) >= 100 ? fmtInt.format(x) : x.toFixed(1).replace(/\.0$/, ''))

export function fmtValue(kind: EstimateKind, n: number): string {
  if (kind === 'count') return fmtCount(n)
  if (kind === 'percent') return `${trim(n)} %`
  return `${n.toFixed(2).replace(/0$/, '')} °C`
}

/** One sentence on an answer, in the page's words. */
export function verdictLine(item: Pick<EstimateItem, 'kind' | 'truth' | 'truth_label'>, value: number): string {
  const v = judge(item.kind, value, item.truth)
  const said = `You said ${fmtValue(item.kind, value)}; the figure is ${item.truth_label}`
  if (v.direction === 'close') return `${said}: close.`
  if (item.kind === 'count') {
    const f = v.factor === Infinity ? 'far' : `${trim(v.factor!)} times`
    return `${said}: ${f} ${v.direction === 'under' ? 'too low' : 'too high'}.`
  }
  const gap = item.kind === 'percent' ? `${trim(Math.abs(v.difference!))} points` : `${Math.abs(v.difference!).toFixed(2)} °C`
  return `${said}: ${gap} ${v.direction === 'under' ? 'too low' : 'too high'}.`
}

export interface EstimateSummary {
  id: string
  /** answers given, and "I don't know" */
  answered: number
  unknown: number
  median: number | null
  q1: number | null
  q3: number | null
  under: number
  close: number
  over: number
}

const quantile = (sorted: readonly number[], q: number): number | null => {
  if (!sorted.length) return null
  const pos = (sorted.length - 1) * q
  const lo = Math.floor(pos)
  const hi = Math.ceil(pos)
  return sorted[lo]! + (sorted[hi]! - sorted[lo]!) * (pos - lo)
}

export function summarize(item: EstimateItem, answers: readonly (number | null)[]): EstimateSummary {
  const given = answers.filter((a): a is number => a !== null).sort((a, b) => a - b)
  const tally = { under: 0, close: 0, over: 0 }
  for (const a of given) tally[judge(item.kind, a, item.truth).direction]++
  return {
    id: item.id,
    answered: given.length,
    unknown: answers.length - given.length,
    median: quantile(given, 0.5),
    q1: quantile(given, 0.25),
    q3: quantile(given, 0.75),
    ...tally,
  }
}

/** The scales a count may be typed in, so nobody has to count zeros. */
export const SCALES: readonly { label: string; factor: number }[] = [
  { label: 'exactly', factor: 1 },
  { label: 'thousand', factor: 1e3 },
  { label: 'million', factor: 1e6 },
  { label: 'billion', factor: 1e9 },
]

/**
 * A typed number, read leniently and refused when unclear: "4,053" and "4053" are four thousand and
 * fifty-three, "1.63" and "1,63" are one point six three, anything else that is not a plain number is
 * null. Spaces and the percent and degree signs are ignored.
 */
export function parseNumber(text: string): number | null {
  const t = text.replace(/[\s  %°c]/gi, '')
  if (!t) return null
  let s: string
  if (/^-?\d{1,3}(,\d{3})+(\.\d+)?$/.test(t)) s = t.replace(/,/g, '')
  else if (/^-?\d+(,\d+)?$/.test(t)) s = t.replace(',', '.')
  else if (/^-?\d+(\.\d+)?$/.test(t) || /^-?\.\d+$/.test(t)) s = t
  else return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}
