import { describe, expect, it } from 'vitest'
import { choicesOf, ties, undecided, validateReading, type EstimateTuple, type VoteTuple } from './reading'
import { CURRENT_ROUND as R } from './rounds'
import { sampleReading } from './fixtures'

describe('validateReading', () => {
  it('accepts a reading drawn the way the page draws it', () => {
    const r = sampleReading()
    expect(validateReading(r, R)).toEqual({ ok: true, value: r })
  })

  it('needs to know whether the reader saw the three readings first', () => {
    const { primed: _primed, ...rest } = sampleReading()
    expect(validateReading(rest, R)).toEqual({ ok: false, reason: 'primed' })
    expect(validateReading({ ...sampleReading(), primed: 'yes' }, R)).toEqual({ ok: false, reason: 'primed' })
  })

  it('refuses another round or another consent text', () => {
    expect(validateReading({ ...sampleReading(), round: 'after-cycle-009' }, R)).toEqual({ ok: false, reason: 'round' })
    expect(validateReading({ ...sampleReading(), consent: '2020-01-01' }, R)).toEqual({ ok: false, reason: 'consent' })
  })

  it('refuses too few choices, an unknown matter, a matter against itself and a pair twice', () => {
    const r = sampleReading()
    expect(validateReading({ ...r, votes: r.votes.slice(1) }, R).ok).toBe(false)
    const unknown = structuredClone(r)
    unknown.votes[0]![0] = 'atlantis'
    expect(validateReading(unknown, R)).toEqual({ ok: false, reason: 'votes' })
    const self = structuredClone(r)
    self.votes[0]![1] = self.votes[0]![0]
    expect(validateReading(self, R)).toEqual({ ok: false, reason: 'votes' })
    const twice = structuredClone(r)
    twice.votes[1] = [twice.votes[0]![1], twice.votes[0]![0], 0, 100]
    expect(validateReading(twice, R)).toEqual({ ok: false, reason: 'votes' })
  })

  it('refuses a pick that is not left, right, equal or "can\'t say", and a time that is not a time', () => {
    const r = structuredClone(sampleReading())
    ;(r.votes[0] as unknown[])[2] = 3
    expect(validateReading(r, R).ok).toBe(false)
    const slow = structuredClone(sampleReading())
    slow.votes[0]![3] = -5
    expect(validateReading(slow, R).ok).toBe(false)
  })

  it('refuses an estimate asked twice, an unknown estimate, and an answer outside its range', () => {
    const r = sampleReading()
    const twice = structuredClone(r)
    twice.estimates[1] = [twice.estimates[0]![0], 1, 10]
    expect(validateReading(twice, R)).toEqual({ ok: false, reason: 'estimates' })
    const unknown = structuredClone(r)
    unknown.estimates[0] = ['moon-landings', 1, 10]
    expect(validateReading(unknown, R)).toEqual({ ok: false, reason: 'estimates' })
    const pct = R.estimates.find((e) => e.kind === 'percent')!
    const others = R.estimates.filter((e) => e.id !== pct.id).slice(0, R.estimates_per_reading - 1)
    const out: EstimateTuple[] = [[pct.id, 101, 10], ...others.map((e): EstimateTuple => [e.id, null, 10])]
    expect(validateReading({ ...r, estimates: out }, R)).toEqual({ ok: false, reason: 'estimates' })
  })
})

describe('choicesOf and undecided', () => {
  it('turns picks into winners and losers, keeps a tie as a tie and leaves "can\'t say" out', () => {
    const votes: VoteTuple[] = [
      ['a', 'b', 0, 1],
      ['c', 'd', 1, 1],
      ['e', 'f', null, 1],
      ['g', 'h', 2, 1],
    ]
    expect(choicesOf(votes)).toEqual([
      { winner: 'a', loser: 'b' },
      { winner: 'd', loser: 'c' },
      { winner: 'g', loser: 'h', tie: true },
    ])
    expect(undecided(votes)).toBe(1)
    expect(ties(votes)).toBe(1)
  })
})
