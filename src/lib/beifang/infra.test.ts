import { describe, it, expect } from 'vitest'
import infra from '../../data/beifang/wissenschaft-infra.json'

describe('wissenschaft-infra.json', () => {
  it('hat Einträge, jeder mit Pflichtfeldern und einer Quelle', () => {
    expect(infra.eintraege.length).toBeGreaterThan(0)
    const kats = new Set(['metrik-broker', 'self-hosted-analytics', 'verlagseigen'])
    for (const e of infra.eintraege) {
      expect(e.domain).toMatch(/^[a-z0-9.-]+\.[a-z]{2,}$/)
      expect(e.firma.length).toBeGreaterThan(0)
      expect(kats.has(e.kategorie)).toBe(true)
      expect(e.quelle.startsWith('http')).toBe(true) // belegt, kein Platzhalter
    }
  })
  it('hat keine doppelten Domains', () => {
    const ds = infra.eintraege.map((e) => e.domain)
    expect(new Set(ds).size).toBe(ds.length)
  })
})
