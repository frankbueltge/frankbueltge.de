// src/lib/ill-tempered-week/score-overlooked.ts — Overlooked as a score (2026-11-14): what sounds when, in which
// voice, from which day's headline.
//
// The record (src/data/ill-tempered-week/<week>.json → pieces.overlooked) holds when each day's bell strikes, when its
// motif begins, the motif's notes, the tutti and the cut. Everything else follows from the renderer's fixed form
// (scripts/ill-tempered-week/itw/overlooked.py), mirrored below: the bars, when the ensemble takes a motif up, how much
// softer an older motif sounds, the coda. score-overlooked.test.ts holds the mirror to the renderer's source and the
// derivation to every recorded time. Two things the records before 2026-11-14 do not hold are estimated and marked so:
// how long the headline is said (the motif's first bar pins it to within 0.4 s) and when its answer ends. Records
// pressed from 2026-11-14 on carry both, and the entries of the ensemble, and the score reads them instead.
import { FIELD, INSTRUMENT, type Overlooked } from './albums'
import {
  clip,
  dayAbbr,
  dayName,
  dayShort,
  frameFor,
  harmonicOf,
  harmonicsBetween,
  hzLabel,
  mmss,
  r1,
  SCALE_HARMONICS,
  tickStep,
  ticksBetween,
  xAt,
  type Frame,
  type Span,
} from './score'

/** The renderer's form, as itw/overlooked.py writes it (the test reads the constants back from the source). */
export const FORM = {
  /** bars before Monday's bell */
  introBars: 2,
  /** eighths in a bar */
  eighthsPerBar: 8,
  /** the bell's note, in seconds */
  bell: 3.0,
  /** the headline is said this long after the bell */
  saidAfter: 0.4,
  /** and answered this long after it ends */
  answerAfter: 0.4,
  /** the answer's last note lasts this long */
  lastAnswerNote: 0.6,
  /** bars after the motif begins at which each part of the ensemble takes it up */
  entries: { violins: 4, violas: 8, piano: 12, low: 14 },
  /** the canon's offsets, in eighths */
  canon: { violins: 3, violas: 5 },
  /** an older motif sounds this many dB softer for each day of age */
  dbPerDay: 4,
  /** a part sounds only if it enters this much before its day ends */
  margin: 0.05,
  /** the low strings change every this many bars */
  lowEvery: 2,
  /** the coda begins this long after the cut; its violin note follows the sentence after this pause, for this long */
  codaAfter: 2.4,
  violinAfter: 0.8,
  violinNote: 6.0,
  violinHz: 880,
} as const

export type LaneId = 'voice' | `solo-${number}` | 'violins' | 'violas' | 'piano' | 'low' | 'brass' | 'murmur'

export type EventKind = 'bell' | 'said' | 'answer' | 'motif' | 'violins' | 'violas' | 'piano' | 'low' | 'brass' | 'murmur' | 'violin'

export interface ScoreEvent {
  id: string
  lane: LaneId
  kind: EventKind
  /** the day whose material sounds (its headline, its motif); -1 for the brass */
  day: number
  t0: number
  t1: number
  /** motif segments: days since the motif's own day, and the gain against that day in dB */
  age?: number
  db?: number
  /** the moments a loop begins again (motif, canon, low strings), within [t0, t1) */
  loops?: number[]
  /** the tutti's segment of a motif */
  tutti?: boolean
  /** a time on this event is estimated, not recorded (the said/answered split before 2026-11-14) */
  estimated?: boolean
  /** murmur segments: which of the day's most attended headlines */
  attended?: number
}

export interface Lane {
  id: LaneId
  label: string
  /** the score's own abbreviation, for narrow screens */
  short: string
  day?: number
}

export interface MotifNote {
  step: number
  eighths: number
  hz: number
  harmonic: number
  ratio: string
}

export interface ScoreDay {
  index: number
  day: string
  field: string
  fieldName: string
  instrument: string
  text: string
  source: string
  attention: number
  /** the motif sounds on after its day: the newest day still names its field, or it is the newest day */
  kept: boolean
  from: number
  motifFrom: number
  /** where its day ends: the next day's bell, or the cut */
  end: number
  /** one statement of the motif, in seconds and in eighths */
  loop: number
  eighths: number
  /** how long the headline is said; estimated before 2026-11-14 */
  speech: number
  speechEstimated: boolean
  motif: MotifNote[]
  /** when each part of the ensemble takes this day's motif up, or null where its day ends first */
  entries: { violins: number | null; violas: number | null; piano: number | null; low: number | null }
  attended: { field: string; fieldName: string; text: string; attention: number }[]
}

export interface OverlookedScore {
  week: string
  edition: number
  seconds: number
  pulse: number
  bar: number
  tutti: number
  cut: number
  coda: number
  days: ScoreDay[]
  lanes: Lane[]
  events: ScoreEvent[]
}

const ABBR: Record<string, string> = {
  flute: 'fl.', bassoon: 'bsn.', oboe: 'ob.', horn: 'hn.', trombone: 'tbn.', 'solo violin': 'vln.', clarinet: 'cl.',
  cellos: 'vcs.', trumpet: 'tpt.', violas: 'vlas.', piccolo: 'picc.', tuba: 'tuba', 'double bass': 'cb.',
}

const round3 = (x: number): number => Math.round(x * 1000) / 1000

/** The loop's restarts within [a, b), counted from its origin. */
export function loopStarts(origin: number, period: number, a: number, b: number): number[] {
  if (!(period > 0)) return []
  const out: number[] = []
  const k0 = Math.max(0, Math.ceil((a - origin) / period - 1e-9))
  for (let k = k0; origin + k * period < b - 1e-9; k++) out.push(round3(origin + k * period))
  return out
}

/** How long the headline was said: recorded from 2026-11-14 on; before, the motif's first bar pins it. The motif
 *  begins on the first bar line after the answer, which ends 1.2 s plus twice the speech after the bell (0.4 s, the
 *  sentence, 0.4 s, its answer as long as the sentence, 0.4 s): so the speech lies within one bar's half of the
 *  middle taken here. */
export function speechSeconds(from: number, motifFrom: number, bar: number, recorded?: number): { s: number; estimated: boolean } {
  if (recorded !== undefined) return { s: recorded, estimated: false }
  const bars = Math.round((motifFrom - from) / bar)
  const gap = FORM.saidAfter + 2 * FORM.answerAfter
  return { s: Math.max(0.2, round3(((bars - 0.5) * bar - gap) / 2)), estimated: true }
}

/** The score of one edition of Overlooked, from its record. */
export function overlookedScore(o: Overlooked): OverlookedScore {
  const pulse = o.pulse_s
  const bar = FORM.eighthsPerBar * pulse
  const n = o.days.length
  const cut = o.cut_s
  const tutti = o.tutti_from_s
  const lastDay = n - 1
  const dayEnd = (i: number): number => (i + 1 < n ? o.days[i + 1]!.from_s : cut)
  const events: ScoreEvent[] = []
  const days: ScoreDay[] = []

  o.days.forEach((d, i) => {
    const from = d.from_s
    const mt = d.motif_from_s
    const end = dayEnd(i)
    const loop = d.motif_eighths * pulse
    const kept = !o.hindsight || i === lastDay || d.named_on_newest_day
    const sp = speechSeconds(from, mt, bar, d.speech_s)
    const instrument = INSTRUMENT[d.instrument] ?? d.instrument
    const motif: MotifNote[] = d.motif.map((m, k) => {
      const h = harmonicOf(m.hz, SCALE_HARMONICS)
      return {
        step: m.step,
        eighths: (k + 1 < d.motif.length ? d.motif[k + 1]!.step : d.motif_eighths) - m.step,
        hz: m.hz,
        harmonic: h?.harmonic ?? 0,
        ratio: h?.ratio ?? '',
      }
    })
    const at = (part: keyof typeof FORM.entries): number => d.entries_s?.[part] ?? round3(mt + FORM.entries[part] * bar)
    const enters = (t: number): number | null => (t < end - FORM.margin ? t : null)
    const entries = { violins: enters(at('violins')), violas: enters(at('violas')), piano: enters(at('piano')), low: enters(at('low')) }

    // the bell, the headline said, and the field's instrument answering with its speech melody
    events.push({ id: `bell-${i}`, lane: 'voice', kind: 'bell', day: i, t0: from, t1: from + FORM.bell })
    const saidAt = from + FORM.saidAfter
    events.push({ id: `said-${i}`, lane: 'voice', kind: 'said', day: i, t0: saidAt, t1: round3(saidAt + sp.s), estimated: sp.estimated })
    const echoAt = saidAt + sp.s + FORM.answerAfter
    const echo = d.echo && d.echo.length > 0
      ? [round3(echoAt + d.echo[0]!.t), round3(echoAt + d.echo.at(-1)!.t + FORM.lastAnswerNote)]
      : [round3(echoAt), round3(Math.min(mt, echoAt + sp.s))]
    events.push({ id: `answer-${i}`, lane: `solo-${i}`, kind: 'answer', day: i, t0: echo[0]!, t1: echo[1]!, estimated: !(d.echo && d.echo.length > 0) })

    // the motif in the day's own instrument: its own day, then each later day 4 dB softer while the newest day still
    // names its field, then the tutti at full strength
    for (let j = i; j < n; j++) {
      if (j > i && !kept) break
      const a = Math.max(j === i ? mt : o.days[j]!.from_s, mt)
      const b = j === lastDay ? Math.min(cut, tutti) : dayEnd(j)
      if (b > a) {
        const age = j - i
        events.push({
          id: `motif-${i}-${age}`, lane: `solo-${i}`, kind: 'motif', day: i, t0: a, t1: b, age, db: age === 0 ? 0 : -FORM.dbPerDay * age,
          loops: loopStarts(mt, loop, a, b),
        })
      }
    }
    if (kept && cut > Math.max(tutti, mt)) {
      const a = Math.max(tutti, mt)
      events.push({ id: `motif-${i}-tutti`, lane: `solo-${i}`, kind: 'motif', day: i, t0: a, t1: cut, age: 0, db: 0, tutti: true, loops: loopStarts(mt, loop, a, cut) })
    }

    // the ensemble takes the day's motif up, each part until the day ends
    if (entries.violins !== null) events.push({ id: `violins-${i}`, lane: 'violins', kind: 'violins', day: i, t0: entries.violins, t1: end, loops: loopStarts(entries.violins, loop, entries.violins, end) })
    if (entries.violas !== null) events.push({ id: `violas-${i}`, lane: 'violas', kind: 'violas', day: i, t0: entries.violas, t1: end, loops: loopStarts(entries.violas, loop, entries.violas, end) })
    if (entries.piano !== null) events.push({ id: `piano-${i}`, lane: 'piano', kind: 'piano', day: i, t0: entries.piano, t1: end })
    if (entries.low !== null) events.push({ id: `low-${i}`, lane: 'low', kind: 'low', day: i, t0: entries.low, t1: end, loops: loopStarts(entries.low, FORM.lowEvery * bar, entries.low, end) })

    // under it all, the day's most attended headlines murmur, one after another across the day
    const m = d.attended.length
    d.attended.forEach((_, k) => {
      const dur = (end - from) / m
      events.push({ id: `murmur-${i}-${k}`, lane: 'murmur', kind: 'murmur', day: i, t0: round3(from + k * dur), t1: round3(from + (k + 1) * dur), attended: k })
    })

    days.push({
      index: i, day: d.day, field: d.field, fieldName: FIELD[d.field] ?? d.field, instrument, text: d.text, source: d.source,
      attention: d.attention, kept, from, motifFrom: mt, end, loop: round3(loop), eighths: d.motif_eighths, speech: sp.s,
      speechEstimated: sp.estimated, motif, entries,
      attended: d.attended.map((a) => ({ field: a.field, fieldName: FIELD[a.field] ?? a.field, text: a.text, attention: a.attention })),
    })
  })

  // the end: the brass on A's harmonic chord under the tutti; the cut; Monday's sentence once more, and one violin note
  if (cut > tutti) events.push({ id: 'brass', lane: 'brass', kind: 'brass', day: -1, t0: tutti, t1: cut })
  const coda = o.coda_s ?? round3(cut + FORM.codaAfter)
  const first = days[0]!
  events.push({ id: 'coda-said', lane: 'voice', kind: 'said', day: 0, t0: coda, t1: round3(coda + first.speech), estimated: first.speechEstimated })
  const violinAt = round3(coda + first.speech + FORM.violinAfter)
  events.push({ id: 'coda-violin', lane: 'violins', kind: 'violin', day: 0, t0: violinAt, t1: Math.min(o.seconds, round3(violinAt + FORM.violinNote)), estimated: first.speechEstimated })

  const lanes: Lane[] = [
    { id: 'voice', label: 'voice', short: 'voice' },
    ...days.map((d): Lane => ({ id: `solo-${d.index}`, label: `${dayAbbr(d.day)} · ${d.instrument}`, short: `${dayAbbr(d.day)} ${ABBR[d.instrument] ?? d.instrument}`, day: d.index })),
    { id: 'violins', label: 'violins, canon', short: 'vlns.' },
    { id: 'violas', label: 'violas, canon', short: 'vlas.' },
    { id: 'piano', label: 'piano', short: 'pno.' },
    { id: 'low', label: 'cellos & basses', short: 'vcs. cbs.' },
    { id: 'brass', label: 'horns & trombones', short: 'hns. tbns.' },
    { id: 'murmur', label: 'murmur', short: 'murmur' },
  ]
  return { week: o.week, edition: o.edition, seconds: o.seconds, pulse, bar, tutti, cut, coda, days, lanes, events }
}

// ---------------------------------------------------------------------------------------------------------------
// What sounds now
// ---------------------------------------------------------------------------------------------------------------

/** Where a day's motif is in its loop at a moment, if its own instrument plays it then: the eighth (with fraction),
 *  the note that sounds (null between notes), and the gain against its own day. */
export function soloistAt(s: OverlookedScore, day: number, t: number): { eighth: number; note: number | null; db: number } | null {
  const seg = s.events.find((e) => e.kind === 'motif' && e.day === day && t >= e.t0 && t < e.t1)
  if (!seg) return null
  const d = s.days[day]!
  const eighth = (((t - d.motifFrom) % d.loop) + d.loop) % d.loop / s.pulse
  const note = d.motif.findIndex((m) => eighth >= m.step && eighth < m.step + m.eighths * 0.9)
  return { eighth, note: note < 0 ? null : note, db: seg.db ?? 0 }
}

/** The ids of the events sounding at a moment. */
export const soundingAt = (s: OverlookedScore, t: number): string[] => s.events.filter((e) => t >= e.t0 && t < e.t1).map((e) => e.id)

/** One line on what is heard at a moment, for the caption under the player. */
export function nowOverlooked(s: OverlookedScore, t: number): string {
  const first = s.days[0]!
  if (t < first.from) return 'The bell is about to strike for the first day.'
  if (t >= s.coda) {
    return t < s.coda + first.speech + FORM.violinAfter ? `Coda: ${dayName(first.day)}’s headline once more, alone: “${first.text}”` : `Coda: one high violin note, A ${hzLabel(FORM.violinHz)}, and the piece ends.`
  }
  if (t >= s.cut) return 'The cut: silence.'
  let i = 0
  while (i + 1 < s.days.length && t >= s.days[i + 1]!.from) i++
  const d = s.days[i]!
  const older = s.events.filter((e) => e.kind === 'motif' && e.day < i && !e.tutti && t >= e.t0 && t < e.t1).length
  if (t >= s.tutti) return `The tutti: every motif still kept, at full strength, with horns and trombones on A’s harmonic chord.`
  const said = s.events.find((e) => e.id === `said-${i}`)!
  const day = `${dayName(d.day)}, ${d.fieldName}`
  if (t < said.t1) return `${day}: the bell, then the headline said: “${d.text}”`
  if (t < d.motifFrom) return `${day}: the ${d.instrument} answers with the headline’s speech melody, in the rhythm it was spoken.`
  const parts = (['violins', 'violas', 'piano', 'low'] as const).filter((p) => d.entries[p] !== null && t >= d.entries[p]!)
  const names = { violins: 'violins in canon', violas: 'violas an octave down', piano: 'the piano', low: 'cellos and basses' }
  const ens = parts.length > 0 ? `, with ${parts.map((p) => names[p]).join(', ')}` : ''
  const aged = older > 0 ? `; ${older} earlier motif${older === 1 ? '' : 's'} softer underneath` : ''
  return `${day}: the ${d.instrument} loops the motif${ens}${aged}.`
}

/** The readout of an event: a heading and a body. */
export function describeOverlooked(s: OverlookedScore, id: string): { head: string; body: string } | null {
  const e = s.events.find((x) => x.id === id)
  if (!e) return null
  const span = `${mmss(e.t0)}–${mmss(e.t1)}`
  if (e.kind === 'brass') return { head: `horns and trombones · ${span}`, body: 'A’s harmonic chord, harmonics 4:5:6:7 (220, 275, 330 and 385 Hz), under the tutti until the cut.' }
  const d = s.days[e.day]!
  const day = `${dayShort(d.day)} · ${d.fieldName}`
  const est = e.estimated ? ' The end is estimated: the record of this edition does not hold how long the headline was said.' : ''
  switch (e.kind) {
    case 'bell':
      return { head: `${day} · ${mmss(e.t0)}`, body: 'A tubular bell on A (440 Hz) opens the day.' }
    case 'said':
      return e.id === 'coda-said'
        ? { head: `coda · ${span}`, body: `${dayName(d.day)}’s headline once more, alone: “${d.text}”.${est}` }
        : { head: `${day} · said · ${span}`, body: `“${d.text}” — the least attended headline of the day on ${sourceName(d.source)} (attention ${pct(d.attention)}), said in its field’s voice.${est}` }
    case 'answer':
      return { head: `${day} · ${d.instrument} · ${span}`, body: `The ${d.instrument} answers with the headline’s speech melody, in the rhythm it was spoken.${e.estimated ? ' Its times are estimated from the motif’s first bar.' : ''}` }
    case 'motif':
      return {
        head: `${dayShort(d.day)} · ${d.instrument} · ${span}`,
        body: e.tutti
          ? `The ${d.instrument} plays ${dayName(d.day)}’s motif at full strength in the tutti.`
          : e.age === 0
            ? `${dayName(d.day)}’s motif, ${d.motif.length} notes in ${d.eighths} eighths (${d.loop} s), looped in the ${d.instrument}.`
            : `${dayName(d.day)}’s motif ${e.age} day${e.age === 1 ? '' : 's'} on, ${-(e.db ?? 0)} dB softer, still looping: the newest day still names ${d.fieldName}.`,
      }
    case 'violins':
      return { head: `${dayShort(d.day)} · violins · ${span}`, body: `The violins take ${dayName(d.day)}’s motif up in canon, three eighths behind the ${d.instrument}.` }
    case 'violas':
      return { head: `${dayShort(d.day)} · violas · ${span}`, body: `The violas take ${dayName(d.day)}’s motif up five eighths behind, an octave down.` }
    case 'piano':
      return { head: `${dayShort(d.day)} · piano · ${span}`, body: `The piano pulses the motif’s two lowest notes on every eighth, growing louder towards the day’s end.` }
    case 'low':
      return { head: `${dayShort(d.day)} · cellos and basses · ${span}`, body: 'Cellos hold A (110 Hz), basses the motif’s lowest note, two bars at a time.' }
    case 'violin':
      return { head: `coda · solo violin · ${span}`, body: `One high violin note, A ${hzLabel(FORM.violinHz)}.${est}` }
    case 'murmur': {
      const a = d.attended[e.attended ?? 0]!
      return { head: `${dayShort(d.day)} · murmur · ${span}`, body: `“${a.text}” — among the day’s most attended (${a.fieldName}, attention ${pct(a.attention)}), granulated, low-passed and far.` }
    }
  }
}

const pct = (x: number): string => `${Math.round(100 * x)} %`

const SOURCE: Record<string, string> = {
  google_news: 'Google News', google_trends: 'Google Trends', bluesky: 'Bluesky', mastodon: 'Mastodon', reddit: 'Reddit',
  hackernews: 'Hacker News', techmeme: 'Techmeme', lobsters: 'Lobsters', github: 'GitHub', github_trending: 'GitHub Trending',
  pypi: 'PyPI', huggingface: 'Hugging Face', devto: 'DEV', arxiv: 'arXiv', producthunt: 'Product Hunt',
  stackoverflow: 'Stack Overflow', polymarket: 'Polymarket', appstore: 'the App Store', steam: 'Steam', coingecko: 'CoinGecko',
  wikipedia: 'Wikipedia',
}
/** A platform's name as people write it. */
export const sourceName = (source: string): string => SOURCE[source] ?? source

// ---------------------------------------------------------------------------------------------------------------
// The drawing at a width
// ---------------------------------------------------------------------------------------------------------------

export const LANE_H = 12
export const LANE_GAP = 5
const HEAD = 20
const AXIS = 18
const GAP = 18

export interface LaidLane {
  id: LaneId
  label: string
  y: number
}

export interface Mark {
  id: string
  kind: EventKind
  day: number
  x: number
  w: number
  y: number
  h: number
  /** motif segments: the age class 0 to 6 (older is paler) */
  age?: number
  tutti?: boolean
  estimated?: boolean
  /** x of each loop's restart inside the mark */
  loops: number[]
}

export interface Line {
  span: Span
  y: number
  height: number
  lanes: LaidLane[]
  marks: Mark[]
  days: { x: number; label: string; index: number }[]
  ticks: { x: number; label: string }[]
  /** the tutti, shaded across the lanes, and the cut, a rule across them */
  tutti: { x: number; w: number } | null
  cut: number | null
  top: number
  bottom: number
}

export interface OverlookedLayout {
  frame: Frame
  height: number
  lines: Line[]
}

/** The score laid out at a width: lines of lanes, each line holding only the lanes that sound in it (the way a
 *  printed score leaves out a silent instrument's staff). */
export function layoutOverlooked(s: OverlookedScore, width: number): OverlookedLayout {
  const frame = frameFor(width, s.seconds, s.days.map((d) => d.from), 2.0, { wide: 132, narrow: 74 })
  const lines: Line[] = []
  let y = 0
  for (const span of frame.spans) {
    const inLine = s.events.map((e) => ({ e, c: clip(span, e.t0, e.t1) })).filter((x) => x.c !== null) as { e: ScoreEvent; c: [number, number] }[]
    const used = new Set(inLine.map((x) => x.e.lane))
    const top = y + HEAD
    const lanes: LaidLane[] = s.lanes.filter((l) => used.has(l.id)).map((l, k) => ({ id: l.id, label: frame.narrow ? l.short : l.label, y: top + k * (LANE_H + LANE_GAP) }))
    const laneY = new Map(lanes.map((l) => [l.id, l.y]))
    const bottom = top + lanes.length * (LANE_H + LANE_GAP) - LANE_GAP
    const marks: Mark[] = inLine.map(({ e, c }) => {
      const x0 = xAt(frame, span, c[0])
      const x1 = xAt(frame, span, c[1])
      const ly = laneY.get(e.lane)!
      // a motif's band is as tall as it is loud: full on its own day and in the tutti, 4 dB a day softer after
      const frac = e.kind === 'motif' ? Math.max(0.3, 1 - (0.7 * Math.min(24, -(e.db ?? 0))) / 24) : e.kind === 'murmur' || e.kind === 'piano' ? 0.5 : e.kind === 'said' || e.kind === 'answer' ? 0.42 : 0.72
      const h = r1(LANE_H * frac)
      return {
        id: e.id, kind: e.kind, day: e.day, x: r1(x0), w: r1(Math.max(e.kind === 'bell' ? 0 : 1, x1 - x0)), y: r1(ly + (LANE_H - h) / 2), h,
        age: e.kind === 'motif' ? Math.min(6, e.age ?? 0) : undefined, tutti: e.tutti, estimated: e.estimated,
        loops: (e.loops ?? []).filter((t) => t > c[0] + 1e-6 && t < c[1]).map((t) => r1(xAt(frame, span, t))),
      }
    })
    const days = s.days.filter((d) => d.from >= span.t0 && d.from < span.t1).map((d) => ({ x: r1(xAt(frame, span, d.from)), label: frame.narrow ? dayAbbr(d.day) : dayShort(d.day), index: d.index }))
    const step = tickStep(frame.pxPerSecond)
    const ticks = ticksBetween(span.t0, span.t1, step).map((t) => ({ x: r1(xAt(frame, span, t)), label: mmss(t) }))
    const tc = clip(span, s.tutti, s.cut)
    const height = HEAD + (bottom - top) + AXIS
    lines.push({
      span, y, height, lanes, marks, days, ticks, top, bottom,
      tutti: tc ? { x: r1(xAt(frame, span, tc[0])), w: r1((tc[1] - tc[0]) * frame.pxPerSecond) } : null,
      cut: s.cut >= span.t0 && s.cut <= span.t1 ? r1(xAt(frame, span, s.cut)) : null,
    })
    y += height + GAP
  }
  return { frame, height: y - GAP, lines }
}

// ---------------------------------------------------------------------------------------------------------------
// A day's motif on a just staff
// ---------------------------------------------------------------------------------------------------------------

export interface Staff {
  width: number
  height: number
  left: number
  /** the scale's lines between the motif's lowest and highest note; A is drawn stronger */
  lines: { y: number; hz: number; harmonic: number; ratio: string; a: boolean }[]
  notes: { x: number; w: number; y: number; hz: number; harmonic: number; ratio: string; step: number }[]
  /** the bar lines inside the motif (every eight eighths) */
  bars: number[]
  /** x of an eighth (fractional), for the cursor */
  x0: number
  pxPerEighth: number
}

/** The motif drawn on the harmonic scale it is tuned to: one line per harmonic of A from its lowest note to its
 *  highest, one dash per note at its pitch, as long as its eighths. */
export function motifStaff(d: ScoreDay, width: number, height = 64): Staff {
  const left = 30
  const pad = 6
  const lo = Math.min(...d.motif.map((m) => m.hz))
  const hi = Math.max(...d.motif.map((m) => m.hz))
  const ls = harmonicsBetween(lo, hi, SCALE_HARMONICS)
  const span = Math.max(Math.log2(hi / lo), 1 / 12)
  const y = (hz: number): number => r1(pad + (height - 2 * pad) * (1 - Math.log2(hz / lo) / span))
  const pxPerEighth = (width - left - 4) / d.eighths
  return {
    width, height, left,
    lines: ls.map((h) => ({ y: y(h.hz), hz: h.hz, harmonic: h.harmonic, ratio: h.ratio, a: h.harmonic === 8 })),
    notes: d.motif.map((m) => ({ x: r1(left + m.step * pxPerEighth), w: r1(Math.max(2, m.eighths * pxPerEighth - 1.5)), y: y(m.hz), hz: m.hz, harmonic: m.harmonic, ratio: m.ratio, step: m.step })),
    bars: Array.from({ length: Math.floor((d.eighths - 1) / 8) }, (_, k) => r1(left + (k + 1) * 8 * pxPerEighth)),
    x0: left,
    pxPerEighth: r1(pxPerEighth * 1000) / 1000,
  }
}
