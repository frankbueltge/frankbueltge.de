// Reads the mirrored n-1 record (n1-record/1, written by scripts/n1/mirror.mjs)
// into the view the /n-1 page renders. Read, never typed: every string on the
// page comes from the practice's committed record; an absent or malformed
// record is a legal state the page shows as such, never a crash.

export type N1Layer = {
  id: string
  note: string
  executedBy: string
  nodes: number
  edges: number
}

export type N1Doc = { file: string; title: string; url: string }

export type N1View = {
  ok: boolean
  commit: string | null
  committed: string | null
  totals: { layers: number; nodes: number; edges: number }
  foundingProblem: string | null
  layers: N1Layer[]
  nights: N1Doc[]
  reading: N1Doc[]
}

const REPO = 'https://github.com/frankbueltge/n-1'

const EMPTY: N1View = {
  ok: false,
  commit: null,
  committed: null,
  totals: { layers: 0, nodes: 0, edges: 0 },
  foundingProblem: null,
  layers: [],
  nights: [],
  reading: [],
}

const str = (v: unknown): string => (typeof v === 'string' ? v : '')

export function readN1Record(raw: unknown): N1View {
  const record = raw as {
    $contract?: unknown
    source?: { commit?: unknown; committed?: unknown }
    atlas?: unknown
    documents?: { nights?: unknown; reading?: unknown }
  } | null
  if (!record || record.$contract !== 'n1-record/1' || !Array.isArray(record.atlas)) return EMPTY

  const layers: N1Layer[] = record.atlas.map((l) => {
    const layer = l as {
      layer?: unknown
      session?: { note?: unknown; executed_by?: unknown }
      nodes?: unknown
      edges?: unknown
    }
    return {
      id: str(layer.layer),
      note: str(layer.session?.note),
      executedBy: str(layer.session?.executed_by),
      nodes: Array.isArray(layer.nodes) ? layer.nodes.length : 0,
      edges: Array.isArray(layer.edges) ? layer.edges.length : 0,
    }
  })

  // The practice's first constructed problem, quoted from the record — the
  // earliest node of type "problem" in layer order. Null when none exists yet.
  let foundingProblem: string | null = null
  for (const l of record.atlas) {
    const nodes = (l as { nodes?: unknown }).nodes
    if (!Array.isArray(nodes)) continue
    const problem = nodes.find((n) => (n as { type?: unknown }).type === 'problem')
    if (problem) {
      foundingProblem = str((problem as { label?: unknown }).label) || null
      break
    }
  }

  const docs = (list: unknown): N1Doc[] =>
    Array.isArray(list)
      ? list
          .map((d) => {
            const doc = d as { file?: unknown; title?: unknown }
            return {
              file: str(doc.file),
              title: str(doc.title) || str(doc.file),
              url: `${REPO}/blob/main/${str(doc.file)}`,
            }
          })
          .filter((d) => d.file !== '')
      : []

  return {
    ok: true,
    commit: str(record.source?.commit) || null,
    committed: str(record.source?.committed) || null,
    totals: {
      layers: layers.length,
      nodes: layers.reduce((sum, l) => sum + l.nodes, 0),
      edges: layers.reduce((sum, l) => sum + l.edges, 0),
    },
    foundingProblem,
    layers,
    nights: docs(record.documents?.nights),
    reading: docs(record.documents?.reading),
  }
}
