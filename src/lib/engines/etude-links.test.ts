import { describe, expect, it } from 'vitest'
import { isEtudeHref, mirrorPathOfRepoUrl, rewriteEtudeLinks } from './etude-links'

const built = new Set([
  'field/presentations/cycle-012/index.html',
  'field/artifacts/after-cycle-012/who-the-curve-speaks-for/index.html',
  'field/artifacts/cycle-014/live-one/index.html',
  'studio/etudes/unread/index.html',
  'studio/werke-html/2026-11-08-no-public-land/index.html',
  'atelier/artifacts/after-cycle-012/the-edge/index.html',
])
const has = (f: string) => built.has(f)
const page = 'field/artifacts/after-cycle-012/the-two-days/index.html'
const link = (href: string, from = page) => {
  const m = /href="([^"]*)"/.exec(rewriteEtudeLinks(`<a href="${href}">x</a>`, from, has).html)
  return m?.[1]
}

describe('études', () => {
  it('are told apart from main works by their place', () => {
    expect(isEtudeHref('/field/artifacts/after-cycle-012/the-two-days/')).toBe(true)
    expect(isEtudeHref('/atelier/artifacts/after-cycle-013/should-always/')).toBe(true)
    expect(isEtudeHref('/studio/etudes/unread/')).toBe(true)
    expect(isEtudeHref('/field/artifacts/cycle-012/the-quiet-curve/')).toBe(false)
    expect(isEtudeHref('/studio/werke-html/2026-11-12-whose-gate/')).toBe(false)
    expect(isEtudeHref('/field/presentations/cycle-012/')).toBe(false)
  })

  it('reads a repository address on main as its mirror place, and leaves a pinned commit', () => {
    expect(mirrorPathOfRepoUrl('https://github.com/frankbueltge/studio/tree/main/etudes/unread')).toBe('studio/etudes/unread')
    expect(mirrorPathOfRepoUrl('https://github.com/frankbueltge/ulysses/tree/main/artifacts/after-cycle-012/the-edge')).toBe('atelier/artifacts/after-cycle-012/the-edge')
    expect(mirrorPathOfRepoUrl('https://github.com/frankbueltge/studio/blob/06af1a5/etudes/unread/data.json')).toBeNull()
    expect(mirrorPathOfRepoUrl('https://github.com/frankbueltge/research-ecology/blob/main/programme/STATE.md')).toBe(null)
  })

  it("send a presented cycle's work to the cycle's presentation", () => {
    expect(link('../../cycle-012/the-quiet-curve/index.html')).toBe('/field/presentations/cycle-012/')
    expect(link('https://github.com/frankbueltge/field-research/tree/main/artifacts/cycle-012/the-quiet-curve')).toBe('/field/presentations/cycle-012/')
  })

  it("send a sibling's étude or work to its page on the site", () => {
    expect(link('https://github.com/frankbueltge/studio/tree/main/etudes/unread')).toBe('/studio/etudes/unread/')
    expect(link('https://github.com/frankbueltge/ulysses/tree/main/artifacts/after-cycle-012/the-edge')).toBe('/atelier/artifacts/after-cycle-012/the-edge/')
    expect(link('../../works/2026-11-08-no-public-land/index.html', 'studio/etudes/no-road-in/index.html')).toBe('/studio/werke-html/2026-11-08-no-public-land/')
  })

  it('leave what already opens on the site, files, pinned versions and pieces the site does not show', () => {
    expect(link('../who-the-curve-speaks-for/index.html')).toBe('../who-the-curve-speaks-for/index.html')
    expect(link('../../cycle-012/the-quiet-curve/analyse53.py')).toBe('../../cycle-012/the-quiet-curve/analyse53.py')
    expect(link('https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-012/the-two-days/READING57.md')).toBe(
      'https://github.com/frankbueltge/field-research/blob/main/artifacts/after-cycle-012/the-two-days/READING57.md',
    )
    expect(link('https://github.com/frankbueltge/studio/tree/main/etudes/not-mirrored')).toBe('https://github.com/frankbueltge/studio/tree/main/etudes/not-mirrored')
    expect(link('${r.url}')).toBe('${r.url}')
    expect(link('#fig')).toBe('#fig')
  })
})

describe("the house's own pages", () => {
  it('keep the address an étude gives them', () => {
    const r = rewriteEtudeLinks('<a href="/impressum">i</a><a href="/ecology/">e</a>', page, (f) => f === 'impressum/index.html' || f === 'ecology/index.html')
    expect(r.changed).toBe(0)
  })
})
