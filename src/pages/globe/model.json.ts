// /globe/model.json — what the entrance globe draws, as the island fetches it once the hero is on
// screen: the earth-observation fleet's committed CelesTrak elements (for SGP4 in the browser) and
// the ghost fleet's dark gaps, both from the nightly snapshots in src/data. Same pattern as
// /graph/view.json: static at build time, Git is the archive, no runtime reads — the page's
// build-time floor and this feed are built from the same two files, so they cannot drift apart.
import type { APIRoute } from 'astro'
import type { SatSnapshot } from '@/lib/ueberflug/types'
import type { GhostFleetData } from '@/lib/ghost-fleet/types'
import sky from '@/data/ueberflug/satellites.json'
import fleet from '@/data/ghost-fleet/latest.json'
import { buildGlobeModel, clientPayload } from '@/lib/globe/model'

export const prerender = true

export const GET: APIRoute = () =>
  new Response(JSON.stringify(clientPayload(buildGlobeModel(sky as unknown as SatSnapshot, fleet as unknown as GhostFleetData))), {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
