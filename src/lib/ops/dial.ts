// src/lib/ops/dial.ts — the day dial: the strip's live UTC clock gets a face, and the face is
// data. Twelve arcs around a ring, one per two-hour slot of the UTC day, each as long as the
// commits that landed in that slot across every week of the committed pulse snapshot. Midnight
// at the top, noon at the bottom, clockwise — a 24-hour dial, so the nightly ridge of this house
// (the engines run between 03:00 and 05:00 UTC) shows up where the hand points at night.
//
// The hand is the only part the client moves, and it moves because time does: the script sets
// its angle from the browser's UTC clock once a second, exactly as it fills the text clock beside
// it. It is rendered HIDDEN here, for the same reason the text clock is rendered empty — a
// build-time hand would be a stopped clock claiming to be a live one.
//
// PURE AND DETERMINISTIC, like every figure in this room: same snapshot ⇒ byte-identical markup,
// no clock reads, no randomness. No colour either — the arcs and the hand take their ink from
// the stylesheet through their classes (scripts/drift-check.mjs rule 6).

import { arc, scaleLinear } from 'd3'
import type { PulseSnapshot } from '@/lib/pulse/render'
import { NAMING } from '@/config/naming'

/** viewBox edge, centre, and the two radii the arcs grow between */
export const DIAL = { size: 40, centre: 20, inner: 8, reach: 10.5, hand: 6 } as const

const round1 = (n: number): number => Math.round(n * 10) / 10

/**
 * Commits per slot of the UTC day, summed over the snapshot. Slot i covers the hours
 * [i·bin_hours, (i+1)·bin_hours); with the archive's 2-hour bins that is twelve slots. The
 * current week is clipped to `cutoff_bin` — bins after it are time that has not happened yet,
 * and counting them would say the future was quiet.
 */
export function dayCounts(snapshot: PulseSnapshot): number[] {
  const perDay = Math.max(1, Math.round(24 / snapshot.bin_hours))
  const counts = new Array<number>(perDay).fill(0)
  snapshot.weeks.forEach((week, w) => {
    const isLast = w === snapshot.weeks.length - 1
    const elapsed = isLast ? Math.max(0, Math.min(week.cutoff_bin ?? week.bins.length, week.bins.length)) : week.bins.length
    for (let i = 0; i < elapsed; i++) counts[i % perDay] += week.bins[i]
  })
  return counts
}

export interface DayDial {
  counts: number[]
  total: number
  weeks: number
  svg: string
}

export function buildDayDial(snapshot: PulseSnapshot): DayDial {
  const counts = dayCounts(snapshot)
  const total = counts.reduce((a, b) => a + b, 0)
  const weeks = snapshot.weeks.length
  const slots = counts.length
  const peak = Math.max(...counts, 1)
  // Radius, not area: a slot with twice the commits reaches twice as far. The floor of 1 keeps
  // an empty slot visible as a hairline of the ring — silence is drawn, never left blank.
  const reach = scaleLinear().domain([0, peak]).range([1, DIAL.reach])
  const slice = (2 * Math.PI) / slots
  const wedge = arc<{ innerRadius: number; outerRadius: number; startAngle: number; endAngle: number }>().digits(1)

  const arcs = counts.map((n, i) => {
    const d = wedge({
      innerRadius: DIAL.inner,
      outerRadius: round1(DIAL.inner + reach(n)),
      startAngle: i * slice + 0.045,
      endAngle: (i + 1) * slice - 0.045,
    })
    return `<path class="ops-dial-arc" data-slot="${i}" d="${d}"/>`
  })

  const label = NAMING.opsRoom.strip.dial({ weeks, total })
  const c = DIAL.centre
  return {
    counts,
    total,
    weeks,
    svg:
      `<svg class="ops-dial" viewBox="0 0 ${DIAL.size} ${DIAL.size}" role="img" aria-label="${label}" data-ops-dial data-slots="${slots}">` +
      `<circle class="ops-dial-ring" cx="${c}" cy="${c}" r="${DIAL.inner}"/>` +
      `<g transform="translate(${c} ${c})">${arcs.join('')}</g>` +
      `<line class="ops-dial-hand" data-ops-hand x1="${c}" y1="${c}" x2="${c}" y2="${DIAL.hand}"/>` +
      `<circle class="ops-dial-pin" cx="${c}" cy="${c}" r="1.3"/>` +
      '</svg>',
  }
}
