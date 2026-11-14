import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { categoryOf, listUrl, parseList, urlKey } from './testlists'
import {
  aggregationUrl,
  cacheOptions,
  LAG_MINUTES,
  measurementsUrl,
  minuteToRead,
  previousDay,
  RETRY_SECONDS,
  retrySeconds,
  ROW_LIMIT,
  standby,
  standbyReason,
  upstreamHeaders,
} from './relay'

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
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ standby: 'rate-limit' })
  })

  it('tells a closed door from a broken answer', () => {
    expect(standbyReason(429, 'application/json')).toBe('rate-limit')
    expect(standbyReason(502, 'text/html')).toBe('source')
    expect(standbyReason(200, 'text/html')).toBe('shape')
    expect(standbyReason(200, 'application/json; charset=utf-8')).toBeNull()
  })

  it('carries what OONI said, so a standby can be read from outside', async () => {
    const upstream = { status: 429, headers: new Headers({ 'cf-cache-status': 'MISS', 'x-ratelimit-remaining': '0' }) }
    const r = standby('rate-limit', 10, upstreamHeaders(upstream))
    expect(r.headers.get('x-comma-upstream-status')).toBe('429')
    expect(r.headers.get('x-comma-upstream')).toBe('MISS')
    expect(r.headers.get('x-comma-quota')).toBe('0')
    expect(r.headers.get('retry-after')).toBe('10')
    expect(r.headers.get('cache-control')).toBe('no-store')
    expect(await r.json()).toEqual({ standby: 'rate-limit' })
  })

  it('passes on a quota only when it is a plain number', () => {
    const odd = upstreamHeaders({ status: 200, headers: new Headers({ 'x-ratelimit-remaining': '12; drop' }) })
    expect(odd['x-comma-quota']).toBeUndefined()
    expect(odd['x-comma-upstream']).toBe('unknown')
    expect(upstreamHeaders({ status: 200, headers: new Headers({ 'x-ratelimit-remaining': '3939' }) })['x-comma-quota']).toBe('3939')
  })
})

describe('what Cloudflare keeps', () => {
  it('keeps an answer for the given time and a refusal or an error never', () => {
    const options = cacheOptions(600)
    expect(options.cacheEverything).toBe(true)
    expect(options.cacheTtlByStatus['200-299']).toBe(600)
    expect(options.cacheTtlByStatus['300-599']).toBeLessThan(0)
    expect(options).not.toHaveProperty('cacheTtl')
  })

  it('is how both relays ask OONI: no plain cacheTtl, which would keep a refusal too', () => {
    for (const file of ['functions/api/comma/now.js', 'functions/api/comma/rule.js']) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).toContain('cf: cacheOptions(')
      expect(source, file).not.toMatch(/cacheTtl\s*:/)
    }
  })
})

describe('asking again', () => {
  it('asks soon after a first standby, then every half minute', () => {
    expect([1, 2, 3, 4, 5, 50].map(retrySeconds)).toEqual([5, 10, 20, 30, 30, 30])
    expect(retrySeconds(0)).toBe(5)
    expect(RETRY_SECONDS.at(-1)).toBe(30)
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
