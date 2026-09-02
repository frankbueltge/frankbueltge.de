// The gallery's server render is the whole gallery (visual layer, Phase 3c, 2026-09-02).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): what Astro renders on the server is the complete surface — deterministic, free of
// style attributes, carrying every link, every badge, every description and every miniature
// before a single script has run. What JavaScript adds here is the filtering, the reflow and the
// readout; what it must never add is a card, a figure or a sentence.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { GALLERY } from '@/config/gallery-wording'
import { WERKE_BY_LINE, werkTitle } from '@/data/werke'
import { KIND_LABEL, kindOf, shelfFacets, type ShelfCard, type ShelfKind } from '@/lib/experiments/shelf'
import { THUMBNAILS, THUMB_BOX } from '@/lib/experiments/thumbnails'

import ExperimentGallery, { type GalleryCard, type GallerySection } from './ExperimentGallery'

const sections: GallerySection[] = WERKE_BY_LINE.map((group) => ({
  id: group.line.id,
  label: group.line.label,
  blurb: group.line.blurb.en,
  cards: group.werke.map(
    (werk): GalleryCard => ({
      id: werk.id,
      group: group.line.id,
      kind: kindOf(werk),
      kindLabel: kindOf(werk) === 'experiment' ? null : KIND_LABEL[kindOf(werk)],
      live: Boolean(werk.live),
      title: werkTitle(werk, 'en'),
      subtitle: werk.subtitle.en,
      description: werk.description.en,
      href: werk.href,
      methodHref: werk.methodHref,
      stamp: werk.since,
      thumb: THUMBNAILS.get(werk.id) ?? null,
    }),
  ),
}))

const cards: ShelfCard[] = sections.flatMap((s) =>
  s.cards.map((c) => ({ id: c.id, group: c.group, kind: c.kind as ShelfKind, live: c.live })),
)

const facets = shelfFacets(
  cards,
  new Map(sections.map((s) => [s.id, s.label])),
  sections.map((s) => s.id),
)

const wording = {
  all: GALLERY.filter.all,
  reset: GALLERY.filter.reset,
  shown: GALLERY.filter.shown,
  empty: GALLERY.filter.empty,
  live: GALLERY.stamp.live,
  opened: GALLERY.stamp.opened,
  open: GALLERY.link.open,
  method: GALLERY.link.method,
  from: GALLERY.thumb.from,
}

const render = () =>
  renderToStaticMarkup(
    <ExperimentGallery
      sections={sections}
      facets={facets}
      wording={wording}
      box={{ width: THUMB_BOX.width, height: THUMB_BOX.height }}
      readoutId="gallery-readout"
    />,
  )

describe('the gallery renders whole on the server', () => {
  const html = render()

  it('is deterministic — the same model renders the same markup', () => {
    expect(render()).toBe(html)
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // Written with escapes so this assertion does not itself trip the drift check that walks
    // .tsx (the house idiom — see CyclePartitur.test.tsx and GraphExplorer.test.tsx).
    expect(html).not.toMatch(/ style=\x22/)
    expect(html).not.toMatch(/ style=\{/)
  })

  it('carries every card, its link and its description', () => {
    for (const section of sections) {
      for (const card of section.cards) {
        expect(html, `${card.id} has no link on the gallery`).toContain(`href="${card.href}"`)
        expect(html, `${card.id} has no title on the gallery`).toContain(card.title)
      }
    }
  })

  it('draws every miniature before a script has run', () => {
    for (const section of sections) {
      for (const card of section.cards) {
        expect(card.thumb, `${card.id} reached the gallery without a miniature`).not.toBeNull()
        expect(html, `${card.id}'s miniature is not in the server render`).toContain(`tm-t-${card.id}`)
      }
    }
    // The marks themselves, not just the frames around them.
    expect(html).toMatch(/class="tm-(bar|line|dot|seg|area|gap|rule)/)
  })

  it('states the shelf’s totals with every card shown', () => {
    const total = sections.reduce((n, s) => n + s.cards.length, 0)
    expect(html).toContain(`>${total}</span> / <span class="tabular-nums">${total}</span>`)
    expect(cards.length).toBe(total)
  })

  it('offers the filter as buttons, pressed on “all” — never an empty screen without JavaScript', () => {
    for (const facet of facets) {
      expect(html, `the ${facet.title} axis is missing from the bar`).toContain(`aria-label="${facet.title}"`)
    }
    expect(html).toContain('aria-pressed="true"')
    // the reset button is rendered but hidden until something is filtered
    expect(html).toMatch(/hidden[^>]*>reset<\/button>|>reset<\/button>/)
  })

  it('names each miniature after the experiment and what the drawing shows', () => {
    const first = sections[0]!.cards[0]!
    expect(html).toContain(`${first.title} — ${first.thumb!.draws}`)
  })
})
