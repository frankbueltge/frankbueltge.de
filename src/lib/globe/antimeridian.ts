// src/lib/globe/antimeridian.ts — the fix for the seam that ran across this globe.
//
// WHAT WAS WRONG, measured on 2026-09-03 with the sea and the land painted in temporary contrast
// colours and every data layer switched off. A faint grey line ran right across the sphere south of
// the equator, and the north pole carried three concentric rings under a smear of land colour. Both
// came from the ground, and NOT from the sea polygon — the sea is `--color-panel`, the very colour
// the stage behind it is painted, so a sea artefact cannot be seen at all. They came from the LAND.
//
// Natural Earth stores a ring that crosses the antimeridian as a ring that jumps: the coast walks
// east to longitude 180 and the next vertex is at −180. In a flat longitude/latitude plane that one
// segment is three hundred and sixty degrees wide, and deck.gl's globe view subdivides a polygon by
// the view's own resolution before projecting it — so the jump is subdivided into ninety vertices
// along one parallel and drawn as a BAND AROUND THE WHOLE EARTH. Four rings of the 1:110m land do
// it, seven times between them, and the arithmetic predicts exactly what the screenshots show: Fiji
// jumps at −16.8° and −16.1° (the line south of the equator), Eurasia at 65.0° and 69.0° and
// Wrangel Island at 70.8° and 71.5° (the three rings at the north pole, two of them a hair apart),
// and Antarctica at −84.7°, which is why the sphere had no polar cap but a band with sea inside it.
//
// THE FIX, which is smaller than it looks: do not split the ring, UNWRAP it. Walk the ring once and
// keep every step within half a turn of the one before it by shifting whole turns of longitude, so
// a ring that straddles the antimeridian ends up continuous around −180 (Fiji spans −181.4° to
// −179.8°) instead of jumping across the plane. The globe's projection is periodic — it takes a
// longitude to an angle — so a vertex at −181.4° lands exactly where +178.6° lands, and the
// subdivision now cuts a small polygon into small cells instead of drawing a parallel.
//
// A ring that genuinely ENCIRCLES the earth cannot be unwrapped, because its longitudes wind by a
// full turn: that is what a polygon containing a pole looks like in a flat plane, and Antarctica is
// one. Such a ring is closed THROUGH the pole by two corners at ±180. That is not a claim added to
// the data — on the sphere the ring's interior already contains the pole; a flat file simply has no
// way to say so, which is why every atlas renderer adds the corners.
//
// Pure and deterministic, and it touches nothing it does not have to: of the hundred and
// twenty-five rings of the committed land, a hundred and twenty-one come back byte-identical.
type Position = number[]
type Ring = Position[]

const HALF_TURN = 180
const TURN = 360

const lonsOf = (ring: Ring): number[] => ring.map((point) => point[0])

/** One ring, kept continuous: every vertex within half a turn of the one before it. A ring with no
 *  antimeridian crossing comes back unchanged, vertex for vertex. */
export function unwrapRing(ring: Ring): Ring {
  if (ring.length === 0) return ring
  const out: Ring = [[...ring[0]]]
  let shift = 0
  for (let i = 1; i < ring.length; i += 1) {
    const previous = out[i - 1][0]
    let lon = ring[i][0] + shift
    while (lon - previous > HALF_TURN) {
      shift -= TURN
      lon -= TURN
    }
    while (previous - lon > HALF_TURN) {
      shift += TURN
      lon += TURN
    }
    out.push([lon, ring[i][1], ...ring[i].slice(2)])
  }
  return out
}

/** Whether an unwrapped ring winds a full turn of longitude — the flat-plane signature of a polygon
 *  that contains a pole. Asked of the UNWRAPPED ring: its first and last vertex are the same point
 *  on the earth, so a difference of a full turn between them is the winding itself. */
export function encirclesPole(ring: Ring): boolean {
  if (ring.length < 2) return false
  return Math.abs(ring[ring.length - 1][0] - ring[0][0]) > HALF_TURN
}

/** An encircling ring, closed through the pole its interior contains: two corners at the same
 *  longitudes the ring's two ends already stand at, so the closing edge runs down one antimeridian,
 *  across the pole (where every longitude is the same point) and back up the other. The pole is the
 *  one the ring's own latitudes lie towards, from the ring and from nothing else. */
export function closeThroughPole(ring: Ring): Ring {
  if (ring.length < 2) return ring
  const mean = ring.reduce((sum, point) => sum + point[1], 0) / ring.length
  const pole = mean < 0 ? -90 : 90
  return [...ring, [ring[ring.length - 1][0], pole], [ring[0][0], pole]]
}

/** A hole put into the same turn of longitude as the ring around it. An outer ring that was unwrapped
 *  by a turn leaves its holes a turn away, and a hole outside its own polygon triangulates into
 *  nonsense — so each hole is moved by whole turns until it sits inside the outer ring's own span. */
export function shiftIntoSpan(ring: Ring, outer: Ring): Ring {
  const lons = lonsOf(outer)
  const target = (Math.min(...lons) + Math.max(...lons)) / 2
  const own = lonsOf(ring)
  const middle = (Math.min(...own) + Math.max(...own)) / 2
  const turns = Math.round((target - middle) / TURN)
  if (turns === 0) return ring
  return ring.map((point) => [point[0] + turns * TURN, point[1], ...point.slice(2)])
}

/** One polygon — an outer ring and its holes — made continuous across the antimeridian. */
export function stitchPolygon(polygon: Ring[]): Ring[] {
  if (polygon.length === 0) return polygon
  const unwrapped = unwrapRing(polygon[0])
  const outer = encirclesPole(unwrapped) ? closeThroughPole(unwrapped) : unwrapped
  const holes = polygon.slice(1).map((hole) => shiftIntoSpan(unwrapRing(hole), outer))
  return [outer, ...holes]
}

/** One geometry. Polygons and multi-polygons are stitched; anything else is handed back untouched,
 *  because a point and a line have no interior to get wrong. */
export function stitchGeometry<G extends GeoJSON.Geometry>(geometry: G): G {
  if (geometry.type === 'Polygon') {
    return { ...geometry, coordinates: stitchPolygon(geometry.coordinates as Ring[]) } as G
  }
  if (geometry.type === 'MultiPolygon') {
    return {
      ...geometry,
      coordinates: (geometry.coordinates as Ring[][]).map(stitchPolygon),
    } as G
  }
  return geometry
}

/** Every feature of a collection, stitched. The one entry point the drawing and the country feed
 *  both use, so the sphere and the fills on it can never be stitched differently. */
export function stitchFeatures<T extends { features: Array<{ geometry: GeoJSON.Geometry }> }>(collection: T): T {
  return {
    ...collection,
    features: collection.features.map((f) => ({ ...f, geometry: stitchGeometry(f.geometry) })),
  }
}
