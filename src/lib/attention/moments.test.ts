// The moments consumer refuses what it does not understand: only a well-formed
// stage-moments/1 payload reaches the stage at /machine-attention; everything
// else is the quiet state. The producer lives in the machine-attention repo
// (practice/src/practice/moments.py) — this is the contract's consuming half.
import { describe, expect, it } from 'vitest'

import { readMoments } from './moments'

const moment = (occurred_at: string, statement = 'A warning changed.') => ({
  project: 'foreknown',
  occurred_at,
  mode: 'revision',
  statement,
  subject: 'Tropical Cyclone TEST-26',
  enter: '/attention/future/test.html',
  evidence: 'foreknown/registry.json',
})

describe('the stage-moments contract, consumed', () => {
  it('accepts a well-formed payload and sorts it newest first', () => {
    const got = readMoments({
      $contract: 'stage-moments/1',
      moments: [moment('2026-08-08T10:00:00+00:00'), moment('2026-08-09T14:50:39+00:00')],
    })
    expect(got.map((m) => m.occurred_at)).toEqual([
      '2026-08-09T14:50:39+00:00',
      '2026-08-08T10:00:00+00:00',
    ])
  })

  it('refuses an unknown contract version rather than guessing', () => {
    expect(readMoments({ $contract: 'stage-moments/2', moments: [moment('2026-08-09')] })).toEqual(
      [],
    )
  })

  it('treats an absent or malformed file as the quiet state, never an error', () => {
    expect(readMoments(undefined)).toEqual([])
    expect(readMoments(null)).toEqual([])
    expect(readMoments({ moments: 'not-a-list' })).toEqual([])
  })

  it('drops rows missing a required field instead of rendering a hole', () => {
    const broken = { ...moment('2026-08-09T00:00:00+00:00'), statement: '' }
    const got = readMoments({
      $contract: 'stage-moments/1',
      moments: [broken, moment('2026-08-08T00:00:00+00:00')],
    })
    expect(got).toHaveLength(1)
    expect(got[0].occurred_at).toBe('2026-08-08T00:00:00+00:00')
  })
})
