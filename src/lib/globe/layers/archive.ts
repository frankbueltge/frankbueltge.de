// src/lib/globe/layers/archive.ts — how a layer reads the archive.
//
// Two rules in one small module. First, the day axis comes from the archive's own filenames and
// from nowhere else: no adapter may ask the calendar what today is, because a globe whose oldest
// frame moves when the machine's clock moves is not showing a record, it is showing a mood.
// Second, a file is read once per build and kept: the floor, the manifest, the per-layer feeds
// and the tables all walk the same seventy-odd days, and reading them four times would quadruple
// a build for nothing.
//
// Build-time only. Everything under src/lib/globe/layers is imported by pages that prerender;
// the island of the next phase takes the TYPES and fetches the feeds.
import { readFileSync, readdirSync } from 'node:fs'
import { resolve } from 'node:path'
import { daysFromFiles } from './types'

/** Paths are given relative to the repository root and resolved against the working directory —
 *  the same way src/lib/experiments/thumbnails.ts reads the practices' mirrors. Not against
 *  `import.meta.url`: at build time this module is bundled into a chunk under dist/, and a path
 *  relative to the bundle points somewhere outside the repository entirely. */
const from = (path: string): string => resolve(process.cwd(), path)

const cache = new Map<string, unknown>()

/** The dated day files of one archive directory, ascending. `latest.json` is ignored: it is a
 *  copy of one of the dated files, and counting it would give the newest day twice. */
export function archiveDays(dir: string): string[] {
  return daysFromFiles(readdirSync(from(dir)))
}

/** One committed file, parsed once per build. */
export function readJson<T>(path: string): T {
  const hit = cache.get(path)
  if (hit !== undefined) return hit as T
  const parsed = JSON.parse(readFileSync(from(path), 'utf8')) as T
  cache.set(path, parsed)
  return parsed
}

/** One day of an archive whose files are `<dir>/<day>.json`, or null when that day is not in it. */
export function readDay<T>(dir: string, day: string, days: readonly string[]): T | null {
  return days.includes(day) ? readJson<T>(`${dir}/${day}.json`) : null
}

export const dayPath = (dir: string, day: string): string => `${dir}/${day}.json`
