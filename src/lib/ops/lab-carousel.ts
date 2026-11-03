// src/lib/ops/lab-carousel.ts — the lab's experiments as the band the entrance opens with
// (2026-11-02; a fixed selection since 2026-11-03).
//
// Frank's decision of 2026-11-02 (wording private, paraphrased): the homepage leads with the lab's
// experiments. Since 2026-11-03 (the calm homepage, docs/design_handoff_homepage_calm/README.md §3)
// the band is a fixed selection from the register (src/data/werke.ts, WERKE_HOLDINGS), in one order:
//
//   · the work EDITION.lab.lead names stands first and large, as the band's lead — Ducking;
//   · then exactly the works EDITION.lab.picks names, in that order, as the carousel under it;
//   · a retired work, or an id the register does not hold, is passed over rather than shown;
//     the test holds the edition's own lists to works that are there and running.
//
// /experiments keeps listing every experiment; the band is a selection, not the index.
//
// A card is read the way a pick of the selected works is read (readPick): title, kind, the day in
// words, the register's one line, the address through the publication rule, and the still — for a
// lab experiment, a shot of its own page as this site serves it (public/shelf/lab-<id>.webp, taken
// by npm run shelf:shots). A work whose page has no shot yet shows the miniature /experiments draws
// from its own record (src/lib/experiments/thumbnails.ts), never a picture made for it.
//
// Build time only: the edition hands the finished cards to the island (src/components/ops/
// LabCarousel.tsx), which imports none of this.

import type { LabSlide, LabWording } from '@/components/ops/LabCarousel'
import { EDITION } from '@/config/edition-wording'
import { SELECTED_WORKS } from '@/config/selected-works'
import { EXPERIMENT_LINES, WERKE_HOLDINGS, type Werk } from '@/data/werke'
import { THUMBNAILS, type Thumbnail } from '@/lib/experiments/thumbnails'
import { readPick, type ShelfCard } from './selected-works'

/**
 * The order of the band: the `lead` works first, then the `picks`, each in the order given. A work
 * is shown once, and a retired work or an id the register does not hold is passed over
 * (src/lib/ops/lab-carousel.test.ts holds the edition's own lists to works that are there).
 */
export function carouselOrder(werke: readonly Werk[], lead: readonly string[], picks: readonly string[]): Werk[] {
  const running = new Map(werke.filter((w) => !w.retired).map((w) => [w.id, w]))
  return [...new Set([...lead, ...picks])].flatMap((id) => {
    const werk = running.get(id)
    return werk ? [werk] : []
  })
}

export interface LabCard extends ShelfCard {
  /** the research line's label, as /experiments heads the work's group */
  line: string | null
  /** the miniature of the work's own record, for a card whose page has no still yet */
  mini: Thumbnail | null
}

/** The band's cards, in its order: the lead first, then the carousel's. */
export function readLabCarousel(
  root: string = process.cwd(),
  lead: readonly string[] = EDITION.lab.lead,
  werke: readonly Werk[] = WERKE_HOLDINGS,
  picks: readonly string[] = EDITION.lab.picks,
): LabCard[] {
  return carouselOrder(werke, lead, picks).map((werk) => {
    // a lab experiment needs no presentation shelf to be read, hence the empty one
    const card = readPick({ work: { kind: 'experiment', id: werk.id }, reason: '' }, root, [])
    return {
      ...card,
      line: EXPERIMENT_LINES.find((l) => l.id === werk.line)?.label ?? null,
      mini: card.still ? null : (THUMBNAILS.get(werk.id) ?? null),
    }
  })
}

/** The cards as the island takes them: plain data, every internal address passed through the
 *  page's own link helper (the edition's locale helper), every phrase already composed. */
export function labSlides(cards: readonly LabCard[], link: (href: string) => string = (href) => href): LabSlide[] {
  return cards.map((card) => ({
    id: card.key,
    title: card.title,
    line: card.line,
    sentence: card.sentence,
    // the shelf's own meta line: what kind of work, and since when
    meta: `${card.kind} · ${card.when}`,
    kind: card.kind,
    href: link(card.href),
    still: card.still && { src: card.still.src, alt: card.still.alt, dark: card.still.dark },
    mini: card.mini && { marks: card.mini.marks, draws: card.mini.draws, readout: card.mini.readout },
    plate: SELECTED_WORKS.plate(card.kind),
  }))
}

/** The band's words as the island takes them (EDITION.lab), the link to /experiments through the
 *  same helper. */
export function labWording(link: (href: string) => string = (href) => href): LabWording {
  const L = EDITION.lab
  return {
    title: L.title,
    sub: L.sub,
    all: { label: L.all.label, href: link(L.all.href) },
    slide: L.slide,
    position: L.position,
    count: L.count,
    prev: L.prev,
    next: L.next,
    announce: L.announce,
    open: L.open,
    mini: L.mini,
    leadLabel: L.leadLabel,
  }
}

/** The band split as the edition shows it: the lead work large, the rest in the carousel. */
export function labBand<T>(slides: readonly T[], lead: readonly string[] = EDITION.lab.lead): { lead: T[]; carousel: T[] } {
  const n = Math.min(lead.length, slides.length)
  return { lead: slides.slice(0, n), carousel: slides.slice(n) }
}
