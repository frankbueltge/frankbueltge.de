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
// Two things follow from that, both wanted. Scrubbing the time axis never propagates anything, so
// SGP4 stays off the hot path entirely; and the declared no-clock exception stays exactly where it
// was declared — on the newest frame, the visitor's present, and nowhere else.
import type { SatSnapshot } from '@/lib/ueberflug/types'
import { asOfDay, buildGlobeModel } from '../model'
import { positionsAt, satrecsOf } from '../propagate'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import { readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

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
  place: 'the point on the ground the satellite stood over when the elements were taken',
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
  readout: READOUT,
}
