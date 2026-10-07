import { describe, expect, it } from 'vitest'
import { collectWorks, latestWorks, sessionOf } from './latest'

const field = {
  ns: 'field' as const,
  kind: 'astro' as const,
  metas: {
    '/src/components/field/werke/2026-07-02-standing-docket/meta.json': { title: 'The Standing Docket', date: '2026-07-02', embodies: 'A recurring conviction record.' },
    '/src/components/field/werke/2026-07-01-calibration-gap/meta.json': { title: 'Calibration Certificate' },
  },
}
const atelier = {
  ns: 'atelier' as const,
  kind: 'astro' as const,
  metas: { '/src/components/atelier/werke/2026-07-01-x/meta.json': { title: 'X', date: '2026-07-01' } },
}
const fieldHtml = {
  ns: 'field' as const,
  kind: 'html' as const,
  metas: { '/src/content/field/works/2026-07-03-html-work/meta.json': { title: 'HTML Work', date: '2026-07-03' } },
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
  it('links html-kind works to the engine page, not a standalone werke page, and still sorts by date', () => {
    const out = latestWorks([field, fieldHtml], 4)
    expect(out[0]).toMatchObject({ ns: 'field', slug: '2026-07-03-html-work', href: '/field/' })
    expect(out.map((w) => w.slug)).toEqual([
      '2026-07-03-html-work',
      '2026-07-02-standing-docket',
      '2026-07-01-calibration-gap',
    ])
  })
})

// 2026-10-07: five sessions a day landed in one practice, and a work's record names its day, not
// its hour. The session it names is what lets the signal log stand that day's works newest first.
describe('sessionOf — the session a work’s own record names', () => {
  it('reads the Studio’s session field, and the session the nightly line signs with', () => {
    expect(sessionOf({ session: 158 })).toBe(158)
    expect(sessionOf({ author: 'Ulysses (the nightly line), Session 112' })).toBe(112)
  })

  it('names none where the record numbers none — nothing is inferred', () => {
    expect(sessionOf({})).toBeUndefined()
    expect(sessionOf({ author: 'Ulysses (the nightly line)' })).toBeUndefined()
    expect(sessionOf({ session: 'late' })).toBeUndefined()
    expect(sessionOf({ session: 1.5 })).toBeUndefined()
  })

  it('carries it on the work, and leaves a work without one exactly as it was', () => {
    const [numbered, plain] = collectWorks([
      {
        ns: 'studio',
        kind: 'html',
        metas: {
          '/src/content/studio/works/2026-10-07-the-third-draw/meta.json': { title: 'THE LOCKED SHELF', date: '2026-10-07', session: 158 },
          '/src/content/studio/works/2026-10-06-every-open-one/meta.json': { title: 'EVERY OPEN ONE', date: '2026-10-06' },
        },
      },
    ])
    expect(numbered).toMatchObject({ title: 'THE LOCKED SHELF', session: 158 })
    expect(plain).not.toHaveProperty('session')
  })
})
