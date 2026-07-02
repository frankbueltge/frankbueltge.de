import { describe, expect, it } from 'vitest'
import { blockadeStats, entityTable, groupMedians, median, publisherMedians, sparkPath, timeline } from './stats'
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

describe('blockadeStats', () => {
  it('zählt Blockaden je Verlag + Gruppe, sortiert nach meisten Blockaden', () => {
    const r = run([
      result({ publisher: 'elsevier', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
      result({ panel_id: 'e-02', publisher: 'elsevier', blocked: { type: 'challenge', marker: 'captcha' }, tracker_hosts: null }),
      result({ panel_id: 'sn-01', publisher: 'springer-nature', tracker_hosts: ['a'] }),
      result({ panel_id: 'k-01', group: 'kontrolle', publisher: 'kommges', tracker_hosts: [] }),
      result({ panel_id: 'k-02', group: 'kontrolle', publisher: 'first-monday', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
    ])
    const b = blockadeStats(r)
    expect(b.verlag).toEqual({
      blocked: 2,
      total: 3,
      byPublisher: [
        { publisher: 'elsevier', blocked: 2, total: 2 },
        { publisher: 'springer-nature', blocked: 0, total: 1 },
      ],
    })
    expect(b.kontrolle).toEqual({ blocked: 1, total: 2 })
  })
})

describe('publisherMedians', () => {
  it('vollständig blockierter Verlag bleibt sichtbar (null), nicht verschwunden', () => {
    const r = run([
      result({ publisher: 'elsevier', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
      result({ panel_id: 'x-02', publisher: 'elsevier', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
    ])
    expect(publisherMedians(r)).toEqual({ elsevier: null })
  })
  it('gemischter Verlag: Median nur aus unblockierten Messungen', () => {
    const r = run([
      result({ panel_id: 's-01', publisher: 'sage', tracker_hosts: ['a', 'b'] }),
      result({ panel_id: 's-02', publisher: 'sage', tracker_hosts: ['a'] }),
      result({ panel_id: 's-03', publisher: 'sage', blocked: { type: 'http', marker: '403' }, tracker_hosts: null }),
    ])
    expect(publisherMedians(r)).toEqual({ sage: 1.5 })
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

import { leakFindings, doiLeakEntities, leakAuditRan } from './stats'
import type { BeifangLeak } from './types'

function hardDoi(host: string, firma: string | null): BeifangLeak {
  return { token: 'doi', signal: 'hard', form: 'klartext', kanal: 'query', host, firma, beweis: `https://${host}/?doi=x` }
}

describe('leakFindings/doiLeakEntities', () => {
  it('trennt benannte Firmen von unbenannten Hosts, nur Verlage mit hartem DOI-Leak', () => {
    const r = run([
      result({ publisher: 'springer-nature', doi_leak: true,
               leaks: [hardDoi('pixel.liveramp.com', 'LiveRamp'), hardDoi('content.readcube.com', null)],
               leak_firmen: ['LiveRamp'] }),
      result({ panel_id: 'sn-02', publisher: 'springer-nature', doi_leak: false, leaks: [], leak_firmen: [] }),
      result({ panel_id: 'e-01', publisher: 'elsevier', blocked: { type: 'http', marker: '403' } }),
    ])
    const f = leakFindings(r)
    expect(f.map((x) => x.publisher)).toEqual(['springer-nature'])
    expect(f[0].firmen).toEqual(['LiveRamp'])            // benannte Broker
    expect(f[0].hosts).toEqual(['content.readcube.com']) // unbenannte Empfänger
    expect(f[0].hard.length).toBe(2)
    expect(doiLeakEntities(r)).toEqual(['LiveRamp'])
  })
  it('Realfall: DOI-Leak nur an unbenannte Hosts → firmen leer, hosts gesetzt', () => {
    const r = run([result({ publisher: 'springer-nature', doi_leak: true,
                            leaks: [hardDoi('content.readcube.com', null)], leak_firmen: [] })])
    const f = leakFindings(r)
    expect(f[0].firmen).toEqual([])
    expect(f[0].hosts).toEqual(['content.readcube.com'])
    expect(doiLeakEntities(r)).toEqual([])
  })
  it('leerer Befund, wenn nichts leakt', () => {
    const r = run([result({ doi_leak: false, leaks: [], leak_firmen: [] })])
    expect(leakFindings(r)).toEqual([])
    expect(doiLeakEntities(r)).toEqual([])
  })
})

describe('leakAuditRan', () => {
  it('false wenn kein Result Leak-Felder trägt (reiner v1-Zensus)', () => {
    expect(leakAuditRan(run([result({ doi_leak: undefined, leaks: undefined })]))).toBe(false)
  })
  it('true sobald ein Result ein leaks-Array (auch leer) trägt', () => {
    expect(leakAuditRan(run([result({ leaks: [] })]))).toBe(true)
  })
})
