/** Invoked Past — data contract for src/data/invoked/*.json (pipeline: pipelines/invoked/refresh.py).
 *  Every field the page renders is declared here; a field the record may omit on a failed
 *  fetch is optional here, so the failure branch type-checks instead of being assumed away. */

export interface InvokedCountry {
  fips: string
  name: string
  mentions: number
}

export interface InvokedYear {
  year: number
  mentions: number
}

export interface InvokedExactDate {
  date: string
  mentions: number
}

/** A GDELT theme code carried by the articles that invoked the standout year, ranked by
 *  lift rather than by frequency: `share` is the code's share of the invoking articles,
 *  `lift` is that share divided by the code's share across the whole day. The raw `code`
 *  is what the page must keep visible — it is the part a reader can check against GDELT. */
export interface InvokedWhyTheme {
  code: string
  articles: number
  /** fraction of the invoking articles carrying the code */
  share: number
  /** how many times more common the code is here than across the day */
  lift: number
}

/** A person or organisation as GDELT's extractor listed it — lowercased, untidied, and
 *  published that way: the extractor's misses are part of the measurement. */
export interface InvokedWhyName {
  name: string
  articles: number
}

/** One of the invoking articles, quoted rather than summarised. */
export interface InvokedWhyHeadline {
  domain: string
  title: string
  url: string
}

/** Arithmetic, not a lookup: the year's most-invoked exact date against the record's own
 *  date. `matches_today` compares the two month-day pairs and nothing else. */
export interface InvokedAnniversary {
  date: string
  mentions: number
  matches_today: boolean
  /** the record's own day, so the comparison is checkable from the file alone */
  today: string
}

/** Why the standout year stands out — evidence from the same GKG rows the count came from.
 *  Present since method v1.1 (2026-08-15) whenever a headline is; day files written before
 *  that carry a headline without it, which is why it is optional here. */
export interface InvokedWhy {
  /** articles that invoked the standout year (fewer than its mentions: one article can
   *  carry several distinct dates in the same year) */
  articles: number
  top_exact_dates: InvokedExactDate[]
  anniversary: InvokedAnniversary | null
  themes: InvokedWhyTheme[]
  persons: InvokedWhyName[]
  organisations: InvokedWhyName[]
  headlines: InvokedWhyHeadline[]
}

/** The day's finding: the year that most exceeds the median of the years around it.
 *  Not the most-invoked year — that one is the inherited 2014 ceiling. */
export interface InvokedHeadline {
  year: number
  mentions: number
  per_1000_articles: number
  neighbourhood_median: number
  times_its_neighbourhood: number
  /** excess over the neighbourhood baseline in units of its square root (Poisson-style) */
  surprise: number
  /** share of the country-mapped mentions carried by the single largest country, or null
   *  when none of the year's mentions could be mapped to a country at all */
  top_country_share: number | null
  invoked_by: InvokedCountry[]
  /** the evidence for the finding, since v1.1 */
  why?: InvokedWhy
}

/** The raw maximum. An artefact of the extractor's ceiling, published as one. */
export interface InvokedMost {
  year: number
  mentions: number
  per_1000_articles: number
}

export interface InvokedTopYear {
  year: number
  mentions: number
  per_1000_articles: number
  share: number
  invoked_by: InvokedCountry[]
}

export interface InvokedAgeBucket {
  from: number
  /** null = open-ended top bucket (201+ years) */
  to: number | null
  mentions: number
  share: number
}

export interface InvokedTrackedEvents {
  founded: string
  founding_day_excluded: boolean
  events: { date: string; mentions: number; age_years: number }[]
}

/** The decay law is the test hypothesis, and the record says what the test still lacks.
 *  A real state, never a placeholder: `reason` is written by the pipeline for the day it
 *  describes, and the failed-fetch branch carries only status + reason. */
export interface InvokedLawTest {
  status: string
  reason: string
  hypothesis?: string
  register_days_needed?: number
  register_days_have?: number
  first_possible?: string | null
  valid_days_so_far?: number
}

export interface InvokedMethod {
  version: string
  since: string
  field: string
  resolution_codes: Record<string, string>
  rules: {
    a_year_window: string
    b_self_reference: string
    c_per_article_dedup: string
    d_stoplist: string
  }
  stoplist_years: number[]
  year_window: [number, string]
  register_size: number
  register_min_days: number
  standout: string
  inherited_ceiling: string
  /** what the evidence beside the standout is, and what it still refuses to do (v1.1) */
  why?: string
  stream: string
}

export interface InvokedStats {
  mentions_raw: number
  articles_scanned: number
  articles_with_dates: number
  articles_with_dates_share: number
  articles_country_mapped: number
  mentions_kept: number
  mentions_removed: Record<string, number>
  resolutions: Record<string, number>
  /** the 2014 wall, re-measured every night rather than assumed */
  max_year_observed: number
  slots_expected: number
  slots_fetched: number
  slots_missing: string[]
  window: string
}

export interface InvokedData {
  generated_at: string
  date: string
  method: InvokedMethod
  headline: InvokedHeadline | null
  most_invoked: InvokedMost | null
  years: InvokedYear[]
  top_years: InvokedTopYear[]
  age_profile: InvokedAgeBucket[]
  exact_dates_top: InvokedExactDate[]
  tracked_events: InvokedTrackedEvents | null
  law_test: InvokedLawTest
  stats: InvokedStats
  source: { name: string; url: string; license: string; retrieved_utc: string }
  /** present only when the day is a disclosed gap */
  note?: string
}
