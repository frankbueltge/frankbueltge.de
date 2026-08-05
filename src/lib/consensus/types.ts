/** Spiegel von src/data/consensus/latest.json (erzeugt von pipelines/consensus/refresh.py). */
export interface CascadeStep {
  at: string
  domain: string
}
export interface Syndication {
  label: string
  top_tld: string
  tld_share: number
  distinct_tlds: number
}
/** One retrievable article per domain — the evidence that the outlet ran the sentence.
 *  Recorded by the pipeline from 2026-08-05 on; earlier committed days lack it. */
export interface EvidenceArticle {
  domain: string
  url: string
  at: string
}
export interface ConsensusStory {
  phrase: string
  sample_title: string
  domain_count: number
  mastheads: string[]
  articles?: EvidenceArticle[]
  article_count: number
  first_domain: string
  first_seen: string
  span_hours: number | null
  cascade: CascadeStep[]
  soft_domain_count?: number
  soft_echo_extra?: number
  syndication?: Syndication
}
export interface ConsensusData {
  generated_at: string
  date: string
  /** Present from v2 (2026-08-06, raw-file pool) on; committed v1 days lack it. */
  method?: { version: string; since: string; soft_pass?: string }
  echo_index: number
  /** v1 only — the paraphrase pass is suspended in v2 (see method.soft_pass). */
  soft_echo_index?: number
  headline: ConsensusStory | null
  runner_up: ConsensusStory | null
  stats: {
    articles_scanned: number
    domains_scanned: number
    /** v1 (DOC-API days): the eight query beats and their per-beat counts. */
    beats?: string[]
    per_beat?: Record<string, number>
    beats_failed?: number
    /** v2 (raw-file days): the 15-minute slot window and its disclosed gaps. */
    slots_expected?: number
    slots_fetched?: number
    slots_missing?: string[]
    window?: string
    shingle_n: number
    min_domains: number
  }
  source: { name: string; url: string; license: string; retrieved: string }
}
