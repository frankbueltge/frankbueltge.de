// src/lib/ops/since.ts — "since yesterday" and "since your last visit": the arithmetic.
//
// The entrance marks what is new since a reference point (design handoff of 2026-10-11,
// docs/design_handoff_homepage_ecology/README.md, "Since your last visit"). By default that
// point is a day before the edition; a reader who asks for it gets their own last visit
// instead. This module is the whole of that logic, kept free of every other import on purpose:
// the build uses it to render the default, and the entrance's client script bundles the very
// same functions to re-mark the page for a returning reader — so the two cannot disagree about
// what "new" means, and the script carries no second copy of the rule.
//
// WHAT IS STORED, AND WHEN. Nothing, by default. Only when the reader switches "remember my
// visits" on does the page write ONE entry to the browser's local storage:
//
//     fb-home-visits = {"ref": <ms | null>, "seen": <ms>}
//
// `seen` is the time of the newest page load; `ref` is the visit the page counts from. Nothing
// is sent anywhere and no cookie is set. Switching it off removes the entry. The opt-in is not
// decoration: § 25 TDDDG allows storing on a reader's device without consent only where it is
// strictly necessary for a service the reader has expressly asked for.
//
// PURE: every function here is arithmetic over its arguments. The clock and the storage are
// read by the caller.

export const DAY_MS = 86_400_000

/** The one local-storage entry this feature may write. */
export const VISITS_KEY = 'fb-home-visits'

/** A gap longer than this between two page loads makes the later one a new visit. A reload, or
 *  a second look an hour later, does not move the reference point. */
export const SESSION_MS = 6 * 3_600_000

export interface Visits {
  /** the visit the page counts from — null until there has been one before this session */
  ref: number | null
  /** the newest page load */
  seen: number
}

/** The stored entry, or null for no entry — and for anything that is not one: a hand-edited or
 *  truncated value is treated as absent rather than trusted. */
export function parseVisits(raw: string | null): Visits | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as { ref?: unknown; seen?: unknown }
    if (typeof value.seen !== 'number' || !Number.isFinite(value.seen)) return null
    const ref = typeof value.ref === 'number' && Number.isFinite(value.ref) ? value.ref : null
    return { ref, seen: value.seen }
  } catch {
    return null
  }
}

/** The entry as this page load leaves it: a load more than a session after the last one makes
 *  that last one the reference point; within a session the reference point stays. */
export function nextVisits(stored: Visits, now: number): Visits {
  return { ref: now - stored.seen > SESSION_MS ? stored.seen : stored.ref, seen: now }
}

/** The entry a reader gets the moment they switch the feature on: seen now, nothing to count
 *  from yet — the marking starts with their next visit. */
export const firstVisits = (now: number): Visits => ({ ref: null, seen: now })

// ── days ─────────────────────────────────────────────────────────────────────────────────────

/** The UTC day an instant falls on, ISO. */
export const dayOf = (ms: number): string => new Date(ms).toISOString().slice(0, 10)

/** Midnight UTC at the start of an ISO day. */
export const startOf = (isoDay: string): number => Date.parse(`${isoDay}T00:00:00Z`)

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]

/** "Saturday, 10 October" */
export function longDay(isoDay: string): string {
  const d = new Date(startOf(isoDay))
  return `${WEEKDAYS[d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`
}

/** "Saturday, 10 October 2026" — a dateline */
export const longDate = (isoDay: string): string => `${longDay(isoDay)} ${isoDay.slice(0, 4)}`

/** "Sat 10" — a column head */
export function shortDay(isoDay: string): string {
  const d = new Date(startOf(isoDay))
  return `${WEEKDAYS[d.getUTCDay()].slice(0, 3)} ${d.getUTCDate()}`
}

// ── what counts as new ───────────────────────────────────────────────────────────────────────

/**
 * A dated arrival is new when its day is AFTER the day of the reference point. Day precision,
 * because that is all most records name: an arrival dated on the reference day itself may have
 * landed before the reader looked, and the page does not claim otherwise.
 */
export const arrivedAfter = (isoDay: string, ref: number): boolean => isoDay > dayOf(ref)

/**
 * A day of the timetable is new when any of it lies after the reference point — its last
 * two-hour block ends after it. So "since yesterday" shades yesterday's column as well as
 * today's: part of yesterday is inside the last twenty-four hours.
 */
export const dayReaches = (isoDay: string, ref: number): boolean => startOf(isoDay) + DAY_MS > ref

/** Whole days from the reference point to the edition, at least one: "3 days". */
export const daysSpanned = (ref: number, edition: number): number => Math.max(1, Math.round((edition - ref) / DAY_MS))

// ── wording a count ──────────────────────────────────────────────────────────────────────────

/** Fills `{name}` placeholders. The templates are NAMING's; the script owns none of the words. */
export const fill = (template: string, values: Record<string, string | number>): string =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(values[key] ?? ''))

/** One of two nouns by count — `["arrival", "arrivals"]` — with the count in front. */
export const counted = (n: number, [one, many]: readonly [string, string]): string => `${n} ${n === 1 ? one : many}`
