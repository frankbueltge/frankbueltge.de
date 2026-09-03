// src/lib/tour/globe-stories.ts — the living globe's guided stories (G2, 2026-09-03; the three
// late stories added the same day once G3 registered their layers): six readings of this house's
// own archive on the tour engine that already drives the Studio's floor and the Field's plate,
// with ONE figure between them — the globe in the room.
//
// The division every tour on this site keeps, kept here too:
//   · the FRAME — the room's heading, each story's title and standfirst, every scene's kicker,
//     heading and lead — lives in src/config/globe-wording.ts (GLOBE.stories). It carries no
//     count, no date and no coordinate; the digit guard over that file proves it.
//   · the SUBSTANCE is every `quote.text` below. Each one is a BYTE-EXACT substring of the
//     committed file its `source` names, proven by globe-stories.test.ts against the real
//     filesystem. A scene whose quote cannot be verified is CUT, never paraphrased.
//
// WHAT A SCENE MAY ASK THE GLOBE FOR, and nothing else: a set of layers (the last one is the one in
// front, per the room's emphasis rule), a day of the archive, a place for the camera to stand, and
// at most one selected mark. It may not ask for a number, a sentence, a colour or a layer that is
// not registered — its own test refuses each of those.
//
// NOTHING HERE IS TYPED THAT CAN BE DERIVED. The mark keys and every camera coordinate come out of
// the same adapters the globe draws from (the ghost fleet's own frame for the night in question,
// the protocol's frame for the reading in question, the committed seats file for a vantage, the
// balance/consensus/redaction layers' own frames for a country's or an institution's mark), so a
// story cannot point at a mark the globe does not draw, and a moved seat or a recomputed centroid
// moves the camera with it. What IS typed is the quotes — and those are exactly what the harness
// checks against the bytes.
//
// THE THREE STORIES THAT WAITED. The plan named six from the start; G2 shipped the three that
// needed no layer G3 had not yet built (the ghost fleet, the sky, the protocol), and left Balance,
// Consensus and Redaction unwritten on purpose — not stubbed, not commented out as a draft, because
// a story may only name a registered layer id and a scene pointing at a layer nobody has built is
// exactly the kind of promise this globe exists to stop making. G3 registered `balance`,
// `consensus-tld`, `redaction-seats` and `redaction-world` across its three evenings, and the three
// stories below are those three, written the same day: **Where the press looks at itself** (three
// nights of the tone-gap record, camera Europe to the Americas, closing on one country's mark),
// **One sentence, and the outlets that carried it** (one day of the most-echoed phrase, camera over
// the country of its first masthead) and **What the record removed** (three nights of the
// institutional removals, camera Geneva to Washington, its last scene bringing the wider press's
// own chamber in front and closing on one removal's mark).
import { GLOBE } from '@/config/globe-wording'
import { balanceLayer } from '@/lib/globe/layers/balance'
import { consensusTldLayer } from '@/lib/globe/layers/consensus-tld'
import { germanVantageNote } from '@/lib/globe/layers/redaction-world'
import { dayPath, readJson } from '@/lib/globe/layers/archive'
import { ghostFleetLayer } from '@/lib/globe/layers/ghost-fleet'
import { protocolLayer } from '@/lib/globe/layers/protocol'
import { redactionSeatsLayer } from '@/lib/globe/layers/redaction-seats'
import { skyLayer } from '@/lib/globe/layers/sky'
import type { LayerRecord } from '@/lib/globe/layers/types'
import { centroidOfIso3 } from '@/lib/globe/crosswalk'
import { redactionSeatFor, seatPoint } from '@/lib/globe/seats'
import type { WorldData } from '@/lib/redaction/world'
import type { Scene, Tour } from './types'

/** The DOM id the room's island registers under, and the figure every scene of every story below
 *  drives. One id, exported from here and read by LivingGlobePage.astro, so the room and the
 *  stories cannot drift into two figures that never find each other. */
export const GLOBE_FIGURE = 'living-globe'

const w = GLOBE.stories

// ── the files these stories read ─────────────────────────────────────────────────────────────────

/** the night the ghost-fleet story walks — a committed, immutable archive file */
export const FLEET_NIGHT = '2026-08-16'
const FLEET_FILE = `src/data/ghost-fleet/${FLEET_NIGHT}.json`

/** the nights the minutes story walks, oldest first: the first night the archive holds, the night a
 *  source did not answer, a night in the middle of the melting season, a night carrying a number
 *  older than itself, and the newest night this story was written from */
export const MINUTES_NIGHTS = ['2026-06-11', '2026-06-29', '2026-07-21', '2026-08-16', '2026-09-03'] as const
const minutesFile = (day: string): string => `src/content/protokoll/2026/${day}.json`

const ELEMENTS = 'src/data/ueberflug/satellites.json'
const SEATS = 'src/data/globe/seats.json'
const SKY_ADAPTER = 'src/lib/globe/layers/sky.ts'
const METHOD = 'src/components/pages/MethodenblattGlobe.astro'

/** The day the sky layer's elements were taken — the ONE day that layer draws on, read from the
 *  layer itself rather than typed: the pipeline refreshes those elements every night, so a day
 *  written into this file would be wrong by morning and the story would look at an empty sphere. */
const SKY_DAY = skyLayer.instant?.day ?? skyLayer.asOf

/** the three nights the balance story walks, oldest first — a Romania headline over Europe, a
 *  later night whose Brazil row carries a wide gap, and the newest night this house's archive
 *  holds at all, which is also the newest night the balance layer itself holds */
export const BALANCE_NIGHTS = ['2026-08-13', '2026-09-01', '2026-09-03'] as const
const balanceFile = (day: string): string => `src/data/balance/${day}.json`

/** the one day the consensus-by-domain story walks — the newest day this record's own mastheads
 *  resolve to more than one country, so the honesty rule about a domain with no country in it has
 *  something to stand next to rather than an empty sphere */
export const CONSENSUS_DAY = '2026-08-24'
const consensusFile = (day: string): string => `src/data/consensus/${day}.json`

const REDACTION_SEATS_ADAPTER = 'src/lib/globe/layers/redaction-seats.ts'
const redactionFile = (day: string): string => `src/data/redaction/${day}.json`

/** the one night the world chamber's own scene reads — the exact night that adapter's own header
 *  names as the night an American television station's `.tv` domain (a Tuvalu registration, not a
 *  Tuvaluan newsroom) came back gone, which is the honesty rule of that layer made concrete rather
 *  than asserted */
export const WORLD_DAY = '2026-09-02'
const WORLD_DIR = 'src/data/redaction/world'
const worldFile = (day: string): string => `${WORLD_DIR}/${day}.json`

// ── the marks and the places, derived from the same adapters the globe draws ──────────────────────

/** The longest gap of a night, out of that night's own frame — by the record's own value, which the
 *  adapter fills with the gap's length in hours. Not "the first event in the file": the file's order
 *  is the source's business and could change without anybody noticing. */
function longestGap(day: string): LayerRecord {
  const records = ghostFleetLayer.frame(day).records
  const longest = records.reduce<LayerRecord | null>(
    (best, record) => (best === null || (record.value ?? 0) > (best.value ?? 0) ? record : best),
    null,
  )
  if (!longest) throw new Error(`globe stories: ${FLEET_FILE} holds no drawable gap — the fleet story has nothing to walk`)
  return longest
}

/** One reading's mark on a night, found by the locator the protocol adapter writes into every
 *  receipt (`entries[n] · <top_id> · as of …`). A reading the night could not take has no mark at
 *  all, and this throws rather than shipping a story that selects nothing. */
function reading(day: string, topId: string): LayerRecord {
  const record = protocolLayer.frame(day).records.find((r) => r.receipt.locator.includes(` · ${topId} · `))
  if (!record) throw new Error(`globe stories: ${minutesFile(day)} carries no drawable "${topId}" reading`)
  return record
}

/** A camera over a committed seat. The seats file is the same one the protocol layer places its
 *  marks from, so the camera cannot look somewhere else than the mark it is talking about. */
function overSeat(id: string, zoom: number): { longitude: number; latitude: number; zoom: number } {
  const point = seatPoint(id)
  if (!point) throw new Error(`globe stories: the seat "${id}" carries no coordinate, so no camera can stand over it`)
  return { longitude: point[0], latitude: point[1], zoom }
}

/** One country's row on one night of the balance layer, found by the name the crosswalk resolved
 *  it to — never the FIPS code the source file itself uses, so a scene reads the same name a
 *  visitor sees on the card. */
function balanceCountry(day: string, name: string): LayerRecord {
  const record = balanceLayer.frame(day).records.find((r) => 'name' in r.at && r.at.name === name)
  if (!record) throw new Error(`globe stories: ${balanceFile(day)} carries no drawable balance row for "${name}"`)
  return record
}

/** A camera over a balance country's centroid. `balance`'s own records carry no centroid of their
 *  own (a `countries`-kind fill is keyed by code alone, drawn from a polygon fetched once), so this
 *  asks the same crosswalk function the layer asks to decide whether the country can be drawn at
 *  all — never a second, independent lookup. */
function overBalanceCountry(day: string, name: string, zoom: number): { longitude: number; latitude: number; zoom: number } {
  const record = balanceCountry(day, name)
  const at = record.at as { iso3: string; name: string }
  const centroid = centroidOfIso3(at.iso3)
  if (!centroid) throw new Error(`globe stories: "${name}" carries no centroid to stand a camera over`)
  return { longitude: centroid[0], latitude: centroid[1], zoom }
}

/** One country's mark on the consensus-by-domain layer, found by the crosswalk name it resolved
 *  to. Its `at` already carries the centroid the drawing needs (G3's third evening put it there),
 *  so the camera comes straight off the record rather than a second crosswalk lookup. */
function consensusCountry(day: string, name: string): LayerRecord {
  const record = consensusTldLayer.frame(day).records.find((r) => 'name' in r.at && r.at.name === name)
  if (!record) throw new Error(`globe stories: ${consensusFile(day)} carries no drawable consensus-tld mark for "${name}"`)
  return record
}

function overConsensusCountry(day: string, name: string, zoom: number): { longitude: number; latitude: number; zoom: number } {
  const record = consensusCountry(day, name)
  const at = record.at as { iso3: string; name: string; centroid?: [number, number] }
  if (!at.centroid) throw new Error(`globe stories: "${name}" carries no centroid to stand a camera over`)
  return { longitude: at.centroid[0], latitude: at.centroid[1], zoom }
}

/** One institution's mark on one night of the redaction-seats layer, found by the words its own
 *  receipt is built from (`wordsFor` in that adapter always opens with the institution's own name)
 *  rather than a reconstructed key — so a renamed key format cannot silently point this story at
 *  the wrong mark. */
function redactionMark(day: string, institution: string): LayerRecord {
  const record = redactionSeatsLayer.frame(day).records.find((r) => r.receipt.words.startsWith(institution))
  if (!record) throw new Error(`globe stories: ${redactionFile(day)} carries no drawable redaction-seats mark for "${institution}"`)
  return record
}

/** A camera over the seat an institution of the redaction watch publishes from — the same lookup
 *  the layer itself makes before it ever draws a mark there. */
function overInstitution(institution: string, zoom: number): { longitude: number; latitude: number; zoom: number } {
  return overSeat(redactionSeatFor(institution), zoom)
}

/** The world chamber's own caution about reading a 451 from a German vantage point, read off the
 *  committed file rather than retyped — the same function the layer itself uses to find it, so a
 *  day whose record stopped carrying the caution fails this module at build time instead of
 *  shipping a quote nothing backs. */
const WORLD_DATA = readJson<WorldData>(dayPath(WORLD_DIR, WORLD_DAY))
const WORLD_VANTAGE_NOTE = germanVantageNote(WORLD_DATA)
if (!WORLD_VANTAGE_NOTE) {
  throw new Error(`globe stories: ${worldFile(WORLD_DAY)} carries no German-vantage caution to quote`)
}

const GAP = longestGap(FLEET_NIGHT)
const GAP_AT = GAP.at as { from: [number, number]; to: [number, number] }
/** the middle of the gap, as the longitude between its two ends — where the whole arc is in frame */
const GAP_MID = (GAP_AT.from[0] + GAP_AT.to[0]) / 2

const over = (longitude: number, latitude: number, zoom: number) => ({ longitude, latitude, zoom })

// ── the stories ──────────────────────────────────────────────────────────────────────────────────

const fleetScenes: Scene[] = [
  {
    id: 'the-night-as-it-was-written',
    ...w.fleet.scenes.night,
    quotes: [
      {
        text: '"examined": 263',
        source: FLEET_FILE,
        locator: 'window — how many gaps the night looked at',
      },
      {
        text: '"in_eez": 90',
        source: FLEET_FILE,
        locator: 'index — of the silences it indexed, how many fell inside an exclusive economic zone',
      },
      {
        text: '"on_high_seas": 0',
        source: FLEET_FILE,
        locator: 'index — and how many out where nobody’s rules reach',
      },
      {
        text: '"name": "Global Fishing Watch — Events API (AIS gaps)"',
        source: FLEET_FILE,
        locator: 'source — who counted, and under whose terms',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['ghost-fleet'],
      time: { day: FLEET_NIGHT },
      camera: over(GAP_MID, GAP_AT.from[1], 1.05),
    },
  },
  {
    id: 'the-gap-the-night-picked',
    ...w.fleet.scenes.pick,
    quotes: [
      {
        text: '"pick": "159e612dddcb6b115669fb143bb2b908"',
        source: FLEET_FILE,
        locator: 'pick — the one event the night names, at the top level of its own file',
      },
      {
        text: '"duration_hours": 1427.6',
        source: FLEET_FILE,
        locator: 'events[0] — how long the transponder was off',
      },
      {
        text: '"name": "TX0PITUNA DOS"',
        source: FLEET_FILE,
        locator: 'events[0].vessel — the name the registry carries',
      },
      {
        text: '"flag": "PAN"',
        source: FLEET_FILE,
        locator: 'events[0].vessel — and the flag it sails under',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['ghost-fleet'],
      time: { day: FLEET_NIGHT },
      camera: over(GAP_MID, GAP_AT.from[1], 2.0),
    },
  },
  {
    id: 'where-the-record-stops',
    ...w.fleet.scenes.off,
    quotes: [
      { text: '"lat": 6.679', source: FLEET_FILE, locator: 'events[0].off — the latitude it fell silent at' },
      { text: '"lon": -90.2376', source: FLEET_FILE, locator: 'events[0].off — and the longitude' },
      {
        text: '"eez_name": "Costa Rican EEZ"',
        source: FLEET_FILE,
        locator: 'events[0].regions — whose waters those are',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['ghost-fleet'],
      time: { day: FLEET_NIGHT },
      camera: over(GAP_AT.from[0], GAP_AT.from[1], 2.9),
    },
  },
  {
    id: 'where-the-record-resumes',
    ...w.fleet.scenes.on,
    quotes: [
      { text: '"lon": -106.2095', source: FLEET_FILE, locator: 'events[0].on — the longitude it spoke again at' },
      {
        text: '"start": "2026-06-12T12:35:34.000Z"',
        source: FLEET_FILE,
        locator: 'events[0] — when the silence began',
      },
      {
        text: '"end": "2026-08-11T00:14:14.000Z"',
        source: FLEET_FILE,
        locator: 'events[0] — and when it ended',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['ghost-fleet'],
      time: { day: FLEET_NIGHT },
      camera: over(GAP_AT.to[0], GAP_AT.to[1], 2.9),
    },
  },
  {
    id: 'a-line-and-no-claim-about-the-way',
    ...w.fleet.scenes.arc,
    quotes: [
      { text: 'An arc is not a track.', source: METHOD, locator: 'the method sheet, section four — limits' },
      {
        text: 'the shortest path it could have taken, never the path it did take. What happened in between is precisely what nobody holds.',
        source: METHOD,
        locator: 'the method sheet, section four — the same limit, said out',
      },
      {
        text: '"id": "159e612dddcb6b115669fb143bb2b908"',
        source: FLEET_FILE,
        locator: 'events[0] — the event this mark is, and what the card now holds',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['ghost-fleet'],
      time: { day: FLEET_NIGHT },
      camera: over(GAP_MID, GAP_AT.from[1], 1.9),
      select: GAP.key,
    },
  },
]

export const fleetNightStory: Tour = {
  id: 'globe-a-night-of-the-ghost-fleet',
  practice: 'lab',
  title: w.fleet.title,
  standfirst: w.fleet.standfirst,
  provenance: [FLEET_FILE, METHOD],
  scenes: fleetScenes,
}

const skyScenes: Scene[] = [
  {
    id: 'elements-not-a-night',
    ...w.sky.scenes.instant,
    quotes: [
      {
        text: 'So the sky draws only on the day its elements are FROM.',
        source: SKY_ADAPTER,
        locator: 'the layer’s own header — why it has one day and not eighty',
      },
      {
        text: 'The satellites are the one exception to the no-clock rule, and it cuts both ways.',
        source: METHOD,
        locator: 'the method sheet, section four — limits',
      },
      {
        text: '"name": "CelesTrak"',
        source: ELEMENTS,
        locator: 'sources — where the elements come from',
      },
      {
        text: '"url": "https://celestrak.org/NORAD/elements/"',
        source: ELEMENTS,
        locator: 'sources — and where they can be fetched again',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['sky'],
      time: { day: SKY_DAY },
      camera: overSeat('bundesregierung', 1.0),
    },
  },
  {
    id: 'the-vantage-is-the-houses',
    ...w.sky.scenes.vantage,
    quotes: [
      {
        text: 'Coordinate: Wikidata coordinate location (P625) of Presse- und Informationsamt der Bundesregierung Berlin (Q131145550), which Q869805’s headquarters location (P159) names.',
        source: SEATS,
        locator: 'seats[] — the note on the seat this scene stands over',
      },
      {
        text: 'Every row’s note says which step answered. Where none does, the row carries no coordinate and says so.',
        source: SEATS,
        locator: 'coordinate_rule — the rule that placed it',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['sky'],
      time: { day: SKY_DAY },
      camera: overSeat('bundesregierung', 2.2),
    },
  },
  {
    id: 'what-passes-over-it',
    ...w.sky.scenes.named,
    quotes: [
      { text: '"name": "LANDSAT 9"', source: ELEMENTS, locator: 'satellites[] — a name in the fleet' },
      { text: '"owner": "USGS/GSFC"', source: ELEMENTS, locator: 'satellites[].gcat — who the second source names for it' },
      { text: '"name": "TERRASAR-X"', source: ELEMENTS, locator: 'satellites[] — one of the pair' },
      { text: '"name": "TANDEM-X"', source: ELEMENTS, locator: 'satellites[] — and the other' },
      {
        text: '"owner": "DLR2/EASF"',
        source: ELEMENTS,
        locator: 'satellites[].gcat — the owner both rows of that pair carry',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['sky'],
      time: { day: SKY_DAY },
      camera: overSeat('bundesregierung', 1.6),
    },
  },
  {
    id: 'why-every-other-night-is-empty',
    ...w.sky.scenes.empty,
    quotes: [
      {
        text: 'exception stays exactly where it was declared: on the newest frame, and nowhere else.',
        source: SKY_ADAPTER,
        locator: 'the layer’s own header — where the exception is allowed to live',
      },
      {
        text: 'propagating today’s orbits into the past.',
        source: SKY_ADAPTER,
        locator: 'the words the layer says on every day it draws nothing on',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['sky'],
      time: { day: SKY_DAY },
      camera: over(0, 0, 1.0),
    },
  },
]

export const skyOverReaderStory: Tour = {
  id: 'globe-the-sky-over-the-reader',
  practice: 'lab',
  title: w.sky.title,
  standfirst: w.sky.standfirst,
  provenance: [ELEMENTS, SEATS, SKY_ADAPTER, METHOD],
  scenes: skyScenes,
}

const minutesScenes: Scene[] = [
  {
    id: 'where-the-minutes-begin',
    ...w.minutes.scenes.first,
    quotes: [
      {
        text: '"top_id": "co2"',
        source: minutesFile(MINUTES_NIGHTS[0]),
        locator: 'entries[0] — which reading this is',
      },
      { text: '"value": 427.76', source: minutesFile(MINUTES_NIGHTS[0]), locator: 'entries[0] — what it read' },
      {
        text: '"record": true',
        source: minutesFile(MINUTES_NIGHTS[0]),
        locator: 'entries[0] — the file’s own flag for a reading that set one',
      },
      {
        text: '"name": "NOAA Global Monitoring Laboratory (Mauna Loa)"',
        source: minutesFile(MINUTES_NIGHTS[0]),
        locator: 'entries[0].source — who took it, at the site the mark stands on',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['protocol'],
      time: { day: MINUTES_NIGHTS[0] },
      camera: overSeat('mauna-loa', 1.2),
    },
  },
  {
    id: 'a-hole-that-stays-a-hole',
    ...w.minutes.scenes.hole,
    quotes: [
      {
        text: '"top_id": "fires"',
        source: minutesFile(MINUTES_NIGHTS[1]),
        locator: 'entries[4] — the reading that was owed',
      },
      {
        text: '"note": "SourceUnavailable: https://firms.modaps.eosdis.nasa.gov/api/area/csv/***/VIIRS_SNPP_NRT/world/1: ConnectError: [Errno 101] Network is unreachable"',
        source: minutesFile(MINUTES_NIGHTS[1]),
        locator: 'entries[4] — what the night got instead, kept verbatim',
      },
      {
        text: 'they are counted, not drawn.',
        source: 'src/lib/globe/layers/protocol.ts',
        locator: 'the layer’s own words for a reading it cannot place on the earth',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['protocol'],
      time: { day: MINUTES_NIGHTS[1] },
      camera: overSeat('nasa', 1.2),
    },
  },
  {
    id: 'two-hemispheres-one-address',
    ...w.minutes.scenes.ice,
    quotes: [
      {
        text: '"top_id": "seaice_north"',
        source: minutesFile(MINUTES_NIGHTS[2]),
        locator: 'entries[1] — the northern reading',
      },
      { text: '"value": 7.316', source: minutesFile(MINUTES_NIGHTS[2]), locator: 'entries[1] — what it read' },
      {
        text: '"top_id": "seaice_south"',
        source: minutesFile(MINUTES_NIGHTS[2]),
        locator: 'entries[2] — the southern one, from the same body',
      },
      { text: '"value": 15.173', source: minutesFile(MINUTES_NIGHTS[2]), locator: 'entries[2] — and what that read' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['protocol'],
      time: { day: MINUTES_NIGHTS[2] },
      camera: overSeat('nsidc', 1.2),
    },
  },
  {
    id: 'the-date-a-reading-is-as-of',
    ...w.minutes.scenes.older,
    quotes: [
      {
        text: '"top_id": "food"',
        source: minutesFile(MINUTES_NIGHTS[3]),
        locator: 'entries[8] — the index this scene is about',
      },
      {
        text: '"as_of": "2026-05-31"',
        source: minutesFile(MINUTES_NIGHTS[3]),
        locator: 'entries[8] — the date the number is actually from',
      },
      {
        text: '"name": "FAO Food Price Index (2014–2016 = 100)"',
        source: minutesFile(MINUTES_NIGHTS[3]),
        locator: 'entries[8].source — who publishes it, and against which base',
      },
      {
        text: 'A seat is not a measurement site.',
        source: METHOD,
        locator: 'the method sheet, section four — limits',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['protocol'],
      time: { day: MINUTES_NIGHTS[3] },
      camera: overSeat('fao', 1.2),
    },
  },
  {
    id: 'the-same-reading-a-season-later',
    ...w.minutes.scenes.last,
    quotes: [
      {
        text: '"value": 427.88',
        source: minutesFile(MINUTES_NIGHTS[4]),
        locator: 'entries[0] — the reading on the last night this story walks',
      },
      {
        text: '"value": 426.21',
        source: minutesFile(MINUTES_NIGHTS[4]),
        locator: 'entries[0].comparison — the same day of the year before, as the file carries it',
      },
      {
        text: '"value": 4.733',
        source: minutesFile(MINUTES_NIGHTS[4]),
        locator: 'entries[1] — and the northern ice, a season on from where this story started',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['protocol'],
      time: { day: MINUTES_NIGHTS[4] },
      camera: overSeat('mauna-loa', 1.4),
      select: reading(MINUTES_NIGHTS[4], 'co2').key,
    },
  },
]

export const planetsMinutesStory: Tour = {
  id: 'globe-the-planets-minutes',
  practice: 'lab',
  title: w.minutes.title,
  standfirst: w.minutes.standfirst,
  provenance: [
    ...MINUTES_NIGHTS.map(minutesFile),
    'src/lib/globe/layers/protocol.ts',
    METHOD,
  ],
  scenes: minutesScenes,
}

const balanceScenes: Scene[] = [
  {
    id: 'the-headline-the-day-carried',
    ...w.balance.scenes.headline,
    quotes: [
      { text: '"name": "Romania"', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'headline — the country the day’s own file names' },
      { text: '"direction": "self_brighter"', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'headline — which way the gap ran' },
      { text: '"gap": 5.789', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'headline — the gap itself, as the file computed it' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['balance'],
      time: { day: BALANCE_NIGHTS[0] },
      camera: overBalanceCountry(BALANCE_NIGHTS[0], 'Romania', 1.6),
    },
  },
  {
    id: 'the-same-night-a-different-country',
    ...w.balance.scenes.elsewhere,
    quotes: [
      { text: '"name": "Netherlands"', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[] — a row the headline never names' },
      { text: '"self": -1.928', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[].dims.tone — the tone of its own press' },
      { text: '"foreign": 0.039', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[].dims.tone — and the tone of the world’s press about it' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['balance'],
      time: { day: BALANCE_NIGHTS[0] },
      camera: overBalanceCountry(BALANCE_NIGHTS[0], 'Netherlands', 1.8),
    },
  },
  {
    id: 'the-same-file-an-ocean-away',
    ...w.balance.scenes.crossing,
    quotes: [
      { text: '"name": "United States"', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[] — a row from the very same night' },
      { text: '"self": -1.104', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[].dims.tone — its own press' },
      { text: '"foreign": -0.669', source: balanceFile(BALANCE_NIGHTS[0]), locator: 'countries[].dims.tone — the world’s press about it' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['balance'],
      time: { day: BALANCE_NIGHTS[0] },
      camera: overBalanceCountry(BALANCE_NIGHTS[0], 'United States', 1.2),
    },
  },
  {
    id: 'a-different-night-the-same-measure',
    ...w.balance.scenes.further,
    quotes: [
      { text: '"name": "Brazil"', source: balanceFile(BALANCE_NIGHTS[1]), locator: 'countries[] — a row from a later night' },
      { text: '"self": -1.391', source: balanceFile(BALANCE_NIGHTS[1]), locator: 'countries[].dims.tone — its own press' },
      { text: '"foreign": 0.728', source: balanceFile(BALANCE_NIGHTS[1]), locator: 'countries[].dims.tone — the world’s press about it' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['balance'],
      time: { day: BALANCE_NIGHTS[1] },
      camera: overBalanceCountry(BALANCE_NIGHTS[1], 'Brazil', 1.4),
    },
  },
  {
    id: 'the-newest-night-this-story-holds',
    ...w.balance.scenes.newest,
    quotes: [
      { text: '"name": "Jamaica"', source: balanceFile(BALANCE_NIGHTS[2]), locator: 'countries[] — the row this scene opens' },
      { text: '"self": -0.048', source: balanceFile(BALANCE_NIGHTS[2]), locator: 'countries[].dims.tone — its own press' },
      { text: '"foreign": 1.657', source: balanceFile(BALANCE_NIGHTS[2]), locator: 'countries[].dims.tone — the world’s press about it' },
      { text: 'A country is NOT a place, and this layer is the first on the globe that has to mean it.', source: 'src/lib/globe/layers/balance.ts', locator: 'the layer’s own header — why a fill is a shape and not a spot' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['balance'],
      time: { day: BALANCE_NIGHTS[2] },
      camera: overBalanceCountry(BALANCE_NIGHTS[2], 'Jamaica', 2.4),
      select: balanceCountry(BALANCE_NIGHTS[2], 'Jamaica').key,
    },
  },
]

export const balanceStory: Tour = {
  id: 'globe-where-the-press-looks-at-itself',
  practice: 'lab',
  title: w.balance.title,
  standfirst: w.balance.standfirst,
  provenance: [...BALANCE_NIGHTS.map(balanceFile), 'src/lib/globe/layers/balance.ts'],
  scenes: balanceScenes,
}

const consensusScenes: Scene[] = [
  {
    id: 'the-sentence-the-day-echoed',
    ...w.consensus.scenes.phrase,
    quotes: [
      { text: '"phrase": "details rift with dismissed defence minister"', source: consensusFile(CONSENSUS_DAY), locator: 'headline — the phrase this record found' },
      { text: '"sample_title": "Zelensky details rift with dismissed defence minister"', source: consensusFile(CONSENSUS_DAY), locator: 'headline — the headline it was drawn from' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['consensus-tld'],
      time: { day: CONSENSUS_DAY },
      camera: overConsensusCountry(CONSENSUS_DAY, 'United Kingdom', 1.0),
    },
  },
  {
    id: 'the-first-masthead-to-carry-it',
    ...w.consensus.scenes.first,
    quotes: [
      { text: '"first_domain": "readingchronicle.co.uk"', source: consensusFile(CONSENSUS_DAY), locator: 'headline — the outlet the file names first' },
      { text: '"domain_count": 163', source: consensusFile(CONSENSUS_DAY), locator: 'headline — how many outlets the file counts in all' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['consensus-tld'],
      time: { day: CONSENSUS_DAY },
      camera: overConsensusCountry(CONSENSUS_DAY, 'United Kingdom', 1.6),
    },
  },
  {
    id: 'the-list-the-file-itself-keeps',
    ...w.consensus.scenes.list,
    quotes: [
      { text: '"andoveradvertiser.co.uk"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[0]' },
      { text: '"basingstokegazette.co.uk"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[3]' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['consensus-tld'],
      time: { day: CONSENSUS_DAY },
      camera: overConsensusCountry(CONSENSUS_DAY, 'United Kingdom', 1.8),
    },
  },
  {
    id: 'the-same-list-a-different-registry',
    ...w.consensus.scenes.elsewhere,
    quotes: [
      { text: '"bendigoadvertiser.com.au"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[4]' },
      { text: '"dailyadvertiser.com.au"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[31]' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['consensus-tld'],
      time: { day: CONSENSUS_DAY },
      camera: overConsensusCountry(CONSENSUS_DAY, 'Australia', 1.8),
    },
  },
  {
    id: 'what-a-registration-does-not-say',
    ...w.consensus.scenes.noCountry,
    quotes: [
      { text: '"dunfermlinepress.com"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[39] — a domain the layer places nowhere' },
      { text: '"bicesteradvertiser.net"', source: consensusFile(CONSENSUS_DAY), locator: 'headline.mastheads[5] — the same rule, a different generic domain' },
      {
        text: 'a top-level domain is a registration and not a location',
        source: 'src/lib/globe/layers/consensus-tld.ts',
        locator: 'the layer’s own caution, stated in its readout',
      },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['consensus-tld'],
      time: { day: CONSENSUS_DAY },
      camera: overConsensusCountry(CONSENSUS_DAY, 'United Kingdom', 1.0),
    },
  },
]

export const consensusOutletsStory: Tour = {
  id: 'globe-one-sentence-and-the-outlets-that-carried-it',
  practice: 'lab',
  title: w.consensus.title,
  standfirst: w.consensus.standfirst,
  provenance: [consensusFile(CONSENSUS_DAY), 'src/lib/globe/layers/consensus-tld.ts'],
  scenes: consensusScenes,
}

const REDACTION_NIGHTS = ['2026-08-11', '2026-08-13', WORLD_DAY] as const

const redactionScenes: Scene[] = [
  {
    id: 'the-watch-and-what-it-found',
    ...w.redaction.scenes.geneva,
    quotes: [
      { text: '"institution": "WHO"', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — the body the night names' },
      { text: '"label": "Luftqualität und Gesundheit"', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — the watch-list’s own label, unchanged' },
      { text: '"removed_tokens": 870', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — how much of the page the night counted as taken' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats'],
      time: { day: REDACTION_NIGHTS[0] },
      camera: overInstitution('WHO', 1.4),
    },
  },
  {
    id: 'a-second-address-the-same-city',
    ...w.redaction.scenes.secondSeat,
    quotes: [
      { text: '"institution": "UNHCR"', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — a second body, the same night' },
      { text: '"label": "Flüchtlingsstatistik"', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — its own label' },
      { text: '"kind": "deletion"', source: redactionFile(REDACTION_NIGHTS[0]), locator: 'redactions[] — the whole page gone, not passages struck out' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats'],
      time: { day: REDACTION_NIGHTS[0] },
      camera: overInstitution('UNHCR', 2.0),
    },
  },
  {
    id: 'a-whole-page-not-a-passage',
    ...w.redaction.scenes.wholePage,
    quotes: [
      { text: '"institution": "IPCC"', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — a body watched at a third address in the same city' },
      { text: '"label": "Sonderbericht 1,5 °C"', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — the page named' },
      { text: '"removed_tokens": 4562', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — the largest single loss this story walks' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats'],
      time: { day: REDACTION_NIGHTS[1] },
      camera: overInstitution('IPCC', 2.4),
    },
  },
  {
    id: 'the-same-night-a-seat-in-washington',
    ...w.redaction.scenes.washington,
    quotes: [
      { text: '"institution": "US Census"', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — the same night’s file, a seat on another continent' },
      { text: '"label": "Armut (Themenseite)"', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — the page named' },
      { text: '"removed_tokens": 617', source: redactionFile(REDACTION_NIGHTS[1]), locator: 'redactions[] — how much the night counted here' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats'],
      time: { day: REDACTION_NIGHTS[1] },
      camera: overInstitution('US Census', 1.6),
    },
  },
  {
    id: 'the-nights-own-pick',
    ...w.redaction.scenes.pick,
    quotes: [
      {
        text: '"pick": "20260825110649_www.census.gov_topics_income-poverty_poverty.html"',
        source: redactionFile(REDACTION_NIGHTS[2]),
        locator: 'pick — the one row this night’s own file names, at its top level',
      },
      { text: '"removed_tokens": 57', source: redactionFile(REDACTION_NIGHTS[2]), locator: 'redactions[] — a smaller loss, the same seat' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats'],
      time: { day: REDACTION_NIGHTS[2] },
      camera: overInstitution('US Census', 2.0),
    },
  },
  {
    id: 'a-second-chamber-the-same-night',
    ...w.redaction.scenes.world,
    quotes: [
      {
        text: 'the mark is the seat of a body, never the place a page was written',
        source: REDACTION_SEATS_ADAPTER,
        locator: 'the layer’s own source line — the rule this whole story has kept',
      },
      { text: WORLD_VANTAGE_NOTE, source: worldFile(WORLD_DAY), locator: 'deletion.notes — the record’s own caution, quoted whole' },
      { text: '"domain": "wgxa.tv"', source: worldFile(WORLD_DAY), locator: 'deletion.receipts — a host this chamber found gone that night' },
    ],
    focus: {
      figure: GLOBE_FIGURE,
      layers: ['redaction-seats', 'redaction-world'],
      time: { day: REDACTION_NIGHTS[2] },
      camera: overInstitution('US Census', 2.2),
      select: redactionMark(REDACTION_NIGHTS[2], 'US Census').key,
    },
  },
]

export const redactionRemovedStory: Tour = {
  id: 'globe-what-the-record-removed',
  practice: 'lab',
  title: w.redaction.title,
  standfirst: w.redaction.standfirst,
  provenance: [
    ...REDACTION_NIGHTS.map(redactionFile),
    worldFile(WORLD_DAY),
    REDACTION_SEATS_ADAPTER,
  ],
  scenes: redactionScenes,
}

/** The stories the room mounts, in the order it mounts them. The three G2 shipped stand first,
 *  because a returning reader's deep link and any external reference to them should keep pointing
 *  at the same position in the list: the one night, the one moment, the season. The three G3's
 *  layers made possible follow in the order their layers were registered across G3's three
 *  evenings — the press's tone gap, the day's most-echoed phrase by domain, the removals — so the
 *  reading order retraces the building order rather than inventing a new one. */
export const GLOBE_STORIES: readonly Tour[] = Object.freeze([
  fleetNightStory,
  skyOverReaderStory,
  planetsMinutesStory,
  balanceStory,
  consensusOutletsStory,
  redactionRemovedStory,
])
