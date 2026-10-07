// The Field's paper, rendered (2026-10-07): the practice's words verbatim, its links reaching the
// files mirrored beside it, its own anchors landing, and no markup of its own run on this site.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { renderPaper, resolvePaperHref } from './paper'

const PAPER = `# Where *end-to-end* research breaks

**Meridian** — The Field, cycle 006 · preprint

## Abstract

We measured it. See [the method](#method), [the data](data/frames.csv) and [the check](./check.py).

## Method

![Figure 1](figures/fig1.svg)

| reader | frames |
|---|---|
| one | 360 |

An earlier cycle: [cycle 005](../cycle-005/SUMMARY.md). The engine's own record: [memory](../../memory/claims.md).
A source: [GBIF][gbif]. Inline <script>alert(1)</script> stays text.

## References

1. GBIF.org (2026). Occurrence download. https://www.gbif.org/

[gbif]: https://www.gbif.org/
`

describe('where a link inside the paper lands', () => {
  it('resolves a relative path against the presentation the paper sits in', () => {
    expect(resolvePaperHref('data/frames.csv', 'cycle-006')).toBe('/field/presentations/cycle-006/data/frames.csv')
    expect(resolvePaperHref('./check.py', 'cycle-006')).toBe('/field/presentations/cycle-006/check.py')
    expect(resolvePaperHref('../cycle-005/SUMMARY.md#p2', 'cycle-006')).toBe('/field/presentations/cycle-005/SUMMARY.md#p2')
  })

  it("points a path that leaves the mirrored presentations at the Field's repository", () => {
    expect(resolvePaperHref('../../memory/claims.md', 'cycle-006')).toBe(
      'https://github.com/frankbueltge/field-research/blob/main/memory/claims.md',
    )
    expect(resolvePaperHref('../../../outside.md', 'cycle-006')).toBe('../../../outside.md')
  })

  it('leaves absolute URLs, root paths and fragments as written', () => {
    for (const href of ['https://www.gbif.org/', 'mailto:x@example.org', '/ecology', '#method']) {
      expect(resolvePaperHref(href, 'cycle-006')).toBe(href)
    }
  })
})

describe('the rendered paper', () => {
  const { title, html } = renderPaper(PAPER, 'cycle-006')

  it("takes its title from the paper's own first heading", () => {
    expect(title).toBe('Where end-to-end research breaks')
    expect(renderPaper('no heading here', 'cycle-006').title).toBeNull()
  })

  it('gives every heading an id its own links can reach', () => {
    expect(html).toContain('<h2 id="abstract">Abstract</h2>')
    expect(html).toContain('<h2 id="method">Method</h2>')
    expect(html).toContain('<h2 id="references">References</h2>')
    expect(html).toContain('href="#method"')
  })

  it('resolves links and figures against the mirrored presentation', () => {
    expect(html).toContain('href="/field/presentations/cycle-006/data/frames.csv"')
    expect(html).toContain('src="/field/presentations/cycle-006/figures/fig1.svg"')
    expect(html).toContain('href="/field/presentations/cycle-005/SUMMARY.md"')
    expect(html).toContain('href="https://github.com/frankbueltge/field-research/blob/main/memory/claims.md"')
  })

  it('renders reference links, tables and bare URLs', () => {
    expect(html).toContain('<a href="https://www.gbif.org/">GBIF</a>')
    expect(html).toContain('<table>')
    expect(html).toContain('<a href="https://www.gbif.org/">https://www.gbif.org/</a>')
  })

  it('never runs markup of its own on this site', () => {
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;script&gt;')
  })
})

describe('the page', () => {
  const page = fs.readFileSync(fileURLToPath(new URL('../../pages/field/papers/[cycle].astro', import.meta.url)), 'utf8')

  it('builds one page per mirrored paper and renders it through this module', () => {
    expect(page).toContain('loadFieldPapers()')
    expect(page).toContain('renderPaper(')
  })

  it('is linked from the presentation shelf on /ecology', () => {
    const entrance = fs.readFileSync(fileURLToPath(new URL('../../components/ecology/EcologyV3Entrance.astro', import.meta.url)), 'utf8')
    expect(entrance).toContain('e.paperHref')
  })
})
