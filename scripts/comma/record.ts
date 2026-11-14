// scripts/comma/record.ts — what Comma keeps of OONI in the repository (2026-11-14).
//
//   npx tsx scripts/comma/record.ts            the day's counts (src/data/comma/day.json)
//   npx tsx scripts/comma/record.ts --tape     the counts and the recording (public/comma/tape/00.json … 23.json)
//   … --day 2026-11-12                         a given UTC day instead of yesterday
//   … --dry-run                                read and report, write nothing
//
// Two things, both read from OONI's public API by whoever runs this, a person or a workflow:
//
// 1. The day's counts. One whole UTC day of web tests, counted by country (the ground of the suspicion rule,
//    src/lib/comma/rule.ts) and by hour and kind of page (how loud the six tones are). Two questions.
// 2. The recording. One block of five minutes from each hour of that day (ten past to a quarter past), every
//    deviation in it, with the kind of page already worked out from Citizen Lab's test lists. The page plays it,
//    labelled as a recording, whenever OONI will not answer the site: the 24 blocks in turn, a day in two hours.
//    24 questions.
//
// OONI charges every address that asks (src/lib/comma/relay.ts): the counts cost about 40 of an address's 4,000
// daily units, the recording about 400. The questions are spaced out, say who asks, and the run stops at the first
// refusal without writing anything, so a half-read day never replaces a whole one. A refusal by OONI's quota ends
// the run with exit code 3, which the workflow (.github/workflows/comma-record.yml) reads as "not tonight", not as
// a failure; anything else that goes wrong ends it with 1. Both files are OONI's data under
// OONI's licence, CC BY-NC-SA 4.0, and Citizen Lab's categories under the same; LICENSE.md names the exception.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { deviationsOf, encodeTape, TAPE_MINUTE, type Tape } from '../../src/lib/comma/block'
import { BLOCK_MS, MINUTE_MS } from '../../src/lib/comma/clock'
import { testsOf } from '../../src/lib/comma/ooni'
import { blockUrl } from '../../src/lib/comma/relay'
import { dayOf, ruleOfDay, tideOf, type DayCounts } from '../../src/lib/comma/rule'
import { listUrl, parseList, type Lists } from '../../src/lib/comma/testlists'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const API = 'https://api.ooni.io/api/v1'
const USER_AGENT = 'frankbueltge.de comma (recording for a live artwork; a few dozen spaced questions)'
const PAUSE_MS = 1500

const args = process.argv.slice(2)
const flag = (name: string): boolean => args.includes(name)
const value = (name: string): string | null => {
  const i = args.indexOf(name)
  return i >= 0 ? (args[i + 1] ?? null) : null
}

/** OONI's quota said no (HTTP 429): nothing is wrong, and nothing is written. */
class Refused extends Error {}

const sleep = (ms: number): Promise<void> => new Promise((done) => setTimeout(done, ms))
let asked = 0
let quota = ''

/** One spaced question to OONI. Anything but a JSON answer ends the run. */
async function ask(url: string): Promise<unknown> {
  if (asked > 0) await sleep(PAUSE_MS)
  asked += 1
  const response = await fetch(url, { headers: { accept: 'application/json', 'user-agent': USER_AGENT } })
  quota = response.headers.get('x-ratelimit-remaining') ?? quota
  if (response.status === 429) throw new Refused(`OONI refused question ${asked} (its quota for this address is spent); nothing was written`)
  if (!response.ok) throw new Error(`OONI answered ${response.status} to question ${asked}; nothing was written`)
  return response.json()
}

async function list(name: string): Promise<Map<string, string> | null> {
  try {
    const response = await fetch(listUrl(name))
    return response.ok ? parseList(await response.text()) : null
  } catch {
    return null
  }
}

async function main(): Promise<void> {
  const today = Math.floor(Date.now() / 86_400_000) * 86_400_000
  const given = value('--day')
  if (given && !/^\d{4}-\d{2}-\d{2}$/.test(given)) throw new Error('--day wants YYYY-MM-DD')
  const start = given ? Date.parse(`${given}T00:00:00Z`) : today - 86_400_000
  if (!Number.isFinite(start) || start >= today) throw new Error('the day must be a whole UTC day that has ended')
  const day = new Date(start).toISOString().slice(0, 10)
  const next = new Date(start + 86_400_000).toISOString().slice(0, 10)
  const span = `since=${day}&until=${next}&test_name=web_connectivity`

  const byCountry = (await ask(`${API}/aggregation?${span}&axis_x=probe_cc`)) as { result?: unknown }
  const rows = Array.isArray(byCountry.result) ? (byCountry.result as Record<string, unknown>[]) : []
  const countries = rows
    .filter((r) => typeof r.probe_cc === 'string' && /^[A-Z]{2}$/.test(r.probe_cc) && typeof r.measurement_count === 'number' && r.measurement_count > 0)
    .map((r) => [r.probe_cc, r.measurement_count, Number(r.anomaly_count) || 0, Number(r.confirmed_count) || 0] as [string, number, number, number])
    .sort((a, b) => a[0].localeCompare(b[0]))
  const tide = tideOf(await ask(`${API}/aggregation?${span}&axis_x=measurement_start_day&time_grain=hour&axis_y=category_code`), day)
  if (!tide) throw new Error('the count by hour does not cover the 24 hours of the day; nothing was written')
  const counts = dayOf({ v: 1, day, countries, tide } satisfies DayCounts)
  const rule = ruleOfDay(counts)
  if (!counts || !rule) throw new Error('the counts do not make a rule; nothing was written')
  const weighted = [...rule.weights.values()].filter((w) => w > 0).length
  console.log(`day ${day}: ${countries.length} countries, median deviation ${(rule.median * 100).toFixed(2)} %, ${weighted} with weight`)
  console.log(`  tests by hour: ${tide.map((h) => h.reduce((a, b) => a + b, 0)).join(' ')}`)

  const tapes: { file: string; tape: Tape }[] = []
  if (flag('--tape')) {
    const blocks: { hour: number; block: number; json: unknown }[] = []
    for (let hour = 0; hour < 24; hour++) {
      const block = start + hour * 60 * MINUTE_MS + TAPE_MINUTE * MINUTE_MS
      blocks.push({ hour, block, json: await ask(blockUrl(block)) })
    }
    const read = blocks.map((b) => ({ ...b, tests: testsOf(b.json, b.block, b.block + BLOCK_MS) }))
    const lists: Lists = { global: await list('global'), byCountry: new Map() }
    if (!lists.global) throw new Error('Citizen Lab’s global list could not be read; nothing was written')
    for (const cc of [...new Set(read.flatMap((b) => b.tests.map((t) => t.cc)))].sort()) {
      const own = await list(cc)
      if (own) lists.byCountry.set(cc, own)
    }
    const recorded = new Date().toISOString().slice(0, 10)
    for (const b of read) {
      const deviations = deviationsOf(b.tests, b.block, lists)
      if (deviations.length === 0) throw new Error(`the block of hour ${b.hour} is empty; nothing was written`)
      tapes.push({ file: `${String(b.hour).padStart(2, '0')}.json`, tape: encodeTape(b.block, deviations, recorded) })
    }
    const total = tapes.reduce((n, t) => n + t.tape.rows.length, 0)
    console.log(`recording of ${day}: 24 blocks, ${total} deviations, ${lists.byCountry.size} country lists`)
  }

  console.log(`asked OONI ${asked} times; its quota for this address now reads ${quota || 'unknown'}`)
  if (flag('--dry-run')) {
    console.log('dry run: nothing written')
    return
  }
  const dayFile = join(ROOT, 'src', 'data', 'comma', 'day.json')
  mkdirSync(dirname(dayFile), { recursive: true })
  writeFileSync(dayFile, `${JSON.stringify(counts)}\n`)
  console.log(`wrote ${dayFile}`)
  if (tapes.length) {
    const dir = join(ROOT, 'public', 'comma', 'tape')
    mkdirSync(dir, { recursive: true })
    for (const t of tapes) writeFileSync(join(dir, t.file), `${JSON.stringify(t.tape)}\n`)
    console.log(`wrote ${tapes.length} blocks to ${dir}`)
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(error instanceof Refused ? 3 : 1)
})
