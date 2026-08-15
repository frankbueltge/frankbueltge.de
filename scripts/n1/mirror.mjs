#!/usr/bin/env node
// Mirrors the n-1 practice record into src/data/n1/record.json (contract
// n1-record/1). Pull-based like the other integrates: the practice repo needs
// no write access here, and this script copies bytes — it never authors
// content. Deterministic for identical input: timestamps come from the
// mirrored commit, never from the wall clock, so the record is byte-stable.
// Usage: node scripts/n1/mirror.mjs <path-to-n-1-checkout>
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const src = process.argv[2]
if (!src || !existsSync(src)) {
  console.error('usage: node scripts/n1/mirror.mjs <path-to-n-1-checkout>')
  process.exit(1)
}

const git = (args) => execSync(`git ${args}`, { cwd: src }).toString().trim()
const commit = git('rev-parse HEAD')
const committed = git('show -s --format=%cI HEAD')

const layersDir = join(src, 'atlas', 'layers')
const order = JSON.parse(readFileSync(join(layersDir, 'index.json'), 'utf8'))
const atlas = order.map((file) => JSON.parse(readFileSync(join(layersDir, file), 'utf8')))

// First markdown heading = the document's own title; the filename is the
// honest fallback. Sorted by filename, which is the practice's own ordering
// (numbered prefixes, dated offers).
const documents = (dir) => {
  const abs = join(src, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md'))
    .sort()
    .map((file) => ({
      file: `${dir}/${file}`,
      title: (readFileSync(join(abs, file), 'utf8').match(/^#\s+(.+)$/m) ?? [null, file])[1],
    }))
}

const record = {
  $contract: 'n1-record/1',
  source: { repo: 'frankbueltge/n-1', commit, committed },
  atlas,
  documents: { nights: documents('nights'), reading: documents('reading') },
}

mkdirSync('src/data/n1', { recursive: true })
writeFileSync('src/data/n1/record.json', JSON.stringify(record, null, 2) + '\n')
console.log(`n1 record mirrored: ${atlas.length} layers @ ${commit.slice(0, 7)}`)
