// The consuming half of attention-export/1 for the practice's own two pages, /machine-attention
// and /machine-attention/about (docs/design/2026-08-09-attention-export-contract.md). It gates
// the contract and answers what the pages ask of the export since 2026-10-18: what runs now,
// how recently the practice moved, and what its autonomy protocol records about cost. A version
// this consumer does not know is refused, not guessed at; the pages then say the file is missing.
//
// The entrance had shown "What it last saw · 2026-10-04" for two weeks while the practice
// committed every day: its stage moments come only from projects admitted to the stage, and
// since The Foreknown was retired none is. The present is read from here instead, never from
// the moments, so the admission gate stays where the practice put it.

export const EXPORT_CONTRACT = 'attention-export/1'

export type AttentionProject = {
  id: string
  title: string
  since: string
  site_route: string | null
  status: string
}

export type AttentionFigure = { key: string; value: number; as_of: string }

export type AttentionExport = {
  commit: string | null
  projects: AttentionProject[]
  figures: AttentionFigure[]
}

const DAY = /^\d{4}-\d{2}-\d{2}$/

const text = (value: unknown): string | null =>
  typeof value === 'string' && value !== '' ? value : null

function project(value: unknown): AttentionProject | null {
  if (typeof value !== 'object' || value === null) return null
  const p = value as Record<string, unknown>
  const id = text(p.id)
  const title = text(p.title)
  const since = text(p.since)
  const status = text(p.status)
  if (!id || !title || !since || !status) return null
  return { id, title, since, status, site_route: text(p.site_route) }
}

function figure(value: unknown): AttentionFigure | null {
  if (typeof value !== 'object' || value === null) return null
  const f = value as Record<string, unknown>
  const key = text(f.key)
  const asOf = text(f.as_of)
  if (!key || !asOf || !DAY.test(asOf) || typeof f.value !== 'number') return null
  return { key, value: f.value, as_of: asOf }
}

/** Parse the mirrored export. Returns null for anything but an attention-export/1 payload;
 *  malformed rows are dropped, never repaired. */
export function readExport(file: unknown): AttentionExport | null {
  if (typeof file !== 'object' || file === null) return null
  const payload = file as Record<string, unknown>
  if (payload.$contract !== EXPORT_CONTRACT) return null
  const from = payload.generated_from as Record<string, unknown> | undefined
  const list = (value: unknown): unknown[] => (Array.isArray(value) ? value : [])
  return {
    commit: text(from?.commit),
    projects: list(payload.projects).flatMap((p) => project(p) ?? []),
    figures: list(payload.figures).flatMap((f) => figure(f) ?? []),
  }
}

export const figureOf = (exp: AttentionExport, key: string): AttentionFigure | undefined =>
  exp.figures.find((f) => f.key === key)

/** How far along the admission path a status word stands (docs: EXPOSÉ → AUDIT → V0 →
 *  E-EXPERIMENT → RUNNING). A word this consumer does not know sorts last and is shown as is. */
const STANDING: Record<string, number> = { running: 0, instrument: 1, 'e-experiment': 2, v0: 3 }

/** What runs now: every project not retired, the furthest along the admission path first, then
 *  the longest-running. Names, words and routes only; no figure of a project travels with it,
 *  because the projects without a stage may not have one on the site (The Interval's criterion
 *  C, Memory Hole's and Planetary Listening's audits). */
export function runningNow(exp: AttentionExport): AttentionProject[] {
  const standing = (p: AttentionProject) => STANDING[p.status] ?? Object.keys(STANDING).length
  return exp.projects
    .filter((p) => p.status !== 'retired')
    .sort((a, b) => standing(a) - standing(b) || a.since.localeCompare(b.since) || a.title.localeCompare(b.title))
}

/** The day of the newest step on the practice's autonomy protocol: the practice's own clock,
 *  which moves whether or not a project holds the stage. Null when the export does not carry it. */
export const lastStep = (exp: AttentionExport): string | null => figureOf(exp, 'protocol_steps')?.as_of ?? null

export type CostRecord = { modelSteps: number; withTokens: number; withCost: number; asOf: string }

/** What the protocol records about cost: how many model steps there are, how many of them carry
 *  a token count, how many a cost. Null unless all three are exported. */
export function costRecord(exp: AttentionExport): CostRecord | null {
  const steps = figureOf(exp, 'protocol_model_steps')
  const tokens = figureOf(exp, 'protocol_model_steps_with_tokens')
  const cost = figureOf(exp, 'protocol_model_steps_with_cost')
  if (!steps || !tokens || !cost) return null
  return { modelSteps: steps.value, withTokens: tokens.value, withCost: cost.value, asOf: steps.as_of }
}
