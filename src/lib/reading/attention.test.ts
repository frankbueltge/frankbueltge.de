import { describe, expect, it } from 'vitest'
import type { TrendingDay } from '@/lib/trending/types'
import { getTrendingDays } from '@/lib/trending/data'
import { fold, namer, readAttention, signalsById } from './attention'
import { CURRENT_ROUND } from './rounds'

const signal = (label: string, links: string[] = []) => ({
  source: 'x',
  label,
  url: `https://example.org/${encodeURIComponent(label)}`,
  rank: 1,
  magnitude: null,
  magnitude_unit: 'rank',
  geo: null,
  links: links.map((title) => ({ title, url: 'https://example.org/l', publisher: null })),
  meta: {},
})

const day = (date: string, signals: Record<string, ReturnType<typeof signal>[]>, topicLabels: string[] = []): TrendingDay =>
  ({
    $contract: 'trending-day/1',
    date,
    generated_at: `${date}T06:00:00Z`,
    pipeline_version: 't',
    method_version: '1',
    sources: [],
    signals,
    topics: topicLabels.map((label) => ({ id: label, label, platforms: [], platform_count: 2, score: 1, category: null, first_seen: date, days_hot: 1, signals: [], links: [], wikipedia: null })),
    summary: { topics_total: 0, converging: 0, sources_ok: 0, sources_total: 0, top_labels: [] },
  }) as TrendingDay

describe('fold and namer', () => {
  it('folds case, diacritics and dashes', () => {
    expect(fold('El Niño — Cost-of-Living')).toBe('el nino cost of living')
  })

  it('matches whole words only', () => {
    const iran = namer(['Iran'])
    expect(iran("Iran's strait")).toBe(true)
    expect(iran('IRAN talks')).toBe(true)
    expect(iran('Iranian drones')).toBe(false)
    expect(iran('Tehran')).toBe(false)
  })

  it('reads a multi-word term across a hyphen', () => {
    expect(namer(['cost of living'])('The cost-of-living squeeze')).toBe(true)
    expect(namer(['entry-level'])('entry level hiring')).toBe(true)
  })
})

describe('readAttention', () => {
  const round = {
    attention_window: { from: '2026-10-01', to: '2026-10-02' },
    matters: [
      { id: 'ebola', title: 'Ebola', gist: '', quiet_rank: 1, terms: ['Ebola'] },
      { id: 'iran', title: 'Iran', gist: '', quiet_rank: null, terms: ['Iran', 'Hormuz'] },
    ],
  }
  const days = [
    day('2026-09-30', { a: [signal('Ebola before the window')] }),
    day('2026-10-01', { a: [signal('Iran and Hormuz'), signal('Weather')], b: [signal('Markets', ['Oil after Hormuz'])] }, ['Iran']),
    day('2026-10-02', { a: [signal('Ebola cases rise')] }),
  ]

  it('counts each naming signal once, label or link title, inside the window only', () => {
    const a = readAttention(round, days)
    expect(a.days).toEqual(['2026-10-01', '2026-10-02'])
    expect(signalsById(a)).toEqual({ ebola: 1, iran: 2 })
  })

  it('counts a converged day when a converging topic names the matter', () => {
    const a = readAttention(round, days)
    expect(a.matters.find((m) => m.matter === 'iran')!.converged_days).toBe(1)
    expect(a.matters.find((m) => m.matter === 'ebola')!.converged_days).toBe(0)
  })

  it('keeps a receipt for every counted signal, newest first', () => {
    const a = readAttention(round, days)
    expect(a.matters.find((m) => m.matter === 'iran')!.receipts.map((r) => r.label)).toEqual(['Iran and Hormuz', 'Markets'])
    expect(a.matters.find((m) => m.matter === 'ebola')!.receipts[0]!.date).toBe('2026-10-02')
  })
})

describe('the committed round, counted from the committed days', () => {
  const a = readAttention(CURRENT_ROUND, getTrendingDays())

  it('reads the whole thirty-day window the briefing read', () => {
    expect(a.days.length).toBe(30)
  })

  it('finds the climate conference absent and the war loud, as the briefing did', () => {
    const by = Object.fromEntries(a.matters.map((m) => [m.matter, m]))
    expect(by.cop31!.signals).toBe(0)
    expect(by['iran-hormuz']!.converged_days).toBeGreaterThan(0)
    expect(by['iran-hormuz']!.signals).toBeGreaterThan(by.ebola!.signals)
  })
})
