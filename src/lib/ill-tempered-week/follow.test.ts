// How a score follows its player, without a browser: a player and animation frames made by hand.
import { describe, expect, it } from 'vitest'

import { followAudio, type AudioLike, type Frames } from './follow'

function player(start = 0, paused = true) {
  const listeners = new Map<string, Set<() => void>>()
  const audio: AudioLike & { emit(type: string): void; count(): number } = {
    currentTime: start,
    paused,
    addEventListener: (type, fn) => void (listeners.get(type) ?? listeners.set(type, new Set()).get(type)!).add(fn),
    removeEventListener: (type, fn) => void listeners.get(type)?.delete(fn),
    emit: (type) => [...(listeners.get(type) ?? [])].forEach((fn) => fn()),
    count: () => [...listeners.values()].reduce((n, s) => n + s.size, 0),
  }
  return audio
}

/** Animation frames that run only when the test says so; `suspended` never runs any, like a pane that is not shown. */
function frames() {
  let next = 1
  const pending = new Map<number, () => void>()
  const f: Frames & { run(): void; pending(): number } = {
    request: (cb) => {
      pending.set(next, cb)
      return next++
    },
    cancel: (id) => void pending.delete(id),
    run: () => {
      const now = [...pending.entries()]
      pending.clear()
      now.forEach(([, cb]) => cb())
    },
    pending: () => pending.size,
  }
  return f
}

const follower = () => {
  const times: number[] = []
  const playing: boolean[] = []
  let started = 0
  return { times, playing, started: () => started, on: { time: (t: number) => void times.push(t), playing: (p: boolean) => void playing.push(p), started: () => void started++ } }
}

describe('a score following its player', () => {
  it('moves with the player’s own timeupdate while it plays, even when no animation frame ever runs', () => {
    const audio = player()
    const f = frames()
    const seen = follower()
    followAudio(audio, seen.on, f)
    audio.paused = false
    audio.emit('play')
    audio.currentTime = 216.3
    audio.emit('timeupdate')
    audio.currentTime = 216.55
    audio.emit('timeupdate')
    // not one frame ran: the pane was not shown
    expect(seen.times).toEqual([216.3, 216.55])
    expect(seen.playing).toEqual([true])
    expect(seen.started()).toBe(1)
  })

  it('glides with every animation frame where frames run, and asks for none after a pause', () => {
    const audio = player()
    const f = frames()
    const seen = follower()
    followAudio(audio, seen.on, f)
    audio.paused = false
    audio.emit('play')
    audio.currentTime = 1
    f.run()
    audio.currentTime = 1.016
    f.run()
    expect(seen.times).toEqual([1, 1.016])
    expect(f.pending()).toBe(1)
    audio.paused = true
    audio.emit('pause')
    expect(f.pending()).toBe(0)
    expect(seen.playing).toEqual([true, false])
    expect(seen.times.at(-1)).toBe(1.016)
  })

  it('asks for no frames at all under reduced motion, and steps with timeupdate', () => {
    const audio = player()
    const seen = follower()
    followAudio(audio, seen.on, null)
    audio.paused = false
    audio.emit('play')
    audio.currentTime = 3
    audio.emit('timeupdate')
    expect(seen.times).toEqual([3])
  })

  it('moves on a seek while paused', () => {
    const audio = player()
    const seen = follower()
    followAudio(audio, seen.on, frames())
    audio.currentTime = 80
    audio.emit('seeked')
    expect(seen.times).toEqual([80])
    expect(seen.playing).toEqual([])
  })

  it('picks up a piece that already plays, or was already moved, when the score arrives', () => {
    const playingAlready = player(42, false)
    const f = frames()
    const a = follower()
    followAudio(playingAlready, a.on, f)
    expect(a.playing).toEqual([true])
    expect(f.pending()).toBe(1)

    const moved = player(12, true)
    const b = follower()
    followAudio(moved, b.on, frames())
    expect(b.times).toEqual([12])

    const untouched = player(0, true)
    const c = follower()
    followAudio(untouched, c.on, frames())
    expect(c.times).toEqual([])
  })

  it('lets go of the player and of its frame when it stops following', () => {
    const audio = player()
    const f = frames()
    const seen = follower()
    const stop = followAudio(audio, seen.on, f)
    audio.paused = false
    audio.emit('play')
    stop()
    expect(audio.count()).toBe(0)
    expect(f.pending()).toBe(0)
    audio.emit('timeupdate')
    expect(seen.times).toEqual([])
  })
})
