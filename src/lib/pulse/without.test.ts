import { describe, expect, it } from 'vitest'
import type { PulseSnapshot } from '@/lib/pulse/render'
import pulseData from '@/data/pulse/pulse.json'
import { withoutRepos } from './without'

const snap = (weeks: PulseSnapshot['weeks'], repos: string[]): PulseSnapshot => ({
  schema_version: 'test',
  generated_at: '2026-10-10T12:46:00Z',
  as_of: '2026-10-10 12:46 UTC',
  bin_hours: 2,
  bins_per_week: 4,
  repos,
  total_commits: weeks.reduce((sum, w) => sum + w.bins.reduce((a, b) => a + b, 0), 0),
  weeks,
})

describe('withoutRepos', () => {
  const two = snap(
    [
      { iso_year: 2026, iso_week: 40, bins: [3, 0, 5, 1], by_repo: { a: [1, 0, 5, 0], b: [2, 0, 0, 1] } },
      { iso_year: 2026, iso_week: 41, bins: [0, 4, 0, 0], cutoff_bin: 2, by_repo: { a: [0, 4, 0, 0] } },
    ],
    ['a', 'b'],
  )

  it('subtracts a repository from the aggregate, the split, the list and the total', () => {
    const view = withoutRepos(two, ['b'])
    expect(view.repos).toEqual(['a'])
    expect(view.weeks[0].bins).toEqual([1, 0, 5, 0])
    expect(view.weeks[0].by_repo).toEqual({ a: [1, 0, 5, 0] })
    expect(view.weeks[1].bins).toEqual([0, 4, 0, 0])
    expect(view.total_commits).toBe(two.total_commits - 3)
  })

  it('keeps everything else of a week, the cutoff included', () => {
    expect(withoutRepos(two, ['b']).weeks[1].cutoff_bin).toBe(2)
  })

  it('leaves the snapshot it was given untouched', () => {
    const before = JSON.stringify(two)
    withoutRepos(two, ['a', 'b'])
    expect(JSON.stringify(two)).toBe(before)
  })

  it('returns the same snapshot for a name it does not list', () => {
    expect(withoutRepos(two, ['nobody'])).toBe(two)
  })

  it('passes a week without a split through unchanged — there is nothing to tell apart', () => {
    const old = snap([{ iso_year: 2026, iso_week: 30, bins: [2, 2, 2, 2] }], ['a', 'b'])
    expect(withoutRepos(old, ['b']).weeks[0].bins).toEqual([2, 2, 2, 2])
  })

  it('on the committed snapshot the remaining split still sums to the remaining aggregate', () => {
    const pulse = pulseData as PulseSnapshot
    const view = withoutRepos(pulse, ['arch'])
    expect(view.repos).not.toContain('arch')
    for (const week of view.weeks) {
      if (!week.by_repo) continue
      expect(Object.keys(week.by_repo)).not.toContain('arch')
      const sum = new Array<number>(week.bins.length).fill(0)
      for (const own of Object.values(week.by_repo)) own?.forEach((v, i) => (sum[i] += v))
      expect(sum).toEqual(week.bins)
    }
    const archCommits = pulse.weeks.reduce((s, w) => s + (w.by_repo?.arch ?? []).reduce((a, b) => a + b, 0), 0)
    expect(view.total_commits).toBe(pulse.total_commits - archCommits)
  })
})
