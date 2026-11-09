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
  text: string
  attention: number
  source: string
  instrument: string
  named_on_newest_day: boolean
  attended: { field: string; text: string; attention: number }[]
}

export interface Overlooked extends Rendered {
  edition: number
  newest_day: string
  silenced_after_their_day: string[]
  days: OverlookedDay[]
}

export interface UnisonDay {
  day: string
  signals: number
  story: string
  agreement: number
  peak: boolean
  said: string | null
  overlooked: string
}

export interface Unison extends Rendered {
  days: UnisonDay[]
}

export interface TurnDay {
  day: string
  signals: number
  families: Record<string, number>
  bar_s: number
  turn: boolean
  said: string | null
}

export interface Turn extends Rendered {
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

/** The field's name as the map writes it. */
export const FIELD: Record<string, string> = {
  war: 'war and violence', hunger: 'hunger', poverty: 'poverty', economy: 'debt, work and cost of living',
  inequality: 'inequality', power: 'concentration of money and power', climate: 'climate and disasters',
  nature: 'nature, air and water', health: 'health and epidemics', displacement: 'displacement and humanitarian need',
  democracy: 'democracy and rights', information: 'information and manipulation', ai: 'AI and its harms',
}

/** The instrument a field's overlooked headline is answered by (VSCO 2 CE patch → its name). */
export const INSTRUMENT: Record<string, string> = {
  FluteSusVib: 'flute', BassoonSus: 'bassoon', OboeSusVib: 'oboe', FHornSus: 'horn', TromboneSus: 'trombone',
  SViolinVib: 'solo violin', ClarinetSus: 'clarinet', CelloEnsSusVib: 'cellos', TrumpetSus: 'trumpet',
  ViolaEnsSusVib: 'violas', PiccoloSus: 'piccolo', TubaSus: 'tuba', ContrabassSusVB: 'double bass',
}
