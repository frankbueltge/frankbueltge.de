// src/lib/ecology/papers.ts — the Field's papers as one shelf, findable (2026-10-18).
//
// Since 2026-10-07 every Field presentation carries a paper (./paper.ts renders each one at
// /field/papers/cycle-NNN/). Until this day nothing listed them: /field/papers/ was a 404, the
// Field's page did not link them, and a scholar's index had nothing to read. This module gives the
// index page (src/pages/field/papers/index.astro) its entries, each paper page its citation tags
// (Google Scholar's Highwire Press names), and each paper its preview card
// (src/pages/og/papers/[cycle].png.ts). Every value comes from the paper's own text or from the
// mirror; a PDF is cited only where the Field committed one beside the paper.

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { SHARE } from '@/config/share-wording'
import { SITE } from '@/lib/site'
import { dayMonthYear } from '@/lib/ops/since'
import { paperMeta } from './paper'
import { loadFieldPapers, PAPER_FILE, type FieldPaper } from './v3'

export interface PaperEntry extends FieldPaper {
  title: string
  date: string | null
  abstract: string | null
  /** the presentation the paper belongs to */
  presentationHref: string
  /** the raw paper.md beside it */
  rawHref: string
  /** a PDF the Field committed beside the paper, or null */
  pdfHref: string | null
  /** its preview card */
  ogImage: string
}

const PDF_FILE = 'paper.pdf'

/** Every paper, newest first, read from the mirror. */
export function loadPaperEntries(root: string = process.cwd()): PaperEntry[] {
  return loadFieldPapers(root).map((paper) => {
    const meta = paperMeta(readFileSync(join(root, paper.file), 'utf8'))
    const presentationHref = `/field/presentations/${paper.dir}/`
    const pdf = join(root, 'public', 'field', 'presentations', paper.dir, PDF_FILE)
    return {
      ...paper,
      title: meta.title ?? `The Field, cycle ${pad(paper.cycle)}`,
      date: meta.date,
      abstract: meta.abstract,
      presentationHref,
      rawHref: `${presentationHref}${PAPER_FILE}`,
      pdfHref: existsSync(pdf) ? `${presentationHref}${PDF_FILE}` : null,
      ogImage: `/og/papers/${paper.dir}.png`,
    }
  })
}

const pad = (n: number) => String(n).padStart(3, '0')

/**
 * The tags Google Scholar reads to index a paper (its inclusion guidelines name the Highwire Press
 * tags): title, author, publication date as YYYY/MM/DD, and the PDF where one exists. The author is
 * the practice's persona, the name the paper is written under.
 */
export function citationTags(entry: PaperEntry): { name: string; content: string }[] {
  const P = SHARE.papers
  const tags = [
    { name: 'citation_title', content: entry.title },
    { name: 'citation_author', content: P.citationAuthor },
  ]
  if (entry.date) tags.push({ name: 'citation_publication_date', content: entry.date.replace(/-/g, '/') })
  tags.push({ name: 'citation_language', content: 'en' })
  tags.push({ name: 'citation_fulltext_html_url', content: `${SITE.url}${entry.href}` })
  if (entry.pdfHref) tags.push({ name: 'citation_pdf_url', content: `${SITE.url}${entry.pdfHref}` })
  return tags
}

/** What the paper's card says. */
export function paperCard(entry: PaperEntry) {
  const line = [SHARE.kind.paper(pad(entry.cycle)), entry.date ? dayMonthYear(entry.date) : null].filter(Boolean).join(' · ')
  return { kicker: SHARE.practice.field.kicker, title: entry.title, line, practice: 'field' as const }
}

/** The index's own card. */
export const PAPERS_INDEX_CARD = {
  kicker: SHARE.practice.field.kicker,
  title: SHARE.papers.title,
  line: SHARE.papers.cardLine,
  practice: 'field' as const,
}
