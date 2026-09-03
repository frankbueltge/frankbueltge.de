// src/lib/tour/globe-stories.ts — the living globe's guided stories (G2, 2026-09-03): three
// readings of this house's own archive on the tour engine that already drives the Studio's floor
// and the Field's plate, with ONE figure between them — the globe in the room.
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
// the protocol's frame for the reading in question, the committed seats file for a vantage), so a
// story cannot point at a mark the globe does not draw, and a moved seat moves the camera with it.
// What IS typed is the quotes — and those are exactly what the harness checks against the bytes.
//
// THE THREE STORIES THAT ARE NOT HERE. The plan named six. Balance, Consensus and Redaction need
// layers that arrive with G3 (the registers, the press, the removals), and a story may only name a
// registered layer id — so they are not written, not stubbed and not commented out as a draft:
// they are named in the design note's G3 row and in the method sheet, and they will be written when
// the layers they are about exist. A scene pointing at a layer nobody has built is exactly the kind
// of promise this globe was built to stop making.
import { GLOBE } from '@/config/globe-wording'
import { ghostFleetLayer } from '@/lib/globe/layers/ghost-fleet'
import { protocolLayer } from '@/lib/globe/layers/protocol'
import { skyLayer } from '@/lib/globe/layers/sky'
import type { LayerRecord } from '@/lib/globe/layers/types'
import { seatPoint } from '@/lib/globe/seats'
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

/** The stories the room mounts, in the order it mounts them: the one night, the one moment, the
 *  season. Three of the six the plan named; the other three wait for the layers of G3. */
export const GLOBE_STORIES: readonly Tour[] = Object.freeze([fleetNightStory, skyOverReaderStory, planetsMinutesStory])
