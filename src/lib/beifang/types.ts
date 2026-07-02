/** Spiegel von src/content/beifang/<jahr>/<datum>.json (Schema v1, Pipeline beifang). */

export interface BeifangBlocked {
  type: string
  marker: string | null
}

export interface BeifangLeak {
  token: string
  signal: string
  form: string
  kanal: string
  host: string
  firma: string | null
  beweis: string
}

export interface BeifangSiteResult {
  panel_id: string
  url: string
  final_url: string | null
  final_domain: string | null
  group: 'verlag' | 'kontrolle'
  publisher: string
  http_status: number | null
  blocked: BeifangBlocked | null
  note: string | null
  requests_total: number | null
  third_party_hosts: number | null
  third_party_requests: number | null
  third_party_bytes: number | null
  tracker_hosts: string[] | null
  entities: string[] | null
  cookies_first_party: number | null
  cookies_third_party: number | null
  retrieved_at: string
  leaks?: BeifangLeak[] | null
  leak_firmen?: string[] | null
  doi_leak?: boolean | null
}

export interface BeifangVantage {
  status: 'ok' | 'ausstehend' | 'entfallen'
  note: string | null
  results: BeifangSiteResult[] | null
}

export interface BeifangBefund {
  kind: 'baseline' | 'blockade_neu' | 'entity_neu' | 'median_delta' | 'unveraendert'
  params: Record<string, unknown>
}

export interface BeifangRun {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  panel_version: string
  runner: string
  vantage?: string
  lists: Record<string, { source_url: string; retrieved_at: string; sha256: string }>
  vantages: Record<string, BeifangVantage>
  befund: BeifangBefund
}

export const PUBLISHER_LABELS: Record<string, string> = {
  elsevier: 'Elsevier',
  'springer-nature': 'Springer Nature',
  wiley: 'Wiley',
  'taylor-francis': 'Taylor & Francis',
  sage: 'SAGE',
}
