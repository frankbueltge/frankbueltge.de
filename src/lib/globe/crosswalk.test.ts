// The crosswalk is the piece of this globe most likely to be wrong quietly. Every assertion here
// is therefore run against the REAL committed files the instruments write, not against fixtures:
// if a nightly run adds a country whose code this table cannot place, the suite says so on the
// next build instead of the globe drawing one mark fewer.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import balance from '@/data/balance/latest.json'
import invoked from '@/data/invoked/latest.json'
import { byFips, byIso3, byNumeric, centroidOfIso3, countries, nameOf, tryFips } from './crosswalk'

const invokedFips = [...new Set([...readFileSync('src/data/invoked/latest.json', 'utf8').matchAll(/"fips":\s*"([A-Z0-9]+)"/g)].map((m) => m[1]))]

describe('every country the instruments name can be placed', () => {
  it.each((balance.countries as Array<{ fips: string; name: string }>).map((c) => [c.fips, c.name] as const))(
    'Balance’s %s (%s) resolves',
    (fips) => {
      expect(byFips(fips).iso3).toMatch(/^[A-Z]{3}$/)
    },
  )

  it('every country Invoked Past names resolves', () => {
    expect(invokedFips.length).toBeGreaterThan(0)
    for (const fips of invokedFips) expect(byFips(fips).iso3).toMatch(/^[A-Z]{3}$/)
  })
})

describe('the codes that look like other codes', () => {
  it('reads GDELT’s UK as the United Kingdom, never as Ukraine', () => {
    expect(byFips('UK').iso3).toBe('GBR')
    expect(byFips('UP').iso3).toBe('UKR')
  })

  it('reads GM as Germany and GA as Gambia', () => {
    expect(byFips('GM').iso3).toBe('DEU')
    expect(byFips('GA').iso3).toBe('GMB')
  })

  it('reads both codes GDELT spells "Serbia" as one country', () => {
    expect(byFips('RI').iso3).toBe('SRB')
    expect(byFips('RB').iso3).toBe('SRB')
  })
})

describe('the codes round-trip', () => {
  it('alpha-3 → numeric → alpha-3 comes back the same country, for every row', () => {
    for (const country of countries()) {
      expect(byNumeric(byIso3(country.iso3).num).iso3, country.iso3).toBe(country.iso3)
    }
  })

  it('FIPS → alpha-3 → FIPS comes back the same code wherever a country has one', () => {
    for (const country of countries()) {
      if (!country.fips) continue
      expect(byIso3(byFips(country.fips).iso3).fips, country.iso3).toBe(country.fips)
    }
  })
})

describe('an unresolvable code is loud', () => {
  it('throws, names the system and the code, and says where to correct it', () => {
    expect(() => byFips('ZZ')).toThrow(/FIPS 10-4 code "ZZ"[\s\S]*iso-fips\.csv/)
    expect(() => byIso3('XXX')).toThrow(/alpha-3 code "XXX"/)
  })

  it('says why, for a code the build already knows it cannot place', () => {
    // Kosovo: ISO has assigned no code and the 1:110m topology draws it without an id.
    expect(() => byFips('KV')).toThrow(/Kosovo/)
    expect(tryFips('KV')).toBeNull()
  })
})

describe('what the crosswalk carries besides codes', () => {
  it('keeps each source’s own spelling, so a card can quote the file it came from', () => {
    const uk = byFips('UK')
    expect(nameOf(uk)).toBe('United Kingdom')
    expect(nameOf(uk, 'emdat')).toBe('United Kingdom of Great Britain and Northern Ireland')
    expect(nameOf(byIso3('COD'), 'ucdp')).toBe('DR Congo (Zaire)')
    expect(nameOf(byIso3('COD'), 'atlas')).toBe('Dem. Rep. Congo')
  })

  it('places a country by its centroid, and says null where the topology draws none', () => {
    expect(centroidOfIso3('DEU')).toEqual([10.27, 51.077])
    expect(centroidOfIso3('MCO')).toBeNull()
  })

  it('declares its derivation and how to regenerate it', () => {
    const file = JSON.parse(readFileSync('src/data/globe/crosswalk.json', 'utf8')) as Record<string, string>
    expect(file.derivation).toContain('iso-fips.csv')
    expect(file.regenerate).toContain('scripts/build-globe-crosswalk.ts')
  })
})
