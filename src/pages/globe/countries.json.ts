// /globe/countries.json — the committed Natural Earth country polygons (src/data/globe, see the
// README there for provenance and licence), served as the globe fetches them. The build-time floor
// and the centroids read the same file directly; this feed exists so a country layer never asks a
// third party for a border (`connect-src 'self'`).
import type { APIRoute } from 'astro'
import countries from '@/data/globe/countries-110m.json'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(countries), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
