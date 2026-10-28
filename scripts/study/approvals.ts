// scripts/study/approvals.ts — what the approval workflow asks the architect (2026-10-27).
// Usage: tsx scripts/study/approvals.ts --out <dir> --commit <sha>
//
// Reads the manifests beside the mirrored works (public/), the approvals the architect has merged
// (src/data/studies/approved.json), and writes one folder per study that waits for him:
//   <out>/<n>/branch.txt    study/approve-<id>-<sha256>, the file's full hash
//   <out>/<n>/study.txt     the study's id
//   <out>/<n>/sha.txt       the file's SHA-256
//   <out>/<n>/work.txt      the work, `<practice>:<slug>`
//   <out>/<n>/title.txt     the pull request's title: the study's id, nothing a practice wrote freely
//   <out>/<n>/body.md       what the reader will be shown and asked, with the file pinned to <commit>
//   <out>/<n>/approved.json the approvals file with this study approved
// and <out>/branches.txt, every branch that should have an open request; the workflow closes the rest
// as superseded. The workflow (.github/workflows/study-approval.yml) opens or refreshes a pull request
// from each folder. Merging it is the approval, and only the architect merges it.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { APPROVALS_CONTRACT, APPROVALS_FILE, findStudies, readApprovals, resolveStudies, type ApprovalsFile } from '../../src/lib/study/registry'
import { approvalBranch, approvalRequest, withApproval } from '../../src/lib/study/proposals'

const arg = (name: string, fallback: string): string => {
  const i = process.argv.indexOf(`--${name}`)
  return i > 0 && process.argv[i + 1] ? process.argv[i + 1]! : fallback
}
const out = arg('out', '/tmp/study-approvals')
const commit = arg('commit', 'main')
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
  const { title, body } = approvalRequest(s, commit)
  writeFileSync(join(dir, 'branch.txt'), approvalBranch(s.manifest!.id, s.sha256))
  writeFileSync(join(dir, 'study.txt'), s.manifest!.id)
  writeFileSync(join(dir, 'sha.txt'), s.sha256)
  writeFileSync(join(dir, 'work.txt'), s.work)
  writeFileSync(join(dir, 'title.txt'), title)
  writeFileSync(join(dir, 'body.md'), `${body}\n`)
  writeFileSync(join(dir, 'approved.json'), `${JSON.stringify(withApproval(file, s, today), null, 2)}\n`)
})
writeFileSync(join(out, 'branches.txt'), waiting.map((s) => `${approvalBranch(s.manifest!.id, s.sha256)}\n`).join(''))
const invalid = resolved.filter((s) => s.state === 'invalid')
console.log(`[study] ${waiting.length} study(ies) wait for approval; ${invalid.length} invalid manifest(s), reported to their practices`)
