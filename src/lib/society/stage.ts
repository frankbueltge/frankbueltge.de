// src/lib/society/stage.ts — the room's stage and its camera.
//
// The room's first staging drew two pictures in two boxes with a rule between them: the
// society in one, the block world in the other. That reads as a diagram — two panels of a
// figure — and it wasted most of a projection screen, because a fixed 960×540 viewBox
// letterboxed inside a wide frame leaves black down both sides.
//
// So there is now ONE picture. The society and the world share a single coordinate space
// (STAGE), stacked the way the anatomy already claims they are: drives at the top because
// they rule, senses at the bottom because they face the world, and the world directly
// underneath them. Nothing is drawn between the two — the gap IS the relationship.
//
// On top of that space sits a camera. It never distorts and it never letterboxes: a framing
// here is a REGION OF INTEREST, and `fitToViewport` grows it to whatever shape the screen
// happens to be before it becomes a viewBox. That is what makes portrait work — a vertical
// screen grows the framing vertically, and a composition stacked vertically is exactly what
// wants to be revealed. Landscape and portrait are the same stage, differently cropped.
//
// Kept out of Room.astro and made data so stage.test.ts can hold it to the two rules that
// actually matter in a room: nothing the piece needs may fall outside its own framing, and
// every beat of the score must know where the camera looks during it.

import { SCORE } from './score'

/** The one space. Both pictures are placed into it; the camera only ever reads from it. */
export const STAGE = { w: 1600, h: 1000 } as const

export interface Rect {
  x: number
  y: number
  w: number
  h: number
}

/** A placement of a sub-picture into the stage: stage = origin + local × k. */
export interface Placement {
  tx: number
  ty: number
  k: number
}

/**
 * The society's 960×540 map space (layout.ts), placed across the upper half. The occupied
 * part of that map is x 91…841, y 43…479 — WORTH out on the left, the watchers out on the
 * right, the senses row at the bottom — so this lands the constellation at stage
 * x 343…1258, y 41…555, centred on x 800.
 */
export const SOCIETY: Placement = { tx: 231.5, ty: -12, k: 1.22 }

/**
 * The block world's 400×200 space, placed underneath and centred on the same axis, so the
 * table sits squarely below the senses that watch it. The table line (world y 182) lands at
 * stage y 850, leaving floor under it for the camera to push into and for the intertitle to
 * sit on. The scale is what it is because of the HAND: it is drawn well above the blocks it
 * carries, and at any larger size it reaches up into the senses row — the world climbing
 * into the mind, which reads as a drawing error rather than as a relationship.
 */
export const WORLD: Placement = { tx: 360, ty: 449.6, k: 2.2 }

export function place(p: Placement, x: number, y: number): { x: number; y: number } {
  return { x: p.tx + x * p.k, y: p.ty + y * p.k }
}

/** The SVG transform string for a placement — the one place this is spelled out. */
export function transformFor(p: Placement): string {
  return `translate(${p.tx} ${p.ty}) scale(${p.k})`
}

// ————————————————————————————————— the camera ————————————————————————————

/**
 * Where the camera can look. These are regions of interest, never final viewBoxes: the
 * runtime grows each one to the screen's shape, so a framing may show MORE than it asks
 * for but never less.
 */
export type FrameName = 'wide' | 'mind' | 'ground' | 'site'

export const FRAMINGS: Record<Exclude<FrameName, 'site'>, Rect> = {
  /** the whole thing: a mind and the world it has its hands in */
  wide: { x: 250, y: 15, w: 1100, h: 960 },
  /**
   * the constellation alone — for the beats that are about the parts. It reaches below the
   * senses row on purpose: with the senses hard against the bottom edge the intertitle
   * lands on top of them, and the lowest band of a mind is not a good place to put words.
   */
  mind: { x: 290, y: 20, w: 1020, h: 660 },
  /** the senses row and the table under it: where the work actually happens */
  ground: { x: 300, y: 500, w: 1000, h: 440 },
}

/**
 * The same three shots, framed for a vertical terminal.
 *
 * A tall screen cannot be given a tighter crop of this composition: the constellation is
 * nine hundred units wide and half that tall, so containing it on a 9:16 screen needs
 * sixteen hundred units of height whatever else is on screen. The slack is not a bug to
 * design away — it is what a wide subject costs on a narrow screen. What matters is WHERE
 * the slack goes, and these regions are centred on the composition rather than on the shot,
 * so it falls evenly above and below and reads as a centred image instead of a picture that
 * has slipped up the screen leaving a hole underneath it (which is what the landscape
 * framings did when they were used unchanged).
 *
 * All three therefore share a centre (COMPOSITION_MID) and differ only in WIDTH, because on
 * a tall screen the fit is driven by width: two regions of the same width show exactly the
 * same thing however tall they are written, and a camera whose shots were all the same width
 * would never appear to move. So portrait does not get three different subjects — it gets
 * three distances from one.
 */
export const FRAMINGS_PORTRAIT: Record<Exclude<FrameName, 'site'>, Rect> = {
  wide: { x: 270, y: -35, w: 1060, h: 960 },
  mind: { x: 320, y: 25, w: 960, h: 840 },
  ground: { x: 390, y: 85, w: 820, h: 720 },
}

/** Where the composition's weight is: halfway between the top of the mind and the table. */
export const COMPOSITION_MID = { x: 800, y: 445 } as const

/**
 * The tight framing on one place on the table, in world x (0…100). The table sits at 72%
 * down the shot rather than in the middle: what matters is happening on top of it, and a
 * frame with the table centred is half floor.
 */
export function siteFrame(worldX: number, portrait = false): Rect {
  const c = place(WORLD, 20 + worldX * 3.6, 182)
  const w = portrait ? 940 : 680
  // deep enough that the HAND is in the shot: it works well above the blocks it carries,
  // and a frame cropped to the tower alone cuts off the thing doing the building
  const h = portrait ? 590 : 440
  // On a tall screen there is no width to spare: panning the full distance to a site puts
  // the frame's edge through the constellation and cuts a third of the agents off. So the
  // portrait camera only leans toward the site — enough to say where to look, not enough
  // to lose the mind that is doing the looking.
  const cx = portrait ? COMPOSITION_MID.x + (c.x - COMPOSITION_MID.x) * 0.25 : c.x
  return {
    // clamped so a site near the table's edge still shows table rather than void
    x: Math.max(STAGE.w * 0.06, Math.min(STAGE.w * 0.94 - w, cx - w / 2)),
    y: c.y - h * 0.75,
    w,
    h,
  }
}

export function frameRect(name: FrameName, worldX = 64, portrait = false): Rect {
  if (name === 'site') return siteFrame(worldX, portrait)
  return portrait ? FRAMINGS_PORTRAIT[name] : FRAMINGS[name]
}

/**
 * Grow a region of interest to the screen's aspect, keeping its centre. The result has the
 * viewport's exact shape, so `preserveAspectRatio` never has anything left to do — no bars,
 * no distortion, and a portrait screen simply sees further up and down.
 */
export function fitToViewport(r: Rect, aspect: number): Rect {
  const w = r.w / r.h < aspect ? r.h * aspect : r.w
  const h = r.w / r.h < aspect ? r.h : r.w / aspect
  return { x: r.x + r.w / 2 - w / 2, y: r.y + r.h / 2 - h / 2, w, h }
}

export function lerpRect(a: Rect, b: Rect, t: number): Rect {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    w: a.w + (b.w - a.w) * t,
    h: a.h + (b.h - a.h) * t,
  }
}

export const viewBoxOf = (r: Rect): string => `${r.x} ${r.y} ${r.w} ${r.h}`

// ————————————————————————————————— the shot list —————————————————————————
//
// One entry per beat of the score, so the camera is a written shot list rather than a
// switch buried in the renderer — and so a new beat cannot ship without someone deciding
// where the room is looking while it is said.

export const SHOTS: Readonly<Record<string, FrameName>> = {
  open: 'wide',
  parts: 'mind',
  settle: 'mind',
  watch: 'ground',
  nobody: 'mind',
  building: 'site',
  stands: 'site',
  remember: 'mind',
  noticed: 'mind',
  unknown: 'mind',
  invite: 'mind',
  consequence: 'wide',
  alone: 'wide',
  dreaming: 'ground',
  awake: 'wide',
  forget: 'wide',
}

/**
 * The shot for a beat. `silent` matters: a beat with no line, framed on the constellation
 * alone, is a still picture with nothing being said over it — and an unattended pass spends
 * seventeen seconds there waiting for a visitor who never comes. Pulling back puts the world
 * in the frame, and the world is always moving, so the silence reads as a held breath rather
 * than as a machine that has stopped.
 */
export function shotFor(beatId: string, silent = false): FrameName {
  const shot = SHOTS[beatId] ?? 'wide'
  return silent && shot === 'mind' ? 'wide' : shot
}

/** Every beat in the score has a shot — checked here so the test can simply ask. */
export function beatsWithoutShot(): string[] {
  return SCORE.filter((b) => !(b.id in SHOTS)).map((b) => b.id)
}
