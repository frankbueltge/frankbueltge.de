// src/lib/spread/reconnect.test.ts
import { describe, expect, it } from 'vitest'

import { backoffDelayMs } from './reconnect'

describe('backoffDelayMs', () => {
  it('with no jitter (random=1), doubles each attempt up to the ceiling', () => {
    const random = () => 1
    expect(backoffDelayMs(0, { baseMs: 500, maxMs: 20_000, random })).toBe(500)
    expect(backoffDelayMs(1, { baseMs: 500, maxMs: 20_000, random })).toBe(1000)
    expect(backoffDelayMs(2, { baseMs: 500, maxMs: 20_000, random })).toBe(2000)
    expect(backoffDelayMs(3, { baseMs: 500, maxMs: 20_000, random })).toBe(4000)
  })

  it('never exceeds maxMs, however large the attempt', () => {
    const random = () => 1
    expect(backoffDelayMs(10, { baseMs: 500, maxMs: 20_000, random })).toBe(20_000)
    expect(backoffDelayMs(1000, { baseMs: 500, maxMs: 20_000, random })).toBe(20_000)
  })

  it('a negative attempt behaves like attempt 0 rather than going below the base', () => {
    const random = () => 1
    expect(backoffDelayMs(-5, { baseMs: 500, maxMs: 20_000, random })).toBe(500)
  })

  it('jitters full-range between 0 and the ceiling for that attempt', () => {
    expect(backoffDelayMs(0, { baseMs: 500, maxMs: 20_000, random: () => 0 })).toBe(0)
    expect(backoffDelayMs(0, { baseMs: 500, maxMs: 20_000, random: () => 0.5 })).toBe(250)
  })

  it('defaults to Math.random and always lands within [0, maxMs]', () => {
    for (let i = 0; i < 50; i++) {
      const delay = backoffDelayMs(6)
      expect(delay).toBeGreaterThanOrEqual(0)
      expect(delay).toBeLessThanOrEqual(20_000)
    }
  })
})
