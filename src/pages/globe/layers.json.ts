// /globe/layers.json — the living globe's manifest: every layer, where it comes from, which days
// it holds, how many marks it draws on each of them and what its records cost to fetch. Small on
// purpose: the legend, the provenance lines, the time axis and the tables are all built from this,
// so a visitor who never opens a layer never downloads one.
import type { APIRoute } from 'astro'
import { buildManifest } from '@/lib/globe/feeds'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(buildManifest()), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
