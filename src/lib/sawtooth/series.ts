// src/lib/sawtooth/series.ts — SAWTOOTH: the two definitions of a second, and the correction
// that has only ever gone one way.
//
// A second used to be a division of the day: the Earth turns, cut it into 86,400. In 1967 the
// second was redefined on caesium, and the two stopped agreeing. The Earth is not a good clock —
// it runs long, by a millisecond or two a day, and a millisecond a day is half a minute a
// lifetime. So since 1972 a leap second has been inserted twenty-seven times, each one shoving
// the civil clock back into step with the sky.
//
// Every number this module produces comes from src/data/sawtooth/rotation.json — the IERS EOP
// 14 C04 series, one row per day since 1962, committed. Nothing is typed, nothing is fetched,
// and the arithmetic below is the whole method: sums, means and extremes over one array.
//
// The shape the file holds, and what makes the picture: UT1-UTC is a SAWTOOTH. It slides down as
// the Earth falls behind, then a leap second snaps it back up by exactly one second. Twenty-seven
// teeth. And then, after 2017, the teeth stop — not because the mechanism was switched off but
// because the Earth sped up and the slide reversed. The blade started cutting the other way.

import data from '@/data/sawtooth/rotation.json'

/** The published file's own scales, named once so no reader has to infer them. */
const LOD_PER_SECOND = 1_000_000 // lod is stored in microseconds
const UT1_PER_SECOND = 10_000 // ut1_utc is stored in tenths of a millisecond

interface Raw {
  first: string
  last: string
  days: number
  fetched: string
  lod: number[]
  ut1_utc: number[]
  leaps: { date: string; tai_utc: number }[]
  sources: { eop: string; leap: string }
}

const raw = data as unknown as Raw

/** The day at index `i` of the arrays, as an ISO date. The series has no gaps — one row per day
 *  since `first` — which is a property of the published product, not an assumption made here. */
export function dayAt(i: number, first = raw.first): string {
  const d = new Date(`${first}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + i)
  return d.toISOString().slice(0, 10)
}

export interface Extreme {
  date: string
  /** milliseconds the day ran longer than 86,400 seconds; negative means shorter */
  ms: number
}

export interface DecadeMean {
  /** 1960, 1970 … — the decade's first year */
  decade: number
  /** mean excess length of a day in that decade, in milliseconds */
  ms: number
  days: number
}

export interface Sawtooth {
  first: string
  last: string
  days: number
  fetched: string
  sources: { eop: string; leap: string }
  /** every leap second actually inserted — the table's first row is the 1972 starting offset,
   *  not a correction, and is not counted here */
  leaps: { date: string; tai_utc: number }[]
  /** the day the last leap second took effect */
  lastLeap: string
  /** whole years between the last leap second and the end of the series */
  yearsSinceLeap: number
  longest: Extreme
  shortest: Extreme
  /** days that ran shorter than 86,400 seconds */
  shortDays: number
  /** how many of those fall in the decade the reversal happened in */
  shortDaysSince2020: number
  decades: DecadeMean[]
  /** total of every day's excess length: how far the turning Earth has fallen behind atomic
   *  time since the series opens, in seconds */
  drift: number
  /** UT1-UTC on the last day of the series, in seconds */
  standing: number
  /** the running total of excess day-length, one point per day, in seconds — the counterfactual:
   *  where the civil clock would stand if no leap second had ever been inserted */
  cumulative: number[]
  /** UT1-UTC as published, one point per day, in seconds — the sawtooth as it was actually run */
  observed: number[]
}

/** Mean of a slice, or null for an empty one — a decade with no data draws nothing rather than
 *  a zero, which would read as "the day was exactly right" instead of "nothing was measured". */
function mean(values: number[]): number | null {
  return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length
}

export function sawtooth(source: Raw = raw): Sawtooth {
  const lodMs = source.lod.map((v) => (v / LOD_PER_SECOND) * 1000)
  const observed = source.ut1_utc.map((v) => v / UT1_PER_SECOND)

  let longest: Extreme = { date: source.first, ms: lodMs[0] }
  let shortest: Extreme = { date: source.first, ms: lodMs[0] }
  let shortDays = 0
  let shortDaysSince2020 = 0
  const byDecade = new Map<number, number[]>()
  const cumulative: number[] = []
  let running = 0

  for (let i = 0; i < lodMs.length; i++) {
    const date = dayAt(i, source.first)
    const ms = lodMs[i]
    if (ms > longest.ms) longest = { date, ms }
    if (ms < shortest.ms) shortest = { date, ms }
    if (ms < 0) {
      shortDays += 1
      if (date >= '2020-01-01') shortDaysSince2020 += 1
    }
    const decade = Math.floor(Number(date.slice(0, 4)) / 10) * 10
    const bucket = byDecade.get(decade)
    if (bucket) bucket.push(ms)
    else byDecade.set(decade, [ms])
    running += ms / 1000
    cumulative.push(running)
  }

  const decades: DecadeMean[] = [...byDecade.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([decade, values]) => ({ decade, ms: mean(values)!, days: values.length }))

  // The table's first row is the offset UTC started from in 1972, not an inserted second.
  const leaps = source.leaps.slice(1)
  const lastLeap = leaps.at(-1)!.date
  const yearsSinceLeap = Math.floor(
    (Date.parse(`${source.last}T00:00:00Z`) - Date.parse(`${lastLeap}T00:00:00Z`)) /
      (365.2425 * 86_400_000),
  )

  return {
    first: source.first,
    last: source.last,
    days: source.days,
    fetched: source.fetched,
    sources: source.sources,
    leaps,
    lastLeap,
    yearsSinceLeap,
    longest,
    shortest,
    shortDays,
    shortDaysSince2020,
    decades,
    drift: running,
    standing: observed.at(-1)!,
    cumulative,
    observed,
  }
}
