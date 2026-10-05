import { describe, expect, it } from 'vitest'
import { localeHref } from './locale-href'

/** what Astro's helper does on this site: the path, with the trailing slash appended */
const localize = (path: string) => (path.endsWith('/') ? path : `${path}/`)

describe('localeHref keeps a fragment a fragment', () => {
  it('puts the trailing slash on the path, not after the #', () => {
    expect(localeHref('/ecology#register', localize)).toBe('/ecology/#register')
    expect(localeHref('/atelier/requests/archive#team-note--2026-09-03', localize)).toBe(
      '/atelier/requests/archive/#team-note--2026-09-03',
    )
  })

  it('localizes a plain path as before', () => {
    expect(localeHref('/now', localize)).toBe('/now/')
  })

  it('never puts a trailing slash on a file', () => {
    expect(localeHref('/n-1/record.html', localize)).toBe('/n-1/record.html')
    expect(localeHref('/atlas/werke.json', localize)).toBe('/atlas/werke.json')
    expect(localeHref('/n-1/record.html#map', localize)).toBe('/n-1/record.html#map')
  })

  it('leaves another scheme and a same-page anchor alone', () => {
    expect(localeHref('https://example.org/a#b', localize)).toBe('https://example.org/a#b')
    expect(localeHref('mailto:someone@example.org', localize)).toBe('mailto:someone@example.org')
    expect(localeHref('#main', localize)).toBe('#main')
  })
})
