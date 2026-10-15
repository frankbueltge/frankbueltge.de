// src/components/experiments/ExperimentGallery.tsx — /experiments as a gallery (visual layer,
// Phase 3c, 2026-09-02; docs/design/2026-09-02-the-visual-layer.md).
//
// What changed on the shelf: every card now carries a MINIATURE OF ITS OWN INSTRUMENT — the same
// record its page draws, through the same pure builder, in a 240×72 box
// (src/lib/experiments/thumbnails.ts). Nothing here invents a graphic; a card whose record has a
// hole draws the hole.
//
// The seven duties (.claude/rules/dataviz-figures.md, "Interaktive Figuren"), applied:
//   1. NOTHING IS COMPUTED HERE. The drawings arrive as a model built at build time; this file
//      maps marks onto SVG elements, filters, animates and answers the pointer.
//   2. THE SERVER RENDER IS THE FLOOR. Rendered on the server, this is the COMPLETE gallery:
//      every card, every thumbnail, every link, every badge, every description in its native
//      <details>. What JavaScript adds is the filtering, the reflow and the readout — and the
//      filter bar keeps the failure state the list had before it: with no JavaScript the whole
//      shelf simply stands.
//   3. NO style ATTRIBUTE ANYWHERE, JSX included (drift rule 3 walks .tsx since 2026-09-02).
//      The two dynamic values — a card's view-transition name and a thumbnail's entrance delay —
//      go through setVars (dataviz/runtime.ts), the CSSOM path this site's CSP allows.
//   4. REDUCED MOTION: no entrance animation, no view transition, no stagger. The gallery
//      re-flows instantly and the thumbnails are simply there.
//   5. THE READOUT follows the house rules of dataviz/readout.ts — clamped to the gallery's own
//      box, never a hit target. Its text is the experiment's latest reading, composed from the
//      record by the wording's own functions; the same sentence is in each figure's <desc>, so
//      it is reachable without a pointer.
//   6. THE BUDGET is `ExperimentGallery` in scripts/budgets.json. No motion library, no d3: the
//      reflow is a CSS view transition, the entrance a CSS animation.
//   7. NO NEW HUE. The miniatures are inked in the frame's mono by
//      src/styles/experiment-gallery.css; what tells one line from another is shape, not colour.
//
// The filter is the /papers–/atlas idiom the list used, moved inside the island rather than left
// beside it: the count line, the per-section counts, the empty state and the animated reflow are
// one piece of state, and a script outside the island would have to fight React for the same
// `hidden` attributes.
import * as React from 'react'
import { flushSync } from 'react-dom'

import { Badge } from '@/components/ui/badge'
import { buttonVariants } from '@/components/ui/button'
import { createReadout, type ReadoutHandle } from '@/lib/dataviz/readout'
import { reducedMotion, setVars } from '@/lib/dataviz/runtime'
import { cn } from '@/lib/ui/cn'
import type { Facet } from '@/lib/experiments/shelf'
import type { ThumbMark, Thumbnail } from '@/lib/experiments/thumbnails'

/* The frame's recipe, the same cuts the shelf wore as a list (re-skin 2c): a filter chip, a
   quiet link, a stamp. Named once here so the gallery re-dresses nothing by hand. */
const CHIP = cn(
  buttonVariants({ variant: 'outline', size: 'sm' }),
  'h-7 px-2 font-mono text-mono-sm font-normal text-fg-faint aria-pressed:border-fg-faint aria-pressed:bg-panel-2 aria-pressed:text-fg',
)
const QUIET_LINK = cn(
  buttonVariants({ variant: 'ghost', size: 'sm' }),
  'h-7 px-2 font-mono text-mono-sm font-normal text-fg-muted hover:text-fg',
)
const STAMP = 'border-line font-mono text-[10px] font-normal uppercase tracking-[0.18em] text-fg-faint'
const TITLE_LINK =
  'font-semibold text-fg underline decoration-transparent underline-offset-4 transition-colors hover:decoration-current'
/* a card is a panel that leads somewhere: the frame's resting depth, and the lift on hover */
const CARD = 'gal-card lift rounded-md border border-line bg-panel panel-raised'

export interface GalleryCard {
  id: string
  /** the research line's id, or the group the practices beside the lab share */
  group: string
  /** the shelf's own vocabulary for what a card IS */
  kind: string
  /** the badge label for `kind`, or null where the kind is the default one and stays unsaid */
  kindLabel: string | null
  live: boolean
  title: string
  subtitle?: string
  description: string
  href: string
  methodHref?: string | null
  /** the mono stamp on the right of the card — the day the experiment opened */
  stamp?: string
  /** a longer mono note, shown when the card is open */
  meta?: string
  /** the miniature of this card's own instrument, or null where there is no record to draw */
  thumb: Thumbnail | null
}

export interface GallerySection {
  id: string
  label: string
  blurb: string
  cards: GalleryCard[]
}

export interface GalleryWording {
  all: string
  reset: string
  shown: string
  empty: string
  live: string
  opened: string
  open: string
  method: string
  /** "read from " — the provenance line above a readout's reading */
  from: string
}

export interface ExperimentGalleryProps {
  sections: GallerySection[]
  facets: Facet[]
  wording: GalleryWording
  /** the miniature's viewBox, handed in by the frame so the island imports no build-time module */
  box: { width: number; height: number }
  /** id of the dataviz Readout shell the frame renders inside the gallery's own box */
  readoutId: string
}

type Axis = 'group' | 'kind' | 'live'
type Selection = Record<Axis, string>

const ALL: Selection = { group: 'all', kind: 'all', live: 'all' }

/** How long a thumbnail's entrance runs and how far apart two of them start. */
const STAGGER_MS = 60
const STAGGER_MAX = 8

/** One mark of the miniature. Geometry only — every appearance decision is a class. */
function Mark({ mark }: { mark: ThumbMark }): React.ReactElement | null {
  switch (mark.t) {
    case 'bar':
      return <rect className={mark.on ? 'tm-bar tm-on' : 'tm-bar'} x={mark.x} y={mark.y} width={mark.w} height={mark.h} />
    case 'gap':
      return <rect className="tm-gap" x={mark.x} y={mark.y} width={mark.w} height={mark.h} />
    case 'line':
      return <path className={mark.on ? 'tm-line tm-on' : 'tm-line'} d={mark.d} />
    case 'area':
      return <path className="tm-area" d={mark.d} />
    case 'dot':
      return <circle className={mark.on ? 'tm-dot tm-on' : 'tm-dot'} cx={mark.x} cy={mark.y} r={mark.r} />
    case 'seg':
      return <line className={mark.on ? 'tm-seg tm-on' : 'tm-seg'} x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} />
    case 'rule':
      return <line className="tm-rule" x1={mark.x1} y1={mark.y1} x2={mark.x2} y2={mark.y2} />
    default:
      return null
  }
}

export default function ExperimentGallery({
  sections,
  facets,
  wording,
  box,
  readoutId,
}: ExperimentGalleryProps): React.ReactElement {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<ReadoutHandle | null>(null)
  const [selection, setSelection] = React.useState<Selection>(ALL)

  const matches = React.useCallback(
    (card: GalleryCard) =>
      (selection.group === 'all' || card.group === selection.group) &&
      (selection.kind === 'all' || card.kind === selection.kind) &&
      (selection.live === 'all' || (card.live ? 'live' : 'static') === selection.live),
    [selection],
  )

  const total = React.useMemo(() => sections.reduce((n, s) => n + s.cards.length, 0), [sections])
  const shownPerSection = React.useMemo(
    () => sections.map((s) => s.cards.filter(matches).length),
    [sections, matches],
  )
  const shown = shownPerSection.reduce((a, b) => a + b, 0)
  const filtered = selection.group !== 'all' || selection.kind !== 'all' || selection.live !== 'all'

  // ------------------------------------------------------------------ readout
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    const el = document.getElementById(readoutId)
    readoutRef.current = el ? createReadout(el, root) : null
    return () => {
      readoutRef.current?.hide()
      readoutRef.current = null
    }
  }, [readoutId])

  // ------------------------------------------------------------------ the reflow's names
  // A card gets a view-transition name only where motion is welcome: under prefers-reduced-motion
  // the browser would still capture and cross-fade them, which is exactly what was asked against.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root || reducedMotion()) return
    const cards = root.querySelectorAll<HTMLElement>('[data-card]')
    for (const card of cards) {
      const id = card.dataset.card
      if (id) setVars(card, { 'view-transition-name': `xp-${id}` })
    }
  }, [])

  // ------------------------------------------------------------------ the entrance
  // Each miniature grows in once, when it is first scrolled into view, staggered against the
  // ones arriving with it. Once played, never again: a figure that re-animates on every scroll
  // is a distraction, not an entrance. The gallery ARMS itself here rather than in the markup —
  // so with no JavaScript, and under prefers-reduced-motion, every figure is simply there.
  React.useEffect(() => {
    const root = rootRef.current
    if (!root) return
    if (reducedMotion() || typeof IntersectionObserver === 'undefined') return
    const figures = Array.from(root.querySelectorAll<HTMLElement>('[data-thumb]'))
    if (figures.length === 0) return
    root.classList.add('gal-armed')
    const io = new IntersectionObserver(
      (entries) => {
        let nth = 0
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const el = entry.target as HTMLElement
          setVars(el, { '--tm-delay': `${Math.min(nth, STAGGER_MAX) * STAGGER_MS}ms` })
          el.classList.add('is-in')
          io.unobserve(el)
          nth++
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.15 },
    )
    for (const figure of figures) io.observe(figure)
    return () => {
      io.disconnect()
      root.classList.remove('gal-armed')
    }
  }, [])

  // ------------------------------------------------------------------ filtering
  /** The reflow: a view transition where the browser and the visitor both allow one. flushSync
   *  is what makes React's re-render happen INSIDE the transition's capture. */
  const commit = React.useCallback((next: Selection) => {
    // `startViewTransition` is not in every browser; where it is missing, or where the visitor
    // has asked for less motion, the gallery re-flows in one frame and says nothing about it.
    if (reducedMotion() || typeof document.startViewTransition !== 'function') {
      setSelection(next)
      return
    }
    readoutRef.current?.hide()
    document.startViewTransition(() => flushSync(() => setSelection(next)))
  }, [])

  const pick = React.useCallback(
    (axis: Axis, value: string) => commit({ ...selection, [axis]: value }),
    [commit, selection],
  )

  const showReadout = React.useCallback(
    (card: GalleryCard, event: React.PointerEvent<HTMLElement>) => {
      const handle = readoutRef.current
      const root = rootRef.current
      if (!handle || !root || !card.thumb) return
      const rect = root.getBoundingClientRect()
      const node = document.createElement('div')
      const reading = document.createElement('p')
      reading.className = 'gal-readout-reading'
      reading.textContent = card.thumb.readout
      const source = document.createElement('p')
      source.className = 'gal-readout-source'
      source.textContent = `${wording.from}${card.thumb.source}`
      node.append(reading, source)
      handle.show(node, { anchorX: event.clientX - rect.left, anchorY: event.clientY - rect.top })
    },
    [wording.from],
  )

  const hideReadout = React.useCallback(() => readoutRef.current?.hide(), [])

  return (
    <div ref={rootRef} className="gal-root" data-gallery>
      {/* Filter. The same three axes, the same words, the same failure state: with no JavaScript
          the whole shelf stands and the buttons are inert — never an empty screen.
          Sticky from sm upward only: at 390px the three axes wrap to six rows, and a sticky
          block that tall eats a third of the viewport for the whole scroll. */}
      <div className="z-20 -mx-6 space-y-2 border-y border-line bg-bg/90 px-6 py-3 backdrop-blur-xl sm:sticky sm:top-12">
        {facets.map((facet) => (
          <div
            key={facet.group}
            role="group"
            aria-label={facet.title}
            className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
          >
            <span aria-hidden="true" className="kicker w-10 shrink-0">
              {facet.title}
            </span>
            <button
              type="button"
              className={CHIP}
              aria-pressed={selection[facet.group] === 'all'}
              onClick={() => pick(facet.group, 'all')}
            >
              {wording.all}
            </button>
            {facet.options.map((option) => (
              <button
                key={option.value}
                type="button"
                className={CHIP}
                aria-pressed={selection[facet.group] === option.value}
                onClick={() => pick(facet.group, option.value)}
              >
                {option.label} <span className="tabular-nums opacity-60">{option.n}</span>
              </button>
            ))}
          </div>
        ))}

        <div className="flex items-center gap-3 pt-0.5">
          <p className="font-mono text-[11px] text-fg-faint">
            <span className="tabular-nums">{shown}</span> / <span className="tabular-nums">{total}</span>{' '}
            {wording.shown}
          </p>
          <button type="button" className={CHIP} hidden={!filtered} onClick={() => commit(ALL)}>
            {wording.reset}
          </button>
        </div>
      </div>

      {sections.map((section, s) => (
        <section
          key={section.id}
          id={section.id}
          data-group={section.id}
          hidden={shownPerSection[s] === 0}
          className="mt-10 scroll-mt-28"
        >
          <div className="flex items-baseline justify-between gap-4 border-b border-line/60 pb-2">
            <h2 className="kicker text-fg">{section.label}</h2>
            <span className="font-mono text-[11px] tabular-nums tracking-[0.14em] text-fg-faint">
              {shownPerSection[s]}
            </span>
          </div>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">{section.blurb}</p>

          <ul className="gal-grid mt-4">
            {section.cards.map((card) => (
              <li
                key={card.id}
                data-card={card.id}
                hidden={!matches(card)}
                className={CARD}
              >
                {card.thumb && (
                  <div
                    data-thumb
                    className="gal-thumb"
                    onPointerMove={(event) => showReadout(card, event)}
                    onPointerLeave={hideReadout}
                  >
                    <svg
                      className="gal-thumb-svg"
                      viewBox={`0 0 ${box.width} ${box.height}`}
                      role="img"
                      aria-labelledby={`tm-t-${card.id}`}
                    >
                      <title id={`tm-t-${card.id}`}>{`${card.title} — ${card.thumb.draws}`}</title>
                      <desc>{card.thumb.readout}</desc>
                      {card.thumb.marks.map((mark, i) => (
                        <Mark key={i} mark={mark} />
                      ))}
                    </svg>
                  </div>
                )}

                <details className="group">
                  <summary className="gal-summary">
                    <span className="gal-summary-head">
                      {/* The title is a link inside the summary: one click still goes to the work,
                          exactly as on the list this gallery replaces, while a click anywhere else
                          on the card opens the description in place. */}
                      <a className={TITLE_LINK} href={card.href}>
                        {card.title}
                      </a>
                      <svg
                        className="fold-chevron mt-[3px] shrink-0 text-fg-faint"
                        width="10"
                        height="10"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                      >
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </span>
                    {card.subtitle && <span className="gal-sub">{card.subtitle}</span>}
                    <span className="gal-stamps">
                      {card.live && (
                        <Badge variant="outline" className={cn(STAMP, 'whitespace-nowrap')}>
                          <span className="dot-live inline-block h-[5px] w-[5px] rounded-full" aria-hidden="true" />
                          {wording.live}
                        </Badge>
                      )}
                      {card.kindLabel && (
                        <Badge variant="outline" className={STAMP}>
                          {card.kindLabel}
                        </Badge>
                      )}
                      {card.stamp && (
                        <Badge variant="outline" className={cn(STAMP, 'tabular-nums')}>
                          <span className="sr-only">{wording.opened}</span>
                          {card.stamp}
                        </Badge>
                      )}
                    </span>
                  </summary>

                  <div className="gal-body">
                    <p className="max-w-2xl text-sm leading-relaxed text-fg-muted">{card.description}</p>
                    {card.meta && <p className="kicker mt-2">{card.meta}</p>}
                    <p className="mt-3 -ml-2 flex flex-wrap gap-x-1 gap-y-1">
                      <a className={QUIET_LINK} href={card.href}>
                        {wording.open}
                      </a>
                      {card.methodHref && (
                        <a className={QUIET_LINK} href={card.methodHref}>
                          {wording.method}
                        </a>
                      )}
                    </p>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </section>
      ))}

      <p hidden={shown > 0} className="mt-10 font-mono text-xs text-fg-faint">
        {wording.empty}
      </p>
    </div>
  )
}
