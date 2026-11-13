// The lab's carousel, rendered on the server, is the whole band (2026-11-02).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): what Astro renders before a single script runs is complete. Here that means every
// experiment as a card with its link, in the carousel's order, its line, its sentence and its
// picture, a link to /experiments under the row, and controls that hold their place but stay
// invisible until the island has run — no dead button for a reader without JavaScript.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { EDITION } from '@/config/edition-wording'
import { THUMB_BOX } from '@/lib/experiments/thumbnails'
import { labBand, labSlides, labWording, readLabCarousel } from '@/lib/ops/lab-carousel'
import { STILL_FRAME } from '@/lib/ops/shelf-stills'

import LabCarousel from './LabCarousel'

const all = labSlides(readLabCarousel())
const { lead, carousel: slides } = labBand(all)
const html = renderToStaticMarkup(
  <LabCarousel
    lead={lead}
    slides={slides}
    wording={labWording()}
    headingId="ed-lab-title"
    trackId="ed-lab-track"
    box={{ width: THUMB_BOX.width, height: THUMB_BOX.height }}
    frame={{ width: STILL_FRAME.width, height: STILL_FRAME.height }}
  />,
)
/** text as React writes it into markup */
const escaped = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#x27;')

describe('the carousel’s server render', () => {
  it('heads the band with the edition’s own words, under the id the section is labelled by', () => {
    expect(html).toContain(`<h2 id="ed-lab-title">${escaped(EDITION.lab.title)}</h2>`)
  })

  it('has no lead since 2026-11-13: the six stand in the carousel alone', () => {
    expect(lead.length).toBe(0)
    expect(html).not.toContain('class="ed-lab-lead"')
    expect(html).not.toContain('class="ed-lab-sub"')
  })

  it('carries every experiment’s link in the carousel’s order', () => {
    let from = -1
    for (const slide of all) {
      const at = html.indexOf(`href="${slide.href}"`, from + 1)
      expect(at, `${slide.id} is missing or out of order`).toBeGreaterThan(from)
      from = at
    }
  })

  it('names each card for a screen reader as a slide, by its place in the row', () => {
    const total = slides.length
    for (let n = 1; n <= total; n++) {
      expect(html).toContain(`role="group" aria-roledescription="${EDITION.lab.slide}" aria-label="${n} of ${total}"`)
    }
  })

  it('shows each card’s line of research, sentence and day', () => {
    for (const slide of slides) {
      if (slide.line) expect(html).toContain(escaped(slide.line))
      expect(html).toContain(escaped(slide.sentence))
      expect(html).toContain(escaped(slide.meta))
    }
  })

  it('loads every picture only when it is near and its theme shows it', () => {
    const images = [...html.matchAll(/<img [^>]*>/g)].map((m) => m[0])
    const light = images.filter((img) => img.includes('ed-duo--light'))
    const dark = images.filter((img) => img.includes('ed-duo--dark'))
    expect(light.length).toBe(all.filter((s) => s.still).length)
    expect(dark.length).toBe(all.filter((s) => s.still?.dark).length)
    for (const img of [...light, ...dark]) expect(img).toContain('loading="lazy"')
  })

  it('draws the miniature of its own record for a work whose page has no still yet', () => {
    for (const slide of slides.filter((s) => !s.still && s.mini)) {
      expect(html).toContain(`aria-label="${escaped(`${slide.title}: ${slide.mini!.draws}`)}"`)
      expect(html).toContain(escaped(slide.mini!.readout))
    }
  })

  it('keeps the controls in place but unready, so a reader without a script meets no dead button', () => {
    expect(html).not.toContain('data-ready')
    expect(html).toContain(`aria-label="${EDITION.lab.prev}"`)
    expect(html).toContain(`aria-label="${EDITION.lab.next}"`)
    const buttons = [...html.matchAll(/<button [^>]*>/g)].map((m) => m[0])
    expect(buttons.length).toBe(2)
    for (const button of buttons) {
      expect(button).toContain('disabled=""')
      expect(button).toContain('aria-controls="ed-lab-track"')
    }
  })

  it('links every experiment on one page under the row', () => {
    expect(html).toContain(`href="${EDITION.lab.all.href}"`)
  })

  it('carries no style attribute, which this site’s CSP would drop', () => {
    expect(html).not.toMatch(/\sstyle=/)
  })

  it('says nothing to a screen reader until a control has moved the row', () => {
    expect(html).toContain('aria-live="polite" aria-atomic="true"></p>')
  })
})
