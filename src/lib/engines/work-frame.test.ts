// The frame is the only site-authored markup inside a mirrored work, so what it must never do
// matters as much as what it does: never overwrite the work, never invent prose for a work that
// has no wall text, never claim to be the practice's own words, and never stack a second copy
// of itself when the mirror is re-framed.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { existsSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FRAME_MARKER, foldShelf, frameStandaloneWork, practiceFor, SHELF_OPEN, type FrameShelfEntry } from './work-frame'
import { teaserFor } from './teaser'
import { NAMING } from '@/config/naming'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const DOC = '<!DOCTYPE html><html lang="en"><head><title>W</title></head><body><h1>work</h1></body></html>'

// ————————————————————————————————————————— the shelf on a front door ——————————————

describe('a front door’s shelf of the pages behind it', () => {
  const SHELF: FrameShelfEntry[] = [
    {
      href: '/n-1/projects/unicode-admission/languages.html',
      title: 'When a language is complete',
      kind: 'study',
      date: '2026-10-10',
      sentence: 'A writing system can be “in Unicode” for years.',
    },
    { href: '/n-1/works/two-nights-deep/', title: 'Two Nights Deep', kind: 'work', date: '2026-08-25', sentence: 'I am a machine.' },
    { href: '/n-1/projects/x/', title: 'A page no record dates', kind: 'study', date: null, sentence: null },
  ]
  const WORDS = NAMING.worksRegister.standaloneFrame.shelf
  const out = frameStandaloneWork(DOC, 'n-1', null, { atHouseIndex: true, shelf: SHELF })
  const shelfEl = `class="${FRAME_MARKER}__shelf"`

  it('lists every page with its own title, its first sentence, its day and a link', () => {
    for (const e of SHELF) {
      expect(out).toContain(`href="${e.href}"`)
      expect(out).toContain(e.title)
    }
    expect(out).toContain('A writing system can be “in Unicode” for years.')
    expect(out).toContain('<time datetime="2026-10-10">2026-10-10</time>')
  })

  it('tells a work from a study in the practice’s own two words, and counts both', () => {
    expect(out).toContain(`data-kind="work">${WORDS.kinds.work}<`)
    expect(out).toContain(`data-kind="study">${WORDS.kinds.study}<`)
    expect(out).toContain(WORDS.count({ pages: 3, works: 1, studies: 2 }))
  })

  it('marks an undated page as undated rather than giving it a day', () => {
    const undated = out.slice(out.indexOf('A page no record dates'))
    expect(undated.slice(0, undated.indexOf('</li>'))).toContain(WORDS.undated)
    expect(undated.slice(0, undated.indexOf('</li>'))).not.toContain('<time')
  })

  it('stands above the work and says it is the site’s addition', () => {
    expect(out.indexOf(shelfEl)).toBeGreaterThan(-1)
    expect(out.indexOf(shelfEl)).toBeLessThan(out.indexOf('<h1>work</h1>'))
    expect(out).toContain(WORDS.note)
    expect(WORDS.note).toMatch(/added by the site/)
    // the shelf's note replaces the generic one above the work; the page says it once
    expect(out.slice(0, out.indexOf('<h1>work</h1>'))).not.toContain(NAMING.worksRegister.standaloneFrame.note)
  })

  it('brings no script, no external request and no style attribute', () => {
    const added = out.slice(0, out.indexOf('<h1>work</h1>'))
    expect(added).not.toMatch(/<script/i)
    expect(added).not.toMatch(/https?:\/\//)
    expect(added).not.toMatch(/\sstyle=/)
  })

  it('escapes what it lists: a page’s title is text, never markup', () => {
    const hostile = frameStandaloneWork(DOC, 'n-1', null, {
      atHouseIndex: true,
      shelf: [{ href: '/n-1/x/"onmouseover="a', title: '<img src=x>', kind: 'study', date: '2026-10-10', sentence: 'a <b>bold</b> claim' }],
    })
    expect(hostile).not.toContain('<img src=x>')
    expect(hostile).not.toContain('<b>bold</b>')
    expect(hostile).not.toContain('"onmouseover="')
  })

  it('is replaced, not stacked, when the mirror is framed again — and follows a shelf that changed', () => {
    expect(frameStandaloneWork(out, 'n-1', null, { atHouseIndex: true, shelf: SHELF })).toBe(out)
    const grown = frameStandaloneWork(out, 'n-1', null, {
      atHouseIndex: true,
      shelf: [{ href: '/n-1/projects/new/', title: 'Built Tonight', kind: 'study', date: '2026-10-11', sentence: 'New.' }, ...SHELF],
    })
    expect(grown).toContain('Built Tonight')
    expect(grown.split(shelfEl).length - 1).toBe(1)
    expect(grown).toContain('<h1>work</h1>')
  })

  it('leaves the strip exactly as it was where there is no shelf to carry', () => {
    const bare = frameStandaloneWork(DOC, 'n-1', null, { atHouseIndex: true })
    expect(frameStandaloneWork(DOC, 'n-1', null, { atHouseIndex: true, shelf: [] })).toBe(bare)
    expect(bare).not.toContain(shelfEl)
    expect(bare).toContain(NAMING.worksRegister.standaloneFrame.note)
    // and taking the shelf away again removes all of it, its stylesheet included
    expect(frameStandaloneWork(out, 'n-1', null, { atHouseIndex: true })).toBe(bare)
  })

  describe('stays compact as the practice builds on', () => {
    const study = (i: number): FrameShelfEntry => ({
      href: `/n-1/projects/p${i}/`,
      title: `Study ${i}`,
      kind: 'study',
      date: `2026-10-${String(30 - i).padStart(2, '0')}`,
      sentence: null,
    })
    const work = (i: number): FrameShelfEntry => ({ href: `/n-1/works/w${i}/`, title: `Work ${i}`, kind: 'work', date: '2026-08-16', sentence: null })

    it('keeps a shelf open whole while it fits', () => {
      const entries = [...Array.from({ length: 8 }, (_, i) => study(i)), work(0), work(1), work(2)]
      expect(foldShelf(entries)).toEqual({ open: entries, folded: [] })
      expect(frameStandaloneWork(DOC, 'n-1', null, { shelf: entries })).not.toContain('<details')
    })

    it('folds the older studies away, newest first on both sides, and never a work', () => {
      const entries = [...Array.from({ length: 20 }, (_, i) => study(i)), work(0), work(1), work(2)]
      const { open, folded } = foldShelf(entries)
      expect(open).toHaveLength(SHELF_OPEN)
      expect(open.filter((e) => e.kind === 'work')).toHaveLength(3)
      expect(open.slice(0, 9).map((e) => e.title)).toEqual(Array.from({ length: 9 }, (_, i) => `Study ${i}`))
      expect(folded.map((e) => e.title)).toEqual(Array.from({ length: 11 }, (_, i) => `Study ${i + 9}`))

      const html = frameStandaloneWork(DOC, 'n-1', null, { shelf: entries })
      expect(html).toContain(`<summary>${WORDS.earlier(11)}</summary>`)
      // folded, not dropped: every page is still a link in the document
      for (const e of entries) expect(html).toContain(`href="${e.href}"`)
    })

    it('still shows the newest studies when the works alone would fill the shelf', () => {
      const entries = [...Array.from({ length: 6 }, (_, i) => study(i)), ...Array.from({ length: 14 }, (_, i) => work(i))]
      const { open, folded } = foldShelf(entries)
      expect(open.filter((e) => e.kind === 'study').map((e) => e.title)).toEqual(['Study 0', 'Study 1', 'Study 2', 'Study 3'])
      expect(folded.map((e) => e.title)).toEqual(['Study 4', 'Study 5'])
    })
  })
})

describe('the frame names the practice a work belongs to', () => {
  it('resolves each engine namespace to its own room', () => {
    expect(practiceFor('atelier')).toMatchObject({ name: 'The Atelier', href: '/atelier' })
    expect(practiceFor('studio')).toMatchObject({ name: 'The Studio', href: '/studio' })
    expect(practiceFor('field')).toMatchObject({ name: 'The Field', href: '/field' })
  })

  it('returns null for a house that keeps no works room, and still frames the work', () => {
    expect(practiceFor('plenum')).toBeNull()
    const out = frameStandaloneWork(DOC, 'plenum', 'a label')
    expect(out).toContain('href="/ecology"') // the ecology is always reachable
    expect(out).toContain('a label')
  })
})

describe('the frame carries the wall text and the way back', () => {
  const out = frameStandaloneWork(DOC, 'atelier', 'One real measurement from a star catalogue.')

  it('puts the label and the links above the work, not inside it', () => {
    expect(out.indexOf(FRAME_MARKER)).toBeLessThan(out.indexOf('<h1>work</h1>'))
    expect(out).toContain('One real measurement from a star catalogue.')
    expect(out).toContain('href="/atelier"')
    expect(out).toContain('href="/atelier/works"')
    expect(out).toContain('href="/ecology"')
  })

  it('leaves the work’s own markup byte-for-byte intact', () => {
    expect(out).toContain('<h1>work</h1>')
    expect(out).toContain('<title>W</title>')
    // everything the work shipped still parses in the same order
    expect(out.indexOf('<title>W</title>')).toBeLessThan(out.indexOf('<h1>work</h1>'))
  })

  it('says it is the site speaking, so the frame is never read as the practice’s words', () => {
    expect(out).toMatch(/added by the site/i)
  })

  it('gives a way out at the end as well as the start — a work is long, and scrolls', () => {
    const last = out.lastIndexOf('href="/atelier"')
    expect(last).toBeGreaterThan(out.indexOf('<h1>work</h1>'))
  })
})

describe('the frame refuses to invent what the record does not have', () => {
  // The class name also appears in the frame's stylesheet, so the guard is the ELEMENT.
  const wallEl = `class="${FRAME_MARKER}__wall"`

  it('shows no wall text at all when none is on record, rather than a substitute', () => {
    const out = frameStandaloneWork(DOC, 'atelier', null)
    expect(out).toContain(FRAME_MARKER) // the links still land
    expect(out).not.toContain(wallEl)
  })

  it('treats an empty or whitespace label as no label', () => {
    expect(frameStandaloneWork(DOC, 'atelier', '   ')).not.toContain(wallEl)
  })

  it('escapes a label rather than letting it become markup', () => {
    const out = frameStandaloneWork(DOC, 'atelier', 'a <script>alert(1)</script> label')
    expect(out).not.toContain('<script>alert(1)</script>')
    expect(out).toContain('&lt;script&gt;')
  })
})

describe('framing is idempotent, because the mirror gets re-framed', () => {
  it('does not stack a second strip on an already-framed document', () => {
    const once = frameStandaloneWork(DOC, 'atelier', 'label')
    const twice = frameStandaloneWork(once, 'atelier', 'label')
    expect(twice).toBe(once)
  })
})

describe('the frame survives the shapes real works actually ship', () => {
  it('frames a document with attributes on <body>', () => {
    const out = frameStandaloneWork(
      '<html><head></head><body class="x" data-y="1"><p>w</p></body></html>', 'atelier', 'l',
    )
    expect(out).toContain('<body class="x" data-y="1">')
    expect(out.indexOf(FRAME_MARKER)).toBeGreaterThan(out.indexOf('<body'))
    expect(out.indexOf(FRAME_MARKER)).toBeLessThan(out.indexOf('<p>w</p>'))
  })

  it('frames a fragment with no <body> at all rather than skipping it', () => {
    const out = frameStandaloneWork('<h1>fragment</h1>', 'atelier', 'l')
    expect(out).toContain(FRAME_MARKER)
    expect(out).toContain('<h1>fragment</h1>')
  })

  it('uses no external request and no script — the standalone CSP forbids both', () => {
    const out = frameStandaloneWork('<html><body></body></html>', 'atelier', 'l')
    // only the work's own content may bring scripts; the frame brings none
    expect(out).not.toMatch(/<script/i)
    expect(out).not.toMatch(/https?:\/\//)
  })
})

// ————————————————————————————————————————— the mirrors on disk ——————————————

describe('every mirrored standalone work carries the frame', () => {
  const namespaces = ['atelier', 'studio', 'field', 'plenum'].filter((ns) =>
    existsSync(`${ROOT}public/${ns}/werke-html`),
  )
  const works = namespaces.flatMap((ns) =>
    readdirSync(`${ROOT}public/${ns}/werke-html`)
      .filter((slug) => existsSync(`${ROOT}public/${ns}/werke-html/${slug}/index.html`))
      .map((slug) => ({ ns, slug })),
  )

  it('finds standalone works to check', () => {
    expect(works.length).toBeGreaterThan(0)
  })

  // THE REGRESSION THIS FILE EXISTS FOR. Before 2026-08-02 every one of these files had zero
  // internal links: a visitor arriving from a shared link met the work with no practice, no
  // wall text and no exit. The integrate rewrites these mirrors, so the guard has to run
  // against what is actually on disk, not against the function alone.
  for (const { ns, slug } of works) {
    it(`${ns}/${slug} — framed, with a way back and its wall text if one is on record`, () => {
      const html = readFileSync(`${ROOT}public/${ns}/werke-html/${slug}/index.html`, 'utf8')
      expect(html, 'not framed').toContain(FRAME_MARKER)
      const practice = practiceFor(ns)
      if (practice) expect(html).toContain(`href="${practice.href}"`)
      expect(html).toContain('href="/ecology"')
      const wall = teaserFor(ns, slug)
      if (wall) expect(html, 'wall text on record but not in the mirror').toContain(wall.slice(0, 60))
    })
  }
})
