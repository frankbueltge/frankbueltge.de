// src/lib/society/score.ts — the room's score: what a stranger is shown, and in what order.
//
// Frank, 2026-08-06, on the reading exit: "stell dir vor du bist besucher im zkm … du hast
// 3–5 minuten zeit … und möchtest ganz sicher keine romane lesen." He is right. The web
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

/** What lets a beat end early. 'none' means it simply runs its time. */
export type Cue =
  | 'none'
  | 'grasped'
  | 'towerComplete'
  | 'visitorPresent'
  | 'silenced'
  | 'asleep'

export interface Beat {
  id: string
  /** the intertitle, or null for a beat that is deliberately silent */
  line: string | null
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
  { id: 'open', line: 'This is a mind.', minMs: 3200, maxMs: 3600, cue: 'none' },
  {
    id: 'parts',
    line: 'It is made of parts that cannot think.',
    minMs: 4200,
    maxMs: 4600,
    cue: 'none',
  },
  { id: 'settle', line: null, minMs: 2600, maxMs: 3000, cue: 'none' },

  // ————————————————————————————————— 1 · it builds ———————————————————————
  { id: 'watch', line: 'Watch what they do together.', minMs: 3000, maxMs: 22000, cue: 'grasped' },
  {
    id: 'nobody',
    line: 'None of them knows what a tower is.',
    minMs: 4200,
    maxMs: 4800,
    cue: 'none',
  },
  { id: 'building', line: null, minMs: 2000, maxMs: 80000, cue: 'towerComplete' },
  { id: 'stands', line: 'A tower. And no one built it.', minMs: 4200, maxMs: 4800, cue: 'none' },
  { id: 'remember', line: 'It will remember this.', minMs: 3600, maxMs: 4000, cue: 'none' },

  // ————————————————————————————————— 2 · it notices you ——————————————————
  {
    id: 'noticed',
    line: 'Something out there moved.',
    minMs: 3000,
    maxMs: 26000,
    cue: 'visitorPresent',
    conditional: true,
  },
  {
    id: 'unknown',
    line: 'It cannot tell what you are.',
    minMs: 4200,
    maxMs: 4800,
    cue: 'visitorPresent',
    conditional: true,
  },

  // ————————————————————————————————— 3 · the one gesture ————————————————
  {
    id: 'invite',
    line: 'Touch a light. That part falls silent.',
    minMs: 4000,
    maxMs: 55000,
    cue: 'silenced',
  },
  {
    id: 'consequence',
    line: 'Nothing was written for this. Only the rule is gone.',
    minMs: 5000,
    maxMs: 5600,
    cue: 'silenced',
    conditional: true,
  },

  // ————————————————————————————————— 4 · it sleeps, and forgets ——————————
  {
    id: 'alone',
    line: 'Left alone, it sleeps.',
    minMs: 3600,
    maxMs: 40000,
    cue: 'asleep',
    conditional: true,
  },
  {
    id: 'dreaming',
    line: 'It is building something that is not there.',
    minMs: 5000,
    maxMs: 5600,
    cue: 'asleep',
    conditional: true,
  },
  { id: 'forget', line: 'It will not remember you.', minMs: 5200, maxMs: 5800, cue: 'none' },
]

/** Longest a full pass can take if no cue ever fires — the room must loop, not hang. */
export function worstCaseMs(): number {
  return SCORE.reduce((sum, b) => sum + b.maxMs, 0)
}

/** Shortest pass, when a visitor is quick to appear and quick to touch. */
export function bestCaseMs(): number {
  return SCORE.reduce((sum, b) => sum + b.minMs, 0)
}
