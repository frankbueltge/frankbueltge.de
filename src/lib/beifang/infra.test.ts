import { describe, it, expect } from 'vitest'
import infra from '../../data/beifang/wissenschaft-infra.json'
import { infraFor } from './infra'

describe('wissenschaft-infra.json', () => {
  it('hat Einträge, jeder mit Pflichtfeldern und einer Quelle', () => {
    expect(infra.eintraege.length).toBeGreaterThan(0)
    const kats = new Set(['metrik-broker', 'werbe-server', 'verwertungsgesellschaft', 'self-hosted-analytics', 'verlagseigen'])
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

describe('infraFor', () => {
  it('löst Subdomain auf die kuratierte Domain auf', () => {
    expect(infraFor('content.readcube.com')?.firma).toBe('ReadCube')
    expect(infraFor('api.altmetric.com')?.kategorie).toBe('metrik-broker')
    expect(infraFor('metrics-api.dimensions.ai')?.eigentuemer).toContain('Digital Science')
  })
  it('erkennt self-hosted Analytics', () => {
    expect(infraFor('piwik.hiig.de')?.kategorie).toBe('self-hosted-analytics')
    expect(infraFor('umami.adho.org')?.kategorie).toBe('self-hosted-analytics')
  })
  it('gibt null für unbekannte Hosts (nicht raten)', () => {
    expect(infraFor('www.google-analytics.com')).toBeNull()
    expect(infraFor('example.org')).toBeNull()
  })
})
