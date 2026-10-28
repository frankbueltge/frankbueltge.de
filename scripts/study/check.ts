// scripts/study/check.ts — the house reads every new version of a study before it may ask (2026-10-28).
// Usage: GEMINI_API_KEY=… tsx scripts/study/check.ts
//
// Reads the manifests beside the mirrored works (public/), the committed checks and stops, and asks the
// house's check (src/lib/study/check.ts) about every readable study whose exact file has no verdict
// yet, at most DAILY_MAX verdicts a UTC day, in random order and PAUSE_MS apart. Each verdict is added to
// src/data/studies/checks.json; the workflow (.github/workflows/study-check.yml) commits it and starts
// the deploy, which opens a study that passed. A stopped study is not read, and neither is one whose
// last day has passed.
//
// Fail-closed: without a key nothing is checked, and an unreachable gate or an unreadable verdict adds
// nothing; the study waits for the next run. A refused version is never read again: the practice
// changes its file, and the new version is a new check.
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { checkStudies, runStudyCheck } from '../../src/lib/study/check'
import { CHECKS_CONTRACT, CHECKS_FILE, findStudies, readChecks, readStops, resolveStudies } from '../../src/lib/study/registry'

/** At most this many verdicts a UTC day, and a pause between two calls. The model's free tier gives
 *  this project 20 calls a day (GenerateRequestsPerDayPerProjectPerModel-FreeTier, read on
 *  2026-10-28), and the seed and the reception's notes share them: the check takes at most a quarter. */
const DAILY_MAX = 5
const PAUSE_MS = 8000

const root = process.cwd()
const today = new Date().toISOString().slice(0, 10)
const checks = readChecks(root)
const resolved = resolveStudies(findStudies(join(root, 'public'), root), checks, readStops(root), today)
const waiting = resolved.filter((s) => s.state === 'unchecked' && s.manifest).map((s) => ({ practice: s.practice, work: s.work, manifest: s.manifest!, sha256: s.sha256 }))
if (!waiting.length) {
  console.log('[study] no study waits for the check')
  process.exit(0)
}
const budget = DAILY_MAX - checks.filter((c) => c.checked === today).length
if (budget <= 0) {
  console.log(`[study] ${waiting.length} study(ies) wait for the check; today's ${DAILY_MAX} verdicts are given, so they wait for tomorrow`)
  process.exit(0)
}
const key = process.env.GEMINI_API_KEY ?? ''
if (!key) {
  console.log(`[study] ${waiting.length} study(ies) wait for the check, but no GEMINI_API_KEY is set; nothing was checked`)
  process.exit(0)
}

const { added, unanswered, left } = await checkStudies(waiting, (s) => runStudyCheck(fetch, key, s), { today, max: budget, pause: PAUSE_MS })
for (const c of added) console.log(`[study] ${c.id}: ${c.verdict === 'pass' ? 'passed' : `refused (${c.reason}${c.question === null || c.question === undefined ? '' : `, question ${c.question}`})`}`)
for (const id of unanswered) console.log(`[study] ${id}: the check gave no verdict; it waits for the next run`)
if (left) console.log(`[study] ${left} more wait for the next run`)
if (added.length) {
  const all = [...checks, ...added].sort((x, y) => x.id.localeCompare(y.id) || x.checked.localeCompare(y.checked))
  writeFileSync(join(root, CHECKS_FILE), `${JSON.stringify({ $contract: CHECKS_CONTRACT, checks: all }, null, 2)}\n`)
}
