// /globe/layers/<id>.newest.json — one layer's records for the newest day it holds, and nothing
// else. A globe draws ONE day at a time and both surfaces open on the newest one, so this is what
// a first paint needs; `<id>.json` beside it carries the whole archive, and is fetched only when a
// visitor walks the days. One route per registered layer, prerendered from the registry itself.
import type { APIRoute, GetStaticPaths } from 'astro'
import { LAYERS } from '@/lib/globe/layers'
import { newestJson } from '@/lib/globe/feeds'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () =>
  LAYERS.map((layer) => ({ params: { id: layer.id }, props: { json: newestJson(layer) } }))

export const GET: APIRoute = ({ props }) =>
  new Response((props as { json: string }).json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
