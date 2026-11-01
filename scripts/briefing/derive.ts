// scripts/briefing/derive.ts — brings the newest checked briefing into the site (2026-11-01).
// Usage: npx tsx scripts/briefing/derive.ts [--from <briefing.json>]
//
// Finds the newest `briefings/after-cycle-NNN.json` in research-ecology, pinned to its commit, and
// writes a round of Third Reading, a round of Ducking and the watchlist. Does nothing when both rounds
// stand. A file that breaks a rule writes nothing and fails the run, and the old rounds stay up.
// Prints `round=<id>` to GITHUB_OUTPUT when it wrote one: the workflow then renders the voices.
import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { briefingProblems, type Briefing } from '../../src/lib/briefing/briefing'
import { earlierIds, FIELDS_BEFORE_THE_MAP, type FieldId } from '../../src/lib/briefing/map'
import { toDuckingRound, toReadingRound, withMatters, type WatchEntry } from '../../src/lib/briefing/derive'
import type { Round as DuckingRound } from '../../src/lib/ducking/round'
import type { Round as ReadingRound } from '../../src/lib/reading/round'

const REPO = 'frankbueltge/research-ecology'
const API = `https://api.github.com/repos/${REPO}`
const headers: Record<string, string> = { accept: 'application/vnd.github+json', 'user-agent': 'frankbueltge.de briefing-derive' }
if (process.env.GITHUB_TOKEN) headers.authorization = `Bearer ${process.env.GITHUB_TOKEN}`

const json = async <T>(url: string): Promise<T> => {
  const res = await fetch(url, { headers })
  if (!res.ok) throw new Error(`${url}: ${res.status}`)
  return (await res.json()) as T
}
const read = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T
const write = (path: string, data: unknown): void => writeFileSync(path, `${JSON.stringify(data, null, 2)}\n`)

async function newest(): Promise<{ briefing: Briefing; sha: string }> {
  const files = await json<{ name: string }[]>(`${API}/contents/briefings`)
  const id = files.map((f) => f.name).filter((n) => /^after-cycle-\d{3}\.json$/.test(n)).sort().at(-1)?.replace('.json', '')
  if (!id) throw new Error('no briefing data in research-ecology')
  const [commit] = await json<{ sha: string }[]>(`${API}/commits?path=briefings/${id}.json&per_page=1`)
  const raw = `https://raw.githubusercontent.com/${REPO}/${commit!.sha}/briefings/${id}.json`
  return { briefing: await json<Briefing>(raw), sha: commit!.sha }
}

/** The fields of an earlier briefing, for the rule that no field stays empty for long. */
async function fieldsOf(id: string, sha: string, beside: string | null): Promise<readonly FieldId[] | null> {
  const known = FIELDS_BEFORE_THE_MAP[id]
  if (known) return known
  if (beside) {
    const path = join(beside, `${id}.json`)
    return existsSync(path) ? read<Briefing>(path).matters.flatMap((m) => m.field ?? []) : null
  }
  const res = await fetch(`https://raw.githubusercontent.com/${REPO}/${sha}/briefings/${id}.json`, { headers })
  return res.ok ? ((await res.json()) as Briefing).matters.flatMap((m) => m.field ?? []) : null
}

const fromFlag = process.argv.indexOf('--from')
const { briefing, sha } = fromFlag > 0
  ? { briefing: read<Briefing>(process.argv[fromFlag + 1]!), sha: 'main' }
  : await newest()

const readingPath = `src/data/reading/rounds/${briefing.id}.json`
const duckingPath = `src/data/ducking/rounds/${briefing.id}.json`
if (existsSync(readingPath) && existsSync(duckingPath)) {
  console.log(`[briefing] ${briefing.id} stands on the site, nothing to do`)
  process.exit(0)
}
const beside = fromFlag > 0 ? dirname(process.argv[fromFlag + 1]!) : null
const earlier = await Promise.all(earlierIds(briefing.id).map((id) => fieldsOf(id, sha, beside)))
const problems = briefingProblems(briefing, earlier.filter((f): f is readonly FieldId[] => f !== null))
if (problems.length) {
  for (const p of problems) console.error(`[briefing] ${p}`)
  throw new Error(`${briefing.id} breaks ${problems.length} rule(s); the old rounds stay up`)
}

const url = `https://github.com/${REPO}/blob/${sha}/briefings/${briefing.id}.md`
const readingTemplate = read<ReadingRound>('src/data/reading/rounds/after-cycle-010.json')
const duckingTemplate = read<DuckingRound>('src/data/ducking/rounds/after-cycle-011.json')
if (!existsSync(readingPath)) {
  write(readingPath, toReadingRound(briefing, url, readingTemplate))
  // A static list, because the Pages Functions' bundler knows no glob (src/lib/reading/rounds.ts).
  const list = 'src/lib/reading/rounds.ts'
  const name = `afterCycle${briefing.id.slice(-3)}`
  const source = readFileSync(list, 'utf8')
    .replace(/(import afterCycle\d+ from [^\n]+\n)(?!import afterCycle)/, `$1import ${name} from '../../data/reading/rounds/${briefing.id}.json'\n`)
    .replace(/validRounds\(\[([^\]]*)\]\)/, (_, inner: string) => `validRounds([${inner}, ${name} as Round])`)
  writeFileSync(list, source)
}
write(duckingPath, toDuckingRound(briefing, url, duckingTemplate))
const watchlist = 'src/data/trending/watchlist.json'
write(watchlist, withMatters(briefing, read<WatchEntry[]>(watchlist)))
console.log(`[briefing] ${briefing.id}: rounds written, watchlist updated`)
if (process.env.GITHUB_OUTPUT) appendFileSync(process.env.GITHUB_OUTPUT, `round=${briefing.id}\n`)
