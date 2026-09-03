// The seam that ran across this globe, held down by a test.
//
// Two halves. The first is arithmetic on hand-written rings, so the rule can be read: a ring that
// crosses the antimeridian comes back continuous, a ring that does not comes back untouched, a ring
// that encircles the earth is closed through the pole its own latitudes lie towards, and a hole is
// moved into the same turn of longitude as the ring around it.
//
// The second half is the one that would have caught the bug: it runs over the REAL committed
// geography — the land the sphere is drawn from and every country a fill can be drawn for — and
// asserts that no ring anywhere steps more than half a turn of longitude between two neighbouring
// vertices. That single step is the whole defect: deck.gl's globe view subdivides a polygon by the
// view's resolution before projecting it, so a step across the longitude plane is drawn as a band
// around the whole earth. Four rings of the committed land did it, and the latitudes they did it at
// are named below, because a regression should say which parallel came back.
import { readFileSync } from 'node:fs'
import { feature } from 'topojson-client'
import { describe, expect, it } from 'vitest'
import landJson from '@/data/globe/land-110m.json'
import {
  closeThroughPole,
  encirclesPole,
  shiftIntoSpan,
  stitchGeometry,
  unwrapRing,
} from './antimeridian'
import { countryShapes } from './shapes'

type Ring = number[][]

/** The largest step in longitude between two neighbouring vertices of a closed ring, the closing
 *  edge included. Anything over half a turn is a band around the earth waiting to be drawn. */
function widestStep(ring: Ring): number {
  let widest = 0
  for (let i = 1; i < ring.length; i += 1) widest = Math.max(widest, Math.abs(ring[i][0] - ring[i - 1][0]))
  const last = ring[ring.length - 1]
  return Math.max(widest, Math.abs(last[0] - ring[0][0]))
}

/** Every ring of a geometry, outer rings and holes alike. */
function ringsOf(geometry: GeoJSON.Geometry): Ring[] {
  if (geometry.type === 'Polygon') return geometry.coordinates as Ring[]
  if (geometry.type === 'MultiPolygon') return (geometry.coordinates as Ring[][]).flat()
  return []
}

/** A ring at the pole is allowed its one full step: at a latitude of ninety degrees every longitude
 *  is the SAME point on the earth, so the closing edge across the pole draws nothing at all. */
const atThePole = (ring: Ring, i: number, j: number): boolean =>
  Math.abs(ring[i][1]) === 90 && Math.abs(ring[j][1]) === 90

function offendingSteps(ring: Ring): Array<{ lat: number; step: number }> {
  const out: Array<{ lat: number; step: number }> = []
  for (let i = 1; i < ring.length; i += 1) {
    const step = Math.abs(ring[i][0] - ring[i - 1][0])
    if (step > 180 && !atThePole(ring, i - 1, i)) out.push({ lat: ring[i][1], step })
  }
  const last = ring.length - 1
  const closing = Math.abs(ring[last][0] - ring[0][0])
  if (closing > 180 && !atThePole(ring, last, 0)) out.push({ lat: ring[0][1], step: closing })
  return out
}

describe('one ring, made continuous', () => {
  it('leaves a ring that never crosses the antimeridian exactly as it was', () => {
    const germany: Ring = [
      [6, 47],
      [15, 47],
      [15, 55],
      [6, 55],
      [6, 47],
    ]
    expect(unwrapRing(germany)).toEqual(germany)
    expect(widestStep(unwrapRing(germany))).toBe(9)
  })

  it('unwraps a ring that crosses it, instead of splitting it', () => {
    // the shape of Fiji in the committed land: a jump to the far edge and a jump back
    const fiji: Ring = [
      [-180, -16.5],
      [179.4, -16.8],
      [178.7, -17],
      [179.4, -16.1],
      [-180, -16],
      [-179.8, -16.5],
      [-180, -16.5],
    ]
    const out = unwrapRing(fiji)
    expect(widestStep(out)).toBeLessThan(180)
    expect(Math.min(...out.map((p) => p[0]))).toBeCloseTo(-181.3, 5)
    // the projection is periodic: an unwrapped longitude names the same meridian as the one it came
    // from, which is the whole reason unwrapping is enough
    for (let i = 0; i < fiji.length; i += 1) {
      expect(((out[i][0] % 360) + 540) % 360 - 180).toBeCloseTo(((fiji[i][0] % 360) + 540) % 360 - 180, 6)
      expect(out[i][1]).toBe(fiji[i][1])
    }
  })

  it('recognises a ring that winds a whole turn — the flat sign of a polygon holding a pole', () => {
    const around: Ring = [
      [-180, -85],
      [-90, -84],
      [0, -85],
      [90, -84],
      [178, -85],
      [-180, -85],
    ]
    expect(encirclesPole(unwrapRing(around))).toBe(true)
    expect(encirclesPole(unwrapRing([[6, 47], [15, 47], [15, 55], [6, 55], [6, 47]]))).toBe(false)
  })

  it('closes an encircling ring through the pole its own latitudes lie towards', () => {
    const south = closeThroughPole(unwrapRing([[-180, -85], [0, -84], [178, -85], [-180, -85]]))
    expect(south.slice(-2)).toEqual([
      [180, -90],
      [-180, -90],
    ])
    const north = closeThroughPole(unwrapRing([[-180, 85], [0, 84], [178, 85], [-180, 85]]))
    expect(north.slice(-2)).toEqual([
      [180, 90],
      [-180, 90],
    ])
  })

  it('moves a hole into the same turn of longitude as the ring around it', () => {
    const outer: Ring = [
      [-350, 40],
      [-190, 40],
      [-190, 60],
      [-350, 60],
      [-350, 40],
    ]
    const hole: Ring = [
      [50, 45],
      [55, 45],
      [55, 50],
      [50, 45],
    ]
    expect(shiftIntoSpan(hole, outer)).toEqual([
      [-310, 45],
      [-305, 45],
      [-305, 50],
      [-310, 45],
    ])
    // a hole already in the ring's own turn is not moved a millimetre
    const near: Ring = [[-300, 45], [-295, 45], [-295, 50], [-300, 45]]
    expect(shiftIntoSpan(near, outer)).toEqual(near)
  })

  it('hands back a geometry that has no interior untouched', () => {
    const line: GeoJSON.Geometry = { type: 'LineString', coordinates: [[-180, 0], [180, 0]] }
    expect(stitchGeometry(line)).toBe(line)
  })
})

describe('the committed geography, after stitching', () => {
  const land = feature(landJson as never, (landJson as never as { objects: { land: unknown } }).objects.land as never) as unknown as {
    features: Array<{ geometry: GeoJSON.Geometry }>
  }

  it('stepped across the plane at the parallels the screenshots showed, and at no others', () => {
    // the measurement of 2026-09-03, kept as a test so the diagnosis is not folklore: four rings of
    // the committed land step across the plane seven times. Fiji, twice, drew the line south of the
    // equator; Eurasia (twice) and Wrangel Island (twice) drew the three rings at the north pole —
    // two of the four steps land on the same parallel a hair apart, which is why the rings read as
    // three and not four; and Antarctica drew the band that left the south pole as open water.
    const before = land.features
      .flatMap((f) => ringsOf(f.geometry))
      .flatMap(offendingSteps)
      .map((s) => Number(s.lat.toFixed(1)))
      .sort((a, b) => a - b)
    expect(before).toEqual([-84.7, -16.8, -16.1, 65, 69, 70.8, 71.5])
  })

  it('leaves no ring of the land stepping across the plane, at any parallel but the pole', () => {
    for (const f of land.features) {
      for (const ring of ringsOf(stitchGeometry(f.geometry))) {
        expect(offendingSteps(ring)).toEqual([])
      }
    }
  })

  it('leaves no ring of any country a fill can be drawn for stepping across the plane', () => {
    const shapes = countryShapes().byIso3
    // the fills and the sphere are stitched by the same function; a country that crossed unstitched
    // would be filled as a band around the whole earth
    expect(Object.keys(shapes).length).toBeGreaterThan(150)
    for (const [iso3, f] of Object.entries(shapes)) {
      for (const ring of ringsOf(f.geometry)) {
        expect(offendingSteps(ring), iso3).toEqual([])
      }
    }
  })

  it('gives the sphere a polar cap where the record has one, and takes none where it does not', () => {
    const antarctica = countryShapes().byIso3.ATA
    const lats = ringsOf(antarctica.geometry).flat().map((p) => p[1])
    expect(Math.min(...lats)).toBe(-90)
    // and no country that is not at a pole gains a vertex there
    const germany = countryShapes().byIso3.DEU
    expect(ringsOf(germany.geometry).flat().every((p) => Math.abs(p[1]) < 89)).toBe(true)
  })

  it('touches nothing it does not have to — a hundred and twenty of the land’s rings are unchanged', () => {
    const geometry = land.features[0].geometry as GeoJSON.MultiPolygon
    const stitched = stitchGeometry(geometry) as GeoJSON.MultiPolygon
    const same = geometry.coordinates.filter(
      (poly, i) => JSON.stringify(poly) === JSON.stringify(stitched.coordinates[i]),
    ).length
    expect(geometry.coordinates.length).toBe(125)
    expect(same).toBe(121)
  })

  it('is stable — two runs over the same file give the same rings', () => {
    const once = JSON.stringify(stitchGeometry(land.features[0].geometry))
    expect(JSON.stringify(stitchGeometry(land.features[0].geometry))).toBe(once)
  })

  it('reads no clock and rolls no dice', () => {
    const source = readFileSync('src/lib/globe/antimeridian.ts', 'utf8')
    for (const forbidden of ['Date.now(', 'new Date()', 'Math.random(']) {
      expect(source).not.toContain(forbidden)
    }
  })
})
