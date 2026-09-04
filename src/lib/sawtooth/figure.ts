// src/lib/sawtooth/figure.ts — the geometry of Sawtooth's plates. Pure arithmetic over the
// series: same committed file in, byte-identical paths out. Nothing here reads a clock, and
// nothing decides a colour — the stylesheet inks these, so the figures read in both themes and
// the palette rule has nothing to validate.
//
// Two plates, and the argument is in the difference between them.
//
//   THE FIRST holds both lines on ONE scale. The counterfactual — the running total of every
//   day's excess length, which is where the civil clock would stand if nobody had intervened —
//   slides away to some thirty-five seconds. The line that was actually run stays pinned at the
//   top, flat. That flatness is not the Earth behaving; it is twenty-seven interventions. Putting
//   them on one axis is the whole point: a reader sees the size of the correction as the size of
//   the gap, without a number being read out.
//
//   THE SECOND holds the observed line ALONE, on its own scale, where the teeth become visible:
//   a slide down, a snap back of exactly one second, twenty-seven times — and then, after the
//   last one, a line that drifts the other way and never needs cutting again.

import type { Sawtooth } from './series'

export interface FigureBox {
  width: number
  height: number
  padX: number
  padTop: number
  padBottom: number
}

export const WIDE: FigureBox = { width: 1000, height: 260, padX: 8, padTop: 10, padBottom: 22 }

export interface Tick {
  x: number
  label: string
}

/** The rule UTC is held to: the two clocks may never stand more than this far apart. The teeth
 *  plate is scaled to THIS rather than to the data, so a reader sees the margin the rule leaves
 *  instead of a line that fills its box — the claim "for sixty-four years it never touched the
 *  edge" is then checkable by eye rather than only in the prose. */
export const TOLERANCE = 0.9

export interface AxisLabel {
  /** where the value it names sits */
  y: number
  /** where the text sits — above its line, unless that would clip it off the plate */
  textY: number
  /** the value, already written the way the plate should show it */
  label: string
}

/** A label rides this far above its line; below this from the top edge it would be clipped, and
 *  goes under the line instead. The same rule the decade bars needed, for the same reason. */
const AXIS_RISE = 4
const AXIS_DROP = 11

function axisLabel(y: number, label: string): AxisLabel {
  return { y, textY: y - AXIS_RISE < 10 ? y + AXIS_DROP : y - AXIS_RISE, label }
}

/** A signed value written the way the prose writes it — a true minus sign, never a hyphen. */
function signed(v: number, unit = ' s'): string {
  return `${v < 0 ? '\u2212' : v > 0 ? '+' : ''}${Math.abs(v)}${unit}`
}

export interface Plate {
  /** the two paths, or one where the plate holds one line */
  paths: { id: string; d: string }[]
  /** year gridlines with their labels */
  ticks: Tick[]
  /** where zero sits, in user units — the line a value is measured against */
  zeroY: number
  /** the leap seconds, as x positions on this plate */
  leapX: number[]
  /** the extremes of the value axis this plate was scaled to, in seconds */
  domain: [number, number]
  /** the value axis, written out — without it a reader can see the gap but not its size */
  axis: AxisLabel[]
}

/** Down-sample by taking one value per bucket — the MAXIMUM ABSOLUTE value, never the mean.
 *  A mean would smooth a one-day snap of a whole second into nothing, which is precisely the
 *  event this figure exists to show. Deterministic: same input, same buckets, same picks. */
export function thin(values: readonly number[], target: number): number[] {
  if (values.length <= target) return [...values]
  const size = values.length / target
  const out: number[] = []
  for (let i = 0; i < target; i++) {
    const from = Math.floor(i * size)
    const to = Math.min(values.length, Math.floor((i + 1) * size))
    let pick = values[from]
    for (let j = from; j < to; j++) if (Math.abs(values[j]) > Math.abs(pick)) pick = values[j]
    out.push(pick)
  }
  return out
}

/** A path through `values` mapped onto the box. Straight segments, not a spline: a spline would
 *  round the corner of a leap second into a curve the record does not have. */
function path(values: readonly number[], box: FigureBox, lo: number, hi: number): string {
  if (values.length < 2) return ''
  const w = box.width - box.padX * 2
  const h = box.height - box.padTop - box.padBottom
  const span = hi - lo || 1
  return values
    .map((v, i) => {
      const x = box.padX + (i / (values.length - 1)) * w
      const y = box.padTop + (1 - (v - lo) / span) * h
      return `${i === 0 ? 'M' : 'L'}${x.toFixed(2)} ${y.toFixed(2)}`
    })
    .join('')
}

/** Year gridlines, every `step` years across the series' own span. */
function ticks(s: Sawtooth, box: FigureBox, step: number): Tick[] {
  const y0 = Number(s.first.slice(0, 4))
  const y1 = Number(s.last.slice(0, 4))
  const w = box.width - box.padX * 2
  const out: Tick[] = []
  for (let y = Math.ceil(y0 / step) * step; y <= y1; y += step) {
    out.push({ x: box.padX + ((y - y0) / (y1 - y0)) * w, label: String(y) })
  }
  return out
}

function leapPositions(s: Sawtooth, box: FigureBox): number[] {
  const t0 = Date.parse(`${s.first}T00:00:00Z`)
  const t1 = Date.parse(`${s.last}T00:00:00Z`)
  const w = box.width - box.padX * 2
  return s.leaps.map((l) => box.padX + ((Date.parse(`${l.date}T00:00:00Z`) - t0) / (t1 - t0)) * w)
}

/** Plate one: what was run, and what would have happened, on one scale. */
export function together(s: Sawtooth, box: FigureBox = WIDE, points = 900): Plate {
  // The counterfactual is drawn as a FALL: the turning Earth loses against the atomic second, so
  // the clock that follows it drops away. The series stores the loss as a positive sum.
  const drifted = thin(s.cumulative.map((v) => -v), points)
  const observed = thin(s.observed, points)
  const lo = Math.min(...drifted, ...observed)
  const hi = Math.max(...drifted, ...observed, 0)
  const h = box.height - box.padTop - box.padBottom
  const at = (v: number) => box.padTop + (1 - (v - lo) / (hi - lo || 1)) * h
  // Two labels only: the line a value is measured against, and the far end of the fall. A tidy
  // ladder of five would suggest the middle of this plate means something; it does not — the
  // subject is the distance between the two ends.
  const floor = Math.floor(lo)
  return {
    paths: [
      { id: 'uncorrected', d: path(drifted, box, lo, hi) },
      { id: 'observed', d: path(observed, box, lo, hi) },
    ],
    ticks: ticks(s, box, 10),
    zeroY: at(0),
    leapX: leapPositions(s, box),
    domain: [lo, hi],
    axis: [axisLabel(at(0), '0 s'), axisLabel(at(floor), signed(floor))],
  }
}

/** Plate two: the observed line alone, where the teeth are the subject. */
export function teeth(s: Sawtooth, box: FigureBox = WIDE, points = 1400): Plate {
  const observed = thin(s.observed, points)
  const lo = -TOLERANCE
  const hi = TOLERANCE
  const h = box.height - box.padTop - box.padBottom
  const at = (v: number) => box.padTop + (1 - (v - lo) / (hi - lo)) * h
  return {
    paths: [{ id: 'observed', d: path(observed, box, lo, hi) }],
    ticks: ticks(s, box, 10),
    zeroY: at(0),
    leapX: leapPositions(s, box),
    domain: [lo, hi],
    axis: [
      axisLabel(at(hi), `${signed(TOLERANCE)} — the rule`),
      axisLabel(at(0), '0 s'),
      axisLabel(at(lo), `${signed(-TOLERANCE)} — the rule`),
    ],
  }
}

/** Plate three is a bar per decade — the mean length of a day, and the sign change at the end. */
export interface DecadeBar {
  decade: number
  x: number
  y: number
  width: number
  height: number
  ms: number
  /** below the line: the decade whose days ran short */
  negative: boolean
  /** where the value sits, already kept clear of the decade row underneath */
  labelY: number
}

/** Where the decade names sit, and the floor every value label has to stay above. A short bar
 *  near the line has almost no room beneath it, and the first draw put the last decade's value
 *  straight on top of its own name. The rule: a value goes below its bar unless that would reach
 *  the names, in which case it goes above the bar instead. */
const DECADE_ROW = 20
const LABEL_GAP = 12
/** A label sits this far above its bar, and the box's top padding has to leave room for it —
 *  the tallest bar starts at padTop, so anything less clips the number off the plate. */
const LABEL_RISE = 6

export function decades(s: Sawtooth, box: FigureBox = { ...WIDE, height: 165, padTop: 22 }): { bars: DecadeBar[]; zeroY: number; decadeY: number } {
  const values = s.decades.map((d) => d.ms)
  const hi = Math.max(...values, 0)
  const lo = Math.min(...values, 0)
  const h = box.height - box.padTop - box.padBottom
  const span = hi - lo || 1
  const zeroY = box.padTop + (1 - (0 - lo) / span) * h
  const w = box.width - box.padX * 2
  const slot = w / s.decades.length
  const decadeY = box.height - 6
  const floor = decadeY - DECADE_ROW
  const bars = s.decades.map((d, i) => {
    const y = box.padTop + (1 - (d.ms - lo) / span) * h
    const top = Math.min(y, zeroY)
    const height = Math.abs(zeroY - y)
    const negative = d.ms < 0
    const below = top + height + LABEL_GAP
    return {
      decade: d.decade,
      x: box.padX + i * slot + slot * 0.18,
      y: top,
      width: slot * 0.64,
      height,
      ms: d.ms,
      negative,
      labelY: negative ? (below <= floor ? below : top - LABEL_RISE) : top - LABEL_RISE,
    }
  })
  return { bars, zeroY, decadeY }
}
