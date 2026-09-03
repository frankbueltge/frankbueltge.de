// src/lib/globe/geo.ts — where a country stands on the globe when the record names a country and
// not a place.
//
// Three of this house's instruments count by country: the press's tone about itself and about the
// world, the years the world's press invokes, the hosts a register resolves. None of them holds a
// coordinate. So the drawing needs one, and the only honest one is the country's own polygon
// reduced to a point — d3-geo's `geoCentroid` over the committed Natural Earth topology, the
// spherical centroid, not the box centre. That is a derived point and it is marked as one: every
// record built from here carries `labelKind: 'centroid'`, and the card says "centroid of" rather
// than printing a pair of numbers as if a country were a place.
//
// Pure and deterministic: the topology is a committed file, the arithmetic is d3's, the result is
// rounded once, here, to three decimals — about a hundred metres, far finer than a centroid means
// anything to, and stable across builds and platforms.
import { geoCentroid } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'
import topology from '@/data/globe/countries-110m.json'
import type { LonLat } from './layers/types'

const COUNTRIES = topology as unknown as Topology

interface CountryProps {
  name?: string
}

const collection = feature(COUNTRIES, COUNTRIES.objects.countries as never) as unknown as {
  features: Array<{ id?: string | number; properties: CountryProps; geometry: unknown }>
}

const round3 = (n: number): number => Number(n.toFixed(3))

/** ISO 3166-1 numeric, as Natural Earth carries it on the topology's geometries, always three
 *  digits — "004", never "4", so a lookup cannot depend on how a caller typed the number. */
export const numericKey = (num: string | number): string => String(num).padStart(3, '0')

interface CountryGeometry {
  num: string
  name: string
  centroid: LonLat
}

const BY_NUM: ReadonlyMap<string, CountryGeometry> = new Map(
  collection.features
    .filter((f) => f.id !== undefined)
    .map((f) => {
      const [lon, lat] = geoCentroid(f as never)
      const num = numericKey(f.id as string | number)
      return [num, { num, name: f.properties?.name ?? num, centroid: [round3(lon), round3(lat)] as LonLat }]
    }),
)

/** Every country the committed topology draws — the set a country layer can actually place. */
export function countryGeometries(): CountryGeometry[] {
  return [...BY_NUM.values()].sort((a, b) => a.num.localeCompare(b.num))
}

/** The spherical centroid of the country with this ISO numeric code, or null where the topology
 *  holds no polygon for it (Natural Earth at 1:110m has no Monaco, no Singapore, no Vatican —
 *  a caller must state the absence, never invent a point). */
export function centroidOfNumeric(num: string | number): LonLat | null {
  return BY_NUM.get(numericKey(num))?.centroid ?? null
}

/** The name Natural Earth gives this country — one of the spellings the crosswalk carries. */
export function atlasName(num: string | number): string | null {
  return BY_NUM.get(numericKey(num))?.name ?? null
}
