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
  ARCH_MID,
  ARCH_X1,
  ARCH_X2,
  archState,
  blockY,
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
  /** the agents that were up when the work stood — memory as re-arousal (SOM §8.1) */
  agents: string[]
  /** what stood: stage 2 gives memories a second kind, and the transfer test reads it */
  kind: 'tower' | 'arch'
}

export interface TickerLine {
  tick: number
  text: string
  /**
   * What the scribe is doing. 'note' is its ordinary reporting; 'elegy' is the line a
   * silenced agent leaves behind, and 'wake' its return. Stage 3 gives the elegy its own
   * weight in the ticker — the prior-art searches found the elegy to be the one gesture
   * this piece owns outright (docs/society/prior-art.md), and it was the weakest-staged
   * thing on the page. 'dream' is what the scribe writes while the body sleeps (stage 4):
   * the B-brain sees the A-brain firing and reports it, having no way to know that nothing
   * out there is happening.
   */
  kind: 'note' | 'elegy' | 'wake' | 'dream'
}

type Ruler = 'play' | 'rest' | 'curiosity' | 'alarm'
type Mode = 'build' | 'wreck' | 'watch' | 'rest' | 'freeze' | 'idle' | 'sleep'
type Phase = 'find' | 'get' | 'put'
type Goal = 'tower' | 'arch'

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
  /** which difference-engine has the hand while building — BUILDER's tower or ARCHER's arch */
  goal: Goal
  /** the transfer's other half, spent once per morning: the first placement under the
   *  arch goal follows the tower K-lines to the old site (§8.6) */
  habitSpent: boolean
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
  /** stage 4 — the dream (§15.8): the society sleeps when nothing has happened for long
   *  enough and no one is watching. Its agents keep firing; its body does not move. */
  asleep: boolean
  /** consecutive ticks with no visitor — being left alone is the road into sleep */
  aloneTicks: number
  /** which memory is being re-aroused, and how far in — a K-line replayed, not a plan run */
  dream: { kLineId: number; agents: string[]; step: number } | null
  /** how many dreams this morning; the record the figure draws its ghosts from */
  dreamsHad: number
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
    goal: 'tower',
    habitSpent: false,
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
    asleep: false,
    aloneTicks: 0,
    dream: null,
    dreamsHad: 0,
    wanderTarget: { x: 50, y: 18 },
    wanderAge: 0,
    cooldowns: {},
    surgeTicks: 0,
    nextSurge: 150 + Math.floor(rng() * 240),
  }
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

function say(
  s: Society,
  key: string,
  cooldown: number,
  text: string,
  kind: TickerLine['kind'] = 'note',
): void {
  // SCRIBE — "when something changes hands, write one plain line about it".
  // A silenced scribe writes nothing: things keep happening; no one says so.
  if (s.ablated.has('scribe')) return
  if ((s.cooldowns[key] ?? -Infinity) + cooldown > s.tick) return
  s.cooldowns[key] = s.tick
  s.lines.push({ tick: s.tick, text, kind })
  if (s.lines.length > 60) s.lines.splice(0, s.lines.length - 60)
}

export function silence(s: Society, id: string): void {
  if (s.ablated.has(id)) return
  s.ablated.add(id)
  const spec = agentById(id)
  if (id === 'scribe') {
    // the scribe's own elegy is the last thing it writes
    s.lines.push({ tick: s.tick, text: spec.elegy, kind: 'elegy' })
    if (s.lines.length > 60) s.lines.splice(0, s.lines.length - 60)
    return
  }
  say(s, `elegy-${id}`, 0, spec.elegy, 'elegy')
}

export function wakeAgent(s: Society, id: string): void {
  if (!s.ablated.has(id)) return
  s.ablated.delete(id)
  const spec = agentById(id)
  say(s, `wake-${id}`, 0, `${spec.name} answers again.`, 'wake')
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
    // "if the shadow leaps" — a leap as the EYE reports it; a blind society cannot flinch.
    // A sleeping society does not startle: it wakes (stage 4), and the waking IS the
    // fright. This also keeps the sleep invariant true by construction — the startle's
    // drop is the one way the body could have moved while asleep.
    const leap = seen - seenBefore > 0.75 && seen > 0 && !s.asleep
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

  // ————————————————————————————————— sleep and the dream ————————————————
  // Stage 4 (§15.4, §15.8, §3.5). The society sleeps when its body has had nothing to do
  // for a long stretch and no one is there; while it sleeps, a K-line is re-aroused —
  // "memories are processes that make some of our agents act in much the same ways they
  // did in the past" (§15.4) — and the agents fire into nothing. NOTHING IN THE WORLD
  // MOVES: the dream is the mind running without the body, which is the whole point
  // ("a real child can go to bed — yet still build towers in its head", §3.5).
  // Being LEFT ALONE is what sends it to sleep — not idleness as such: a society with a
  // visitor keeps working for as long as the visitor stays. It goes under at the next
  // moment its body happens to be resting, so it never falls asleep mid-grasp.
  s.aloneTicks = input.present ? 0 : s.aloneTicks + 1
  const bodyIdle = s.mode === 'rest' || s.mode === 'idle'
  if (!s.asleep && s.aloneTicks > 900 && bodyIdle && !w.hand.holding) {
    s.asleep = true
    s.aloneTicks = 0
    // pick the memory to replay: the rng keeps it deterministic, the roster keeps it real
    if (s.kLines.length > 0) {
      const k = s.kLines[Math.floor(s.rng() * s.kLines.length)]
      s.dream = { kLineId: k.id, agents: k.agents, step: 0 }
      s.dreamsHad++
      say(s, 'sleeps', 0, 'The society sleeps. Its hand rests.', 'dream')
    } else {
      // nothing was ever achieved, so there is no K-line to re-arouse: a dreamless sleep
      s.dream = null
      say(s, 'sleeps', 0, 'The society sleeps, and has nothing to dream of.', 'dream')
    }
  }

  if (s.asleep) {
    s.mode = 'sleep'
    // the visitor's return wakes it — the eye still works while the body does not
    const stirred = seen > 0.25
    if (stirred || s.needs.play > 0.85) {
      s.asleep = false
      s.dream = null
      say(s, 'wakes', 0, stirred ? 'Something moves. The society wakes.' : 'PLAY has grown loud enough to wake it.', 'wake')
    } else if (s.dream) {
      // the replay: the remembered agents light up in turn, and the scribe — which can see
      // only the A-brain and never the table — reports them as if they were working
      const d = s.dream
      d.step++
      for (let i = 0; i < d.agents.length; i++) {
        const phase = (d.step / 22 + i / d.agents.length) % 1
        a[d.agents[i]] = 0.35 + 0.45 * Math.sin(phase * Math.PI * 2) ** 2
      }
      // censors sleep too (§27.3: "sometimes censors must themselves be suppressed"), so a
      // dream may contain what the day would not allow
      a['censor-wreck'] = 0
      a['suppressor-startle'] = 0
      const k = s.kLines.find((x) => x.id === d.kLineId)
      // dreams repeat, but a ticker that repeats itself reads as a bug rather than as a
      // night: the same line waits a while before it may come again
      if (d.step === 12)
        say(
          s,
          'dream-building',
          420,
          k?.kind === 'arch'
            ? 'It is building an arch that is not there.'
            : 'It is building a tower that is not there.',
          'dream',
        )
      if (d.step === 90)
        say(s, 'dream-wrecker', 700, 'In the dream, nothing holds WRECKER back.', 'dream')
      if (d.step > 150) {
        // one memory is not enough for a night: take another, or wake on the last
        const next = s.kLines[Math.floor(s.rng() * s.kLines.length)]
        s.dream = { kLineId: next.id, agents: next.agents, step: 0 }
        s.dreamsHad++
      }
    }
    // the sleeping society draws no other conclusions: the body is skipped entirely
    for (const id of s.ablated) a[id] = 0
    s.a = a
    // the gaze sinks shut
    w.gaze.x += (w.hand.x - w.gaze.x) * 0.04
    w.gaze.y += (REST_POS.y - w.gaze.y) * 0.04
    return { events }
  }

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
  const arch = archState(w)
  const towerK = s.kLines.filter((k) => k.kind === 'tower').length
  const archK = s.kLines.filter((k) => k.kind === 'arch').length
  const standing = w.blocks.filter((b) => b.inTower || b.inArch).length

  // wrecker — "it grows with PLAY, and now and then it surges"
  if (s.tick >= s.nextSurge) {
    s.surgeTicks = 25
    s.nextSurge = s.tick + 150 + Math.floor(s.rng() * 300)
  }
  const surging = s.surgeTicks > 0
  if (s.surgeTicks > 0) s.surgeTicks--
  // what the censor calls "finished" is the ACTIVE goal's completion — tower or arch,
  // it does not know the difference
  const currentComplete = s.goal === 'arch' ? arch.complete : w.towerComplete
  let wreckWant = 0
  if (!abl('wrecker') && standing > 0) {
    wreckWant = (0.25 + 0.55 * s.needs.play + (currentComplete ? 0.2 : 0)) * (surging ? 2 : 1)
    // censor-wreck — "while the work is unfinished: press WRECKER down"
    if (!abl('censor-wreck') && !currentComplete) wreckWant *= 0.1
  }
  a['censor-wreck'] = !abl('censor-wreck') && standing > 0 && !currentComplete ? 0.8 : 0

  // play-with-blocks — "while PLAY rules: wake BUILDER" (it cannot stack, cannot smash)
  // builder — "too short → wake FIND, GET, PUT; tall enough → rest";
  // each finished tower makes the next one want a little less (satiation)
  let buildWant = 0
  if (s.ruler === 'play' && !abl('play-with-blocks') && !abl('builder')) {
    buildWant =
      (seenHeight < GOAL_HEIGHT ? 0.6 + 0.4 * s.needs.play : 0.1) *
      Math.max(0.35, 1 - 0.25 * towerK)
  }
  // archer — "it wakes once towers have grown boring": after two tower K-lines, or from
  // the morning if the tower-way itself is silent
  let archWant = 0
  if (
    !abl('archer') &&
    s.ruler === 'play' &&
    !abl('play-with-blocks') &&
    (towerK >= 2 || abl('builder'))
  ) {
    archWant = arch.complete
      ? 0.1
      : (0.55 + 0.35 * s.needs.play) * Math.max(0.35, 1 - 0.3 * archK)
  }
  a['play-with-blocks'] = s.ruler === 'play' && !abl('play-with-blocks') ? 0.8 : 0

  // play-with-blocks arbitrates its builders — "the louder child gets the hand"
  const constructWant = Math.max(buildWant, archWant)
  const nextGoal: Goal = archWant > buildWant ? 'arch' : 'tower'

  // watch-quarrel — "if the builders and WRECKER shout equally loud, quiet them both;
  // a clear victory it lets stand" (noncompromise, §3.2)
  let quieted = 1
  if (
    !abl('watch-quarrel') &&
    constructWant > 0.45 &&
    wreckWant > 0.45 &&
    Math.abs(constructWant - wreckWant) < 0.15
  ) {
    quieted = 0.25
    wreckWant *= 0.25
    say(s, 'quarrel', 300, 'The builders and WRECKER, equally loud. Noncompromise: neither gets the hand.')
  }
  a['wrecker'] = clamp01(wreckWant)
  a['builder'] = clamp01(buildWant * quieted)
  a['archer'] = clamp01(archWant * quieted)
  a['watch-quarrel'] = abl('watch-quarrel') ? 0 : 0.25

  // the ruling drive picks the body's mode
  if (s.ruler === 'alarm') s.mode = 'freeze'
  else if (s.ruler === 'rest') s.mode = 'rest'
  else if (s.ruler === 'curiosity') s.mode = 'watch'
  else if (wreckWant > constructWant * quieted && wreckWant > 0.5) s.mode = 'wreck'
  else if (constructWant * quieted > 0) {
    s.mode = 'build'
    if (s.goal !== nextGoal) {
      s.goal = nextGoal
      s.phase = 'find'
      if (nextGoal === 'arch')
        say(s, 'goal-arch', 600, 'ARCHER wakes. Two towers were enough; the hands know the way.')
    }
  } else s.mode = 'idle'

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
      // the hand sweeps where something actually stands — tower first, else the arch
      const sweepX = towerHeight(w) > 0 ? TOWER_X : ARCH_MID
      const arrived = moveHand(w, sweepX, 8, handSpeed * 1.4)
      if (arrived) {
        const ev = wreck(w, s.rng, currentComplete)
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
      } else if (s.goal === 'arch' && abl('see-arch')) {
        // the arch's eye is silent: ARCHER carries its block, blind to what stands
        wander(s, handSpeed)
      } else if (!abl('move')) {
        a['move'] = 1
        // lift — "keep it higher than the tower's top"
        const lifted = !abl('lift')
        if (lifted) a['lift'] = 1

        // where PUT carries the block: the active difference-engine's next missing part.
        // The transfer's other half (§8.6): the FIRST move under the arch goal follows
        // the tower K-lines to the OLD site — the hand hesitates there, the difference-
        // engine catches it, and corrects. No block is lost; memory dragged the hand,
        // the plan corrected it. Spent once per morning.
        const habitPull = s.goal === 'arch' && !s.habitSpent && towerK > 0 && archK === 0
        let tx = TOWER_X
        let ty = lifted ? towerTopY(w) : 5
        if (s.goal === 'arch' && !habitPull) {
          a['see-arch'] = 1
          const st = archState(w)
          if (!st.left) {
            tx = ARCH_X1
            ty = 4
          } else if (!st.right) {
            tx = ARCH_X2
            ty = 4
          } else {
            tx = ARCH_MID
            ty = lifted ? blockY(1) + 4 : 5
          }
        }
        const arrived = moveHand(w, tx, ty, handSpeed)
        if (arrived) {
          if (habitPull) {
            s.habitSpent = true
            events.push({ kind: 'misfire' })
            say(s, 'misfire', 0, 'The hand goes to the old place. K-lines remember towers, not arches.')
          } else if (!abl('release')) {
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
              if (e.kind === 'placedArch' && e.part !== 'span')
                say(s, `placedArch-${e.part}`, 120, 'PUT lets go. An upright stands.')
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
                s.kLines.push({ id: s.kLines.length + 1, tick: s.tick, agents: up, kind: 'tower' })
                say(s, 'kline', 80, 'A K-line has formed. The next tower will come easier.')
              }
              if (e.kind === 'archComplete') {
                say(s, 'archComplete', 80, 'An arch. FIND, GET and PUT never noticed the goal had changed.')
                s.needs.play *= 0.25
                s.needs.rest = clamp01(s.needs.rest + 0.2)
                const up = Object.entries(a)
                  .filter(([, v]) => v > 0.5)
                  .map(([k]) => k)
                s.kLines.push({ id: s.kLines.length + 1, tick: s.tick, agents: up, kind: 'arch' })
                say(s, 'kline-arch', 80, 'A K-line has formed. This society now remembers two shapes.')
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
    goal: s.goal,
    habitSpent: s.habitSpent,
    asleep: s.asleep,
    dream: s.dream,
    dreamsHad: s.dreamsHad,
    kLines: s.kLines,
    lines: s.lines,
  })
}
