import { readFileSync } from 'node:fs'

import { describe, expect, it } from 'vitest'

import { BLOCK_MS } from './clock'
import { blockUrl, cacheOptions, clockHeaders, KEEP_SECONDS, ROW_LIMIT, standby, standbyReason, upstreamHeaders } from './relay'
import { categoryOf, listUrl, parseList, urlKey } from './testlists'

describe('what the site asks OONI for', () => {
  const block = Date.parse('2026-11-13T23:35:00Z')

  it('is one block of five minutes, deviations only, of every kind of test', () => {
    const url = new URL(blockUrl(block))
    expect(url.origin).toBe('https://api.ooni.io')
    expect(url.searchParams.get('since')).toBe('2026-11-13T23:35:00')
    expect(url.searchParams.get('until')).toBe('2026-11-13T23:40:00')
    expect(url.searchParams.get('anomaly')).toBe('true')
    expect(url.searchParams.has('test_name')).toBe(false)
    expect(Number(url.searchParams.get('limit'))).toBe(ROW_LIMIT)
    expect(BLOCK_MS).toBe(300_000)
  })

  it('says which block an answer is about and what time the site’s clock shows', () => {
    expect(clockHeaders(block, 1_794_613_500_123.7)).toEqual({ 'x-comma-block': '2026-11-13T23:35:00.000Z', 'x-comma-now': '1794613500123' })
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
    const options = cacheOptions(KEEP_SECONDS)
    expect(options.cacheEverything).toBe(true)
    expect(options.cacheTtlByStatus['200-299']).toBe(1800)
    expect(options.cacheTtlByStatus['300-599']).toBeLessThan(0)
    expect(options).not.toHaveProperty('cacheTtl')
  })

  it('is how the relay asks OONI: no plain cacheTtl, which would keep a refusal too', () => {
    const source = readFileSync('functions/api/comma/_block.js', 'utf8')
    expect(source).toContain('cf: cacheOptions(')
    expect(source).not.toMatch(/cacheTtl\s*:/)
    // the request to OONI is built from scratch: nothing of the visitor's own request goes into it
    expect(source).not.toMatch(/request\.headers/)
    expect(source).not.toMatch(/fetch\(\s*request/)
  })

  it('lets no caller name a time: the endpoints read the clock, never the address', () => {
    for (const file of ['functions/api/comma/now.js', 'functions/api/comma/next.js']) {
      const source = readFileSync(file, 'utf8')
      expect(source, file).not.toMatch(/searchParams|request\.url|new URL\(/)
      expect(source, file).toContain('blockPlaying(now)')
    }
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
