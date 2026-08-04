import { describe, expect, it } from 'vitest'
import { chronicle } from './archive'

const day = (date: string, articles = 100, echo = 0.2) => ({
  generated_at: `${date}T09:00:00+00:00`,
  date,
  echo_index: echo,
  soft_echo_index: echo + 0.01,
  headline: articles > 0 ? { phrase: 'p', sample_title: 'T', domain_count: 5 } : null,
  runner_up: null,
  stats: { articles_scanned: articles, domains_scanned: 50, beats: [], per_beat: {}, shingle_n: 6, min_domains: 3 },
  source: { name: 'GDELT DOC 2.0 API', url: 'https://example.org', license: 'open', retrieved: date },
})

describe('consensus chronicle', () => {
  it('returns an empty chronicle for an empty file set', () => {
    expect(chronicle({})).toEqual([])
  })

  it('ignores files not named like a date (latest.json)', () => {
    const days = chronicle({
      '../data/consensus/latest.json': { default: day('2026-08-03') },
      '../data/consensus/2026-08-03.json': { default: day('2026-08-03') },
    })
    expect(days).toHaveLength(1)
    expect(days[0]).toMatchObject({ kind: 'measured', date: '2026-08-03' })
  })

  it('sorts newest first', () => {
    const days = chronicle({
      'a/2026-08-01.json': { default: day('2026-08-01') },
      'a/2026-08-03.json': { default: day('2026-08-03') },
      'a/2026-08-02.json': { default: day('2026-08-02') },
    })
    expect(days.map((d) => d.date)).toEqual(['2026-08-03', '2026-08-02', '2026-08-01'])
  })

  it('marks a zero-scan day as failed, not as a quiet news day', () => {
    const days = chronicle({ 'a/2026-07-02.json': { default: day('2026-07-02', 0) } })
    expect(days[0].kind).toBe('failed')
  })

  it('renders a calendar day without a committed file as a visible gap', () => {
    const days = chronicle({
      'a/2026-08-01.json': { default: day('2026-08-01') },
      'a/2026-08-03.json': { default: day('2026-08-03') },
    })
    expect(days.map((d) => [d.date, d.kind])).toEqual([
      ['2026-08-03', 'measured'],
      ['2026-08-02', 'missing'],
      ['2026-08-01', 'measured'],
    ])
  })

  it('fails loudly when file name and record date disagree', () => {
    expect(() => chronicle({ 'a/2026-08-03.json': { default: day('2026-08-02') } })).toThrow(/disagree/)
  })

  it('fails loudly on a record without stats', () => {
    const broken = { ...day('2026-08-03'), stats: undefined }
    expect(() => chronicle({ 'a/2026-08-03.json': { default: broken } })).toThrow(/lacks/)
  })
})
