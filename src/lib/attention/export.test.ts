// The export consumer of the practice's own pages: it refuses what it does not understand, says
// what runs now without carrying any project's figures, and reads the protocol's own counts.
// The producer lives in the machine-attention repo (practice/src/practice/export.py).
import { describe, expect, it } from 'vitest'

import { costRecord, lastStep, readExport, runningNow } from './export'

const project = (id: string, status: string, since: string, site_route: string | null = null) => ({
  id,
  title: id.toUpperCase(),
  since,
  site_route,
  status,
})

const payload = (figures: unknown[] = []) => ({
  $contract: 'attention-export/1',
  generated_from: { repo: 'machine-attention', commit: 'fb7f662' },
  practice: { id: 'machine-attention', label: 'Machine Attention' },
  projects: [
    project('foreknown', 'retired', '2026-08-08', '/attention'),
    project('planetary', 'v0', '2026-10-04'),
    project('memoryhole', 'v0', '2026-08-15'),
    project('interval', 'e-experiment', '2026-10-04'),
    project('state-before-interface', 'running', '2026-08-08', '/observatory'),
  ],
  figures,
})

describe('the attention export, consumed by its own pages', () => {
  it('refuses an unknown contract version and anything that is not a payload', () => {
    expect(readExport({ ...payload(), $contract: 'attention-export/2' })).toBeNull()
    expect(readExport(undefined)).toBeNull()
    expect(readExport('attention-export/1')).toBeNull()
  })

  it('drops malformed rows instead of repairing them', () => {
    const got = readExport({
      ...payload([{ key: 'protocol_steps', value: '351', as_of: '2026-10-18' }]),
      projects: [project('interval', 'e-experiment', '2026-10-04'), { id: 'no-title', since: '2026-10-04', status: 'v0' }],
    })
    expect(got?.projects.map((p) => p.id)).toEqual(['interval'])
    expect(got?.figures).toEqual([])
  })

  it('names what runs now, furthest along the admission path first, and leaves the retired out', () => {
    const got = readExport(payload())!
    expect(runningNow(got).map((p) => [p.id, p.status])).toEqual([
      ['state-before-interface', 'running'],
      ['interval', 'e-experiment'],
      ['memoryhole', 'v0'],
      ['planetary', 'v0'],
    ])
  })

  it('carries no figure with a project, whatever the export holds', () => {
    // The Interval's criterion C: no page, figure, number or data on the site before its review.
    const got = readExport(payload([{ key: 'interval_episodes', value: 8, as_of: '2026-10-13' }]))!
    for (const p of runningNow(got)) expect(Object.keys(p).sort()).toEqual(['id', 'since', 'site_route', 'status', 'title'])
  })

  it('reads the practice’s clock from the protocol, not from any project', () => {
    const got = readExport(
      payload([
        { key: 'memoryhole_nights_on_record', value: 63, as_of: '2026-10-17' },
        { key: 'protocol_steps', value: 351, as_of: '2026-10-18' },
      ]),
    )!
    expect(lastStep(got)).toBe('2026-10-18')
    expect(lastStep(readExport(payload())!)).toBeNull()
  })

  it('says how many model steps carry a token count or a cost, or nothing', () => {
    const counts = [
      { key: 'protocol_model_steps', value: 57, as_of: '2026-10-18' },
      { key: 'protocol_model_steps_with_tokens', value: 10, as_of: '2026-10-18' },
      { key: 'protocol_model_steps_with_cost', value: 1, as_of: '2026-10-18' },
    ]
    expect(costRecord(readExport(payload(counts))!)).toEqual({ modelSteps: 57, withTokens: 10, withCost: 1, asOf: '2026-10-18' })
    expect(costRecord(readExport(payload(counts.slice(0, 2)))!)).toBeNull()
  })
})
