// src/lib/ops/stack.ts — the ops room's pulse instrument: the committed commit snapshot drawn
// as a dense ridgeline stack (the Unknown Pleasures grammar), one line per HALF week.
//
// Why a second renderer beside src/lib/pulse/render.ts rather than a flag on it: the two draw
// the same data for opposite purposes. render.ts is the wide, annotated figure — one line per
// ISO week, right-margin notes, room to read a week off the page. This one is a 440 × 200
// instrument in a panel beside the headline: no labels, no annotations, twice the line density,
// and a per-line peak normalisation so a quiet week still shows its own shape instead of being
// flattened by a loud one. Folding both into one function would mean a parameter for every one
// of those decisions and a figure that is neither.
//
// PURE AND DETERMINISTIC, like render.ts: same snapshot ⇒ byte-identical markup. No clock reads,
// no randomness. The only thing that moves is the handful of dots the client script walks along
// the tracks this module emits — and it reads their geometry off the SVG itself (getPointAtLength
// on the invisible `.ops-track` paths), so the moving part never re-implements the maths below
// and cannot drift from the drawn line.

import type { PulseSnapshot, PulseWeek } from '@/lib/pulse/render'

// ---------------------------------------------------------------- geometry (mock 3a, verbatim)
const W = 1000
const H = 220
/** peak height of a fully-normalised line */
const AMP = 58
/**
 * The first baseline sits a full amplitude below the top edge, and the last one a small margin
 * above the bottom — so the oldest line's peaks cannot be sliced off by the viewBox.
 *
 * The mock's fixed 36 / 12.6 pair did exactly that: at base 36 a normalised peak reaches y = −22,
 * twenty-two units above the frame, and the top ridge of the whole figure was quietly cut in half.
 * It looked deliberate, which is the problem. The step is derived from how many lines there
 * actually are instead, so the stack fills its panel whether a snapshot yields fourteen lines or
 * eleven, and no line is ever clipped.
 */
const BASE_TOP = AMP + 2
const BASE_BOTTOM_PAD = 12
/** how many ISO weeks feed the stack (two lines each) */
export const WEEKS_IN_STACK = 7

/** One smoothing pass — deliberately NOT render.ts's two. Half a week is 42 bins; smoothing it
 *  twice rounds the nightly ridge into a hill, and the ridge is the thing worth seeing. */
export function smoothOnce(values: readonly number[]): number[] {
  return values.map(
    (_, i) => (values[Math.max(i - 1, 0)] + values[i] + values[Math.min(i + 1, values.length - 1)]) / 3,
  )
}

/**
 * Edge taper: scales a line down towards both ends so its energy sits mid-line and the stack
 * reads as a field rather than as a picket fence of full-height edges. sin(π·t)^0.55 over a
 * slightly inset domain — the exponent keeps the middle nearly untouched while the last few
 * bins fall off quickly.
 *
 * This is a DRAWING decision and it costs something: the first and last hours of a half-week
 * are drawn quieter than they were. It is applied to every line identically, so no line is
 * flattered relative to another, and the panel's footer states the smoothing — but a reader who
 * wants the unshaped numbers has them in src/data/pulse/pulse.json, which is the archive.
 */
export function taper(values: readonly number[]): number[] {
  const last = values.length - 1
  if (last <= 0) return [...values]
  return values.map((v, i) => {
    const t = i / last
    const inset = Math.min(Math.max((t - 0.04) / 0.92, 0), 1)
    return v * Math.pow(Math.sin(Math.PI * inset), 0.55)
  })
}

export interface StackLine {
  /** ISO week this line belongs to, and which half of it (0 = Mon–Thu, 1 = Thu–Sun) */
  isoWeek: number
  half: 0 | 1
  /** baseline y in the viewBox */
  base: number
  /** the polyline, already tapered, smoothed and peak-normalised to AMP */
  points: { x: number; y: number }[]
}

/**
 * The lines of the stack, oldest first — which is also back-to-front paint order: every line is
 * filled with the panel's own ground, so a newer line drawn later occludes the older ones behind
 * it. That occlusion IS the figure; it is why the fill is a solid token and not transparent.
 *
 * The current week is clipped to `cutoff_bin`: bins after it are time that has not happened yet,
 * not silence, and the same as-of honesty render.ts keeps for the wide figure applies here. A
 * half that has no elapsed bins at all yields no line — an absent line, never a flat one.
 */
export function buildStackLines(snapshot: PulseSnapshot): StackLine[] {
  const weeks = snapshot.weeks.slice(-WEEKS_IN_STACK)
  const perWeek = snapshot.bins_per_week
  const halfLength = Math.floor(perWeek / 2)
  const lines: StackLine[] = []

  const halves = (week: PulseWeek, isLast: boolean): number[][] => {
    const elapsed = isLast ? Math.max(0, Math.min(week.cutoff_bin ?? perWeek, perWeek)) : perWeek
    return [week.bins.slice(0, Math.min(halfLength, elapsed)), week.bins.slice(halfLength, elapsed)]
  }

  // Shape first, place second: the step between baselines depends on how many lines survived the
  // clipping above, so nothing can be positioned until they are all known.
  const shapedLines: { isoWeek: number; half: 0 | 1; values: number[] }[] = []
  weeks.forEach((week, w) => {
    halves(week, w === weeks.length - 1).forEach((raw, half) => {
      // Two bins cannot carry a shape; below that the taper collapses the line to nothing anyway.
      if (raw.length < 3) return
      shapedLines.push({ isoWeek: week.iso_week, half: half as 0 | 1, values: taper(smoothOnce(raw)) })
    })
  })

  const step = shapedLines.length > 1 ? (H - BASE_TOP - BASE_BOTTOM_PAD) / (shapedLines.length - 1) : 0
  shapedLines.forEach((line, i) => {
    const peak = Math.max(...line.values, 1)
    const base = BASE_TOP + i * step
    const last = line.values.length - 1
    lines.push({
      isoWeek: line.isoWeek,
      half: line.half,
      base,
      points: line.values.map((v, j) => ({ x: (j * W) / last, y: base - (v / peak) * AMP })),
    })
  })
  return lines
}

const fmt = (n: number): string => n.toFixed(1)

const polyline = (pts: { x: number; y: number }[]): string =>
  pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${fmt(p.x)} ${fmt(p.y)}`).join('')

/**
 * The stack as SVG markup. Two paths per line:
 *   · the drawn ridge — filled with the panel ground so it occludes what is behind it;
 *   · an invisible `.ops-track` twin carrying only the open polyline, which the dot script walks
 *     with getPointAtLength. The ridge path cannot serve as the track because its `d` closes back
 *     along the baseline, and a dot walking that closing segment would slide along the floor.
 *
 * The dots are interleaved into that same back-to-front paint order (2026-08-16, Frank's
 * finding — until then all six were appended after the last ridge and floated in front of
 * everything, including lines physically in front of their own): each dot renders directly
 * after the ridge it walks, so every nearer ridge occludes it exactly as it occludes the line
 * itself. Occlusion is the figure's one law, and the dots live under it too.
 */
export function buildStackSvg(snapshot: PulseSnapshot): string {
  const lines = buildStackLines(snapshot)
  const dots = buildDots(lines)
  const parts: string[] = []

  lines.forEach((line, i) => {
    const open = polyline(line.points)
    const closed = `${open}L${fmt(line.points.at(-1)!.x)} ${fmt(line.base)}L${fmt(line.points[0].x)} ${fmt(line.base)}Z`
    parts.push(`<path class="ops-ridge" d="${closed}"/>`)
    parts.push(`<path class="ops-track" id="ops-track-${i}" d="${open}"/>`)
    parts.push(...dots.filter((d) => d.track === i).map((d) => d.svg))
  })

  const label =
    `The commit pulse of all ${snapshot.repos.length} repositories behind this site, ` +
    `${lines.length} lines for the last ${Math.min(WEEKS_IN_STACK, snapshot.weeks.length)} ISO weeks, ` +
    `two lines per week, 2-hour UTC bins — as of ${snapshot.as_of}.`

  return (
    `<svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" role="img" aria-label="${label}">` +
    parts.join('') +
    '</svg>'
  )
}

/**
 * The wandering dots, six of them, each assigned to a line and given a speed and a phase.
 *
 * Rendered at BUILD time with their positions already correct for t = phase, so the instrument is
 * complete before a single byte of script runs: with JavaScript off, or under reduced motion, the
 * dots are simply six marks sitting on the pulse instead of six marks missing from it. The client
 * script does one thing only — move them — and it reads each new position off the drawn track with
 * getPointAtLength rather than re-deriving the geometry above.
 *
 * The speeds are deliberately unrelated (0.009–0.027 cycles/s, no common divisor): dots that share
 * a period fall into formation after a minute and start to look like a loading animation.
 *
 * Returned with the track index rather than as bare markup, because WHERE a dot renders is not
 * this function's call: buildStackSvg interleaves each dot behind the ridges in front of its
 * line, so the stack's occlusion applies to the dots too.
 */
function buildDots(lines: readonly StackLine[]): { track: number; svg: string }[] {
  if (lines.length === 0) return []
  const cfg = [
    { at: 0.95, speed: 0.021, phase: 0.1, opacity: 0.95 },
    { at: 0.85, speed: 0.027, phase: 0.62, opacity: 0.9 },
    { at: 0.7, speed: 0.014, phase: 0.48, opacity: 0.7 },
    { at: 0.55, speed: 0.017, phase: 0.85, opacity: 0.6 },
    { at: 0.35, speed: 0.011, phase: 0.3, opacity: 0.5 },
    { at: 0.15, speed: 0.009, phase: 0.72, opacity: 0.4 },
  ]
  return cfg.map((d, i) => {
    // `at` is a position in the stack (0 = oldest line at the top, 1 = newest at the bottom), so
    // the dots stay spread however many lines the snapshot produced.
    const track = Math.min(lines.length - 1, Math.round(d.at * (lines.length - 1)))
    const p = pointAt(lines[track], d.phase)
    return {
      track,
      svg:
        `<circle class="ops-dot" id="ops-dot-${i}" data-track="${track}" data-speed="${d.speed}" ` +
        `data-phase="${d.phase}" r="2.4" opacity="${d.opacity}" cx="${fmt(p.x)}" cy="${fmt(p.y)}"/>`,
    }
  })
}

/** Linear interpolation along a line's own points — the build-time twin of the script's
 *  getPointAtLength walk. Both land on the same curve; only this one has to be exact at t = 0. */
function pointAt(line: StackLine, t: number): { x: number; y: number } {
  const last = line.points.length - 1
  const f = Math.min(Math.max(t, 0), 1) * last
  const i = Math.floor(f)
  const a = line.points[i]
  const b = line.points[Math.min(i + 1, last)]
  const frac = f - i
  return { x: a.x + (b.x - a.x) * frac, y: a.y + (b.y - a.y) * frac }
}

/** "W27–W33" for the instrument's header strip — the weeks this stack actually drew. */
export function stackWeekRange(snapshot: PulseSnapshot): string {
  const weeks = snapshot.weeks.slice(-WEEKS_IN_STACK)
  if (weeks.length === 0) return ''
  const first = weeks[0]
  const last = weeks[weeks.length - 1]
  return first.iso_week === last.iso_week ? `W${first.iso_week}` : `W${first.iso_week}–W${last.iso_week}`
}
