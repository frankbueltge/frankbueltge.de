// @ts-nocheck
// Range-capable delivery for the albums of The Ill-Tempered Week (Cloudflare Pages Function, 2026-11-09).
//
// As plain Pages assets the albums answered a Range request with a full 200, which Safari takes for a server that
// cannot stream, so its players stayed silent. The answer, with its tests, is src/lib/audio/ranged.ts: the same one
// functions/audio/[file].js gave the found recording on 2026-09-20, here for /ill-tempered-week/<week>/<piece>.m4a.
// The page at /ill-tempered-week/ has one segment and never reaches this route.
import { rangedAudio } from '../../../src/lib/audio/ranged'

export async function onRequest(context) {
  const { request, env, params } = context

  // GET and HEAD only: a player may open with HEAD to learn the length and whether ranges are on offer.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }

  // Only the albums' own files: a function that fetches any path a caller names is an open proxy.
  const week = String(params.week || '')
  const piece = String(params.piece || '')
  if (!/^\d{4}-W\d{2}$/.test(week) || !/^(overlooked|unison|turn)\.m4a$/.test(piece)) {
    return new Response('Not found', { status: 404 })
  }

  const origin = new URL(request.url).origin
  const asset = await env.ASSETS.fetch(new Request(`${origin}/ill-tempered-week/${week}/${piece}`, { method: 'GET' }))
  if (!asset.ok) return new Response('Not found', { status: 404 })
  return rangedAudio(request, asset)
}
