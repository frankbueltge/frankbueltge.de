// src/lib/society/world.ts — the world of blocks (after Minsky, SOM §1.4).
//
// A small table, seven blocks, one hand, one gaze. The world knows nothing about minds:
// it applies motion, grasping and gravity-of-a-sort, and reports what happened as events.
// Everything is deterministic given the command stream and the seeded RNG the engine owns —
// the world itself draws no random numbers except through the `jitter` passed into `release`.

export interface Block {
  id: string
  /** horizontal position in world units (0..100) */
  x: number
  /** stack level: 0 = on the table, 1 = on a level-0 block, … */
  level: number
  /** id of the tower site the block belongs to, or null when loose */
  inTower: boolean
}

export interface Hand {
  x: number
  y: number
  holding: string | null
}

export interface World {
  blocks: Block[]
  hand: Hand
  /** where the eye rests, eased toward its target by the engine */
  gaze: { x: number; y: number }
  /** cumulative horizontal lean of the tower; past LEAN_LIMIT it falls */
  lean: number
  towerComplete: boolean
}

export type WorldEvent =
  | { kind: 'grasped'; block: string }
  | { kind: 'placed'; block: string; level: number }
  | { kind: 'dropped'; block: string }
  | { kind: 'towerComplete'; height: number }
  | { kind: 'collapsed'; height: number }
  | { kind: 'wrecked'; height: number }

export const TABLE_W = 100
export const TOWER_X = 64
export const TOWER_TOL = 3
export const GOAL_HEIGHT = 4
export const REST_POS = { x: 14, y: 16 }
const LEAN_LIMIT = 5
const GRASP_REACH = 3
const BLOCK_UNIT = 7 // world units of height per stack level

/** Seven blocks, loose on the table. Positions come from the engine's seeded RNG so a
 *  morning is reproducible. */
export function makeWorld(rand: () => number): World {
  const blocks: Block[] = []
  for (let i = 0; i < 7; i++) {
    blocks.push({ id: `b${i}`, x: 6 + Math.floor(rand() * 88), level: 0, inTower: false })
  }
  return {
    blocks,
    hand: { x: REST_POS.x, y: REST_POS.y, holding: null },
    gaze: { x: TOWER_X, y: 10 },
    lean: 0,
    towerComplete: false,
  }
}

export function towerHeight(w: World): number {
  return w.blocks.filter((b) => b.inTower).length
}

export function looseBlocks(w: World): Block[] {
  return w.blocks.filter((b) => !b.inTower && b.id !== w.hand.holding)
}

export function nearestLooseBlock(w: World, x: number): Block | null {
  let best: Block | null = null
  let bestD = Infinity
  for (const b of looseBlocks(w)) {
    const d = Math.abs(b.x - x)
    if (d < bestD) {
      bestD = d
      best = b
    }
  }
  return best
}

/** Height of the hand needed to hover over the current top of the tower. */
export function towerTopY(w: World): number {
  return (towerHeight(w) + 1) * BLOCK_UNIT + 4
}

export function blockY(level: number): number {
  return level * BLOCK_UNIT
}

/** Move the hand toward a target; returns true when it arrived this step. */
export function moveHand(w: World, tx: number, ty: number, speed: number): boolean {
  const dx = tx - w.hand.x
  const dy = ty - w.hand.y
  const d = Math.hypot(dx, dy)
  if (d <= speed) {
    w.hand.x = tx
    w.hand.y = ty
    return true
  }
  w.hand.x += (dx / d) * speed
  w.hand.y += (dy / d) * speed
  const held = w.hand.holding ? w.blocks.find((b) => b.id === w.hand.holding) : null
  if (held) held.x = w.hand.x
  return false
}

/** Close the hand on the nearest loose block within reach. */
export function grasp(w: World): WorldEvent[] {
  if (w.hand.holding) return []
  const b = nearestLooseBlock(w, w.hand.x)
  if (!b || Math.abs(b.x - w.hand.x) > GRASP_REACH) return []
  w.hand.holding = b.id
  b.x = w.hand.x
  return [{ kind: 'grasped', block: b.id }]
}

function scatter(w: World, rand: () => number): void {
  for (const b of w.blocks) {
    if (b.inTower) {
      b.inTower = false
      b.level = 0
      b.x = 6 + Math.floor(rand() * 88)
    }
  }
  w.lean = 0
  w.towerComplete = false
}

/**
 * Open the hand. Over the tower site (and lifted high enough) the block lands on the stack
 * with the given placement jitter; a grown lean brings the whole tower down. Anywhere else
 * the block simply drops to the table.
 */
export function release(
  w: World,
  jitter: number,
  lifted: boolean,
  rand: () => number,
): WorldEvent[] {
  const id = w.hand.holding
  if (!id) return []
  const b = w.blocks.find((x) => x.id === id)!
  w.hand.holding = null
  const overSite = Math.abs(w.hand.x - TOWER_X) <= TOWER_TOL
  if (!overSite || !lifted) {
    b.level = 0
    b.inTower = false
    return [{ kind: 'dropped', block: id }]
  }
  const level = towerHeight(w)
  b.inTower = true
  b.level = level
  b.x = TOWER_X + jitter
  w.lean += Math.abs(jitter)
  const events: WorldEvent[] = [{ kind: 'placed', block: id, level }]
  if (w.lean > LEAN_LIMIT) {
    const h = towerHeight(w)
    scatter(w, rand)
    events.push({ kind: 'collapsed', height: h })
    return events
  }
  if (towerHeight(w) >= GOAL_HEIGHT && !w.towerComplete) {
    w.towerComplete = true
    events.push({ kind: 'towerComplete', height: towerHeight(w) })
  }
  return events
}

/** The hand sweeps through the stack; everything it built comes down. */
export function wreck(w: World, rand: () => number): WorldEvent[] {
  const h = towerHeight(w)
  if (h === 0) return []
  scatter(w, rand)
  return [{ kind: 'wrecked', height: h }]
}

/** A startled hand lets go wherever it is. */
export function drop(w: World): WorldEvent[] {
  const id = w.hand.holding
  if (!id) return []
  const b = w.blocks.find((x) => x.id === id)!
  w.hand.holding = null
  b.level = 0
  b.inTower = false
  return [{ kind: 'dropped', block: id }]
}
