// @ts-nocheck
// Range-capable, streaming delivery for the lab's audio (Cloudflare Pages Function, 2026-09-20).
//
// Why this exists. Served as a plain Pages asset, the recording came back with
// cf-cache-status: DYNAMIC, no Accept-Ranges, and a full 200 in answer to a Range request —
// measured against the same site's images, which answer 206 correctly. A media element cannot
// seek against that, and Safari will not begin playback at all: its media stack opens with a
// Range request and treats a 200 as a server that cannot stream.
//
// Why it streams rather than buffers. The first version read the whole 11 MB into memory and
// sliced the ArrayBuffer. It was correct and it was wrong: every ranged request paid for the
// whole file before sending a byte, which is slow to first byte and needlessly heavy — and a
// phone that locks, drops the connection and re-requests on wake is exactly the client that
// cannot afford it. This walks the body and emits only the bytes asked for, so memory stays
// flat and the first byte leaves as soon as it is reached.
const ONE_WEEK = 60 * 60 * 24 * 7

/** Emit only bytes [start, end] of a stream, discarding what comes before and stopping after. */
function sliceStream(body, start, end) {
  const reader = body.getReader()
  const wanted = end - start + 1
  let pos = 0
  let sent = 0
  return new ReadableStream({
    async pull(controller) {
      while (sent < wanted) {
        const { done, value } = await reader.read()
        if (done) {
          controller.close()
          return
        }
        const chunkStart = pos
        pos += value.byteLength
        if (pos - 1 < start) continue // wholly before the range: drop it and read on
        const from = Math.max(0, start - chunkStart)
        const to = Math.min(value.byteLength, end - chunkStart + 1)
        const piece = value.subarray(from, to)
        if (piece.byteLength > 0) {
          controller.enqueue(piece)
          sent += piece.byteLength
          return // one enqueue per pull; the consumer asks again when it wants more
        }
      }
      controller.close()
      try {
        await reader.cancel()
      } catch {
        /* the body is already gone; nothing to release */
      }
    },
    async cancel(reason) {
      try {
        await reader.cancel(reason)
      } catch {
        /* same */
      }
    },
  })
}

export async function onRequest(context) {
  const { request, env, params } = context

  // GET and HEAD only. A player often opens with HEAD to learn the length and whether ranges
  // are on offer before it asks for a byte; answering that with a 404 is how this function
  // failed its first local test.
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } })
  }
  const bodyless = request.method === 'HEAD'

  // Only this directory's own files, and only the one extension it is for: a function that
  // will fetch any path a caller names is an open proxy, however narrow its route looks.
  const name = String(params.file || '')
  if (!/^[a-z0-9-]+\.m4a$/.test(name)) return new Response('Not found', { status: 404 })

  const origin = new URL(request.url).origin
  const asset = await env.ASSETS.fetch(new Request(`${origin}/playbook/${name}`, { method: 'GET' }))
  if (!asset.ok) return new Response('Not found', { status: 404 })

  const headers = new Headers({
    'Content-Type': 'audio/mp4',
    'Accept-Ranges': 'bytes',
    'Cache-Control': `public, max-age=${ONE_WEEK}`,
    'X-Content-Type-Options': 'nosniff',
  })

  // The length has to be known before a range can be answered. The asset normally declares it;
  // where it does not, reading the body is the only way to find out, and then we already hold it.
  const declared = Number(asset.headers.get('content-length'))
  let buffered = null
  let total = Number.isFinite(declared) && declared > 0 ? declared : null
  if (total === null) {
    buffered = await asset.arrayBuffer()
    total = buffered.byteLength
  }

  const range = request.headers.get('Range')
  if (!range) {
    headers.set('Content-Length', String(total))
    if (bodyless) return new Response(null, { status: 200, headers })
    return new Response(buffered ?? asset.body, { status: 200, headers })
  }

  // One range, the only form a media element asks for: "bytes=START-" or "bytes=START-END",
  // plus the suffix form "bytes=-N", which means the LAST N bytes and not the first.
  const m = /^bytes=(\d*)-(\d*)$/.exec(range.trim())
  const unsatisfiable = () => {
    headers.set('Content-Range', `bytes */${total}`)
    return new Response(null, { status: 416, headers })
  }
  if (!m || (m[1] === '' && m[2] === '')) return unsatisfiable()
  const suffix = m[1] === ''
  const start = suffix ? Math.max(0, total - Number(m[2])) : Number(m[1])
  const end = suffix || m[2] === '' ? total - 1 : Math.min(Number(m[2]), total - 1)
  if (!Number.isFinite(start) || !Number.isFinite(end) || start > end || start >= total) {
    return unsatisfiable()
  }

  headers.set('Content-Range', `bytes ${start}-${end}/${total}`)
  headers.set('Content-Length', String(end - start + 1))
  if (bodyless) return new Response(null, { status: 206, headers })
  const body = buffered
    ? buffered.slice(start, end + 1)
    : sliceStream(asset.body, start, end)
  return new Response(body, { status: 206, headers })
}
