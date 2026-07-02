import { describe, expect, it } from 'vitest'
import { latestWorks } from './latest'

const field = {
  ns: 'field' as const,
  metas: {
    '/src/components/field/werke/2026-07-02-standing-docket/meta.json': { title: 'The Standing Docket', date: '2026-07-02', embodies: 'A recurring conviction record.' },
    '/src/components/field/werke/2026-07-01-calibration-gap/meta.json': { title: 'Calibration Certificate' },
  },
}
const atelier = {
  ns: 'atelier' as const,
  metas: { '/src/components/atelier/werke/2026-07-01-x/meta.json': { title: 'X', date: '2026-07-01' } },
}

describe('latestWorks', () => {
  it('merges namespaces, sorts date-desc, applies the limit', () => {
    const out = latestWorks([field, atelier], 2)
    expect(out).toHaveLength(2)
    expect(out[0]).toMatchObject({ ns: 'field', slug: '2026-07-02-standing-docket', href: '/field/werke/2026-07-02-standing-docket' })
  })
  it('falls back to the slug date prefix when meta.date is missing', () => {
    const out = latestWorks([field], 10)
    expect(out.find((w) => w.slug === '2026-07-01-calibration-gap')?.date).toBe('2026-07-01')
  })
  it('uses embodies as blurb and slug as title fallback', () => {
    const out = latestWorks([field], 1)
    expect(out[0].blurb).toBe('A recurring conviction record.')
  })
})
