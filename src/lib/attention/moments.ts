// The consuming half of stage-moments/1 (docs/design/2026-08-09-stage-moments-contract.md):
// the practice offers real, dated events to its shared stage at /machine-attention; this
// module gates the contract and hands the page a clean, newest-first list. A version the
// consumer does not know is refused, not guessed at — the page then shows its honest quiet
// state instead of stale drama.

export const MOMENTS_CONTRACT = 'stage-moments/1'

export type StageMoment = {
  project: string
  occurred_at: string
  mode: string
  statement: string
  subject: string
  enter: string
  evidence: string
}

const REQUIRED: (keyof StageMoment)[] = [
  'project',
  'occurred_at',
  'mode',
  'statement',
  'subject',
  'enter',
]

function isMoment(value: unknown): value is StageMoment {
  if (typeof value !== 'object' || value === null) return false
  const record = value as Record<string, unknown>
  return REQUIRED.every((key) => typeof record[key] === 'string' && record[key] !== '')
}

/** Parse the mirrored moments file. Returns [] for anything but a well-formed
 *  stage-moments/1 payload — an absent or unknown file is a stated quiet state,
 *  never an error and never a guess. */
export function readMoments(file: unknown): StageMoment[] {
  if (typeof file !== 'object' || file === null) return []
  const payload = file as { $contract?: unknown; moments?: unknown }
  if (payload.$contract !== MOMENTS_CONTRACT) return []
  if (!Array.isArray(payload.moments)) return []
  return payload.moments
    .filter(isMoment)
    .sort((a, b) => (a.occurred_at < b.occurred_at ? 1 : a.occurred_at > b.occurred_at ? -1 : 0))
}
