// Builds src/data/globe/seats.json — where an institution stands.
//
// Most of what this house measures is PUBLISHED, not sensed. A food price index has no
// coordinate. A refugee count has no coordinate. A removed paragraph on a government page has no
// coordinate. The honest point for all of them is the seat of the body that publishes them — and
// the moment a globe draws a seat as if it were a measurement site, it starts lying quietly. So
// every row says which of the two it is (`labelKind: 'seat'` or `'station'`), and only a real
// instrument at a real site gets to be a station. Of everything this file holds, exactly one is:
// the Mauna Loa Observatory, where the CO₂ reading is taken.
//
// Coordinates are Wikidata's, in a declared order, and every row's note says which step gave it:
//   1. P625 (coordinate location) on the institution's own item;
//   2. the P625 qualifier on its P159 (headquarters location) statement;
//   3. P625 on the item its P159 points at (a city, or the building it sits in);
//   4. P625 on an item named here explicitly, for the two bodies Wikidata places by neither.
// Where no step answers, the row keeps `lat: null, lon: null` and says so. Nothing is invented:
// a seat nobody can check is worse than a reading drawn nowhere.
//
// This is the only script under src/data/globe that needs the network, and it needs it only to
// regenerate. The committed file is the archive — the site never asks Wikidata anything.
//
//   npx tsx scripts/build-globe-seats.ts          writes the file
//   npx tsx scripts/build-globe-seats.ts --check  exits non-zero on drift, writes nothing
import { readFileSync, writeFileSync } from 'node:fs'

const OUT = 'src/data/globe/seats.json'
const API = 'https://www.wikidata.org/w/api.php'
const AGENT = 'frankbueltge.de living-globe seats builder (https://frankbueltge.de)'

interface SeatSpec {
  id: string
  label: string
  qid: string
  labelKind: 'seat' | 'station'
  /** what this house reads from this body — the reason the row exists */
  publishes: string
  /** step 4: the item whose coordinate stands in, where Wikidata places the body by no other means */
  via?: { qid: string; because: string }
}

/** The sixteen institutions the redaction instrument watches (pipelines/redaction/src/redaction/
 *  watchlist.py) and the bodies behind the fourteen protocol readings. A body that serves both
 *  appears once. */
const SEATS: SeatSpec[] = [
  { id: 'who', label: 'World Health Organization', qid: 'Q7817', labelKind: 'seat', publishes: 'watched pages on climate and health, air quality, tobacco, obesity' },
  { id: 'un', label: 'United Nations', qid: 'Q1065', labelKind: 'seat', publishes: 'watched pages on climate change, human rights, the net-zero coalition' },
  { id: 'unhcr', label: 'UNHCR', qid: 'Q132551', labelKind: 'seat', publishes: 'the refugee statistics page, and the protocol’s refugee count' },
  { id: 'ipcc', label: 'Intergovernmental Panel on Climate Change', qid: 'Q171183', labelKind: 'seat', publishes: 'the watched special report and assessment pages' },
  { id: 'eu-commission', label: 'European Commission', qid: 'Q8880', labelKind: 'seat', publishes: 'the watched climate-target and strategy pages' },
  { id: 'nasa', label: 'NASA', qid: 'Q23548', labelKind: 'seat', publishes: 'the watched climate-evidence pages, and the protocol’s fire detections through FIRMS' },
  { id: 'noaa', label: 'NOAA', qid: 'Q214700', labelKind: 'seat', publishes: 'the watched climate.gov explainers, and the protocol’s sea-surface temperature' },
  { id: 'epa', label: 'United States Environmental Protection Agency', qid: 'Q460173', labelKind: 'seat', publishes: 'the watched climate-change and greenhouse-gas pages' },
  { id: 'cdc', label: 'Centers for Disease Control and Prevention', qid: 'Q583725', labelKind: 'seat', publishes: 'the watched climate-health and tobacco pages' },
  { id: 'bls', label: 'Bureau of Labor Statistics', qid: 'Q2928428', labelKind: 'seat', publishes: 'the watched Current Population Survey and employment release' },
  { id: 'us-state', label: 'United States Department of State', qid: 'Q789915', labelKind: 'seat', publishes: 'the watched climate-and-environment policy page' },
  { id: 'us-census', label: 'United States Census Bureau', qid: 'Q637413', labelKind: 'seat', publishes: 'the watched poverty topic page' },
  { id: 'white-house', label: 'White House', qid: 'Q35525', labelKind: 'seat', publishes: 'the watched priorities page' },
  { id: 'uk-gov', label: 'Government of the United Kingdom', qid: 'Q6063', labelKind: 'seat', publishes: 'the watched net-zero strategy and climate guidance' },
  { id: 'bundesregierung', label: 'Press and Information Office of the German Federal Government', qid: 'Q869805', labelKind: 'seat', publishes: 'the watched climate-protection page on bundesregierung.de' },
  { id: 'iea', label: 'International Energy Agency', qid: 'Q826700', labelKind: 'seat', publishes: 'the watched Net Zero by 2050 report page' },

  { id: 'mauna-loa', label: 'Mauna Loa Observatory', qid: 'Q622590', labelKind: 'station', publishes: 'the protocol’s carbon-dioxide reading — the one row here that is an instrument at a site' },
  {
    id: 'nsidc',
    label: 'National Snow and Ice Data Center',
    qid: 'Q1216646',
    labelKind: 'seat',
    publishes: 'the protocol’s sea-ice extent, north and south',
    via: { qid: 'Q736674', because: 'the University of Colorado Boulder campus the centre gives as its own address; Wikidata records no coordinate on the centre itself' },
  },
  { id: 'usgs', label: 'United States Geological Survey', qid: 'Q193755', labelKind: 'seat', publishes: 'the protocol’s earthquake count' },
  { id: 'un-desa', label: 'UN Department of Economic and Social Affairs', qid: 'Q2671637', labelKind: 'seat', publishes: 'the protocol’s world population figure' },
  { id: 'fao', label: 'Food and Agriculture Organization', qid: 'Q82151', labelKind: 'seat', publishes: 'the protocol’s food price index' },
  { id: 'ecb', label: 'European Central Bank', qid: 'Q8901', labelKind: 'seat', publishes: 'the protocol’s short-term rate' },
  { id: 'eia', label: 'U.S. Energy Information Administration', qid: 'Q1133499', labelKind: 'seat', publishes: 'the protocol’s Brent spot price' },
  { id: 'gdelt', label: 'GDELT Project', qid: 'Q18357239', labelKind: 'seat', publishes: 'the protocol’s count of reported conflict events' },
  { id: 'wikimedia', label: 'Wikimedia Foundation', qid: 'Q180', labelKind: 'seat', publishes: 'the protocol’s attention reading, through the pageviews API' },
  { id: 'wikimedia-de', label: 'Wikimedia Deutschland', qid: 'Q8288', labelKind: 'seat', publishes: 'the protocol’s loss-of-life reading, through Wikidata' },
]

interface Claim {
  mainsnak?: { datavalue?: { value?: { latitude?: number; longitude?: number; id?: string } } }
  qualifiers?: { P625?: Array<{ datavalue?: { value?: { latitude?: number; longitude?: number } } }> }
}

type Entity = { claims?: Record<string, Claim[]>; labels?: Record<string, { value: string }> }

async function entities(ids: string[]): Promise<Record<string, Entity>> {
  const out: Record<string, Entity> = {}
  for (let i = 0; i < ids.length; i += 40) {
    const url = `${API}?action=wbgetentities&ids=${ids.slice(i, i + 40).join('|')}&props=claims|labels&languages=en&format=json`
    const response = await fetch(url, { headers: { 'User-Agent': AGENT } })
    if (!response.ok) throw new Error(`wikidata: HTTP ${response.status}`)
    const body = (await response.json()) as { entities?: Record<string, Entity> }
    Object.assign(out, body.entities ?? {})
  }
  return out
}

const round4 = (n: number): number => Number(n.toFixed(4))

interface Resolved {
  lat: number | null
  lon: number | null
  how: string
}

function resolve(spec: SeatSpec, all: Record<string, Entity>): Resolved {
  const claims = all[spec.qid]?.claims ?? {}
  const own = claims.P625?.[0]?.mainsnak?.datavalue?.value
  if (own?.latitude !== undefined && own.longitude !== undefined) {
    return { lat: round4(own.latitude), lon: round4(own.longitude), how: `Wikidata coordinate location (P625) on ${spec.qid}` }
  }
  for (const statement of claims.P159 ?? []) {
    const qualifier = statement.qualifiers?.P625?.[0]?.datavalue?.value
    if (qualifier?.latitude !== undefined && qualifier.longitude !== undefined) {
      return {
        lat: round4(qualifier.latitude),
        lon: round4(qualifier.longitude),
        how: `the coordinate qualifying ${spec.qid}’s headquarters location (P159)`,
      }
    }
  }
  const seatQid = claims.P159?.[0]?.mainsnak?.datavalue?.value?.id
  const seatCoord = seatQid ? all[seatQid]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value : undefined
  if (seatCoord?.latitude !== undefined && seatCoord.longitude !== undefined) {
    const name = all[seatQid!]?.labels?.en?.value ?? seatQid
    return {
      lat: round4(seatCoord.latitude),
      lon: round4(seatCoord.longitude),
      how: `Wikidata coordinate location (P625) of ${name} (${seatQid}), which ${spec.qid}’s headquarters location (P159) names`,
    }
  }
  const viaCoord = spec.via ? all[spec.via.qid]?.claims?.P625?.[0]?.mainsnak?.datavalue?.value : undefined
  if (spec.via && viaCoord?.latitude !== undefined && viaCoord.longitude !== undefined) {
    const name = all[spec.via.qid]?.labels?.en?.value ?? spec.via.qid
    return {
      lat: round4(viaCoord.latitude),
      lon: round4(viaCoord.longitude),
      how: `Wikidata coordinate location (P625) of ${name} (${spec.via.qid}) — ${spec.via.because}`,
    }
  }
  return { lat: null, lon: null, how: `Wikidata holds no coordinate for ${spec.qid}, and none is invented here` }
}

async function build(): Promise<string> {
  const ids = new Set(SEATS.map((s) => s.qid))
  for (const spec of SEATS) if (spec.via) ids.add(spec.via.qid)
  const first = await entities([...ids])
  // A second pass, for the items a headquarters statement points at.
  const referenced = new Set<string>()
  for (const spec of SEATS) {
    const seatQid = first[spec.qid]?.claims?.P159?.[0]?.mainsnak?.datavalue?.value?.id
    if (seatQid && !ids.has(seatQid)) referenced.add(seatQid)
  }
  const all = { ...first, ...(referenced.size ? await entities([...referenced]) : {}) }

  const seats = SEATS.map((spec) => {
    const { lat, lon, how } = resolve(spec, all)
    return {
      id: spec.id,
      label: spec.label,
      lat,
      lon,
      labelKind: spec.labelKind,
      qid: spec.qid,
      note: `Publishes ${spec.publishes}. Coordinate: ${how}.`,
    }
  })

  const file = {
    _:
      'Where an institution stands — the seats behind the readings this house publishes, and the ' +
      'one physical station among them. Derived, never hand-edited: change the curated list in ' +
      'scripts/build-globe-seats.ts and rebuild.',
    derivation:
      'The sixteen institutions of pipelines/redaction/src/redaction/watchlist.py and the bodies ' +
      'behind the fourteen readings of src/content/protokoll, each resolved against Wikidata.',
    regenerate: 'npx tsx scripts/build-globe-seats.ts (needs the network; --check fails on drift)',
    coordinate_rule:
      'Wikidata, in this order: P625 on the body’s own item; the P625 qualifier on its P159 ' +
      '(headquarters location); P625 on the item that P159 names; P625 on an item named ' +
      'explicitly in the builder for a body Wikidata places by no other means. Every row’s note ' +
      'says which step answered. Where none does, the row carries no coordinate and says so.',
    counts: {
      seats: seats.length,
      stations: seats.filter((s) => s.labelKind === 'station').length,
      placed: seats.filter((s) => s.lat !== null).length,
    },
    seats,
  }
  return `${JSON.stringify(file, null, 2)}\n`
}

const text = await build()
if (process.argv.includes('--check')) {
  if (readFileSync(OUT, 'utf8') !== text) {
    console.error(`✗ ${OUT} differs from a fresh resolution — run: npx tsx scripts/build-globe-seats.ts`)
    process.exit(1)
  }
  console.log(`${OUT}: in step with Wikidata`)
} else {
  writeFileSync(OUT, text, 'utf8')
  const parsed = JSON.parse(text) as { counts: Record<string, number> }
  console.log(`${OUT}: ${parsed.counts.seats} rows, ${parsed.counts.stations} station(s), ${parsed.counts.placed} placed`)
}
