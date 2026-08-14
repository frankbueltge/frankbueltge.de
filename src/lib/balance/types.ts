/** The Balance — data contract for src/data/balance/*.json (pipeline: pipelines/balance/refresh.py). */

export interface BalanceDim {
  self: number
  foreign: number
  gap_ci95: [number, number]
  significant: boolean
}

export interface BalanceCountry {
  fips: string
  name: string
  n_self: number
  n_foreign: number
  dims: Partial<Record<'tone' | 'valence' | 'happiness' | 'anxiety' | 'anger' | 'sadness', BalanceDim>>
}

export interface BalanceHeadline {
  fips: string
  name: string
  n_self: number
  n_foreign: number
  tone_self: number
  tone_foreign: number
  gap: number
  gap_ci95: [number, number]
  direction: 'self_brighter' | 'world_brighter'
}

export interface BalanceData {
  generated_at: string
  date: string
  method: {
    version: string
    since: string
    min_pool: number
    min_words: number
    bootstrap: { resamples: number; subsample_cap: number }
    dimensions: Record<string, { label: string; unit: string; code?: string; source?: string }>
    stream: string
  }
  headline: BalanceHeadline | null
  countries: BalanceCountry[]
  stats: {
    articles_scanned: number
    articles_mapped: number
    mapping_rate: number
    domains_seen: number
    slots_expected: number
    slots_fetched: number
    slots_missing: string[]
    window: string
  }
  source: { name: string; url: string; license: string; retrieved_utc: string }
  note?: string
}
