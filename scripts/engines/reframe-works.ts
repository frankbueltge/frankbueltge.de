// scripts/engines/reframe-works.ts
// Usage: tsx scripts/engines/reframe-works.ts [--check]
//
// Applies the standalone-work frame (src/lib/engines/work-frame.ts) to the mirrors already
// sitting in public/<ns>/werke-html/. The integrate does this itself from now on, but only
// for works it re-mirrors — this is what makes the change visible for the ones already there,
// the same way PR #295 rewrote its 48 generated wrappers instead of waiting a night.
//
// Idempotent: a mirror that already carries the frame is left exactly as it is.
// --check exits 1 if anything WOULD change, for use as a guard rather than a fixer.
import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { frameStandaloneWork } from '../../src/lib/engines/work-frame'
import { teaserFor } from '../../src/lib/engines/teaser'

const NAMESPACES = ['atelier', 'field', 'studio', 'plenum']
const check = process.argv.includes('--check')

let changed = 0
let already = 0
const missingWallText: string[] = []

for (const ns of NAMESPACES) {
  const root = join('public', ns, 'werke-html')
  if (!existsSync(root)) continue
  for (const slug of readdirSync(root)) {
    const file = join(root, slug, 'index.html')
    if (!existsSync(file)) continue
    const before = readFileSync(file, 'utf8')
    const wall = teaserFor(ns, slug)
    if (!wall) missingWallText.push(`${ns}/${slug}`)
    const after = frameStandaloneWork(before, ns, wall)
    if (after === before) { already++; continue }
    changed++
    if (!check) writeFileSync(file, after)
    console.log(`${check ? 'would frame' : 'framed'}  ${ns}/${slug}${wall ? '' : '  (no wall text on record)'}`)
  }
}

console.log(`\n${changed} framed, ${already} already carried the frame`)
if (missingWallText.length)
  // Not an error: the nightly teaser routine writes these, and drift-check rule 8 already
  // counts the gap. Naming them here keeps the gap visible at the moment of framing too.
  console.log(`no wall text yet: ${missingWallText.join(', ')}`)

if (check && changed > 0) process.exit(1)
