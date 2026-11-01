// src/lib/briefing/derive.ts — what the site makes of a briefing (2026-11-01). Pure: files in, files out.
//
// A new briefing reaches three places by itself: a round of Third Reading, a round of Ducking and new
// seeds on Common Ground's watchlist. Each keeps what is its own: Third Reading its question and its
// consent, Ducking its crowd, the watchlist everything already on it.
import type { Round as ReadingRound } from '@/lib/reading/round'
import type { Round as DuckingRound } from '@/lib/ducking/round'
import type { Briefing } from './briefing'

/** The days of Common Ground a round of Third Reading reads attention over. */
export const ATTENTION_DAYS = 30

/** One voice per channel, in this order, each used once. */
export const DESK_VOICES = [
  'af_heart', 'bm_george', 'af_nicole', 'bf_emma', 'am_michael', 'af_bella',
  'am_puck', 'af_aoede', 'am_fenrir', 'bm_fable', 'af_sarah', 'bf_lily',
] as const

export interface WatchEntry {
  added: string
  aliases: string[]
  note: string
  origin: string
  slug: string
  term: string
  wikipedia_article: string | null
}

const daysBefore = (day: string, days: number): string => {
  const d = new Date(`${day}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - days)
  return d.toISOString().slice(0, 10)
}

const title = (b: Briefing): string => `Briefing after cycle ${b.id.slice(-3)} — what the world is pressing on`

/** A round of Third Reading: the briefing's matters and estimates under the template's question. */
export function toReadingRound(b: Briefing, url: string, template: ReadingRound): ReadingRound {
  return {
    $contract: template.$contract,
    id: b.id,
    briefing: { title: title(b), written: b.written, url },
    attention_window: { from: daysBefore(b.written, ATTENTION_DAYS - 1), to: b.written },
    consent_version: template.consent_version,
    question: template.question,
    pairs_per_reading: Math.min(template.pairs_per_reading, (b.matters.length * (b.matters.length - 1)) / 2),
    estimates_per_reading: Math.min(template.estimates_per_reading, b.estimates.length),
    matters: b.matters.map((m) => ({
      id: m.id,
      short: m.short,
      title: m.title,
      gist: m.gist,
      quiet_rank: m.quiet_rank,
      terms: m.terms,
      ...(m.exclude ? { exclude: m.exclude } : {}),
    })),
    estimates: b.estimates,
  }
}

/** A round of Ducking: the same matters as channels, primary sources first. */
export function toDuckingRound(b: Briefing, url: string, template: DuckingRound): DuckingRound {
  return {
    $contract: template.$contract,
    id: b.id,
    briefing: { title: title(b), written: b.written, url },
    checked: b.checked.on,
    channels: b.matters.map((m, i) => ({
      id: m.id,
      strip: m.strip,
      title: m.title,
      terms: m.terms,
      ...(m.exclude ? { exclude: m.exclude } : {}),
      voice: DESK_VOICES[i]!,
      lines: m.lines,
      sources: [...m.sources]
        .sort((x, y) => (x.kind === y.kind ? 0 : x.kind === 'primary' ? -1 : 1))
        .map(({ label, url: href }) => ({ label, url: href })),
    })),
    rest: { ...template.rest, seed: Number(b.id.slice(-3)) },
  }
}

/** The watchlist with the briefing's matters added. A matter already on it is left as it is. */
export function withMatters(b: Briefing, list: readonly WatchEntry[]): WatchEntry[] {
  const known = new Set(list.flatMap((e) => [e.slug, e.term.toLowerCase(), ...e.aliases.map((a) => a.toLowerCase())]))
  const added = b.matters
    .filter((m) => !known.has(m.id) && !m.terms.some((t) => known.has(t.toLowerCase())))
    .map((m) => ({
      added: b.written,
      aliases: m.terms.slice(1),
      note: `Editorial seed, ${b.written}: a matter of the ecology's briefing after cycle ${b.id.slice(-3)} (${m.short}).`,
      origin: 'editorial',
      slug: m.id,
      term: m.terms[0]!,
      wikipedia_article: null,
    }))
  return [...list, ...added]
}
