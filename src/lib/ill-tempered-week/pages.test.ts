// Which album stands where: the front page's choice, one page per album, and the links the scores carry. Runs in
// the nightly press too, so every statement holds for any set of albums.
import { describe, expect, it } from 'vitest'

import { readAlbums, type Album } from './albums'
import { isAlbumAudio } from './audio-path'
import { albumPages, albumPath, frontPage, overlookedLinks, turnSaidLink, unisonLinks, warSignals } from './pages'

const albums = readAlbums()
const stub = (week: string, complete: boolean): Album => ({ week, complete } as Album)

describe('the front page', () => {
  it('plays the newest complete album and shows the running week above it', () => {
    const f = frontPage([stub('2026-W45', true), stub('2026-W46', false)])
    expect(f.album.week).toBe('2026-W45')
    expect(f.growing?.week).toBe('2026-W46')
    expect(f.earlier).toEqual([])
  })

  it('moves the album before to the earlier ones once a week completes, newest first', () => {
    const f = frontPage([stub('2026-W45', true), stub('2026-W46', true), stub('2026-W47', true), stub('2026-W48', false)])
    expect(f.album.week).toBe('2026-W47')
    expect(f.growing?.week).toBe('2026-W48')
    expect(f.earlier.map((a) => a.week)).toEqual(['2026-W46', '2026-W45'])
  })

  it('has no running week on the day a week completed, and plays a first week alone while it grows', () => {
    const done = frontPage([stub('2026-W45', true), stub('2026-W46', true)])
    expect(done.album.week).toBe('2026-W46')
    expect(done.growing).toBeNull()
    expect(done.earlier.map((a) => a.week)).toEqual(['2026-W45'])
    const first = frontPage([stub('2026-W45', false)])
    expect(first.album.week).toBe('2026-W45')
    expect(first.growing).toBeNull()
  })

  it('shows every album on file exactly once', () => {
    const f = frontPage(albums)
    const shown = [f.album, ...(f.growing ? [f.growing] : []), ...f.earlier].map((a) => a.week).sort()
    expect(shown).toEqual(albums.map((a) => a.week).sort())
  })
})

describe('a page per album', () => {
  it('gives every album on file its own address and its neighbours', () => {
    const pages = albumPages(albums)
    expect(pages.map((p) => p.params.week)).toEqual(albums.map((a) => a.week))
    pages.forEach((p, i) => {
      expect(albumPath(p.params.week)).toBe(`/ill-tempered-week/${albums[i]!.week}/`)
      expect(p.props.older).toBe(albums[i - 1]?.week ?? null)
      expect(p.props.newer).toBe(albums[i + 1]?.week ?? null)
    })
  })

  it('shares its folder with the album’s audio, which the function tells apart', () => {
    expect(isAlbumAudio('2026-W45', 'overlooked.m4a')).toBe(true)
    expect(isAlbumAudio('2026-W45', 'unison.m4a')).toBe(true)
    expect(isAlbumAudio('2026-W45', 'turn.m4a')).toBe(true)
    // the page itself, its index file, and anything else are not audio and go on to the asset server
    expect(isAlbumAudio('2026-W45', '')).toBe(false)
    expect(isAlbumAudio('2026-W45', 'index.html')).toBe(false)
    expect(isAlbumAudio('2026-W45', 'overlooked.mp3')).toBe(false)
    expect(isAlbumAudio('albums', '2026-W45')).toBe(false)
    expect(isAlbumAudio('2026-W45', '../turn.m4a')).toBe(false)
  })
})

describe('the links of the scores', () => {
  it('gives a slot to every day and every murmured headline, found or not', () => {
    for (const a of albums) {
      const o = a.pieces.overlooked
      const links = overlookedLinks(o)
      expect(links.days).toHaveLength(o.days.length)
      links.days.forEach((d, i) => expect(d.attended).toHaveLength(o.days[i]!.attended.length))
      if (a.pieces.unison) {
        const u = a.pieces.unison
        expect(unisonLinks(u).days).toHaveLength(u.days.length)
        const signals = warSignals(u)
        expect(signals).toHaveLength(u.days.reduce((n, d) => n + d.events.length, 0))
        signals.slice(1).forEach((s, i) => expect(s.at_s).toBeGreaterThanOrEqual(signals[i]!.at_s))
      }
      if (a.pieces.turn) {
        const link = turnSaidLink(a.pieces.turn)
        expect(link === null || link.startsWith('http')).toBe(true)
      }
    }
  })

  it('links the headline that turned Contrapunctus 45', () => {
    const first = albums.find((a) => a.week === '2026-W45')!
    expect(turnSaidLink(first.pieces.turn!)).toMatch(/^https:\/\//)
  })
})
