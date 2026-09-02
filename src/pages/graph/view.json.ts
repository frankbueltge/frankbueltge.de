// /graph/view.json — the knowledge graph as the explorer on /experiments/neighbors draws it:
// every node and edge of src/data/graph/graph.json, trimmed to what a drawing needs, with the
// receipt (committed file + quote) kept on every edge. Same pattern as /atlas/werke.json and the
// two chronicle feeds: static at build time, Git is the archive, no runtime reads.
//
// Why a feed and not a prop (visual layer, Phase 3a, 2026-09-02): the island's server render
// carries the nodes and the edges — that is the no-JS floor — but not the quotes, which are the
// bulk of the file and are only read one node at a time. The island fetches them from here,
// same-origin (`connect-src 'self'`), the first time a card opens. One source file, two readers,
// nothing to drift: the page and this feed are built from the same committed json.
import type { APIRoute } from 'astro'
import view from '@/data/graph/graph-view.json'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(view), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
