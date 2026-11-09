// The byte ranges an <audio> element asks for, answered as Safari needs them (src/lib/audio/ranged.ts).
import { describe, expect, it } from 'vitest'
import { byteRange, rangedAudio, sliceStream } from './ranged'

const BYTES = Uint8Array.from({ length: 1000 }, (_, i) => i % 251)

/** An asset as env.ASSETS answers it: the bytes, in chunks, with or without a declared length. */
function asset(declareLength = true, etag: string | null = '"abc"'): Response {
  const chunks = [BYTES.subarray(0, 100), BYTES.subarray(100, 357), BYTES.subarray(357, 1000)]
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const c of chunks) controller.enqueue(c)
      controller.close()
    },
  })
  const headers = new Headers({ 'content-type': 'audio/mp4' })
  if (declareLength) headers.set('content-length', String(BYTES.byteLength))
  if (etag) headers.set('etag', etag)
  return new Response(body, { headers })
}

const get = (headers: Record<string, string> = {}, method = 'GET'): Request =>
  new Request('https://example.test/ill-tempered-week/2026-W45/turn.m4a', { method, headers })

const bytesOf = async (r: Response): Promise<number[]> => [...new Uint8Array(await r.arrayBuffer())]

describe('byteRange', () => {
  it('reads the three forms a media element sends', () => {
    expect(byteRange('bytes=0-1', 1000)).toEqual({ start: 0, end: 1 })
    expect(byteRange('bytes=500-', 1000)).toEqual({ start: 500, end: 999 })
    expect(byteRange('bytes=-10', 1000)).toEqual({ start: 990, end: 999 })
  })

  it('clamps an end past the file, and refuses what cannot be served', () => {
    expect(byteRange('bytes=900-5000', 1000)).toEqual({ start: 900, end: 999 })
    expect(byteRange('bytes=1000-', 1000)).toBeNull()
    expect(byteRange('bytes=5-4', 1000)).toBeNull()
    expect(byteRange('bytes=-', 1000)).toBeNull()
    expect(byteRange('bytes=-0', 1000)).toBeNull()
    expect(byteRange('bytes=0-1,5-6', 1000)).toBeNull()
    expect(byteRange('items=0-1', 1000)).toBeNull()
  })
})

describe('sliceStream', () => {
  it('emits exactly the asked bytes across chunk borders', async () => {
    for (const [start, end] of [[0, 0], [95, 105], [100, 356], [357, 999], [990, 999], [0, 999]] as const) {
      const out = await bytesOf(new Response(sliceStream(asset().body!, start, end)))
      expect(out, `${start}-${end}`).toEqual([...BYTES.subarray(start, end + 1)])
    }
  })
})

describe('rangedAudio', () => {
  it('answers Safari’s opening probe with 206 and the first two bytes', async () => {
    const r = await rangedAudio(get({ Range: 'bytes=0-1' }), asset())
    expect(r.status).toBe(206)
    expect(r.headers.get('content-range')).toBe('bytes 0-1/1000')
    expect(r.headers.get('content-length')).toBe('2')
    expect(r.headers.get('accept-ranges')).toBe('bytes')
    expect(await bytesOf(r)).toEqual([...BYTES.subarray(0, 2)])
  })

  it('serves an open range and a suffix range, with or without a declared length', async () => {
    for (const declared of [true, false]) {
      const open = await rangedAudio(get({ Range: 'bytes=600-' }), asset(declared))
      expect(open.status).toBe(206)
      expect(await bytesOf(open)).toEqual([...BYTES.subarray(600)])
      const tail = await rangedAudio(get({ Range: 'bytes=-50' }), asset(declared))
      expect(tail.headers.get('content-range')).toBe('bytes 950-999/1000')
      expect(await bytesOf(tail)).toEqual([...BYTES.subarray(950)])
    }
  })

  it('sends the whole file with its length and ranges on offer when no range is asked', async () => {
    const r = await rangedAudio(get(), asset())
    expect(r.status).toBe(200)
    expect(r.headers.get('content-length')).toBe('1000')
    expect(r.headers.get('accept-ranges')).toBe('bytes')
    expect(r.headers.get('content-type')).toBe('audio/mp4')
    expect(await bytesOf(r)).toEqual([...BYTES])
  })

  it('answers HEAD with the length and no body', async () => {
    const r = await rangedAudio(get({}, 'HEAD'), asset())
    expect(r.status).toBe(200)
    expect(r.headers.get('content-length')).toBe('1000')
    expect(r.body).toBeNull()
  })

  it('refuses an unsatisfiable range with 416 and the length', async () => {
    const r = await rangedAudio(get({ Range: 'bytes=1000-' }), asset())
    expect(r.status).toBe(416)
    expect(r.headers.get('content-range')).toBe('bytes */1000')
  })

  it('revalidates instead of caching, because the growing week keeps its address', async () => {
    const fresh = await rangedAudio(get(), asset())
    expect(fresh.headers.get('cache-control')).toBe('public, max-age=0, must-revalidate')
    expect(fresh.headers.get('etag')).toBe('"abc"')
    expect((await rangedAudio(get({ 'If-None-Match': '"abc"' }), asset())).status).toBe(304)
    expect((await rangedAudio(get({ 'If-None-Match': '"old"' }), asset())).status).toBe(200)
  })

  it('answers a range of a replaced file with the whole new file', async () => {
    const r = await rangedAudio(get({ Range: 'bytes=0-1', 'If-Range': '"old"' }), asset())
    expect(r.status).toBe(200)
    expect(r.headers.get('content-length')).toBe('1000')
  })
})
