export interface Snapshot {
  wayback_ts: string
  url: string
  status?: string
}

export interface Salience {
  score: number
  signals: string[]
}

export interface Redaction {
  id: string
  url: string
  institution: string
  label: string
  kind: 'deletion' | 'removal'
  before: Snapshot
  after: Snapshot
  removed_passages: string[]
  removed_tokens: number
  salience: Salience
}

export interface RedactionData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  salience_version: string
  watched_count: number
  changed_count: number
  removed_tokens_total: number
  pick: string | null
  redactions: Redaction[]
  source: { name: string; url: string; license: string }
}
