/**
 * The day axis of a committed daily archive.
 *
 * Git is the archive: a nightly instrument commits one JSON per day as
 * src/data/<instrument>/<YYYY-MM-DD>.json. This module turns an import.meta.glob result into
 * every calendar day from the first committed file to the last, oldest first. It invents
 * nothing: a calendar day without a committed file comes back with `record: null` — a visible
 * gap for the figure to draw — and is never skipped and never interpolated. Files not named
 * like a date (latest.json, register.json) are not days.
 *
 * Reference pattern: src/lib/consensus/archive.ts (the Consensus chronicle).
 */

export interface CalendarDay<T> {
  /** YYYY-MM-DD */
  date: string
  /** the committed record for this day, or null when no file exists for it */
  record: T | null
}

const DATE_FILE_RE = /(?:^|\/)(\d{4}-\d{2}-\d{2})\.json$/

/** Unwraps a glob entry: `{ eager: true }` without `import: 'default'` yields a module. */
function unwrap(mod: unknown): unknown {
  if (mod && typeof mod === 'object' && 'default' in mod) return (mod as { default: unknown }).default
  return mod
}

/**
 * Every calendar day between the archive's first and last committed file, oldest first.
 * A record whose own `date` disagrees with its file name fails the build loudly — a figure
 * drawn from a misfiled day would put a finding on the wrong date.
 */
export function dailyCalendar<T extends { date: string }>(
  files: Record<string, unknown>,
  archive: string,
): CalendarDay<T>[] {
  const byDate = new Map<string, T>()
  for (const [path, mod] of Object.entries(files)) {
    const m = DATE_FILE_RE.exec(path)
    if (!m) continue
    const record = unwrap(mod) as T | undefined
    if (record?.date !== m[1]) {
      throw new Error(`${archive} archive: ${path} carries date "${record?.date}" — file name and record disagree`)
    }
    byDate.set(m[1], record)
  }
  if (byDate.size === 0) return []

  const dates = [...byDate.keys()].sort()
  const out: CalendarDay<T>[] = []
  const last = new Date(`${dates[dates.length - 1]}T00:00:00Z`)
  for (const d = new Date(`${dates[0]}T00:00:00Z`); d <= last; d.setUTCDate(d.getUTCDate() + 1)) {
    const date = d.toISOString().slice(0, 10)
    out.push({ date, record: byDate.get(date) ?? null })
  }
  return out
}

/** Whole calendar days from `earlier` to `later` (both YYYY-MM-DD), by UTC midnight. */
export function daysBetween(earlier: string, later: string): number {
  const a = Date.parse(`${earlier}T00:00:00Z`)
  const b = Date.parse(`${later}T00:00:00Z`)
  return Math.round((b - a) / 86_400_000)
}

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** "2026-09-01" -> "1 Sep" — split by hand, so no timezone can move the label. */
export function shortDay(iso: string): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso)
  if (!m) return iso
  const month = MONTHS_SHORT[Number(m[2]) - 1]
  return month ? `${Number(m[3])} ${month}` : iso
}

/** A tick on a day axis: the first day of every month inside the span, labelled "1 Sep",
 *  plus the span's own first and last day when they are not a first-of-month and leave room
 *  for their label. `x` is the tick position for a day index (the caller's scale). */
export function monthTicks(
  dates: readonly string[],
  x: (index: number) => number,
  minGap = 34,
): { x: number; label: string; date: string }[] {
  const ticks: { x: number; label: string; date: string }[] = []
  dates.forEach((date, i) => {
    if (date.endsWith('-01')) ticks.push({ x: +x(i).toFixed(2), label: shortDay(date), date })
  })
  const ends: [string, number][] =
    dates.length > 0 ? [[dates[0], 0], [dates[dates.length - 1], dates.length - 1]] : []
  for (const [date, i] of ends) {
    if (ticks.some((t) => t.date === date)) continue
    const tx = +x(i).toFixed(2)
    if (ticks.every((t) => Math.abs(t.x - tx) >= minGap)) ticks.push({ x: tx, label: shortDay(date), date })
  }
  return ticks.sort((a, b) => a.x - b.x)
}
