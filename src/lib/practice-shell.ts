// Shared structural contracts for the three practice surfaces (Atelier, Field, Studio).
// ADR 0010: the practices share no visual grammar — atelier-sheet.css, field-plate.css and
// studio-stage.css each stay their own, scoped stylesheet. What WAS shared, silently, was
// this TypeScript shape: RailItem and the Frame prop contract were declared identically
// three times (src/config/*-wording.ts, src/components/*/surface/Frame.astro). This file
// declares them once; the wording configs and Frame components import from here instead.
// Structure only — no copy, no colors, no fonts.

/** One entry in a practice's standing rail navigation. */
export interface RailItem {
  label: string
  href: string
  hint: string
}

/** The prop contract every practice's Frame.astro implements identically — kicker, rail,
 * headline, status line, content slot, footer. Markup and CSS stay per-practice; only the
 * shape is shared. */
export interface PracticeFrameProps {
  /** rail label that is "here" ('' = none) */
  active: string
  kicker: string[]
  h1: string
  /** rendered as-is (may carry <b>…</b>) */
  statusHtml?: string
  footLeft?: string
  footRight?: string
  /** show the "← back to …" line above the headline (all rooms except the entry) */
  back?: boolean
}

/** One first-visitor question on a practice entry — rendered by OrientationList.astro as
 * a <dt>/<dd> pair with a door into the room that answers it further. */
export interface OrientationItem {
  question: string
  answer: string
  href: string
  moreLabel: string
}
