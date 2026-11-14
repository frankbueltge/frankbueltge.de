// src/lib/ill-tempered-week/follow.ts — how a score follows its player (2026-11-14).
//
// Two clocks move the playhead. While the piece plays, every animation frame reads the player's time, so the line
// glides. The player's own `timeupdate` (about four a second) moves it too, always: a browser may suspend animation
// frames while the audio plays on (a tab in the background, a pane that is not shown, a power-saving mode), and found
// on 2026-11-14 on the live page, a score that listened to frames alone then stood still under a playing piece.
// Under reduced motion no frames are asked for at all, and the playhead steps with `timeupdate`.
//
// Written against the two small shapes below, not against the DOM, so the rule is tested without a browser.

export interface AudioLike {
  currentTime: number
  paused: boolean
  addEventListener(type: string, listener: () => void): void
  removeEventListener(type: string, listener: () => void): void
}

/** The browser's animation frames; null where none are wanted (reduced motion) or none exist. */
export interface Frames {
  request(callback: () => void): number
  cancel(id: number): void
}

export interface Follower {
  /** the player's time, whenever either clock reads it */
  time(t: number): void
  /** the piece started or stopped */
  playing(playing: boolean): void
  /** the piece started (before `playing(true)`): the place to stop the page's other players */
  started?(): void
}

/** Follows a player until the returned function is called. */
export function followAudio(audio: AudioLike, on: Follower, frames: Frames | null): () => void {
  let frame = 0
  let asked = false
  const stopFrames = () => {
    if (asked) frames?.cancel(frame)
    asked = false
  }
  const tick = () => {
    on.time(audio.currentTime)
    frame = frames!.request(tick)
  }
  const onPlay = () => {
    on.started?.()
    on.playing(true)
    stopFrames()
    if (frames) {
      frame = frames.request(tick)
      asked = true
    }
  }
  const onStop = () => {
    on.playing(false)
    stopFrames()
    on.time(audio.currentTime)
  }
  const onTime = () => on.time(audio.currentTime)
  const listeners: [string, () => void][] = [
    ['play', onPlay],
    ['pause', onStop],
    ['ended', onStop],
    ['seeked', onTime],
    ['timeupdate', onTime],
  ]
  for (const [type, listener] of listeners) audio.addEventListener(type, listener)
  // a piece already playing when the score arrives, or already moved from its start
  if (!audio.paused) onPlay()
  else if (audio.currentTime > 0) on.time(audio.currentTime)
  return () => {
    stopFrames()
    for (const [type, listener] of listeners) audio.removeEventListener(type, listener)
  }
}
