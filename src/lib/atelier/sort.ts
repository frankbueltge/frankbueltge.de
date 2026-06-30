// src/lib/atelier/sort.ts
// Chronologie-Sortierung für die Atelier-Seite. Reine Funktionen, testbar (sort.test.ts) —
// bewusst nicht im .astro-Frontmatter vergraben.

/** Sortierschlüssel eines Tagebuch-Eintrags: [datum als YYYYMMDD-Zahl, Sitzungsnummer].
 *  Reine Datums-Einträge (z. B. „journal/2026-06-30") gelten als Sitzung 0 (ältester des Tages). */
export function journalSortKey(id: string): [number, number] {
  const date = id.match(/(\d{4})-(\d{2})-(\d{2})/)
  const dateNum = date ? Number(date[1] + date[2] + date[3]) : 0
  const session = id.match(/-sitzung-(\d+)/)
  return [dateNum, session ? Number(session[1]) : 0]
}

/** Tagebuch newest-first: Datum absteigend, dann Sitzungsnummer absteigend (numerisch). */
export function sortJournal<T extends { id: string }>(entries: T[]): T[] {
  return [...entries].sort((a, b) => {
    const [da, sa] = journalSortKey(a.id)
    const [db, sb] = journalSortKey(b.id)
    return db - da || sb - sa
  })
}

/** Werke newest-first: Datum absteigend, Tiebreak Slug absteigend (deterministisch).
 *  Ohne `date` dient der Slug als Schlüssel (Slugs sind datums­präfigiert). */
export function sortWorks<T extends { slug: string; date?: string }>(works: T[]): T[] {
  const key = (w: T) => w.date ?? w.slug
  return [...works].sort((a, b) => (key(b) < key(a) ? -1 : key(b) > key(a) ? 1 : b.slug < a.slug ? -1 : b.slug > a.slug ? 1 : 0))
}
