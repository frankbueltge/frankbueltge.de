// src/lib/ducking/mix.ts — the mix: what each channel's fader says, from the committed ledger (2026-11-01).
//
// Everything on the desk that carries a claim is computed here, so it can be checked without a
// browser. The rule, in three steps:
//
//   · COUNT. Every signal in Common Ground's day files is one unit of attention. A signal names a
//     matter by Third Reading's rule (whole word in its label or a link title, none of the matter's
//     exclusions). A signal naming two matters counts half for each, so the channels and the rest
//     always add up to the day's signals, and nothing is counted twice.
//   · SHARE. A channel's share is its signals over all signals in the trailing week. "Everything
//     else" is what no matter named. The sum is the whole ledger, so the 100 % of the desk is not a
//     setting: it is everything the charts held.
//   · LEVEL. The fader is logarithmic, like any desk's. The share is the channel's share of the
//     mix's power, so the level you see is the level you hear: 1 % is −20 dB. A channel at zero is
//     at minus infinity, on the floor.
//
// Holding a fader (solve) changes no count. It changes the mix for as long as the hand stays.
import { namer } from '@/lib/reading/attention'
import type { TrendingDay } from '@/lib/trending/types'
import type { Channel } from './round'

/** The trailing window of a fader, in days: long enough that one quiet day does not empty it. */
export const WINDOW_DAYS = 7
/** The bottom of the fader's travel, in dB. Far enough under the lowest mark that zero, which rests
 *  here, can be told from one signal in a week. */
export const FLOOR_DB = -45

export interface Ledger {
  /** oldest first, the committed days */
  days: string[]
  /** all signals of each day */
  totals: number[]
  /** day → channel → signals, halves included */
  counts: number[][]
}

type Counted = Pick<Channel, 'terms' | 'exclude'>

/** One row per committed day, read once. */
export function countLedger(channels: readonly Counted[], days: readonly TrendingDay[]): Ledger {
  const tests = channels.map((c) => {
    const includes = namer(c.terms)
    const excludes = namer(c.exclude ?? [])
    return (text: string) => includes(text) && !excludes(text)
  })
  const sorted = [...days].sort((a, b) => a.date.localeCompare(b.date))
  const totals: number[] = []
  const counts = sorted.map((day) => {
    const row = channels.map(() => 0)
    let total = 0
    for (const signals of Object.values(day.signals)) {
      for (const s of signals) {
        total++
        const texts = [s.label, ...(s.links ?? []).map((l) => l.title)]
        const hits = tests.flatMap((names, c) => (texts.some(names) ? [c] : []))
        for (const c of hits) row[c]! += 1 / hits.length
      }
    }
    totals.push(total)
    return row
  })
  return { days: sorted.map((d) => d.date), totals, counts }
}

const sum = (xs: readonly number[]): number => xs.reduce((a, b) => a + b, 0)

/** What a span of days held: signals per channel, and all signals. */
export function spanOf(ledger: Ledger, end: number, days: number): { counts: number[]; total: number } {
  const from = Math.max(0, end - days + 1)
  const rows = ledger.counts.slice(from, end + 1)
  return {
    counts: (ledger.counts[0] ?? []).map((_, c) => sum(rows.map((r) => r[c]!))),
    total: sum(ledger.totals.slice(from, end + 1)),
  }
}

/** Day → the trailing share of every channel, with everything else as the last entry. Sums to 1. */
export function trailingShares(ledger: Ledger, window: number = WINDOW_DAYS): number[][] {
  return ledger.days.map((_, d) => {
    const { counts, total } = spanOf(ledger, d, window)
    const shares = counts.map((n) => (total ? n / total : 0))
    return [...shares, total ? 1 - sum(shares) : 1]
  })
}

/** Where a fader stands for a share: 0 is the floor, 1 is the whole mix. */
export function toPosition(share: number): number {
  if (share <= 0) return 0
  return Math.min(1, Math.max(0, 1 - (10 * Math.log10(share)) / FLOOR_DB))
}

/** The share a fader position means. The floor itself is zero: only a hand lifts it off. */
export function toShare(position: number): number {
  if (position <= 0) return 0
  return 10 ** ((FLOOR_DB * (1 - Math.min(1, position))) / 10)
}

/** The level of a share in dB, for the page's prose and table; minus infinity at zero. */
export const toDb = (share: number): number => (share > 0 ? 10 * Math.log10(share) : -Infinity)

/** The amplitude of a channel: its share is a share of power. */
export const toGain = (share: number): number => Math.sqrt(Math.max(0, share))

/**
 * The mix with hands on it. A held channel takes the share its fader says; everything not held
 * shares what is left, in the measured proportions, so the sum stays whole. Hands that ask for more
 * than the whole are scaled down to it. A channel that measured zero gets nothing from the room
 * that opens, unless a hand lifts it.
 */
export function solve(base: readonly number[], held: readonly (number | null)[]): number[] {
  const asked = sum(held.map((h) => h ?? 0))
  const free = sum(base.map((b, c) => (held[c] === null || held[c] === undefined ? b : 0)))
  const room = Math.max(0, 1 - asked)
  return base.map((b, c) => {
    const h = held[c]
    if (h !== null && h !== undefined) return asked > 1 ? h / asked : h
    return free > 0 ? (b * room) / free : 0
  })
}

/** A share as the desk prints it: as many digits as it takes to not round a quiet matter away. */
export function fmtShare(share: number): string {
  if (share <= 0) return '0'
  const pct = share * 100
  if (pct >= 10) return `${pct.toFixed(1)} %`
  if (pct >= 1) return `${pct.toFixed(2)} %`
  return `${pct.toPrecision(2)} %`
}

/** A count that may hold halves, without a trailing ".0". */
export const fmtCount = (n: number): string => (Number.isInteger(n) ? n.toLocaleString('en-GB') : n.toFixed(1))
