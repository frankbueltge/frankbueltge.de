// src/lib/ill-tempered-week/perform-overlooked.ts — Overlooked as a list of notes to play (2026-11-14): what the page
// performs when a visitor asks the browser to play the piece itself, from its record.
//
// The score (score-overlooked.ts) says which voice sounds when; this says every note of it: its moment, instrument,
// pitch, length and strength, exactly as scripts/ill-tempered-week/itw/overlooked.py places them, loop by loop. The
// constants below are that file's, and perform-overlooked.test.ts reads them back from its source. The engine
// (src/components/ill-tempered-week/orchestra.ts) plays the list with the recorded notes
// scripts/ill-tempered-week/instruments.py cut for it.
//
// Not performed, and said so on the page: the murmur of the most attended (granulated speech, which lives in the
// pressing alone), the hall the pressing puts the ensemble in (the browser has a plainer one), and, for a day whose
// record does not hold them, the notes of the answer.
import type { Overlooked } from './albums'
import { FORM, type LaneId } from './score-overlooked'

/** The renderer's notes, as itw/overlooked.py writes them. */
export const PLAY = {
  bell: { instrument: 'TubularBells', hz: 440, seconds: 3.0, velocity: 70, release: 2.5, pan: 0 },
  /** the sentence's level against the ensemble, at its day and in the coda */
  said: 0.32,
  saidAgain: 0.28,
  answer: { velocity: 100, shortest: 0.15, pan: 0.08 },
  /** a motif in its own instrument: 92 on its day, 8 less for each day of age, never under 46; 104 in the tutti */
  motif: { velocity: 92, perDay: 8, floor: 46, tutti: 104, shortest: 0.12, held: 0.9 },
  violins: { instrument: 'ViolinEnsSpic', velocity: 74, lo: 300, hi: 1400, pan: -0.45, transpose: 1 },
  violas: { instrument: 'ViolaEnsSpic', velocity: 70, lo: 150, hi: 700, pan: 0.15, transpose: 0.5 },
  piano: { instrument: 'UprightPiano', seconds: 0.18, release: 0.25, pan: -0.2, lo: 130, hi: 500, velocity: 46, rise: 30 },
  cellos: { instrument: 'CelloEnsSusVib', hz: 110, velocity: 64, release: 0.6, pan: 0.35, held: 0.98 },
  basses: { instrument: 'ContrabassSusVB', velocity: 60, release: 0.6, pan: 0.5, lowest: 41.2, fold: 82, top: 130 },
  brass: { velocity: 96, release: 0.08, top: 400, horn: 'FHornSus', trombone: 'TromboneSus', hornPan: 0.25, trombonePan: -0.25 },
  violin: { instrument: 'SViolinVib', velocity: 60, release: 3.0, pan: 0 },
  /** older motifs step back to this while a new day's sentence is said and answered, and return over three bars */
  duck: { to: 0.22, before: 0.3, bars: 3, smooth: 0.2 },
} as const

/** Where a note goes on its way out: the ensemble, the ensemble's older motifs (which step back for a new sentence),
 *  or the voice. */
export type Bus = 'ensemble' | 'aged' | 'voice'

export interface PlayNote {
  t: number
  /** the score's lane the note belongs to, for hearing a voice alone */
  lane: LaneId
  bus: Bus
  instrument: string
  hz: number
  /** held this long, then released (null: the recording's own release) */
  seconds: number
  release: number | null
  velocity: number
  pan: number
  /** a further factor: an older motif's 4 dB a day */
  gain: number
  /** the ensemble breaks off at the cut: a note still sounding then stops there */
  until: number | null
  /** chooses among round robins */
  key: string
}

export interface PlayClip {
  t: number
  lane: LaneId
  /** the day whose sentence is said (said-<day + 1>.m4a) */
  day: number
  gain: number
}

export interface Performance {
  week: string
  /** sorted by time */
  notes: PlayNote[]
  clips: PlayClip[]
  /** the level of the older motifs over time: points to draw straight lines between */
  duck: { t: number; v: number }[]
  cut: number
  end: number
  /** the instruments the notes ask for */
  instruments: string[]
  /** the factors the pressing gave its groups, where the record holds them */
  mix: { ens: number; voice: number } | null
  /** what is in the score and not in this performance, and why */
  missing: { lane: LaneId; day: number | null; why: string }[]
}

const fold = (hz: number, lo: number, hi: number): number => {
  let f = hz
  while (f < lo) f *= 2
  while (f > hi) f /= 2
  return f
}

/** Every note of one edition of Overlooked, from its record. */
export function performOverlooked(o: Overlooked): Performance {
  const pulse = o.pulse_s
  const bar = FORM.eighthsPerBar * pulse
  const n = o.days.length
  const last = n - 1
  const cut = o.cut_s
  const tutti = o.tutti_from_s
  const notes: PlayNote[] = []
  const clips: PlayClip[] = []
  const missing: Performance['missing'] = [{ lane: 'murmur', day: null, why: 'the murmur of the most attended is granulated speech and sounds in the recording only' }]
  const dayEnd = (i: number): number => (i + 1 < n ? o.days[i + 1]!.from_s : cut)
  const ens = (note: Omit<PlayNote, 'until' | 'gain' | 'bus' | 'release'> & Partial<Pick<PlayNote, 'gain' | 'bus' | 'release'>>): void => {
    notes.push({ gain: 1, bus: 'ensemble', release: null, ...note, until: cut })
  }

  /** The motif of day i, looped from `origin`, sounding only from `start` up to `stop` (itw/overlooked.py, motif_loop). */
  const loop = (i: number, start: number, stop: number, opts: {
    lane: LaneId; instrument: string; velocity: number; shift?: number; transpose?: number; pan: number; lo?: number; hi?: number
    origin?: number; bus?: Bus; gain?: number; key: string
  }): void => {
    const d = o.days[i]!
    const length = d.motif_eighths * pulse
    const origin = opts.origin ?? start
    let t = origin + Math.max(0, Math.floor((start - origin) / length) - 1) * length
    while (t < stop - FORM.margin) {
      d.motif.forEach((m, k) => {
        const at = t + (m.step + (opts.shift ?? 0)) * pulse
        if (at < start || at >= stop) return
        const eighths = (k + 1 < d.motif.length ? d.motif[k + 1]!.step : d.motif_eighths) - m.step
        ens({
          t: at, lane: opts.lane, instrument: opts.instrument, hz: fold(m.hz * (opts.transpose ?? 1), opts.lo ?? 30, opts.hi ?? 4000),
          seconds: Math.max(PLAY.motif.shortest, PLAY.motif.held * eighths * pulse), velocity: opts.velocity, pan: opts.pan,
          bus: opts.bus, gain: opts.gain, key: `${opts.key}${m.step}`,
        })
      })
      t += length
    }
  }

  o.days.forEach((d, i) => {
    const t0 = d.from_s
    const mt = d.motif_from_s
    const end = dayEnd(i)
    const lane: LaneId = `solo-${i}`
    const side = PLAY.answer.pan * (i % 2 === 0 ? 1 : -1)

    // the bell, the sentence, and the field's instrument answering in the speech's own rhythm
    ens({ t: t0, lane: 'voice', instrument: PLAY.bell.instrument, hz: PLAY.bell.hz, seconds: PLAY.bell.seconds, release: PLAY.bell.release, velocity: PLAY.bell.velocity, pan: PLAY.bell.pan, key: 'bell' })
    clips.push({ t: t0 + FORM.saidAfter, lane: 'voice', day: i, gain: PLAY.said })
    if (d.echo && d.echo.length > 0 && d.speech_s !== undefined) {
      const at = t0 + FORM.saidAfter + d.speech_s + FORM.answerAfter
      d.echo.forEach((e, k) => {
        const next = k + 1 < d.echo!.length ? d.echo![k + 1]!.t : e.t + FORM.lastAnswerNote
        ens({ t: at + e.t, lane, instrument: d.instrument, hz: e.hz, seconds: Math.max(PLAY.answer.shortest, next - e.t), velocity: PLAY.answer.velocity, pan: side, key: `echo${k}` })
      })
    } else {
      missing.push({ lane, day: i, why: 'the answer is not performed: this day’s record does not hold its notes' })
    }

    // the ensemble takes the day's motif up, each part until the day ends
    const entry = (part: keyof typeof FORM.entries): number => d.entries_s?.[part] ?? mt + FORM.entries[part] * bar
    loop(i, entry('violins'), end, { lane: 'violins', instrument: PLAY.violins.instrument, velocity: PLAY.violins.velocity, shift: FORM.canon.violins, lo: PLAY.violins.lo, hi: PLAY.violins.hi, pan: PLAY.violins.pan, key: `v${i}` })
    loop(i, entry('violas'), end, { lane: 'violas', instrument: PLAY.violas.instrument, velocity: PLAY.violas.velocity, shift: FORM.canon.violas, transpose: PLAY.violas.transpose, lo: PLAY.violas.lo, hi: PLAY.violas.hi, pan: PLAY.violas.pan, key: `a${i}` })
    const lows = [...new Set(d.motif.map((m) => m.hz))].sort((a, b) => a - b).slice(0, 2)
    const pianoFrom = entry('piano')
    for (let t = pianoFrom, k = 0; t < end - FORM.margin; t += pulse, k++) {
      const velocity = Math.floor(PLAY.piano.velocity + PLAY.piano.rise * Math.min(1, (t - pianoFrom) / Math.max(1e-9, end - pianoFrom)))
      ens({ t, lane: 'piano', instrument: PLAY.piano.instrument, hz: fold(lows[k % lows.length]!, PLAY.piano.lo, PLAY.piano.hi), seconds: PLAY.piano.seconds, release: PLAY.piano.release, velocity, pan: PLAY.piano.pan, key: `p${k % 4}` })
    }
    let floor = Math.min(...d.motif.map((m) => m.hz))
    while (floor > PLAY.basses.top) floor /= 2
    const bass = Math.max(PLAY.basses.lowest, floor > PLAY.basses.fold ? floor / 2 : floor)
    for (let t = entry('low'); t < end - FORM.margin; t += FORM.lowEvery * bar) {
      const seconds = FORM.lowEvery * bar * PLAY.cellos.held
      ens({ t, lane: 'low', instrument: PLAY.cellos.instrument, hz: PLAY.cellos.hz, seconds, release: PLAY.cellos.release, velocity: PLAY.cellos.velocity, pan: PLAY.cellos.pan, key: 'c' })
      ens({ t, lane: 'low', instrument: PLAY.basses.instrument, hz: bass, seconds, release: PLAY.basses.release, velocity: PLAY.basses.velocity, pan: PLAY.basses.pan, key: 'b' })
    }

    // the motif in the day's own instrument: its own day, then softer by the day while the newest day still names
    // its field, then at full strength in the tutti
    const kept = !o.hindsight || i === last || d.named_on_newest_day
    for (let j = i; j < n; j++) {
      if (j > i && !kept) break
      const a = j === i ? mt : o.days[j]!.from_s
      const b = j === last ? Math.min(cut, tutti) : dayEnd(j)
      const age = j - i
      loop(i, a, b, {
        lane, instrument: d.instrument, velocity: Math.max(PLAY.motif.floor, PLAY.motif.velocity - PLAY.motif.perDay * age), pan: side, origin: mt,
        bus: age === 0 ? 'ensemble' : 'aged', gain: 10 ** ((-FORM.dbPerDay * age) / 20), key: `s${i}`,
      })
    }
    if (kept) loop(i, tutti, cut, { lane, instrument: d.instrument, velocity: PLAY.motif.tutti, pan: side, origin: mt, key: `t${i}` })
  })

  // the tutti's chord: horns and trombones on harmonics 4 to 7 of A, until the cut
  if (cut > tutti) {
    for (const [h, instrument, pan] of [[4, PLAY.brass.horn, PLAY.brass.hornPan], [5, PLAY.brass.horn, PLAY.brass.hornPan], [6, PLAY.brass.trombone, PLAY.brass.trombonePan], [7, PLAY.brass.trombone, PLAY.brass.trombonePan]] as const) {
      let hz = 55 * h
      while (hz > PLAY.brass.top) hz /= 2
      ens({ t: tutti, lane: 'brass', instrument, hz, seconds: cut - tutti, release: PLAY.brass.release, velocity: PLAY.brass.velocity, pan, key: `brass${h}` })
    }
  }

  // the coda: the first day's sentence once more, alone, and one high violin note (after the cut, so it rings on)
  const coda = o.coda_s ?? cut + FORM.codaAfter
  clips.push({ t: coda, lane: 'voice', day: 0, gain: PLAY.saidAgain })
  const first = o.days[0]!
  if (first.speech_s !== undefined) {
    notes.push({
      t: coda + first.speech_s + FORM.violinAfter, lane: 'coda', bus: 'ensemble', instrument: PLAY.violin.instrument, hz: FORM.violinHz, seconds: FORM.violinNote,
      release: PLAY.violin.release, velocity: PLAY.violin.velocity, pan: PLAY.violin.pan, gain: 1, until: null, key: 'coda',
    })
  } else {
    missing.push({ lane: 'coda', day: null, why: 'the coda’s violin is not performed: the record does not hold how long the sentence before it lasts' })
  }

  // each new day the older motifs step back while its sentence is said and answered, and return over three bars
  const duck: Performance['duck'] = [{ t: 0, v: 1 }]
  for (let i = 1; i < n; i++) {
    const a = o.days[i]!.from_s - PLAY.duck.before
    const b = o.days[i]!.motif_from_s
    duck.push({ t: a - PLAY.duck.smooth / 2, v: 1 }, { t: a + PLAY.duck.smooth / 2, v: PLAY.duck.to }, { t: b, v: PLAY.duck.to }, { t: b + PLAY.duck.bars * bar, v: 1 })
  }

  notes.sort((x, y) => x.t - y.t)
  clips.sort((x, y) => x.t - y.t)
  return {
    week: o.week, notes, clips, duck, cut, end: o.seconds, instruments: [...new Set(notes.map((x) => x.instrument))].sort(),
    mix: o.mix ? { ens: o.mix.ens, voice: o.mix.voice } : null, missing,
  }
}

/** The level of the older motifs at a moment, between the points of `duck`. */
export function duckAt(duck: Performance['duck'], t: number): number {
  if (t <= duck[0]!.t) return duck[0]!.v
  for (let k = 1; k < duck.length; k++) {
    const p = duck[k - 1]!
    const q = duck[k]!
    if (t <= q.t) return q.t === p.t ? q.v : p.v + ((q.v - p.v) * (t - p.t)) / (q.t - p.t)
  }
  return duck.at(-1)!.v
}

/** The address of a day's sentence as spoken, written by the press beside the album. */
export const saidUrl = (week: string, day: number): string => `/ill-tempered-week/perform/${week}/said-${day + 1}.m4a`
