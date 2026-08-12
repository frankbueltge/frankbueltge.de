// src/lib/society/room-clock.ts — the room's score machine, with no screen attached.
//
// The honesty rule of this piece is that the room never says a thing that has not happened.
// score.ts encodes which lines are claims and score.test.ts checks that they are marked as
// claims — but "marked conditional" and "never actually shown while false" are two different
// statements, and only the second one is the promise. The first staging satisfied the first
// and broke the second twice in one afternoon: it announced "a tower — and no one built it"
// over a table the wrecker had just cleared, because the beat's cue was a memory of an event
// rather than the state of the world; and it let the society fall asleep during the act
// about building, because a constant had been tuned without checking it against the score.
//
// So the machine that decides what is on screen lives here, away from the DOM, where
// room-clock.test.ts can run it against the real engine for a full pass and assert the
// promise itself: at the instant each line went up, was it true?

import { SCORE, type Beat, type Cue } from './score'

// ————————————————————————————————— the room's clock ——————————————————————
// These two numbers decide the whole shape of a pass, they are tuned against each other,
// and they live here rather than in the component so the test tunes the thing that ships.

/**
 * Playback, not physics: the society is stepped this much faster than real time, so a tower
 * that takes fifteen seconds of its time takes nine of ours. Nothing about how it decides is
 * touched — this is the speed of the projector, not of the mind.
 */
export const ROOM_RATE = 1.7

/**
 * How many ticks alone this society needs before it sleeps — bounded on BOTH sides by the
 * score, and the window is narrow:
 *
 *   · too low and it falls asleep in the middle of the act about building. At 120 the dream
 *     was drawn over a frozen hand while the room still said "none of them knows what a
 *     tower is", and the whole second turn played over a sleeper.
 *   · too high and the sleep act arrives with the society wide awake, so the turn the piece
 *     ends on never happens at all.
 *
 * Measured, not guessed: an unattended pass builds its tower by ~37s, holds the invitation
 * from ~62s to ~92s, and turns to sleep at ~98s. 1600 ticks puts that morning asleep at
 * ~94s — after the invitation has had its whole time over a society that is still working,
 * and just as the room turns to look. (At 1224 it slept at 72s and the last third of the
 * invitation was addressed to a sleeper.) room-clock.test.ts holds both ends.
 */
export const SLEEP_AFTER = 1600

/** Everything the score is allowed to know about the world. */
export interface Cues {
  /** the hand has closed on a block at least once this pass */
  grasped: boolean
  /** a finished tower is standing on the table RIGHT NOW — not "was built once" */
  towerStands: boolean
  /** something out there has moved at least once this pass */
  visitorSeen: boolean
  /** a visitor is being sensed at this moment */
  visitorPresent: boolean
  /** a part has been silenced this pass */
  silenced: boolean
  asleep: boolean
}

export const NO_CUES: Cues = {
  grasped: false,
  towerStands: false,
  visitorSeen: false,
  visitorPresent: false,
  silenced: false,
  asleep: false,
}

export interface Clock {
  index: number
  startedAt: number
  /** false while a conditional beat waits, silent, for the thing it claims */
  lineShown: boolean
  /** the sleep act's window closed with the society awake and someone still there */
  stayedAwake: boolean
  /** the pass has run out of beats: the room goes quiet and waits for someone */
  finished: boolean
}

export function startPass(now: number): Clock {
  return { index: 0, startedAt: now, lineShown: !SCORE[0].conditional, stayedAwake: false, finished: false }
}

/**
 * `stayedAwake` is the one cue the world cannot report, because it is not a fact about the
 * world: it is a fact about this pass — that the sleep act's window closed with the society
 * awake and someone still in front of it. So it is read off the clock, not off the cues.
 */
export function cueMet(cue: Cue, c: Cues, clock: Clock): boolean {
  switch (cue) {
    case 'none':
      return false
    case 'grasped':
      return c.grasped
    case 'towerComplete':
      return c.towerStands
    case 'visitorPresent':
      return c.visitorSeen
    case 'silenced':
      return c.silenced
    case 'asleep':
      return c.asleep
    case 'stayedAwake':
      return clock.stayedAwake
  }
}

/** The beat currently running, whether or not its line is up. */
export function currentBeat(c: Clock): Beat {
  return SCORE[Math.min(c.index, SCORE.length - 1)]
}

/** What is on screen: the line, or null for a composed silence. */
export function shownLine(c: Clock): string | null {
  if (c.finished) return null
  const beat = currentBeat(c)
  return c.lineShown ? beat.line : null
}

export interface Step {
  /** the beat changed, or a waiting conditional line just went up */
  changed: boolean
}

/**
 * Move the score on by one frame. `now` is a monotonic clock in milliseconds; the caller
 * owns it, so a test can run a whole pass in a loop without waiting for it.
 */
export function advance(c: Clock, now: number, cues: Cues): Step {
  if (c.finished) return { changed: false }
  const beat = currentBeat(c)

  // a conditional line waits, silent, for the thing it claims — and if that never happens
  // it is never said. Its clock starts when the cue does.
  if (beat.conditional && !c.lineShown) {
    if (cueMet(beat.cue, cues, c)) {
      c.lineShown = true
      c.startedAt = now
      return { changed: true }
    }
    if (now - c.startedAt >= beat.maxMs) return next(c, now, cues)
    return { changed: false }
  }

  // A claim is RETRACTED the moment it stops being true, even before it has had its minimum
  // time. "A tower. And no one built it." stayed up for its full four seconds while the
  // wrecker cleared the table underneath it, and an empty table under that sentence reads as
  // a broken installation rather than as a piece about towers that fall. Losing the rest of
  // the reading time is the cheaper mistake: the visitor saw the tower and saw it go, which
  // is truer than either on its own.
  if (beat.conditional && c.lineShown && !cueMet(beat.cue, cues, c)) {
    return next(c, now, cues)
  }

  const elapsed = now - c.startedAt
  if (elapsed >= beat.maxMs || (elapsed >= beat.minMs && cueMet(beat.cue, cues, c))) {
    return next(c, now, cues)
  }
  return { changed: false }
}

function next(c: Clock, now: number, cues: Cues): Step {
  // Leaving the sleep beat unslept is itself a fact, and the fact the other ending needs.
  // It takes a visitor who is STILL THERE: "you keep it awake" said to an empty room is the
  // same lie in the other direction, so someone who walked off during the invitation gets
  // neither ending and the pass simply closes.
  if (currentBeat(c).id === 'alone' && !cues.asleep && cues.visitorPresent) {
    c.stayedAwake = true
  }
  c.index++
  if (c.index >= SCORE.length) {
    c.finished = true
    return { changed: true }
  }
  c.startedAt = now
  c.lineShown = !SCORE[c.index].conditional
  return { changed: true }
}
