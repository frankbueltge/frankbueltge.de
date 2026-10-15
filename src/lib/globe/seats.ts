// src/lib/globe/seats.ts — the committed seats, and the two maps that say which reading is
// published from which of them.
//
// The distinction this module exists to hold: a SEAT is an address, a STATION is an instrument.
// The carbon-dioxide reading comes off a mountain in Hawaii and belongs there; the food price
// index comes out of an office in Rome and belongs to the office, not to a field. A globe that
// drew both the same way would be claiming a measurement site for every number it holds.
import seatsFile from '@/data/globe/seats.json'
import type { LonLat } from './layers/types'

export interface Seat {
  id: string
  label: string
  lat: number | null
  lon: number | null
  labelKind: 'seat' | 'station'
  qid: string
  note: string
}

export const SEATS = seatsFile.seats as Seat[]

const BY_ID = new Map(SEATS.map((seat) => [seat.id, seat]))

export function seatById(id: string): Seat {
  const seat = BY_ID.get(id)
  if (!seat) throw new Error(`globe seats: no seat "${id}" — src/data/globe/seats.json holds ${SEATS.length} rows`)
  return seat
}

/** The seat's point, or null where Wikidata places the body nowhere. A caller must state the
 *  absence in words; nothing here guesses a city. */
export function seatPoint(id: string): LonLat | null {
  const seat = seatById(id)
  return seat.lat === null || seat.lon === null ? null : [seat.lon, seat.lat]
}

/** Which seat publishes which of the protocol's fourteen readings. The keys are the `top_id`
 *  values of src/content/protokoll/<year>/<day>.json — the join is by publisher, so two readings
 *  taken by the same body stand at the same point (sea ice north and south are both NSIDC's). */
export const PROTOCOL_SEATS: Readonly<Record<string, string>> = Object.freeze({
  co2: 'mauna-loa',
  seaice_north: 'nsidc',
  seaice_south: 'nsidc',
  sst: 'noaa',
  fires: 'nasa',
  quakes: 'usgs',
  population: 'un-desa',
  refugees: 'unhcr',
  food: 'fao',
  rates: 'ecb',
  oil: 'eia',
  conflict: 'gdelt',
  attention: 'wikimedia',
  verluste: 'wikimedia-de',
})

/** Which seat each institution of the redaction watch-list sits at. The keys are the
 *  `institution` strings of pipelines/redaction/src/redaction/watchlist.py — and, since G3's second
 *  evening, of every committed day file under src/data/redaction as well: seats.test.ts walks the
 *  whole archive and the pipeline's own list, so an institution that appears in either without a
 *  seat here is a red suite rather than a mark this globe quietly does not draw. */
export const REDACTION_SEATS: Readonly<Record<string, string>> = Object.freeze({
  WHO: 'who',
  UN: 'un',
  UNHCR: 'unhcr',
  IPCC: 'ipcc',
  'EU-Kommission': 'eu-commission',
  NASA: 'nasa',
  NOAA: 'noaa',
  EPA: 'epa',
  CDC: 'cdc',
  BLS: 'bls',
  'US State Dept': 'us-state',
  'US Census': 'us-census',
  'White House': 'white-house',
  'UK Gov': 'uk-gov',
  Bundesregierung: 'bundesregierung',
  IEA: 'iea',
})

/** The seat an institution of the redaction archive sits at, or a throw naming the institution and
 *  every institution the table does hold.
 *
 *  It throws for the same reason `byFips` throws and `tryCctld` does not: an institution string in
 *  this house's OWN archive is a body the pipeline claims to have watched, so one the table cannot
 *  place is a gap in the table, never a licence to draw one mark fewer. A silently dropped seat
 *  looks exactly like a quiet night. */
export function redactionSeatFor(institution: string): string {
  const id = REDACTION_SEATS[institution]
  if (!id) {
    throw new Error(
      `globe seats: no seat for the institution "${institution}" — src/lib/globe/seats.ts maps ` +
        `${Object.keys(REDACTION_SEATS).join(', ')}. Add the institution with its seat id, and the seat ` +
        'itself with its Wikidata item (scripts/build-globe-seats.ts).',
    )
  }
  return id
}
