// src/lib/common-time/score.ts — Common Time's weekly pressings as the site reads them (2026-11-08,
// docs/design/2026-11-08-common-time.md). Build time only: it reads src/data/common-time/*.json,
// which scripts/common-time/press.py writes beside the audio in public/common-time/.
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import type { Family, MotifNote } from './arrangement'

export const CONTRACT = 'common-time/1'
export const SCORES_DIR = 'src/data/common-time'

export interface TopicRecord {
  id: string
  label: string
  /** the day the label was first recorded; the melody is made from that spelling */
  label_from: string
  families: Family[]
  publishers: string[]
  motif: MotifNote[]
}

export interface Section {
  day: string
  from_s: number
  to_s: number
  missing: boolean
  receipt: { file: string; sha256: string } | null
  converging: number
  signals: number
  crowd_per_bar: number
  theme: { present: boolean; families: Family[] }
  melody: TopicRecord | null
  ornaments: { id: string; label: string; family: Family; step: number; slot: number }[]
  lufs: number
}

export interface Pressing {
  $contract: string
  week: string
  days: string[]
  archive: {
    to: string
    days: number
    files_sha256: string
    signals_max: number
    converging_median: number
    reference_day: string
  }
  patch: {
    bpm: number
    scale: string
    vowels: string
    progression: string[]
    intro_bars: number
    day_bars: number
    outro_bars: number
    instruments: Record<Family, string>
    platforms: Record<Family, string[]>
    fallback_family: Family
    levels_set_on: string
    gains: Record<string, number>
  }
  theme: (TopicRecord & { days: number; outro_families: Family[] }) | null
  sections: Section[]
  audio: { file: string; sha256: string; seconds: number; lufs: number; true_peak_dbtp: number; encoder: string }
  render: {
    renderer: string
    float32_sha256: string
    wav_pcm24_sha256: string
    python: string
    numpy: string
    scipy: string
    pyloudnorm: string
    platform: string
  }
}

/** Every pressing, oldest first. */
export function readPressings(root: string = process.cwd()): Pressing[] {
  const dir = join(root, SCORES_DIR)
  return readdirSync(dir)
    .filter((f) => /^\d{4}-W\d{2}\.json$/.test(f))
    .sort()
    .map((f) => JSON.parse(readFileSync(join(dir, f), 'utf8')) as Pressing)
}

/** Where the page links the sound: the path the site serves it under. */
export const audioHref = (p: Pressing): string => `/${p.audio.file.replace(/^public\//, '')}`

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

/** "2026-W45" → "Week 45, 2026" */
export function weekName(week: string): string {
  const [, year, n] = /^(\d{4})-W(\d{2})$/.exec(week) ?? []
  return `Week ${Number(n)}, ${year}`
}

/** The week's days in words: "2 to 8 November 2026", "28 September to 4 October 2026". */
export function weekSpan(days: readonly string[]): string {
  const [y1, m1, d1] = days[0]!.split('-').map(Number)
  const [y2, m2, d2] = days.at(-1)!.split('-').map(Number)
  if (y1 !== y2) return `${d1} ${MONTHS[m1! - 1]} ${y1} to ${d2} ${MONTHS[m2! - 1]} ${y2}`
  if (m1 !== m2) return `${d1} ${MONTHS[m1! - 1]} to ${d2} ${MONTHS[m2! - 1]} ${y2}`
  return `${d1} to ${d2} ${MONTHS[m2! - 1]} ${y2}`
}

/** "Mon 2" */
export function dayShort(day: string): string {
  const d = new Date(`${day}T12:00:00Z`)
  return `${['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getUTCDay()]} ${d.getUTCDate()}`
}

/** 123 → "2:03" */
export const clock = (seconds: number): string =>
  `${Math.floor(seconds / 60)}:${String(Math.round(seconds % 60)).padStart(2, '0')}`
