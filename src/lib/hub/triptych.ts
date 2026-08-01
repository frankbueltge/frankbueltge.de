// src/lib/hub/triptych.ts — the entrance's triptych: one thumbnail per practice, each drawn in
// that practice's OWN grammar, by that practice's OWN builder.
//
// The rule this module exists to keep: a thumbnail is a FRAGMENT OF THE ROOM'S FIGURE, never a
// second drawing of the same data. So nothing here draws anything. Each function picks the
// fragment (which line, which mark, which days) and hands the choice to the builder the room
// itself uses — src/lib/atelier/passage.ts, src/lib/field/strip.ts, src/lib/studio/season.ts —
// in `still` mode. Two consequences worth stating:
//
//   · a thumbnail can never drift from the room it stands in front of, because there is no
//     second generator to drift;
//   · a thumbnail carries no interaction hooks at all (no tabindex, no keyed marks, no role),
//     because it is a picture on a card, and the card's own link is what a visitor takes hold of.
//
// The fragments are LIVING, not pinned: each one is the newest thing its practice has on the
// record (the line opened most recently, the position lit most recently, the last days of the
// tape). That is the site's currency rule applied to a picture — the entrance shows where each
// practice actually stands today, and a pinned fragment would quietly go stale.
//
// What is deliberately NOT carried over from the tours these cards link to: their focus states.
// A tour scene filters the figure down to the one mark it is talking about, which is right when
// prose stands beside it and wrong on a card — the same filter on a fragment of tape whose days
// carry no instrument would leave a visitor looking at an empty plate. The thumbnails show the
// resting figure, cropped.

import { buildPassageSvg, type PassageModel } from '@/lib/atelier/passage'
import { buildControlSvg, dayRange, type ControlInput } from '@/lib/field/strip'
import { buildSeasonFloorSvg, type SeasonModel } from '@/lib/studio/season'

/** The files the atelier fragment is derived from. The passage sheet is assembled by
 *  src/lib/atelier/passage-data.ts out of these globs; naming them here (rather than in the
 *  component) keeps the card's provenance line beside the derivation it describes — the same
 *  arrangement season.ts uses for the stage floor's own `provenance`. */
export const ATELIER_THUMB_PROVENANCE = [
  'src/content/atelier/projects/*/SCORE.md',
  'src/content/atelier/projects/*/DECISION.md',
  'src/content/atelier/journal/*.md',
] as const

/**
 * The files the field fragment is derived from.
 *
 * Deliberately NOT `gauntletTour.provenance`, which was the obvious thing to reuse and would have
 * been wrong: a tour's provenance is a superset — it also names every file its QUOTES are checked
 * against (two verification exports and the runtime spec), and the plate draws from none of them.
 * A provenance line under a picture has to name what the PICTURE was derived from, or it credits
 * sources the drawing never touched, which is the same failure as omitting one.
 */
export const FIELD_THUMB_PROVENANCE = [
  'src/data/field/chronicle.curated.json',
  'src/data/field/chronicle.upstream.json',
  'src/components/field/werke/*/meta.json',
  'src/data/meridian/parallax.json',
] as const

/** The window the studio fragment crops to, in the season floor's own units. Chosen so the
 *  house's Didone titles still letter at a readable size inside a card, and tall enough that the
 *  lamp bar, the curtain line and the pool all stay in frame — a stage cropped below its curtain
 *  stops reading as a stage. */
export const STUDIO_THUMB_CROP = { width: 520, height: 360 } as const

/** How many MARKED days of the field's tape a fragment keeps. Two, because the plate's own
 *  `fitToMarks` box is as tall as the whole instrument strip whatever its span: every day added to
 *  the window widens the box without making it shorter, and past two the millimetre paper's own
 *  lettering shrinks below the size it was drawn to be read at. Two still shows the tape as a
 *  RECORD THAT RUNS — marks on their day ticks, the resting pen, clear tape past the last mark —
 *  which a single day stacked on one tick does not. */
export const FIELD_THUMB_DAYS = 2

/**
 * The line the atelier opened most recently — the fragment the passage sheet is cropped to.
 *
 * `model.lines` is ordered by the day each line was opened (src/lib/atelier/process.ts sorts it
 * that way), so the newest is simply the last. Fails loud on an empty sheet rather than falling
 * back to a placeholder: an atelier with no lines is a broken derivation, not a thumbnail.
 */
export function latestLine(model: PassageModel): string {
  const last = model.lines.at(-1)
  if (!last) throw new Error('latestLine: the passage model carries no lines to crop to')
  return last.key
}

/**
 * The position the studio lit most recently — a premiere, or a premiere that was later withdrawn
 * (the light is struck, the position stays on the floor). Strikes and returns are deliberately
 * not eligible: they are marks ABOUT a position, and a fragment centred on one would show the
 * house's bookkeeping where the card promises its stage.
 *
 * Ordered by date, then by key, so the choice is total and stable across builds.
 */
export function latestLitMark(model: SeasonModel): string {
  const lit = model.marks.filter((m) => m.state === 'premiered' || m.state === 'withdrawn')
  if (lit.length === 0) throw new Error('latestLitMark: the season carries no lit position to crop to')
  return [...lit].sort((a, b) => a.date.localeCompare(b.date) || a.key.localeCompare(b.key)).at(-1)!.key
}

/**
 * The last `n` MARKED days of a plate, as a plate of its own — the field's tape, cut to a
 * fragment and honest about it.
 *
 * Marked days, not wall-clock days: a window of the three most recent calendar days can easily
 * be a window of blank tape, which says nothing about the record. Two details keep the fragment
 * the field's own drawing rather than a crop that happens to look like one:
 *
 *   · the resting pen keeps its day of clear tape past the last mark where the full plate has
 *     one ("the pen has not lifted — the tape runs on"), and gets none invented where it does not;
 *   · a standing obligation whose anchor date falls outside the window is DROPPED, never
 *     re-anchored — the obligation line runs from the day it was issued, and a fragment that
 *     redrew it from its own first day would state a date the record does not carry.
 */
export function lastMarkedDays(plate: ControlInput, n: number): ControlInput {
  if (!Number.isInteger(n) || n < 1) {
    throw new Error(`lastMarkedDays: a fragment of the tape needs at least one day (got ${n})`)
  }
  const marked = [...new Set(plate.marks.map((m) => m.date))].sort()
  if (marked.length === 0) throw new Error('lastMarkedDays: the plate carries no marks to cut a fragment from')
  const kept = marked.slice(-n)
  const first = kept[0]
  const lastMarked = kept[kept.length - 1]
  const after = plate.days[plate.days.indexOf(lastMarked) + 1]
  const end = after ?? lastMarked
  const within = (d: string) => d >= first && d <= end
  return {
    ...plate,
    days: dayRange(first, end),
    marks: plate.marks.filter((m) => within(m.date)),
    obligation: plate.obligation && within(plate.obligation.fromDate) ? plate.obligation : undefined,
  }
}

/** The atelier's fragment: the sheet, cropped to the band of its newest line. No gate label, no
 *  gutter heading — a card has no room for a legend, and the sheet's own marks carry it. */
export function passageThumbSvg(model: PassageModel, opts: { label: string; gapLine: string }): string {
  return buildPassageSvg(model, {
    cropTo: latestLine(model),
    still: true,
    label: opts.label,
    gapLine: opts.gapLine,
  })
}

/** The field's fragment: the last marked days of the plate, fitted to its own marks. */
export function plateThumbSvg(
  plate: ControlInput,
  opts: { label: string; svgId: string; days?: number },
): string {
  return buildControlSvg({
    ...lastMarkedDays(plate, opts.days ?? FIELD_THUMB_DAYS),
    still: true,
    svgId: opts.svgId,
    label: opts.label,
  })
}

/** The studio's fragment: the stage floor, cropped to the position lit most recently. */
export function seasonThumbSvg(model: SeasonModel, opts: { label: string }): string {
  return buildSeasonFloorSvg(model, {
    cropTo: latestLitMark(model),
    cropBox: STUDIO_THUMB_CROP,
    still: true,
    label: opts.label,
  })
}

/** The line under every card, in the same words for all three: what the picture was derived from,
 *  named to the file. Kept here so the three cards cannot phrase their provenance differently. */
export function provenanceLine(prefix: string, paths: readonly string[]): string {
  if (paths.length === 0) throw new Error('provenanceLine: a fragment with no named source is not shippable')
  return `${prefix} ${paths.join(' · ')}`
}
