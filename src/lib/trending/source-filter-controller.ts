// The browser side of the "By source" register on /trending (reading aids, 2026-11-14).
//
// Every source and every line it prints is rendered on the server, so without JavaScript the
// register stands whole and open, the floor this house keeps for every page. With JavaScript this
// controller adds three things a register of thirty-four sources needs:
//
//   · a filter by kind of source, which hides the cards of the other kinds;
//   · a search over EVERY line of the morning, not only the eight a card prints: the day's own
//     JSON edition is read once, on the first query, and searched by src/lib/trending/search.ts;
//   · on a phone, the cards folded to one line each (the source and its first line), because
//     thirty-four open cards are some twenty screens of scrolling there.
//
// The state lives in the address bar (?kind=…&q=…), so a filtered register can be sent to
// someone. All decisions are made by the pure functions in ./search.ts; this file only reads
// and writes the DOM, and it writes text with textContent, never as markup: the labels are
// other people's headlines.
//
// DOM contract (written by src/components/pages/TrendingSources.astro):
//   root      [data-ledger] data-json data-top
//   controls  [data-q] [data-kind][aria-pressed] [data-count] [data-reset] [data-fold]
//   cards     [data-cards] > details[data-source][data-group] with li[data-signal]
//   results   [data-results] [data-empty]
import { compact } from './format'
import { sourceGroupLabel } from './groups'
import { EMPTY_FILTER, isSearching, parseFilter, searchDay, serialiseFilter, type LedgerFilter, type SearchResult } from './search'
import { matchesText } from '../catalogue/query'
import type { TrendingDay } from './types'

const NARROW = '(max-width: 639.98px)'

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text !== undefined) node.textContent = text
  return node
}

/** A day file is trusted only as far as its shape: the two members the search reads. */
function isDay(raw: unknown): raw is TrendingDay {
  if (!raw || typeof raw !== 'object') return false
  const r = raw as Record<string, unknown>
  return Array.isArray(r.sources) && Array.isArray(r.topics) && typeof r.signals === 'object' && r.signals !== null
}

// The house's ClientRouter swaps pages without reloading, so this module outlives the page it
// wired: walking from one archived day to the next runs initSourceFilter again on a new DOM. The
// listeners that sit on `document` and `window` are bound through this signal and cut loose
// before the next wiring, or every visited day would leave one more pair behind.
let wired: AbortController | null = null

export function initSourceFilter(root: HTMLElement): void {
  wired?.abort()
  wired = new AbortController()
  const { signal } = wired
  const cardsEl = root.querySelector<HTMLElement>('[data-cards]')
  if (!cardsEl) return
  const cards = Array.from(cardsEl.querySelectorAll<HTMLDetailsElement>('details[data-source]'))
  const q = root.querySelector<HTMLInputElement>('[data-q]')
  const countEl = root.querySelector<HTMLElement>('[data-count]')
  const resetEl = root.querySelector<HTMLButtonElement>('[data-reset]')
  const foldEl = root.querySelector<HTMLButtonElement>('[data-fold]')
  const resultsEl = root.querySelector<HTMLElement>('[data-results]')
  const emptyEl = root.querySelector<HTMLElement>('[data-empty]')
  const kindButtons = Array.from(root.querySelectorAll<HTMLButtonElement>('[data-kind]'))
  const jsonUrl = root.dataset.json ?? ''
  const top = Number(root.dataset.top) || 8
  const narrow = window.matchMedia(NARROW)

  let state: LedgerFilter = parseFilter(location.search)
  let day: TrendingDay | null = null
  let loading: Promise<void> | null = null
  let failed = false
  // The kind the phone fold was last applied for: the fold follows a change of kind, and is left
  // alone otherwise, so a card a reader opened by hand stays open while they type.
  let foldedFor: string | null = null

  const load = (): Promise<void> => {
    if (day || failed) return Promise.resolve()
    if (!loading) {
      loading = fetch(jsonUrl, { headers: { Accept: 'application/json' } })
        .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
        .then((raw: unknown) => {
          if (!isDay(raw)) throw new Error('shape')
          day = raw
        })
        .catch(() => {
          failed = true
        })
    }
    return loading
  }

  const setOpen = (open: boolean) => {
    for (const c of cards) if (!c.hidden) c.open = open
    syncFold()
  }

  const syncFold = () => {
    if (!foldEl) return
    const visible = cards.filter((c) => !c.hidden)
    const anyClosed = visible.some((c) => !c.open)
    foldEl.textContent = anyClosed ? 'Open all' : 'Fold all'
    foldEl.dataset.fold = anyClosed ? 'open' : 'close'
  }

  /** One line of a result, built the way the server builds a card's line. */
  const hitLine = (hit: SearchResult['sources'][number]['hits'][number]): HTMLLIElement => {
    const li = el('li', 'tr-signal')
    const label = el('span', 'tr-signal-label')
    if (hit.url) {
      const a = el('a', 'underline decoration-line underline-offset-2 transition-colors hover:text-fg', hit.label)
      a.href = hit.url
      a.target = '_blank'
      a.rel = 'noopener nofollow'
      label.append(a)
    } else {
      label.append(el('span', undefined, hit.label))
    }
    if (hit.geo) label.append(el('span', 'ml-1 font-mono text-mono-xs text-fg-faint', hit.geo))
    if (hit.desk) label.append(el('span', 'ml-1 whitespace-nowrap font-mono text-mono-xs text-fg-faint', hit.desk))
    if (hit.crossing) {
      const mark = el('span', 'tr-cross', `${hit.crossing} sources`)
      mark.title = `Carried by ${hit.crossing} independent sources this morning`
      label.append(mark)
    }
    li.append(label, el('span', 'tr-signal-n font-mono text-mono-xs tabular-nums text-fg-faint', hit.magnitudeText))
    return li
  }

  const renderResults = (result: SearchResult) => {
    if (!resultsEl) return
    const frag = document.createDocumentFragment()
    for (const s of result.sources) {
      const section = el('section', 'tr-source tr-source-result')
      section.append(el('h3', 'text-h3 font-semibold', s.label))
      section.append(
        el(
          'p',
          'mt-0.5 font-mono text-mono-sm text-fg-faint',
          `${compact(s.hits.length)} ${s.hits.length === 1 ? 'line' : 'lines'} · ${sourceGroupLabel(s.group)}`,
        ),
      )
      const ol = el('ol', 'mt-2 space-y-1 text-sm')
      for (const hit of s.hits) ol.append(hitLine(hit))
      section.append(ol)
      frag.append(section)
    }
    resultsEl.replaceChildren(frag)
  }

  /** Without the day file, the search falls back to the lines the page already prints, and the
   *  count line says that this is all it looked through. */
  const filterPrinted = (): { lines: number; sources: number } => {
    let lines = 0
    let sources = 0
    for (const c of cards) {
      const kindOk = state.kind === 'all' || c.dataset.group === state.kind
      let own = 0
      for (const li of c.querySelectorAll<HTMLElement>('li[data-signal]')) {
        const hit = kindOk && matchesText(li.textContent ?? '', state.q)
        li.hidden = !hit
        if (hit) own++
      }
      c.hidden = own === 0
      if (own > 0) {
        c.open = true
        sources++
        lines += own
      }
    }
    return { lines, sources }
  }

  const showAllLines = () => {
    for (const li of cardsEl.querySelectorAll<HTMLElement>('li[data-signal][hidden]')) li.hidden = false
  }

  const render = (writeUrl: boolean) => {
    for (const b of kindButtons) b.setAttribute('aria-pressed', String(b.dataset.kind === state.kind))
    if (q && q.value !== state.q) q.value = state.q
    if (resetEl) resetEl.hidden = state.kind === 'all' && !state.q.trim()
    if (writeUrl) {
      history.replaceState(history.state, '', `${location.pathname}${serialiseFilter(state)}${location.hash}`)
    }

    const searching = isSearching(state)
    const quoted = `“${state.q.trim()}”`
    const kindNote = state.kind === 'all' ? '' : ` · ${sourceGroupLabel(state.kind)}`

    if (!searching) {
      showAllLines()
      let shown = 0
      for (const c of cards) {
        c.hidden = state.kind !== 'all' && c.dataset.group !== state.kind
        if (!c.hidden) shown++
      }
      // On a phone the whole register is folded and a chosen kind is opened: choosing "Science"
      // is asking to read those three sources.
      if (narrow.matches && foldedFor !== state.kind) {
        for (const c of cards) if (!c.hidden) c.open = state.kind !== 'all'
      }
      foldedFor = state.kind
      cardsEl.hidden = false
      if (resultsEl) resultsEl.hidden = true
      if (emptyEl) emptyEl.hidden = true
      if (foldEl) foldEl.hidden = false
      if (countEl) {
        countEl.textContent =
          state.kind === 'all'
            ? `${cards.length} sources · the first ${top} lines of each`
            : `${shown} of ${cards.length} sources${kindNote} · the first ${top} lines of each`
      }
      syncFold()
      return
    }

    if (foldEl) foldEl.hidden = true
    if (!day && !failed) {
      if (countEl) countEl.textContent = 'Reading the whole morning…'
      void load().then(() => render(false))
      return
    }

    if (day) {
      const result = searchDay(day, state)
      renderResults(result)
      cardsEl.hidden = true
      if (resultsEl) resultsEl.hidden = result.total === 0
      if (emptyEl) emptyEl.hidden = result.total > 0
      if (countEl) {
        const lines = `${compact(result.total)} ${result.total === 1 ? 'line' : 'lines'}`
        const where = `${result.sources.length} ${result.sources.length === 1 ? 'source' : 'sources'}`
        const capped = result.listed < result.total ? ` · the first ${compact(result.listed)} are listed` : ''
        countEl.textContent =
          result.total === 0
            ? `No line of this morning carries ${quoted}${kindNote}`
            : `${lines} in ${where} carry ${quoted}${kindNote}${capped}`
      }
      return
    }

    // The day file did not arrive: search what the page prints, and say so.
    const printed = filterPrinted()
    cardsEl.hidden = false
    if (resultsEl) resultsEl.hidden = true
    if (emptyEl) emptyEl.hidden = printed.lines > 0
    if (countEl) {
      countEl.textContent = `${printed.lines} of the lines printed here carry ${quoted}${kindNote} · the day file could not be read, so the rest of the morning was not searched`
    }
  }

  const update = (next: Partial<LedgerFilter>) => {
    state = { ...state, ...next }
    render(true)
  }

  for (const b of kindButtons) {
    b.addEventListener('click', () => update({ kind: (b.dataset.kind ?? 'all') as LedgerFilter['kind'] }))
  }
  let typing: number | undefined
  q?.addEventListener('input', () => {
    window.clearTimeout(typing)
    typing = window.setTimeout(() => update({ q: q.value }), 140)
  })
  // The day file is read when the box is first entered, so the first keystroke already has it.
  q?.addEventListener('focus', () => void load(), { once: true })
  // Enter in the search box must not submit anything; the box filters as one types.
  q?.closest('form')?.addEventListener('submit', (e) => e.preventDefault())
  resetEl?.addEventListener('click', () => update({ ...EMPTY_FILTER }))
  foldEl?.addEventListener('click', () => setOpen(foldEl.dataset.fold !== 'close'))
  for (const c of cards) c.addEventListener('toggle', syncFold)

  /** A link to a source (#src-…) opens its card, and clears a filter that would hide it. Returns
   *  the card, or nothing when the fragment names no source. */
  const openTarget = (hash: string): HTMLDetailsElement | undefined => {
    // A source id is plain ASCII, so the fragment is compared as it stands: decoding it could
    // only throw on a malformed one typed by hand.
    const id = hash.replace(/^#/, '')
    if (!id.startsWith('src-')) return undefined
    const target = cards.find((c) => c.id === id)
    if (!target) return undefined
    if (target.hidden || isSearching(state)) update({ ...EMPTY_FILTER })
    target.open = true
    syncFold()
    return target
  }
  // The card is opened ON THE CLICK, before the page moves: the router then scrolls to a target
  // that already has its full height. (`hashchange` alone would not do. The ClientRouter writes a
  // same-page fragment with pushState, which fires no such event.)
  document.addEventListener(
    'click',
    (e) => {
      const a = (e.target as Element | null)?.closest?.('a[href^="#src-"]')
      if (a) openTarget(a.getAttribute('href') ?? '')
    },
    { signal },
  )
  // Back and forward, and a fragment typed into the address bar.
  window.addEventListener('hashchange', () => openTarget(location.hash), { signal })
  window.addEventListener('popstate', () => openTarget(location.hash), { signal })

  render(false)
  // A page opened on a source's fragment: the browser scrolled there before the phone fold
  // closed the cards above it, so the place is found again once the fold has settled.
  openTarget(location.hash)?.scrollIntoView({ block: 'start' })
}
