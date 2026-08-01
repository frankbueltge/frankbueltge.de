#!/usr/bin/env node
// scripts/ecology/sync-joint-inquiries.mjs — derive the site's joint-inquiry register from
// the contact zone's fixtures (research-ecology, fixtures/ji-*). Derived, never retyped:
// every field below is read from the fixture's own machine-readable files (inquiry.json,
// commitments/*.commitment.json, positions/*.position.json); nothing is interpreted.
//
// Inclusion rule, honest by construction: an inquiry appears only once at least one Local
// Commitment is transcribed — a parked proposal whose invitations were never sent
// (ji-2026-001) is an internal decision template, not a public record of participation.
//
// Run:  node scripts/ecology/sync-joint-inquiries.mjs --ecology <path-to-research-ecology>
// CI:   ecology-integrate.yml runs this against its fresh /tmp/ecology clone, so the
//       register self-refreshes nightly and after every engine session.

import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { execFileSync } from 'node:child_process'

const args = process.argv.slice(2)
const ecoIdx = args.indexOf('--ecology')
if (ecoIdx === -1 || !args[ecoIdx + 1]) {
  console.error('usage: sync-joint-inquiries.mjs --ecology <path-to-research-ecology>')
  process.exit(2)
}
const ECO = args[ecoIdx + 1]
const OUT = new URL('../../src/data/begegnungen/joint-inquiries.json', import.meta.url).pathname

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
let sourceCommit = null
try {
  sourceCommit = execFileSync('git', ['-C', ECO, 'rev-parse', 'HEAD'], { encoding: 'utf8' }).trim()
} catch {
  /* not a git checkout (e.g. exported tarball) — provenance stays null, honestly */
}

const fixturesDir = join(ECO, 'fixtures')
const out = []
for (const dir of readdirSync(fixturesDir).filter((d) => d.startsWith('ji-')).sort()) {
  const base = join(fixturesDir, dir)
  const inquiryPath = join(base, 'inquiry.json')
  if (!existsSync(inquiryPath)) continue
  const inquiry = readJson(inquiryPath)

  const commitmentsDir = join(base, 'commitments')
  const commitmentFiles = existsSync(commitmentsDir)
    ? readdirSync(commitmentsDir).filter((f) => f.endsWith('.commitment.json'))
    : []
  if (commitmentFiles.length === 0) continue // parked/unanswered proposals stay internal

  const positions = new Map()
  const positionsDir = join(base, 'positions')
  if (existsSync(positionsDir)) {
    for (const f of readdirSync(positionsDir).filter((f) => f.endsWith('.position.json'))) {
      const p = readJson(join(positionsDir, f))
      positions.set(p.practice_id, p)
    }
  }

  const participants = commitmentFiles.map((f) => {
    const c = readJson(join(commitmentsDir, f))
    const p = positions.get(c.practice_id) ?? null
    const firstClaim = p?.claimed_changes?.[0]
    return {
      practice_id: c.practice_id,
      commitment_status: c.status,
      issued_at: c.issued_at?.slice(0, 10) ?? null,
      local_question: c.local_question,
      local_status: p?.local_status ?? null,
      local_status_note: p?.local_status_note ?? null,
      headline_claim: typeof firstClaim === 'object' ? (firstClaim.claim ?? null) : (firstClaim ?? null),
      output_title: p?.local_output_refs?.[0]?.title ?? null,
      output_url: p?.local_output_refs?.[0]?.canonical_uri ?? null,
      source_uri: c.source_uri ?? null,
    }
  })

  out.push({
    inquiry_id: inquiry.id,
    slug: inquiry.slug ?? null,
    title: inquiry.title,
    status: inquiry.status,
    public_summary: inquiry.public_summary ?? null,
    initiated_by: inquiry.initiated_by?.actor_id ?? null,
    coordination_profile: inquiry.coordination_profile ?? null,
    created_at: inquiry.created_at?.slice(0, 10) ?? null,
    updated_at: inquiry.updated_at?.slice(0, 10) ?? null,
    record_url: `https://github.com/frankbueltge/research-ecology/tree/main/fixtures/${dir}`,
    source_commit: sourceCommit,
    participants,
  })
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`joint-inquiries.json: ${out.length} inquiry/inquiries, ${out.reduce((n, i) => n + i.participants.length, 0)} participants, source ${sourceCommit?.slice(0, 7) ?? 'unknown'}`)
