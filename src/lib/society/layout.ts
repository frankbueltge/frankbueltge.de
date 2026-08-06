// src/lib/society/layout.ts — the society's anatomy, shared by both of its exits.
//
// The reading exit (components/society/SocietyFigure.astro) and the room exit
// (components/society/Room.astro) draw the SAME body: level-bands after §8.11, drives on
// top because they rule, senses at the bottom against the world, the B-brain aside because
// its only world is the A-brain. Two copies of these coordinates would drift within a week,
// and the two exits would slowly become two different societies.

export interface Point {
  x: number
  y: number
}

/** Positions in the 960×540 map space both exits use. */
export const AGENT_POS: Readonly<Record<string, Point>> = {
  play: { x: 200, y: 90 },
  rest: { x: 330, y: 90 },
  curiosity: { x: 460, y: 90 },
  alarm: { x: 590, y: 90 },
  'suppressor-startle': { x: 686, y: 56 },
  'censor-wreck': { x: 686, y: 160 },
  'play-with-blocks': { x: 205, y: 200 },
  builder: { x: 355, y: 200 },
  archer: { x: 475, y: 200 },
  wrecker: { x: 595, y: 205 },
  find: { x: 205, y: 262 },
  get: { x: 320, y: 262 },
  put: { x: 435, y: 262 },
  balance: { x: 555, y: 262 },
  move: { x: 200, y: 350 },
  grasp: { x: 310, y: 350 },
  lift: { x: 420, y: 350 },
  release: { x: 530, y: 350 },
  track: { x: 632, y: 350 },
  'see-block': { x: 180, y: 452 },
  'see-tower': { x: 282, y: 452 },
  'see-arch': { x: 384, y: 452 },
  'see-motion': { x: 486, y: 452 },
  novelty: { x: 588, y: 452 },
  'see-sign': { x: 690, y: 452 },
  worth: { x: 104, y: 90 },
  'watch-quarrel': { x: 828, y: 295 },
  'watch-circle': { x: 828, y: 355 },
  scribe: { x: 828, y: 415 },
}

export interface EdgeSpec {
  from: string
  to: string
  /**
   * excitation (one agent wakes another), inhibition (a censor gates one), or worth —
   * which neither wakes nor gates a thing but changes what the thing is worth (§17.2).
   */
  kind: 'ex' | 'in' | 'worth'
}

export const EDGES: readonly EdgeSpec[] = [
  { from: 'play', to: 'play-with-blocks', kind: 'ex' },
  { from: 'play-with-blocks', to: 'builder', kind: 'ex' },
  { from: 'play-with-blocks', to: 'archer', kind: 'ex' },
  { from: 'play', to: 'wrecker', kind: 'ex' },
  { from: 'builder', to: 'find', kind: 'ex' },
  { from: 'builder', to: 'get', kind: 'ex' },
  { from: 'builder', to: 'put', kind: 'ex' },
  { from: 'archer', to: 'put', kind: 'ex' },
  { from: 'archer', to: 'see-arch', kind: 'ex' },
  { from: 'put', to: 'balance', kind: 'ex' },
  { from: 'find', to: 'see-block', kind: 'ex' },
  { from: 'builder', to: 'see-tower', kind: 'ex' },
  { from: 'get', to: 'move', kind: 'ex' },
  { from: 'get', to: 'grasp', kind: 'ex' },
  { from: 'put', to: 'lift', kind: 'ex' },
  { from: 'put', to: 'release', kind: 'ex' },
  { from: 'curiosity', to: 'track', kind: 'ex' },
  { from: 'see-motion', to: 'curiosity', kind: 'ex' },
  { from: 'see-motion', to: 'alarm', kind: 'ex' },
  { from: 'novelty', to: 'curiosity', kind: 'ex' },
  { from: 'censor-wreck', to: 'wrecker', kind: 'in' },
  { from: 'suppressor-startle', to: 'alarm', kind: 'in' },
  { from: 'see-sign', to: 'worth', kind: 'ex' },
  { from: 'worth', to: 'builder', kind: 'worth' },
  { from: 'worth', to: 'archer', kind: 'worth' },
  { from: 'worth', to: 'wrecker', kind: 'worth' },
]

export const NODE_R = 13

/** The drawn line between two agents: shortened so it meets the discs, and — for an
 *  inhibition — ending in a flat bar that gates rather than touches. */
export function edgeLine(e: EdgeSpec) {
  const a = AGENT_POS[e.from]
  const b = AGENT_POS[e.to]
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy) || 1
  const ux = dx / d
  const uy = dy / d
  const pad = NODE_R + 5
  const x1 = a.x + ux * pad
  const y1 = a.y + uy * pad
  const x2 = b.x - ux * pad
  const y2 = b.y - uy * pad
  const bar =
    e.kind === 'in' ? { x1: x2 - uy * 6, y1: y2 + ux * 6, x2: x2 + uy * 6, y2: y2 - ux * 6 } : null
  return { x1, y1, x2, y2, bar }
}
