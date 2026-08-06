// src/lib/society/moments.ts — the camera: which events of the block world deserve to be
// looked at, and what is said about them while they are.
//
// Stage 3 ("the mourning", 2026-08-05). The prior-art searches (docs/society/prior-art.md)
// concluded that this piece's distinction is compositional and literary, not mechanical:
// every mechanism here is precedented, the elegy is not. The honest consequence is to stage
// what is ours instead of adding machinery — so the world panel now looks at its own dramas
// and says one line about them, and the elegy gets its own weight in the ticker.
//
// This module exists so the drama is DATA rather than scattered branches in the figure
// script: moments.test.ts holds that every dramatic event kind has a caption (a new drama
// cannot ship silent) and that the captions stay short enough to be read in the frame.

import { ARCH_MID, TOWER_X, type WorldEvent } from './world'

export interface Moment {
  /** what the caption says, in the scribe's register — kept short: it is read in-frame */
  caption: string
  /** where the eye is drawn, in world units (x) */
  x: number
  /** how long the camera holds, in milliseconds */
  holdMs: number
}

/** Event kinds that are dramas, in the order they matter when several land in one tick. */
export const DRAMATIC_KINDS = [
  'misfire',
  'worthTurned',
  'collapsed',
  'archComplete',
  'towerComplete',
  'wrecked',
] as const
export type DramaticKind = (typeof DRAMATIC_KINDS)[number]

export function isDramatic(kind: WorldEvent['kind']): kind is DramaticKind {
  return (DRAMATIC_KINDS as readonly string[]).includes(kind)
}

/**
 * The caption for a world event, or null when the event is ordinary traffic (a grasp, a
 * placement). Only the pieces of the day worth interrupting the eye for get one.
 */
export function momentFor(event: WorldEvent): Moment | null {
  switch (event.kind) {
    case 'misfire':
      // the transfer's own drama: memory dragging the hand to the old place
      return { caption: 'the hand goes where the towers were', x: TOWER_X, holdMs: 4200 }
    case 'worthTurned':
      // attachment made visible in the body: §17.2's "instead of trying to escape, the
      // child would try to change what it was doing"
      return {
        caption: 'it changes what it does, not how it does it',
        x: event.goal === 'arch' ? ARCH_MID : TOWER_X,
        holdMs: 4600,
      }
    case 'collapsed':
      return { caption: 'the tower leaves without being pushed', x: TOWER_X, holdMs: 3600 }
    case 'archComplete':
      return { caption: 'an arch — and no one knew the goal had changed', x: ARCH_MID, holdMs: 4200 }
    case 'towerComplete':
      return { caption: `a tower of ${event.height}`, x: TOWER_X, holdMs: 3000 }
    case 'wrecked':
      return {
        caption: event.complete ? 'down, and something is satisfied' : 'down, unfinished',
        x: TOWER_X,
        holdMs: 3600,
      }
    default:
      return null
  }
}

/** The one moment to show when a tick produced several — earliest in DRAMATIC_KINDS wins. */
export function pickMoment(events: WorldEvent[]): Moment | null {
  for (const kind of DRAMATIC_KINDS) {
    const hit = events.find((e) => e.kind === kind)
    if (hit) return momentFor(hit)
  }
  return null
}

// ————————————————————————————— states, not events ——————————————————————
// Stage 4: falling asleep and waking are not things that happen in the world — nothing
// moves — but they are the two biggest changes a visitor can witness, so the camera
// carries them too. Kept beside the world dramas so one test covers both kinds.

export const STATE_MOMENTS = ['sleeps', 'dreamless', 'wakes'] as const
export type StateKind = (typeof STATE_MOMENTS)[number]

export function stateMoment(kind: StateKind, x: number): Moment {
  switch (kind) {
    case 'sleeps':
      return { caption: 'left alone, the society sleeps', x, holdMs: 5000 }
    case 'dreamless':
      return { caption: 'it sleeps, with nothing to dream of', x, holdMs: 5000 }
    case 'wakes':
      return { caption: 'something moves — it wakes', x, holdMs: 3000 }
  }
}
