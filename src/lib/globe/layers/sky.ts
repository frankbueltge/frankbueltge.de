// src/lib/globe/layers/sky.ts — the earth-observation fleet, and the one honest exception on this
// globe.
//
// Every other layer here holds a record per day. The sky does not: the archive keeps the CURRENT
// orbital elements, refreshed nightly, and no element set per past day. Propagating today's
// elements back to a day in July would produce three hundred confident points that were never
// observed — a fabrication with the look of a measurement, and the more convincing for being
// smooth. So the sky draws only on the day its elements are FROM. On any other day it draws
// nothing and says why, and where the densification series holds that day it states the fleet
// size counted then, in words, from the committed file.
//
// On that ONE day the layer does the opposite of standing still, and this is the house's single
// declared exception to the no-clock rule: it hands over the elements themselves (`instant`), and
// the drawing half propagates them to the VISITOR'S PRESENT, so the fleet walks its orbits while
// somebody is looking at it. That is not a licence taken loosely — it is the only honest reading of
// a CURRENT element set, and it is why the entrance says "positions at your now" rather than naming
// a date.
//
// Two things follow, both wanted. Scrubbing the time axis never propagates anything, because a past
// day has no elements to propagate — SGP4 stays off the scrubber's hot path entirely. And the
// exception stays exactly where it was declared: on the newest frame, and nowhere else.
import type { SatSnapshot } from '@/lib/ueberflug/types'
import { asOfDay, buildGlobeModel } from '../model'
import { positionsAt, satrecsOf } from '../propagate'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import { readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerInstant, type LayerRecord } from './types'

const ELEMENTS = 'src/data/ueberflug/satellites.json'
const DENSIFICATION = 'src/data/ueberflug/densification.json'
const FLEET = 'src/data/ghost-fleet/latest.json'

interface DensificationSeries {
  first_observation: string
  last_observation: string
  series: Array<{ date: string; commit: string; fleet: number }>
}

const snapshot = readJson<SatSnapshot>(ELEMENTS)
const densification = readJson<DensificationSeries>(DENSIFICATION)
const model = buildGlobeModel(snapshot, readJson<GhostFleetData>(FLEET))

/** The day the elements are from — the one day this layer can draw. */
const ELEMENTS_DAY = asOfDay(snapshot.generated_at)
const OBSERVED = new Map(densification.series.map((row) => [row.date, row]))
const DAYS = [...new Set([...OBSERVED.keys(), ELEMENTS_DAY])].sort()

const READOUT = {
  mark: '{name}, {group}, operated by {owner}',
  place: 'the point on the ground the satellite is over right now, propagated from the committed elements',
  onlyDay:
    'The archive keeps the current orbital elements, not one set per day. This layer therefore draws ' +
    'only on the day its elements are from ({day}); on any other day it draws nothing rather than ' +
    'propagating today’s orbits into the past.',
  counted: 'The densification series counted {fleet} satellites in the fleet on {day} (commit {commit}).',
  uncounted: 'The densification series holds no observation for {day}.',
}

/** The positions the floor draws: SGP4 over the committed elements, at the elements' OWN time.
 *  The instant is an argument, never a clock — the build reads the snapshot's `generated_at`. */
const POSITIONS = positionsAt(satrecsOf(model.satellites), Date.parse(snapshot.generated_at))

function frameOf(day: string): LayerFrame {
  if (day !== ELEMENTS_DAY) {
    const observed = OBSERVED.get(day)
    const why = READOUT.onlyDay.replace('{day}', ELEMENTS_DAY)
    const counted = observed
      ? READOUT.counted
          .replace('{fleet}', String(observed.fleet))
          .replace('{day}', day)
          .replace('{commit}', observed.commit)
      : READOUT.uncounted.replace('{day}', day)
    return EMPTY_FRAME(day, `${why} ${counted}`)
  }

  const records: LayerRecord[] = []
  model.satellites.forEach((satellite, index) => {
    const point = POSITIONS[index]
    if (!point) return
    records.push({
      key: `sky:${day}:${index}`,
      at: [point.lon, point.lat],
      value: point.altKm,
      labelKind: 'point',
      receipt: {
        file: ELEMENTS,
        locator: `satellites[] · NORAD ${satellite.norad}`,
        words: `${satellite.name} · ${satellite.group}${satellite.owner ? ` · ${satellite.owner}` : ''}`,
        url: 'https://celestrak.org/NORAD/elements/',
      },
    })
  })
  return { day, records }
}

/** The elements of exactly the marks the newest frame draws, in its order — collected in the same
 *  pass, so a satellite SGP4 could not place at build time has neither a mark nor an element and
 *  the two lists cannot drift apart. This is what travels in the feed and lets the drawing half
 *  propagate to the visitor's present without a second copy of the archive or of satellite.js. */
function instantOf(): LayerInstant {
  const elements: LayerInstant['elements'] = []
  model.satellites.forEach((satellite, index) => {
    if (!POSITIONS[index]) return
    elements.push({ key: `sky:${ELEMENTS_DAY}:${index}`, omm: satellite.omm as unknown as Record<string, unknown> })
  })
  return { day: ELEMENTS_DAY, elements, note: READOUT.onlyDay.replace('{day}', ELEMENTS_DAY) }
}

export const skyLayer: GlobeLayer = {
  id: 'sky',
  title: 'Sky',
  kind: 'points',
  owner: { line: 'watchers' },
  asOf: ELEMENTS_DAY,
  source: {
    file: ELEMENTS,
    name: snapshot.sources.map((s) => s.name).join(' · '),
    url: snapshot.sources[0]?.url ?? 'https://celestrak.org/NORAD/elements/',
    license: snapshot.sources.map((s) => s.license).join(' · '),
  },
  days: DAYS,
  frame: frameOf,
  instant: instantOf(),
  readout: READOUT,
}
