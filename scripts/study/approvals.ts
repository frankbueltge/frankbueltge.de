// scripts/study/approvals.ts — what the approval workflow asks the architect (2026-10-27).
// Usage: tsx scripts/study/approvals.ts --out <dir>
//
// Reads the manifests beside the mirrored works (public/), the approvals the architect has merged
// (src/data/studies/approved.json), and writes one folder per study that waits for him:
//   <out>/<n>/branch.txt    study/approve-<id>-<sha8>
//   <out>/<n>/title.txt     the pull request's title
//   <out>/<n>/body.md       what the reader will be shown and asked
//   <out>/<n>/approved.json the approvals file with this study approved
//   <out>/<n>/study.txt     the study's id, to close the pull requests an older version opened
// The workflow (.github/workflows/study-approval.yml) opens a pull request from each folder that has
// none yet. Merging it is the approval, and only the architect merges it.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { APPROVALS_CONTRACT, APPROVALS_FILE, findStudies, readApprovals, resolveStudies, type ApprovalsFile } from '../../src/lib/study/registry'
import { approvalBranch, approvalRequest, withApproval } from '../../src/lib/study/proposals'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const out = arg('out', '/tmp/study-approvals')
const root = process.cwd()
const today = new Date().toISOString().slice(0, 10)

let file: ApprovalsFile
try {
  file = JSON.parse(readFileSync(join(root, APPROVALS_FILE), 'utf8')) as ApprovalsFile
} catch {
  file = { $contract: APPROVALS_CONTRACT, approvals: [] }
}
const resolved = resolveStudies(findStudies(join(root, 'public'), root), readApprovals(root), today)
const waiting = resolved.filter((s) => (s.state === 'proposed' || s.state === 'changed') && s.manifest)
mkdirSync(out, { recursive: true })
waiting.forEach((s, i) => {
  const dir = join(out, String(i + 1))
  mkdirSync(dir, { recursive: true })
  const { title, body } = approvalRequest(s)
  writeFileSync(join(dir, 'branch.txt'), approvalBranch(s.manifest!.id, s.sha256))
  writeFileSync(join(dir, 'study.txt'), s.manifest!.id)
  writeFileSync(join(dir, 'title.txt'), title)
  writeFileSync(join(dir, 'body.md'), `${body}\n`)
  writeFileSync(join(dir, 'approved.json'), `${JSON.stringify(withApproval(file, s, today), null, 2)}\n`)
})
const invalid = resolved.filter((s) => s.state === 'invalid')
console.log(`[study] ${waiting.length} study(ies) wait for approval; ${invalid.length} invalid manifest(s), reported to their practices`)
