/** The Invoked Past — data contract for src/data/invoked/*.json (pipeline: pipelines/invoked/refresh.py).
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

export interface InvokedExactDate {
  date: string
  mentions: number
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
