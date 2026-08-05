// src/lib/society/moments.test.ts — a new drama cannot ship silent.

import { describe, expect, it } from 'vitest'
import { DRAMATIC_KINDS, isDramatic, momentFor, pickMoment } from './moments'
import type { WorldEvent } from './world'

const sample: Record<string, WorldEvent> = {
  misfire: { kind: 'misfire' },
  collapsed: { kind: 'collapsed', height: 3 },
  archComplete: { kind: 'archComplete' },
  towerComplete: { kind: 'towerComplete', height: 4 },
  wrecked: { kind: 'wrecked', height: 4, complete: true },
  grasped: { kind: 'grasped', block: 'b1' },
  placed: { kind: 'placed', block: 'b1', level: 0 },
  dropped: { kind: 'dropped', block: 'b1' },
  placedArch: { kind: 'placedArch', block: 'b1', part: 'left' },
}

describe('the camera looks at every drama, and only at dramas', () => {
  it('every dramatic kind has a caption — a new drama cannot ship silent', () => {
    for (const kind of DRAMATIC_KINDS) {
      const moment = momentFor(sample[kind])
      expect(moment, `no caption for "${kind}"`).not.toBeNull()
      expect(moment!.caption.length).toBeGreaterThan(5)
      expect(moment!.holdMs).toBeGreaterThan(1000)
    }
  })

  it('ordinary traffic is not interrupted by a caption', () => {
    for (const kind of ['grasped', 'placed', 'dropped', 'placedArch']) {
      expect(isDramatic(sample[kind].kind)).toBe(false)
      expect(momentFor(sample[kind])).toBeNull()
    }
  })

  it('captions stay short enough to be read inside the frame', () => {
    // the world panel is 400 units wide at ~9px type; past ~52 characters the line wraps
    // out of the picture, which is worse than saying nothing
    for (const kind of DRAMATIC_KINDS) {
      expect(momentFor(sample[kind])!.caption.length).toBeLessThanOrEqual(52)
    }
  })

  it('a tick with several dramas shows the rarer one', () => {
    // a misfire and a completed tower can land together; the misfire is the once-a-morning
    // event and must not be swallowed by the routine one
    const picked = pickMoment([sample.towerComplete, sample.misfire])
    expect(picked!.caption).toBe(momentFor(sample.misfire)!.caption)
  })

  it('a quiet tick shows nothing', () => {
    expect(pickMoment([sample.grasped, sample.placed])).toBeNull()
    expect(pickMoment([])).toBeNull()
  })

  it('the wreck caption tells finished from unfinished work', () => {
    const finished = momentFor({ kind: 'wrecked', height: 4, complete: true })!
    const unfinished = momentFor({ kind: 'wrecked', height: 2, complete: false })!
    expect(finished.caption).not.toBe(unfinished.caption)
  })
})
