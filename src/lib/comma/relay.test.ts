import { describe, expect, it } from 'vitest'

import { categoryOf, listUrl, parseList, urlKey } from './testlists'
import { aggregationUrl, LAG_MINUTES, measurementsUrl, minuteToRead, previousDay, ROW_LIMIT, standby, standbyReason } from './relay'

describe('the minute the site reads', () => {
  it('is the whole minute that began four minutes ago', () => {
    const now = Date.parse('2026-11-13T00:10:42Z')
    expect(new Date(minuteToRead(now)).toISOString()).toBe('2026-11-13T00:06:00.000Z')
    expect(LAG_MINUTES).toBe(4)
  })

  it('asks OONI for that minute only, and for web tests only', () => {
    const url = new URL(measurementsUrl(Date.parse('2026-11-13T00:06:00Z')))
    expect(url.origin).toBe('https://api.ooni.io')
    expect(url.searchParams.get('since')).toBe('2026-11-13T00:06:00')
    expect(url.searchParams.get('until')).toBe('2026-11-13T00:07:00')
    expect(url.searchParams.get('test_name')).toBe('web_connectivity')
    expect(Number(url.searchParams.get('limit'))).toBe(ROW_LIMIT)
  })

  it('reads the rule from the previous UTC day', () => {
    expect(previousDay(Date.parse('2026-11-13T00:10:00Z'))).toEqual({ since: '2026-11-12', until: '2026-11-13' })
    const url = new URL(aggregationUrl(Date.parse('2026-11-13T23:59:59Z')))
    expect(url.searchParams.get('since')).toBe('2026-11-12')
    expect(url.searchParams.get('axis_x')).toBe('probe_cc')
  })
})

describe('standby', () => {
  it('names why, without passing on anything of the source', async () => {
    const r = standby('rate-limit')
    expect(r.status).toBe(503)
    expect(r.headers.get('access-control-allow-origin')).toBeNull()
    expect(await r.json()).toEqual({ standby: 'rate-limit' })
  })

  it('tells a closed door from a broken answer', () => {
    expect(standbyReason(429, 'application/json')).toBe('rate-limit')
    expect(standbyReason(502, 'text/html')).toBe('source')
    expect(standbyReason(200, 'text/html')).toBe('shape')
    expect(standbyReason(200, 'application/json; charset=utf-8')).toBeNull()
  })
})

describe('the test lists', () => {
  const csv = [
    'url,category_code,category_description,date_added,source,notes',
    'https://www.bbc.com/,NEWS,News Media,2014-04-15,citizenlab,',
    '"https://example.org/a,b",HUMR,Human Rights Issues,2017-01-01,ooni,"a note, with a comma"',
    'https://example.net/path/,ANON,Anonymization,2019-01-01,ooni,',
    'broken line',
  ].join('\n')
  const list = parseList(csv)

  it('reads the url and its category, quotes respected', () => {
    expect(list.get('bbc.com/')).toBe('NEWS')
    expect(list.get('example.org/a,b')).toBe('HUMR')
    expect(list.get('example.net/path')).toBe('ANON')
    expect(list.size).toBe(3)
  })

  it('matches OONI\'s spelling of a URL to the list\'s', () => {
    expect(urlKey('https://bbc.com')).toBe(urlKey('https://www.bbc.com/'))
    expect(urlKey('https://example.net/path')).toBe('example.net/path')
  })

  it('asks the country\'s own list first, then the global one', () => {
    const lists = { global: list, byCountry: new Map([['RU', new Map([['bbc.com/', 'POLR']])]]) }
    expect(categoryOf('https://www.bbc.com/', 'RU', lists)).toBe('POLR')
    expect(categoryOf('https://www.bbc.com/', 'DE', lists)).toBe('NEWS')
    expect(categoryOf('https://unknown.example/', 'DE', lists)).toBeNull()
  })

  it('loads the lists from Citizen Lab\'s repository, in lowercase', () => {
    expect(listUrl('RU')).toBe('https://raw.githubusercontent.com/citizenlab/test-lists/master/lists/ru.csv')
    expect(listUrl('global')).toBe('https://raw.githubusercontent.com/citizenlab/test-lists/master/lists/global.csv')
  })
})
