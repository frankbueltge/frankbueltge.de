/** The kinds of source the day ledger reads (reading aids, 2026-11-14).
 *
 *  With thirty-four sources the "By source" register of /trending stopped being scannable: a
 *  reader looking for the day's science, or for what the markets were betting on, had to walk
 *  the whole file. This sorts each source into one of eight kinds, so the register can be
 *  filtered by kind and a card can say what kind of public it is.
 *
 *  THE KIND IS THE LEDGER'S OWN SORTING, not a source's statement about itself, and the page says
 *  so where the filter stands. It decides nothing about the crossing: a topic converges by the
 *  token rule alone, whatever kinds its sources are.
 *
 *  A source id with no entry reads as `other`, never as a guess. The nightly run can add a
 *  source before anyone sorts it here, and the page must not break or lie on that morning.
 */

export type SourceGroup =
  | 'search'
  | 'news'
  | 'social'
  | 'tech'
  | 'science'
  | 'culture'
  | 'markets'
  | 'crises'
  | 'other'

/** The kinds in the order the filter shows them. */
export const SOURCE_GROUPS: readonly { key: SourceGroup; label: string }[] = [
  { key: 'search', label: 'Search & reference' },
  { key: 'news', label: 'News' },
  { key: 'social', label: 'Social' },
  { key: 'tech', label: 'Tech & code' },
  { key: 'science', label: 'Science' },
  { key: 'culture', label: 'Culture & apps' },
  { key: 'markets', label: 'Markets & bets' },
  { key: 'crises', label: 'Crises' },
  { key: 'other', label: 'Other' },
] as const

const GROUP_OF: Record<string, SourceGroup> = {
  google_trends: 'search',
  wikipedia: 'search',
  baidu: 'search',

  google_news: 'news',
  world_press: 'news',
  wikipedia_news: 'news',

  bluesky: 'social',
  mastodon: 'social',
  reddit: 'social',
  lemmy: 'social',

  hackernews: 'tech',
  lobsters: 'tech',
  techmeme: 'tech',
  github: 'tech',
  github_trending: 'tech',
  huggingface: 'tech',
  devto: 'tech',
  stackoverflow: 'tech',
  pypi: 'tech',
  producthunt: 'tech',

  arxiv: 'science',
  hf_papers: 'science',
  science_press: 'science',
  crossref: 'science',
  europepmc: 'science',
  openalex: 'science',

  appstore: 'culture',
  steam: 'culture',
  apple_music: 'culture',
  apple_podcasts: 'culture',
  openlibrary: 'culture',

  coingecko: 'markets',
  stocktwits: 'markets',
  polymarket: 'markets',
  manifold: 'markets',

  humanitarian: 'crises',
  alerts: 'crises',
}

export function sourceGroup(id: string): SourceGroup {
  return GROUP_OF[id] ?? 'other'
}

export function sourceGroupLabel(group: SourceGroup): string {
  return SOURCE_GROUPS.find((g) => g.key === group)?.label ?? group
}

export interface SourceGroupCount {
  key: SourceGroup
  label: string
  /** how many of the given sources are of this kind */
  n: number
}

/** The kinds that actually occur among `ids`, in the filter's order, each with its count. A kind
 *  no source of the day belongs to is left out, so the filter never offers an empty choice. */
export function sourceGroupCounts(ids: readonly string[]): SourceGroupCount[] {
  return SOURCE_GROUPS.map((g) => ({
    key: g.key,
    label: g.label,
    n: ids.filter((id) => sourceGroup(id) === g.key).length,
  })).filter((g) => g.n > 0)
}
