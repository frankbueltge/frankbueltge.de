// src/lib/ducking/mix.ts — the mix: what each channel's fader says, from the committed ledger (2026-11-01).
//
// Everything on the desk that carries a claim is computed here, so it can be checked without a
// browser. The rule, in three steps:
//
//   · COUNT. Every signal in Common Ground's day files is one unit of attention. A signal names a
//     matter by Third Reading's rule (whole word in its label or a link title, none of the matter's
//     exclusions). A signal naming two matters counts half for each, so the channels and the rest
//     always add up to the day's signals, and nothing is counted twice.
//   · SHARE. A channel's share is its signals over all signals in the trailing week. The crowd is
//     what no matter named. The sum is the whole ledger, so the 100 % of the desk is not a setting:
//     it is everything the charts held.
//   · LEVEL. The fader is logarithmic with a stretched top, like any desk's. The share is the
//     channel's share of the mix's power: 1 % is −20 dB. A channel at zero is at minus infinity, on
//     the floor.
//
// Holding a fader (solve) changes no count. It changes the mix for as long as the hand stays. The
// one thing a hand does that no fader shows is focusOf: the crowd is muffled as a matter comes up.
import { namer } from '@/lib/reading/attention'
import type { TrendingDay } from '@/lib/trending/types'
import type { Channel } from './round'

/** The trailing window of a fader, in days: long enough that one quiet day does not empty it. */
export const WINDOW_DAYS = 7
/** The bottom of the fader's travel, in dB. Far enough under the lowest mark that zero, which rests
 *  here, can be told from one signal in a week. */
export const FLOOR_DB = -45

/** The fader's taper: level in dB against position, top to floor. A real desk stretches the top of
 *  its travel and squeezes the bottom, because the top is where a channel can be heard, and so does
 *  this one. Each printed mark stays ten times the one below; the marks are just not evenly spaced. */
const TAPER: readonly (readonly [db: number, position: number])[] = [
  [0, 1],
  [-10, 0.62],
  [-20, 0.4],
  [-30, 0.24],
  [-40, 0.1],
  [FLOOR_DB, 0],
]

/** Where a raised matter starts to draw the ear from the crowd, and where it has drawn it all. */
const FOCUS_FROM = 0.25
const FOCUS_FULL = 0.7
/** The crowd's lowpass, in Hz, with no hand on a matter and with the ear fully drawn. */
const CROWD_OPEN_HZ = 5000
const CROWD_SHUT_HZ = 700

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
  const db = 10 * Math.log10(share)
  for (let i = 1; i < TAPER.length; i++) {
    const [lowDb, low] = TAPER[i]!
    const [highDb, high] = TAPER[i - 1]!
    if (db >= lowDb) return Math.min(1, low + ((db - lowDb) / (highDb - lowDb)) * (high - low))
  }
  return 0
}

/** The share a fader position means. The floor itself is zero: only a hand lifts it off. */
export function toShare(position: number): number {
  if (position <= 0) return 0
  const p = Math.min(1, position)
  for (let i = 1; i < TAPER.length; i++) {
    const [lowDb, low] = TAPER[i]!
    const [highDb, high] = TAPER[i - 1]!
    if (p >= low) return 10 ** ((lowDb + ((p - low) / (high - low)) * (highDb - lowDb)) / 10)
  }
  return 0
}

/** Between two days of the record: the shares a fader glides through while the record plays. These
 *  are the path of the motion, not measurements; the desk prints the nearest real day instead. */
export function shareAt(shares: readonly (readonly number[])[], at: number): number[] {
  const last = shares.length - 1
  const i = Math.max(0, Math.min(Math.floor(at), last))
  const j = Math.min(i + 1, last)
  const f = Math.max(0, at - i)
  return shares[i]!.map((v, c) => v + (shares[j]![c]! - v) * f)
}

/** Closer than this, in fader travel, a moving fader has arrived. */
const ARRIVED = 0.004

/** What a fader stands for right now: where it is, until it has arrived at what the mix says. */
export const standing = (position: number, target: number): number =>
  Math.abs(toPosition(target) - position) < ARRIVED ? target : toShare(position)

/** How far a hand has drawn the ear from the crowd, 0 to 1, from the positions of the held matters.
 *  Listening closely to one person blurs the room; this is that, and it changes no level. */
export function focusOf(positions: readonly number[]): number {
  const t = Math.min(1, Math.max(0, (Math.max(0, ...positions) - FOCUS_FROM) / (FOCUS_FULL - FOCUS_FROM)))
  return t * t * (3 - 2 * t)
}

/** The crowd's lowpass for a focus, in Hz. */
export const crowdCutoff = (focus: number): number => CROWD_OPEN_HZ * (CROWD_SHUT_HZ / CROWD_OPEN_HZ) ** focus

/** The line above the screen: what the crowd is, and what a hand is doing to it. */
export function captionOf(holding: readonly { strip: string; share: number }[], crowdHeld: boolean, crowd: number): string {
  const share = fmtShare(crowd)
  if (crowdHeld) return `You are holding the crowd at ${share}. The room goes to what was already loud.`
  if (holding.length === 1) return `You are holding ${holding[0]!.strip} at ${fmtShare(holding[0]!.share)}. The crowd gives way to ${share}.`
  if (holding.length > 1) return `You are holding ${holding.map((h) => h.strip).join(' and ')}. The crowd gives way to ${share}.`
  return `The crowd is the rest of the web: ${share} of what its charts held this week.`
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
