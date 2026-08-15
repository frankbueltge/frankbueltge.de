// src/lib/society/score.ts — the room's score: what a stranger is shown, and in what order.
//
// Frank, 2026-08-06, on the reading exit (wording private): picture a visitor at the ZKM with
// three to five minutes, who certainly does not want to read essays. He is right. The web
// page explains; a room cannot. So the room says ONE short line at a time, over a society
// that is doing the thing the line is about, and it says nothing at all in between.
//
// The score is DATA rather than a switch statement in the renderer, for the same reason the
// camera's captions are (moments.ts): so score.test.ts can hold it to the room's rules —
// every line short enough to read from across a room, every beat unable to stall the loop,
// and the arc actually containing its five turns. A beat that cannot be read in one breath
// is a beat that fails in a room, and the test is what says so.
//
// The arc, in about four minutes:
//   0 · here is a mind, and its parts cannot think
//   1 · watch them build something none of them understands
//   2 · it notices you, and cannot tell what you are
//   3 · take a part away, and hear what it costs      ← the one gesture
//   4 · left alone it sleeps, and builds what is not there — and forgets you
//
// The fourth turn has two endings, because it has two truths: a visitor who stands still
// lets the society sleep, and a visitor who keeps moving keeps it awake. The room says
// whichever happened and never the other one.

/** What lets a beat end early. 'none' means it simply runs its time. */
export type Cue =
  | 'none'
  | 'grasped'
  | 'towerComplete'
  | 'visitorPresent'
  | 'silenced'
  | 'asleep'
  /**
   * The sleep act's other outcome. A visitor who keeps moving keeps the society awake —
   * `aloneTicks` resets on every frame they are seen — so "left alone, it sleeps" simply
   * never becomes true for them, and the first staging answered that with eighty seconds
   * of blank screen. Both endings are true; the room needs the one that happened.
   */
  | 'stayedAwake'

/**
 * How a line is set. A room has no headings, no rules and no white space to build hierarchy
 * out of, so weight IS the hierarchy — and it belongs in the score rather than in the
 * stylesheet, because it is a dramaturgical decision about which sentence carries the piece,
 * not a decision about type. Five registers, no more: a stranger reads emphasis, not a scale.
 */
export type Weight =
  /** the two sentences the piece is built on */
  | 'title'
  /** ordinary narration */
  | 'plain'
  /** an aside — smaller, dimmer, said almost to itself */
  | 'quiet'
  /** the one instruction, and the only line the visitor is asked to act on */
  | 'invite'
  /** the last line of the loop, set apart because forgetting is the point */
  | 'final'

export interface Beat {
  id: string
  /** the intertitle, or null for a beat that is deliberately silent */
  line: string | null
  /** how it is set; silent beats leave it out */
  weight?: Weight
  /** shown for at least this long, so a fast cue cannot flash the line away */
  minMs: number
  /** and never longer than this, so no beat can hold the room hostage */
  maxMs: number
  /** what ends the beat early, once minMs has passed */
  cue: Cue
  /**
   * A line that would be a LIE unless its cue has fired. "Something out there moved" must
   * not appear in an empty room; "left alone, it sleeps" must not appear over a society
   * that is wide awake. A conditional beat stays silent until its cue is true, and if the
   * cue never comes it says nothing at all and the room moves on. (Caught in the first
   * run of the room: the empty-gallery pass claimed a visitor who was not there.)
   */
  conditional?: true
}

export const SCORE: readonly Beat[] = [
  // ————————————————————————————————— 0 · what this is ————————————————————
  { id: 'open', line: 'This is a mind.', weight: 'title', minMs: 3200, maxMs: 3600, cue: 'none' },
  {
    id: 'parts',
    line: 'It is made of parts that cannot think.',
    weight: 'plain',
    minMs: 4200,
    maxMs: 4600,
    cue: 'none',
  },
  { id: 'settle', line: null, minMs: 2600, maxMs: 3000, cue: 'none' },

  // ————————————————————————————————— 1 · it builds ———————————————————————
  {
    id: 'watch',
    line: 'Watch what they do together.',
    weight: 'plain',
    minMs: 3000,
    maxMs: 22000,
    cue: 'grasped',
  },
  {
    id: 'nobody',
    line: 'None of them knows what a tower is.',
    weight: 'plain',
    minMs: 4200,
    maxMs: 4800,
    cue: 'none',
  },
  { id: 'building', line: null, minMs: 2000, maxMs: 40000, cue: 'towerComplete' },
  // Both of these assert a tower, so both wait for one. A society whose WRECKER wins the
  // morning, or that is put to sleep before it finishes, builds nothing — and the room that
  // announced "a tower" over an empty table would be making the piece's central claim up.
  {
    id: 'stands',
    line: 'A tower. And no one built it.',
    weight: 'title',
    minMs: 4200,
    maxMs: 4800,
    cue: 'towerComplete',
    conditional: true,
  },
  {
    id: 'remember',
    line: 'It will remember this.',
    weight: 'quiet',
    minMs: 3600,
    maxMs: 4000,
    cue: 'towerComplete',
    conditional: true,
  },

  // ————————————————————————————————— 2 · it notices you ——————————————————
  {
    id: 'noticed',
    line: 'Something out there moved.',
    weight: 'quiet',
    minMs: 3000,
    maxMs: 12000,
    cue: 'visitorPresent',
    conditional: true,
  },
  {
    id: 'unknown',
    line: 'It cannot tell what you are.',
    weight: 'plain',
    minMs: 4200,
    maxMs: 4800,
    cue: 'visitorPresent',
    conditional: true,
  },

  // ————————————————————————————————— 3 · the one gesture ————————————————
  {
    id: 'invite',
    line: 'Touch a light. That part falls silent.',
    weight: 'invite',
    minMs: 4000,
    maxMs: 30000,
    cue: 'silenced',
  },
  {
    id: 'consequence',
    line: 'Nothing was written for this. Only the rule is gone.',
    weight: 'plain',
    minMs: 5000,
    maxMs: 5600,
    cue: 'silenced',
    conditional: true,
  },

  // ————————————————————————————————— 4 · it sleeps, and forgets ——————————
  // Two endings, and the room takes whichever actually happened. A visitor who stands still
  // lets the society fall asleep and dream; a visitor who keeps moving keeps it awake, and
  // is told THAT instead. Neither line may be said unless it is true, so both are
  // conditional and a pass that somehow earns neither simply goes quiet and loops.
  {
    id: 'alone',
    line: 'Left alone, it sleeps.',
    weight: 'quiet',
    minMs: 3600,
    maxMs: 16000,
    cue: 'asleep',
    conditional: true,
  },
  {
    id: 'dreaming',
    line: 'It is building something that is not there.',
    weight: 'plain',
    minMs: 5000,
    maxMs: 5600,
    cue: 'asleep',
    conditional: true,
  },
  {
    id: 'awake',
    line: 'You keep it awake.',
    weight: 'quiet',
    minMs: 3400,
    maxMs: 3800,
    cue: 'stayedAwake',
    conditional: true,
  },
  {
    id: 'forget',
    line: 'It will not remember you.',
    weight: 'final',
    minMs: 5200,
    maxMs: 5800,
    cue: 'none',
  },
]

/** Longest a full pass can take if no cue ever fires — the room must loop, not hang. */
export function worstCaseMs(): number {
  return SCORE.reduce((sum, b) => sum + b.maxMs, 0)
}

/** Shortest pass, when a visitor is quick to appear and quick to touch. */
export function bestCaseMs(): number {
  return SCORE.reduce((sum, b) => sum + b.minMs, 0)
}
