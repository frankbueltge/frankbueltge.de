#!/usr/bin/env node
// scripts/post/sync-post-ledger.mjs — assemble the post office's outgoing ledger from the
// packets the practices lay in their own repositories, plus the site-side entries nobody
// else can file. Same derivation discipline as the joint-inquiry register: read each
// packet's own machine-readable file, retype nothing, invent nothing.
//
// Why this exists: the ledger was curated by hand ("Curated site-side for now", ledger.ts),
// so it was only ever as complete as the last session that remembered it. The plenum's
// Center for Humane Technology packet lay gate-passed for two days before anyone entered it.
// A post office that is the single place all outward communication collects (Frank,
// 2026-08-07) cannot depend on remembering.
//
// The convention a practice follows: next to the packet's LETTER.md, a `packet.json` with the
// ledger fields. The practice owns it — it is written in the repository the practice writes,
// in the same commit as the packet, and it lands here without anyone being asked. What a
// practice still cannot do is send: `sent` is set by the human who actually forwarded it.
//
// Run:  node scripts/post/sync-post-ledger.mjs --repo <path>:<practice> [--repo …]
// CI:   ecology-integrate.yml, against its fresh clones.

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'node:fs'
import { join } from 'node:path'

const OUT = new URL('../../src/data/post/ledger.json', import.meta.url).pathname
const MANUAL = new URL('../../src/data/post/ledger.manual.json', import.meta.url).pathname

/** Where a practice keeps its packets. Two spellings in the wild; both are read, neither is renamed. */
const PACKET_DIRS = ['deliveries', 'delivery']
const PRACTICES = new Set(['atelier', 'field', 'studio', 'plenum', 'ecology'])
/** Only a human who forwarded something may claim it left the house. */
const PRACTICE_SETTABLE = new Set(['in-preparation', 'prepared', 'withheld'])
const REQUIRED = ['id', 'piece', 'receiver', 'receiver_channel', 'status', 'as_of', 'record_url', 'note']

const repos = []
const argv = process.argv.slice(2)
for (let i = 0; i < argv.length; i++) {
  if (argv[i] !== '--repo') continue
  const spec = argv[++i] ?? ''
  const sep = spec.lastIndexOf(':')
  if (sep < 1) fail(`--repo needs <path>:<practice>, got "${spec}"`)
  const path = spec.slice(0, sep)
  const practice = spec.slice(sep + 1)
  if (!PRACTICES.has(practice)) fail(`unknown practice "${practice}" (${[...PRACTICES].join(', ')})`)
  repos.push({ path, practice })
}

function fail(msg) {
  console.error(`sync-post-ledger: ${msg}`)
  process.exit(2)
}

const readJson = (p) => JSON.parse(readFileSync(p, 'utf8'))
const isDir = (p) => existsSync(p) && statSync(p).isDirectory()

/** Read one practice's packets. A repo that is absent is skipped loudly, never silently. */
function packetsOf({ path, practice }) {
  if (!isDir(path)) {
    console.warn(`  ${practice}: no checkout at ${path} — skipped (its packets keep their last committed state)`)
    return null
  }
  const found = []
  for (const dirName of PACKET_DIRS) {
    const base = join(path, dirName)
    if (!isDir(base)) continue
    for (const slug of readdirSync(base).sort()) {
      if (!isDir(join(base, slug))) continue // a README beside the packets is not a packet
      const packetPath = join(base, slug, 'packet.json')
      if (!existsSync(packetPath)) {
        console.warn(`  ${practice}: ${dirName}/${slug} has no packet.json — not in the ledger`)
        continue
      }
      const p = readJson(packetPath)
      const missing = REQUIRED.filter((k) => typeof p[k] !== 'string' || p[k].trim() === '')
      if (missing.length) fail(`${practice}: ${dirName}/${slug}/packet.json is missing ${missing.join(', ')}`)
      if (p.practice && p.practice !== practice) {
        fail(`${practice}: ${dirName}/${slug}/packet.json claims practice "${p.practice}"`)
      }
      // A practice may prepare, hold back, or withhold. It may not declare its own letter sent:
      // that is the one fact only the human who forwarded it can know.
      if (!PRACTICE_SETTABLE.has(p.status)) {
        fail(
          `${practice}: ${dirName}/${slug}/packet.json declares status "${p.status}" — a packet may only ` +
            `declare ${[...PRACTICE_SETTABLE].join(' / ')}; sent/answered/silence are set site-side by the human who forwarded it`,
        )
      }
      found.push({
        ...p,
        practice,
        derived_from: `${dirName}/${slug}/packet.json`,
      })
    }
  }
  return found
}

const manual = existsSync(MANUAL) ? readJson(MANUAL) : []
const entries = [...manual]
const skipped = []

console.log('post office ledger:')
for (const repo of repos) {
  const found = packetsOf(repo)
  if (found === null) {
    skipped.push(repo.practice)
    continue
  }
  console.log(`  ${repo.practice}: ${found.length} packet(s)`)
  entries.push(...found)
}

// A site-side entry wins over a derived one with the same id, and says so — that is how a
// human records `sent` on a packet the practice still lists as lying open.
const byId = new Map()
for (const e of entries) {
  const prior = byId.get(e.id)
  if (!prior) {
    byId.set(e.id, e)
    continue
  }
  const manualOne = prior.derived_from ? e : prior
  const derivedOne = prior.derived_from ? prior : e
  if (manualOne === derivedOne) fail(`two packets share the id "${e.id}"`)
  console.log(`  ${e.id}: site-side entry overrides the packet (status ${derivedOne.status} → ${manualOne.status})`)
  byId.set(e.id, { ...derivedOne, ...manualOne })
}

// Any practice whose repo was missing keeps whatever the committed ledger already says about
// it — a failed clone must not quietly empty the post office.
if (skipped.length) {
  const previous = existsSync(OUT) ? readJson(OUT) : []
  for (const e of previous) {
    if (skipped.includes(e.practice) && !byId.has(e.id)) {
      console.warn(`  ${e.practice}: keeping committed entry ${e.id} (repo unavailable this run)`)
      byId.set(e.id, e)
    }
  }
}

const out = [...byId.values()].sort((a, b) => b.as_of.localeCompare(a.as_of) || a.id.localeCompare(b.id))
writeFileSync(OUT, JSON.stringify(out, null, 2) + '\n')
console.log(`  → ${out.length} entries written (${manual.length} site-side, ${out.length - manual.length} from packets)`)
