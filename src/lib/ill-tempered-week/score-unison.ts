// src/lib/ill-tempered-week/score-unison.ts — Unison as a score (2026-11-14): every war signal of the week as the
// glissando it became, on a pitch axis in hertz, with A's harmonic chord as the lines it glides towards.
//
// The record (pieces.unison) holds every glissando: when it enters, its section, where it starts and ends, the chord
// tone it heads for, and the headline. What it does not hold follows from the renderer's fixed form
// (scripts/ill-tempered-week/itw/unison.py), mirrored below and held to the source by score-unison.test.ts: when a day
// begins, how long a glissando lasts, the peak's brass and timpani, when the solo double bass begins. Records pressed
// from 2026-11-14 on also carry the day's start, how long the peak's headline is said and the bass's notes.
import type { Unison, UnisonEvent } from './albums'
import {
  CHORD_HARMONICS,
  clip,
  dayAbbr,
  dayName,
  dayShort,
  fitLabel,
  frameFor,
  harmonicOf,
  harmonicsBetween,
  hzLabel,
  mmss,
  r1,
  tickStep,
  ticksBetween,
  xAt,
  type Frame,
  type Harmonic,
  type Span,
} from './score'

/** The renderer's form, as itw/unison.py writes it (the test reads the constants back from the source). */
export const FORM = {
  /** seconds before the first day */
  intro: 2.0,
  /** the peak's moment, seconds into a day */
  peak: 24.0,
  /** the agreement from which the peak sounds (never on the last day) */
  threshold: 0.3,
  /** a glissando lasts 5 s plus 4 s times its attention; it glides over 0.8 of that and dies away after */
  baseSeconds: 5.0,
  perAttention: 4.0,
  glide: 0.8,
  /** the timpani roll begins this long before the peak and lasts this long; the brass holds the chord this long */
  rollBefore: 6.0,
  roll: 7.0,
  brass: 8.0,
  /** the peak's headline is said this long after the brass enters */
  saidAfter: 0.6,
  /** the solo double bass begins this long after the peak; on the last day, this long before the day's end */
  bassAfterPeak: 5.5,
  bassBeforeEnd: 0.5,
  /** the bass's register (Hz) */
  bassLo: 41,
  bassHi: 175,
  /** the piece ends this long after the last day, the last two seconds faded */
  tail: 12.0,
} as const

export interface Glide {
  id: string
  day: number
  t0: number
  /** where the glide arrives (and the note holds) */
  t1: number
  /** where its sound has died away */
  t2: number
  fromHz: number
  toHz: number
  chord: Harmonic | null
  section: UnisonEvent['section']
  tremolo: boolean
  attention: number
  text: string
}

export interface UnisonScoreDay {
  index: number
  day: string
  from: number
  end: number
  peakAt: number
  last: boolean
  signals: number
  story: string
  agreement: number
  peak: boolean
  said: string | null
  /** how long the peak's headline is said, where the record holds it */
  saidSeconds: number | null
  overlooked: string
  overlookedAttention: number
  bassAt: number
  /** the bass's notes (absolute seconds, pitch, length), where the record holds them */
  bass: { t: number; hz: number; s: number }[] | null
}

export interface UnisonScore {
  week: string
  seconds: number
  dayS: number
  days: UnisonScoreDay[]
  glides: Glide[]
  /** the chord's tones within the drawn range, low to high */
  chord: Harmonic[]
  hzLo: number
  hzHi: number
}

const round3 = (x: number): number => Math.round(x * 1000) / 1000

/** The glissando's three times: entry, arrival, silence. */
export function glideTimes(at: number, attention: number): [number, number, number] {
  const dur = FORM.baseSeconds + FORM.perAttention * attention
  return [at, round3(at + FORM.glide * dur), round3(at + FORM.glide * dur + 0.2 * dur + 0.4)]
}

export function unisonScore(u: Unison, week: string): UnisonScore {
  const n = u.days.length
  const days: UnisonScoreDay[] = []
  const glides: Glide[] = []
  u.days.forEach((d, i) => {
    const from = d.from_s ?? FORM.intro + i * u.day_s
    const last = i === n - 1
    const peakAt = from + FORM.peak
    days.push({
      index: i, day: d.day, from, end: from + u.day_s, peakAt, last, signals: d.signals, story: d.story, agreement: d.agreement,
      peak: d.peak, said: d.said, saidSeconds: d.said_s ?? null, overlooked: d.overlooked, overlookedAttention: d.overlooked_attention,
      bassAt: d.bass_from_s ?? (last ? from + u.day_s - FORM.bassBeforeEnd : peakAt + FORM.bassAfterPeak),
      bass: d.bass ? d.bass.map((b) => ({ t: round3((d.bass_from_s ?? 0) + b.t), hz: b.hz, s: b.s })) : null,
    })
    d.events.forEach((e, k) => {
      const [t0, t1, t2] = glideTimes(e.at_s, e.attention)
      glides.push({
        id: `g-${i}-${k}`, day: i, t0, t1, t2, fromHz: e.from_hz, toHz: e.to_hz, chord: harmonicOf(e.chord_tone_hz, CHORD_HARMONICS),
        section: e.section, tremolo: e.tremolo, attention: e.attention, text: e.text,
      })
    })
  })
  const all = glides.flatMap((g) => [g.fromHz, g.toHz])
  const hzLo = Math.min(40, ...all) * 0.98
  const hzHi = Math.max(1250, ...all) * 1.04
  return { week, seconds: u.seconds, dayS: u.day_s, days, glides, chord: harmonicsBetween(hzLo, hzHi, CHORD_HARMONICS), hzLo, hzHi }
}

// ---------------------------------------------------------------------------------------------------------------
// What sounds now
// ---------------------------------------------------------------------------------------------------------------

const pct = (x: number): string => `${Math.round(100 * x)} %`

export function nowUnison(s: UnisonScore, t: number): string {
  const first = s.days[0]!
  if (t < first.from) return `A timpani stroke on A opens ${dayName(first.day)}.`
  let i = 0
  while (i + 1 < s.days.length && t >= s.days[i + 1]!.from) i++
  const d = s.days[i]!
  const name = dayName(d.day)
  if (t >= d.end) return 'The bass alone, then the piece ends.'
  // the bass sounds to the end of its last note where the record holds its notes, else for about six seconds
  const lastNote = d.bass?.at(-1)
  const bassEnd = lastNote ? lastNote.t + lastNote.s : d.bassAt + 6
  if (t >= d.bassAt && t < bassEnd) return `${name}: a solo double bass plays the speech melody of the day’s least attended war headline, “${d.overlooked}”.`
  if (d.peak && t >= d.peakAt && t < d.peakAt + FORM.brass) return `${name}: the press agreed ${pct(d.agreement)} on ${d.story}. Brass and timpani take up A’s chord; said: “${d.said}”.`
  if (d.peak && t >= d.peakAt - FORM.rollBefore && t < d.peakAt) return `${name}: the timpani roll swells; the press agreed ${pct(d.agreement)} on ${d.story}.`
  const sounding = s.glides.filter((g) => g.day === i && t >= g.t0 && t < g.t2).length
  if (sounding === 0 && t > d.peakAt) return `${name} rings out.`
  return `${name}: ${d.signals} war signals enter at the hours they were published (${sounding} sounding now), each gliding ${pct(d.agreement)} of the way to A’s chord${d.peak ? '' : ', too little agreement for the brass'}.`
}

export function describeGlide(s: UnisonScore, id: string): { head: string; body: string } | null {
  const g = s.glides.find((x) => x.id === id)
  if (!g) return null
  const d = s.days[g.day]!
  const towards = g.chord ? `${hzLabel(g.chord.hz)} (${g.chord.ratio === '1/1' ? 'A' : `A × ${g.chord.ratio}`})` : 'the chord'
  return {
    head: `${dayShort(d.day)} · ${g.section}${g.tremolo ? ', tremolo' : ''} · ${mmss(g.t0)}`,
    body: `“${g.text}” — attention ${pct(g.attention)} on its platform. Glides from ${hzLabel(g.fromHz)} to ${hzLabel(g.toHz)}, ${pct(d.agreement)} of the way to ${towards}.`,
  }
}

export function describeUnisonDay(s: UnisonScore, i: number, part: 'peak' | 'bass' | 'said'): { head: string; body: string } {
  const d = s.days[i]!
  if (part === 'bass') return { head: `${dayShort(d.day)} · solo double bass · ${mmss(d.bassAt)}`, body: `The speech melody of the day’s least attended war headline, outside the chord: “${d.overlooked}” (attention ${pct(d.overlookedAttention)}).` }
  if (part === 'said') return { head: `${dayShort(d.day)} · said · ${mmss(d.peakAt + FORM.saidAfter)}`, body: `“${d.said}”, the day’s most attended war headline, said over the chord.` }
  return { head: `${dayShort(d.day)} · peak · ${mmss(d.peakAt)}`, body: `The press agreed ${pct(d.agreement)} on ${d.story}: a timpani roll swells, then horns, trombones and tuba hold A’s harmonic chord for ${FORM.brass} s.` }
}

// ---------------------------------------------------------------------------------------------------------------
// The drawing at a width
// ---------------------------------------------------------------------------------------------------------------

export interface GlideMark {
  id: string
  day: number
  x1: number
  y1: number
  x2: number
  y2: number
  /** where the sound has died away, at the arrival pitch */
  x3: number
  /** stroke weight class 0 to 3, by attention */
  weight: number
  tremolo: boolean
}

export interface UnisonLine {
  span: Span
  y: number
  height: number
  plotTop: number
  plotBottom: number
  chord: { y: number; hz: number; a: boolean; label: string }[]
  glides: GlideMark[]
  days: { index: number; x: number; w: number; label: string; note: string; barW: number; peak: boolean }[]
  peaks: { day: number; x: number; w: number; said: number | null; saidW: number }[]
  rolls: { day: number; x: number; w: number }[]
  strokes: { day: number; x: number }[]
  bass: { day: number; x: number; y: number; notes: { x: number; w: number; y: number }[] }[]
  ticks: { x: number; label: string }[]
  laneY: number
}

export interface UnisonLayout {
  frame: Frame
  height: number
  lines: UnisonLine[]
}

const HEAD = 34
const LANE = 16
const AXIS = 18
const GAP = 22

export function layoutUnison(s: UnisonScore, width: number): UnisonLayout {
  const frame = frameFor(width, s.seconds, s.days.map((d) => d.from), 2.0, { wide: 62, narrow: 44 })
  const plotH = frame.narrow ? 200 : 250
  const lo = Math.log2(s.hzLo)
  const hi = Math.log2(s.hzHi)
  const lines: UnisonLine[] = []
  let y = 0
  for (const span of frame.spans) {
    const plotTop = y + HEAD
    const plotBottom = plotTop + plotH
    const yHz = (hz: number): number => r1(plotTop + plotH * (1 - (Math.log2(hz) - lo) / (hi - lo)))
    const x = (t: number): number => r1(xAt(frame, span, t))
    const inSpan = (t: number): boolean => t >= span.t0 && t < span.t1
    const glides = s.glides
      .filter((g) => clip(span, g.t0, g.t2))
      .map((g) => ({
        id: g.id, day: g.day, x1: x(g.t0), y1: yHz(g.fromHz), x2: x(Math.min(g.t1, span.t1)), y2: yHz(g.toHz), x3: x(Math.min(g.t2, span.t1)),
        weight: g.attention >= 0.75 ? 3 : g.attention >= 0.5 ? 2 : g.attention >= 0.25 ? 1 : 0, tremolo: g.tremolo,
      }))
    const dayW = s.dayS * frame.pxPerSecond
    const daysIn = s.days.filter((d) => inSpan(d.from))
    const days = daysIn.map((d, k) => {
      // the room to the next day's name, or to the line's end
      const room = (Math.min(daysIn[k + 1]?.from ?? span.t1, span.t1) - d.from) * frame.pxPerSecond - 8
      return {
        index: d.index, x: x(d.from), w: r1(dayW), label: fitLabel([dayShort(d.day), dayAbbr(d.day)], room),
        note: fitLabel([`${pct(d.agreement)} ${d.story}`, pct(d.agreement)], room, 6.1),
        barW: r1(Math.max(1, d.agreement * Math.min(64, dayW - 8))), peak: d.peak,
      }
    })
    const peaks = s.days.filter((d) => d.peak && inSpan(d.peakAt)).map((d) => ({
      day: d.index, x: x(d.peakAt), w: r1(FORM.brass * frame.pxPerSecond),
      said: d.said ? x(d.peakAt + FORM.saidAfter) : null, saidW: r1((d.saidSeconds ?? 0) * frame.pxPerSecond),
    }))
    const rolls = s.days.filter((d) => d.peak && inSpan(d.peakAt - FORM.rollBefore)).map((d) => ({ day: d.index, x: x(d.peakAt - FORM.rollBefore), w: r1(FORM.roll * frame.pxPerSecond) }))
    const strokes = s.days.filter((d) => inSpan(d.from)).map((d) => ({ day: d.index, x: x(d.from) }))
    const bass = s.days.filter((d) => inSpan(d.bassAt)).map((d) => ({
      day: d.index, x: x(d.bassAt), y: yHz(82),
      notes: (d.bass ?? []).filter((b) => inSpan(b.t)).map((b) => ({ x: x(b.t), w: r1(Math.max(1, b.s * frame.pxPerSecond)), y: yHz(b.hz) })),
    }))
    const chord = s.chord.map((c) => ({ y: yHz(c.hz), hz: c.hz, a: c.harmonic === 4, label: c.harmonic === 4 ? `A ${Math.round(c.hz)}` : `${Math.round(c.hz)}` }))
    const ticks = ticksBetween(span.t0, span.t1, tickStep(frame.pxPerSecond)).map((t) => ({ x: x(t), label: mmss(t) }))
    const height = HEAD + plotH + LANE + AXIS
    lines.push({ span, y, height, plotTop, plotBottom, chord, glides, days, peaks, rolls, strokes, bass, ticks, laneY: plotBottom + 4 })
    y += height + GAP
  }
  return { frame, height: y - GAP, lines }
}

/** The ids of the glissandi sounding at a moment. */
export const glidesAt = (s: UnisonScore, t: number): string[] => s.glides.filter((g) => t >= g.t0 && t < g.t2).map((g) => g.id)

// ---------------------------------------------------------------------------------------------------------------
// The pointer
// ---------------------------------------------------------------------------------------------------------------

const distToSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number): number => {
  const dx = x2 - x1
  const dy = y2 - y1
  const len = dx * dx + dy * dy
  const u = len === 0 ? 0 : Math.max(0, Math.min(1, ((px - x1) * dx + (py - y1) * dy) / len))
  return Math.hypot(px - (x1 + u * dx), py - (y1 + u * dy))
}

export type UnisonHit = { kind: 'glide'; id: string } | { kind: 'peak' | 'bass' | 'said'; day: number }

/** What the pointer is over: the moment under it and the nearest glissando within reach (its glide or its fading
 *  tail), else the bass, the sentence or the peak it is on. */
export function hitUnison(l: UnisonLayout, x: number, y: number, reach = 7): { t: number; hit: UnisonHit | null } | null {
  const line = l.lines.find((ln) => y >= ln.y && y <= ln.y + ln.height)
  if (!line) return null
  const t = Math.min(line.span.t1, Math.max(line.span.t0, line.span.t0 + (x - l.frame.left) / l.frame.pxPerSecond))
  let best: { id: string; d: number } | null = null
  for (const g of line.glides) {
    const d = Math.min(distToSegment(x, y, g.x1, g.y1, g.x2, g.y2), distToSegment(x, y, g.x2, g.y2, g.x3, g.y2) + 1.5)
    if (d <= reach && (!best || d < best.d)) best = { id: g.id, d }
  }
  if (best) return { t, hit: { kind: 'glide', id: best.id } }
  const bass = line.bass.find((b) => Math.hypot(x - b.x, y - b.y) <= reach + 3)
  if (bass) return { t, hit: { kind: 'bass', day: bass.day } }
  const said = line.peaks.find((p) => p.said !== null && Math.abs(x - p.said) <= reach + 3 && y <= line.plotTop + 16)
  if (said) return { t, hit: { kind: 'said', day: said.day } }
  const peak = line.peaks.find((p) => x >= p.x && x <= p.x + p.w && y >= line.plotTop && y <= line.plotBottom)
  if (peak) return { t, hit: { kind: 'peak', day: peak.day } }
  return { t, hit: null }
}
