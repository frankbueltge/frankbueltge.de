// @ts-nocheck
// Range-capable delivery for the albums of the ill-tempered week (Cloudflare Pages Function, 2026-11-09).
//
// As plain Pages assets the albums answered a Range request with a full 200, which Safari takes for a server that
// cannot stream, so its players stayed silent. The answer, with its tests, is src/lib/audio/ranged.ts: the same one
// functions/audio/[file].js gave the found recording on 2026-09-20, here for /ill-tempered-week/<week>/<piece>.m4a.
// The page at /ill-tempered-week/ has one segment and never reaches this route.
import { rangedAudio } from '../../../src/lib/audio/ranged'
import { isAlbumAudio } from '../../../src/lib/ill-tempered-week/audio-path'

export async function onRequest(context) {
  const { request, env, params } = context

  // Only the albums' own files: a function that fetches any path a caller names is an open proxy. Every other path
  // under /ill-tempered-week/<a>/<b> goes on to the asset server as it stands (since 2026-11-14, when each album got
  // a page of its own at /ill-tempered-week/<week>/): what is no file there is a 404 there.
  const week = String(params.week || '')
  const piece = String(params.piece || '')
  if (!isAlbumAudio(week, piece)) return context.next()

  // GET and HEAD only: a player may open with HEAD to learn the length and whether ranges are on offer.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }

  const origin = new URL(request.url).origin
  const asset = await env.ASSETS.fetch(new Request(`${origin}/ill-tempered-week/${week}/${piece}`, { method: 'GET' }))
  if (!asset.ok) return new Response('Not found', { status: 404 })
  return rangedAudio(request, asset)
}
