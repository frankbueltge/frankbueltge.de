import { describe, expect, it } from 'vitest'
import { addTally, louderTally, ownOrder, quietTally } from './position'
import type { VoteTuple } from './reading'

const signals = { loud: 100, mid: 10, quiet: 1, silent: 0, alsoSilent: 0 }
const round = {
  matters: [
    { id: 'loud', title: '', gist: '', quiet_rank: null, terms: ['x'] },
    { id: 'mid', title: '', gist: '', quiet_rank: null, terms: ['x'] },
    { id: 'quiet', title: '', gist: '', quiet_rank: 1, terms: ['x'] },
    { id: 'silent', title: '', gist: '', quiet_rank: 2, terms: ['x'] },
    { id: 'alsoSilent', title: '', gist: '', quiet_rank: null, terms: ['x'] },
  ],
}

describe('louderTally', () => {
  it('counts the decided choices between unequally loud matters, and how many went to the louder', () => {
    const votes: VoteTuple[] = [
      ['loud', 'quiet', 0, 1], // louder chosen
      ['mid', 'loud', 0, 1], // quieter chosen
      ['silent', 'mid', 1, 1], // louder chosen
      ['silent', 'alsoSilent', 0, 1], // equally loud: not counted
      ['loud', 'mid', null, 1], // can't say: not counted
      ['loud', 'quiet', 2, 1], // equally urgent: not counted
    ]
    expect(louderTally(votes, signals)).toEqual({ of: 3, went: 2 })
  })
})

describe('quietTally', () => {
  it('counts the decided choices with exactly one quiet matter, and how many went to it', () => {
    const votes: VoteTuple[] = [
      ['loud', 'quiet', 1, 1], // quiet chosen
      ['silent', 'mid', 1, 1], // the other chosen
      ['quiet', 'silent', 0, 1], // both quiet: not counted
      ['loud', 'mid', 0, 1], // neither quiet: not counted
      ['quiet', 'mid', 2, 1], // equally urgent: not counted
    ]
    expect(quietTally(votes, round)).toEqual({ of: 2, went: 1 })
  })
})

describe('addTally and ownOrder', () => {
  it('adds tallies', () => {
    expect(addTally({ of: 2, went: 1 }, { of: 3, went: 3 })).toEqual({ of: 5, went: 4 })
  })

  it('orders a reader\'s matters by how often each was chosen when shown', () => {
    const votes: VoteTuple[] = [
      ['a', 'b', 0, 1],
      ['a', 'c', 0, 1],
      ['b', 'c', 1, 1],
      ['b', 'a', null, 1],
    ]
    expect(ownOrder(votes).map((r) => [r.id, r.chosen, r.shown])).toEqual([
      ['a', 2, 3],
      ['c', 1, 2],
      ['b', 0, 3],
    ])
  })
})
