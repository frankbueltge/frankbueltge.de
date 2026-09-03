// A seat is the easiest thing on this globe to invent. Nobody would notice a plausible dot in
// the right city — which is exactly why every row has to name a Wikidata item, and why a row
// without one fails here rather than shipping. The other half of the suite reads the instruments'
// own files: if the watch-list grows an institution, or the protocol grows a reading, the seat
// map must grow with it instead of the globe quietly drawing one mark fewer.
import { readFileSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { PROTOCOL_SEATS, REDACTION_SEATS, SEATS, seatById, seatPoint } from './seats'

const newestProtocolDay = (): { entries: Array<{ top_id: string }> } => {
  const dir = 'src/content/protokoll/2026'
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  return JSON.parse(readFileSync(`${dir}/${files[files.length - 1]}`, 'utf8'))
}

describe('every seat is checkable', () => {
  it.each(SEATS.map((s) => [s.id, s] as const))('%s carries a Wikidata QID', (id, seat) => {
    expect(seat.qid, `${id} has no Wikidata item — a seat nobody can check is an invented dot`).toMatch(/^Q\d+$/)
  })

  it.each(SEATS.map((s) => [s.id, s] as const))('%s stands on the earth, or nowhere and says why', (id, seat) => {
    if (seat.lat === null || seat.lon === null) {
      expect(seat.lat).toBeNull()
      expect(seat.lon).toBeNull()
      expect(seat.note, `${id} has no coordinate and does not say why`).toMatch(/no coordinate/i)
      expect(seatPoint(id)).toBeNull()
      return
    }
    expect(Math.abs(seat.lat), id).toBeLessThanOrEqual(90)
    expect(Math.abs(seat.lon), id).toBeLessThanOrEqual(180)
    expect(seatPoint(id)).toEqual([seat.lon, seat.lat])
  })

  it('says for every row which Wikidata step gave the coordinate', () => {
    for (const seat of SEATS) expect(seat.note, seat.id).toMatch(/Coordinate: /)
  })

  it('calls exactly one row a station — the instrument on the mountain', () => {
    const stations = SEATS.filter((s) => s.labelKind === 'station')
    expect(stations.map((s) => s.id)).toEqual(['mauna-loa'])
    for (const seat of SEATS) expect(['seat', 'station']).toContain(seat.labelKind)
  })

  it('holds every id once, and answers an unknown one loudly', () => {
    expect(new Set(SEATS.map((s) => s.id)).size).toBe(SEATS.length)
    expect(() => seatById('no-such-seat')).toThrow(/no seat "no-such-seat"/)
  })

  it('declares its derivation, its coordinate rule and how to regenerate it', () => {
    const file = JSON.parse(readFileSync('src/data/globe/seats.json', 'utf8')) as Record<string, string>
    expect(file.derivation).toContain('watchlist.py')
    expect(file.regenerate).toContain('scripts/build-globe-seats.ts')
    expect(file.coordinate_rule).toContain('P625')
  })
})

describe('the seats cover what the instruments publish', () => {
  it('gives every institution of the redaction watch-list a seat', () => {
    const watchlist = readFileSync('pipelines/redaction/src/redaction/watchlist.py', 'utf8')
    const institutions = new Set([...watchlist.matchAll(/^\s+"([^"]+)",\s*"[^"]*"\),?\s*$/gm)].map((m) => m[1]))
    expect(institutions.size).toBeGreaterThan(0)
    for (const institution of institutions) {
      const seatId = REDACTION_SEATS[institution]
      expect(seatId, `the watch-list watches "${institution}" and no seat is mapped for it`).toBeDefined()
      expect(seatById(seatId).id).toBe(seatId)
    }
    expect(Object.keys(REDACTION_SEATS).length).toBe(institutions.size)
  })

  it('gives every reading of the newest protocol night a seat', () => {
    const day = newestProtocolDay()
    expect(day.entries.length).toBeGreaterThan(0)
    for (const entry of day.entries) {
      const seatId = PROTOCOL_SEATS[entry.top_id]
      expect(seatId, `the protocol publishes "${entry.top_id}" and no seat is mapped for it`).toBeDefined()
      expect(seatById(seatId).id).toBe(seatId)
    }
    expect(Object.keys(PROTOCOL_SEATS).length).toBe(day.entries.length)
  })
})
