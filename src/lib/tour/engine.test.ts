import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  ensureFigureReadyListener,
  getFigure,
  interactionMode,
  nextScene,
  registerFigure,
  resetFigureReadyBinding,
  resetFigureRegistry,
  sceneFromEntries,
  SHORT_VIEWPORT_PX,
  type FigureHandle,
  type SceneIntersection,
} from './engine'

describe('sceneFromEntries', () => {
  it('returns null when nothing intersects — the caller keeps the previously active scene', () => {
    const entries: SceneIntersection[] = [
      { id: 'a', isIntersecting: false, top: -400 },
      { id: 'b', isIntersecting: false, top: 200 },
    ]
    expect(sceneFromEntries(entries)).toBeNull()
  })

  it('returns the sole intersecting scene', () => {
    const entries: SceneIntersection[] = [
      { id: 'a', isIntersecting: false, top: -400 },
      { id: 'b', isIntersecting: true, top: 10 },
    ]
    expect(sceneFromEntries(entries)).toBe('b')
  })

  it('when several intersect at once, the one nearest the center line (top closest to 0) wins', () => {
    const entries: SceneIntersection[] = [
      { id: 'a', isIntersecting: true, top: -30 },
      { id: 'b', isIntersecting: true, top: 5 },
    ]
    expect(sceneFromEntries(entries)).toBe('b')
  })

  it('an empty entries list returns null', () => {
    expect(sceneFromEntries([])).toBeNull()
  })
})

describe('nextScene', () => {
  it('steps forward and backward within range', () => {
    expect(nextScene(2, 1, 5)).toBe(3)
    expect(nextScene(2, -1, 5)).toBe(1)
  })

  it('clamps at the last index — stepping past it is a no-op', () => {
    expect(nextScene(4, 1, 5)).toBe(4)
  })

  it('clamps at the first index — stepping before it is a no-op', () => {
    expect(nextScene(0, -1, 5)).toBe(0)
  })

  it('a zero-scene tour never steps anywhere', () => {
    expect(nextScene(0, 1, 0)).toBe(0)
  })
})

describe('interactionMode', () => {
  it('reduced motion always yields steps mode, regardless of pointer/viewport', () => {
    expect(interactionMode({ reduced: true, coarse: false, viewportH: 1200 })).toBe('steps')
    expect(interactionMode({ reduced: true, coarse: true, viewportH: 1200 })).toBe('steps')
  })

  it('a coarse pointer on a short viewport yields steps mode', () => {
    expect(interactionMode({ reduced: false, coarse: true, viewportH: SHORT_VIEWPORT_PX - 1 })).toBe('steps')
  })

  it('a coarse pointer on a tall-enough viewport stays scroll mode', () => {
    expect(interactionMode({ reduced: false, coarse: true, viewportH: SHORT_VIEWPORT_PX })).toBe('scroll')
  })

  it('a fine pointer stays scroll mode even on a short viewport', () => {
    expect(interactionMode({ reduced: false, coarse: false, viewportH: 300 })).toBe('scroll')
  })

  it('the ordinary desktop case (fine pointer, tall viewport) is scroll mode', () => {
    expect(interactionMode({ reduced: false, coarse: false, viewportH: 900 })).toBe('scroll')
  })
})

describe('figure-ready registry', () => {
  beforeEach(() => {
    resetFigureRegistry()
    resetFigureReadyBinding()
  })

  it('getFigure returns undefined before any figure registers', () => {
    expect(getFigure('fig-1')).toBeUndefined()
  })

  it('registerFigure makes a figure findable by id', () => {
    const handle: FigureHandle = { id: 'fig-1', apply: vi.fn() }
    registerFigure(handle)
    expect(getFigure('fig-1')).toBe(handle)
  })

  it('registering a second figure under the same id replaces the first', () => {
    const first: FigureHandle = { id: 'fig-1', apply: vi.fn() }
    const second: FigureHandle = { id: 'fig-1', apply: vi.fn() }
    registerFigure(first)
    registerFigure(second)
    expect(getFigure('fig-1')).toBe(second)
  })

  it('ensureFigureReadyListener binds exactly once per target, even across many callers', () => {
    const target = { addEventListener: vi.fn(), removeEventListener: vi.fn() }
    ensureFigureReadyListener(target as unknown as EventTarget)
    ensureFigureReadyListener(target as unknown as EventTarget)
    ensureFigureReadyListener(target as unknown as EventTarget)
    expect(target.addEventListener).toHaveBeenCalledTimes(1)
    expect(target.addEventListener).toHaveBeenCalledWith('dv:figure-ready', expect.any(Function))
  })

  it('a real dv:figure-ready dispatch on the bound target registers the figure', () => {
    const target = new EventTarget()
    ensureFigureReadyListener(target)
    const handle: FigureHandle = { id: 'fig-1', apply: vi.fn() }
    target.dispatchEvent(new CustomEvent('dv:figure-ready', { detail: handle }))
    expect(getFigure('fig-1')).toBe(handle)
  })

  it('a figure registering AFTER the listener is bound is still found (the ordinary race order)', () => {
    const target = new EventTarget()
    ensureFigureReadyListener(target)
    expect(getFigure('late')).toBeUndefined()
    target.dispatchEvent(new CustomEvent('dv:figure-ready', { detail: { id: 'late', apply: vi.fn() } }))
    expect(getFigure('late')).toBeDefined()
  })
})
