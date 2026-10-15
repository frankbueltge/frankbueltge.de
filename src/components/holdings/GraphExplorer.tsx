// src/components/holdings/GraphExplorer.tsx — the knowledge graph of the house, explorable
// (visual layer, Phase 3a, 2026-09-02; docs/design/2026-09-02-the-visual-layer.md §4).
//
// The island in the terms of the seven duties (.claude/rules/dataviz-figures.md, "Interaktive
// Figuren"):
//
//   1. IT COMPUTES NOTHING IT CLAIMS. The view, the voices, the ranks, the receipts and the
//      resting positions come from src/lib/graph/graph-explorer-model.ts (pure, tested). The
//      force layout here (d3-force) only RELAXES the radial arithmetic it is handed — links pull,
//      bodies repel, a radial force keeps every kind on its ring — and the drawing stays legible
//      as the same picture, warmer.
//   2. THE SERVER RENDER IS THE FLOOR. Every node, every edge, every label the drawing letters at
//      rest is in the HTML before a script runs, at the model's own coordinates. The controls
//      (filters, search, zoom) are what JavaScript adds; they stay `hidden` until the island has
//      mounted rather than sitting there dead. The table under the figure (TableFallback, laid by
//      the frame) repeats every node in words.
//   3. NO style ATTRIBUTE ANYWHERE. Positions are SVG attributes; the readout is placed through
//      setVars (dataviz/runtime.ts); voices arrive as `gx-v-<voice>` classes that
//      src/styles/graph-explorer.css inks — no hex is written here.
//   4. REDUCED MOTION: the simulation is run to rest synchronously and painted once; the d3
//      transitions of the zoom controls get duration zero.
//   5. THE READOUT follows dataviz/readout.ts — clamped to the figure's box, never a hit target.
//   6. THE BUDGET is `GraphExplorer` in scripts/budgets.json; d3 by submodule (d3-force,
//      d3-zoom, d3-selection, d3-transition), mounted `client:visible`. The search is a plain
//      combobox rather than cmdk: cmdk drags @radix-ui/react-dialog along for a search box
//      (about a third of this island's budget) and the listbox below needs nothing it offers.
//   7. NO NEW HUE. Kind is SHAPE, weight is SIZE; the three voices and the declared neutral are
//      the ecology-voices set, validated 2026-07-31.
import * as React from 'react'
import { forceCenter, forceCollide, forceLink, forceManyBody, forceRadial, forceSimulation } from 'd3-force'
import { select, type Selection } from 'd3-selection'
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from 'd3-zoom'
import 'd3-transition'

import { Button } from '@/components/ui/button'
import { createReadout, type ReadoutHandle } from '@/lib/dataviz/readout'
import { reducedMotion } from '@/lib/dataviz/runtime'
import {
  CANVAS,
  CENTRE,
  EDGE_KINDS,
  filterView,
  neighbourhood,
  NODE_KINDS,
  receiptsOf,
  RING,
  searchView,
  shortLabel,
  unpackView,
  type GraphView,
  type PackedView,
  type Placed,
  type Receipt,
  type ViewEdge,
  type ViewLike,
  type ViewNode,
  type Voice,
} from '@/lib/graph/graph-explorer-model'
import type { EdgeKind, NodeKind } from '@/lib/graph/types'
import type { FocusState } from '@/lib/tour/types'

import GraphNodeCard, { type NodeCardWording, type ReceiptsState } from './GraphNodeCard'

/** The frame resolves the wording canon before handing it over — plain strings only. */
export interface ExplorerWording {
  figureLabel: string
  hint: string
  kinds: Record<NodeKind, string>
  kindWhat: Record<NodeKind, string>
  kindCount: Record<NodeKind, string>
  edgeKinds: Record<EdgeKind, string>
  edgeCount: Record<EdgeKind, string>
  voices: Record<Voice, string>
  filters: { nodesLabel: string; edgesLabel: string; all: string; none: string }
  search: { label: string; placeholder: string; hint: string; empty: string }
  zoom: { group: string; in: string; out: string; reset: string; levelPrefix: string }
  card: NodeCardWording
  degree: Record<string, string>
}

/** A view edge without its receipt — what the floor carries; the receipts are fetched. */
export type EdgeLite = Pick<ViewEdge, 'from' | 'to' | 'kind'>

export interface GraphExplorerProps {
  nodes: ViewNode[]
  edges: EdgeLite[]
  /** the model's resting positions, one per node, in the node order */
  placed: Placed[]
  wording: ExplorerWording
  readoutId: string
  figureId: string
  /** same-origin feed of the full view, receipts included (src/pages/graph/view.json.ts) */
  receiptsUrl: string
}

const MIN_K = 0.6
const MAX_K = 8
const TRANSITION_MS = 320
/** below this many visible nodes every label is lettered, not only the practices' and works' */
const FEW = 60

function n(value: number): number {
  return Number(value.toFixed(2))
}

/** The weight of a node on the floor: it grows with the edges that touch it. */
export function radiusOf(node: Pick<ViewNode, 'kind' | 'degree'>): number {
  const base: Record<NodeKind, number> = {
    practice: 9,
    work: 6,
    'practice-work': 4.2,
    encounter: 6,
    decision: 4,
    neighbor: 3.4,
    receiver: 4.6,
  }
  return n(base[node.kind] + Math.min(6, Math.sqrt(node.degree) * 0.9))
}

/** The name a practice's mark carries on the floor: the persona where the record spells
 *  "The Field · Meridian", the whole label otherwise, cut short — the card carries it whole. */
export function practiceLabel(label: string): string {
  const parts = label.split('·').map((s) => s.trim()).filter(Boolean)
  const name = parts.length > 1 ? parts[parts.length - 1]! : label
  return name.length > 22 ? `${name.slice(0, 21).trimEnd()}…` : name
}

/** Kind is shape. Every mark is drawn about (0,0) inside the node's own <g>. */
export function markShape(kind: NodeKind, r: number): React.ReactNode {
  switch (kind) {
    case 'practice':
      return (
        <>
          <circle className="gx-ring-mark" r={n(r + 4)} />
          <circle className="gx-mark" r={r} />
        </>
      )
    case 'work':
      return <rect className="gx-mark" x={-r} y={-r} width={n(r * 2)} height={n(r * 2)} />
    case 'practice-work':
      return <circle className="gx-mark" r={r} />
    case 'encounter':
      return <path className="gx-mark" d={`M0 ${-r} L${r} 0 L0 ${r} L${-r} 0 Z`} />
    case 'decision':
      return <path className="gx-mark" d={`M0 ${n(-r * 1.15)} L${n(r * 1.1)} ${n(r * 0.75)} L${n(-r * 1.1)} ${n(r * 0.75)} Z`} />
    case 'neighbor':
      // hollow in the markup itself, not only in the stylesheet: the world is drawn as an outline
      return <circle className="gx-mark gx-mark-hollow" r={r} />
    case 'receiver': {
      const pts = [0, 60, 120, 180, 240, 300].map((deg) => {
        const rad = (deg * Math.PI) / 180
        return `${n(r * Math.sin(rad))} ${n(-r * Math.cos(rad))}`
      })
      return <path className="gx-mark" d={`M${pts.join(' L')} Z`} />
    }
  }
}

interface SimNode extends ViewNode {
  x: number
  y: number
  vx?: number
  vy?: number
  fx?: number | null
  fy?: number | null
}

export default function GraphExplorer({ nodes, edges, placed, wording, readoutId, figureId, receiptsUrl }: GraphExplorerProps) {
  const rootRef = React.useRef<HTMLDivElement>(null)
  const svgRef = React.useRef<SVGSVGElement>(null)
  const worldRef = React.useRef<SVGGElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const cardRef = React.useRef<HTMLDivElement>(null)
  const readoutRef = React.useRef<ReadoutHandle | null>(null)
  const figureRef = React.useRef<HTMLElement | null>(null)
  const zoomRef = React.useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null)

  const [ready, setReady] = React.useState(false)
  const [onScreen, setOnScreen] = React.useState(true)
  const [k, setK] = React.useState(1)
  const [kinds, setKinds] = React.useState<readonly NodeKind[]>(NODE_KINDS)
  const [edgeKinds, setEdgeKinds] = React.useState<readonly EdgeKind[]>(EDGE_KINDS)
  const [query, setQuery] = React.useState('')
  const [active, setActive] = React.useState(0)
  const [selected, setSelected] = React.useState<string | null>(null)
  const [full, setFull] = React.useState<GraphView | null>(null)
  const [fetchFailed, setFetchFailed] = React.useState(false)

  const lite: ViewLike = React.useMemo(() => ({ nodes, edges }), [nodes, edges])
  const byId = React.useMemo(() => new Map(nodes.map((node) => [node.id, node])), [nodes])
  const at = React.useMemo(() => new Map(placed.map((p) => [p.id, p])), [placed])
  const shown = React.useMemo(() => filterView(lite, { kinds, edgeKinds }), [lite, kinds, edgeKinds])
  const lit = React.useMemo(() => (selected ? neighbourhood(lite, selected) : null), [lite, selected])
  const results = React.useMemo(() => searchView(lite, query, 10), [lite, query])
  const selectedNode = selected ? byId.get(selected) ?? null : null
  const few = shown.nodes.size <= FEW

  // Angular order per kind — what the arrow keys walk along a ring.
  const ringOrder = React.useMemo(() => {
    const out = new Map<NodeKind, string[]>()
    for (const kind of NODE_KINDS) {
      const ids = nodes
        .filter((node) => node.kind === kind)
        .map((node) => {
          const p = at.get(node.id) ?? { x: CENTRE, y: CENTRE }
          return { id: node.id, a: Math.atan2(p.y - CENTRE, p.x - CENTRE) }
        })
        .sort((a, b) => a.a - b.a)
        .map((e) => e.id)
      out.set(kind, ids)
    }
    return out
  }, [nodes, at])

  // ------------------------------------------------------------------ mount
  React.useEffect(() => {
    setReady(true)
    const root = rootRef.current
    if (!root) return
    figureRef.current = root.closest<HTMLElement>('.gx-floor') ?? root
    const el = document.getElementById(readoutId)
    readoutRef.current = el ? createReadout(el, figureRef.current) : null
    return () => {
      readoutRef.current?.hide()
      readoutRef.current = null
    }
  }, [readoutId])

  React.useEffect(() => {
    const root = rootRef.current
    if (!root || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver((entries) => setOnScreen(entries.some((e) => e.isIntersecting)), {
      rootMargin: '128px',
    })
    io.observe(root)
    return () => io.disconnect()
  }, [])

  // ------------------------------------------------------------------ the force layout
  React.useEffect(() => {
    const svg = svgRef.current
    if (!svg) return
    const simNodes: SimNode[] = nodes.map((node) => {
      const p = at.get(node.id) ?? { x: CENTRE, y: CENTRE }
      // The practices are the anchors of the picture — nine points the model spaced around the
      // inner ring, each over the sector of what it made. They stay where the model put them
      // (fx/fy); everything else relaxes around them. Unpinned, the made-by links dragged the
      // makers together until their names overlapped (seen 2026-09-02).
      const pinned = node.kind === 'practice'
      return { ...node, x: p.x, y: p.y, ...(pinned ? { fx: p.x, fy: p.y } : {}) }
    })
    const index = new Map(simNodes.map((node) => [node.id, node]))
    const simLinks = edges
      .filter((e) => index.has(e.from) && index.has(e.to))
      .map((e) => ({ source: e.from, target: e.to, kind: e.kind }))

    const nodeEls = new Map<string, SVGGElement>()
    for (const el of svg.querySelectorAll<SVGGElement>('[data-node]')) nodeEls.set(el.dataset.node ?? '', el)
    const edgeEls = [...svg.querySelectorAll<SVGLineElement>('[data-edge]')]

    const paint = () => {
      for (const node of simNodes) {
        const el = nodeEls.get(node.id)
        if (el) el.setAttribute('transform', `translate(${n(node.x)} ${n(node.y)})`)
      }
      edges.forEach((e, i) => {
        const el = edgeEls[i]
        const a = index.get(e.from)
        const b = index.get(e.to)
        if (!el || !a || !b) return
        el.setAttribute('x1', String(n(a.x)))
        el.setAttribute('y1', String(n(a.y)))
        el.setAttribute('x2', String(n(b.x)))
        el.setAttribute('y2', String(n(b.y)))
      })
    }

    // The picture is the model's — rings by kind, angles by relation. The simulation only
    // RELAXES it: a strong radial force keeps every kind on its ring, a weak link force with a
    // distance equal to the rings' own gap tugs related nodes to the same angle without pulling
    // them inward, and collision spreads a crowded sector along its ring. A stronger link force
    // than this folds the rings into one blob and the reading is lost (tried, 2026-09-02).
    const ringGap = (a: SimNode, b: SimNode) => Math.abs(RING[a.kind] - RING[b.kind])
    const sim = forceSimulation(simNodes)
      .force(
        'link',
        forceLink<SimNode, { source: string; target: string; kind: EdgeKind }>(simLinks)
          .id((d) => d.id)
          .distance((l) => {
            const a = l.source as unknown as SimNode
            const b = l.target as unknown as SimNode
            return Math.max(24, ringGap(a, b))
          })
          .strength(0.12),
      )
      .force('charge', forceManyBody<SimNode>().strength(-10).distanceMax(90))
      .force('radial', forceRadial<SimNode>((d) => RING[d.kind], CENTRE, CENTRE).strength(0.9))
      .force('collide', forceCollide<SimNode>((d) => radiusOf(d) + 3).iterations(2))
      .force('centre', forceCenter(CENTRE, CENTRE).strength(0.01))
      .alphaDecay(0.05)
      .stop()

    if (reducedMotion()) {
      // Duty 4: settle without motion — run to rest, paint once.
      sim.tick(260)
      paint()
      return
    }
    sim.on('tick', paint).restart()
    return () => {
      sim.stop()
    }
  }, [nodes, edges, at])

  // ------------------------------------------------------------------ zoom & pan
  React.useEffect(() => {
    const svg = svgRef.current
    const world = worldRef.current
    if (!svg || !world) return
    const sel = select(svg)
    if (!onScreen) {
      sel.on('.zoom', null)
      return
    }
    const behaviour = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_K, MAX_K])
      .translateExtent([
        [-CANVAS * 0.5, -CANVAS * 0.5],
        [CANVAS * 1.5, CANVAS * 1.5],
      ])
      .on('zoom', (event: D3ZoomEvent<SVGSVGElement, unknown>) => {
        world.setAttribute('transform', event.transform.toString())
        setK(event.transform.k)
      })
    zoomRef.current = behaviour
    sel.call(behaviour)
    return () => {
      sel.on('.zoom', null)
    }
  }, [onScreen])

  const zoomSelection = (): Selection<SVGSVGElement, unknown, null, undefined> | null => {
    const node = svgRef.current
    return node ? select(node) : null
  }
  const scaleBy = React.useCallback((factor: number) => {
    const sel = zoomSelection()
    const behaviour = zoomRef.current
    if (!sel || !behaviour) return
    behaviour.scaleBy(sel.transition().duration(reducedMotion() ? 0 : TRANSITION_MS), factor)
  }, [])
  const resetZoom = React.useCallback(() => {
    const sel = zoomSelection()
    const behaviour = zoomRef.current
    if (!sel || !behaviour) return
    behaviour.transform(sel.transition().duration(reducedMotion() ? 0 : TRANSITION_MS), zoomIdentity)
  }, [])

  // ------------------------------------------------------------------ receipts (fetched once)
  React.useEffect(() => {
    if (!selected || full || fetchFailed) return
    let cancelled = false
    fetch(receiptsUrl)
      .then((res) => (res.ok ? (res.json() as Promise<PackedView>) : Promise.reject(new Error(String(res.status)))))
      .then((data) => {
        // the feed is the packed file (columns, not objects); the model unpacks it into the view
        if (!cancelled) setFull(unpackView(data))
      })
      .catch(() => {
        if (!cancelled) setFetchFailed(true)
      })
    return () => {
      cancelled = true
    }
  }, [selected, full, fetchFailed, receiptsUrl])

  const receipts: ReceiptsState = React.useMemo(() => {
    if (!selected) return { status: 'loading' }
    if (full) return { status: 'ready', receipts: receiptsOf(full, selected) as Receipt[] }
    if (fetchFailed) return { status: 'failed' }
    return { status: 'loading' }
  }, [selected, full, fetchFailed])

  // ------------------------------------------------------------------ selection
  const focusNode = React.useCallback((id: string) => {
    rootRef.current?.querySelector<SVGGElement>(`[data-node="${CSS.escape(id)}"]`)?.focus()
  }, [])
  const openNode = React.useCallback(
    (id: string) => {
      const node = byId.get(id)
      if (!node) return
      setSelected(id)
      readoutRef.current?.hide()
      window.dispatchEvent(
        new CustomEvent('dv:mark-selected', { detail: { figure: figureId, id, kind: node.kind, href: node.href } }),
      )
    },
    [byId, figureId],
  )
  const closeCard = React.useCallback(() => {
    const id = selected
    setSelected(null)
    if (id) focusNode(id)
  }, [focusNode, selected])
  React.useEffect(() => {
    if (selected) cardRef.current?.focus()
  }, [selected])

  // ------------------------------------------------------------------ the tour contract
  React.useEffect(() => {
    const apply = (focus: FocusState) => {
      if (focus.figure !== figureId) return
      if (focus.select && byId.has(focus.select)) setSelected(focus.select)
    }
    window.dispatchEvent(new CustomEvent('dv:figure-ready', { detail: { id: figureId, apply } }))
  }, [byId, figureId])

  // ------------------------------------------------------------------ the "/" shortcut
  React.useEffect(() => {
    if (!onScreen) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== '/' || event.metaKey || event.ctrlKey || event.altKey) return
      const target = event.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      event.preventDefault()
      searchRef.current?.focus()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onScreen])

  // ------------------------------------------------------------------ keyboard on the floor
  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    const inSearch = target === searchRef.current
    if (event.key === 'Escape') {
      if (inSearch) {
        if (query) {
          event.preventDefault()
          setQuery('')
        }
        return
      }
      if (selected) {
        event.preventDefault()
        closeCard()
      }
      return
    }
    if (inSearch) return
    if (event.key === '+' || event.key === '=') {
      event.preventDefault()
      scaleBy(1.5)
      return
    }
    if (event.key === '-' || event.key === '_') {
      event.preventDefault()
      scaleBy(1 / 1.5)
      return
    }
    if (event.key === '0') {
      event.preventDefault()
      resetZoom()
      return
    }
    const active = target.closest?.('[data-node]') as HTMLElement | null
    const current = active?.dataset.node
    if (!current) return
    const node = byId.get(current)
    if (!node) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      openNode(current)
      return
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'Home' || event.key === 'End') {
      const ring = (ringOrder.get(node.kind) ?? []).filter((id) => shown.nodes.has(id))
      const pos = ring.indexOf(current)
      if (pos < 0 || ring.length === 0) return
      event.preventDefault()
      let next = pos
      if (event.key === 'ArrowLeft') next = (pos - 1 + ring.length) % ring.length
      else if (event.key === 'ArrowRight') next = (pos + 1) % ring.length
      else if (event.key === 'Home') next = 0
      else next = ring.length - 1
      const id = ring[next]!
      if (selected) setSelected(id)
      focusNode(id)
    }
  }

  // ------------------------------------------------------------------ search keys
  const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((a) => (results.length ? (a + 1) % results.length : 0))
    } else if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((a) => (results.length ? (a - 1 + results.length) % results.length : 0))
    } else if (event.key === 'Enter') {
      const hit = results[active]
      if (hit) {
        event.preventDefault()
        openNode(hit.id)
        setQuery('')
      }
    }
  }
  React.useEffect(() => setActive(0), [query])

  // ------------------------------------------------------------------ readout
  const showReadout = (node: ViewNode, anchorX: number, anchorY: number) => {
    const readout = readoutRef.current
    if (!readout) return
    const box = document.createElement('span')
    const kind = document.createElement('span')
    kind.className = 'gx-tip-kind'
    kind.textContent = `${wording.kinds[node.kind]}${node.date ? ` · ${node.date}` : ''}`
    box.appendChild(kind)
    box.appendChild(document.createTextNode(node.label))
    readout.show(box, { anchorX, anchorY })
  }
  const fromPointer = (event: React.PointerEvent) => {
    const rect = figureRef.current?.getBoundingClientRect()
    return { anchorX: event.clientX - (rect?.left ?? 0), anchorY: event.clientY - (rect?.top ?? 0) }
  }
  const fromMark = (target: Element) => {
    const figure = figureRef.current?.getBoundingClientRect()
    const box = target.getBoundingClientRect()
    return { anchorX: box.left - (figure?.left ?? 0) + box.width / 2, anchorY: box.top - (figure?.top ?? 0) }
  }

  // ------------------------------------------------------------------ filters
  const toggleKind = (kind: NodeKind) =>
    setKinds((cur) => (cur.includes(kind) ? cur.filter((k2) => k2 !== kind) : [...cur, kind]))
  const toggleEdgeKind = (kind: EdgeKind) =>
    setEdgeKinds((cur) => (cur.includes(kind) ? cur.filter((k2) => k2 !== kind) : [...cur, kind]))

  const searchListId = `${figureId}-results`
  const nodeCount = wording.degree

  return (
    <div
      ref={rootRef}
      className="gx-root"
      data-island="graph-explorer"
      data-figure={figureId}
      data-reading={selected ? '' : undefined}
      data-few={few ? '' : undefined}
      data-paused={onScreen ? undefined : ''}
      onKeyDown={onKeyDown}
    >
      <div className="gx-controls mb-3" hidden={!ready}>
        <div className="gx-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input
            ref={searchRef}
            type="search"
            role="combobox"
            aria-label={wording.search.label}
            aria-expanded={query.length > 0}
            aria-controls={searchListId}
            aria-autocomplete="list"
            aria-activedescendant={query && results[active] ? `${searchListId}-${active}` : undefined}
            placeholder={wording.search.placeholder}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onSearchKeyDown}
            autoComplete="off"
          />
          {query && (
            <ul id={searchListId} role="listbox" className="gx-results" aria-label={wording.search.label}>
              {results.length === 0 && (
                <li className="gx-empty" role="presentation">
                  {wording.search.empty}
                </li>
              )}
              {results.map((hit, i) => (
                <li
                  key={hit.id}
                  id={`${searchListId}-${i}`}
                  role="option"
                  aria-selected={i === active}
                  className={`gx-result gx-v-${hit.voice}`}
                  onPointerEnter={() => setActive(i)}
                  onPointerDown={(event) => event.preventDefault()}
                  onClick={() => {
                    openNode(hit.id)
                    setQuery('')
                  }}
                >
                  <span className="gx-dot" aria-hidden="true" />
                  <span>{hit.label}</span>
                  <span className="gx-result-kind">{wording.kinds[hit.kind]}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        <span className="font-mono text-[11px] text-fg-faint">{wording.search.hint}</span>
        <div className="flex items-center gap-1" role="group" aria-label={wording.zoom.group}>
          <Button variant="ghost" size="sm" type="button" aria-label={wording.zoom.in} onClick={() => scaleBy(1.5)}>
            +
          </Button>
          <Button variant="ghost" size="sm" type="button" aria-label={wording.zoom.out} onClick={() => scaleBy(1 / 1.5)}>
            −
          </Button>
          <Button variant="ghost" size="sm" type="button" aria-label={wording.zoom.reset} onClick={resetZoom} disabled={k === 1}>
            0
          </Button>
          <span className="font-mono text-[11px] text-fg-faint" aria-live="polite">
            {wording.zoom.levelPrefix}
            {k.toFixed(1)}
          </span>
        </div>
      </div>

      <div className="gx-controls mb-3" hidden={!ready}>
        <div className="gx-filter" role="group" aria-label={wording.filters.nodesLabel}>
          <span className="gx-filter-label">{wording.filters.nodesLabel}</span>
          {NODE_KINDS.map((kind) => (
            <button
              key={kind}
              type="button"
              className="gx-chip"
              aria-pressed={kinds.includes(kind)}
              data-hollow={kind === 'neighbor' || kind === 'receiver' ? '' : undefined}
              onClick={() => toggleKind(kind)}
            >
              <svg viewBox="-8 -8 16 16" aria-hidden="true">
                {markShape(kind, 4.5)}
              </svg>
              {wording.kinds[kind]}
              <span className="gx-chip-n">{wording.kindCount[kind]}</span>
            </button>
          ))}
          <Button variant="ghost" size="sm" type="button" onClick={() => setKinds(NODE_KINDS)}>
            {wording.filters.all}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => setKinds([])}>
            {wording.filters.none}
          </Button>
        </div>
        <div className="gx-filter" role="group" aria-label={wording.filters.edgesLabel}>
          <span className="gx-filter-label">{wording.filters.edgesLabel}</span>
          {EDGE_KINDS.map((kind) => (
            <button key={kind} type="button" className="gx-chip" aria-pressed={edgeKinds.includes(kind)} onClick={() => toggleEdgeKind(kind)}>
              {wording.edgeKinds[kind]}
              <span className="gx-chip-n">{wording.edgeCount[kind]}</span>
            </button>
          ))}
          <Button variant="ghost" size="sm" type="button" onClick={() => setEdgeKinds(EDGE_KINDS)}>
            {wording.filters.all}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={() => setEdgeKinds([])}>
            {wording.filters.none}
          </Button>
        </div>
      </div>

      <svg
        ref={svgRef}
        className="gx-svg"
        viewBox={`0 0 ${CANVAS} ${CANVAS}`}
        role="img"
        aria-label={wording.figureLabel}
        xmlns="http://www.w3.org/2000/svg"
      >
        <g ref={worldRef} className="gx-world">
          {NODE_KINDS.map((kind) => (
            <g key={kind}>
              <circle className="gx-ring" cx={CENTRE} cy={CENTRE} r={RING[kind]} />
              <text className="gx-ring-label" x={CENTRE} y={n(CENTRE - RING[kind] - 5)} textAnchor="middle">
                {wording.kinds[kind]}
              </text>
            </g>
          ))}

          <g className="gx-edges">
            {edges.map((edge, i) => {
              const a = at.get(edge.from)
              const b = at.get(edge.to)
              if (!a || !b) return null
              const isLit = lit ? lit.has(edge.from) && lit.has(edge.to) && (edge.from === selected || edge.to === selected) : false
              return (
                <line
                  key={i}
                  className="gx-edge"
                  data-edge={i}
                  data-kind={edge.kind}
                  data-hidden={shown.edges.has(i) ? undefined : ''}
                  data-lit={isLit ? '' : undefined}
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                />
              )
            })}
          </g>

          <g className="gx-nodes">
            {nodes.map((node) => {
              const p = at.get(node.id)
              if (!p) return null
              const r = radiusOf(node)
              const label = shortLabel(node.label)
              const title = `${wording.kinds[node.kind]} · ${node.label}${node.date ? ` · ${node.date}` : ''}`
              const tabbable = node.kind === 'practice' || node.kind === 'work'
              return (
                <g
                  key={node.id}
                  className={`gx-node gx-v-${node.voice}`}
                  data-node={node.id}
                  data-kind={node.kind}
                  data-hidden={shown.nodes.has(node.id) ? undefined : ''}
                  data-lit={lit?.has(node.id) ? '' : undefined}
                  data-selected={selected === node.id ? '' : undefined}
                  transform={`translate(${p.x} ${p.y})`}
                  tabIndex={tabbable ? 0 : -1}
                  role="button"
                  aria-label={title}
                  onClick={() => openNode(node.id)}
                  onPointerEnter={(event) => showReadout(node, fromPointer(event).anchorX, fromPointer(event).anchorY)}
                  onPointerMove={(event) => showReadout(node, fromPointer(event).anchorX, fromPointer(event).anchorY)}
                  onPointerLeave={() => readoutRef.current?.hide()}
                  onFocus={(event) => {
                    const a = fromMark(event.currentTarget)
                    showReadout(node, a.anchorX, a.anchorY)
                  }}
                  onBlur={() => readoutRef.current?.hide()}
                >
                  <title>{title}</title>
                  {markShape(node.kind, r)}
                  <circle className="gx-hit" r={n(Math.max(r + 6, 10))} />
                  {node.kind === 'practice' ? (
                    // a practice's name sits under its mark, centred, so nine names on one small
                    // ring do not run into each other
                    <text className="gx-label" x={0} y={n(r + 16)} textAnchor="middle">
                      {practiceLabel(node.label)}
                    </text>
                  ) : (
                    <text className="gx-label" x={n(r + 5)} y={3.5}>
                      {label}
                    </text>
                  )}
                </g>
              )
            })}
          </g>
        </g>
      </svg>

      <p className="mt-2 font-mono text-[11px] text-fg-faint">{wording.hint}</p>

      {selectedNode && (
        <GraphNodeCard
          ref={cardRef}
          node={selectedNode}
          receipts={receipts}
          kindName={wording.kinds[selectedNode.kind]}
          kindWhat={wording.kindWhat[selectedNode.kind]}
          voiceName={wording.voices[selectedNode.voice]}
          degreeText={nodeCount[String(selectedNode.degree)] ?? String(selectedNode.degree)}
          edgeKindName={wording.edgeKinds}
          kindNames={wording.kinds}
          wording={wording.card}
          onClose={closeCard}
          onPick={(id) => {
            openNode(id)
            focusNode(id)
          }}
        />
      )}
    </div>
  )
}
