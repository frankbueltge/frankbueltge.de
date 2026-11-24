// src/lib/ill-tempered-week/albums.ts — the albums of the ill-tempered week as the site reads them (2026-11-09,
// docs/design/2026-11-08-common-time-method.md). Build time only: it reads src/data/ill-tempered-week/*.json,
// which scripts/ill-tempered-week/press.py writes beside the audio in public/ill-tempered-week/<week>/.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

export const ALBUMS_DIR = 'src/data/ill-tempered-week'
export const PIECES = ['overlooked', 'unison', 'turn'] as const
export type PieceId = (typeof PIECES)[number]

interface Rendered {
  audio: string
  seconds: number
  lufs: number | null
  true_peak_dbtp: number
  float32_sha256: string
}

export interface OverlookedDay {
  day: string
  field: string
  /** the field's Ducking voice that says the headline */
  voice: string
  text: string
  attention: number
  source: string
  instrument: string
  named_on_newest_day: boolean
  attended: { field: string; text: string; attention: number }[]
  /** the motif's length in eighths of the pulse, and its notes: the eighth each begins on and its pitch */
  motif_eighths: number
  motif: { step: number; hz: number }[]
  /** when the day's bell strikes, and when its motif begins, in seconds into the piece */
  from_s: number
  motif_from_s: number
  /** recorded from the pressing of 2026-11-14 on (scores, see score-overlooked.ts): how long the headline is said,
   *  the answering notes (seconds into the speech, pitch), and when each part of the ensemble takes the motif up */
  speech_s?: number
  echo?: { t: number; hz: number }[]
  entries_s?: { violins: number; violas: number; piano: number; low: number }
}

/** The ways a fugue treats its subject, as the albums take them up one week after the next (from 2026-11-23,
 *  scripts/ill-tempered-week/itw/progression.py; src/lib/ill-tempered-week/progression.ts names them for the page). */
export type Device = 'inversion' | 'diminution' | 'augmentation' | 'second subject' | 'stretto' | 'retrograde'

/** The second subject: the motif the album before ended on, its newest day's in Overlooked, note by note (each
 *  note's eighth, pitch and length in eighths). */
export interface SecondSubject {
  week: string
  day: string
  field: string
  text: string
  instrument: string
  eighths: number
  motif: { step: number; hz: number; eighths: number }[]
}

/** How an album builds on the album before (recorded from 2026-11-23 on, itw/progression.py). */
export interface Progression {
  cycle: number
  /** how many devices the album plays: 1 to 6 once its week is complete */
  step: number
  /** the album it builds on: the newest complete one before it */
  from: string | null
  taken_over: Device[]
  /** the week's verdict once the week is complete (the seventh pressing), else null */
  verdict: Form | null
  /** the device the verdict asked for, and the one added: the next in the order where that one was in force */
  asked: Device | null
  added: Device | null
  /** in the order they came in */
  devices: Device[]
  second: SecondSubject | null
}

export interface Overlooked extends Rendered {
  edition: number
  week: string
  tuning: string
  pulse_s: number
  day_bars: number
  days_so_far: number
  newest_day: string
  round: string
  hindsight: boolean
  silenced_after_their_day: string[]
  tutti_from_s: number
  cut_s: number
  /** recorded from the pressing of 2026-11-14 on: when the coda's sentence begins */
  coda_s?: number
  days: OverlookedDay[]
  /** recorded from 2026-11-23 on: the album's devices, the bars after which each part of the ensemble takes a motif
   *  up, how many eighths the canon trails, and the second subject while that device is in force */
  devices?: Device[]
  entry_bars?: { violins: number; violas: number; piano: number; low: number }
  canon_eighths?: { violins: number; violas: number }
  second?: SecondSubject
}

export interface UnisonEvent {
  at_s: number
  section: 'violins' | 'violas' | 'cellos' | 'basses'
  tremolo: boolean
  attention: number
  from_hz: number
  to_hz: number
  chord_tone_hz: number
  text: string
  /** recorded while the album plays a device (from 2026-11-23 on): how long the glissando lasts, which augmentation
   *  and diminution change; without it, the form's 5 s plus 4 s times the attention */
  dur_s?: number
}

export interface UnisonDay {
  day: string
  signals: number
  story: string
  agreement: number
  peak: boolean
  said: string | null
  overlooked: string
  overlooked_attention: number
  events: UnisonEvent[]
  /** recorded from the pressing of 2026-11-14 on (scores, see score-unison.ts): when the day begins, how long its
   *  headline is said at the peak, and the solo double bass (when it begins; each note's onset after that, its pitch
   *  and length) */
  from_s?: number
  said_s?: number | null
  bass_from_s?: number
  bass?: { t: number; hz: number; s: number }[]
  /** the second subject's notes in the horns before the peak (seconds into the piece, pitch, length), while that
   *  device is in force */
  second?: { t: number; hz: number; s: number }[]
}

export interface Unison extends Rendered {
  field: string
  day_s: number
  chord: string
  median_spoken_hz: number
  days: UnisonDay[]
  /** recorded from 2026-11-23 on */
  devices?: Device[]
  second?: SecondSubject
}

export interface TurnDay {
  day: string
  signals: number
  families: Record<string, number>
  bar_s: number
  turn: boolean
  said: string | null
  from_s: number
  /** the second subject's bell notes, one a bar (seconds into the piece, pitch), while that device is in force */
  second?: { t: number; hz: number }[]
}

export interface Turn extends Rendered {
  field: string
  bars_per_day: number
  harmonics: Record<string, number>
  days: TurnDay[]
  /** recorded from 2026-11-23 on; `utonal` while the inversion is in force: a family sings A1 × utonal / harmonic */
  devices?: Device[]
  utonal?: number
  second?: SecondSubject
}

export type Form = 'handover' | 'break' | 'held' | 'mosaic' | 'standing'
/** A form the week chose, other than the standing one (scripts/ill-tempered-week/itw/forms_*.py). */
export type ChosenForm = Exclude<Form, 'standing'>

export interface FormDay {
  day: string
  from_s: number
  signals: number
  lead: string | null
  /** the share of the day's signals naming its leading story */
  agreement: number
  peak: boolean
  said: string | null
  /** how long the sentence is said */
  said_s: number | null
}

export interface HeldEvent {
  at_s: number
  story: string | null
  lead: boolean
  attention: number
  from_hz: number
  to_hz: number
  text: string
}

export interface MosaicEvent {
  at_s: number
  story: string | null
  lead: boolean
  sound: string
  hz: number
  attention: number
  text: string
}

export type UnisonPart =
  | { form: 'held'; from_s: number; to_s: number; day_s: number; lead: string | null; degrees: Record<string, number>;
      ground: { from_s: number; hz: number }[]; days: (FormDay & { events: HeldEvent[] })[] }
  | { form: 'mosaic'; from_s: number; to_s: number; sounds: Record<string, string>;
      days: (FormDay & { to_s: number; step_s: number; events: MosaicEvent[] })[] }
  | { form: 'stroke'; at_s: number; day: string }

/** Unison pressed in the week's form (itw/forms_unison.py): the parts it is made of, in time order. */
export interface UnisonForm extends Rendered {
  form: ChosenForm
  field: string
  week: string
  round: string
  tuning: string
  peak_agreement: number
  parts: UnisonPart[]
}

export interface TurnFormBar {
  from_s: number
  s: number
  /** the index of the day in the week */
  day: number
  kind: 'bar' | 'all' | 'said' | 'cut'
  /** how many beats each family sounds in the bar */
  pulses: Record<string, number>
  /** held and handover: the pitch ratio (9/8 from the handover on); mosaic: the octave */
  ratio?: number
  octave?: number
}

/** Turn pressed in the week's form (itw/forms_turn.py): every bar, and each day's counts and turn. */
export interface TurnForm extends Rendered {
  form: ChosenForm
  field: string
  week: string
  round: string
  harmonics: Record<string, number>
  turn_day: string | null
  bars: TurnFormBar[]
  days: { day: string; signals: number; families: Record<string, number>; turn: boolean; said: string | null }[]
}

export interface OverlookedFormDay {
  day: string
  field: string
  voice: string
  text: string
  attention: number
  source: string
  instrument: string
  /** when the headline is said, how long, when its motif begins, and how many times it is played */
  said_s: number
  speech_s: number
  motif_from_s: number
  repeats: number
  motif_eighths: number
  motif: { step: number; hz: number; eighths: number }[]
  from_s: number
}

export type OverlookedPart =
  | { form: 'held'; from_s: number; to_s: number; day_s: number; chord: number[]; ground: { from_s: number; ratio: number }[]; days: OverlookedFormDay[] }
  | { form: 'mosaic'; from_s: number; to_s: number; days: (OverlookedFormDay & { to_s: number; named: number })[] }
  | { form: 'stroke'; at_s: number; day: string }

/** Overlooked pressed in the week's form (itw/forms_overlooked.py): only the seventh pressing of a week takes it. */
export interface OverlookedForm extends Rendered {
  form: ChosenForm
  edition: number
  week: string
  tuning: string
  pulse_s: number
  days_so_far: number
  newest_day: string
  round: string
  parts: OverlookedPart[]
}

/** A piece record without `form` was pressed in the standing form (every album before 2026-11-16 is). */
export const standingOverlooked = (p: Overlooked | OverlookedForm | undefined): p is Overlooked => !!p && !('form' in p)
export const formedOverlooked = (p: Overlooked | OverlookedForm | undefined): p is OverlookedForm => !!p && 'form' in p
export const standingUnison = (p: Unison | UnisonForm | undefined): p is Unison => !!p && !('form' in p)
export const standingTurn = (p: Turn | TurnForm | undefined): p is Turn => !!p && !('form' in p)
export const formedUnison = (p: Unison | UnisonForm | undefined): p is UnisonForm => !!p && 'form' in p
export const formedTurn = (p: Turn | TurnForm | undefined): p is TurnForm => !!p && 'form' in p

export interface Character {
  round: string
  /** the leading term of each day read, across all fields, a story's variants folded */
  leads: string[]
  hold: number
  changes: number
  /** the largest Jensen-Shannon distance between the field shares of two consecutive days, and that day */
  break: number
  break_day: string | null
  verdict: Form
  thresholds: { break: number; held: number; mosaic: number }
  days_read: number
  /** the form pressed: from 2026-11-16 to 2026-11-23 the verdict once the week was complete, else standing; since
   *  2026-11-23 always standing, and the verdict chooses the device the album adds (`progression`) */
  form: Form
  why: string
}

export interface Album {
  /** The work's name as written when the album was pressed: lowercase from 2026-11-10 on (Frank's choice of
   *  2026-11-09, wording private); a record pressed before keeps the capitals it was pressed under. */
  work: 'the ill-tempered week' | 'The Ill-Tempered Week'
  title: string
  week: string
  days: string[]
  complete: boolean
  pressed: string
  /** recorded from 2026-11-16 on (scripts/ill-tempered-week/itw/character.py): the week's character as far as its
   *  days were read, the verdict, and the form the album was pressed in. An album without it was pressed in the
   *  standing form, before the week chose. */
  character?: Character
  /** recorded from 2026-11-23 on: how the album builds on the one before (itw/progression.py). An album without it
   *  was pressed before the weeks built on each other. */
  progression?: Progression
  pieces: { overlooked: Overlooked | OverlookedForm; unison?: Unison | UnisonForm; turn?: Turn | TurnForm }
  library: string
  voices: string
  receipts: Record<string, string>
}

/** Every album on file, oldest first. */
export function readAlbums(dir = ALBUMS_DIR): Album[] {
  return readdirSync(dir)
    .filter((f) => /^\d{4}-W\d{2}\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Album)
}

/** The ISO week's number, which is the album's: 2026-W45 is Contrapunctus 45. */
export const weekNumber = (week: string): number => Number(week.split('-W')[1])

/** m:ss, cut rather than rounded, as a browser's audio player counts (166.8 s is 2:46 there and here). */
export const clock = (seconds: number): string => {
  const s = Math.floor(seconds)
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
}

const MONTH = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "2 to 8 November 2026" for a full week, "2 to 4 November 2026" while it grows. */
export function span(days: readonly string[]): string {
  const [y1, m1, d1] = days[0]!.split('-').map(Number)
  const [y2, m2, d2] = days.at(-1)!.split('-').map(Number)
  if (days.length === 1) return `${d1} ${MONTH[m1! - 1]} ${y1}`
  if (m1 === m2) return `${d1} to ${d2} ${MONTH[m2! - 1]} ${y2}`
  return `${d1} ${MONTH[m1! - 1]} to ${d2} ${MONTH[m2! - 1]} ${y2}`
}

const WEEKDAY = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
export const weekday = (day: string): string => WEEKDAY[(new Date(`${day}T12:00:00Z`).getUTCDay() + 6) % 7]!

// The field and instrument names live in a module without node:fs, so the score islands can import them too.
export { FIELD, INSTRUMENT } from './names'
