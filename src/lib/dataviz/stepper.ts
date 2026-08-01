// src/lib/dataviz/stepper.ts — the pure position/stepping logic and the keyboard-arbitration
// registry behind components/dataviz/DetailPanel.astro, the shared click-to-lock detail panel.
// Behavior only (ADR 0010) — no color, no font.
//
// Extracted from maschinenraum/Partitur.astro's flat/seg construction and its renderPanel/step/
// activate functions (~1063-1139 in that file, NOT modified here — the port to use this module
// is later work). Partitur.astro is not imported: this is a generalization of its shape (a flat,
// ordered list partitioned into named segments — there, one segment per voice), not a copy of
// its domain types.

// ---------------------------------------------------------------- buildSegments / step / positionLabel

export interface Segmented<T> {
  items: T[]
  /** key → the [start, end) index range (end exclusive) of that key's run within `items` */
  segments: Record<string, { start: number; end: number }>
}

/**
 * Partitions `items` (already given in a stable, "grouped" order — e.g. Partitur.astro's flat
 * array, built voice-by-voice) into named segments by `keyOf`. Assumes each key's items form ONE
 * contiguous run; if a key resurfaces after a different key's run, ITS SEGMENT IS OVERWRITTEN,
 * keeping only the later run — a caller error (unsorted input), not a supported "merge" (see the
 * stepper.test.ts case documenting this explicitly, so a regression here is caught, not silently
 * accepted as a new feature).
 */
export function buildSegments<T>(items: T[], keyOf: (item: T) => string): Segmented<T> {
  const segments: Record<string, { start: number; end: number }> = {}
  let i = 0
  while (i < items.length) {
    const key = keyOf(items[i])
    const start = i
    while (i < items.length && keyOf(items[i]) === key) i++
    segments[key] = { start, end: i }
  }
  return { items, segments }
}

function segmentAt<T>(s: Segmented<T>, pos: number): { start: number; end: number } | null {
  for (const seg of Object.values(s.segments)) {
    if (pos >= seg.start && pos < seg.end) return seg
  }
  return null
}

/**
 * Steps `pos` by `delta`, clamped within its own segment — stepping past either edge is a no-op
 * (stays at `pos`), the same "prev disabled at the start, next disabled at the end" contract
 * Partitur.astro's step() already carries (there expressed as disabling the prev/next buttons at
 * the segment boundary rather than wrapping or crossing into a neighboring voice).
 */
export function step<T>(s: Segmented<T>, pos: number, delta: number): number {
  const seg = segmentAt(s, pos)
  if (!seg) return pos
  const next = pos + delta
  if (next < seg.start || next >= seg.end) return pos
  return next
}

/**
 * "X/Y in {key}" for `pos`'s position within its segment — e.g. "14/27 in field", mirroring
 * Partitur.astro's `${pos - s.start + 1}/${s.end - s.start} in ${entry.voice}`. When `within` is
 * given, it is prefixed as a finer-grained fragment the caller already formatted (e.g. a nested
 * `positionLabel` call over a narrower Segmented<T>, or a hand-written "2/3 this day"), joined
 * with " · " — composing to Partitur.astro's exact two-level readout,
 * "2/3 this day · 14/27 in field", without this module needing to know what "this day" means.
 */
export function positionLabel<T>(s: Segmented<T>, pos: number, within?: string): string {
  const entry = Object.entries(s.segments).find(([, seg]) => pos >= seg.start && pos < seg.end)
  if (!entry) return within ?? ''
  const [key, seg] = entry
  const outer = `${pos - seg.start + 1}/${seg.end - seg.start} in ${key}`
  return within ? `${within} · ${outer}` : outer
}

// ---------------------------------------------------------------- panel keydown registry
//
// The critical fix: maschinenraum/Partitur.astro binds its Escape/ArrowLeft/ArrowRight listener
// PER INSTANCE (`document.addEventListener('keydown', ...)` inside that component's own inline
// script). Harmless with exactly one panel on a page (today's only case); wrong in general —
// two DetailPanel instances on one page would BOTH react to every keypress, stepping (or
// closing) whichever one last opened right along with the one the user is actually looking at.
//
// Here, at most one panel is ever "active" for keyboard arbitration; registering a new active
// panel simply supersedes whichever was active before, and only the active panel's handlers
// ever run — the arbitration itself (activatePanel/deactivatePanel/dispatchPanelKey) is plain
// state, fully unit-testable without a DOM. `ensurePanelKeydownListener` is the thin, one-time
// wiring of that arbitration to the real `document` keydown event, shared by every DetailPanel
// instance on the page (ONE listener total, not one per instance).

export interface PanelKeyHandlers {
  onPrev(): void
  onNext(): void
  onClose(): void
}

let activePanel: PanelKeyHandlers | null = null

/** Marks a panel as the one that responds to keyboard navigation — call when it opens. */
export function activatePanel(handlers: PanelKeyHandlers): void {
  activePanel = handlers
}

/** Clears the active panel — call when it closes. A no-op if some OTHER panel is currently
 *  active (this one was already superseded, so it must not clear a panel that isn't its own). */
export function deactivatePanel(handlers: PanelKeyHandlers): void {
  if (activePanel === handlers) activePanel = null
}

/** Whether ANY DetailPanel currently owns keyboard arbitration — consulted by other
 *  dataviz-adjacent keyboard handlers that must yield to an open panel rather than double-
 *  handling the same keypress (e.g. components/dataviz/Tour.astro's own ←/→ binding: a tour and
 *  an open DetailPanel both wanting the arrow keys is exactly the "several instances" hazard this
 *  module's own registry above was built to prevent between panels, generalized to one more
 *  caller rather than solved again with a second, parallel keydown listener). */
export function isPanelActive(): boolean {
  return activePanel !== null
}

/** Only for tests: resets the module-level registry between cases. */
export function resetPanelRegistry(): void {
  activePanel = null
}

/** Routes one keydown to the currently active panel, if any — Escape closes; ArrowLeft/
 *  ArrowRight step (preventing the page's own scroll). Exported as a plain function (rather than
 *  wired only internally) so the arbitration is unit-testable with a bare fake event object. */
export function dispatchPanelKey(ev: { key: string; preventDefault(): void }): void {
  if (!activePanel) return
  if (ev.key === 'Escape') {
    activePanel.onClose()
    return
  }
  if (ev.key === 'ArrowLeft') {
    ev.preventDefault()
    activePanel.onPrev()
  } else if (ev.key === 'ArrowRight') {
    ev.preventDefault()
    activePanel.onNext()
  }
}

let boundTarget: EventTarget | null = null

/**
 * Wires dispatchPanelKey to a real keydown event exactly once — no matter how many DetailPanel
 * instances call it, ONE listener total (the bug this replaces: N instances, N listeners, all
 * firing on every keypress). Defaults to the global `document`; a test may pass any fake
 * `EventTarget`-shaped object instead.
 */
export function ensurePanelKeydownListener(target: EventTarget = document): void {
  if (boundTarget === target) return
  boundTarget = target
  target.addEventListener('keydown', dispatchPanelKey as unknown as EventListener)
}

/** Only for tests: forgets which target was bound, so a fresh call re-binds. */
export function resetPanelKeydownBinding(): void {
  boundTarget = null
}
