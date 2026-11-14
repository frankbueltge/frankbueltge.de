// src/lib/comma/rule.ts — what Comma lets sound, and how loud (2026-11-13). Pure; the island only schedules it.
//
// Three rules, each a choice of this work, published on its page:
//
// 1. Suspicion is weighted by the country, from a whole day's counts. An anomaly in one test is often a false alarm
//    (a content network answering differently, a flaky line), so how loud a country's anomalies are depends on how
//    often its network deviated on the last whole UTC day the house has read, against that day's median over the
//    countries tested at least MEDIAN_FLOOR times: weight = log2(rate / median) / OCTAVES, clipped to 0..1 — eight
//    times the median is full weight, the median itself is silence. Fewer than WEIGHT_FLOOR tests that day: weight
//    0, too few to judge. The rule is fixed before the minutes it is applied to, never fitted to them. Since
//    2026-11-14 the day's counts are committed (src/data/comma/day.json, scripts/comma/record.ts) and come with
//    the page, so the rule can be recomputed and can no longer go missing while someone listens.
// 2. One country, the same chances. Russia runs many thousands of tests in every hour, because many people there
//    measure, and without a limit it fills every minute. So each country sounds at most once every GAP_SECONDS:
//    blockpages first, then anomalies in the gaps. How censored a network is decides how loud it is, not how many
//    volunteers measure it. The gap was chosen on one recorded window (2026-11-12 19:38 UTC) after looking at it:
//    Russia's share of what sounded fell from 63 % to 20 %, within 1.5 times the next country.
// 3. Covert interference has presence: a suspicion tone lasts COMMA_SECONDS × (1 + weight).
//
// The six tones themselves are as loud as the world asked: how many tests of each kind of page ran in this hour of
// the same counted day (`tideLevel`). Until 2026-11-14 that was counted live, second by second, from all tests;
// reading all tests cost more of OONI's quota than a public piece may take (src/lib/comma/relay.ts).

import { GROUPS, groupOf } from './groups'

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

/** What can sound: a moment, a country, and whether it is proof or suspicion. */
export interface Heard {
  /** milliseconds; the moment of the world the test is dated to */
  at: number
  cc: string
  state: string
}

/** Rule 2. `memory` holds, per country, the times already sounded earlier; it is read and extended, so the limit
 *  holds across the blocks a listener hears in a row. `gapSeconds` is the pages' gap unless a deeper voice asks
 *  for its own (src/lib/comma/voices.ts). Answers the items that sound, in time order, each with its
 *  country's weight. Anything that is neither a blockpage nor an anomaly never sounds. */
export function balance<T extends Heard>(
  items: readonly T[],
  rule: Rule | null,
  memory: Map<string, number[]> = new Map(),
  gapSeconds: number = GAP_SECONDS,
): (T & { weight: number })[] {
  const gap = gapSeconds * 1000
  const free = (cc: string, at: number): boolean => (memory.get(cc) ?? []).every((u) => Math.abs(at - u) >= gap)
  const take = (t: T): T & { weight: number } => {
    const list = memory.get(t.cc) ?? []
    list.push(t.at)
    memory.set(t.cc, list)
    return { ...t, weight: weightOf(rule, t.cc) }
  }
  const out: (T & { weight: number })[] = []
  for (const t of items.filter((t) => t.state === 'confirmed').sort((a, b) => a.at - b.at)) {
    if (free(t.cc, t.at)) out.push(take(t))
  }
  for (const t of items.filter((t) => t.state === 'anomaly').sort((a, b) => a.at - b.at)) {
    if (weightOf(rule, t.cc) > 0 && free(t.cc, t.at)) out.push(take(t))
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

/** One whole UTC day of OONI's web tests, counted, as it is committed: per country the tests, the anomalies and
 *  the blockpages; per hour of the day the tests of each of the six kinds of page. */
export interface VoiceCounts {
  /** the voice's id (src/lib/comma/voices.ts) */
  id: string
  /** [country, tests, anomalies] over the voice's tests */
  countries: [string, number, number][]
  /** the voice's tests in each of the 24 hours */
  tide: number[]
}

export interface DayCounts {
  v: 2
  /** the day counted, YYYY-MM-DD (UTC) */
  day: string
  /** the web test: [country, tests, anomalies, blockpages] */
  countries: [string, number, number, number][]
  /** the web test: 24 rows, one per hour; each holds the tests of the six kinds of page, in the order of GROUPS */
  tide: number[][]
  /** the deeper voices: messengers, and the ways around a block */
  voices: VoiceCounts[]
}

const count = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0

/** The committed day, read like a stranger's file: anything that is not exactly a day of counts is none. */
export function dayOf(json: unknown): DayCounts | null {
  const d = json as Partial<DayCounts> | null
  if (!d || d.v !== 2 || typeof d.day !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(d.day)) return null
  if (!Array.isArray(d.countries) || !Array.isArray(d.tide) || d.tide.length !== 24) return null
  const countries = d.countries.filter(
    (r): r is [string, number, number, number] =>
      Array.isArray(r) && r.length === 4 && typeof r[0] === 'string' && /^[A-Z]{2}$/.test(r[0]) && count(r[1]) && count(r[2]) && count(r[3]),
  )
  if (countries.length === 0) return null
  if (!d.tide.every((h) => Array.isArray(h) && h.length === GROUPS.length && h.every(count))) return null
  if (!Array.isArray(d.voices)) return null
  const voices: VoiceCounts[] = []
  for (const v of d.voices as Partial<VoiceCounts>[]) {
    if (!v || typeof v.id !== 'string' || !/^[a-z]{2,12}$/.test(v.id)) return null
    if (!Array.isArray(v.countries) || !Array.isArray(v.tide) || v.tide.length !== 24 || !v.tide.every(count)) return null
    voices.push({
      id: v.id,
      countries: v.countries.filter(
        (r): r is [string, number, number] => Array.isArray(r) && r.length === 3 && typeof r[0] === 'string' && /^[A-Z]{2}$/.test(r[0]) && count(r[1]) && count(r[2]),
      ),
      tide: v.tide,
    })
  }
  return { v: 2, day: d.day, countries, tide: d.tide, voices }
}

/** The weights of a deeper voice, from the committed day. Not the pages' rule: a page's deviation rate means
 *  little by itself, because the lists differ by country and some deviation is normal everywhere, so the pages are
 *  weighed against the day's median. A messenger or Tor either connects or it does not, and where it works almost
 *  every test passes (on 2026-11-13 the median country failed about one test in a hundred). So the share of a
 *  country's tests that deviated is itself the measure: silent up to `silent`, full weight from `full` on, a
 *  straight line between. Fewer than WEIGHT_FLOOR tests that day: weight 0, too few to judge. `median` is the
 *  median share, kept for the record. */
export function ruleOfVoice(day: DayCounts | null, id: string, silent: number, full: number): Rule | null {
  const voice = day?.voices.find((v) => v.id === id)
  if (!voice || !(full > silent)) return null
  const judged = voice.countries.filter(([, tests]) => tests >= WEIGHT_FLOOR)
  if (judged.length === 0) return null
  const shares = judged.map(([, tests, anomalies]) => anomalies / tests).sort((a, b) => a - b)
  const mid = Math.floor(shares.length / 2)
  const weights = new Map<string, number>()
  for (const [cc, tests, anomalies] of voice.countries) {
    const w = tests < WEIGHT_FLOOR ? 0 : (anomalies / tests - silent) / (full - silent)
    weights.set(cc, Math.min(1, Math.max(0, w)))
  }
  return { median: shares.length % 2 ? shares[mid]! : (shares[mid - 1]! + shares[mid]!) / 2, weights }
}

/** OONI's count of one day by country and test, folded into one voice: [country, tests, anomalies], by country. */
export function voiceCountriesOf(json: unknown, tests: readonly string[]): [string, number, number][] {
  const rows = (json as { result?: unknown } | null)?.result
  if (!Array.isArray(rows)) return []
  const sum = new Map<string, [number, number]>()
  for (const r of rows as { probe_cc?: unknown; test_name?: unknown; measurement_count?: unknown; anomaly_count?: unknown }[]) {
    if (typeof r.probe_cc !== 'string' || !/^[A-Z]{2}$/.test(r.probe_cc)) continue
    if (typeof r.test_name !== 'string' || !tests.includes(r.test_name)) continue
    const was = sum.get(r.probe_cc) ?? [0, 0]
    sum.set(r.probe_cc, [was[0] + num(r.measurement_count), was[1] + num(r.anomaly_count)])
  }
  return [...sum.entries()].filter(([, [n]]) => n > 0).map(([cc, [n, a]]) => [cc, n, a] as [string, number, number]).sort((a, b) => a[0].localeCompare(b[0]))
}

/** OONI's count of one day by hour and test, folded into one voice: its tests in each of the 24 hours. Null when
 *  the answer does not cover exactly the 24 hours of `day`. */
export function voiceTideOf(json: unknown, day: string, tests: readonly string[]): number[] | null {
  const rows = (json as { result?: unknown } | null)?.result
  if (!Array.isArray(rows)) return null
  const tide = Array.from({ length: 24 }, () => 0)
  const seen = new Set<number>()
  for (const r of rows as { measurement_start_day?: unknown; test_name?: unknown; measurement_count?: unknown }[]) {
    if (typeof r.measurement_start_day !== 'string' || !r.measurement_start_day.startsWith(`${day}T`)) continue
    const hour = Number(r.measurement_start_day.slice(11, 13))
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) continue
    seen.add(hour)
    if (typeof r.test_name === 'string' && tests.includes(r.test_name)) tide[hour]! += num(r.measurement_count)
  }
  return seen.size === 24 ? tide : null
}

const levelOf = (perHour: number): number => Math.min(1, Math.log2(1 + (perHour / 3600) * ASK_WINDOW_SECONDS) / Math.log2(1 + ASK_FULL))

/** How loud a deeper voice's tone is at a moment of the world: its tests in this hour of the counted day, on the
 *  same scale as the pages' tones. */
export function voiceLevel(day: DayCounts | null, id: string, world: number): number {
  return levelOf(day?.voices.find((v) => v.id === id)?.tide[new Date(world).getUTCHours()] ?? 0)
}

/** Rule 1 from the committed day. */
export function ruleOfDay(day: DayCounts | null): Rule | null {
  if (!day) return null
  return ruleOf({ result: day.countries.map(([probe_cc, measurement_count, anomaly_count, confirmed_count]) => ({ probe_cc, measurement_count, anomaly_count, confirmed_count })) })
}

/** OONI's count of one day by hour and category, folded into the six kinds of page: 24 rows of six numbers.
 *  Null when the answer does not cover exactly the 24 hours of `day`. */
export function tideOf(json: unknown, day: string): number[][] | null {
  const rows = (json as { result?: unknown } | null)?.result
  if (!Array.isArray(rows)) return null
  const tide = Array.from({ length: 24 }, () => GROUPS.map(() => 0))
  const seen = new Set<number>()
  for (const r of rows as { measurement_start_day?: unknown; category_code?: unknown; measurement_count?: unknown }[]) {
    if (typeof r.measurement_start_day !== 'string' || !r.measurement_start_day.startsWith(`${day}T`)) continue
    const hour = Number(r.measurement_start_day.slice(11, 13))
    if (!Number.isInteger(hour) || hour < 0 || hour > 23) continue
    seen.add(hour)
    tide[hour]![groupOf(typeof r.category_code === 'string' ? r.category_code : null)]! += num(r.measurement_count)
  }
  return seen.size === 24 ? tide : null
}

/** How loud a kind of page's tone is at a moment of the world: the tests of that kind in this hour of the counted
 *  day, as a count per ASK_WINDOW_SECONDS, on a log scale where ASK_FULL tests are full loudness. The same scale
 *  as the live count it replaces; it changes on the hour. */
export function tideLevel(day: DayCounts | null, group: number, world: number): number {
  return levelOf(day?.tide[new Date(world).getUTCHours()]?.[group] ?? 0)
}
