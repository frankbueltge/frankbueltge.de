// How old is the reading a nightly instrument shows, and is it overdue? (issue #723)
//
// From 2026-08-03 to 2026-08-24 /correction showed its reading of 2026-07-27 as if it were
// current: the Monday pipeline failed four times, the workflow stayed green, and the page had
// no way to say anything. The age lives in the data (`generated_at`), so the page can say it
// itself — and must, under the house rule that the site shows the newest state or says that
// it does not.
//
// Pure, so the threshold is tested rather than described. `now` is the build time: the site
// rebuilds after every nightly and every integrate run, several times a day.

export type Cadence = 'daily' | 'weekly'

const CADENCE_DAYS: Record<Cadence, number> = { daily: 1, weekly: 7 }
/** A run lands hours after its cron and the build follows later still: one day of slack. */
const GRACE_DAYS = 1
const DAY_MS = 86_400_000

export interface DataAge {
  /** YYYY-MM-DD (UTC) of the reading on the page */
  readingDate: string
  /** whole days between the reading and `now`, never negative */
  days: number
  cadence: Cadence
  /** true once the reading is older than one cadence plus the grace day */
  overdue: boolean
}

export function dataAge(generatedAt: string, cadence: Cadence, now: Date = new Date()): DataAge {
  const at = new Date(generatedAt)
  if (Number.isNaN(at.getTime())) throw new Error(`dataAge: unreadable generated_at "${generatedAt}"`)
  const ms = Math.max(0, now.getTime() - at.getTime())
  return {
    readingDate: at.toISOString().slice(0, 10),
    days: Math.floor(ms / DAY_MS),
    cadence,
    overdue: ms > (CADENCE_DAYS[cadence] + GRACE_DAYS) * DAY_MS,
  }
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

/** The quiet line every instrument carries: which reading this is and how often it renews. */
export function ageStamp(a: DataAge): string {
  const age = a.days === 0 ? 'today' : `${plural(a.days, 'day')} ago`
  return `Reading of ${a.readingDate} (${age}) · refreshed ${a.cadence}`
}

/** The sentence an overdue instrument has to say before any of its figures. */
export function overdueNotice(a: DataAge): string {
  return (
    `This instrument is overdue. It refreshes ${a.cadence}, but its newest reading is from ` +
    `${a.readingDate}, ${plural(a.days, 'day')} old. Every figure below is that reading, not today's.`
  )
}
