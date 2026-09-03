// src/lib/globe/layers/redaction-world.ts — the world chamber's hosts, by the country their domain
// is registered in.
//
// /redaction's second chamber draws a sample of the world's press every night, COMMITS it before
// anything can vanish, and re-fetches it the night after: the pre-committed manifest is the receipt,
// and the rate is measured against it rather than against a memory. This layer places that day's
// checked hosts by the country-code top-level domain they are registered under — one mark per
// country, its value the number of the day's sampled hosts registered there — and carries, in each
// mark's own words, the per-host outcome the record commits for it.
//
// WHAT IS COMMITTED PER HOST, AND WHAT IS NOT — the honest reading this layer is built on. The day
// record holds `deletion.receipts`, one entry per URL that came back GONE or was WITHHELD FOR LEGAL
// REASONS, with its domain, its class and its HTTP code. So the removals ARE per host and travel
// with the country they were registered in. Everything else — the pages that answered, the ones
// behind a bot wall, the ones that could not be reached — exists only as a count for the whole day,
// so it is stated in the frame's note in words and attributed to no country at all. A mark that
// carried a made-up per-country bot-wall share would be the one thing this globe exists not to do.
//
// THE HONESTY RULE IT SHARES WITH THE HOSTS LAYER OF /consensus: a top-level domain is a
// REGISTRATION, not a location. `.uk` is bought from a British registry and `.tv` from Tuvalu's, and
// neither says where the newsroom, the reporter or the server is — a television station in Georgia
// holds a `.tv` domain, and on 2026-09-02 exactly such a host is the one that vanished. The rule is
// in the source block, in the layer's own caution and on the method sheet, and the grouping is the
// SAME function the consensus layer uses, imported rather than copied. A host whose top-level domain
// belongs to no country is counted, named in the note and placed nowhere at all.
//
// AND 451 IS NEVER FOLDED INTO GONE. The record says so in its own words and the layer quotes that
// caution byte-exact in its source block: a 451 read from a German vantage point may be EU
// geo-blocking rather than a takedown, so it is reported apart, in the note and in every mark's
// words, and never added to the gone count.
import type { WorldData, WorldReceipt } from '@/lib/redaction/world'
import { centroidOfIso3 } from '../crosswalk'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { groupByCountry, tldOf } from './consensus-tld'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/redaction/world'
const SAMPLES = `${DIR}/samples`
const DAYS = archiveDays(DIR)
const SAMPLE_DAYS = archiveDays(SAMPLES)
const NEWEST = DAYS[DAYS.length - 1]

const nf = new Intl.NumberFormat('en-GB')

/** The pre-committed pool, as the pipeline writes it. */
interface WorldSample {
  pool_day: string
  sample_size: number
  items: Array<{ url: string; domain: string; title: string; first_seen: string }>
}

/** What a receipt's class IS, in words. Never a colour and never a severity: a page that is gone and
 *  a page withheld for legal reasons are two different facts about two different actors, and the
 *  second is the one the record refuses to add to the first. */
const CLASS_WORDS: Readonly<Record<string, string>> = Object.freeze({
  gone_404: 'gone from the web',
  gone_410: 'gone from the web, declared permanently so',
  legal_451: 'withheld for legal reasons',
})

const READOUT = {
  mark: '{country} · {hosts} of the day’s checked hosts',
  place: 'the centroid of the country a top-level domain is registered in — not where the newsroom or its server sits',
  caution:
    'a top-level domain is a registration and not a location, and only the hosts that came back gone or withheld are committed per host: everything else the night found is a count for the whole day and belongs to no country',
  unavailable: 'The record itself says why this day measured nothing: “{note}”',
  nosample: 'This day names a sample the archive does not hold, so the hosts it checked cannot be listed and nothing is drawn.',
  counts:
    'Of the {size} hosts in this day’s checked sample, {ok} answered, {botwall} stood behind a bot wall, {unreachable} could not be reached, {gone} were gone and {legal} were withheld for legal reasons — the last two are counted apart and never added together.',
  noCountry: '{unplaced} of {size} hosts carry no country: their top-level domain is generic or belongs to none ({tlds}).',
  unplaced:
    'The geography at this scale draws no polygon for {countries}, so their hosts are counted and drawn nowhere.',
}

/** The day's receipts grouped by the top-level domain of their host, so a country's mark can say
 *  which of its hosts went and how — the only per-host outcome the record commits. */
export function receiptsByTld(receipts: readonly WorldReceipt[]): Map<string, WorldReceipt[]> {
  const out = new Map<string, WorldReceipt[]>()
  for (const receipt of receipts) {
    const tld = tldOf(receipt.domain)
    if (!tld) continue
    const held = out.get(tld)
    if (held) held.push(receipt)
    else out.set(tld, [receipt])
  }
  return out
}

/** One receipt, said the way the record holds it: the host, what happened to it, and the code the
 *  server answered with. An unrecorded class is printed as the record's own label rather than
 *  guessed at. */
export function receiptWords(receipt: WorldReceipt): string {
  const what = CLASS_WORDS[receipt.class] ?? receipt.class
  return receipt.http_code === null ? `${receipt.domain} ${what}` : `${receipt.domain} ${what} (${receipt.http_code})`
}

/** The caution the record itself carries about reading a 451 from where this house stands. Returned
 *  byte-exact or not at all — the source block quotes it, and the suite fails if the record ever
 *  stops carrying it, rather than the build inventing a caution of its own. */
export function germanVantageNote(data: WorldData): string | null {
  return (data.deletion.notes ?? []).find((note) => note.includes('German vantage point')) ?? null
}

function frameOf(day: string): LayerFrame {
  const data = readDay<WorldData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const deletion = data.deletion
  if (!deletion.available) {
    return EMPTY_FRAME(day, READOUT.unavailable.replace('{note}', deletion.note ?? ''))
  }
  const pool = deletion.pool_day
  if (!pool || !SAMPLE_DAYS.includes(pool)) return EMPTY_FRAME(day, READOUT.nosample)

  // the sample that was CHECKED on this day is the one the record names in `pool_day` — not the one
  // it committed that night for the next run, which is what `sample_committed` points at
  const file = dayPath(SAMPLES, pool)
  const sample = readJson<WorldSample>(file)
  const domains = sample.items.map((item) => item.domain)
  const size = domains.length
  const { placed, countryless } = groupByCountry(domains)
  const receipts = receiptsByTld(deletion.receipts ?? [])

  const records: LayerRecord[] = []
  const unplaced: string[] = []
  let countrylessHosts = size

  for (const group of placed) {
    countrylessHosts -= group.domains.length
    const at = centroidOfIso3(group.iso3)
    if (!at) {
      if (!unplaced.includes(group.name)) unplaced.push(group.name)
      continue
    }
    const gone = receipts.get(group.cctld) ?? []
    const outcome =
      gone.length === 0 ? 'none of them found gone or withheld' : gone.map(receiptWords).join(' · ')
    records.push({
      key: `redaction-world:${day}:${group.iso3}`,
      at,
      value: group.domains.length,
      labelKind: 'centroid',
      receipt: {
        file,
        locator: `items · the hosts ending in .${group.cctld} · checked in ${dayPath(DIR, day)}`,
        words: `${group.name} · ${nf.format(group.domains.length)} of ${nf.format(size)} hosts in the day’s checked sample · ${outcome}`,
        ...(gone[0] ? { url: gone[0].url } : {}),
      },
    })
  }

  const counts = deletion.counts ?? {}
  const notes = [
    READOUT.counts
      .replace('{size}', nf.format(size))
      .replace('{ok}', nf.format(counts.ok ?? 0))
      .replace('{botwall}', nf.format(counts.botwall ?? 0))
      .replace('{unreachable}', nf.format(counts.unreachable ?? 0))
      .replace('{gone}', nf.format(deletion.gone ?? 0))
      .replace('{legal}', nf.format(deletion.legal_451 ?? 0)),
  ]
  if (countrylessHosts > 0) {
    notes.push(
      READOUT.noCountry
        .replace('{unplaced}', nf.format(countrylessHosts))
        .replace('{size}', nf.format(size))
        .replace('{tlds}', countryless.join(', ')),
    )
  }
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{countries}', unplaced.join(', ')))
  return { day, records, note: notes.join(' ') }
}

const newest = readJson<WorldData>(dayPath(DIR, NEWEST))
const vantage = germanVantageNote(newest)

export const redactionWorldLayer: GlobeLayer = {
  id: 'redaction-world',
  title: 'Editorial Deadline, the world chamber',
  kind: 'points',
  owner: { line: 'counter-measurement' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name:
      'the pre-committed nightly sample of the world’s press, re-fetched the night after ' +
      '(src/data/redaction/world/samples/<day>.json is the receipt) — the hosts counted by the country their ' +
      'top-level domain is registered in, which is a registration and not a location, and only the hosts found ' +
      'gone or withheld are committed per host' +
      (vantage ? `. The record’s own caution: “${vantage}”` : ''),
    url: 'https://frankbueltge.de/redaction',
    license:
      'Data — The GDELT Project, the news pool the sample is drawn from; the house’s CC0 covers its own ' +
      'measurement, never the quoted headlines',
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}
