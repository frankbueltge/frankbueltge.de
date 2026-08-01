import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activatePanel,
  buildSegments,
  deactivatePanel,
  dispatchPanelKey,
  ensurePanelKeydownListener,
  isPanelActive,
  positionLabel,
  resetPanelKeydownBinding,
  resetPanelRegistry,
  step,
  type PanelKeyHandlers,
} from './stepper'

interface Landing {
  voice: string
  n: number
}

/** Mirrors Partitur.astro's flat array shape: built voice-by-voice, so each voice's items are
 *  one contiguous run — buildSegments's documented precondition. */
function flatFixture(): Landing[] {
  const voices = ['atelier', 'field', 'studio', 'plenum']
  const counts: Record<string, number> = { atelier: 5, field: 27, studio: 3, plenum: 9 }
  const flat: Landing[] = []
  for (const v of voices) for (let i = 0; i < counts[v]; i++) flat.push({ voice: v, n: i })
  return flat
}

describe('buildSegments', () => {
  it('partitions a flat, pre-grouped list into [start, end) ranges per key', () => {
    const s = buildSegments(flatFixture(), (l) => l.voice)
    expect(s.segments.atelier).toEqual({ start: 0, end: 5 })
    expect(s.segments.field).toEqual({ start: 5, end: 32 })
    expect(s.segments.studio).toEqual({ start: 32, end: 35 })
    expect(s.segments.plenum).toEqual({ start: 35, end: 44 })
  })

  it('a single-key list yields one segment spanning everything', () => {
    const s = buildSegments(['a', 'a', 'a'], (x) => x)
    expect(s.segments.a).toEqual({ start: 0, end: 3 })
  })

  it('empty input yields no segments', () => {
    const s = buildSegments<string>([], (x) => x)
    expect(s.segments).toEqual({})
  })

  it('documents the caller-error case: a key resurfacing after a different run keeps only the LATER segment', () => {
    // input is NOT pre-grouped (a→b→a) — a caller error under this module's contract, but the
    // behavior must stay predictable rather than throwing somewhere deep in a consumer.
    const s = buildSegments(['a', 'b', 'a'], (x) => x)
    expect(s.segments.a).toEqual({ start: 2, end: 3 }) // the SECOND run, not the first
    expect(s.segments.b).toEqual({ start: 1, end: 2 })
  })
})

describe('step', () => {
  const s = buildSegments(flatFixture(), (l) => l.voice)

  it('steps forward and backward within a segment', () => {
    expect(step(s, 10, 1)).toBe(11) // mid-field
    expect(step(s, 10, -1)).toBe(9)
  })

  it('clamps at the segment end — stepping past it is a no-op', () => {
    expect(step(s, 31, 1)).toBe(31) // 31 is field's last index (end=32, exclusive)
  })

  it('clamps at the segment start — stepping before it is a no-op', () => {
    expect(step(s, 5, -1)).toBe(5) // 5 is field's first index
  })

  it('never crosses into a neighboring segment', () => {
    // one step past field's last index would land on studio's first index if unclamped
    expect(step(s, 31, 1)).not.toBe(32)
  })

  it('an out-of-range pos is returned unchanged (no segment owns it)', () => {
    expect(step(s, 999, 1)).toBe(999)
  })
})

describe('positionLabel', () => {
  const s = buildSegments(flatFixture(), (l) => l.voice)

  it('formats "X/Y in {key}" for the position within its segment', () => {
    // field spans [5, 32); index 18 is the 14th item in that run (18 - 5 + 1 = 14 of 27)
    expect(positionLabel(s, 18)).toBe('14/27 in field')
  })

  it('composes a caller-supplied finer fragment via `within` — Partitur.astro\'s exact two-level readout', () => {
    expect(positionLabel(s, 18, '2/3 this day')).toBe('2/3 this day · 14/27 in field')
  })

  it('returns just `within` (or empty) for a position with no owning segment', () => {
    expect(positionLabel(s, 999, 'orphan')).toBe('orphan')
    expect(positionLabel(s, 999)).toBe('')
  })
})

// ---------------------------------------------------------------------------------------------
// Panel keydown registry — the critical fix: only ONE panel (the currently active one) ever
// responds to a keypress, even with several DetailPanel instances registering over time.

function fakeHandlers(): PanelKeyHandlers & { calls: string[] } {
  const calls: string[] = []
  return {
    calls,
    onPrev: () => calls.push('prev'),
    onNext: () => calls.push('next'),
    onClose: () => calls.push('close'),
  }
}

function fakeEvent(key: string) {
  let prevented = false
  return { key, preventDefault: () => { prevented = true }, get prevented() { return prevented } }
}

describe('panel keydown registry', () => {
  beforeEach(() => {
    resetPanelRegistry()
    resetPanelKeydownBinding()
  })

  it('dispatches nothing when no panel is active', () => {
    expect(() => dispatchPanelKey(fakeEvent('ArrowRight'))).not.toThrow()
  })

  it('routes Escape/ArrowLeft/ArrowRight to the active panel', () => {
    const a = fakeHandlers()
    activatePanel(a)
    dispatchPanelKey(fakeEvent('ArrowRight'))
    dispatchPanelKey(fakeEvent('ArrowLeft'))
    dispatchPanelKey(fakeEvent('Escape'))
    expect(a.calls).toEqual(['next', 'prev', 'close'])
  })

  it('preventDefault is called for arrow keys but not for Escape', () => {
    const a = fakeHandlers()
    activatePanel(a)
    const right = fakeEvent('ArrowRight')
    dispatchPanelKey(right)
    expect(right.prevented).toBe(true)
    const esc = fakeEvent('Escape')
    dispatchPanelKey(esc)
    expect(esc.prevented).toBe(false)
  })

  it('THE FIX: registering a second panel as active means the first no longer responds', () => {
    const first = fakeHandlers()
    const second = fakeHandlers()
    activatePanel(first)
    activatePanel(second) // e.g. a second DetailPanel instance opens
    dispatchPanelKey(fakeEvent('ArrowRight'))
    expect(first.calls).toEqual([])
    expect(second.calls).toEqual(['next'])
  })

  it('deactivatePanel only clears its OWN handlers, never a panel that superseded it', () => {
    const first = fakeHandlers()
    const second = fakeHandlers()
    activatePanel(first)
    activatePanel(second)
    deactivatePanel(first) // first's own close-cleanup runs after it was already superseded
    dispatchPanelKey(fakeEvent('ArrowRight'))
    expect(second.calls).toEqual(['next']) // second is still active — untouched by first's cleanup
  })

  it('deactivating the currently active panel clears it — nothing responds after', () => {
    const only = fakeHandlers()
    activatePanel(only)
    deactivatePanel(only)
    dispatchPanelKey(fakeEvent('ArrowRight'))
    expect(only.calls).toEqual([])
  })

  it('ignores unrelated keys', () => {
    const a = fakeHandlers()
    activatePanel(a)
    dispatchPanelKey(fakeEvent('Tab'))
    expect(a.calls).toEqual([])
  })
})

describe('isPanelActive', () => {
  beforeEach(() => {
    resetPanelRegistry()
  })

  it('is false when no panel is active', () => {
    expect(isPanelActive()).toBe(false)
  })

  it('is true once a panel activates, false again once it deactivates', () => {
    const a = fakeHandlers()
    activatePanel(a)
    expect(isPanelActive()).toBe(true)
    deactivatePanel(a)
    expect(isPanelActive()).toBe(false)
  })
})

describe('ensurePanelKeydownListener', () => {
  beforeEach(() => {
    resetPanelRegistry()
    resetPanelKeydownBinding()
  })

  it('binds exactly once per target, even across many DetailPanel instances calling it', () => {
    const target = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
    ensurePanelKeydownListener(target as unknown as EventTarget)
    ensurePanelKeydownListener(target as unknown as EventTarget)
    ensurePanelKeydownListener(target as unknown as EventTarget)
    expect(target.addEventListener).toHaveBeenCalledTimes(1)
    expect(target.addEventListener).toHaveBeenCalledWith('keydown', dispatchPanelKey)
  })

  it('a real EventTarget dispatch reaches the active panel through the single bound listener', () => {
    const target = new EventTarget()
    ensurePanelKeydownListener(target)
    const a = fakeHandlers()
    activatePanel(a)
    const ev = Object.assign(new Event('keydown'), { key: 'ArrowRight' })
    target.dispatchEvent(ev)
    expect(a.calls).toEqual(['next'])
  })
})
