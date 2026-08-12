// The committed ledger itself is the fixture worth testing: it must always validate,
// and the loader must fail loudly on malformed entries rather than render half a truth.
import { describe, expect, it } from 'vitest'
import manual from '@/data/post/ledger.manual.json'
import { deliverySchema, loadLedger } from './ledger'

describe('post office ledger', () => {
  it('the committed ledger validates and sorts newest-first', () => {
    const entries = loadLedger()
    expect(entries.length).toBeGreaterThan(0)
    for (let i = 1; i < entries.length; i++) {
      expect(entries[i - 1].as_of >= entries[i].as_of).toBe(true)
    }
  })

  it('the site-side half validates on its own — the sync reads it before anything is derived', () => {
    expect(deliverySchema.array().safeParse(manual).success).toBe(true)
  })

  it('no id appears twice, so no packet can silently overwrite another', () => {
    const ids = loadLedger().map((e) => e.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('every derived entry names the packet file it came from, so it can be checked first-hand', () => {
    for (const e of loadLedger()) {
      if (e.derived_from) expect(e.derived_from).toMatch(/^deliver(y|ies)\/[^/]+\/packet\.json$/)
    }
  })

  // A practice writes its own packet.json. `sent` is the one field it cannot honestly know:
  // only the human who forwarded the letter can set it, and only site-side.
  it('nothing derived from a practice repo claims to have been sent', () => {
    for (const e of loadLedger()) {
      if (!e.derived_from) continue
      expect(['in-preparation', 'prepared', 'withheld']).toContain(e.status)
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
