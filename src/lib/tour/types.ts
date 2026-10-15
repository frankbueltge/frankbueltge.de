// src/lib/tour/types.ts — the data model behind components/dataviz/Tour.astro, the guided-tour
// engine (WP5). A tour is a curated scene sequence derived from committed data: its substance
// (Quote.text) is verbatim from a committed file, checked by verify.ts's honesty harness, not by
// review alone. This module carries only shapes — no rendering, no DOM, no color, no font.

/** One piece of substance, quoted verbatim from a committed file. `source` is a repo-relative
 *  path (e.g. "src/content/protokoll/2026/2026-07-31.json") — the exact string verify.ts's
 *  readFile callback is handed to load the file `text` must appear in as a literal substring. */
export interface Quote {
  text: string
  source: string
  /** human-readable pointer within the source (a line number, a JSON path, a paragraph label) —
   *  shown alongside the source, never itself checked against the file's content */
  locator?: string
}

/** What a scene wants the ONE figure it drives to look like while it is active. Applied by
 *  calling the figure's own `apply(focus)` (see the `dv:figure-ready` contract in engine.ts) —
 *  this module says nothing about HOW a figure interprets these fields; each field is a REQUEST
 *  a figure may honor however its own marks are keyed. */
export interface FocusState {
  /** DOM id of the figure this tour drives — must match the id a figure registers under via
   *  `dv:figure-ready` */
  figure: string
  /** a mark key to lock, e.g. to drive a DetailPanel open on that mark */
  select?: string
  /** legend keys to show; `null` explicitly clears any active filter (distinct from `undefined`,
   *  "this scene doesn't touch the filter") */
  filter?: string[] | null
  /** mark keys to visually de-emphasize without removing them from the figure entirely */
  dim?: string[]
  /** freestanding call-outs a figure may render near the marks they name */
  annotate?: { key: string; text: string }[]
  /** where a figure that has a camera should stand while this scene is active — a longitude and a
   *  latitude in degrees, and optionally how close. A figure without a camera ignores it; a figure
   *  with one is expected to travel there rather than to cut, unless the visitor asked for reduced
   *  motion. (G2, 2026-09-03: the living globe is the first figure with a camera.) */
  camera?: { longitude: number; latitude: number; zoom?: number }
  /** which DAY of the figure's own model to show — a day of the archive, in the archive's own
   *  `YYYY-MM-DD` form, and never a clock: a scene names a day a committed file exists for or it
   *  names none. A figure whose model does not hold that day is expected to IGNORE the request
   *  rather than reach for the nearest one — a story that silently shows a different day than the
   *  one it is talking about is worse than a story whose figure did not move. */
  time?: { day: string }
  /** the layer ids to have ON while this scene is active, in order — the whole active set, not a
   *  delta, so a scene is readable as a state and not as a sequence of toggles. Where a figure has
   *  an emphasis rule, the LAST id is the one in front (the living globe's room draws it in its own
   *  hue and drops the rest to mono ink). A scene may only name layers the figure really registers;
   *  its own test is what proves that, because this module cannot know a figure's registry. */
  layers?: string[]
}

/** One step of the tour: a stable-anchored unit of prose plus the quotes that back it and the
 *  figure focus it drives. */
export interface Scene {
  /** stable anchor slug, e.g. "kill-03" — becomes the DOM id "scene-kill-03" (deep-linkable) and
   *  must be unique within its tour and slug-shaped (verify.ts checks both) */
  id: string
  kicker: string
  heading: string
  /** framing prose only — no numbers, no claims; the quotes below carry the substance */
  lead?: string
  quotes: Quote[]
  focus: FocusState
}

/** A complete guided tour: an ordered scene sequence for one practice, plus the full list of
 *  files it draws on (shown as the tour's own provenance line, checked to exist by verify.ts). */
export interface Tour {
  id: string
  /** whose record the tour walks. The three practices of the ecology, plus `lab` for a work of
   *  this house's own lab (G2, 2026-09-03: the living globe's guided stories are the first — a
   *  work of the lab is not one of the three practices and must not borrow one of their voices). */
  practice: 'atelier' | 'field' | 'studio' | 'lab'
  title: string
  standfirst: string
  scenes: Scene[]
  /** every repo-relative path the tour reads — a superset of the paths named in its quotes (e.g.
   *  it may also include a file a scene draws a still from without quoting it directly) */
  provenance: string[]
}
