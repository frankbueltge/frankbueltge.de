// /globe/land.json — the committed Natural Earth land (src/data/globe/land-110m.json, see the
// README there for its provenance and licence), served as the island fetches it. The build-time
// floor reads the same file directly; this feed exists so the WebGL globe never asks a third
// party for a coastline (`connect-src 'self'`).
import type { APIRoute } from 'astro'
import land from '@/data/globe/land-110m.json'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(land), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
