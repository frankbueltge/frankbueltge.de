import { describe, expect, it } from 'vitest'
import { renderPolice } from './render'
import type { Police } from './types'

const POLICE: Police = {
  generated_at: '2026-06-14T00:47:24Z',
  schema_version: '1',
  pipeline_version: '0.1.0',
  premium: {
    index: 279.086,
    base_value: 100.0,
    base_year: 1998,
    change_pct_since_base: 179.1,
    latest_date: '2026-05-01',
    source: {
      name: 'U.S. Bureau of Labor Statistics, PPI (PCU9241269241262), via FRED',
      url: 'https://fred.stlouisfed.org/series/PCU9241269241262',
      license: 'Public Domain (BLS)',
    },
  },
  disasters: {
    cumulative_cost_busd: 2917.6,
    total_events: 403,
    since_year: 1980,
    latest_year: 2024,
    latest_year_events: 27,
    latest_year_cost_busd: 182.7,
    latest_year_deaths: 568,
    source: {
      name: 'NOAA NCEI, Billion-Dollar Weather and Climate Disasters',
      url: 'https://www.ncei.noaa.gov/access/billions/',
      license: 'Public Domain (NOAA), DOI 10.25921/stkw-7w73',
    },
  },
  claims: {
    recent_paid_usd: 9742993,
    recent_count: 1000,
    latest_year: 2026,
    source: {
      name: 'FEMA OpenFEMA, NFIP Schadenzahlungen',
      url: 'https://www.fema.gov/about/openfema/api',
      license: 'Public Domain (FEMA)',
    },
  },
  retreat: {
    non_renewals: 2800000,
    as_of: '2023-12-31',
    note: 'Kalifornien: Wohngebäude-Nicht-Erneuerungen 2020–2023',
    source: {
      name: 'California Department of Insurance, Non-Renewals by ZIP',
      url: 'https://www.insurance.ca.gov/',
      license: 'öffentlich (CA DOI)',
    },
  },
}

describe('renderPolice de', () => {
  const r = renderPolice(POLICE, 'de')
  const para = (nummer: string) => r.paragraphen.find((p) => p.nummer === nummer)!

  it('Kopf exakt', () => {
    expect(r.kopf).toEqual([
      'Versicherungsschein — Die Gegenwart.',
      'Versicherungsnehmer: kommende Generationen.',
      'Versicherer: der Markt.',
      'Police-Nr. 1. Gültig: fortlaufend, unkündbar.',
    ])
  })

  it('§ 1 Versicherte Gefahr', () => {
    expect(para('§ 1').titel).toBe('Versicherte Gefahr')
    expect(para('§ 1').zeilen).toEqual(['Gegenstand der Versicherung ist die Klimakatastrophe.'])
  })

  it('§ 2 Prämie nennt Index und Anstieg', () => {
    const p2 = para('§ 2')
    expect(p2.zeilen[0]).toBe(
      'Der Versicherungs-Preisindex steht bei 279,1 Punkten (Basis 1998 = 100).',
    )
    expect(p2.zeilen[1]).toBe('Die Prämie ist seit 1998 um 179,1 % gestiegen.')
    expect(p2.zeilen[0]).toContain('279,1')
    expect(p2.zeilen[1]).toContain('179,1')
    expect(p2.quelle).toContain('Quelle:')
    expect(p2.quelle).toContain('abgerufen 2026-06-14 00:47:24 UTC')
  })

  it('§ 3 Schadenverlauf mit Toten und Kumulation', () => {
    const p3 = para('§ 3')
    expect(p3.zeilen[0]).toBe(
      'Im Jahr 2024 wurden 27 Großschäden über je eine Milliarde US-Dollar angezeigt — Gesamtschaden 182,7 Mrd. US-Dollar, 568 Tote.',
    )
    expect(p3.zeilen[0]).toContain('568')
    expect(p3.zeilen[1]).toBe('Kumulierter Schaden seit 1980: 2.917,6 Mrd. US-Dollar.')
  })

  it('§ 4 Regulierung mit Tausendertrennung', () => {
    expect(para('§ 4').zeilen[0]).toBe(
      'Zuletzt regulierte Hochwasserschäden (Stichprobe von 1.000): 9.742.993 US-Dollar.',
    )
  })

  it('§ 5 Risikoausschluss', () => {
    expect(para('§ 5').zeilen[0]).toBe(
      'Für wachsende Gebiete wird kein Versicherungsschutz mehr angeboten. Nicht-Erneuerungen (Kalifornien, Stand 31. Dezember 2023): 2.800.000.',
    )
  })

  it('§ 6 Selbstbehalt', () => {
    expect(para('§ 6').zeilen).toEqual(['Den Selbstbehalt trägt, wer keine Police hat.'])
  })

  it('Schluss exakt', () => {
    expect(r.schluss).toEqual([
      'Diese Police wurde nicht unterzeichnet.',
      'Sie ist in Kraft. Prämie fällig.',
    ])
  })

  it('Meta nennt Fassung, Schema, generated_at', () => {
    expect(r.meta).toBe('Fassung 0.1.0 · Schema 1 · 2026-06-14T00:47:24Z')
  })
})

describe('renderPolice en', () => {
  const r = renderPolice(POLICE, 'en')
  const para = (nummer: string) => r.paragraphen.find((p) => p.nummer === nummer)!

  it('Kopf exact', () => {
    expect(r.kopf).toEqual([
      'Insurance policy — The Present.',
      'Policyholder: future generations.',
      'Insurer: the market.',
      'Policy no. 1. Valid: continuous, non-terminable.',
    ])
  })

  it('§ 2 premium uses English number format', () => {
    const p2 = para('§ 2')
    expect(p2.zeilen[0]).toBe(
      'The insurance price index stands at 279.1 points (base 1998 = 100).',
    )
    expect(p2.zeilen[1]).toBe('The premium has risen by 179.1 % since 1998.')
    expect(p2.zeilen[0]).toContain('279.1')
    expect(p2.zeilen[1]).toContain('179.1')
  })

  it('§ 3 claims history contains death toll', () => {
    expect(para('§ 3').zeilen[0]).toContain('568')
    expect(para('§ 3').zeilen[0]).toBe(
      'In 2024, 27 disasters exceeding one billion US dollars each were declared — total loss 182.7 bn US dollars, 568 dead.',
    )
  })

  it('Schluss exact', () => {
    expect(r.schluss).toEqual(['This policy was not signed.', 'It is in force. Premium due.'])
  })
})

describe('renderPolice error sections', () => {
  const broken: Police = {
    ...POLICE,
    premium: { error: 'HTTP 503' },
    disasters: { error: 'timeout' },
  }

  it('renders the unavailable string for failed sources (de)', () => {
    const r = renderPolice(broken, 'de')
    const p2 = r.paragraphen.find((p) => p.nummer === '§ 2')!
    expect(p2.zeilen).toEqual(['— (Quelle nicht erreichbar)'])
    expect(p2.quelle).toBeUndefined()
  })

  it('renders the unavailable string for failed sources (en)', () => {
    const r = renderPolice(broken, 'en')
    const p3 = r.paragraphen.find((p) => p.nummer === '§ 3')!
    expect(p3.zeilen).toEqual(['— (source unavailable)'])
  })
})
