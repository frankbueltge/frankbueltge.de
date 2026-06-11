import { describe, expect, it } from 'vitest'
import { renderDay } from './render'
import type { ProtokollDay, ProtokollEntry } from './types'

const SRC = { name: 'NOAA Global Monitoring Laboratory (Mauna Loa)', url: 'https://gml.noaa.gov', license: 'PD' }

function entry(partial: Partial<ProtokollEntry>): ProtokollEntry {
  return {
    top_id: 'co2', status: 'ok', unit: 'ppm', cadence: 'daily', source: SRC,
    retrieved_at: '2026-06-12T03:30:00Z', value: null, as_of: null,
    comparison: null, label: null, record: false, note: null, ...partial,
  }
}

const DAY: ProtokollDay = {
  date: '2026-06-12', generated_at: '2026-06-12T03:30:00Z',
  schema_version: '1', pipeline_version: '0.1.0',
  entries: [
    entry({ top_id: 'co2', value: 427.3, as_of: '2026-06-10',
            comparison: { label: 'prev_year_day', value: 424.52 }, record: true }),
    entry({ top_id: 'seaice_north', unit: 'Mio. km²', value: 10.689, as_of: '2026-06-10',
            comparison: { label: 'prev_year_day', value: 11.013 } }),
    entry({ top_id: 'fires', status: 'unavailable', unit: 'Detektionen', note: 'HTTP 503' }),
    entry({ top_id: 'population', unit: 'Menschen', cadence: 'computed',
            value: 8_230_000_000, as_of: '2026-06-12' }),
    entry({ top_id: 'food', unit: 'Punkte', cadence: 'monthly', value: 128.0, as_of: '2026-05-31' }),
    entry({ top_id: 'oil', status: 'implausible', unit: 'USD/Barrel', value: 8000, as_of: '2026-06-11' }),
    entry({ top_id: 'rates', unit: '%', value: 1.93, as_of: '2026-06-11',
            comparison: { label: 'prev_observation_day', value: 1.92 } }),
    entry({ top_id: 'attention', unit: 'Aufrufe', value: 812_345, as_of: '2026-06-11',
            label: 'Deep sea mining' }),
  ],
}

describe('renderDay de', () => {
  const r = renderDay(DAY, 'de')
  const top = (n: number) => r.tops[n - 1]

  it('Kopf', () => {
    expect(r.kopf).toEqual([
      'Protokoll der Sitzung vom 12. Juni 2026.',
      'Anwesend: ca. 8,23 Mrd. (Schätzung).',
      'Vorsitz: unbesetzt.',
      'Beschlussfähigkeit: nicht festgestellt.',
    ])
  })

  it('TOP 1 Atmosphäre: Feststellung, Vergleich, Rekord, Quelle', () => {
    expect(top(1).heading).toBe('TOP 1 — Atmosphäre.')
    expect(top(1).lines).toEqual([
      'Die CO₂-Konzentration der Atmosphäre beträgt 427,3 ppm.',
      'Vorjahrestag: 424,52 ppm.',
      'Höchster Stand seit Beginn der Aufzeichnung.',
    ])
    expect(top(1).sources[0]).toBe(
      'Quelle: NOAA Global Monitoring Laboratory (Mauna Loa), abgerufen 2026-06-12 03:30:00 UTC. Stand: 10. Juni 2026.',
    )
    expect(top(1).closing).toBe('Aussprache: keine. Beschluss: vertagt.')
  })

  it('TOP 2 Meereis: Nord vorhanden, Süd fehlt im Record → entfällt', () => {
    expect(top(2).lines).toContain('Ausdehnung Arktis: 10,689 Mio. km².')
    expect(top(2).lines).toContain('Vorjahrestag: 11,013 Mio. km².')
    expect(top(2).lines).toContain('Quelle nicht erreichbar — Feststellung entfällt.')
  })

  it('TOP 4 Feuer entfällt amtlich', () => {
    expect(top(4).lines).toEqual(['Quelle nicht erreichbar — Feststellung entfällt.'])
  })

  it('TOP 8 Ernährung weist Monatskadenz aus', () => {
    expect(top(8).sources[0]).toContain('Stand: 31. Mai 2026 (monatliche Erhebung).')
  })

  it('TOP 9 Geldpreis nutzt ehrliches Beobachtungslabel', () => {
    expect(top(9).lines).toEqual([
      'Kurzfristiger Euro-Zinssatz (€STR): 1,93 %.',
      'Vorherige Beobachtung: 1,92 %.',
    ])
  })

  it('TOP 10 Energie unter Vorbehalt', () => {
    expect(top(10).lines).toEqual([
      'Wert außerhalb des Plausibilitätskorridors — Feststellung unter Vorbehalt: 8.000 USD/Barrel.',
    ])
  })

  it('TOP 12 Aufmerksamkeit mit Titel', () => {
    expect(top(12).lines[0]).toBe(
      'Gegenstand der größten Aufmerksamkeit (englischsprachige Wikipedia): „Deep sea mining“ — 812.345 Aufrufe.',
    )
  })

  it('Schluss + Meta', () => {
    expect(r.schluss).toEqual(['Die Sitzung wurde nicht geschlossen.', 'Nächste Sitzung: morgen.'])
    expect(r.meta).toBe('Registerfassung 1.0.0 · Pipeline 0.1.0 · Schema 1')
  })
})

describe('renderDay en', () => {
  const r = renderDay(DAY, 'en')

  it('minutes English register', () => {
    expect(r.kopf[0]).toBe('Minutes of the session of 12 June 2026.')
    expect(r.kopf[1]).toBe('Present: approx. 8.23 bn (estimate).')
    expect(r.tops[0].heading).toBe('Item 1 — Atmosphere.')
    expect(r.tops[0].lines[0]).toBe('Atmospheric CO₂ concentration stands at 427.3 ppm.')
    expect(r.tops[0].lines[1]).toBe('Same day last year: 424.52 ppm.')
    expect(r.tops[0].closing).toBe('Discussion: none. Resolution: adjourned.')
    expect(r.tops[3].lines).toEqual(['Source unreachable — finding omitted.'])
    expect(r.tops[8].lines[1]).toBe('Previous observation: 1.92 %.')
    expect(r.tops[1].lines).toContain('Same day last year: 11.013 million km².')
    expect(r.tops[9].lines).toEqual([
      'Value outside the plausibility corridor — finding under reserve: 8,000 USD/barrel.',
    ])
    expect(r.schluss).toEqual(['The session was not closed.', 'Next session: tomorrow.'])
  })
})
