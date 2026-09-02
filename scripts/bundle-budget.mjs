#!/usr/bin/env node
// scripts/bundle-budget.mjs — the client-side weight gate of the visual layer (2026-09-02).
//
// Runs after `astro build`. Every JavaScript chunk under dist/_astro/ is gzip-measured and matched
// against scripts/budgets.json by file-name prefix; a chunk over its budget fails the build, and
// so does a budget whose prefix matches nothing — a renamed chunk must be re-budgeted on purpose,
// never lost to a silent miss. Duty 6 of docs/design/2026-09-02-the-visual-layer.md §3: an
// island pays for its bytes on the page it serves, and the React runtime is shared, not
// multiplied.
//
// Usage: node scripts/bundle-budget.mjs [--dist dist] [--budgets scripts/budgets.json]
// Exit 0 when every budget holds; 1 on any overrun or unmatched budget; 2 when dist/ is missing.
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'

const ROOT = join(fileURLToPath(import.meta.url), '..', '..')
const args = process.argv.slice(2)
const flag = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const DIST = join(ROOT, flag('--dist', 'dist'), '_astro')
const BUDGETS = join(ROOT, flag('--budgets', 'scripts/budgets.json'))

if (!existsSync(DIST)) {
  console.error(`bundle-budget: ${relative(ROOT, DIST)} does not exist — run \`astro build\` first`)
  process.exit(2)
}

const { budgets, reportOverKB = 20 } = JSON.parse(readFileSync(BUDGETS, 'utf8'))

const chunks = readdirSync(DIST)
  .filter((name) => name.endsWith('.js'))
  .map((name) => {
    const path = join(DIST, name)
    const raw = statSync(path).size
    const gzip = gzipSync(readFileSync(path), { level: 9 }).length
    return { name, raw, gzip }
  })
  .sort((a, b) => b.gzip - a.gzip)

const kb = (bytes) => (bytes / 1024).toFixed(1)
let failed = false

console.log(`bundle-budget: ${chunks.length} chunk(s) in ${relative(ROOT, DIST)}`)
for (const budget of budgets) {
  const matched = chunks.filter((c) => c.name.startsWith(budget.prefix))
  if (matched.length === 0) {
    failed = true
    console.error(`  ✗ ${budget.prefix}* — no chunk matches (${budget.what}); re-budget the renamed chunk or drop the entry`)
    continue
  }
  const total = matched.reduce((sum, c) => sum + c.gzip, 0)
  const limit = budget.maxGzipKB * 1024
  const mark = total <= limit ? '✓' : '✗'
  if (total > limit) failed = true
  console.log(
    `  ${mark} ${budget.prefix}* — ${kb(total)} KB gz of ${budget.maxGzipKB} KB (${matched.map((c) => c.name).join(', ')}) — ${budget.what}`,
  )
}

const unbudgetedHeavy = chunks.filter(
  (c) => c.gzip > reportOverKB * 1024 && !budgets.some((b) => c.name.startsWith(b.prefix)),
)
if (unbudgetedHeavy.length) {
  console.log(`  chunks over ${reportOverKB} KB gz without a budget (information, not a failure):`)
  for (const c of unbudgetedHeavy) console.log(`    · ${c.name} — ${kb(c.gzip)} KB gz (${kb(c.raw)} KB raw)`)
}

process.exit(failed ? 1 : 0)
