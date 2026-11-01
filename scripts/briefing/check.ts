// scripts/briefing/check.ts — the machine half of a briefing's check (2026-11-01).
// Usage: npx tsx scripts/briefing/check.ts <briefing.json>
//
// Exits 1 and names every rule the file breaks. It cannot say that a figure is true: that is the
// second session's work. It runs before the second session links a briefing, and again before the site
// derives anything from it.
import { readFileSync } from 'node:fs'
import { briefingProblems, type Briefing } from '../../src/lib/briefing/briefing'

const file = process.argv[2]
if (!file) throw new Error('usage: check.ts <briefing.json>')
const problems = briefingProblems(JSON.parse(readFileSync(file, 'utf8')) as Briefing)
for (const p of problems) console.error(`[briefing] ${p}`)
if (problems.length) process.exit(1)
console.log('[briefing] the file keeps every rule')
