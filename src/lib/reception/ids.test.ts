import { describe, expect, it } from 'vitest'
import { DELIVERY, PRACTICE_LABEL, RECEPTION_PRACTICES, formHref, isWorkId, normalizePath, practiceOfId, workForPage, workId } from './ids'
import { pageSources } from './sources'

describe('reception ids', () => {
  it('name a practice and a slug, and nothing else', () => {
    for (const id of ['lab:consensus', 'studio:2026-10-16-filed-under', 'n-1:two-nights-deep', 'error-as-method:2026-08-10-two-exacts', 'atelier:cycle-008']) expect(isWorkId(id)).toBe(true)
    for (const id of ['arch:arrival', 'plenum:x', 'lab:', 'lab:A', 'lab:x/y', 'lab:x y', ' lab:x', 'lab:-x', `lab:${'x'.repeat(121)}`]) expect(isWorkId(id)).toBe(false)
    expect(practiceOfId('n-1:dialects')).toBe('n-1')
    expect(() => workId('lab', 'Bad Slug')).toThrow()
  })

  it('label every practice, and deliver to the five that open sessions', () => {
    for (const p of RECEPTION_PRACTICES) expect(PRACTICE_LABEL[p]).toBeTruthy()
    expect(Object.keys(DELIVERY).sort()).toEqual(['atelier', 'error-as-method', 'field', 'n-1', 'studio'])
    expect(DELIVERY.atelier).toEqual({ repo: 'frankbueltge/ulysses', path: 'atelier-feedback/reception.md', secret: 'ATELIER_BOT_TOKEN' })
    expect(DELIVERY['n-1']?.path).toBe('reception.md')
  })

  it('normalize a page address', () => {
    expect(normalizePath('/consensus/')).toBe('/consensus')
    expect(normalizePath('/consensus/index.html')).toBe('/consensus')
    expect(normalizePath('/')).toBe('/')
    expect(formHref('n-1:x')).toBe('/reception/rate?work=n-1%3Ax')
  })
})

describe('workForPage, over the real sources', () => {
  const src = pageSources()

  it('finds the lab’s experiments by their address', () => {
    expect(src.experiments.length).toBeGreaterThan(10)
    const first = src.experiments[0]!
    expect(workForPage(`${first.href}/`, src)).toEqual({ id: `lab:${first.id}`, practice: 'lab', kind: 'experiment', title: first.title })
  })

  it('finds a native Astro work of the Field and the Atelier', () => {
    const field = [...src.astroWorks.keys()].find((k) => k.startsWith('field/'))
    expect(field).toBeTruthy()
    const [ns, slug] = field!.split('/') as [string, string]
    expect(workForPage(`/${ns}/werke/${slug}`, src)).toMatchObject({ id: `${ns}:${slug}`, kind: 'work' })
  })

  it('finds a nightly text work, and nothing on pages that are not works', () => {
    const [slug] = [...src.nightlyTexts.keys()]
    expect(slug).toBeTruthy()
    expect(workForPage(`/error-as-method/${slug}/`, src)).toMatchObject({ id: `error-as-method:${slug}`, practice: 'error-as-method' })
    for (const p of ['/', '/about', '/reception', '/field', '/field/werke', '/error-as-method', '/error-as-method/not-a-work', '/field/werke/not-a-work']) expect(workForPage(p, src)).toBeNull()
  })
})
