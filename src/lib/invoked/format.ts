/** The Invoked Past — pure display helpers (tested in format.test.ts).
 *  No Date parsing anywhere: an ISO day is split by hand so the label of 1947-08-15 cannot
 *  depend on the timezone of the machine that renders the page. */
import type { InvokedAgeBucket, InvokedCountry } from './types'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** Thousands-separated integer: 95653 -> "95,653". */
export function count(n: number): string {
  return Math.round(n).toLocaleString('en-US')
}

/** Fixed-decimal with a typographic minus for negatives. */
export function decimal(n: number, digits = 1): string {
  const s = Math.abs(n).toFixed(digits)
  return n < 0 ? `−${s}` : s
}

/** A multiple of a baseline: 7.97 -> "8.0×". */
export function times(n: number, digits = 1): string {
  return `${decimal(n, digits)}×`
}

/** A share stored as a fraction: 0.599 -> "59.9%". */
export function percent(fraction: number, digits = 1): string {
  return `${decimal(fraction * 100, digits)}%`
}

/** "1947-08-15" -> "15 August 1947". Anything unexpected passes through untouched. */
export function humanDate(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const month = MONTHS[Number(m[2]) - 1]
  if (!month) return iso
  return `${Number(m[3])} ${month} ${Number(m[1])}`
}

/** Age bucket label: {from:11,to:25} -> "11–25 years", {from:201,to:null} -> "201+ years". */
export function ageBucketLabel(b: InvokedAgeBucket): string {
  return b.to === null ? `${b.from}+ years` : `${b.from}–${b.to} years`
}

/** "India 515 · United States 119 · United Kingdom 72" — the named part of a year's origin. */
export function invokedByLabel(countries: InvokedCountry[], max = 3): string {
  return countries
    .slice(0, max)
    .map((c) => `${c.name} ${count(c.mentions)}`)
    .join(' · ')
}

/** GKG slot window "20260814131500 .. 20260815130000 UTC" -> a readable UTC range.
 *  Falls through untouched on surprises. */
export function windowLabel(window: string): string {
  const m = window.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2} \.\. (\d{4})(\d{2})(\d{2})(\d{2})(\d{2})\d{2} UTC$/)
  if (!m) return window
  return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]} UTC — ${m[6]}-${m[7]}-${m[8]} ${m[9]}:${m[10]} UTC`
}

/** The half-width of the neighbourhood the standout is measured against, read out of the
 *  method sentence the pipeline writes from its own constant (".. the median of the +/-5
 *  years around it .."). Read rather than re-typed, so a change to the pipeline's
 *  STANDOUT_WINDOW moves the figure with it; the fallback is the v1 value, and it is the
 *  fallback only when the sentence stops saying what it says today. */
export function standoutWindow(methodStandout: string, fallback = 5): number {
  const m = /\+\/-\s*(\d+)\s+years/.exec(methodStandout)
  return m ? Number(m[1]) : fallback
}
