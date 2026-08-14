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

/** What the pipeline could not verify — counted and disclosed, never diffed.
 *  Written since schema v2 (2026-08-15); days committed before that lack it. */
export interface Unverifiable {
  count: number
  reasons: Record<string, number>
  items: {
    url: string
    institution: string
    label: string
    /** which version failed: the archived 'before'/'after' capture, or the 'live' recheck */
    side: string
    reason: string
    detail: string
    wayback_ts: string | null
  }[]
}

export interface RedactionData {
  date: string
  generated_at: string
  schema_version: string
  pipeline_version: string
  salience_version: string
  validity_version?: string
  watched_count: number
  changed_count: number
  unverifiable?: Unverifiable
  removed_tokens_total: number
  pick: string | null
  redactions: Redaction[]
  source: { name: string; url: string; license: string }
}
