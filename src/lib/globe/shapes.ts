// src/lib/globe/shapes.ts — the country polygons a country layer is filled from, keyed by the code
// its records name.
//
// The drawing half holds no geography beyond the land it is handed (globe-deck.ts), and the island
// computes nothing that carries a claim — and a border is a claim. So the decoding happens HERE, at
// build time, in a pure module with a test: the committed Natural Earth topology is turned into one
// GeoJSON feature per country, keyed by ISO alpha-3 through the same committed crosswalk every
// other part of this globe reads, and served ready to draw at /globe/countries.json. The island
// fetches it once and hands the drawing half an object, never a URL.
//
// Two decisions worth stating. The KEY is alpha-3 because that is what a country record carries
// (`at: { iso3 }`), so no lookup happens in a browser at all. The COORDINATES are rounded once,
// here, to two decimals — about a kilometre, coarser than the 1:110m source is accurate to and
// far coarser than a globe drawn at a few hundred pixels can show — which is worth a third off the
// transfer and changes no visible outline. Rounding once, in one place, also keeps the payload
// byte-identical across builds and platforms.
//
// The topology's own `properties` are dropped: a fill's properties are set by the drawing to the
// RECORD it was matched to, and a country's upstream name travelling alongside would be a second,
// unversioned source of the same fact.
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import topology from '@/data/globe/countries-110m.json'
import { stitchGeometry } from './antimeridian'
import { byNumeric } from './crosswalk'
import { numericKey } from './geo'

const COUNTRIES = topology as unknown as Topology

/** About a kilometre at the equator: finer than Natural Earth at 1:110m claims to be. */
const DIGITS = 2

const round = (n: number): number => Number(n.toFixed(DIGITS))

type Ring = unknown

function roundCoordinates(coordinates: Ring): Ring {
  if (Array.isArray(coordinates) && typeof coordinates[0] === 'number') {
    return [round(coordinates[0] as number), round(coordinates[1] as number)]
  }
  return (coordinates as Ring[]).map(roundCoordinates)
}

export interface CountryShapesPayload {
  _: string
  /** one feature per country the topology draws, keyed by ISO 3166-1 alpha-3 */
  byIso3: Record<string, GeoJSON.Feature>
}

const NOTE =
  'The country polygons of the living globe, keyed by ISO alpha-3, derived at build time from ' +
  'src/data/globe/countries-110m.json (Natural Earth 1:110m via world-atlas, public domain) and ' +
  'src/data/globe/crosswalk.json by src/lib/globe/shapes.ts. Coordinates rounded to two decimals. ' +
  'Regenerate by rebuilding the site; do not edit.'

/** Every country the committed topology draws, as a feature keyed by its alpha-3 code. A feature
 *  the topology carries without an id is one the atlas draws but assigns no country to (three of
 *  them at this scale); it is left out here exactly as `countryGeometries` leaves it out of the
 *  centroids, so the fills and the centroids cover the same set. Every id that IS there is resolved
 *  through the crosswalk, which throws on a code it cannot place rather than dropping a country. */
export function countryShapes(): CountryShapesPayload {
  const collection = feature(COUNTRIES, COUNTRIES.objects.countries as never) as unknown as {
    features: Array<{ id?: string | number; geometry: GeoJSON.Geometry }>
  }
  const byIso3: Record<string, GeoJSON.Feature> = {}
  for (const shape of collection.features) {
    if (shape.id === undefined) continue
    const country = byNumeric(numericKey(shape.id))
    // stitched BEFORE it is rounded and served: Russia, the United States, Fiji, New Zealand and
    // Kiribati all cross the antimeridian, and an unstitched ring of any of them would be filled as
    // a band around the whole earth (src/lib/globe/antimeridian.ts)
    const stitched = stitchGeometry(shape.geometry)
    byIso3[country.iso3] = {
      type: 'Feature',
      properties: {},
      geometry: {
        type: stitched.type,
        coordinates: roundCoordinates((stitched as { coordinates: Ring }).coordinates),
      } as GeoJSON.Geometry,
    }
  }
  return { _: NOTE, byIso3 }
}
