// src/lib/tour/engine.ts — the pure client logic behind components/dataviz/Tour.astro: which
// scene an IntersectionObserver callback says is active, clamped index stepping for the
// step-buttons mode, the reduced-motion/coarse-pointer mode decision, and the figure-ready
// registry a tour's live figure opts into. All of it is plain data in, plain data/calls out —
// testable without a DOM, the same shape as src/lib/dataviz/stepper.ts's split between pure
// position math and DOM glue. Behavior only — no color, no font.

import type { FocusState } from './types'

// ---------------------------------------------------------------- scene selection (scroll mode)

/** The bit of a real IntersectionObserverEntry this module actually needs, already normalized by
 *  Tour.astro's own callback (e.target.id, e.isIntersecting, e.boundingClientRect.top) — kept
 *  this narrow so a test can fake one without constructing a real IntersectionObserverEntry. */
export interface SceneIntersection {
  /** the scene id (not the DOM id "scene-<id>" — Tour.astro's callback strips that prefix) */
  id: string
  isIntersecting: boolean
  top: number
}

/**
 * From one IntersectionObserver callback's entries (observed with rootMargin
 * '-45% 0px -45% 0px', threshold 0 — see Tour.astro), decides which scene is now active: the
 * entry currently intersecting that mid-viewport band. When more than one intersects at once (a
 * scene shorter than the band, or two scenes' edges overlapping mid-transition), the one nearest
 * the center line (smallest `abs(top)`, since the band itself is centered) wins. Returns `null`
 * when none intersect — the ordinary case is the browser simply not invoking the callback at all
 * when nothing changed; this handles the rarer case of a callback that DOES fire with nothing
 * currently intersecting (e.g. a fast native scroll skipping past several scenes between frames),
 * where the caller should just keep whichever scene was already active rather than clearing it.
 */
export function sceneFromEntries(entries: SceneIntersection[]): string | null {
  const hits = entries.filter((e) => e.isIntersecting)
  if (hits.length === 0) return null
  if (hits.length === 1) return hits[0].id
  return hits.reduce((a, b) => (Math.abs(a.top) <= Math.abs(b.top) ? a : b)).id
}

// ---------------------------------------------------------------- index stepping (steps mode + keyboard)

/**
 * Clamped index stepping over a flat 0..count-1 range of scenes — used by the step-buttons mode
 * (prev/next clicks, jump-list) and by the tour root's own ←/→ keyboard binding alike, so both
 * paths share one "stepping past either edge is a no-op" rule rather than two parallel
 * implementations drifting apart.
 */
export function nextScene(current: number, delta: number, count: number): number {
  if (count <= 0) return current
  const next = current + delta
  if (next < 0 || next >= count) return current
  return next
}

// ---------------------------------------------------------------- interaction-mode decision

export const SHORT_VIEWPORT_PX = 600

export interface InteractionModeInput {
  reduced: boolean
  coarse: boolean
  viewportH: number
}

export type InteractionMode = 'scroll' | 'steps'

/**
 * Whether a tour drives via IntersectionObserver-based scroll activation ('scroll') or exposes
 * explicit prev/next/jump controls instead ('steps') — the accessibility floor this WP's spec
 * requires: reduced motion always wins outright (a visitor who asked "don't animate this for me"
 * gets buttons, full stop, never an IO); short of that, a coarse pointer (touch) on a short
 * viewport (e.g. a phone in portrait, where a sticky figure has no room to live alongside
 * scrolling prose) also falls back to steps. `SHORT_VIEWPORT_PX` is a deliberately generous
 * threshold — it only needs to catch cramped viewports, not draw a precise device boundary.
 */
export function interactionMode({ reduced, coarse, viewportH }: InteractionModeInput): InteractionMode {
  if (reduced) return 'steps'
  if (coarse && viewportH < SHORT_VIEWPORT_PX) return 'steps'
  return 'scroll'
}

// ---------------------------------------------------------------- figure-ready registry
//
// A figure opts in by dispatching `window.dispatchEvent(new CustomEvent('dv:figure-ready', {
// detail: { id, apply } }))` sometime after its own script runs — independently of the Tour's own
// script; the two components share ONLY this event contract, never an import of one another.
// Two dispatch orders are both valid: the figure can finish registering before the Tour looks for
// it (its own script ran first, e.g. it sits earlier in the document) or after (the Tour's script
// ran first). This registry is what makes both orders safe:
//
//   - a module-level map (one per page load, mirroring stepper.ts's panel registry below it in
//     spirit) that ANY 'dv:figure-ready' dispatch populates, via the single listener
//     ensureFigureReadyListener installs (idempotent — one listener total, no matter how many
//     Tour instances or figures exist on the page);
//   - getFigure(), which Tour.astro's own scene-activation code consults AT ACTIVATION TIME, not
//     just once at its own init — so a figure that finishes registering only later still gets
//     every subsequent scene's focus applied once it exists.
//
// The remaining gap those two alone don't close: the scene that was ALREADY active at the moment
// a late figure registers never had its focus (re-)applied to that figure specifically (only
// scenes activated AFTER the registration go through getFigure() again). Tour.astro's own script
// closes that gap itself — it checks getFigure() once at init (covers "figure registered first")
// and additionally listens for 'dv:figure-ready' directly to push its CURRENTLY active scene's
// focus the moment a matching figure shows up late (covers "figure registers after init, before
// or between scene activations") — see that component's script for the two-line fix.

export interface FigureHandle {
  id: string
  apply(focus: FocusState): void
}

let figures = new Map<string, FigureHandle>()

/** Records a figure as ready. Called by ensureFigureReadyListener's own event handler; exported
 *  directly too so tests (and any caller that already has a real event, not just window's) don't
 *  need a DOM to exercise the registry itself. */
export function registerFigure(handle: FigureHandle): void {
  figures.set(handle.id, handle)
}

/** Looks up a registered figure by id — `undefined` if it hasn't dispatched 'dv:figure-ready'
 *  yet. */
export function getFigure(id: string): FigureHandle | undefined {
  return figures.get(id)
}

/** Only for tests: clears the module-level registry between cases. */
export function resetFigureRegistry(): void {
  figures = new Map()
}

let figureListenerBound: EventTarget | null = null

/**
 * Wires a single 'dv:figure-ready' listener to `target` (defaults to `window`) that records every
 * dispatched figure into the shared registry above — installed at most once regardless of how
 * many Tour instances call it (same idempotent shape as stepper.ts's ensurePanelKeydownListener).
 */
export function ensureFigureReadyListener(target: EventTarget = window): void {
  if (figureListenerBound === target) return
  figureListenerBound = target
  target.addEventListener('dv:figure-ready', ((ev: CustomEvent<FigureHandle>) => {
    registerFigure(ev.detail)
  }) as EventListener)
}

/** Only for tests: forgets which target was bound, so a fresh call re-binds. */
export function resetFigureReadyBinding(): void {
  figureListenerBound = null
}
