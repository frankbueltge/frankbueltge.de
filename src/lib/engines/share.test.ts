// What a shared link to a practice's page shows, and the way back (2026-10-18): the share block and
// the back strip are written in the page's own words where it has them, never twice, never over a
// tag the page sets itself, and in a place that means the same in every shape a page ships in.
import { describe, expect, it } from 'vitest'
import { bodyStartAt, headInsertAt } from './html-places'
import {
  BACK_MARKER,
  SHARE_MARKER,
  backStrip,
  decodeEntities,
  injectBack,
  injectShare,
  isLabelLine,
  openingSentences,
  ownMeta,
  pageTitle,
  sentences,
  splitSentences,
  textOf,
  type ShareMeta,
} from './share'
import { FRAME_MARKER, frameStandaloneWork } from './work-frame'

const count = (s: string, needle: string) => s.split(needle).length - 1

const META: ShareMeta = {
  url: 'https://frankbueltge.de/field/presentations/cycle-007/',
  title: 'Where the Near Miss Is Decided',
  description: 'A near miss is an event that did not happen.',
  siteName: 'Frank Bültge',
  image: { url: 'https://frankbueltge.de/og/practice/field/presentations/cycle-007.png', width: 1200, height: 630, alt: 'card', type: 'image/png' },
}
const FIELD = { label: 'The Field', href: '/field' }

const DOC = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>Where the Near Miss Is Decided</title>
<style>body{margin:0}</style>
</head>
<body class="x">
<p class="kicker">The Field · cycle 007 · presentation</p>
<h1>Where the Near Miss Is Decided</h1>
<p class="stand">A near miss is an event that did not happen. Every record of one holds a decision.</p>
</body>
</html>`

/** A page as many practices ship it: no head and no body tag. */
const FRAGMENT = `<!doctype html>
<html lang="en">
<meta charset="utf-8">
<title>The Same Rate &middot; Error as Method</title>
<style>main{max-width:60ch}</style>
<main><h1>The same rate</h1><p>Forty obligations, read by hand before any rule was run over them, and what the rule then did.</p></main>
</html>`

/** Shapes the mirrors actually hold (inventory of 2026-10-18). */
const SHAPES: Record<string, string> = {
  'a whole document': DOC,
  'a document without head or body tags': FRAGMENT,
  'a bare fragment opening with its title': '<title>Ensemble — Closing Report</title>\n<style>.wrap{}</style>\n<div class="wrap"><p>One hundred and fourteen working sessions of an autonomous art practice.</p></div>',
  'a doctype and no html tag': '<!doctype html>\n<meta charset="utf-8">\n<title>No One to Bear It</title>\n<div class="wrap"><h1>No One</h1></div>',
}

describe('reading a page in its own words', () => {
  it('decodes the references the practices write', () => {
    expect(decodeEntities('The Same Rate &middot; Session 95 &#183; &#x2014; &amp; &bogus;')).toBe('The Same Rate · Session 95 · — & &bogus;')
  })

  it('joins inline tags without a space, and leaves none before punctuation', () => {
    expect(textOf('read through <i>Missing Data Art</i>, by <a href="x">the Field</a>.')).toBe('read through Missing Data Art, by the Field.')
    expect(textOf('one<br>two<p>three</p>')).toBe('one two three')
  })

  it('takes the title from <title>, else the first <h1>, and never from the site’s own frame', () => {
    expect(pageTitle(DOC)).toBe('Where the Near Miss Is Decided')
    expect(pageTitle(FRAGMENT)).toBe('The Same Rate · Error as Method')
    expect(pageTitle('<body><h1>Only a <em>heading</em></h1></body>')).toBe('Only a heading')
    expect(pageTitle(frameStandaloneWork('<body><p>untitled</p></body>', 'studio', 'wall'))).toBeNull()
  })

  it('cuts sentences where they end, not inside a number, a file name or an abbreviation', () => {
    expect(splitSentences('It holds 1.5 % of rows. The paper is paper.md; see the U.S. Geological Survey. Ca. 1850 is a date.')).toEqual([
      'It holds 1.5 % of rows.',
      'The paper is paper.md; see the U.S. Geological Survey.',
      'Ca. 1850 is a date.',
    ])
  })

  it('keeps whole sentences up to the limit, and never cuts mid-word', () => {
    const text = `${'A first sentence that says enough. '.repeat(3)}${'word '.repeat(80)}`
    const out = sentences(text, 120)
    expect(out.length).toBeLessThanOrEqual(120)
    expect(out.endsWith('enough.')).toBe(true)
    const long = sentences('x'.repeat(10) + ' ' + 'alpha '.repeat(60), 100)
    expect(long.endsWith('…')).toBe(true)
    expect(long).not.toMatch(/alph…|alp…/)
  })

  it('reads a page’s standfirst before its first paragraph, and reads past label lines', () => {
    expect(openingSentences(DOC)).toBe('A near miss is an event that did not happen. Every record of one holds a decision.')
    expect(isLabelLine('The Field · cycle 004, session 5 · Missing Data Art')).toBe(true)
    expect(isLabelLine('A sentence. Another sentence · with a dot · in it.')).toBe(false)
    const labelled = '<body><p>Ulysses · Session 86 · 2026-09-10 · Error as Method. Session 84’s measurement, ported from 63 EU legal acts to 63 RFCs, and what changed.</p></body>'
    expect(openingSentences(labelled)).toBe('Session 84’s measurement, ported from 63 EU legal acts to 63 RFCs, and what changed.')
  })
})

describe('the share block', () => {
  it('writes every preview tag a link needs, once', () => {
    const out = injectShare(DOC, META)
    for (const tag of ['og:title', 'og:description', 'og:image', 'og:url', 'og:site_name', 'og:image:alt']) {
      expect(count(out, `property="${tag}"`), tag).toBe(1)
    }
    expect(out).toContain('<meta name="twitter:card" content="summary_large_image">')
    expect(out).toContain('<link rel="canonical" href="https://frankbueltge.de/field/presentations/cycle-007/">')
    expect(out).toContain('<meta name="description" content="A near miss is an event that did not happen.">')
  })

  it('stands in the head, before </head>', () => {
    const out = injectShare(DOC, META)
    expect(out.indexOf(`<!--${SHARE_MARKER}-->`)).toBeLessThan(out.indexOf('</head>'))
    expect(out.indexOf(`<!--${SHARE_MARKER}-->`)).toBeGreaterThan(out.indexOf('<title>'))
  })

  it('is replaced, never stacked: twice is once', () => {
    const once = injectShare(DOC, META)
    expect(injectShare(once, META)).toBe(once)
    expect(count(injectShare(injectShare(once, { ...META, title: 'A new title' }), META), `<!--${SHARE_MARKER}-->`)).toBe(1)
  })

  it('repeats no tag the page sets itself, and keeps the page’s own image', () => {
    const own = DOC.replace(
      '</head>',
      '<meta property="og:title" content="Its own title"><meta property="og:image" content="https://example.org/own.png"><meta name="description" content="Its own words."><link rel="canonical" href="https://frankbueltge.de/x/"></head>',
    )
    const out = injectShare(own, META)
    expect(count(out, 'property="og:title"')).toBe(1)
    expect(count(out, 'property="og:image"')).toBe(1)
    expect(out).not.toContain(META.image!.url)
    expect(count(out, 'name="description"')).toBe(1)
    expect(count(out, 'rel="canonical"')).toBe(1)
    expect(ownMeta(own).ogImage).toBe('https://example.org/own.png')
    // a page that has its own large image still gets the large card
    expect(out).toContain('content="summary_large_image"')
  })

  it('escapes what it writes: a title is text, never markup', () => {
    const out = injectShare(DOC, { ...META, title: 'A "quoted" <b>title</b> & more' })
    expect(out).toContain('content="A &quot;quoted&quot; &lt;b&gt;title&lt;/b&gt; &amp; more"')
  })

  it('says a summary card, not a large one, where there is no image at all', () => {
    expect(injectShare(DOC, { ...META, image: null })).toContain('<meta name="twitter:card" content="summary">')
  })
})

describe('the way back', () => {
  it('stands at the top of the body, and leads to the site and to the practice', () => {
    const { html, placed } = injectBack(DOC, FIELD)
    expect(placed).toBe(true)
    expect(html.indexOf(`class="${BACK_MARKER}"`)).toBeGreaterThan(html.indexOf('<body class="x">'))
    expect(html.indexOf(`class="${BACK_MARKER}"`)).toBeLessThan(html.indexOf('<h1>'))
    expect(html).toContain('<a href="/">← frankbueltge.de</a>')
    expect(html).toContain('<a href="/field">The Field</a>')
    expect(html).toContain('link added by the site')
  })

  it('is replaced, never stacked', () => {
    const once = injectBack(DOC, FIELD).html
    expect(injectBack(once, FIELD).html).toBe(once)
    expect(count(once, `<nav class="${BACK_MARKER}"`)).toBe(1)
  })

  it('stays off a page the house’s work frame already leads back from', () => {
    const framed = frameStandaloneWork(DOC, 'studio', 'A wall text.')
    const { html, placed } = injectBack(framed, FIELD)
    expect(placed).toBe(false)
    expect(html).toBe(framed)
  })

  it('runs no script, loads nothing, and sets no style attribute (the practices’ CSP)', () => {
    const strip = backStrip(FIELD)
    expect(strip).not.toMatch(/<script/i)
    expect(strip).not.toMatch(/\sstyle=/i)
    expect(strip).not.toMatch(/https?:\/\//)
    expect(injectShare(DOC, META)).not.toMatch(/\sstyle=/i)
  })
})

describe('every shape a page ships in', () => {
  for (const [shape, html] of Object.entries(SHAPES)) {
    it(`${shape}: head matter before the body, the strip at its top, the doctype first`, () => {
      const out = injectBack(injectShare(html, META), FIELD).html
      const share = out.indexOf(`<!--${SHARE_MARKER}-->`)
      const strip = out.indexOf(`<nav class="${BACK_MARKER}"`)
      expect(share).toBeGreaterThanOrEqual(0)
      expect(strip).toBeGreaterThan(share)
      // nothing of the page's own body stands before the strip
      expect(out.slice(0, strip)).not.toMatch(/<(main|div|h1|p)\b/)
      if (/^<!doctype/i.test(html)) expect(out.startsWith('<!doctype')).toBe(true)
      // and the whole is stable
      expect(injectBack(injectShare(out, META), FIELD).html).toBe(out)
    })

    it(`${shape}: the work frame and the share block keep their places when either is written again`, () => {
      const framed = frameStandaloneWork(html, 'studio', 'A wall text.')
      const shared = injectShare(framed, META)
      expect(frameStandaloneWork(shared, 'studio', 'A wall text.')).toBe(shared)
      expect(injectShare(frameStandaloneWork(shared, 'studio', 'A wall text.'), META)).toBe(shared)
      expect(count(shared, `<header class="${FRAME_MARKER}"`)).toBe(1)
      if (/^<!doctype/i.test(html)) expect(shared.startsWith('<!doctype')).toBe(true)
    })
  }
})

describe('the places in a page', () => {
  it('finds the body after <body>, after </head>, or after the head matter', () => {
    expect(bodyStartAt('<html><head></head><body id="b"><p>x</p></body></html>')).toBe('<html><head></head><body id="b">'.length)
    expect(bodyStartAt('<head><title>t</title></head><p>x</p>')).toBe('<head><title>t</title></head>'.length)
    expect(bodyStartAt('<!-- c --><title>t</title>\n<style>a{}</style>\n<div>x</div>')).toBe('<!-- c --><title>t</title>\n<style>a{}</style>\n'.length)
    expect(bodyStartAt('<h1>fragment</h1>')).toBe(0)
  })

  it('finds the head before </head>, else after the document’s opening', () => {
    expect(headInsertAt('<head><title>t</title></head><body></body>')).toBe('<head><title>t</title>'.length)
    expect(headInsertAt('<!doctype html><html lang="en"><title>t</title><p>x</p>')).toBe('<!doctype html><html lang="en">'.length)
    expect(headInsertAt('<title>t</title><p>x</p>')).toBe(0)
  })
})
