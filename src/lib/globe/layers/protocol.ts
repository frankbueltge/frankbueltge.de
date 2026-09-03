// src/lib/globe/layers/protocol.ts — the planet's nightly minutes, put where they are published
// from.
//
// Fourteen readings a night, and only one of them is taken at a place: the carbon dioxide, off the
// mountain in Hawaii. The other thirteen are published — a price index out of an office in Rome, a
// refugee count out of an office in Geneva, a fire count assembled from satellites by an agency in
// Washington. Drawing them all as if they were measurement sites would be the quiet lie this whole
// globe is built to avoid, so every mark carries its seat's own kind: `station` for the one, `seat`
// for the rest (src/data/globe/seats.json, whose rows each name a Wikidata item).
//
// A reading the night could not take is not drawn and not zeroed. It is counted in the frame's
// note, with the reason the record itself gives — a source that did not answer stays a hole.
import { AGENDA } from '@/lib/protokoll/agenda'
import { fmtValue } from '@/lib/protokoll/render'
import type { ProtokollDay, ProtokollEntry } from '@/lib/protokoll/types'
import { PROTOCOL_SEATS, seatById, seatPoint } from '../seats'
import { archiveDays, readJson } from './archive'
import { EMPTY_FRAME, type GlobeLayer, type LayerFrame, type LayerRecord } from './types'

const ROOT = 'src/content/protokoll'
const YEARS = ['2026']

const DAY_FILE = new Map<string, string>()
for (const year of YEARS) {
  for (const day of archiveDays(`${ROOT}/${year}`)) DAY_FILE.set(day, `${ROOT}/${year}/${day}.json`)
}
const DAYS = [...DAY_FILE.keys()].sort()
const NEWEST = DAYS[DAYS.length - 1]

/** The sentence the minutes themselves print for a reading, in the site's language — the same
 *  template /protocol renders, with the record's own value in it. */
const PHRASE = new Map(AGENDA.flatMap((top) => top.entries.map((entry) => [entry.id, entry.phrase.en] as const)))

const READOUT = {
  mark: '{phrase}',
  place: 'the seat of the body that publishes the reading — a station only where an instrument stands',
  missing: 'On this night {missing} reading or readings could not be taken; they are counted, not drawn.',
  unplaced: 'The seat of {seats} carries no coordinate on Wikidata, so its reading is stated and not drawn.',
}

function wordsFor(entry: ProtokollEntry): string {
  const template = PHRASE.get(entry.top_id)
  if (template && entry.value !== null) return template.replace('{value}', fmtValue(entry.top_id, entry.value, 'en'))
  if (entry.value !== null) return `${entry.top_id}: ${fmtValue(entry.top_id, entry.value, 'en')} ${entry.unit}`
  return `${entry.top_id}: no reading`
}

function frameOf(day: string): LayerFrame {
  const path = DAY_FILE.get(day)
  if (!path) return EMPTY_FRAME(day)
  const minutes = readJson<ProtokollDay>(path)

  const records: LayerRecord[] = []
  const unplaced: string[] = []
  let missing = 0

  minutes.entries.forEach((entry, index) => {
    const seatId = PROTOCOL_SEATS[entry.top_id]
    if (!seatId) return
    if (entry.value === null || entry.status !== 'ok') {
      missing += 1
      return
    }
    const point = seatPoint(seatId)
    const seat = seatById(seatId)
    if (!point) {
      if (!unplaced.includes(seat.label)) unplaced.push(seat.label)
      return
    }
    records.push({
      key: `protocol:${day}:${index}`,
      at: point,
      value: entry.value,
      labelKind: seat.labelKind,
      receipt: {
        file: path,
        locator: `entries[${index}] · ${entry.top_id} · as of ${entry.as_of ?? day}`,
        words: `${wordsFor(entry)} — ${seat.label}`,
        url: entry.source.url,
      },
    })
  })

  const notes: string[] = []
  if (missing > 0) notes.push(READOUT.missing.replace('{missing}', String(missing)))
  if (unplaced.length > 0) notes.push(READOUT.unplaced.replace('{seats}', unplaced.join(', ')))
  return notes.length === 0 ? { day, records } : { day, records, note: notes.join(' ') }
}

const newest = readJson<ProtokollDay>(DAY_FILE.get(NEWEST)!)

export const protocolLayer: GlobeLayer = {
  id: 'protocol',
  title: 'Protocol',
  kind: 'stations',
  owner: { line: 'ledger' },
  asOf: newest.date,
  source: {
    file: `${ROOT}/<year>/<day>.json`,
    name: 'the night’s own sources, one per reading (named in each entry)',
    url: 'https://frankbueltge.de/protocol',
    license: 'per source; the licence of each reading stands in the day file',
  },
  days: DAYS,
  frame: frameOf,
  readout: READOUT,
}
