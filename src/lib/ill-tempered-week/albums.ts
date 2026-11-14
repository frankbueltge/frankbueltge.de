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
}

export interface Unison extends Rendered {
  field: string
  day_s: number
  chord: string
  median_spoken_hz: number
  days: UnisonDay[]
}

export interface TurnDay {
  day: string
  signals: number
  families: Record<string, number>
  bar_s: number
  turn: boolean
  said: string | null
  from_s: number
}

export interface Turn extends Rendered {
  field: string
  bars_per_day: number
  harmonics: Record<string, number>
  days: TurnDay[]
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
  pieces: { overlooked: Overlooked; unison?: Unison; turn?: Turn }
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
