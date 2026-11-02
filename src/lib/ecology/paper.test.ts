// The Field's paper, rendered (2026-10-07): the practice's words verbatim, its links reaching the
// files mirrored beside it, its own anchors landing, and no markup of its own run on this site.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { paperMeta, renderPaper, resolvePaperHref } from './paper'
import { citationTags, type PaperEntry } from './papers'

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
    // loadPaperEntries (./papers.ts) is loadFieldPapers with each paper's own metadata beside it
    expect(page).toContain('loadPaperEntries()')
    expect(page).toContain('renderPaper(')
  })

  it('carries the citation tags a scholar’s index reads, and its own preview card', () => {
    expect(page).toContain('citationTags(paper)')
    expect(page).toContain('ogImage={paper.ogImage}')
    expect(page).toContain('href="/field/papers/"')
  })

  it('is linked from /ecology, beside the presentation it belongs to', () => {
    // Since 2026-10-11 /ecology is the score (EcologyScore.astro): a cycle's presentations stand
    // under the drawing when the cycle is selected, and the Field's paper stands beside its own.
    const page = fs.readFileSync(fileURLToPath(new URL('../../components/ecology/score/EcologyScore.astro', import.meta.url)), 'utf8')
    expect(page).toContain('p.paperHref && <a')
    expect(page).toContain('W.detail.paper')
  })
})

describe('what a paper says about itself (2026-10-18)', () => {
  const SOURCE = `# What a warning record can say: *seven* studies

**The Field (Meridian), research ecology at frankbueltge.de.** Preprint, cycle 008, 2026-10-16.
Not peer reviewed. Data: \`artifacts/2026-10-14-the-tornadoes-that-came/\` (this repository).

## Abstract

A warning is a record written before its danger arrives, so it can be held against
what came. See [the method](#method).

Second paragraph of the abstract.

## Method

Text.
`

  it('reads its title, the day of its preprint line, and the first paragraph of its abstract', () => {
    expect(paperMeta(SOURCE)).toEqual({
      title: 'What a warning record can say: seven studies',
      date: '2026-10-16',
      abstract: 'A warning is a record written before its danger arrives, so it can be held against what came. See the method.',
    })
  })

  it('guesses nothing it does not say', () => {
    expect(paperMeta('no heading, no date, no abstract')).toEqual({ title: null, date: null, abstract: null })
    expect(paperMeta('# T\n\nWritten 2026-10-08, revised.\n').date).toBe('2026-10-08')
  })

  it('is cited with the Highwire tags Google Scholar names, under the practice’s own name', () => {
    const entry: PaperEntry = {
      cycle: 8,
      dir: 'cycle-008',
      file: 'public/field/presentations/cycle-008/paper.md',
      href: '/field/papers/cycle-008/',
      title: 'What a warning record can say',
      date: '2026-10-16',
      abstract: null,
      presentationHref: '/field/presentations/cycle-008/',
      rawHref: '/field/presentations/cycle-008/paper.md',
      pdfHref: null,
      ogImage: '/og/papers/cycle-008.png',
    }
    const tags = Object.fromEntries(citationTags(entry).map((t) => [t.name, t.content]))
    expect(tags).toMatchObject({
      citation_title: 'What a warning record can say',
      citation_author: 'Meridian',
      citation_publication_date: '2026/10/16',
    })
    expect(tags.citation_pdf_url).toBeUndefined()
    const withPdf = Object.fromEntries(citationTags({ ...entry, pdfHref: '/field/presentations/cycle-008/paper.pdf' }).map((t) => [t.name, t.content]))
    expect(withPdf.citation_pdf_url).toBe('https://frankbueltge.de/field/presentations/cycle-008/paper.pdf')
  })
})

describe('the index of the papers', () => {
  const index = fs.readFileSync(fileURLToPath(new URL('../../pages/field/papers/index.astro', import.meta.url)), 'utf8')

  it('exists, and lists every paper from the mirror', () => {
    expect(index).toContain('loadPaperEntries()')
    expect(index).toContain('papers.map(')
  })

  it('is a door on the Field’s page and a link under the dossier’s shelf', async () => {
    const { DOORS } = await import('./pyramid/station')
    expect(DOORS.field.map((d) => d.href)).toContain('/field/papers')
    const { DOSSIER } = await import('@/config/dossier-wording')
    expect(DOSSIER.works.papers.href).toBe('/field/papers/')
  })
})
