// The honesty harness of the living globe's guided stories, wired to the real filesystem and to the
// real layer registry (G2, 2026-09-03). Six things are checked here, and each one is a promise a
// story makes that a reader cannot check by looking:
//
//   1. every quote is a BYTE-EXACT substring of the committed file it names (verifyTourQuotes);
//   2. every day a scene asks for is a day the model actually holds — never a clock, never a guess;
//   3. every layer a scene switches on is REGISTERED — which is what keeps a story the plan named
//      for G3 from being written before its layer exists, rather than a note in a document nobody
//      re-reads. G3's first evening registered the press's tone gap and the hosts by top-level
//      domain, so those two stories are now writable and owed; the removals still have no layer;
//   4. every camera stands on the earth (a longitude in [-180, 180], a latitude in [-90, 90], a
//      zoom the globe view can actually hold);
//   5. every selected mark EXISTS in that layer's frame on that scene's own day — the one thing a
//      story can get wrong that looks fine on the page it was written on and opens nothing three
//      weeks later;
//   6. the frame copy states no figure of its own: every number a reader sees is inside a quote.
//
// Modelled on field-gauntlet.test.ts, which does the same job for the Field's plate.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

import { LAYERS } from '@/lib/globe/layers'
import { buildLivingGlobe, frameAt } from '@/lib/globe/living'
import { verifyTourQuotes } from './verify'
import {
  FLEET_NIGHT,
  GLOBE_FIGURE,
  GLOBE_STORIES,
  MINUTES_NIGHTS,
  fleetNightStory,
  planetsMinutesStory,
  skyOverReaderStory,
} from './globe-stories'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const readFile = (path: string) => readFileSync(ROOT + path, 'utf8')

const model = buildLivingGlobe()
const registered = new Set(LAYERS.map((layer) => layer.id))

describe('the globe’s stories are verbatim or they are not shipped', () => {
  it.each(GLOBE_STORIES.map((tour) => [tour.id, tour] as const))(
    '%s: every quote is a byte-exact substring of the file it names',
    (_id, tour) => {
      const violations = verifyTourQuotes(tour, readFile)
      expect(violations.map((v) => `${v.kind} @ ${v.sceneId ?? 'tour'} (${v.path ?? '—'}): ${v.message}`)).toEqual([])
    },
  )

  it('ships three stories, four to six scenes each, every scene backed by substance', () => {
    expect(GLOBE_STORIES).toHaveLength(3)
    for (const tour of GLOBE_STORIES) {
      expect(tour.practice, `${tour.id} is a work of the lab, not of a practice`).toBe('lab')
      expect(tour.scenes.length, `${tour.id} has the wrong number of scenes`).toBeGreaterThanOrEqual(4)
      expect(tour.scenes.length, `${tour.id} has the wrong number of scenes`).toBeLessThanOrEqual(6)
      for (const scene of tour.scenes) {
        expect(scene.quotes.length, `${tour.id}/${scene.id} carries too little substance`).toBeGreaterThanOrEqual(2)
        for (const quote of scene.quotes) {
          expect(quote.locator, `${tour.id}/${scene.id} quote has no locator`).toBeTruthy()
          expect(tour.provenance, `${quote.source} is quoted but not declared`).toContain(quote.source)
        }
      }
    }
  })

  it('gives every scene of every story a unique, slug-shaped id', () => {
    const seen = new Set<string>()
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) {
        expect(seen.has(scene.id), `scene id "${scene.id}" is used twice`).toBe(false)
        seen.add(scene.id)
        expect(scene.id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      }
    }
  })

  it('states no figure in its own frame copy — every number a reader sees sits inside a quote', () => {
    for (const tour of GLOBE_STORIES) {
      expect(`${tour.title} ${tour.standfirst}`, `${tour.id}: a figure in un-checkable prose`).not.toMatch(/\d/)
      for (const scene of tour.scenes) {
        const frame = `${scene.kicker} ${scene.heading} ${scene.lead ?? ''}`
        expect(frame, `${tour.id}/${scene.id}: a figure in un-checkable prose`).not.toMatch(/\d/)
      }
    }
  })
})

describe('every scene asks the globe for something the globe really has', () => {
  it('drives one figure, and it is the room’s own', () => {
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) expect(scene.focus.figure).toBe(GLOBE_FIGURE)
    }
  })

  it('names only days the model holds — the archive’s own days, never a clock', () => {
    const days = new Set(model.days)
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) {
        expect(scene.focus.time?.day, `${tour.id}/${scene.id} names no day`).toBeTruthy()
        expect(days.has(scene.focus.time!.day), `${tour.id}/${scene.id}: ${scene.focus.time!.day} is not on the axis`).toBe(true)
      }
    }
  })

  it('names only REGISTERED layers — which is why the unwritten stories stay unwritten', () => {
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) {
        expect(scene.focus.layers, `${tour.id}/${scene.id} switches on no layer`).toBeTruthy()
        expect(scene.focus.layers!.length).toBeGreaterThan(0)
        for (const id of scene.focus.layers!) {
          expect(registered.has(id), `${tour.id}/${scene.id}: no layer "${id}" is registered`).toBe(true)
        }
      }
    }
    // The guard above is what makes "not yet" enforceable rather than remembered, and G3's first
    // evening (2026-09-03) moved the line: the press's tone gap and the hosts by top-level domain
    // are now registered, so the balance and consensus stories have become WRITABLE and are owed to
    // a later evening rather than blocked. The removals still have no layer, so the story about them
    // still cannot be written at all — and a story would have to name the hosts layer by its own
    // registered id, which is `consensus-tld` and not `consensus`.
    for (const id of ['balance', 'consensus-tld']) expect(registered.has(id)).toBe(true)
    for (const id of ['consensus', 'redaction']) expect(registered.has(id)).toBe(false)
  })

  it('stands every camera on the earth, at a distance the globe view can hold', () => {
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) {
        const camera = scene.focus.camera
        expect(camera, `${tour.id}/${scene.id} has no camera`).toBeTruthy()
        expect(camera!.longitude, `${tour.id}/${scene.id}: longitude`).toBeGreaterThanOrEqual(-180)
        expect(camera!.longitude, `${tour.id}/${scene.id}: longitude`).toBeLessThanOrEqual(180)
        expect(camera!.latitude, `${tour.id}/${scene.id}: latitude`).toBeGreaterThanOrEqual(-90)
        expect(camera!.latitude, `${tour.id}/${scene.id}: latitude`).toBeLessThanOrEqual(90)
        if (camera!.zoom !== undefined) {
          // the room's own bounds (globe-deck.ts: minZoom -1.5, maxZoom 4)
          expect(camera!.zoom, `${tour.id}/${scene.id}: zoom`).toBeGreaterThanOrEqual(-1.5)
          expect(camera!.zoom, `${tour.id}/${scene.id}: zoom`).toBeLessThanOrEqual(4)
        }
      }
    }
  })

  it('selects only marks that exist in that layer’s frame on that scene’s own day', () => {
    let selections = 0
    for (const tour of GLOBE_STORIES) {
      for (const scene of tour.scenes) {
        if (!scene.focus.select) continue
        selections += 1
        const moment = frameAt(model, scene.focus.time!.day)
        const keys = new Set(scene.focus.layers!.flatMap((id) => moment.layers[id]!.records.map((r) => r.key)))
        expect(keys.has(scene.focus.select), `${tour.id}/${scene.id}: ${scene.focus.select} is not drawn that day`).toBe(true)
      }
    }
    // two stories end on a mark; the third ends on an empty sphere by design (the sky's other days)
    expect(selections).toBe(2)
  })
})

describe('the fleet story walks the night it says it walks', () => {
  it('selects the LONGEST gap of that night, by the record’s own value', () => {
    const records = frameAt(model, FLEET_NIGHT).layers['ghost-fleet']!.records
    const longest = records.reduce((a, b) => ((b.value ?? 0) > (a.value ?? 0) ? b : a))
    const last = fleetNightStory.scenes[fleetNightStory.scenes.length - 1]!
    expect(last.focus.select).toBe(longest.key)
    // the key format the room's cards are linked by: layer, day, position in the source file
    expect(last.focus.select).toMatch(new RegExp(`^ghost-fleet:${FLEET_NIGHT}:\\d+$`))
  })

  it('stands the two close scenes on the gap’s own two ends', () => {
    const records = frameAt(model, FLEET_NIGHT).layers['ghost-fleet']!.records
    const longest = records.reduce((a, b) => ((b.value ?? 0) > (a.value ?? 0) ? b : a))
    const at = longest.at as { from: [number, number]; to: [number, number] }
    const cameras = fleetNightStory.scenes.map((s) => s.focus.camera!)
    expect(cameras.some((c) => c.longitude === at.from[0] && c.latitude === at.from[1])).toBe(true)
    expect(cameras.some((c) => c.longitude === at.to[0] && c.latitude === at.to[1])).toBe(true)
  })

  it('keeps one layer on throughout — the night is about the vessels and nothing else', () => {
    for (const scene of fleetNightStory.scenes) expect(scene.focus.layers).toEqual(['ghost-fleet'])
  })
})

describe('the sky story stands on the day the elements are from', () => {
  it('asks for the sky’s own day, derived — not a day typed into the story', () => {
    const sky = LAYERS.find((layer) => layer.id === 'sky')!
    const day = sky.instant?.day ?? sky.asOf
    for (const scene of skyOverReaderStory.scenes) {
      expect(scene.focus.time?.day).toBe(day)
      expect(scene.focus.layers).toEqual(['sky'])
    }
    // and on that day the layer really draws something, or the whole story looks at an empty sphere
    expect(frameAt(model, day).layers.sky!.records.length).toBeGreaterThan(0)
  })

  it('says, in the frame copy, that it reads no location of the visitor', () => {
    const vantage = skyOverReaderStory.scenes.find((s) => s.id === 'the-vantage-is-the-houses')!
    expect(`${vantage.heading} ${vantage.lead ?? ''}`).toContain('No location of the visitor is read')
  })

  it('looks down on the seat it quotes, and takes the point from the committed file', () => {
    const seats = JSON.parse(readFile('src/data/globe/seats.json')) as {
      seats: { id: string; lon: number; lat: number }[]
    }
    const berlin = seats.seats.find((s) => s.id === 'bundesregierung')!
    const vantage = skyOverReaderStory.scenes.find((s) => s.id === 'the-vantage-is-the-houses')!
    expect(vantage.focus.camera).toEqual({ longitude: berlin.lon, latitude: berlin.lat, zoom: 2.2 })
  })
})

describe('the minutes story walks a season, oldest night first', () => {
  it('walks the days in ascending order, starting at the oldest day the archive holds', () => {
    const days = planetsMinutesStory.scenes.map((s) => s.focus.time!.day)
    expect(days).toEqual([...MINUTES_NIGHTS])
    expect([...days]).toEqual([...days].sort())
    expect(days[0]).toBe(model.days[0])
  })

  it('ends on the carbon-dioxide mark of its last night, opened from the file it was read from', () => {
    const last = planetsMinutesStory.scenes[planetsMinutesStory.scenes.length - 1]!
    const moment = frameAt(model, last.focus.time!.day)
    const record = moment.layers.protocol!.records.find((r) => r.key === last.focus.select)!
    expect(record).toBeTruthy()
    expect(record.receipt.file).toBe(`src/content/protokoll/2026/${last.focus.time!.day}.json`)
    expect(record.receipt.locator).toContain(' · co2 · ')
    // the reading off the mountain is the one mark of this layer that is a station, not an address
    expect(record.labelKind).toBe('station')
  })

  it('keeps the protocol layer on throughout, and no other', () => {
    for (const scene of planetsMinutesStory.scenes) expect(scene.focus.layers).toEqual(['protocol'])
  })
})
