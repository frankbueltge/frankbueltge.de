// src/lib/globe/crosswalk.ts — pure lookups over the committed country-code crosswalk.
//
// The file this reads (src/data/globe/crosswalk.json) is derived and checked; this module only
// indexes it and answers questions. One rule governs every function here: **an unresolvable code
// throws.** A crosswalk that answers `undefined` and lets the caller carry on is how a country
// disappears from a globe without anyone noticing — the mark is simply not drawn, the count is
// one lower, and every test stays green. A throw is loud, lands in the build, and names the code.
import crosswalk from '@/data/globe/crosswalk.json'
import { centroidOfNumeric } from './geo'
import type { LonLat } from './layers/types'

export interface CountryNames {
  wikidata: string
  atlas?: string
  gdelt?: string
  emdat?: string
  ucdp?: string
}

export interface CrosswalkCountry {
  iso3: string
  iso2: string
  num: string
  fips: string | null
  cctld: string | null
  names: CountryNames
}

const FILE = 'src/data/globe/crosswalk.json'
const COUNTRIES = crosswalk.countries as CrosswalkCountry[]
const ALIASES = crosswalk.fips_aliases as Record<string, string>

const BY_ISO3 = new Map(COUNTRIES.map((c) => [c.iso3, c]))
const BY_ISO2 = new Map(COUNTRIES.map((c) => [c.iso2, c]))
const BY_NUM = new Map(COUNTRIES.map((c) => [c.num, c]))
const BY_FIPS = new Map<string, CrosswalkCountry>()
for (const country of COUNTRIES) if (country.fips) BY_FIPS.set(country.fips, country)
for (const [alias, iso3] of Object.entries(ALIASES)) {
  const target = BY_ISO3.get(iso3)
  if (target) BY_FIPS.set(alias, target)
}

const unresolvable = (system: string, code: string): never => {
  const unmapped = (crosswalk.unmapped.fips as Array<{ code: string; gdelt_name: string }>).find((u) => u.code === code)
  const why = unmapped ? ` — ${FILE} lists it as unplaced ("${unmapped.gdelt_name}")` : ''
  throw new Error(`globe crosswalk: no country for ${system} code "${code}"${why}. Correct src/data/globe/iso-fips.csv and rebuild.`)
}

/** Every country the crosswalk carries, in the base table's order (alpha-2, ascending). */
export function countries(): readonly CrosswalkCountry[] {
  return COUNTRIES
}

/** The country a GDELT FIPS 10-4 code names — Balance, Invoked Past and the protocol's conflict
 *  count all speak this system, where `UK` is the United Kingdom and `GM` is Germany. */
export function byFips(code: string): CrosswalkCountry {
  return BY_FIPS.get(code) ?? unresolvable('FIPS 10-4', code)
}

export function byIso3(code: string): CrosswalkCountry {
  return BY_ISO3.get(code) ?? unresolvable('ISO 3166-1 alpha-3', code)
}

export function byIso2(code: string): CrosswalkCountry {
  return BY_ISO2.get(code) ?? unresolvable('ISO 3166-1 alpha-2', code)
}

export function byNumeric(code: string | number): CrosswalkCountry {
  const key = String(code).padStart(3, '0')
  return BY_NUM.get(key) ?? unresolvable('ISO 3166-1 numeric', key)
}

/** A resolvable code, asked without the throw — for the one caller that needs to REPORT what it
 *  cannot place (the manifest's provenance line) rather than fail on it. */
export function tryFips(code: string): CrosswalkCountry | null {
  return BY_FIPS.get(code) ?? null
}

/** The centroid of a country named by its alpha-3 code, or null where the 1:110m topology draws
 *  no polygon for it. `null` is a statement — the caller must say the country cannot be placed,
 *  never invent a point (see src/data/globe/README.md). */
export function centroidOfIso3(iso3: string): LonLat | null {
  return centroidOfNumeric(byIso3(iso3).num)
}

/** The name to print, preferring the spelling of the source the record came from. */
export function nameOf(country: CrosswalkCountry, prefer: keyof CountryNames = 'wikidata'): string {
  return country.names[prefer] ?? country.names.wikidata
}
