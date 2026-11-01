// scripts/briefing/check.ts — the machine half of a briefing's check (2026-11-01).
// Usage: npx tsx scripts/briefing/check.ts <briefing.json>
//
// Exits 1 and names every rule the file breaks. It cannot say that a figure is true: that is the
// second session's work. It runs before the second session links a briefing, and again before the site
// derives anything from it. A file of the two earlier briefings is looked for beside this one and one
// folder up, because a draft stands in `briefings/drafts/`. A map on its own (`briefing-map/1`, the map's
// first edition) is held to the map's rules.
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { briefingProblems, type Briefing } from '../../src/lib/briefing/briefing'
import { earlierIds, FIELDS_BEFORE_THE_MAP, mapProblems, type FieldId } from '../../src/lib/briefing/map'

const file = process.argv[2]
if (!file) throw new Error('usage: check.ts <briefing.json>')
const read = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

function fieldsOf(id: string): readonly FieldId[] | null {
  const known = FIELDS_BEFORE_THE_MAP[id]
  if (known) return known
  const path = [dirname(file!), join(dirname(file!), '..')].map((dir) => join(dir, `${id}.json`)).find(existsSync)
  return path ? read<Briefing>(path).matters.flatMap((m) => m.field ?? []) : null
}

const data = read<Omit<Briefing, '$contract'> & { $contract: string }>(file)
const problems = data.$contract === 'briefing-map/1'
  ? mapProblems(data.map ?? [], data.written)
  : briefingProblems(data as Briefing, earlierIds(data.id).map(fieldsOf).filter((f): f is readonly FieldId[] => f !== null))
for (const p of problems) console.error(`[briefing] ${p}`)
if (problems.length) process.exit(1)
console.log('[briefing] the file keeps every rule')
