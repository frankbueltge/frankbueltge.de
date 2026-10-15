// /globe/layers/<id>.json — one layer's records, every day it holds. One route per registered
// layer, prerendered from the registry itself: a layer cannot exist on the globe without a feed,
// and a feed cannot exist without a layer.
import type { APIRoute, GetStaticPaths } from 'astro'
import { LAYERS } from '@/lib/globe/layers'
import { feedJson } from '@/lib/globe/feeds'

export const prerender = true

export const getStaticPaths: GetStaticPaths = () =>
  LAYERS.map((layer) => ({ params: { id: layer.id }, props: { json: feedJson(layer) } }))

export const GET: APIRoute = ({ props }) =>
  new Response((props as { json: string }).json, {
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
  })
