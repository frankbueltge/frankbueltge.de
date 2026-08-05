// src/lib/society/engine.ts — the deterministic tick of The Society.
//
// One rule of construction, and it is the piece's honesty clause: every behavioural block
// below is headed by the id of the agent whose card-code (agents.ts) it implements. The card
// shows the rule in words; this file is those words as arithmetic. Change one, change both.
//
// Determinism: everything flows from the seed and the visitor-input stream. The engine draws
// randomness only from its own mulberry32; there is no Date.now(), no Math.random(). The same
// seed with the same inputs is the same morning, tick for tick — which is what makes an
// ablation a finding rather than an anecdote (engine.test.ts holds the claim).

import {
  drop,
  GOAL_HEIGHT,
  grasp,
  makeWorld,
  moveHand,
  nearestLooseBlock,
  release,
  REST_POS,
  TOWER_X,
  towerHeight,
  towerTopY,
  wreck,
  type World,
  type WorldEvent,
} from './world'
import { agentById } from './agents'

export const TICKS_PER_SEC = 10

export interface VisitorInput {
  present: boolean
  /** projected into world units (0..100 / 0..40) by the figure script */
  x: number
  y: number
  /** movement speed, normalized by the figure script to roughly 0..10 */
  speed: number
}

export const NO_VISITOR: VisitorInput = { present: false, x: 0, y: 0, speed: 0 }

export interface KLine {
  id: number
  tick: number
  /** the agents that were up when the tower stood — memory as re-arousal (SOM §8.1) */
  agents: string[]
}

export interface TickerLine {
  tick: number
  text: string
}

type Ruler = 'play' | 'rest' | 'curiosity' | 'alarm'
type Mode = 'build' | 'wreck' | 'watch' | 'rest' | 'freeze' | 'idle'
type Phase = 'find' | 'get' | 'put'

export interface Society {
  seed: number
  tick: number
  rng: () => number
  world: World
  ablated: Set<string>
  /** display activations, 0..1, recomputed every tick */
  a: Record<string, number>
  needs: { play: number; rest: number; curiosity: number; alarm: number }
  ruler: Ruler
  mode: Mode
  phase: Phase
  targetBlock: string | null
  surprise: number
  boredom: number
  /** what SEE-MOTION shouted a tick ago — NOVELTY and ALARM compare against this, never
   *  against the raw world: all perception here passes through the eye */
  prevSeen: number
  alarmTicks: number
  startleGuard: number
  fatigue: number
  stall: number
  kLines: KLine[]
  lines: TickerLine[]
  wanderTarget: { x: number; y: number }
  wanderAge: number
  cooldowns: Record<string, number>
  /** WRECKER's surge clock — "now and then it surges" */
  surgeTicks: number
  nextSurge: number
}

export function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t = (t + 0x6d2b79f5) >>> 0
    let r = t
    r = Math.imul(r ^ (r >>> 15), r | 1)
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

/** Seed for "one morning per day": derived from a date string the caller supplies (the page
 *  passes today's date; tests pass constants). */
export function seedFromString(s: string): number {
  let h = 2166136261 >>> 0
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619) >>> 0
  }
  return h
}

export function makeSociety(seed: number): Society {
  const rng = mulberry32(seed)
  return {
    seed,
    tick: 0,
    rng,
    world: makeWorld(rng),
    ablated: new Set(),
    a: {},
    // the society wakes wanting to play — a morning, not a cold boot
    needs: { play: 0.55, rest: 0.15, curiosity: 0, alarm: 0 },
    ruler: 'play',
    mode: 'idle',
    phase: 'find',
    targetBlock: null,
    surprise: 0,
    boredom: 0,
    prevSeen: 0,
    alarmTicks: 0,
    startleGuard: 0,
    fatigue: 0,
    stall: 0,
    kLines: [],
    lines: [],
    wanderTarget: { x: 50, y: 18 },
    wanderAge: 0,
    cooldowns: {},
    surgeTicks: 0,
    nextSurge: 150 + Math.floor(rng() * 240),
  }
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function say(s: Society, key: string, cooldown: number, text: string): void {
  // SCRIBE — "when something changes hands, write one plain line about it".
  // A silenced scribe writes nothing: things keep happening; no one says so.
  if (s.ablated.has('scribe')) return
  if ((s.cooldowns[key] ?? -Infinity) + cooldown > s.tick) return
  s.cooldowns[key] = s.tick
  s.lines.push({ tick: s.tick, text })
  if (s.lines.length > 60) s.lines.splice(0, s.lines.length - 60)
}

export function silence(s: Society, id: string): void {
  if (s.ablated.has(id)) return
  s.ablated.add(id)
  const spec = agentById(id)
  if (id === 'scribe') {
    // the scribe's own elegy is the last thing it writes
    s.lines.push({ tick: s.tick, text: spec.elegy })
    if (s.lines.length > 60) s.lines.splice(0, s.lines.length - 60)
    return
  }
  say(s, `elegy-${id}`, 0, spec.elegy)
}

export function wakeAgent(s: Society, id: string): void {
  if (!s.ablated.has(id)) return
  s.ablated.delete(id)
  const spec = agentById(id)
  say(s, `wake-${id}`, 0, `${spec.name} answers again.`)
}

export interface StepResult {
  events: WorldEvent[]
}

export function step(s: Society, input: VisitorInput): StepResult {
  s.tick++
  const abl = (id: string) => s.ablated.has(id)
  const events: WorldEvent[] = []
  const a: Record<string, number> = {}
  const w = s.world

  // ————————————————————————————————————————————————— senses ——————————————
  // what the eye shouted a tick ago — ALARM and NOVELTY both compare against it
  const seenBefore = s.prevSeen

  // see-motion — "how fast does the shadow move? shout that number"
  const seen = !abl('see-motion') && input.present ? clamp01(input.speed / 6) : 0
  a['see-motion'] = seen

  // novelty — "keep a fading copy of what SEE-MOTION said before; surprise = difference"
  if (!abl('novelty')) {
    s.surprise = clamp01(s.surprise * 0.95 + Math.abs(seen - seenBefore) * 1.2)
    s.boredom = clamp01(s.boredom + (seen > 0.04 ? 0.0025 : -0.004))
    if (s.boredom > 0.92) s.boredom = 0.92
  } else {
    // a mind that cannot compare with a moment ago: raw signal, and nothing ever bores it
    s.surprise = seen * 0.85
    s.boredom = 0
  }
  s.prevSeen = seen
  a['novelty'] = s.surprise

  // see-tower — "count the stacked blocks, tell BUILDER the number"
  const seenHeight = abl('see-tower') ? 0 : towerHeight(w)
  a['see-tower'] = towerHeight(w) / GOAL_HEIGHT

  // ————————————————————————————————————————————————— drives ——————————————
  // play — "each moment: want a little more" (fatigue is WATCH-CIRCLE's doing)
  if (!abl('play')) {
    s.needs.play = clamp01(s.needs.play + 0.0012 * (1 - s.fatigue))
  } else s.needs.play = 0
  s.fatigue = Math.max(0, s.fatigue - 0.0015)

  // rest — "each moment the hand works: want stillness a little more"
  const handMoved = s.mode === 'build' || s.mode === 'wreck'
  if (!abl('rest')) {
    s.needs.rest = clamp01(s.needs.rest + (handMoved ? 0.0035 : -0.0006))
  } else s.needs.rest = 0

  // curiosity — "want = surprise × freshness"
  s.needs.curiosity = abl('curiosity') ? 0 : clamp01(s.surprise * (1 - s.boredom))

  // alarm — "if the shadow leaps: seize the body"
  if (s.startleGuard > 0) s.startleGuard--
  if (!abl('alarm')) {
    // "if the shadow leaps" — a leap as the EYE reports it; a blind society cannot flinch
    const leap = seen - seenBefore > 0.75 && seen > 0
    const suppressed = !abl('suppressor-startle') && s.startleGuard > 0
    if (leap && !suppressed && s.alarmTicks === 0) {
      s.alarmTicks = 12
      // suppressor-startle — "after ALARM has fired: for a long moment, press ALARM down"
      if (!abl('suppressor-startle')) s.startleGuard = 600
      events.push(...drop(w))
      if (events.some((e) => e.kind === 'dropped'))
        say(s, 'startle-drop', 40, 'ALARM seized the body. The hand let go.')
      else say(s, 'startle', 40, 'ALARM seized the body. Everything holds still.')
    }
  } else s.alarmTicks = 0
  s.needs.alarm = s.alarmTicks > 0 ? 1 : 0
  if (s.alarmTicks > 0) s.alarmTicks--
  a['suppressor-startle'] = !abl('suppressor-startle') && s.startleGuard > 0 ? 0.7 : 0

  // cross-exclusion (§16.4) — one proto-specialist rules; a challenger must clearly win
  const needs: [Ruler, number][] = [
    ['play', s.needs.play],
    ['rest', s.needs.rest],
    ['curiosity', s.needs.curiosity],
    ['alarm', s.needs.alarm],
  ]
  if (s.needs.alarm > 0) s.ruler = 'alarm'
  else {
    const incumbent = s.needs[s.ruler] ?? 0
    let best: Ruler = s.ruler
    let bestV = incumbent + 0.08
    for (const [k, v] of needs) if (v > bestV) ((best = k), (bestV = v))
    if (best !== s.ruler) {
      s.ruler = best
      // one cooldown per drive, so an oscillating pair still reads as a dialogue
      if (best === 'rest') say(s, 'ruler-rest', 300, 'REST has the body. The hand settles.')
      if (best === 'curiosity')
        say(s, 'ruler-curiosity', 300, 'CURIOSITY has the eye. The tower can wait.')
      if (best === 'play') say(s, 'ruler-play', 300, 'PLAY has the body again.')
    }
  }
  a['play'] = s.needs.play
  a['rest'] = s.needs.rest
  a['curiosity'] = s.needs.curiosity
  a['alarm'] = s.needs.alarm

  // ———————————————————————————————————————————————— managers —————————————
  // wrecker — "it grows with PLAY, and now and then it surges"
  if (s.tick >= s.nextSurge) {
    s.surgeTicks = 25
    s.nextSurge = s.tick + 150 + Math.floor(s.rng() * 300)
  }
  const surging = s.surgeTicks > 0
  if (s.surgeTicks > 0) s.surgeTicks--
  let wreckWant = 0
  if (!abl('wrecker') && towerHeight(w) > 0) {
    wreckWant = (0.25 + 0.55 * s.needs.play + (w.towerComplete ? 0.2 : 0)) * (surging ? 2 : 1)
    // censor-wreck — "while the tower is unfinished: press WRECKER down"
    if (!abl('censor-wreck') && !w.towerComplete) wreckWant *= 0.1
  }
  a['censor-wreck'] = !abl('censor-wreck') && towerHeight(w) > 0 && !w.towerComplete ? 0.8 : 0

  // play-with-blocks — "while PLAY rules: wake BUILDER" (it cannot stack, cannot smash)
  // builder — "too short → wake FIND, GET, PUT; tall enough → rest"
  let buildWant = 0
  if (s.ruler === 'play' && !abl('play-with-blocks') && !abl('builder')) {
    buildWant = seenHeight < GOAL_HEIGHT ? 0.6 + 0.4 * s.needs.play : 0.1
  }
  a['play-with-blocks'] = s.ruler === 'play' && !abl('play-with-blocks') ? 0.8 : 0

  // watch-quarrel — "if BUILDER and WRECKER shout equally loud, quiet them both;
  // a clear victory it lets stand" (noncompromise, §3.2)
  if (
    !abl('watch-quarrel') &&
    buildWant > 0.45 &&
    wreckWant > 0.45 &&
    Math.abs(buildWant - wreckWant) < 0.15
  ) {
    buildWant *= 0.25
    wreckWant *= 0.25
    say(s, 'quarrel', 300, 'BUILDER and WRECKER, equally loud. Noncompromise: neither gets the hand.')
  }
  a['wrecker'] = clamp01(wreckWant)
  a['builder'] = clamp01(buildWant)
  a['watch-quarrel'] = abl('watch-quarrel') ? 0 : 0.25

  // the ruling drive picks the body's mode; between BUILDER and WRECKER it is
  // play-with-blocks that arbitrates — "when both shout, the louder child gets the hand"
  if (s.ruler === 'alarm') s.mode = 'freeze'
  else if (s.ruler === 'rest') s.mode = 'rest'
  else if (s.ruler === 'curiosity') s.mode = 'watch'
  else if (wreckWant > buildWant && wreckWant > 0.5) s.mode = 'wreck'
  else if (buildWant > 0) s.mode = 'build'
  else s.mode = 'idle'

  // ————————————————————————————————————————————————— the body ————————————
  // k-lines make practiced motion quicker — memory as re-arousal (§8.1)
  const handSpeed = 1.3 * (1 + Math.min(0.5, s.kLines.length * 0.08))
  let progressed = false

  if (s.mode === 'rest') {
    if (!abl('move')) moveHand(w, REST_POS.x, REST_POS.y, handSpeed * 0.6)
    s.needs.rest = clamp01(s.needs.rest - 0.004)
    a['rest'] = Math.max(a['rest'], 0.6)
  } else if (s.mode === 'watch') {
    // track — "ease the gaze toward the moving shadow and hold it there"
    if (!abl('track') && input.present) {
      w.gaze.x += (input.x - w.gaze.x) * 0.2
      w.gaze.y += (input.y - w.gaze.y) * 0.2
      a['track'] = 1
    }
  } else if (s.mode === 'wreck') {
    if (!abl('move')) {
      a['move'] = 1
      const arrived = moveHand(w, TOWER_X, 8, handSpeed * 1.4)
      if (arrived) {
        const ev = wreck(w, s.rng)
        if (ev.length) {
          events.push(...ev)
          progressed = true
          const h = ev.find((e) => e.kind === 'wrecked')
          say(
            s,
            'wrecked',
            80,
            `WRECKER has the hand. ${h && 'height' in h ? h.height : 'the'} blocks, down. PLAY is satisfied either way.`,
          )
          // play — "a tower gloriously crashed: want much less, for a while"
          s.needs.play *= 0.3
          s.needs.rest = clamp01(s.needs.rest + 0.15)
        }
      }
    }
  } else if (s.mode === 'build') {
    if (s.phase === 'find') {
      a['find'] = 1
      // find — "ask SEE-BLOCK; point GET at the answer; if no answer: wander"
      const answer = !abl('find') && !abl('see-block') ? nearestLooseBlock(w, w.hand.x) : null
      if (answer) {
        a['see-block'] = 1
        s.targetBlock = answer.id
        s.phase = 'get'
      } else {
        wander(s, handSpeed)
      }
    } else if (s.phase === 'get') {
      a['get'] = 1
      // get — "send MOVE to it; arrived → ask GRASP to close; holding → tell PUT"
      const target = w.blocks.find((b) => b.id === s.targetBlock)
      if (abl('get') || !target || target.inTower) {
        s.phase = 'find'
      } else if (!abl('move')) {
        a['move'] = 1
        const arrived = moveHand(w, target.x, 4, handSpeed)
        if (arrived) {
          if (!abl('grasp')) {
            a['grasp'] = 1
            const ev = grasp(w)
            if (ev.length) {
              events.push(...ev)
              progressed = true
              say(s, 'grasped', 200, 'GRASP closes. The society has a block.')
              s.phase = 'put'
            }
          }
          // grasp silent: the hand sits at the block, closing on nothing — WATCH-CIRCLE's case
        }
      }
    } else if (s.phase === 'put') {
      a['put'] = 1
      if (!w.hand.holding) {
        s.phase = 'find'
      } else if (abl('put')) {
        // put silent — "the society carries its block in circles"
        wander(s, handSpeed)
      } else if (!abl('move')) {
        a['move'] = 1
        // lift — "keep it higher than the tower's top"
        const lifted = !abl('lift')
        if (lifted) a['lift'] = 1
        const targetY = lifted ? towerTopY(w) : 5
        const arrived = moveHand(w, TOWER_X, targetY, handSpeed)
        if (arrived) {
          if (!abl('release')) {
            a['release'] = 1
            // balance — "nudge the block until its edges agree with the block below"
            const jitter = abl('balance') ? (s.rng() * 2 - 1) * 3.6 : (s.rng() * 2 - 1) * 0.6
            if (!abl('balance')) a['balance'] = 1
            const ev = release(w, jitter, lifted, s.rng)
            events.push(...ev)
            progressed = ev.length > 0
            for (const e of ev) {
              if (e.kind === 'placed')
                say(s, 'placed', 120, `PUT lets go. The tower is ${e.level + 1} high.`)
              if (e.kind === 'collapsed')
                say(s, 'collapsed', 80, 'The tower leaves without being pushed. BALANCE was not enough.')
              if (e.kind === 'dropped')
                say(s, 'misdropped', 200, 'RELEASE opens too low. The block meets the table.')
              if (e.kind === 'towerComplete') {
                say(s, 'complete', 80, 'A tower of four. Somewhere in here, something is satisfied.')
                // play — "a tower finished: want much less, for a while"
                s.needs.play *= 0.25
                s.needs.rest = clamp01(s.needs.rest + 0.2)
                // k-lines (§8.1): remember which agents were up when the tower stood
                const up = Object.entries(a)
                  .filter(([, v]) => v > 0.5)
                  .map(([k]) => k)
                s.kLines.push({ id: s.kLines.length + 1, tick: s.tick, agents: up })
                say(s, 'kline', 80, 'A K-line has formed. The next tower will come easier.')
              }
            }
            s.phase = 'find'
          }
          // release silent: the hand holds its one block, forever — WATCH-CIRCLE's case
        }
      }
    }
  }

  // gaze rests on the working hand whenever TRACK is not ruling it
  if (s.mode !== 'watch') {
    w.gaze.x += (w.hand.x - w.gaze.x) * 0.1
    w.gaze.y += (w.hand.y - w.gaze.y) * 0.1
  }

  // ——————————————————————————————————————————————— reflection ————————————
  // watch-circle — "if it acts and acts and the world stays the same, tire the wish".
  // The counter survives naps and distractions on purpose: only real progress clears it,
  // otherwise a society that rests mid-loop would return to the same loop forever unseen.
  if (s.mode === 'build' || s.mode === 'wreck') {
    s.stall = progressed ? 0 : s.stall + 1
    if (!abl('watch-circle') && s.stall > 240) {
      s.stall = 0
      s.fatigue = 1
      s.needs.play *= 0.35
      say(s, 'circle', 200, 'The A-brain repeats itself. WATCH-CIRCLE tires the wish behind it.')
    }
  }
  a['watch-circle'] = abl('watch-circle') ? 0 : clamp01(s.stall / 240)
  a['scribe'] = abl('scribe') ? 0 : 0.3

  if (seen > 0.5)
    say(s, 'seen', 450, 'SEE-MOTION is loud. Something is being seen; nothing in here knows what.')

  // ablated agents display as silence, whatever happened above
  for (const id of s.ablated) a[id] = 0
  s.a = a
  return { events }
}

function wander(s: Society, handSpeed: number): void {
  if (s.ablated.has('move')) return
  s.wanderAge++
  if (s.wanderAge > 50) {
    s.wanderAge = 0
    s.wanderTarget = { x: 5 + s.rng() * 90, y: 6 + s.rng() * 22 }
  }
  s.a['move'] = 0.4
  moveHand(s.world, s.wanderTarget.x, s.wanderTarget.y, handSpeed * 0.5)
}

/** Stable snapshot for the determinism test: everything that defines the state of the
 *  morning except the RNG closure itself. */
export function snapshot(s: Society): string {
  return JSON.stringify({
    tick: s.tick,
    world: s.world,
    needs: s.needs,
    ruler: s.ruler,
    mode: s.mode,
    phase: s.phase,
    kLines: s.kLines,
    lines: s.lines,
  })
}
