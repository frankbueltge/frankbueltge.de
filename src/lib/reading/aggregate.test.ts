import { describe, expect, it } from 'vitest'
import { getTrendingDays } from '@/lib/trending/data'
import { READING_FLOOR, readAudience } from './aggregate'
import { readAttention } from './attention'
import { toRecordFile } from './record'
import { CURRENT_ROUND as R } from './rounds'
import { sampleReading } from './fixtures'

const attention = readAttention(R, getTrendingDays())
const recordOf = (n: number) =>
  toRecordFile(
    {
      ok: true,
      round: R.id,
      batch_size: 5,
      entries: Array.from({ length: n }, (_, i) => {
        const { round: _round, ...reading } = sampleReading(i + 1)
        return { id: `t-${i.toString(16).padStart(16, '0')}`, batch: Math.floor(i / 5) + 1, ...reading }
      }),
    },
    'test',
  )

describe('readAudience', () => {
  it('is an empty, flat reading before anyone took part, and says nothing', () => {
    const a = readAudience(R, null, attention)
    expect(a).toMatchObject({ readings: 0, choices: 0, speaks: false, loudnessCorrelation: null })
    expect(a.rank.every((r) => r.score === 50)).toBe(true)
    expect(a.estimates.every((e) => e.answered === 0)).toBe(true)
  })

  it('counts readings, decided and undecided choices, and every estimate', () => {
    const a = readAudience(R, recordOf(4), attention)
    expect(a.readings).toBe(4)
    expect(a.choices + a.undecided).toBe(4 * R.pairs_per_reading)
    expect(a.estimates.reduce((n, e) => n + e.answered + e.unknown, 0)).toBe(4 * R.estimates_per_reading)
    expect(a.rank).toHaveLength(R.matters.length)
  })

  it('ignores a record of another round', () => {
    const other = { ...recordOf(3), round: 'after-cycle-999' }
    expect(readAudience(R, other, attention).readings).toBe(0)
  })

  it('starts to word comparisons at the floor, not before', () => {
    expect(readAudience(R, recordOf(READING_FLOOR - 1), attention).speaks).toBe(false)
    expect(readAudience(R, recordOf(READING_FLOOR), attention).speaks).toBe(true)
  })
})
