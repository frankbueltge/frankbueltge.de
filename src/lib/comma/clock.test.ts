import { describe, expect, it } from 'vitest'

import { BLOCK_MS, blockPlaying, DELAY_MS, hhmm, MINUTE_MS, playedAt, readableFrom, RETRY_SECONDS, retrySeconds, SETTLE_MS, SLACK_MS, worldAt } from './clock'

describe('the broadcast clock', () => {
  const at = (iso: string) => Date.parse(iso)

  it('plays the world ten minutes behind: a block, its settling, and a minute of slack', () => {
    expect(DELAY_MS).toBe(10 * MINUTE_MS)
    expect(DELAY_MS).toBe(BLOCK_MS + SETTLE_MS + SLACK_MS)
    expect(worldAt(at('2026-11-14T00:10:00Z'))).toBe(at('2026-11-14T00:00:00Z'))
    expect(playedAt(at('2026-11-14T00:00:00Z'))).toBe(at('2026-11-14T00:10:00Z'))
  })

  it('plays one block for five minutes, the same one for every listener', () => {
    const block = at('2026-11-13T23:35:00Z')
    expect(blockPlaying(at('2026-11-13T23:45:00Z'))).toBe(block)
    expect(blockPlaying(at('2026-11-13T23:49:59.999Z'))).toBe(block)
    expect(blockPlaying(at('2026-11-13T23:50:00Z'))).toBe(block + BLOCK_MS)
    expect(hhmm(block)).toBe('23:35')
  })

  it('can always read the block that is playing, and the next one a minute before it is due', () => {
    for (let now = at('2026-11-13T23:40:00Z'); now < at('2026-11-14T00:10:00Z'); now += 7_000) {
      const playing = blockPlaying(now)
      expect(readableFrom(playing)).toBeLessThanOrEqual(now - SLACK_MS)
      const next = playing + BLOCK_MS
      expect(playedAt(next) - readableFrom(next)).toBe(SLACK_MS)
    }
  })
})

describe('asking again', () => {
  it('asks soon after a first refusal, then every half minute', () => {
    expect([1, 2, 3, 4, 5, 50].map(retrySeconds)).toEqual([5, 10, 20, 30, 30, 30])
    expect(retrySeconds(0)).toBe(5)
    expect(RETRY_SECONDS.at(-1)).toBe(30)
  })

  it('fits four questions into the minute before a block is due', () => {
    const asked = RETRY_SECONDS.slice(0, 3).reduce((sum, s) => sum + s, 0)
    expect(asked * 1000).toBeLessThan(SLACK_MS)
  })
})
