// scripts/study/check.ts — the house reads every new version of a study before it may ask (2026-10-28).
// Usage: GEMINI_API_KEY=… tsx scripts/study/check.ts
//
// Reads the manifests beside the mirrored works (public/), the committed checks and stops, and asks the
// house's check (src/lib/study/check.ts) about every readable study whose exact file it has not read
// yet, at most MAX_PER_RUN a run. Each verdict is added to src/data/studies/checks.json; the workflow
// (.github/workflows/study-check.yml) commits it, and the deploy that commit starts opens a study that
// passed. A stopped study is not read, and neither is one whose last day has passed.
//
// Fail-closed: without a key nothing is checked, and an unreachable gate or an unreadable verdict adds
// nothing; the study waits for the next run. A refused version is never read again: the practice
// changes its file, and the new version is a new check.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { CHECK_MODEL, promptDigest, runStudyCheck } from '../../src/lib/study/check'
import { CHECKS_CONTRACT, CHECKS_FILE, findStudies, readChecks, readStops, resolveStudies, type Check } from '../../src/lib/study/registry'

/** A bound on one run's calls, whatever the mirrors bring. */
const MAX_PER_RUN = 12

const root = process.cwd()
const today = new Date().toISOString().slice(0, 10)
const checks = readChecks(root)
const resolved = resolveStudies(findStudies(join(root, 'public'), root), checks, readStops(root), today)
const waiting = resolved.filter((s) => s.state === 'unchecked' && s.manifest)
if (!waiting.length) {
  console.log('[study] no study waits for the check')
  process.exit(0)
}
const key = process.env.GEMINI_API_KEY ?? ''
if (!key) {
  console.log(`[study] ${waiting.length} study(ies) wait for the check, but no GEMINI_API_KEY is set; nothing was checked`)
  process.exit(0)
}

const added: Check[] = []
for (const s of waiting.slice(0, MAX_PER_RUN)) {
  const m = s.manifest!
  const v = await runStudyCheck(fetch, key, { practice: s.practice, work: s.work, manifest: m })
  if (v.verdict === 'invalid') {
    console.log(`[study] ${m.id}: the check gave no readable verdict; it waits for the next run`)
    continue
  }
  const base = { id: m.id, work: s.work, sha256: s.sha256, checked: today, model: CHECK_MODEL, prompt: promptDigest() }
  added.push(v.verdict === 'pass' ? { ...base, verdict: 'pass' } : { ...base, verdict: 'block', reason: v.reason, question: v.question })
  console.log(`[study] ${m.id}: ${v.verdict === 'pass' ? 'passed' : `refused (${v.reason}${v.question === null ? '' : `, question ${v.question}`})`}`)
}
if (waiting.length > MAX_PER_RUN) console.log(`[study] ${waiting.length - MAX_PER_RUN} more wait for the next run`)
if (added.length) {
  const all = [...checks, ...added].sort((x, y) => x.id.localeCompare(y.id) || x.checked.localeCompare(y.checked))
  writeFileSync(join(root, CHECKS_FILE), `${JSON.stringify({ $contract: CHECKS_CONTRACT, checks: all }, null, 2)}\n`)
}
