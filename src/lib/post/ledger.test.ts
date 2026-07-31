// The committed ledger itself is the fixture worth testing: it must always validate,
// and the loader must fail loudly on malformed entries rather than render half a truth.
import { describe, expect, it } from 'vitest'
import { deliverySchema, loadLedger } from './ledger'

describe('post office ledger', () => {
  it('the committed ledger validates and sorts newest-first', () => {
    const entries = loadLedger()
    expect(entries.length).toBeGreaterThan(0)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].as_of >= entries[i].as_of).toBe(true)
    }
  })

  it('rejects a delivery that names no receiver channel', () => {
    const bad = {
      id: '2026-08-x',
      practice: 'field',
      piece: 'piece',
      receiver: 'someone',
      receiver_channel: '',
      status: 'sent',
      as_of: '2026-08-01',
      record_url: 'https://example.org/r',
      note: 'note',
    }
    expect(deliverySchema.safeParse(bad).success).toBe(false)
  })
})
