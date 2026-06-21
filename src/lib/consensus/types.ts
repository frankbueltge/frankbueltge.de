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
export interface ConsensusStory {
  phrase: string
  sample_title: string
  domain_count: number
  mastheads: string[]
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
  echo_index: number
  soft_echo_index?: number
  headline: ConsensusStory | null
  runner_up: ConsensusStory | null
  stats: {
    articles_scanned: number
    domains_scanned: number
    beats: string[]
    per_beat: Record<string, number>
    shingle_n: number
    min_domains: number
  }
  source: { name: string; url: string; license: string; retrieved: string }
}
