// The one query model behind the three catalogues (/papers, /atlas, /datasets), 2026-11-09.
//
// Until this date each catalogue carried its own copy of the same filter script, and none of
// them could search, sort, page or put its state in the address bar. With 4,000 papers and 665
// works that stopped being a convenience question: a reader could not find a title, and could
// not send anyone a filtered view. The logic lives here, pure and tested; the browser side
// (src/scripts/catalogue.ts) only reads the DOM and calls these functions.

/** What a reader has asked for: a free-text query, a sort key, one value per filter group. */
export interface CatalogueState {
  q: string
  sort: string
  filters: Record<string, string>
}

/** What a card offers to a query: its facet values per group and its searchable text. */
export interface CardFacts {
  facets: Record<string, string>
  text: string
}

/** Lower case, without diacritics, whitespace collapsed — "Asɛmpayɛtsia" and "Büchler" are
 *  found by what a reader can type. */
export const normalise = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim()

/** A title as a sort key: normalised, with leading quotes, brackets, symbols and ellipses
 *  dropped, so "(t)error" files under T and "@reply-all" under R rather than above A. */
export const titleSortKey = (s: string): string => normalise(s).replace(/^[^a-z0-9]+/, '')

/** Every whitespace-separated term of the query must occur in the text (AND, not OR): adding a
 *  word narrows the list, which is what a reader expects from a search box. */
export const matchesText = (text: string, q: string): boolean => {
  const terms = normalise(q).split(' ').filter(Boolean)
  if (terms.length === 0) return true
  const hay = normalise(text)
  return terms.every((t) => hay.includes(t))
}

/** A card passes when it passes every active group. Multi-valued groups (a paper cited by two
 *  practices, a work in three fields) test membership in a space-separated list; single-valued
 *  ones test equality. "all" is the inactive value. */
export const matchesCard = (
  card: CardFacts,
  state: CatalogueState,
  multi: ReadonlySet<string>,
): boolean => {
  for (const [group, value] of Object.entries(state.filters)) {
    if (!value || value === 'all') continue
    const have = card.facets[group] ?? ''
    const ok = multi.has(group) ? have.split(' ').includes(value) : have === value
    if (!ok) return false
  }
  return matchesText(card.text, state.q)
}

/** How many filter groups are narrowed — the number on the folded filter panel. */
export const activeFilterCount = (state: CatalogueState): number =>
  Object.values(state.filters).filter((v) => v && v !== 'all').length

/** Read a state from a query string. Unknown groups and unknown sorts are ignored rather than
 *  trusted: an old or hand-edited link opens the catalogue, never an empty page. */
export const parseState = (
  search: string,
  groups: readonly string[],
  sorts: readonly string[],
  defaultSort: string,
): CatalogueState => {
  const params = new URLSearchParams(search)
  const filters: Record<string, string> = {}
  for (const g of groups) filters[g] = params.get(g) || 'all'
  const sort = params.get('sort') ?? ''
  return {
    q: params.get('q') ?? '',
    sort: sorts.includes(sort) ? sort : defaultSort,
    filters,
  }
}

/** Write a state as a query string, leaving out everything at its default, so the plain
 *  address stays plain. Returns '' or a string beginning with '?'. */
export const serialiseState = (state: CatalogueState, defaultSort: string): string => {
  const params = new URLSearchParams()
  const q = state.q.trim()
  if (q) params.set('q', q)
  for (const [g, v] of Object.entries(state.filters)) if (v && v !== 'all') params.set(g, v)
  if (state.sort && state.sort !== defaultSort) params.set('sort', state.sort)
  const s = params.toString()
  return s ? `?${s}` : ''
}

/** Compare two sort keys as the catalogue writes them on its cards: numbers numerically,
 *  strings by locale, an empty key always last (an entry without a date is not "oldest"). */
export const compareKeys = (a: string, b: string, descending: boolean): number => {
  if (a === b) return 0
  if (a === '') return 1
  if (b === '') return -1
  const na = Number(a)
  const nb = Number(b)
  const cmp = Number.isFinite(na) && Number.isFinite(nb) ? na - nb : a.localeCompare(b)
  return descending ? -cmp : cmp
}
