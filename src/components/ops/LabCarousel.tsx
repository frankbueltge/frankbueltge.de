// src/components/ops/LabCarousel.tsx — the lab's experiments, the band the entrance opens with
// (2026-11-02; Frank's decision of that day, wording private: the homepage leads with the lab's
// experiments).
//
// THE SERVER RENDER IS THE FLOOR. What Astro renders before any script runs is the whole band: every
// experiment as a card in one row that the browser itself scrolls and snaps (a finger, a trackpad,
// the scrollbar, or the Tab key, which brings each card's link into view), each card with its link,
// its still or miniature, its line of research, its sentence and its day, and under the row a link
// to /experiments. What this island adds is only what needs a script: the two buttons and the count
// between them, the arrow keys, and a polite sentence for a screen reader saying where a button or
// a key has moved the row. Until it has run, the controls take their place but stay invisible, so a
// reader without JavaScript meets no dead button and the page does not jump when they appear.
//
// The house's duties for an island (.claude/rules/dataviz-figures.md), applied:
//   · nothing is computed here: the order and every card's words and picture arrive from
//     src/lib/ops/lab-carousel.ts at build time, and where the row stands is arithmetic in
//     src/lib/ops/carousel.ts, tested; every sentence written here is a template from
//     EDITION.lab (src/config/edition-wording.ts);
//   · no style attribute anywhere: the row moves by scrolling, never by a transform;
//   · reduced motion: a button moves the row in one step instead of gliding, and nothing moves by
//     itself — there is no autoplay, ever;
//   · no colour of its own: the frame's tokens, which the paper ground re-points
//     (src/styles/paper.css), through shadcn's button and src/styles/edition.css.
import * as React from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'

import { ThumbMarkShape } from '@/components/experiments/ThumbMarkShape'
import { Button } from '@/components/ui/button'
import { reducedMotion } from '@/lib/dataviz/runtime'
import type { ThumbMark } from '@/lib/experiments/thumbnails'
import { currentSlide, stepSlide } from '@/lib/ops/carousel'
import { fill } from '@/lib/ops/since'
import { cn } from '@/lib/ui/cn'

export interface LabSlide {
  /** the card's stable key */
  id: string
  title: string
  /** the research line's label, as /experiments heads the work's group; null where it has none */
  line: string | null
  /** what the work is, in the register's own line */
  sentence: string
  /** what kind of work, and since when, in words: "experiment · read every day since 1 November 2026" */
  meta: string
  /** the kind word alone, for the card's last line */
  kind: string
  href: string
  /** a shot of the work's own page, cut to the frame, in the light theme's two tones and, where
   *  the dark one's file is committed, in the dark theme's */
  still: { src: string; alt: string; dark: string | null } | null
  /** where the page has no still yet: the miniature /experiments draws from the work's own record */
  mini: { marks: ThumbMark[]; draws: string; readout: string } | null
  /** where there is neither: the line the plate says */
  plate: string
}

export interface LabWording {
  title: string
  sub: string
  all: { label: string; href: string }
  slide: string
  /** '{n} of {total}' */
  position: string
  /** '{n} / {total}' */
  count: string
  prev: string
  next: string
  /** '{title}, {n} of {total}' */
  announce: string
  /** 'open the {kind} →' */
  open: string
  mini: string
  /** what a screen reader calls the lead card above the carousel */
  leadLabel: string
}

export interface LabCarouselProps {
  /** the band's lead (since 2026-11-03: Ducking), shown large above the carousel, outside its count */
  lead?: LabSlide[]
  slides: LabSlide[]
  wording: LabWording
  /** the id of the band's heading, which the section around the island is labelled by */
  headingId: string
  /** the id of the row, which the buttons name as what they control */
  trackId: string
  /** the miniature's viewBox (src/lib/experiments/thumbnails.ts, THUMB_BOX) */
  box: { width: number; height: number }
  /** a still's own size (src/lib/ops/shelf-stills.ts, STILL_FRAME) */
  frame: { width: number; height: number }
}

/** A card's picture: the still in the two tones of the page's two themes, else the miniature, else
 *  the plate. Both tones are in the HTML; the stylesheet shows the one of the theme the page renders
 *  in (src/styles/edition.css, .ed-duo), and a lazy picture the theme hides is never fetched. */
function Picture({
  slide,
  wording,
  box,
  frame,
  eager,
}: {
  slide: LabSlide
  wording: LabWording
  box: LabCarouselProps['box']
  frame: LabCarouselProps['frame']
  eager: boolean
}): React.ReactElement {
  if (slide.still) {
    return (
      <>
        <img
          className="ed-duo ed-duo--light"
          src={slide.still.src}
          alt={slide.still.alt}
          width={frame.width}
          height={frame.height}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
        />
        {slide.still.dark && (
          <img
            className="ed-duo ed-duo--dark"
            src={slide.still.dark}
            alt={slide.still.alt}
            width={frame.width}
            height={frame.height}
            loading="lazy"
            decoding="async"
          />
        )}
      </>
    )
  }
  if (slide.mini) {
    return (
      <span className="ed-lab-plate">
        <span className="ed-lab-plate-kind">{wording.mini}</span>
        <svg className="ed-lab-mini" viewBox={`0 0 ${box.width} ${box.height}`} role="img" aria-label={`${slide.title}: ${slide.mini.draws}`}>
          {slide.mini.marks.map((mark, k) => (
            <ThumbMarkShape key={k} mark={mark} />
          ))}
        </svg>
        <span className="ed-lab-plate-reading">{slide.mini.readout}</span>
      </span>
    )
  }
  return (
    <span className="ed-lab-plate" aria-hidden="true">
      <span className="ed-lab-plate-kind">{slide.kind}</span>
      <span className="ed-lab-plate-reading">{slide.plate}</span>
    </span>
  )
}

/** A card's words: line, title (the card's one link), sentence, meta, and where it leads. */
function Words({ slide, wording }: { slide: LabSlide; wording: LabWording }): React.ReactElement {
  return (
    <div className="ed-lab-text">
      {slide.line && <p className="ed-lab-kicker">{slide.line}</p>}
      <h3 className="ed-lab-title">
        {/* one link per card, named by the work's title; its ::after spreads it over the
            whole card, so the picture and the words open the work too */}
        <a className="ed-lab-link" href={slide.href}>
          {slide.title}
        </a>
      </h3>
      <p className="ed-lab-sentence">{slide.sentence}</p>
      <p className="ed-lab-meta">{slide.meta}</p>
      <p className="ed-lab-open" aria-hidden="true">
        {fill(wording.open, { kind: slide.kind })}
      </p>
    </div>
  )
}

export default function LabCarousel({ lead = [], slides, wording, headingId, trackId, box, frame }: LabCarouselProps): React.ReactElement {
  const trackRef = React.useRef<HTMLDivElement>(null)
  const [ready, setReady] = React.useState(false)
  const [current, setCurrent] = React.useState(0)
  const [said, setSaid] = React.useState('')
  const total = slides.length

  /** The row as the browser has laid it out now: its slides, their snap offsets from the first
   *  one's, and how far the row can scroll. */
  const measure = React.useCallback(() => {
    const track = trackRef.current
    if (!track) return null
    const cards = Array.from(track.children) as HTMLElement[]
    const origin = cards[0]?.offsetLeft ?? 0
    return { track, cards, positions: cards.map((card) => card.offsetLeft - origin), max: track.scrollWidth - track.clientWidth }
  }, [])

  // Where the row stands follows the row, however it was moved: a button, a key, a finger, a
  // trackpad, the Tab key bringing a link into view.
  React.useEffect(() => {
    const track = trackRef.current
    if (!track) return
    let frameId = 0
    const update = () => {
      cancelAnimationFrame(frameId)
      frameId = requestAnimationFrame(() => {
        const row = measure()
        if (row) setCurrent(currentSlide(row.positions, row.track.scrollLeft, row.max))
      })
    }
    track.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    update()
    setReady(true)
    return () => {
      cancelAnimationFrame(frameId)
      track.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [measure])

  /** Moves the row to a slide, says where it went, and, for a key pressed on a card's link, takes
   *  the focus along so the reader stays where they are looking. */
  const go = React.useCallback(
    (to: number, carryFocus = false) => {
      const row = measure()
      if (!row || total === 0) return
      const i = stepSlide(to, 0, total)
      if (carryFocus) row.cards[i]?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true })
      row.track.scrollTo({ left: row.positions[i], behavior: reducedMotion() ? 'auto' : 'smooth' })
      setCurrent(i)
      setSaid(fill(wording.announce, { title: slides[i].title, n: i + 1, total }))
    },
    [measure, slides, total, wording.announce],
  )

  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return
      // from the card the key was pressed on, where it was pressed on one
      const own = (event.target as HTMLElement).closest<HTMLElement>('[data-slide]')
      const from = own ? Number(own.dataset.slide) : current
      event.preventDefault()
      go(stepSlide(from, event.key === 'ArrowRight' ? 1 : -1, total), own !== null)
    },
    [current, go, total],
  )

  return (
    <div className="ed-lab" data-ready={ready ? '' : undefined}>
      <div className="ed-lab-head">
        <h2 id={headingId}>{wording.title}</h2>
        {wording.sub && <span className="ed-lab-sub">{wording.sub}</span>}
        <div className="ed-lab-controls">
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ed-lab-button"
            aria-controls={trackId}
            aria-label={wording.prev}
            disabled={!ready || current === 0}
            onClick={() => go(current - 1)}
          >
            <ArrowLeft aria-hidden="true" />
          </Button>
          <span className="ed-lab-count" aria-hidden="true">
            {fill(wording.count, { n: current + 1, total })}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="ed-lab-button"
            aria-controls={trackId}
            aria-label={wording.next}
            disabled={!ready || current >= total - 1}
            onClick={() => go(current + 1)}
          >
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      </div>

      {lead.map((slide) => (
        <div key={slide.id} className="ed-lab-lead" role="group" aria-label={wording.leadLabel}>
          <div className={cn('ed-lab-frame', 'ed-lab-frame--lead', !slide.still && 'ed-lab-frame--plate')}>
            <Picture slide={slide} wording={wording} box={box} frame={frame} eager />
          </div>
          <Words slide={slide} wording={wording} />
        </div>
      ))}

      <div id={trackId} ref={trackRef} className="ed-lab-track" onKeyDown={onKeyDown}>
        {slides.map((slide, i) => (
          <div
            key={slide.id}
            className="ed-lab-slide"
            role="group"
            aria-roledescription={wording.slide}
            aria-label={fill(wording.position, { n: i + 1, total })}
            data-slide={i}
          >
            <div className={cn('ed-lab-frame', !slide.still && 'ed-lab-frame--plate')}>
              <Picture slide={slide} wording={wording} box={box} frame={frame} eager={false} />
            </div>
            <Words slide={slide} wording={wording} />
          </div>
        ))}
      </div>

      <p className="ed-lab-foot">
        <a className="ed-link" href={wording.all.href}>
          {wording.all.label}
        </a>
      </p>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {said}
      </p>
    </div>
  )
}
