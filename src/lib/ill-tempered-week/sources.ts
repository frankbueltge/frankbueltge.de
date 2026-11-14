// src/lib/ill-tempered-week/sources.ts — where a headline of the ill-tempered week came from (2026-11-14): the link
// its platform gave it, read from the committed day file of Common Ground (src/data/trending/<day>.json) at build time.
//
// The album's record keeps a headline as the renderer read it: a Google News label without the outlet's name, every
// other label as it stands, trimmed (itw/ledger.py, field_week). The same normalisation here finds the signal again.
// A headline that cannot be found gets no link: the page never guesses one.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

/** A Google News label's outlet suffix, " - The Guardian" (itw/ledger.py, OUTLET, ported character for character). */
export const OUTLET = /\s+[-–—|]\s+[^-–—|]{2,40}$/u

/** A label as the record keeps it. */
export const asRecorded = (source: string, label: string): string => (source === 'google_news' ? label.replace(OUTLET, '').trim() : label.trim())

interface DaySignal {
  label: string
  url?: string | null
}

export interface DayLinks {
  /** the link of the first signal with this text on this platform */
  bySource: Map<string, string>
  /** the link of the first signal with this text on any platform */
  byText: Map<string, string>
}

/** The links of one day file, keyed by the text the record keeps. Only http(s) links are kept. */
export function indexDay(signals: Record<string, DaySignal[]>): DayLinks {
  const bySource = new Map<string, string>()
  const byText = new Map<string, string>()
  for (const [source, list] of Object.entries(signals)) {
    for (const s of list) {
      if (!s.url || !/^https?:\/\//.test(s.url)) continue
      const text = asRecorded(source, s.label)
      const key = `${source}\u0000${text}`
      if (!bySource.has(key)) bySource.set(key, s.url)
      if (!byText.has(text)) byText.set(text, s.url)
    }
  }
  return { bySource, byText }
}

/** The link for a headline: on its own platform where the record names it, else on any. Null when not found. */
export function linkFor(day: DayLinks, text: string, source?: string): string | null {
  if (source) {
    const hit = day.bySource.get(`${source}\u0000${text}`)
    if (hit) return hit
  }
  return day.byText.get(text) ?? null
}

const cache = new Map<string, DayLinks>()

/** The links of a committed day file (build time only). */
export function dayLinks(day: string, dir = 'src/data/trending'): DayLinks {
  const hit = cache.get(`${dir}/${day}`)
  if (hit) return hit
  const file = JSON.parse(readFileSync(join(dir, `${day}.json`), 'utf8')) as { signals: Record<string, DaySignal[]> }
  const links = indexDay(file.signals)
  cache.set(`${dir}/${day}`, links)
  return links
}

/** The platform's host, to say where a link leads ("news.google.com"). */
export const hostOf = (url: string): string => {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return ''
  }
}
