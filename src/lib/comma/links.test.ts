import { describe, expect, it } from 'vitest'

import { countryLink, entryLink, siteLink } from './links'
import { testsOf } from './ooni'

const UID = '20261112194029.003293_IR_webconnectivity_5413b98f121d3aad'

describe('links from third-party data', () => {
  it('lead a test to its own entry in OONI Explorer, and nothing else to anywhere', () => {
    expect(entryLink(UID)).toBe(`https://explorer.ooni.org/m/${UID}`)
    expect(entryLink('javascript:alert(1)')).toBeNull()
    expect(entryLink(`${UID}/../../evil`)).toBeNull()
    expect(entryLink('')).toBeNull()
  })

  it('lead a country to OONI\'s page for it', () => {
    expect(countryLink('RU')).toBe('https://explorer.ooni.org/country/RU')
    expect(countryLink('ru')).toBeNull()
    expect(countryLink('RUS')).toBeNull()
  })

  it('name a website only when it is a news outlet, and only its front page', () => {
    expect(siteLink('https://www.dw.com/ru/belarus/s-9500', 'NEWS')).toBe('https://www.dw.com/')
    expect(siteLink('https://example.org/', 'PORN')).toBeNull()
    expect(siteLink('https://someone.blogspot.com/', 'POLR')).toBeNull()
    expect(siteLink('javascript:alert(1)', 'NEWS')).toBeNull()
    expect(siteLink('ftp://example.org/', 'NEWS')).toBeNull()
  })

  it('keep OONI\'s id only when it looks like one', () => {
    const tests = testsOf(
      {
        results: [
          { measurement_start_time: '2026-11-12T19:40:29.000000Z', probe_cc: 'IR', measurement_uid: UID, confirmed: true },
          { measurement_start_time: '2026-11-12T19:40:30.000000Z', probe_cc: 'IR', measurement_uid: '<script>', confirmed: true },
        ],
      },
      0,
      Date.parse('2026-11-13T00:00:00Z'),
    )
    expect(tests.map((t) => t.uid)).toEqual([UID, ''])
  })
})
