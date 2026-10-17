// @ts-check
// scripts/engines/trim-mirror.mjs — trims a practice's mirror in public/ to what the site publishes
// or the build reads (2026-10-17).
//
// Run by the integrate workflows right after they have copied a practice's repository into
// public/, before the check, test and build that gate the commit:
//
//     npx tsx scripts/engines/trim-mirror.mjs field
//     npx tsx scripts/engines/trim-mirror.mjs --dry-run n-1 error-as-method
//
// Why: since the publication rule of the same day the site serves only a practice's finished works
// and cycle presentations, but the integrates went on copying everything, so the session artifacts,
// the windows' data and the scripts beside the works piled up in this repository at several hundred
// files a day while no page, count or score read them. The rule is the one the build applies to
// dist/ (src/lib/engines/publication.mjs, applied by publication-prune.mjs); the only addition is
// BUILD_READS there, the files a loader opens although the site does not publish them, which stay.
//
// It cannot take an integrate down on its own account: a fault here is logged and the mirror is
// left as copied, because the gate behind it would otherwise turn red for a defect that is the
// house's, and send the practice a letter about it. The next run trims what this one did not.
import { appendFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { MIRRORS, isReadByBuild } from '../../src/lib/engines/publication.mjs'
import { prunePublication } from '../../src/lib/engines/publication-prune.mjs'

const args = process.argv.slice(2)
const dryRun = args.includes('--dry-run')
const only = args.filter((a) => !a.startsWith('--'))
const unknown = only.filter((p) => !Object.hasOwn(MIRRORS, p))
if (only.length === 0 || unknown.length > 0 || args.some((a) => a.startsWith('--') && a !== '--dry-run')) {
  console.error(`usage: trim-mirror.mjs [--dry-run] <${Object.keys(MIRRORS).join(' | ')}>...${unknown.length ? `  (unknown: ${unknown.join(', ')})` : ''}`)
  process.exit(2)
}

const mb = (/** @type {number} */ bytes) => `${(bytes / 1024 / 1024).toFixed(1)} MB`

try {
  const root = resolve(process.cwd())
  const publicDir = join(root, 'public')
  const result = prunePublication({ dist: publicDir, publicDir, root, only, keep: isReadByBuild, redirects: false, dryRun })
  const lines = Object.entries(result.practices).map(
    ([practice, t]) => `${practice}: ${t.kept} kept, ${t.removed} ${dryRun ? 'would be trimmed' : 'trimmed'}`,
  )
  console.log(`mirror trim${dryRun ? ' (dry run)' : ''}: ${lines.join(' · ') || 'nothing mirrored'} — ${result.removed.length} files, ${mb(result.removedBytes)}`)
  for (const warning of result.warnings) console.warn(`::warning::${warning}`)
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `- **mirror trim${dryRun ? ' (dry run)' : ''}** (${only.join(', ')}): ${result.removed.length} files, ${mb(result.removedBytes)} left out of the repository\n`,
    )
  }
} catch (error) {
  console.warn(`::warning::the mirror was not trimmed (${error instanceof Error ? error.message : String(error)}); it stays as copied and the next run trims it`)
}
