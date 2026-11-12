// src/lib/comma/rule.ts — what Comma lets sound, and how loud (2026-11-13). Pure; the island only schedules it.
//
// Three rules, each a choice of this work, published on its page:
//
// 1. Suspicion is weighted by the country, from the day before. An anomaly in one test is often a false alarm (a
//    content network answering differently, a flaky line), so how loud a country's anomalies are depends on how often
//    its network deviated on the previous UTC day, against that day's median over the countries tested at least
//    MEDIAN_FLOOR times: weight = log2(rate / median) / OCTAVES, clipped to 0..1 — eight times the median is full
//    weight, the median itself is silence. Fewer than WEIGHT_FLOOR tests that day: weight 0, too few to judge. The rule
//    is fixed before the minute it is applied to, never fitted to it.
// 2. One country, the same chances. Russia runs many thousands of tests in every hour, because many people there
//    measure, and without a limit it fills every minute. So each country sounds at most once every GAP_SECONDS:
//    blockpages first, then anomalies in the gaps. How censored a network is decides how loud it is, not how many
//    volunteers measure it. The gap was chosen on one recorded window (2026-11-12 19:38 UTC) after looking at it:
//    Russia's share of what sounded fell from 63 % to 20 %, within 1.5 times the next country.
// 3. Covert interference has presence: a suspicion tone lasts COMMA_SECONDS × (1 + weight).

import type { State, Test } from './ooni'

export const MEDIAN_FLOOR = 500
export const WEIGHT_FLOOR = 100
export const OCTAVES = 3
export const GAP_SECONDS = 8
export const COMMA_SECONDS = 1.6
/** The window the asking tones' loudness is counted over, and the count that is full loudness. */
export const ASK_WINDOW_SECONDS = 5
export const ASK_FULL = 60

export interface AggregationRow {
  probe_cc?: unknown
  measurement_count?: unknown
  anomaly_count?: unknown
  confirmed_count?: unknown
}

export interface Rule {
  /** the median deviation rate of the day the rule was read from */
  median: number
  weights: Map<string, number>
}

const num = (v: unknown): number => (typeof v === 'number' && Number.isFinite(v) ? v : 0)

/** The rule from OONI's aggregation of one day by country (web_connectivity): anomalies and blockpages count as
 *  deviations (OONI's aggregation keeps the two apart). Null when the day has no country above the floor. */
export function ruleOf(json: unknown): Rule | null {
  const rows = (json as { result?: unknown } | null)?.result
  if (!Array.isArray(rows)) return null
  const rate = new Map<string, number>()
  const tests = new Map<string, number>()
  for (const r of rows as AggregationRow[]) {
    if (typeof r.probe_cc !== 'string' || !/^[A-Z]{2}$/.test(r.probe_cc)) continue
    const n = num(r.measurement_count)
    if (n <= 0) continue
    tests.set(r.probe_cc, n)
    rate.set(r.probe_cc, (num(r.anomaly_count) + num(r.confirmed_count)) / n)
  }
  const above = [...rate.entries()].filter(([cc]) => (tests.get(cc) ?? 0) >= MEDIAN_FLOOR).map(([, v]) => v).sort((a, b) => a - b)
  if (above.length === 0) return null
  const mid = Math.floor(above.length / 2)
  const median = above.length % 2 ? above[mid]! : (above[mid - 1]! + above[mid]!) / 2
  if (!(median > 0)) return null
  const weights = new Map<string, number>()
  for (const [cc, r] of rate) {
    const w = (tests.get(cc) ?? 0) < WEIGHT_FLOOR ? 0 : Math.log2(Math.max(r, 1e-9) / median) / OCTAVES
    weights.set(cc, Math.min(1, Math.max(0, w)))
  }
  return { median, weights }
}

export const weightOf = (rule: Rule | null, cc: string): number => rule?.weights.get(cc) ?? 0

export const commaSeconds = (weight: number): number => COMMA_SECONDS * (1 + Math.min(1, Math.max(0, weight)))

export interface Sounded {
  at: number
  cc: string
  state: Extract<State, 'confirmed' | 'anomaly'>
  weight: number
  url: string
}

/** Rule 2. `memory` holds, per country, the times already sounded in earlier minutes; it is read and extended, so
 *  the limit holds across the minutes a listener hears in a row. */
export function balance(tests: readonly Test[], rule: Rule | null, memory: Map<string, number[]> = new Map()): Sounded[] {
  const gap = GAP_SECONDS * 1000
  const free = (cc: string, at: number): boolean => (memory.get(cc) ?? []).every((u) => Math.abs(at - u) >= gap)
  const take = (t: Test, state: Sounded['state']): Sounded => {
    const list = memory.get(t.cc) ?? []
    list.push(t.at)
    memory.set(t.cc, list)
    return { at: t.at, cc: t.cc, state, weight: weightOf(rule, t.cc), url: t.url }
  }
  const out: Sounded[] = []
  for (const t of tests.filter((t) => t.state === 'confirmed').sort((a, b) => a.at - b.at)) {
    if (free(t.cc, t.at)) out.push(take(t, 'confirmed'))
  }
  for (const t of tests.filter((t) => t.state === 'anomaly').sort((a, b) => a.at - b.at)) {
    if (weightOf(rule, t.cc) > 0 && free(t.cc, t.at)) out.push(take(t, 'anomaly'))
  }
  return out.sort((a, b) => a.at - b.at)
}

/** Forget what lies further back than the gap can reach, so a long listening does not grow the memory. */
export function prune(memory: Map<string, number[]>, now: number): void {
  for (const [cc, times] of memory) {
    const kept = times.filter((t) => now - t < GAP_SECONDS * 1000 * 2)
    if (kept.length) memory.set(cc, kept)
    else memory.delete(cc)
  }
}

/** How loud a group's tone is at `now`: the tests of that group in the last ASK_WINDOW_SECONDS, on a log scale where
 *  ASK_FULL tests are full loudness. `times` must be sorted. */
export function askingLevel(times: readonly number[], now: number): number {
  const from = now - ASK_WINDOW_SECONDS * 1000
  let count = 0
  for (let i = times.length - 1; i >= 0; i--) {
    const t = times[i]!
    if (t > now) continue
    if (t <= from) break
    count += 1
  }
  return Math.min(1, Math.log2(1 + count) / Math.log2(1 + ASK_FULL))
}
