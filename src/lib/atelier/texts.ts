// src/lib/atelier/texts.ts — the texts & catalogue, read as a register.
//
// These are the nightly line's apparatus texts (the genealogy, both positions, twenty-one error
// registers, the index, the first position), mirrored verbatim under works/*.md. Until 2026-08-15
// they rendered in full at the bottom of /atelier/works; now each is a page of its own behind a
// register row, and this module reads the row's facts out of the document itself — title from its
// H1, date from its own `**Date:**` line or its H1's parenthesis, never typed.

export type TextMove = 'error register' | 'position' | 'genealogy' | 'index' | 'text'

export interface AtelierTextFacts {
  slug: string
  /** the document's own H1, stripped of markdown */
  title: string
  /** the date the document itself states, or '' where it states none */
  date: string
  /** the record's own marker where the H1 carries one (Session N → "S<N>") */
  marker: string | null
  /** the kind of text — also the register's filter key */
  move: TextMove
}

const stripMd = (line: string): string =>
  line.replace(/[*_`]/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').trim()

export function textFacts(slug: string, body: string): AtelierTextFacts {
  const h1 = stripMd(/^#\s+(.+)$/m.exec(body)?.[1] ?? slug)
  const date =
    /^\*\*Date:\*\*\s*(\d{4}-\d{2}-\d{2})/m.exec(body)?.[1] ??
    /\((\d{4}-\d{2}-\d{2})\)/.exec(h1)?.[1] ??
    ''
  const session = /Session\s+(\d+)/.exec(h1)?.[1]

  const move: TextMove = slug.startsWith('fehlerkataster-')
    ? 'error register'
    : slug.startsWith('position-')
      ? 'position'
      : slug === 'genealogie'
        ? 'genealogy'
        : slug === 'index'
          ? 'index'
          : 'text'

  return { slug, title: h1, date, marker: session ? `S${session}` : null, move }
}

/** Register order: the document's own date, newest first; undated texts last, by slug. */
export function sortTexts(texts: readonly AtelierTextFacts[]): AtelierTextFacts[] {
  return [...texts].sort((a, b) => {
    if (a.date && b.date && a.date !== b.date) return a.date < b.date ? 1 : -1
    if (Boolean(a.date) !== Boolean(b.date)) return a.date ? -1 : 1
    return a.slug < b.slug ? 1 : -1
  })
}
