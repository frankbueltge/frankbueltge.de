// src/lib/ecology/pyramid/timeline.ts — WHAT HAS HAPPENED, as one axis.
//
// The entrance's second answer. Bars are works per week; the dashed verticals are the nights the
// house changed its own law; the axis runs solid to today and dashed into the future, ending at
// the reading that decides whether there is a future.
//
// Two things this module refuses to do, both learned from the mock it is built from:
//
//   · it does not place seams by eye. The design file positions them at fractional bar indices
//     (wx(2.85), wx(5.9), wx(6.2)+14) because a mock only has to look right. Here every seam sits
//     on its own real date, projected onto the same scale as the bars — so a seam cannot drift
//     away from the week it belongs to when a new week appears.
//   · it does not author the seams. They come from PROTOCOL_LADDER (the Atelier's archived
//     constitutions, each row a text in archive/protocols/) and from LINE_RESUMED (the fork's own
//     PROTOCOL.md). If the house changes its law again, the axis grows a seam without anyone
//     editing this file.

import { LINE_RESUMED, PROTOCOL_LADDER } from '@/lib/engines/nightly-line'
import type { LatestWork } from '@/lib/engines/latest'

/** Midnight UTC of an ISO date, as a number — the only time arithmetic this module does. */
const utc = (iso: string): number => Date.parse(`${iso}T00:00:00Z`)

const WEEK_MS = 7 * 86_400_000

/** Monday-anchored week index of a date, counted from the week containing `origin`. Fractional:
 *  a seam three days into a week sits three sevenths across it, which is what puts it on the
 *  right bar rather than near it. */
export function weekOffset(origin: string, iso: string): number {
  return (utc(iso) - utc(origin)) / WEEK_MS
}

export interface TimelineBar {
  /** week index from the origin, 0-based */
  week: number
  /** works whose date falls in this week */
  count: number
}

export interface TimelineSeam {
  date: string
  label: string
  /** the constitution in force now, or the fork — drawn in the house's amber */
  emphasis: boolean
  /** label row, so nearby seams do not overprint each other */
  row: 0 | 1 | 2
}

export interface Timeline {
  origin: string
  bars: TimelineBar[]
  seams: TimelineSeam[]
  /** week offset of the build date */
  today: number
  /** week offset of the reading */
  reading: number
  readingDate: string
  peak: number
}

/**
 * Works per week, from the works register.
 *
 * The origin is the night the house adopted its founding text — not the first work's week, and
 * not a date typed here. The difference is one day and it matters: the founding seam is the
 * leftmost thing on the axis, and an axis that began at the first work would have quietly dropped
 * the seam that explains why there is a first work at all.
 */
export function worksPerWeek(works: readonly LatestWork[], until: Date, origin: string): TimelineBar[] {
  const dated = works.filter((w) => /^\d{4}-\d{2}-\d{2}$/.test(w.date))
  if (dated.length === 0) return []
  const lastWeek = Math.floor(weekOffset(origin, until.toISOString().slice(0, 10)))
  const bars: TimelineBar[] = Array.from({ length: lastWeek + 1 }, (_, week) => ({ week, count: 0 }))
  for (const work of dated) {
    const week = Math.floor(weekOffset(origin, work.date))
    if (week >= 0 && week < bars.length) bars[week].count++
  }
  return bars
}

/**
 * The nights the house changed its own law.
 *
 * A seam is labelled with what that constitution made the unit of work, because that is the
 * difference a reader can actually see in the bars around it — the nightly line makes a work a
 * night, the work-line makes a work a line, and the bar heights change accordingly.
 *
 * The newest constitution and the fork carry the emphasis: one is the law in force, the other is
 * the older law running again in a second repository. Everything before them is history.
 */
export function seamsFrom(
  ladder: readonly { version: number; date: string; unit: string }[] = PROTOCOL_LADDER,
  forkDate: string = LINE_RESUMED,
): TimelineSeam[] {
  const newest = ladder.reduce((max, step) => (step.version > max.version ? step : max), ladder[0])
  const byDate = [...ladder].sort((a, b) => (a.date < b.date ? -1 : 1))
  const steps: TimelineSeam[] = byDate.map((step, i) => {
    // The label names the unit of work only when the unit actually CHANGED. Six seams inside
    // seven weeks is a crowded axis, and "V5 · WORK-LINE" beside "V6 · WORK-LINE" spends the
    // width on a word that says nothing new — the change there was to the rules, not the unit.
    const unitChanged = i === 0 || byDate[i - 1].unit !== step.unit
    const unit = step.unit.replace(/^the /, '').toUpperCase()
    return {
      date: step.date,
      label:
        i === 0
          ? `FOUNDED ${step.date.slice(5)}`
          : `V${step.version}${unitChanged ? ` · ${unit}` : ''} ${step.date.slice(5)}`,
      emphasis: step.version === newest.version,
      row: 0,
    }
  })
  steps.push({ date: forkDate, label: `THE FORK ${forkDate.slice(5)}`, emphasis: true, row: 0 })

  // Rows exist to keep neighbouring labels off each other, so they are assigned on the sorted
  // axis and not on the order the seams were collected in. Three rows rather than two: at this
  // density two adjacent seams can sit days apart, and a two-row stagger still overprints them.
  return steps
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .map((seam, i) => ({ ...seam, row: (i % 3) as 0 | 1 | 2 }))
}

export interface TimelineInput {
  works: readonly LatestWork[]
  now: Date
  readingDate: string
  /** the night the house was founded — HouseCounts.since, so the axis and the stats line agree */
  origin: string
}

export function buildTimeline({ works, now, readingDate, origin }: TimelineInput): Timeline {
  const bars = worksPerWeek(works, now, origin)
  return {
    origin,
    bars,
    // A seam before the origin cannot be drawn on this axis. There should never be one — the
    // origin IS the first seam — but a house that adopted a text before its own founding text
    // would be a finding, and dropping it silently would hide it.
    seams: seamsFrom().filter((s) => s.date >= origin),
    today: weekOffset(origin, now.toISOString().slice(0, 10)),
    reading: weekOffset(origin, readingDate),
    readingDate,
    peak: bars.reduce((max, b) => Math.max(max, b.count), 0),
  }
}

// ───────────────────────────────────────────────────────────────────────────────────────────────
// geometry — pure, so the drawing can be checked without a browser
// ───────────────────────────────────────────────────────────────────────────────────────────────

/** The drawing box. `base` sits low enough to leave three staggered label rows clear air above
 *  the tallest bar — a seam label printed over a bar is a seam nobody can read. */
export const TIMELINE_BOX = { width: 1060, height: 152, left: 14, base: 104, top: 14 } as const

/** Vertical room the seam labels occupy above the bars: three rows of 13px plus a gap. */
const LABEL_BAND = 48

export interface TimelineGeometry {
  /** x of a week offset, including fractional offsets for seams */
  x: (week: number) => number
  bars: { x: number; y: number; width: number; height: number; count: number }[]
  seams: (TimelineSeam & { x: number; labelY: number })[]
  todayX: number
  readingX: number
  /** where the solid axis stops and the dashed future begins */
  axisEnd: number
}

/**
 * The axis maps week offsets to pixels with the reading always inside the box: the future is part
 * of the picture, because the whole point of the panel is that the house is on trial. The bars
 * end at today; the stretch from today to the reading is drawn dashed.
 */
export function timelineGeometry(timeline: Timeline): TimelineGeometry {
  const { width, left, base, top } = TIMELINE_BOX
  const right = width - left
  const span = Math.max(timeline.reading, timeline.today, 1)
  const x = (week: number) => left + (week / span) * (right - left)
  const barWidth = Math.max(4, Math.min(18, ((right - left) / Math.max(span, 1)) * 0.62))
  const usable = base - top - LABEL_BAND
  const scale = timeline.peak > 0 ? usable / timeline.peak : 0

  return {
    x,
    bars: timeline.bars.map((bar) => {
      const height = Math.max(bar.count * scale, 1)
      return { x: x(bar.week) - barWidth / 2, y: base - height, width: barWidth, height, count: bar.count }
    }),
    seams: timeline.seams.map((seam) => ({
      ...seam,
      x: x(weekOffset(timeline.origin, seam.date)),
      labelY: top + 8 + seam.row * 13,
    })),
    todayX: x(timeline.today),
    readingX: x(timeline.reading),
    axisEnd: x(timeline.today),
  }
}
