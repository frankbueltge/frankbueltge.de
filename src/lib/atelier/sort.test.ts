// src/lib/atelier/sort.test.ts
import { describe, it, expect } from 'vitest'
import { sortJournal, journalSortKey, sortWorks } from './sort'

describe('journalSortKey', () => {
  it('parses date and session number', () => {
    expect(journalSortKey('journal/2026-06-30-sitzung-10')).toEqual([20260630, 10])
  })
  it('treats a plain day-entry as session 0', () => {
    expect(journalSortKey('journal/2026-06-30')).toEqual([20260630, 0])
  })
})

describe('sortJournal (newest first)', () => {
  const ids = [
    'journal/2026-06-28',
    'journal/2026-06-28-sitzung-2',
    'journal/2026-06-30-sitzung-8',
    'journal/2026-06-30-sitzung-9',
    'journal/2026-06-30-sitzung-10',
    'journal/2026-06-30',
    'journal/2026-06-29-sitzung-4',
  ]
  const sorted = sortJournal(ids.map((id) => ({ id }))).map((e) => e.id)

  it('orders session 10 before session 9 (numeric, not string)', () => {
    expect(sorted.indexOf('journal/2026-06-30-sitzung-10')).toBeLessThan(
      sorted.indexOf('journal/2026-06-30-sitzung-9'),
    )
  })
  it('places the plain day-entry as the oldest of its day (after that day’s numbered sessions)', () => {
    expect(sorted.indexOf('journal/2026-06-30-sitzung-8')).toBeLessThan(
      sorted.indexOf('journal/2026-06-30'),
    )
  })
  it('orders newer days before older days', () => {
    expect(sorted.indexOf('journal/2026-06-30')).toBeLessThan(
      sorted.indexOf('journal/2026-06-29-sitzung-4'),
    )
    expect(sorted.indexOf('journal/2026-06-29-sitzung-4')).toBeLessThan(
      sorted.indexOf('journal/2026-06-28'),
    )
  })
  it('puts the newest entry first overall', () => {
    expect(sorted[0]).toBe('journal/2026-06-30-sitzung-10')
  })
  it('does not mutate the input array', () => {
    const input = [{ id: 'journal/2026-06-28' }, { id: 'journal/2026-06-30' }]
    const copy = [...input]
    sortJournal(input)
    expect(input).toEqual(copy)
  })
})

describe('sortWorks (newest first)', () => {
  it('orders a 06-30 work before a 06-29 work', () => {
    const works = [
      { slug: '2026-06-29-cerfs-margin', date: '2026-06-29' },
      { slug: '2026-06-30-the-exchange', date: '2026-06-30' },
    ]
    expect(sortWorks(works).map((w) => w.slug)).toEqual([
      '2026-06-30-the-exchange',
      '2026-06-29-cerfs-margin',
    ])
  })
  it('breaks same-day ties deterministically by slug descending', () => {
    const works = [
      { slug: '2026-06-30-a-implies-a', date: '2026-06-30' },
      { slug: '2026-06-30-the-exchange', date: '2026-06-30' },
      { slug: '2026-06-30-fehler-briefe', date: '2026-06-30' },
    ]
    expect(sortWorks(works).map((w) => w.slug)).toEqual([
      '2026-06-30-the-exchange',
      '2026-06-30-fehler-briefe',
      '2026-06-30-a-implies-a',
    ])
  })
  it('falls back to slug when date is missing', () => {
    const works = [
      { slug: '2026-06-28-aaa' },
      { slug: '2026-06-30-zzz' },
    ]
    expect(sortWorks(works)[0].slug).toBe('2026-06-30-zzz')
  })
})
