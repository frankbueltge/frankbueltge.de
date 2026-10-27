// src/lib/study/proposals.ts — what waits for the architect, and the pull request that asks him (2026-10-27).
//
// A valid manifest without an approval for its exact bytes is a proposal. The approval workflow
// (.github/workflows/study-approval.yml) opens one pull request per proposal, which adds the approval
// to src/data/studies/approved.json; merging it is the architect's approval, and nobody else's (his
// decision of 2026-10-27, wording private — the merge authority of 2026-08-14 does not reach these).
// The pull request shows what the reader will be shown and asked, so he can approve from it alone.
import type { Approval, ApprovalsFile, ResolvedStudy } from './registry'
import { APPROVALS_CONTRACT } from './registry'
import type { Question } from './manifest'

export interface Proposal {
  id: string | null
  practice: string
  work: string
  href: string
  file: string
  sha256: string
  state: 'proposed' | 'changed' | 'invalid'
  problems: string[]
  title: string | null
}

export function proposalsOf(resolved: readonly ResolvedStudy[]): Proposal[] {
  return resolved
    .filter((s): s is ResolvedStudy & { state: Proposal['state'] } => s.state === 'proposed' || s.state === 'changed' || s.state === 'invalid')
    .map((s) => ({
      id: s.manifest?.id ?? null,
      practice: s.practice,
      work: s.work,
      href: s.href,
      file: s.file,
      sha256: s.sha256,
      state: s.state,
      problems: s.problems,
      title: s.manifest?.title ?? null,
    }))
    .sort((a, b) => a.work.localeCompare(b.work))
}

/** The branch a proposal's pull request comes from: one per study and per version of its file. */
export const approvalBranch = (id: string, sha256: string): string => `study/approve-${id}-${sha256.slice(0, 8)}`

/** The approvals file with this proposal approved: a changed study's old approval is replaced. */
export function withApproval(file: ApprovalsFile, s: ResolvedStudy, day: string): ApprovalsFile {
  if (!s.manifest) throw new Error('an invalid manifest cannot be approved')
  const next: Approval = { id: s.manifest.id, work: s.work, sha256: s.sha256, approved: day }
  const rest = file.approvals.filter((a) => !(a.id === next.id && a.work === next.work))
  return { $contract: APPROVALS_CONTRACT, approvals: [...rest, next].sort((a, b) => a.id.localeCompare(b.id)) }
}

const SITE = 'https://frankbueltge.de'
const REPO = 'https://github.com/frankbueltge/frankbueltge.de'

function questionLine(q: Question, i: number): string {
  const head = `${i + 1}. **${q.prompt}** — _${q.kind}_`
  switch (q.kind) {
    case 'choice':
    case 'multi':
      return `${head}${q.kind === 'multi' && q.max ? `, at most ${q.max}` : ''}: ${q.options.map((o) => `“${o}”`).join(', ')}`
    case 'scale':
      return `${head}: ${q.min} to ${q.max}${q.labels ? ` (${q.labels[0]} … ${q.labels[1]})` : ''}`
    case 'number':
      return `${head}: ${q.min} to ${q.max}${q.unit ? ` ${q.unit}` : ''}`
    case 'pairwise':
      return `${head}: ${q.pairs} pairs from ${q.items.map((it) => `“${it.label}”`).join(', ')}`
    case 'order':
      return `${head}: ${q.items.map((it) => `“${it.label}”`).join(', ')}`
    case 'text':
      return `${head}: free text, at most ${q.max_length ?? 280} characters, through the text gate`
  }
}

/** Title and body of the pull request that asks the architect to approve one study. */
export function approvalRequest(s: ResolvedStudy): { title: string; body: string } {
  const m = s.manifest!
  const title = `Study approval: ${s.practice} asks “${m.title}”${s.state === 'changed' ? ' (changed)' : ''}`
  const body = [
    `**Merging this pull request approves this study, and only the architect merges it** (decision of 2026-10-27; the merge authority does not reach study approvals). Close it to decline.`,
    '',
    `- **Practice:** ${s.practice}`,
    `- **Work:** [${s.work}](${SITE}${s.href})`,
    `- **Study:** \`${m.id}\`${s.state === 'changed' ? ' — a changed file of an approved study; until this is merged the study takes no answers' : ''}`,
    `- **File:** [\`public/${s.file}\`](${REPO}/blob/main/public/${s.file}) — SHA-256 \`${s.sha256}\`. A later change to the file needs a new approval.`,
    m.closes ? `- **Closes:** ${m.closes}` : '- **Closes:** not set (it runs until the approval is removed)',
    '',
    `**The research question:** ${m.question}`,
    '',
    `**Why the work asks — shown to the reader word for word, above the house's consent text:**`,
    `> ${m.purpose}`,
    '',
    `**How the practice will read the answers:** ${m.reading}`,
    '',
    '**What the reader is asked** (each question may be left out):',
    '',
    ...m.questions.map(questionLine),
    '',
    'The house keeps the rest fixed for every study: consent in its own frame before the first answer, nothing sent before the last button, no address, cookie or identifier, one answer set per day and at most three per address, release only after the day in batches of five without the day, CC0, and the record back to the practice every night as material (`docs/design/2026-10-27-practice-studies.md`).',
  ].join('\n')
  return { title, body }
}
