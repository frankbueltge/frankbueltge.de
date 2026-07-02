import { describe, expect, it } from 'vitest'
import { entityTable, groupMedians, median, sparkPath, timeline } from './stats'
import type { BeifangRun, BeifangSiteResult } from './types'

function result(over: Partial<BeifangSiteResult>): BeifangSiteResult {
  return {
    panel_id: 'x-01', url: 'u', final_url: 'f', final_domain: 'd',
    group: 'verlag', publisher: 'elsevier', http_status: 200, blocked: null, note: null,
    requests_total: 1, third_party_hosts: 1, third_party_requests: 1, third_party_bytes: 1,
    tracker_hosts: [], entities: [], cookies_first_party: 0, cookies_third_party: 0,
    retrieved_at: 't', ...over,
  }
}

function run(results: BeifangSiteResult[]): BeifangRun {
  return {
    date: '2026-07-06', generated_at: 'g', schema_version: '1', pipeline_version: 'p',
    panel_version: 'v', runner: 'test', lists: {},
    vantages: { us: { status: 'ok', note: null, results },
                eu: { status: 'ausstehend', note: 'EU-Messpunkt nicht aufgebaut', results: null } },
    befund: { kind: 'baseline', params: {} },
  }
}

describe('median/groupMedians', () => {
  it('median: leer -> null, gerade Anzahl -> Mittelwert', () => {
    expect(median([])).toBeNull()
    expect(median([1, 3])).toBe(2)
    expect(median([5])).toBe(5)
  })
  it('blockierte Seiten fallen aus dem Median (Lücke, nicht 0)', () => {
    const r = run([
      result({ tracker_hosts: ['a', 'b'] }),
      result({ panel_id: 'x-02', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
      result({ panel_id: 'k-01', group: 'kontrolle', publisher: 'kommges', tracker_hosts: [] }),
    ])
    expect(groupMedians(r)).toEqual({ verlag: 2, kontrolle: 0 })
  })
})

describe('entityTable', () => {
  it('zählt Seiten je Firma, getrennt nach Gruppe', () => {
    const r = run([
      result({ entities: ['LiveRamp', 'Google'] }),
      result({ panel_id: 'x-02', entities: ['LiveRamp'] }),
      result({ panel_id: 'k-01', group: 'kontrolle', publisher: 'kommges', entities: ['Google'] }),
    ])
    expect(entityTable(r)).toEqual([
      { entity: 'LiveRamp', verlag: 2, kontrolle: 0 },
      { entity: 'Google', verlag: 1, kontrolle: 1 },
    ])
  })
})

describe('timeline/sparkPath', () => {
  it('timeline ist chronologisch aufsteigend', () => {
    const a = run([result({ tracker_hosts: ['a'] })])
    const b = { ...run([result({ tracker_hosts: ['a', 'b', 'c'] })]), date: '2026-07-13' }
    expect(timeline([b, a]).map((p) => p.date)).toEqual(['2026-07-06', '2026-07-13'])
  })
  it('sparkPath bricht bei null (Lücke als Form)', () => {
    expect(sparkPath([0, 10], 100, 20, 10)).toBe('M0,20L100,0')
    expect(sparkPath([0, null, 10], 100, 20, 10)).toBe('M0,20M100,0')
  })
})
