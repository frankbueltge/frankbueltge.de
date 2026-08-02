// The frame is the only site-authored markup inside a mirrored work, so what it must never do
// matters as much as what it does: never overwrite the work, never invent prose for a work that
// has no wall text, never claim to be the practice's own words, and never stack a second copy
// of itself when the mirror is re-framed.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { existsSync, readdirSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { FRAME_MARKER, frameStandaloneWork, practiceFor } from './work-frame'
import { teaserFor } from './teaser'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const DOC = '<!DOCTYPE html><html lang="en"><head><title>W</title></head><body><h1>work</h1></body></html>'

describe('the frame names the practice a work belongs to', () => {
  it('resolves each engine namespace to its own room', () => {
    expect(practiceFor('atelier')).toMatchObject({ name: 'The Atelier', href: '/atelier' })
    expect(practiceFor('studio')).toMatchObject({ name: 'The Studio', href: '/studio' })
    expect(practiceFor('field')).toMatchObject({ name: 'The Field', href: '/field' })
  })

  it('returns null for a house that keeps no works room, and still frames the work', () => {
    expect(practiceFor('plenum')).toBeNull()
    const out = frameStandaloneWork(DOC, 'plenum', 'a label')
    expect(out).toContain('href="/"') // the ecology is always reachable
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
    expect(out).toContain('href="/"')
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
      expect(html).toContain('href="/"')
      const wall = teaserFor(ns, slug)
      if (wall) expect(html, 'wall text on record but not in the mirror').toContain(wall.slice(0, 60))
    })
  }
})
