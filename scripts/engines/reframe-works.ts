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
import { join, sep } from 'node:path'
import { frameStandaloneWork } from '../../src/lib/engines/work-frame'
import { teaserFor } from '../../src/lib/engines/teaser'
import { NAMING } from '../../src/config/naming'

const check = process.argv.includes('--check')
// Optional namespace filter: `tsx reframe-works.ts attention` frames only that mirror. The
// integrates pass their own namespace so a run does not touch — and leave dirty and
// uncommitted — mirrors it does not itself stage (Frank, 2026-08-16).
const only = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const wanted = (ns: string): boolean => only.length === 0 || only.includes(ns)

const NAMESPACES = ['atelier', 'field', 'studio', 'plenum'].filter(wanted)

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

// The houses mirrored to public/ that are not ecology practices (Frank, 2026-08-16: add the
// way back everywhere it is still missing). Their mirrors are not laid out as werke-html/<slug>,
// so they are walked whole: every .html under public/<ns> gets the strip. No wall text exists
// for them and none is invented — the nav band alone, which is the documented behaviour when a
// work has no label on record.
const HOUSES = NAMING.worksRegister.standaloneFrame.houses

function htmlUnder(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...htmlUnder(p))
    else if (entry.name.endsWith('.html')) out.push(p)
  }
  return out
}

for (const [ns, house] of Object.entries(HOUSES)) {
  if (!wanted(ns)) continue
  const root = join('public', ns)
  if (!existsSync(root)) continue
  for (const file of htmlUnder(root)) {
    const before = readFileSync(file, 'utf8')
    // `self` is the page that IS this house's front door: a link to itself is not an exit.
    const atHouseIndex = house.self === '/' + file.split(sep).join('/').replace(/^public\//, '')
    const after = frameStandaloneWork(before, ns, null, { atHouseIndex })
    if (after === before) { already++; continue }
    changed++
    if (!check) writeFileSync(file, after)
    console.log(`${check ? 'would frame' : 'framed'}  ${file}${atHouseIndex ? '  (house front door)' : ''}`)
  }
}

console.log(`\n${changed} framed, ${already} already carried the frame`)
if (missingWallText.length)
  // Not an error: the nightly teaser routine writes these, and drift-check rule 8 already
  // counts the gap. Naming them here keeps the gap visible at the moment of framing too.
  console.log(`no wall text yet: ${missingWallText.join(', ')}`)

if (check && changed > 0) process.exit(1)
