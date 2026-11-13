// src/lib/ill-tempered-week/score-turn.ts — Turn as a score (2026-11-14): the rhythmicon bar by bar, each platform
// family a row of as many beats as its harmonic number, as many of them sounding as the family had AI signals.
//
// The record (pieces.turn) holds each day's start, its bar length, its counts by family and the turn. The bars
// themselves follow from the renderer's fixed form (scripts/ill-tempered-week/itw/turn.py), mirrored below: ten bars a
// day whose length glides from the day before's into the day's own over the first half, the turn's two extra bars,
// and Toussaint's even spread of a family's beats over its bar. score-turn.test.ts rebuilds every bar and holds the
// days' starts and the piece's length to the record.
import type { Turn } from './albums'
import { A1, clip, dayAbbr, dayName, dayShort, frameFor, mmss, r1, tickStep, ticksBetween, xAt, type Frame, type Span } from './score'

/** The renderer's form, as itw/turn.py writes it (the test reads the constants back from the source). */
export const FORM = {
  /** the first bar begins here */
  start: 1.0,
  /** the families the rhythmicon voices, in the order the score draws them (reading and markets are counted, not voiced) */
  voiced: ['search', 'news', 'social', 'tech'] as const,
  /** the vowel each voiced family sings (itw/vowels.py) */
  vowels: { search: 'ee', news: 'oh', social: 'oo', tech: 'eh' } as Record<string, string>,
  /** the turn's silent bar is this many bars long */
  saidBars: 2,
  /** after the last bar one low A sounds this long; the piece ends half a second after it */
  lowA: 6.0,
  tail: 6.5,
} as const

export type Family = (typeof FORM.voiced)[number]

/** Toussaint's euclidean rhythm, as itw/turn.py spreads k beats over n: the steps floor(i·n/k). */
export function euclid(k: number, n: number): number[] {
  if (k <= 0) return []
  return [...new Set(Array.from({ length: k }, (_, i) => Math.floor((i * n) / k)))].sort((a, b) => a - b)
}

export interface Beat {
  family: Family
  /** the family's harmonic: its beats a bar and its pitch, A1 × harmonic */
  h: number
  /** how many of them sound */
  k: number
  steps: number[]
}

export interface Bar {
  index: number
  day: number
  t0: number
  len: number
  kind: 'bar' | 'all' | 'said'
  /** which bar of the day's ten (1-based); 0 for the turn's two */
  n: number
  beats: Beat[]
}

export interface TurnScoreDay {
  index: number
  day: string
  from: number
  end: number
  signals: number
  barSeconds: number
  turn: boolean
  said: string | null
  /** the voiced families with their counts and the beats they get */
  voiced: (Beat & { count: number })[]
  /** counted, never voiced: reading and markets */
  unvoiced: { family: string; count: number }[]
}

export interface TurnScore {
  week: string
  seconds: number
  /** where the last bar ends and the low A begins */
  end: number
  bars: Bar[]
  days: TurnScoreDay[]
  rows: { family: Family; h: number; hz: number; vowel: string }[]
}

const round3 = (x: number): number => Math.round(x * 1000) / 1000

/** The beats of a bar of a day: each voiced family with signals sounds min(h, count) beats; the turn's first bar
 *  sounds every beat of every family. */
export function beatsOf(families: Record<string, number>, harmonics: Record<string, number>, all: boolean): Beat[] {
  return FORM.voiced
    .filter((f) => all || (families[f] ?? 0) > 0)
    .map((f) => {
      const h = harmonics[f]!
      const k = all ? h : Math.min(h, families[f] ?? 0)
      return { family: f, h, k, steps: euclid(k, h) }
    })
}

export function turnScore(r: Turn, week: string): TurnScore {
  const bars: Bar[] = []
  const days: TurnScoreDay[] = []
  r.days.forEach((d, i) => {
    const length = d.bar_s
    const prev = bars.length > 0 ? bars.at(-1)!.len : length
    let t = d.from_s
    const from = t
    if (d.turn) {
      bars.push({ index: bars.length, day: i, t0: round3(t), len: length, kind: 'all', n: 0, beats: beatsOf(d.families, r.harmonics, true) })
      t += length
      bars.push({ index: bars.length, day: i, t0: round3(t), len: FORM.saidBars * length, kind: 'said', n: 0, beats: [] })
      t += FORM.saidBars * length
    }
    for (let b = 0; b < r.bars_per_day; b++) {
      const u = b / Math.max(1, r.bars_per_day - 1)
      const len = round3(prev + (length - prev) * Math.min(1, u * 2))
      bars.push({ index: bars.length, day: i, t0: round3(t), len, kind: 'bar', n: b + 1, beats: beatsOf(d.families, r.harmonics, false) })
      t += len
    }
    days.push({
      index: i, day: d.day, from, end: round3(t), signals: d.signals, barSeconds: length, turn: d.turn, said: d.said,
      voiced: FORM.voiced.map((f) => {
        const h = r.harmonics[f]!
        const count = d.families[f] ?? 0
        const k = Math.min(h, count)
        return { family: f, h, k, count, steps: euclid(k, h) }
      }),
      unvoiced: Object.entries(d.families).filter(([f]) => !(FORM.voiced as readonly string[]).includes(f)).map(([family, count]) => ({ family, count })),
    })
  })
  const last = bars.at(-1)
  const end = last ? round3(last.t0 + last.len) : FORM.start
  return {
    week, seconds: r.seconds, end, bars, days,
    rows: FORM.voiced.map((f) => ({ family: f, h: r.harmonics[f]!, hz: A1 * r.harmonics[f]!, vowel: FORM.vowels[f] ?? '' })),
  }
}

// ---------------------------------------------------------------------------------------------------------------
// What sounds now
// ---------------------------------------------------------------------------------------------------------------

export const barAt = (s: TurnScore, t: number): Bar | null => s.bars.find((b) => t >= b.t0 && t < b.t0 + b.len) ?? null

export function nowTurn(s: TurnScore, t: number): string {
  const b = barAt(s, t)
  if (!b) return t < (s.bars[0]?.t0 ?? 0) ? 'The rhythmicon is about to begin.' : 'One low A, fading: the piece ends.'
  const d = s.days[b.day]!
  const name = dayName(d.day)
  if (b.kind === 'all') return `${name}: the week turns. One bar sounds every beat of every family.`
  if (b.kind === 'said') return `${name}: a silent bar carries the day’s most attended AI headline: “${d.said}”.`
  const fams = b.beats.map((x) => `${x.family} ${x.k} of ${x.h}`).join(', ')
  return `${name}, bar ${b.n} of ${s.bars.filter((x) => x.day === b.day && x.kind === 'bar').length}, ${b.len.toFixed(2)} s a bar: ${fams || 'no family sounds'}.`
}

// ---------------------------------------------------------------------------------------------------------------
// The drawing at a width
// ---------------------------------------------------------------------------------------------------------------

export interface TurnLine {
  span: Span
  y: number
  height: number
  rowsTop: number
  rows: { family: Family; y: number; label: string }[]
  /** one cell per bar and voiced family: as tall as the share of its beats that sound */
  cells: { bar: number; row: number; x: number; w: number; y: number; h: number; full: boolean }[]
  /** the bar lines; a day's first is stronger */
  barLines: { x: number; day: boolean }[]
  said: { bar: number; day: number; x: number; w: number }[]
  turns: { bar: number; day: number; x: number; w: number }[]
  days: { index: number; x: number; label: string; detail: string }[]
  /** the tempo: bars a minute, as a step line under the rows */
  tempo: string
  tempoTop: number
  tempoBottom: number
  lowA: { x: number; w: number } | null
  ticks: { x: number; label: string }[]
}

export interface TurnLayout {
  frame: Frame
  height: number
  rowH: number
  lines: TurnLine[]
}

const HEAD = 22
const ROW = 15
const ROW_GAP = 4
const TEMPO = 22
const AXIS = 18
const GAP = 20

export function layoutTurn(s: TurnScore, width: number): TurnLayout {
  const frame = frameFor(width, s.seconds, s.days.map((d) => d.from), 3.0, { wide: 116, narrow: 60 })
  const lines: TurnLine[] = []
  const perMin = s.bars.filter((b) => b.kind !== 'said').map((b) => 60 / b.len)
  const fast = Math.max(...perMin)
  const slow = Math.min(...perMin)
  let y = 0
  for (const span of frame.spans) {
    const x = (t: number): number => r1(xAt(frame, span, t))
    const rowsTop = y + HEAD
    const rows = s.rows.map((r, k) => ({ family: r.family, y: rowsTop + k * (ROW + ROW_GAP), label: frame.narrow ? `${r.family} ${r.h}` : `${r.family} · ${r.h} · ${r.vowel}` }))
    const tempoTop = rowsTop + rows.length * (ROW + ROW_GAP) + 2
    const tempoBottom = tempoTop + TEMPO - 6
    const inLine = s.bars.filter((b) => clip(span, b.t0, b.t0 + b.len))
    const cells: TurnLine['cells'] = []
    for (const b of inLine) {
      if (b.kind === 'said') continue
      for (const beat of b.beats) {
        const k = s.rows.findIndex((r) => r.family === beat.family)
        const h = r1(ROW * (beat.k / beat.h))
        cells.push({ bar: b.index, row: k, x: r1(x(b.t0) + 0.6), w: r1(Math.max(0.6, b.len * frame.pxPerSecond - 1.2)), y: r1(rows[k]!.y + ROW - h), h, full: beat.k === beat.h })
      }
    }
    const firstOfDay = new Set(s.days.map((d) => d.from))
    const barLines = inLine.map((b) => ({ x: x(b.t0), day: firstOfDay.has(b.t0) }))
    const said = inLine.filter((b) => b.kind === 'said').map((b) => ({ bar: b.index, day: b.day, x: x(b.t0), w: r1(b.len * frame.pxPerSecond) }))
    const turns = inLine.filter((b) => b.kind === 'all').map((b) => ({ bar: b.index, day: b.day, x: x(b.t0), w: r1(b.len * frame.pxPerSecond) }))
    const days = s.days.filter((d) => d.from >= span.t0 && d.from < span.t1).map((d) => ({
      index: d.index, x: x(d.from), label: frame.narrow ? dayAbbr(d.day) : dayShort(d.day), detail: `${d.signals}`,
    }))
    const ty = (len: number): number => r1(tempoBottom - (fast === slow ? 0.5 : (60 / len - slow) / (fast - slow)) * (tempoBottom - tempoTop))
    let path = ''
    for (const b of inLine) {
      if (b.kind === 'said') continue
      const yy = ty(b.len)
      path += `${path ? 'L' : 'M'}${x(Math.max(b.t0, span.t0))} ${yy}H${x(Math.min(b.t0 + b.len, span.t1))}`
    }
    const la = clip(span, s.end, s.end + FORM.lowA)
    const ticks = ticksBetween(span.t0, span.t1, tickStep(frame.pxPerSecond)).map((t) => ({ x: x(t), label: mmss(t) }))
    const height = HEAD + rows.length * (ROW + ROW_GAP) + TEMPO + AXIS
    lines.push({
      span, y, height, rowsTop, rows, cells, barLines, said, turns, days, tempo: path, tempoTop, tempoBottom,
      lowA: la ? { x: x(la[0]), w: r1((la[1] - la[0]) * frame.pxPerSecond) } : null, ticks,
    })
    y += height + GAP
  }
  return { frame, height: y - GAP, rowH: ROW, lines }
}

// ---------------------------------------------------------------------------------------------------------------
// A day's bar, large: the measure that repeats
// ---------------------------------------------------------------------------------------------------------------

export interface Measure {
  width: number
  height: number
  left: number
  rows: { family: Family; h: number; y: number; cells: { x: number; w: number; on: boolean }[] }[]
}

/** One bar of a day drawn large: each voiced family a row cut into its harmonic number of cells, the sounding ones
 *  filled; the rows share one width, so five against six against seven against nine can be seen. */
export function measure(beats: Beat[], width: number, rowH = 12, gap = 4): Measure {
  const left = 44
  const w = width - left - 2
  const byFamily = new Map(beats.map((b) => [b.family, b]))
  const rows = FORM.voiced.map((f, k) => {
    const b = byFamily.get(f)
    const h = b?.h ?? 0
    return {
      family: f, h, y: k * (rowH + gap),
      cells: Array.from({ length: h }, (_, c) => ({ x: r1(left + (c * w) / h), w: r1(w / h - 2), on: !!b && b.steps.includes(c) })),
    }
  })
  return { width, height: FORM.voiced.length * (rowH + gap) - gap, left, rows }
}

/** A moment's place inside its bar, 0 to 1, for a cursor on the measure. */
export const phaseInBar = (b: Bar, t: number): number => Math.min(1, Math.max(0, (t - b.t0) / b.len))
