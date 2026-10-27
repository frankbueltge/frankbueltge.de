// scripts/study/dist.ts — the studies' registry, written into the built site (2026-10-27).
// Runs as the last step of `npm run build`, after the publication rule has pruned dist/, so only a
// study beside a work the site actually publishes can be found. Writes dist/study/studies.json (every
// approval with its state today, the manifest of each approved one — what the endpoints and the
// consent frame read) and dist/study/proposed.json (what waits for the architect, and what is invalid,
// with its problems). Like the reception's step it never fails the build: every practice's integrate
// runs this build as its gate, and a registry that cannot be written leaves the endpoints in declared
// standby, the fail-closed answer.
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { findStudies, readApprovals, REGISTRY_FILE, registryOf, resolveStudies } from '../../src/lib/study/registry'
import { proposalsOf } from '../../src/lib/study/proposals'

const root = process.cwd()
const dist = join(root, 'dist')
const today = new Date().toISOString().slice(0, 10)
try {
  const approvals = readApprovals(root)
  const resolved = resolveStudies(findStudies(dist, root), approvals, today)
  mkdirSync(join(dist, 'study'), { recursive: true })
  const registry = registryOf(resolved, approvals)
  writeFileSync(join(dist, REGISTRY_FILE), `${JSON.stringify(registry)}\n`)
  writeFileSync(join(dist, 'study/proposed.json'), `${JSON.stringify({ schema: 1, proposed: proposalsOf(resolved) })}\n`)
  const by = (state: string) => resolved.filter((s) => s.state === state).length
  console.log(`[study] ${registry.known.length} approval(s), ${by('approved')} open; ${by('proposed') + by('changed')} waiting; ${by('invalid')} invalid`)
} catch (error) {
  console.log(`[study] no registry written (${(error as Error).message}); the study endpoints stay in standby`)
}
