// src/lib/ill-tempered-week/score.ts — what the three scores of the ill-tempered week share (2026-11-14): just
// intonation on A, the time ruler, and the lines (systems) a piece is laid out in at a given width.
//
// Pure and browser-free. The islands in src/components/ill-tempered-week/ mount what these functions return and
// compute nothing they claim; every number a score shows is derived here or in score-overlooked.ts,
// score-unison.ts and score-turn.ts, from the album's record (src/data/ill-tempered-week/<week>.json) and the
// renderer's fixed form (scripts/ill-tempered-week/itw/*.py), and the tests hold the derivation to the record.

/** A1, the fundamental of every piece: every pitch of the album is a harmonic of it (itw/base.py, F0). */
export const A1 = 55

/** Overlooked's scale: the harmonics 8 to 15 of A1 in every octave (itw/overlooked.py, SCALE). */
export const SCALE_HARMONICS = [8, 9, 10, 11, 12, 13, 14, 15] as const
/** Unison's chord: A's harmonics 4:5:6:7 in every octave (itw/unison.py, CHORD). */
export const CHORD_HARMONICS = [4, 5, 6, 7] as const

export interface Harmonic {
  /** the exact pitch, 55 × harmonic × 2^octave */
  hz: number
  /** the harmonic of A1 within the set's own octave (8 to 15, or 4 to 7) */
  harmonic: number
  /** octaves above (or below, negative) the set's own octave */
  octave: number
  /** the interval above the A beneath it, reduced: 11/8, 3/2, 7/4; 1/1 is A itself */
  ratio: string
}

const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b))

/** The pitch as a harmonic of A, if it is one of the set's (the records round to a hundredth or a tenth of a hertz,
 *  so a pitch within 0.06 Hz of a harmonic is that harmonic). Null for a pitch outside the set. */
export function harmonicOf(hz: number, set: readonly number[]): Harmonic | null {
  if (!(hz > 0)) return null
  const base = Math.min(...set)
  for (const h of set) {
    const octave = Math.round(Math.log2(hz / (A1 * h)))
    const exact = A1 * h * 2 ** octave
    if (Math.abs(exact - hz) <= 0.06) {
      const g = gcd(h, base)
      return { hz: exact, harmonic: h, octave, ratio: `${h / g}/${base / g}` }
    }
  }
  return null
}

/** Every pitch of the set between lo and hi (inclusive), low to high: the lines of a just staff. */
export function harmonicsBetween(lo: number, hi: number, set: readonly number[]): Harmonic[] {
  const out: Harmonic[] = []
  for (let octave = -6; octave <= 6; octave++) {
    for (const h of set) {
      const hz = A1 * h * 2 ** octave
      if (hz >= lo - 0.06 && hz <= hi + 0.06) out.push(harmonicOf(hz, set)!)
    }
  }
  return out.sort((a, b) => a.hz - b.hz)
}

/** A pitch as the page writes it: whole hertz where it is whole, else one decimal (89.375 Hz is "89.4 Hz"). */
export const hzLabel = (hz: number): string => `${Number.isInteger(Math.round(hz * 10) / 10) ? Math.round(hz) : (Math.round(hz * 10) / 10).toFixed(1)} Hz`

/** m:ss, cut as an audio player counts (the same as albums.ts's clock, repeated so this module stays fs-free). */
export const mmss = (seconds: number): string => {
  const s = Math.max(0, Math.floor(seconds + 1e-9))
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const DAY_NAME = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const dow = (day: string): number => (new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7
/** "Mon" for 2026-11-02. */
export const dayAbbr = (day: string): string => DAY_ABBR[dow(day)]!
/** "Monday" for 2026-11-02. */
export const dayName = (day: string): string => DAY_NAME[dow(day)]!
/** "Mon 2 Nov" for 2026-11-02. */
export const dayShort = (day: string): string => `${dayAbbr(day)} ${Number(day.slice(8, 10))} ${MONTH[Number(day.slice(5, 7)) - 1]}`

// ---------------------------------------------------------------------------------------------------------------
// The ruler and the lines
// ---------------------------------------------------------------------------------------------------------------

/** The step between labelled ticks: the smallest of 5, 10, 15, 30, 60 or 120 s that leaves minGap pixels. */
export function tickStep(pxPerSecond: number, minGap = 46): number {
  for (const s of [5, 10, 15, 30, 60, 120]) if (s * pxPerSecond >= minGap) return s
  return 300
}

/** The multiples of step within [t0, t1]. */
export function ticksBetween(t0: number, t1: number, step: number): number[] {
  const out: number[] = []
  for (let t = Math.ceil(t0 / step - 1e-9) * step; t <= t1 + 1e-9; t += step) out.push(Math.round(t * 1000) / 1000)
  return out
}

export interface Span {
  index: number
  t0: number
  t1: number
}

/** The lines a piece is laid out in, like the systems of a printed score: a line breaks only where a day begins, and
 *  holds as many whole days as fit in maxSeconds (a day longer than that gets a line of its own). The first line
 *  starts at 0 and the last ends at the piece's end. */
export function systemsFor(end: number, dayStarts: readonly number[], maxSeconds: number): Span[] {
  const cuts = [...new Set([...dayStarts.filter((c) => c > 0 && c < end), end])].sort((a, b) => a - b)
  const out: Span[] = []
  let t0 = 0
  let i = 0
  while (i < cuts.length) {
    let j = i
    while (j + 1 < cuts.length && cuts[j + 1]! - t0 <= maxSeconds + 1e-9) j++
    out.push({ index: out.length, t0, t1: cuts[j]! })
    t0 = cuts[j]!
    i = j + 1
  }
  return out
}

export interface Frame {
  /** the drawing's width in CSS pixels, which is also its viewBox width */
  width: number
  /** the x where time starts on every line (after the label gutter) */
  left: number
  /** the x where the longest line ends */
  right: number
  pxPerSecond: number
  /** lines, top to bottom; each piece adds its own heights */
  spans: Span[]
  /** true below the narrow breakpoint: short labels, a slim gutter */
  narrow: boolean
}

/** Below this width the scores use short labels and may wrap into several lines. */
export const NARROW = 560

/** The frame for a piece at a width: one line if the whole piece fits at minPps pixels a second, else lines broken at
 *  day starts; the longest line fills the width, so every line shares one scale. */
export function frameFor(width: number, end: number, dayStarts: readonly number[], minPps: number, gutter: { wide: number; narrow: number }): Frame {
  const narrow = width < NARROW
  const left = narrow ? gutter.narrow : gutter.wide
  const right = width - 8
  const room = Math.max(40, right - left)
  const spans = room / end >= minPps ? [{ index: 0, t0: 0, t1: end }] : systemsFor(end, dayStarts, room / minPps)
  const longest = Math.max(...spans.map((s) => s.t1 - s.t0))
  return { width, left, right, pxPerSecond: room / longest, spans, narrow }
}

/** The x of a moment on its line. */
export const xAt = (f: Frame, span: Span, t: number): number => f.left + (t - span.t0) * f.pxPerSecond

/** The line that holds a moment: the first whose end lies beyond it, and the last line for the end and beyond. */
export function spanAt(f: Frame, t: number): Span {
  return f.spans.find((s) => t < s.t1) ?? f.spans.at(-1)!
}

/** The moment under an x on a line, held to the line. */
export function timeAtX(f: Frame, span: Span, x: number): number {
  return Math.min(span.t1, Math.max(span.t0, span.t0 + (x - f.left) / f.pxPerSecond))
}

/** Clips [t0, t1) to a line; null when they do not meet. */
export function clip(span: Span, t0: number, t1: number): [number, number] | null {
  const a = Math.max(t0, span.t0)
  const b = Math.min(t1, span.t1)
  return b > a ? [a, b] : null
}

/** The first of the labels that fits the room (in pixels, at the width of the scores' mono type), else the last and
 *  shortest: a day's name never runs into its neighbour's. */
export function fitLabel(candidates: readonly string[], room: number, charWidth = 6.5): string {
  return candidates.find((c) => c.length * charWidth <= room) ?? candidates.at(-1)!
}

/** One decimal, as the drawings write their coordinates (keeps the server render small and deterministic). */
export const r1 = (x: number): number => Math.round(x * 10) / 10
