/** Finding a word in a morning (reading aids, 2026-11-14).
 *
 *  The "By source" register prints the top eight lines of each source, which is what a page can
 *  carry. The day file holds every line: three hundred from Wikipedia alone. A reader who wants
 *  to know whether a name surfaced anywhere this morning should not have to open the JSON, so
 *  the register's search box reads the day's own JSON edition and looks through all of it.
 *
 *  This module is the looking: pure, with no DOM and no network, so the claim "these are all the
 *  lines that carry the word" is tested without a browser. The controller beside it
 *  (source-filter-controller.ts) fetches the file and writes the result into the page.
 */
import { matchesText, normalise } from '../catalogue/query'
import { deskLabel, magnitudeOf, platformLabel } from './format'
import { SOURCE_GROUPS, sourceGroup, type SourceGroup } from './groups'
import type { TrendingDay } from './types'
import { crossingIndex, signalKey } from './view'

/** What a reader asked the register for: a word, a kind of source, or both. */
export interface LedgerFilter {
  q: string
  /** a source kind, or 'all' */
  kind: SourceGroup | 'all'
}

export const EMPTY_FILTER: LedgerFilter = { q: '', kind: 'all' }

const KINDS = new Set<string>(SOURCE_GROUPS.map((g) => g.key))

/** Read a filter from a query string. An unknown kind is ignored rather than trusted: an old or
 *  hand-edited link opens the whole register, never an empty one. */
export function parseFilter(search: string): LedgerFilter {
  const params = new URLSearchParams(search)
  const kind = params.get('kind') ?? ''
  return { q: params.get('q') ?? '', kind: KINDS.has(kind) ? (kind as SourceGroup) : 'all' }
}

/** The filter as a query string, '' when nothing is narrowed, so an unfiltered page keeps its
 *  clean address. */
export function serialiseFilter(filter: LedgerFilter): string {
  const params = new URLSearchParams()
  if (filter.kind !== 'all') params.set('kind', filter.kind)
  if (filter.q.trim()) params.set('q', filter.q.trim())
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** A query narrows only from two characters on: one letter matches most of a morning. */
export const MIN_QUERY = 2

export function isSearching(filter: LedgerFilter): boolean {
  return normalise(filter.q).length >= MIN_QUERY
}

export interface SearchHit {
  label: string
  url: string | null
  geo: string | null
  desk: string | null
  rank: number
  /** the source's own number with its unit, as the register prints it */
  magnitudeText: string
  /** sources that carried the topic this line belongs to, when it is one of the day's crossings */
  crossing: number | null
}

export interface SearchSource {
  id: string
  label: string
  group: SourceGroup
  /** matching lines of this source, in the source's own order */
  hits: SearchHit[]
}

export interface SearchResult {
  /** sources with at least one matching line, in the ledger's own source order */
  sources: SearchSource[]
  /** every matching line of the day, whether listed here or not */
  total: number
  /** lines listed: `total`, or the cap when the query is too wide to print */
  listed: number
}

/**
 * Every line of the day that carries the query, source by source.
 *
 * A line matches when every word of the query occurs in its label (case folded, diacritics
 * stripped, the catalogue's rule). A source's desk and country are matched too, so "BBC" or "DE"
 * find what a reader would expect them to. The cap bounds what is LISTED, never what is counted:
 * `total` is always the true number, so a wide query reads "the first 300 of 1,204", not "300".
 */
export function searchDay(day: TrendingDay, filter: LedgerFilter, cap = 300): SearchResult {
  const crossings = crossingIndex(day)
  let total = 0
  let listed = 0
  const sources: SearchSource[] = []
  for (const s of day.sources) {
    const group = sourceGroup(s.id)
    if (filter.kind !== 'all' && group !== filter.kind) continue
    const hits: SearchHit[] = []
    for (const sig of day.signals[s.id] ?? []) {
      const desk = deskLabel(sig.meta)
      const text = [sig.label, desk ?? '', sig.geo ?? ''].join(' ')
      if (!matchesText(text, filter.q)) continue
      total++
      if (listed >= cap) continue
      listed++
      hits.push({
        label: sig.label,
        url: sig.url,
        geo: sig.geo,
        desk,
        rank: sig.rank,
        magnitudeText: magnitudeOf(sig).text,
        crossing: crossings.get(signalKey(sig)) ?? null,
      })
    }
    if (hits.length > 0) sources.push({ id: s.id, label: platformLabel(s.id), group, hits })
  }
  return { sources, total, listed }
}
