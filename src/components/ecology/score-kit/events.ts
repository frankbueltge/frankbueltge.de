// src/components/ecology/score-kit/events.ts — the outbound events a score emits (visual layer,
// Phase 3d, 2026-09-02).
//
// `dv:mark-selected` is the switchboard: whoever is listening — a dossier wrapping the figure, a
// tour — learns which mark was opened. Outbound only: the figure gains no knowledge of what, if
// anything, is listening. Two habits coexist in this house and both are kept: the partitur of
// Phase 1 dispatches on `window` without bubbling (its detail names the figure); the Studio's
// floor dispatches from its own root, bubbling, so an ancestor such as the dossier can catch it
// (its detail carries the mark `key`). A caller says which by choosing the target.
export interface MarkSelectedDetail {
  figure: string
  /** the mark's own key — the field a bubbling listener (studio/Dossier.astro) reads */
  key: string
  [field: string]: unknown
}

export function emitMarkSelected(target: EventTarget, detail: MarkSelectedDetail, bubbles = false): void {
  target.dispatchEvent(new CustomEvent('dv:mark-selected', { detail, bubbles }))
}
