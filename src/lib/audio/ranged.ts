// src/lib/audio/ranged.ts — byte ranges for audio the site serves through a Pages Function (2026-11-09).
//
// Served as plain Pages assets, the site's audio answers a Range request with a full 200 (cf-cache-status: DYNAMIC,
// no Accept-Ranges; measured again on 2026-11-09). Safari's media stack opens with a Range request and treats a 200
// as a server that cannot stream, so an <audio> element there does not play; other browsers cannot seek past what
// they hold. functions/audio/[file].js answered that for the found recording on 2026-09-20. This module is the same
// answer as pure, tested functions, used by functions/ill-tempered-week/[week]/[piece].js for the albums of The
// Ill-Tempered Week. Ducking does not need it: its desk fetches whole files into the Web Audio API.

export interface ByteRange {
  start: number
  end: number
}

/**
 * The one range a media element asks for — "bytes=START-", "bytes=START-END", or the suffix form "bytes=-N", which
 * means the LAST N bytes — resolved against a file of `total` bytes; null when it cannot be satisfied.
 */
export function byteRange(header: string, total: number): ByteRange | null {
  const m = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (!m || (m[1] === '' && m[2] === '') || !(total > 0)) return null
  if (m[1] === '') {
    const n = Number(m[2])
    return n > 0 ? { start: Math.max(0, total - n), end: total - 1 } : null
  }
  const start = Number(m[1])
  const end = m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) return null
  return { start, end }
}

/** Only bytes [start, end] of a stream: what comes before is dropped as it passes, and reading stops after. */
export function sliceStream(body: ReadableStream<Uint8Array>, start: number, end: number): ReadableStream<Uint8Array> {
  const reader = body.getReader()
  const wanted = end - start + 1
  let pos = 0
  let sent = 0
  const release = async (reason?: unknown): Promise<void> => {
    try {
      await reader.cancel(reason)
    } catch {
      /* the body is already gone; nothing to release */
    }
  }
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      while (sent < wanted) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        const chunkStart = pos
        pos += value.byteLength
        if (pos - 1 < start) continue // wholly before the range
        const piece = value.subarray(Math.max(0, start - chunkStart), Math.min(value.byteLength, end - chunkStart + 1))
        if (piece.byteLength > 0) {
          controller.enqueue(piece)
          sent += piece.byteLength
          return // one piece a pull; the consumer asks again when it wants more
        }
      }
      controller.close()
      await release()
    },
    cancel: release,
  })
}

/**
 * Answer a GET or HEAD for an audio asset: byte ranges, and revalidation by the asset's ETag rather than a long
 * cache, because the growing week's edition keeps its address while its audio changes every day.
 */
export async function rangedAudio(request: Request, asset: Response, contentType = 'audio/mp4'): Promise<Response> {
  const bodyless = request.method === 'HEAD'
  const headers = new Headers({
    'Content-Type': contentType,
    'Accept-Ranges': 'bytes',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
  })
  const etag = asset.headers.get('etag')
  if (etag) headers.set('ETag', etag)
  const ifNoneMatch = request.headers.get('if-none-match')
  if (etag && ifNoneMatch && ifNoneMatch.split(',').some((t) => t.trim() === etag || t.trim() === '*')) {
    return new Response(null, { status: 304, headers })
  }

  // The length has to be known before a range can be answered. The asset normally declares it; where it does not,
  // reading the body is the only way to find out, and then it is already held.
  const declared = Number(asset.headers.get('content-length'))
  let buffered: ArrayBuffer | null = null
  let total = Number.isFinite(declared) && declared > 0 ? declared : null
  if (total === null) {
    buffered = await asset.arrayBuffer()
    total = buffered.byteLength
  }

  // If-Range: a range of a file the client no longer holds is answered with the whole file.
  const ifRange = request.headers.get('if-range')
  const range = ifRange && ifRange !== etag ? null : request.headers.get('range')
  if (!range) {
    headers.set('Content-Length', String(total))
    return new Response(bodyless ? null : (buffered ?? asset.body), { status: 200, headers })
  }
  const r = byteRange(range, total)
  if (!r) {
    headers.set('Content-Range', `bytes */${total}`)
    return new Response(null, { status: 416, headers })
  }
  headers.set('Content-Range', `bytes ${r.start}-${r.end}/${total}`)
  headers.set('Content-Length', String(r.end - r.start + 1))
  if (bodyless) return new Response(null, { status: 206, headers })
  const body = buffered ? buffered.slice(r.start, r.end + 1) : sliceStream(asset.body!, r.start, r.end)
  return new Response(body, { status: 206, headers })
}
