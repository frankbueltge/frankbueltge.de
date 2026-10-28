// src/lib/study/proposals.ts — what waits for the architect, and the pull request that asks him (2026-10-27).
//
// A valid manifest without an approval for its exact bytes is a proposal. The approval workflow
// (.github/workflows/study-approval.yml) opens one pull request per proposal, which adds the approval
// to src/data/studies/approved.json; merging it is the architect's approval, and nobody else's (his
// decision of 2026-10-27, wording private — the merge authority of 2026-08-14 does not reach these).
//
// The pull request shows what the reader will be shown and asked, so he can approve from it alone,
// and nothing a practice wrote can change what he sees there:
//   · every word of the manifest stands inside a code block, where GitHub renders no markup that could
//     hide a question, and makes no link, mention or issue reference;
//   · the title holds only the study's id (lowercase words and hyphens), because a merge commit
//     carries the title into main's history, where a reference would act;
//   · the branch names the file's full SHA-256, so a request can never be moved to another file, and
//     the file's link is pinned to the commit it was read at.
import type { Approval, ApprovalsFile, ResolvedStudy } from './registry'
import { APPROVALS_CONTRACT } from './registry'
import { LIMITS, type Question, type StudyManifest } from './manifest'

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

/** The branch a proposal's pull request comes from: one per study and per exact file. */
export const approvalBranch = (id: string, sha256: string): string => `study/approve-${id}-${sha256}`

/** The approvals file with this proposal approved. An id names one study: its earlier approval,
 *  for this work or another, is replaced. */
export function withApproval(file: ApprovalsFile, s: ResolvedStudy, day: string): ApprovalsFile {
  if (!s.manifest) throw new Error('an invalid manifest cannot be approved')
  const next: Approval = { id: s.manifest.id, work: s.work, sha256: s.sha256, approved: day }
  const rest = file.approvals.filter((a) => a.id !== next.id)
  return { $contract: APPROVALS_CONTRACT, approvals: [...rest, next].sort((a, b) => a.id.localeCompare(b.id)) }
}

const SITE = 'https://frankbueltge.de'
const REPO = 'https://github.com/frankbueltge/frankbueltge.de'
const COMMIT = /^[0-9a-f]{40}$/
const WIDTH = 92
/** GitHub refuses a pull request body over 65,536 characters; past this, the file is shown once. */
const BODY_MAX = 60_000

/** A code fence longer than any run of backticks in the text, so nothing inside can close it. */
export function fenced(text: string, info = ''): string {
  const longest = Math.max(0, ...[...text.matchAll(/`+/g)].map((m) => m[0].length))
  const fence = '`'.repeat(Math.max(3, longest + 1))
  return `${fence}${info}\n${text}\n${fence}`
}

/** A word longer than a line, in pieces that fit. */
const pieces = (word: string, room: number): string[] => {
  const chars = [...word]
  const out: string[] = []
  for (let i = 0; i < chars.length; i += room) out.push(chars.slice(i, i + room).join(''))
  return out
}

/** Plain text in lines of at most `width` characters, every line after the first indented. Every kind
 *  of space breaks a line, and a word too long for one is cut, so no line runs past the code block's
 *  edge, where a reader of the pull request would have to scroll to see it. */
function wrap(text: string, indent: string, width = WIDTH): string {
  const lines: string[] = []
  let line = ''
  const room = Math.max(10, width - indent.length)
  for (const word of text.split(/\s+/u).filter(Boolean).flatMap((w) => pieces(w, room))) {
    if (line && indent.length + line.length + 1 + word.length > width) {
      lines.push(line)
      line = word
    } else line = line ? `${line} ${word}` : word
  }
  if (line) lines.push(line)
  return lines.join(`\n${indent}`)
}

const quoted = (xs: readonly string[]): string => xs.map((x) => `“${x}”`).join(' · ')

function questionText(q: Question, i: number): string {
  const n = `${String(i + 1).padStart(2)}. `
  const pad = ' '.repeat(n.length)
  const line = (kind: string, more?: string) => `${n}${wrap(`${kind} — ${q.prompt}`, pad)}${more ? `\n${pad}${wrap(more, `${pad}  `)}` : ''}`
  switch (q.kind) {
    case 'choice':
      return line('choice', `options: ${quoted(q.options)}`)
    case 'multi':
      return line(`multi${q.max ? `, at most ${q.max}` : ''}`, `options: ${quoted(q.options)}`)
    case 'scale':
      return line(`scale ${q.min} to ${q.max}${q.labels ? ` (${q.labels[0]} … ${q.labels[1]})` : ''}`)
    case 'number':
      return line(`number ${q.min} to ${q.max}${q.unit ? ` ${q.unit}` : ''}`)
    case 'pairwise':
      return line(`pairwise, ${q.pairs} pairs`, `items: ${quoted(q.items.map((it) => it.label))}`)
    case 'order':
      return line('order', `items: ${quoted(q.items.map((it) => it.label))}`)
    case 'text':
      return line(`text, at most ${q.max_length ?? LIMITS.text} characters, through the text gate`)
  }
}

/** What the reader is shown and asked, as plain text for a code block. */
export function studyText(m: StudyManifest): string {
  const field = (label: string, text: string) => `${label.padEnd(10)}${wrap(text, ' '.repeat(10))}`
  return [
    field('Title', m.title),
    field('Question', m.question),
    field('Purpose', `${m.purpose}   [shown to the reader word for word, above the house's consent text]`),
    field('Reading', m.reading),
    field('Closes', m.closes ?? 'not set: it runs until the approval is removed'),
    '',
    'Asked, and each question may be left out:',
    ...m.questions.map(questionText),
  ].join('\n')
}

/** Title and body of the pull request that asks the architect to approve one study, read at `commit`. */
export function approvalRequest(s: ResolvedStudy, commit: string): { title: string; body: string } {
  const m = s.manifest!
  const at = COMMIT.test(commit) ? commit : 'main'
  const changed = s.state === 'changed'
  const title = `Study approval: ${m.id}${changed ? ' (changed)' : ''}`
  const full = (json: boolean) => [
    `**Merging this pull request approves this study, and only the architect merges it** (decision of 2026-10-27; the merge authority does not reach study approvals). Close it to decline.`,
    '',
    `- **Practice:** ${s.practice}`,
    `- **Work:** [${s.work}](${SITE}${s.href})`,
    `- **Study:** \`${m.id}\`${changed ? ' — a changed file of an approved study; until this is merged the study takes no answers' : ''}`,
    `- **File:** [\`public/${s.file}\`](${REPO}/blob/${at}/public/${s.file})${at === 'main' ? '' : ` at \`${at.slice(0, 7)}\``}, SHA-256 \`${s.sha256}\`. A later change to the file needs a new approval.`,
    '',
    '**What the reader is shown and asked**, as the practice wrote it:',
    '',
    fenced(studyText(m), 'text'),
    '',
    ...(json
      ? ['<details><summary>The file as the house reads it</summary>', '', fenced(JSON.stringify(m, null, 2), 'json'), '', '</details>']
      : ['The file is too long to show here a second time; the link above is pinned to the commit it was read at.']),
    '',
    `**What merging does not check: the work's own code.** The house's consent frame is the one path it offers a work for its answers, and the frame shows the reader every answer before it is sent. But the work runs on the site's own origin, so its code could go around the frame; its constitution forbids that, and nothing here can verify it (\`docs/design/2026-10-27-practice-studies.md\`, “What the frame is, and what it is not”).`,
    '',
    'The house keeps the rest fixed for every study: consent in its own frame before the first answer; nothing sent from the frame before its last button; no address, cookie, identifier or timing kept; one answer set per reader and day, and at most three per address and day for each study; release only after the day, in batches of five, without the day, with the version of the questions; CC0; and the record back to the practice every night as material (`docs/design/2026-10-27-practice-studies.md`).',
  ].join('\n')
  const body = full(true)
  return { title, body: body.length <= BODY_MAX ? body : full(false) }
}
