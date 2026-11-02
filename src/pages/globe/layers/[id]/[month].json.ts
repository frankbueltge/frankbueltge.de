// /globe/layers/<id>/<YYYY-MM>.json — one month of one layer's records (2026-11-02). The island
// fetches the month a visitor walks into and never the whole archive, which grows by one day every
// night; `<id>.json` keeps the whole archive as data. One route per layer and month it holds,
// prerendered from the registry itself.
import type { APIRoute, GetStaticPaths } from 'astro'
import { LAYERS } from '@/lib/globe/layers'
import { layerMonths, monthJson } from '@/lib/globe/feeds'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () =>
  LAYERS.flatMap((layer) =>
    layerMonths(layer).map((month) => ({ params: { id: layer.id, month }, props: { json: monthJson(layer, month) } })),
  )

export const GET: APIRoute = ({ props }) =>
  new Response((props as { json: string }).json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
