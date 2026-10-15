// src/lib/globe/layers/ghost-fleet.ts — the nights vessels spent dark, as arcs.
//
// One arc per AIS gap: from where a transponder fell silent to where it spoke again. The two ends
// are the record's own coordinates, so `labelKind` is `gap` and not `point` — the vessel was not
// AT either end, it stopped being visible at one and reappeared at the other, and what happened in
// between is precisely what nobody holds. The great circle drawn between them is the shortest path
// the vessel COULD have taken, never the path it did take; the method sheet says so, and the card
// says so, because an arc on a globe is very good at looking like a track.
//
// Every day the pipeline has ever written is a frame, from its own filename. Events without both
// coordinates are dropped from the drawing and counted in the frame's note, so a day whose records
// are thin says it rather than looking thin.
import { regionLabel } from '@/lib/ghost-fleet/format'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import { archiveDays, dayPath, readDay, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const DIR = 'src/data/ghost-fleet'
const DAYS = archiveDays(DIR)
const NEWEST = DAYS[DAYS.length - 1]

const READOUT = {
  mark: '{vessel}, {hours} hours dark in {waters}',
  place: 'the point where the transponder fell silent, and the point where it spoke again',
  caution: 'the arc is the shortest path between the two points, never the path the vessel took',
  dropped: 'On this day the record holds {dropped} gap or gaps without both coordinates; they are counted, not drawn.',
}

function frameOf(day: string): LayerFrame {
  const data = readDay<GhostFleetData>(DIR, day, DAYS)
  if (!data) return EMPTY_FRAME(day)

  const file = dayPath(DIR, day)
  const records: LayerRecord[] = []
  let dropped = 0

  data.events.forEach((event, index) => {
    if (event.off.lat === null || event.off.lon === null || event.on.lat === null || event.on.lon === null) {
      dropped += 1
      return
    }
    const waters = regionLabel(event.regions, 'en')
    records.push({
      key: `ghost-fleet:${day}:${index}`,
      at: { from: [event.off.lon, event.off.lat], to: [event.on.lon, event.on.lat] },
      value: event.duration_hours,
      labelKind: 'gap',
      receipt: {
        file,
        locator: `events[${index}] · ${event.id}`,
        words: `${event.vessel.name} · ${Math.round(event.duration_hours)} hours dark · ${waters}`,
        url: event.gfw_url,
      },
    })
  })

  return dropped === 0
    ? { day, records }
    : { day, records, note: READOUT.dropped.replace('{dropped}', String(dropped)) }
}

const newest = readJson<GhostFleetData>(dayPath(DIR, NEWEST))

export const ghostFleetLayer: GlobeLayer = {
  id: 'ghost-fleet',
  title: 'Ghost Fleet',
  kind: 'arcs',
  owner: { line: 'counter-measurement' },
  asOf: newest.date,
  source: {
    file: `${DIR}/<day>.json`,
    name: newest.source.name,
    url: newest.source.url,
    license: newest.source.license,
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}
