// Where a headline of the ill-tempered week came from: the record's text finds its signal in the committed day file
// again. The resolution is checked on the two albums pressed before this file was written (named, so a future
// pressing never waits on it); later albums are drawn with whatever links resolve, and none is guessed.
import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

import type { Album } from './albums'
import { asRecorded, dayLinks, hostOf, indexDay, linkFor, OUTLET } from './sources'

const album = (week: string): Album => JSON.parse(readFileSync(`src/data/ill-tempered-week/${week}.json`, 'utf8')) as Album

describe('the outlet suffix', () => {
  it('drops a Google News outlet the way the renderer does, and nothing else', () => {
    expect(asRecorded('google_news', 'Explosions hit Iran’s Qeshm Island - The New York Times')).toBe('Explosions hit Iran’s Qeshm Island')
    expect(asRecorded('google_news', 'Oil price falls — BBC')).toBe('Oil price falls')
    expect(asRecorded('google_news', 'A headline | Reuters')).toBe('A headline')
    // an outlet of one character is not one
    expect(asRecorded('google_news', 'Plan A - B')).toBe('Plan A - B')
    // only Google News carries outlets
    expect(asRecorded('bluesky', '  Ukraine - Russia talks ')).toBe('Ukraine - Russia talks')
    expect(OUTLET.flags).toContain('u')
  })
})

describe('the links', () => {
  it('prefers the record’s platform and takes only web links', () => {
    const day = indexDay({
      google_news: [{ label: 'Same words - Outlet', url: 'https://news.example/a' }],
      bluesky: [{ label: 'Same words', url: 'https://bsky.example/b' }, { label: 'No link', url: null }, { label: 'Odd', url: 'javascript:alert(1)' }],
    })
    expect(linkFor(day, 'Same words', 'bluesky')).toBe('https://bsky.example/b')
    expect(linkFor(day, 'Same words', 'google_news')).toBe('https://news.example/a')
    expect(linkFor(day, 'Same words')).toBe('https://news.example/a')
    expect(linkFor(day, 'No link')).toBeNull()
    expect(linkFor(day, 'Odd')).toBeNull()
    expect(hostOf('https://www.bsky.app/x')).toBe('bsky.app')
  })

  for (const week of ['2026-W45', '2026-W46']) {
    it(`finds every overlooked headline of ${week} and every murmured one in its day file`, () => {
      const a = album(week)
      for (const d of a.pieces.overlooked.days) {
        const links = dayLinks(d.day)
        expect(linkFor(links, d.text, d.source), d.text).not.toBeNull()
        for (const x of d.attended) expect(linkFor(links, x.text), x.text).not.toBeNull()
      }
    })
  }

  it('finds every war signal of Contrapunctus 45 in its day file', () => {
    const u = album('2026-W45').pieces.unison!
    for (const d of u.days) {
      const links = dayLinks(d.day)
      for (const e of d.events) expect(linkFor(links, e.text), e.text).not.toBeNull()
      expect(linkFor(links, d.overlooked)).not.toBeNull()
      if (d.said) expect(linkFor(links, d.said)).not.toBeNull()
    }
  })
})
