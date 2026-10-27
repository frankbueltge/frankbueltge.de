import { describe, expect, it } from 'vitest'
import { isOptedOut, OPT_OUT_KEY, optIn, optOut } from './opt-out'

/** A stand-in for window.localStorage. */
function memoryStorage(initial: Record<string, string> = {}) {
  const entries = new Map(Object.entries(initial))
  return {
    getItem: (key: string) => entries.get(key) ?? null,
    setItem: (key: string, value: string) => void entries.set(key, String(value)),
    removeItem: (key: string) => void entries.delete(key),
    entries,
  }
}

describe('the opt-out entry', () => {
  it("is Umami's own key", () => {
    expect(OPT_OUT_KEY).toBe('umami.disabled')
  })

  it('leaves a browser counted until it is set', () => {
    expect(isOptedOut(memoryStorage())).toBe(false)
  })

  it('stops the count when set, and restores it when removed', () => {
    const storage = memoryStorage()
    optOut(storage)
    expect(isOptedOut(storage)).toBe(true)
    optIn(storage)
    expect(isOptedOut(storage)).toBe(false)
    expect(storage.entries.size).toBe(0)
  })

  it('reads any non-empty value as off, as the tracker does', () => {
    expect(isOptedOut(memoryStorage({ [OPT_OUT_KEY]: 'true' }))).toBe(true)
    expect(isOptedOut(memoryStorage({ [OPT_OUT_KEY]: '' }))).toBe(false)
  })

  it('touches no other entry', () => {
    const storage = memoryStorage({ 'fb-home-visits': '{"ref":null,"seen":1}' })
    optOut(storage)
    optIn(storage)
    expect([...storage.entries.keys()]).toEqual(['fb-home-visits'])
  })

  it('reports a storage it cannot read as counted', () => {
    expect(isOptedOut(null)).toBe(false)
    const blocked = {
      getItem: () => {
        throw new Error('SecurityError')
      },
    }
    expect(isOptedOut(blocked)).toBe(false)
  })
})
