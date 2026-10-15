// /globe/countries.json — the committed Natural Earth country polygons (src/data/globe, see the
// README there for provenance and licence), keyed by the code a country record names, ready to
// draw. The build-time floor and the centroids read the same committed file directly; this feed
// exists so a country layer never asks a third party for a border (`connect-src 'self'`) and so
// the island never decodes a topology of its own — a border is geometry, and geometry belongs to a
// tested library, not to an island (src/lib/globe/shapes.ts).
import type { APIRoute } from 'astro'
import { countryShapes } from '@/lib/globe/shapes'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(countryShapes()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
