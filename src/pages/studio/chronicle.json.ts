// Public, machine-readable chronicle feed for the studio collective "Ensemble" — one source,
// the /studio story layer on this site; sibling projects may read it the same way data-snack.com
// and datavism.org read /field/chronicle.json. Static at build time (Git is the archive; no
// runtime reads).
import type { APIRoute } from 'astro'
import { loadChronicle } from '@/lib/studio/chronicle'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(loadChronicle(), null, 2), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
