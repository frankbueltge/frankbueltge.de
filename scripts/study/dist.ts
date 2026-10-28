// scripts/study/dist.ts — the studies' registry, written into the built site (2026-10-27).
// Runs as the last step of `npm run build`, after the publication rule has pruned dist/, so only a
// study beside a work the site actually publishes can be found. Writes dist/study/studies.json: every
// readable study with its state today, and the manifest of each open one — what the endpoints and the
// consent frame read. Since 2026-10-28 a study is open when the house's check passed exactly its file
// (src/lib/study/check.ts) and nobody has stopped it. Like the reception's step it never fails the
// build: every practice's integrate runs this build as its gate, and a registry that cannot be written
// leaves the endpoints in declared standby, the fail-closed answer.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { findStudies, readChecks, readStops, REGISTRY_FILE, registryOf, resolveStudies } from '../../src/lib/study/registry'

const root = process.cwd()
const dist = join(root, 'dist')
const today = new Date().toISOString().slice(0, 10)
try {
  const checks = readChecks(root)
  const resolved = resolveStudies(findStudies(dist, root), checks, readStops(root), today)
  mkdirSync(join(dist, 'study'), { recursive: true })
  const registry = registryOf(resolved, checks)
  writeFileSync(join(dist, REGISTRY_FILE), `${JSON.stringify(registry)}\n`)
  const by = (state: string) => resolved.filter((s) => s.state === state).length
  console.log(`[study] ${registry.known.length} known, ${by('open')} open; ${by('unchecked')} wait for the check; ${by('refused')} refused; ${by('stopped')} stopped; ${by('invalid')} invalid`)
} catch (error) {
  console.log(`[study] no registry written (${(error as Error).message}); the study endpoints stay in standby`)
}
