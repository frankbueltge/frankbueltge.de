// The browser side of the three catalogues (/papers, /atlas, /datasets), 2026-11-09.
//
// Every card is rendered on the server, so without JavaScript the whole catalogue stands and
// can be read top to bottom — the floor this house keeps for every page. With JavaScript this
// controller adds what a catalogue of thousands needs: a search box, a sort, folded filters,
// paging ("show more" instead of thousands of cards at once), and the state in the address bar
// so a filtered view can be sent to someone. All decisions are made by the pure functions in
// ./query.ts; this file only reads and writes the DOM.
//
// DOM contract (written by src/components/catalogue/CatalogueToolbar.astro and the pages):
//   root      [data-catalogue] data-groups data-multi data-sorts data-sort-desc
//             data-default-sort data-page-size
//   cards     [data-list] > [data-card] with data-f-<group>, data-s-<sort>, data-text
//   controls  [data-q] [data-sort-select] [data-filter][data-value] [data-count] [data-reset]
//             [data-more] [data-more-n] [data-active] [data-panel] [data-empty]
import {
  activeFilterCount,
  compareKeys,
  matchesCard,
  parseState,
  serialiseState,
  type CatalogueState,
} from './query'

const words = (s: string | undefined) => (s ?? '').split(' ').filter(Boolean)

export function initCatalogue(root: HTMLElement): void {
  const groups = words(root.dataset.groups)
  const multi = new Set(words(root.dataset.multi))
  const sorts = words(root.dataset.sorts)
  const descending = new Set(words(root.dataset.sortDesc))
  const defaultSort = root.dataset.defaultSort ?? sorts[0] ?? ''
  const pageSize = Number(root.dataset.pageSize) || 50

  const list = root.querySelector<HTMLElement>('[data-list]')
  if (!list) return
  const cards = Array.from(list.querySelectorAll<HTMLElement>(':scope > [data-card]'))
  const facts = new Map(
    cards.map((c) => [
      c,
      {
        facets: Object.fromEntries(groups.map((g) => [g, c.getAttribute(`data-f-${g}`) ?? ''])),
        text: c.dataset.text ?? c.textContent ?? '',
      },
    ]),
  )

  const q = root.querySelector<HTMLInputElement>('[data-q]')
  const sortSelect = root.querySelector<HTMLSelectElement>('[data-sort-select]')
  const countEl = root.querySelector<HTMLElement>('[data-count]')
  const resetEl = root.querySelector<HTMLButtonElement>('[data-reset]')
  const moreEl = root.querySelector<HTMLButtonElement>('[data-more]')
  const moreN = root.querySelector<HTMLElement>('[data-more-n]')
  const activeEl = root.querySelector<HTMLElement>('[data-active]')
  const panel = root.querySelector<HTMLDetailsElement>('[data-panel]')
  const emptyEl = root.querySelector<HTMLElement>('[data-empty]')
  const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-filter]'))

  let state: CatalogueState = parseState(location.search, groups, sorts, defaultSort)
  let shown = pageSize
  let sortedFor = ''

  const sortCards = () => {
    if (sortedFor === state.sort) return
    const key = `data-s-${state.sort}`
    const desc = descending.has(state.sort)
    // Stable: ties keep the server's order, which is each page's documented default order.
    const order = cards
      .map((c, i) => ({ c, i, k: c.getAttribute(key) ?? '' }))
      .sort((a, b) => compareKeys(a.k, b.k, desc) || a.i - b.i)
    const frag = document.createDocumentFragment()
    for (const { c } of order) frag.appendChild(c)
    list.appendChild(frag)
    sortedFor = state.sort
  }

  const render = (writeUrl: boolean) => {
    sortCards()
    let matched = 0
    for (const c of list.children as HTMLCollectionOf<HTMLElement>) {
      const f = facts.get(c)
      if (!f) continue
      const hit = matchesCard(f, state, multi)
      if (hit) matched++
      c.hidden = !hit || matched > shown
    }
    if (countEl) countEl.textContent = String(matched)
    const rest = Math.max(0, matched - shown)
    if (moreEl) moreEl.hidden = rest === 0
    if (moreN) moreN.textContent = String(Math.min(rest, pageSize))
    if (emptyEl) emptyEl.hidden = matched > 0
    const active = activeFilterCount(state)
    if (activeEl) activeEl.textContent = active ? String(active) : ''
    if (resetEl) resetEl.hidden = active === 0 && !state.q.trim()
    for (const b of buttons) {
      const g = b.dataset.filter ?? ''
      b.setAttribute('aria-pressed', String((state.filters[g] ?? 'all') === b.dataset.value))
    }
    if (q && q.value !== state.q) q.value = state.q
    if (sortSelect && sortSelect.value !== state.sort) sortSelect.value = state.sort
    if (writeUrl) {
      const url = `${location.pathname}${serialiseState(state, defaultSort)}${location.hash}`
      history.replaceState(history.state, '', url)
    }
  }

  const update = (next: Partial<CatalogueState>) => {
    state = { ...state, ...next, filters: { ...state.filters, ...(next.filters ?? {}) } }
    shown = pageSize
    render(true)
  }

  for (const b of buttons) {
    b.addEventListener('click', () => {
      const g = b.dataset.filter ?? ''
      update({ filters: { [g]: b.dataset.value ?? 'all' } })
    })
  }
  let typing: number | undefined
  q?.addEventListener('input', () => {
    window.clearTimeout(typing)
    typing = window.setTimeout(() => update({ q: q.value }), 120)
  })
  // Enter in the search box must not submit anything; the box filters as one types.
  q?.closest('form')?.addEventListener('submit', (e) => e.preventDefault())
  sortSelect?.addEventListener('change', () => update({ sort: sortSelect.value }))
  resetEl?.addEventListener('click', () => {
    update({ q: '', filters: Object.fromEntries(groups.map((g) => [g, 'all'])) })
  })
  moreEl?.addEventListener('click', () => {
    shown += pageSize
    render(false)
  })

  // The filters are rendered open; on a phone they are folded into their bar, where they used to
  // fill two screens before the first entry. A link that arrives with filters set keeps them open.
  if (panel && !window.matchMedia('(min-width: 768px)').matches && activeFilterCount(state) === 0) {
    panel.open = false
  }
  render(false)
}
