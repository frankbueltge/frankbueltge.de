// Public, machine-readable chronicle feed — one source, three surfaces: the /field story
// layer on this site, data-snack.com's goods-in inspection ("Wareneingang") and datavism.org
// read the same file. Static at build time (Git is the archive; no runtime reads).
import type { APIRoute } from 'astro'
import { loadChronicle } from '@/lib/field/chronicle'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(loadChronicle(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
