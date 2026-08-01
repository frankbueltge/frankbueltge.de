import { afterEach, describe, expect, it, vi } from 'vitest'
import { jsonScriptPayload, onMotionChange, readJsonScript, reducedMotion, setVars } from './runtime'

// This repo carries no jsdom/happy-dom dependency (no existing test does) — so the DOM-touching
// helpers here are tested against lightweight fakes (a plain object shaped like the bit of the
// DOM API each function actually uses), not a real document/window.

describe('setVars', () => {
  it('calls style.setProperty once per entry — the single CSP-safe dynamic-styling path', () => {
    const calls: Array<[string, string]> = []
    const el = { style: { setProperty: (k: string, v: string) => calls.push([k, v]) } }
    setVars(el as unknown as HTMLElement, { '--dv-x': '12px', '--dv-y': '4px' })
    expect(calls).toEqual([
      ['--dv-x', '12px'],
      ['--dv-y', '4px'],
    ])
  })

  it('sets nothing for an empty vars object', () => {
    const calls: Array<[string, string]> = []
    const el = { style: { setProperty: (k: string, v: string) => calls.push([k, v]) } }
    setVars(el as unknown as HTMLElement, {})
    expect(calls).toEqual([])
  })
})

describe('readJsonScript', () => {
  it('parses the JSON payload of the named script element', () => {
    const fakeDoc = { getElementById: (id: string) => (id === 'x' ? { textContent: '{"a":1}' } : null) }
    expect(readJsonScript<{ a: number }>('x', fakeDoc)).toEqual({ a: 1 })
  })

  it('throws a clear error when the element is missing', () => {
    const fakeDoc = { getElementById: () => null }
    expect(() => readJsonScript('missing', fakeDoc)).toThrow(/no #missing payload script/)
  })

  it('throws a clear error when the element has no content', () => {
    const fakeDoc = { getElementById: () => ({ textContent: null }) }
    expect(() => readJsonScript('empty', fakeDoc)).toThrow(/no content/)
  })

  it('propagates a JSON parse error rather than swallowing it', () => {
    const fakeDoc = { getElementById: () => ({ textContent: 'not json' }) }
    expect(() => readJsonScript('bad', fakeDoc)).toThrow()
  })
})

describe('jsonScriptPayload', () => {
  it('escapes every "<" so the payload cannot close its own or a following script element', () => {
    const payload = jsonScriptPayload({ text: '</script><script>alert(1)</script>' })
    expect(payload).not.toContain('</script>')
    expect(payload).toContain('\\u003cscript')
  })

  it('round-trips through JSON.parse once un-escaped is not needed — the raw string still parses', () => {
    const payload = jsonScriptPayload({ a: 1, b: 'plain' })
    expect(JSON.parse(payload)).toEqual({ a: 1, b: 'plain' })
  })
})

describe('reducedMotion / onMotionChange (off-browser fallback)', () => {
  it('reducedMotion() is false without a window (e.g. this Node test runner)', () => {
    expect(reducedMotion()).toBe(false)
  })
  it('onMotionChange() returns a no-op unsubscribe without a window', () => {
    const unsubscribe = onMotionChange(() => {})
    expect(() => unsubscribe()).not.toThrow()
  })
})

describe('reducedMotion / onMotionChange (with a fake window.matchMedia)', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reducedMotion() reflects matchMedia(...).matches', () => {
    vi.stubGlobal('window', { matchMedia: () => ({ matches: true }) })
    expect(reducedMotion()).toBe(true)
  })

  it('onMotionChange() wires the change listener and forwards .matches', () => {
    let changeHandler: ((ev: { matches: boolean }) => void) | null = null
    const mql = {
      matches: false,
      addEventListener: (_type: string, cb: (ev: { matches: boolean }) => void) => {
        changeHandler = cb
      },
      removeEventListener: vi.fn(),
    }
    vi.stubGlobal('window', { matchMedia: () => mql })
    const seen: boolean[] = []
    const unsubscribe = onMotionChange((reduced) => seen.push(reduced))
    expect(changeHandler).not.toBeNull()
    changeHandler!({ matches: true })
    expect(seen).toEqual([true])
    unsubscribe()
    expect(mql.removeEventListener).toHaveBeenCalledTimes(1)
  })
})
