/**
 * Invoked Past — the decay test that is not built, and the arithmetic that says why.
 *
 * The instrument's designed test was to fit Candia et al.'s biexponential decay of collective
 * attention (Nature Human Behaviour, 2019) to the daily mentions of the tracked events since the
 * register was founded. That curve is a function of an item's AGE, measured in years; a daily
 * archive moves every event's age by one day per day. This module computes, from the committed
 * register and day files only, the numbers the page uses to say so: how old the events are, how
 * far the series has moved them, what the series actually records (the selection effect, silent
 * days, bursts), and how young an age the source can show at all. Nothing here fits anything —
 * deliberately.
 */
import { dailyCalendar, daysBetween } from '@/lib/archive/calendar'
import type { InvokedData, InvokedLawTest } from './types'

/** src/data/invoked/register.json — frozen on founding, never re-ranked. */
export interface InvokedRegister {
  founded: string
  rule: string
  founding_window: [string, string]
  selection_effect: string
  events: { date: string; founding_mentions: number }[]
}

export interface TrackedEventSeries {
  /** the event's exact date */
  date: string
  /** years, as of the newest record's year — the pipeline's own age_years rule */
  age: number
  /** mentions per day across the founding window that selected it */
  foundingPerDay: number
  /** mentions summed over the observed days since founding */
  since: number
  sincePerDay: number | null
  observedDays: number
  /** observed days on which it was not mentioned at all */
  silentDays: number
  busiest: { date: string; mentions: number } | null
}

export interface DecayArithmetic {
  founded: string
  /** length of the founding window, in days */
  foundingDays: number
  /** measured days after the founding day — the founding day is excluded by its selection effect */
  observedDays: number
  /** calendar days from the founding day to the newest record */
  spanDays: number
  /** how far the series has moved every event's age: spanDays in years */
  ageShiftYears: number
  newestYear: number
  minAge: number
  maxAge: number
  /** the newest measured ceiling: no year after it reaches the instrument */
  ceiling: number | null
  /** the youngest age the source can show at all */
  youngestInvocableAge: number | null
  /** events invoked less per day since founding than in the window that selected them */
  belowFoundingRate: number
  /** events not mentioned at all on more than half of the observed days */
  mostlySilent: number
  /** the single busiest day of any tracked event since founding */
  burst: { event: string; date: string; mentions: number; silentDays: number; observedDays: number } | null
  events: TrackedEventSeries[]
}

const DAYS_PER_YEAR = 365.25

export function decayArithmetic(register: InvokedRegister, files: Record<string, unknown>): DecayArithmetic {
  const calendar = dailyCalendar<InvokedData>(files, 'invoked')
  const measured = calendar.filter((d) => d.record && d.record.stats.slots_fetched > 0)
  const observed = measured.filter((d) => d.date > register.founded && d.record!.tracked_events)
  const newestDate = calendar[calendar.length - 1]?.date ?? register.founded
  const newestYear = Number(newestDate.slice(0, 4))
  const ceiling = measured.length ? measured[measured.length - 1].record!.stats.max_year_observed : null
  const foundingDays = daysBetween(register.founding_window[0], register.founding_window[1]) + 1

  const events: TrackedEventSeries[] = register.events.map((e) => {
    const daily = observed.flatMap((d) => {
      const hit = d.record!.tracked_events!.events.find((x) => x.date === e.date)
      // a day whose record does not carry the event is not an observation of it — never a zero
      return hit ? [{ date: d.date, mentions: hit.mentions }] : []
    })
    const since = daily.reduce((s, d) => s + d.mentions, 0)
    const busiest = daily.reduce<{ date: string; mentions: number } | null>(
      (best, d) => (d.mentions > 0 && (!best || d.mentions > best.mentions) ? d : best),
      null,
    )
    return {
      date: e.date,
      age: newestYear - Number(e.date.slice(0, 4)),
      foundingPerDay: e.founding_mentions / foundingDays,
      since,
      sincePerDay: daily.length ? since / daily.length : null,
      observedDays: daily.length,
      silentDays: daily.filter((d) => d.mentions === 0).length,
      busiest,
    }
  })

  const burstEvent = events
    .filter((e) => e.busiest)
    .sort((a, b) => b.busiest!.mentions - a.busiest!.mentions || a.busiest!.date.localeCompare(b.busiest!.date) || a.date.localeCompare(b.date))[0]
  const spanDays = Math.max(0, daysBetween(register.founded, newestDate))
  const ages = events.map((e) => e.age)

  return {
    founded: register.founded,
    foundingDays,
    observedDays: observed.length,
    spanDays,
    ageShiftYears: spanDays / DAYS_PER_YEAR,
    newestYear,
    minAge: Math.min(...ages),
    maxAge: Math.max(...ages),
    ceiling,
    youngestInvocableAge: ceiling === null ? null : newestYear - ceiling,
    belowFoundingRate: events.filter((e) => e.sincePerDay !== null && e.sincePerDay < e.foundingPerDay).length,
    mostlySilent: events.filter((e) => e.observedDays > 0 && e.silentDays > e.observedDays / 2).length,
    burst: burstEvent
      ? {
          event: burstEvent.date,
          date: burstEvent.busiest!.date,
          mentions: burstEvent.busiest!.mentions,
          silentDays: burstEvent.silentDays,
          observedDays: burstEvent.observedDays,
        }
      : null,
    events,
  }
}

/** How the page reads a record's law_test block. Records written before 2026-10-17 carry
 *  `pending` and a first-possible date; that promise is withdrawn, and the page says so rather
 *  than repeating it. Records since carry `not_built` with the pipeline's reason for that day. */
export type LawReading =
  | { kind: 'not_built'; reason: string; since: string | null }
  | { kind: 'withdrawn'; reason: string; firstPossible: string | null }
  | { kind: 'other'; status: string; reason: string }

export function lawReading(t: InvokedLawTest): LawReading {
  if (t.status === 'not_built') return { kind: 'not_built', reason: t.reason, since: t.since ?? null }
  if (t.status === 'pending') return { kind: 'withdrawn', reason: t.reason, firstPossible: t.first_possible ?? null }
  return { kind: 'other', status: t.status, reason: t.reason }
}

/** Where the archive changes state: the newest day file still carrying `pending`, and the
 *  oldest carrying `not_built`. Read off the files, so the method sheet never has to guess on
 *  which night the changed pipeline first ran. */
export function lawStates(files: Record<string, unknown>): { lastPending: string | null; firstNotBuilt: string | null } {
  let lastPending: string | null = null
  let firstNotBuilt: string | null = null
  for (const { date, record } of dailyCalendar<InvokedData>(files, 'invoked')) {
    const status = record?.law_test?.status
    if (status === 'pending') lastPending = date
    if (status === 'not_built' && firstNotBuilt === null) firstNotBuilt = date
  }
  return { lastPending, firstNotBuilt }
}
