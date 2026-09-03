// src/lib/globe/layers/types.ts — the contract every layer of the living globe keeps.
//
// One globe over everything this house measures on the earth means one shape for all of it: a
// layer is a pure adapter over committed files, and nothing else. It answers three questions and
// no others — what days do you hold, what stands on the earth on a given day, and where did each
// mark come from. It draws nothing, it fetches nothing, it owns no visitor-facing sentence, and
// it never reads a clock: `asOf` is the newest RECORD's own date, `days` come from the archive's
// own filenames. Two builds of the same commit must produce the same frames, byte for byte.
//
// Why `labelKind` sits on every record: a country's mark is not a place. It is the centroid of a
// polygon, or the seat of the institution that publishes the number, or the point where a
// transponder fell silent — and a card that renders a bare pair of coordinates for all three
// lies about two of them. The kind travels with the record so the phrase can be honest.
import type { ExperimentLineId } from '@/data/werke'

/** What a layer draws. Aggregation layers do not work on deck.gl's globe view, so anything that
 *  needs binning is binned at BUILD time and drawn as `columns`. */
export type LayerKind = 'points' | 'arcs' | 'tracks' | 'countries' | 'stations' | 'columns'

export type LonLat = [lon: number, lat: number]

/** Where a mark stands: a point, a great-circle pair, or a country the drawing resolves through
 *  the crosswalk and the centroid rule.
 *
 *  A country place carries its NAME as well as its code, and that is a wording repair of G3's second
 *  evening rather than a convenience: the card used to read "centroid of the country QAT", because
 *  the code was the only thing that had crossed into the island. The name is the crosswalk's own, so
 *  the adapter that resolved the code is also the one that says what it resolved to — the island
 *  holds no crosswalk and must never grow one. */
export type LayerPlace = LonLat | { from: LonLat; to: LonLat } | { iso3: string; name: string }

/** What a mark IS, so the card can say it in words instead of printing two numbers.
 *   · point    — the record's own coordinate (a fire, a quake, a vessel's position)
 *   · seat     — the address of the institution that publishes the number
 *   · centroid — the centre of a country's polygon, standing for the whole country
 *   · station  — a physical instrument that took the measurement, at its own site
 *   · gap      — where a record stops or resumes (a transponder off, a page removed) */
export type LabelKind = 'point' | 'seat' | 'centroid' | 'station' | 'gap'

/** Where this mark can be checked: the committed file, the path inside it, the record's own
 *  words, and the source's own link where it has one. Every mark carries one — the globe makes
 *  no claim a reader cannot follow back into the archive. */
export interface LayerReceipt {
  file: string
  locator: string
  words: string
  url?: string
}

export interface LayerRecord {
  /** `${layerId}:${day}:${n}` — stable across builds, so a card can be linked to. */
  key: string
  at: LayerPlace
  value?: number
  labelKind: LabelKind
  receipt: LayerReceipt
}

export interface LayerFrame {
  day: string
  records: LayerRecord[]
  /** Why a frame is empty or partial, in the layer's own composed words — never a hand-typed
   *  number: the sky's past days state the fleet size the densification series holds for that
   *  day. A frame with records carries none. */
  note?: string
}

/** The ONE declared exception to "days come from the data, never from a clock", and the only one
 *  this globe has. A layer may name a single day — its newest — whose marks are not fixed points
 *  but positions at an INSTANT, and hand over what a propagator needs to place them at the
 *  visitor's present. Everything about the exception is declared here rather than assumed by a
 *  drawing: which day it applies to (and no other), the elements themselves, and the words the
 *  layer says about why every OTHER day draws nothing at all.
 *
 *  The elements travel in the source's own form and this contract makes no claim about it — the
 *  propagator that reads them is the house's one copy (src/lib/globe/propagate.ts, satellite.js),
 *  and it is loaded with the drawing half or not at all. `key` matches the record it belongs to,
 *  so a satellite the build could not place has no mark and no element, and the two lists can
 *  never drift apart. */
export interface LayerInstant {
  /** the only day these elements may be drawn on: the day they were taken */
  day: string
  /** one per record of that day's frame, in its order, each carrying the record's own key */
  elements: Array<{ key: string; omm: Record<string, unknown> }>
  /** the layer's own words about the exception, for the method sheet and the provenance line */
  note: string
}

export type LayerOwner = { line: ExperimentLineId } | { voice: 'meridian' | 'atelier' | 'field' | 'studio' }

export interface GlobeLayer {
  id: string
  title: string
  kind: LayerKind
  owner: LayerOwner
  /** the newest record's own date, never a clock */
  asOf: string
  source: { file: string; name: string; url: string; license: string }
  /** ascending, from the data; [] = static */
  days: string[]
  /** pure, memoised by the builder; an unknown day gives an empty frame and never throws */
  frame(day: string): LayerFrame
  static?: LayerFrame
  /** the one declared no-clock exception, where a layer has one; see LayerInstant */
  instant?: LayerInstant
  /** template keys the island fills in — a layer owns no visitor-facing words of its own */
  readout: Record<string, string>
}

export const EMPTY_FRAME = (day: string, note?: string): LayerFrame =>
  note === undefined ? { day, records: [] } : { day, records: [], note }

/** The days an archive holds, from its own filenames: ascending, unique, `latest.json` and every
 *  other non-dated name ignored. The one place the day axis is derived, so no adapter can be
 *  tempted to ask the calendar what today is. */
export function daysFromFiles(names: readonly string[]): string[] {
  const days = names
    .map((name) => /^(\d{4}-\d{2}-\d{2})\.json$/.exec(name)?.[1])
    .filter((d): d is string => Boolean(d))
  return [...new Set(days)].sort()
}
