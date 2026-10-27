import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeD1, sqliteAvailable } from '../reception/fake-d1'
import { DAILY_CAP, handleRecord, handleStatus, handleSubmit, resetBurst, type Deps, type ReadingEnv } from './handlers'
import { ADDRESS_DAILY_MAX } from './store'
import { BATCH_SIZE } from './record'
import { CURRENT_ROUND } from './rounds'
import { sampleReading } from './fixtures'

const ORIGIN = 'https://frankbueltge.de'
let now = new Date('2026-10-27T10:00:00Z')
const network = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
  if (String(url).includes('turnstile')) {
    const token = new URLSearchParams(String(init?.body)).get('response')
    return new Response(JSON.stringify({ success: token === 'human' }))
  }
  throw new Error(`unexpected fetch ${String(url)}`)
})
const deps: Deps = { fetch: network as unknown as typeof fetch, now: () => now }

async function makeEnv(overrides: Partial<ReadingEnv> = {}): Promise<ReadingEnv> {
  return { RECEPTION_DB: await fakeD1(), TURNSTILE_SECRET_KEY: 'turnstile-secret-for-tests', ...overrides }
}

const submit = (env: ReadingEnv, body: Record<string, unknown>, headers: Record<string, string> = {}) =>
  handleSubmit(
    new Request(`${ORIGIN}/api/reading/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': '203.0.113.9', 'user-agent': 'test-browser', ...headers },
      body: JSON.stringify(body),
    }),
    env,
    deps,
  )

const human = (seed = 1) => ({ ...sampleReading(seed), turnstileToken: 'human' })
const raw = (env: ReadingEnv) => (env.RECEPTION_DB as unknown as { raw: { prepare(sql: string): { all(...p: unknown[]): Record<string, unknown>[] } } }).raw
const record = async (env: ReadingEnv, query = '') => (await handleRecord(new Request(`${ORIGIN}/api/reading/record${query}`), env, deps)).json()
/** `n` readings from `n` different addresses. */
async function readingsFrom(env: ReadingEnv, n: number, first = 1) {
  for (let i = first; i < first + n; i++) expect((await submit(env, human(i), { 'cf-connecting-ip': `198.51.100.${i}` })).status).toBe(200)
}

beforeEach(() => {
  resetBurst()
  network.mockClear()
  now = new Date('2026-10-27T10:00:00Z')
})

describe.skipIf(!(await sqliteAvailable()))('POST /api/reading/submit', () => {
  it('stores a reading and answers with the round\'s count', async () => {
    const env = await makeEnv()
    const res = await submit(env, human())
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true, status: 'stored', round: CURRENT_ROUND.id, readings: 1 })
    // the reader is never handed an id, and the stored one carries no date
    expect(raw(env).prepare('SELECT id FROM reading_entries').all()[0]!.id).toMatch(/^t-[0-9a-f]{16}$/)
  })

  it('declares standby without the store or without the bot check, and stores nothing', async () => {
    const noStore = await submit({ TURNSTILE_SECRET_KEY: 'x' }, human())
    expect([noStore.status, (await noStore.json()).detail]).toEqual([503, 'store'])
    const noCheck = await submit(await makeEnv({ TURNSTILE_SECRET_KEY: undefined }), human())
    expect([noCheck.status, (await noCheck.json()).detail]).toEqual([503, 'bot-check'])
  })

  it('refuses another site, a malformed reading and a failed bot check', async () => {
    const env = await makeEnv()
    expect((await submit(env, human(), { origin: 'https://elsewhere.example' })).status).toBe(403)
    const bad = await submit(env, { ...human(), consent: 'none' })
    expect([bad.status, (await bad.json()).reason]).toEqual([422, 'consent'])
    const bot = await submit(env, { ...human(), turnstileToken: 'robot' })
    expect([bot.status, (await bot.json()).reason]).toEqual([403, 'turnstile'])
  })

  it('answers a filled honeypot like a success and stores nothing', async () => {
    const env = await makeEnv()
    await handleStatus(new Request(`${ORIGIN}/api/reading/status`), env, deps) // creates the tables
    const res = await submit(env, { ...human(), website: 'http://spam.example' })
    expect(res.status).toBe(200)
    expect(raw(env).prepare('SELECT COUNT(*) AS n FROM reading_entries').all()[0]!.n).toBe(0)
  })

  it('takes one reading per visitor per round per day, and another the next day', async () => {
    const env = await makeEnv()
    expect((await submit(env, human(1))).status).toBe(200)
    const again = await submit(env, human(2))
    expect([again.status, (await again.json()).reason]).toEqual([429, 'once-a-day'])
    expect((await submit(env, human(3), { 'cf-connecting-ip': '198.51.100.4' })).status).toBe(200)
    now = new Date('2026-10-28T09:00:00Z')
    expect((await submit(env, human(4))).status).toBe(200)
  })

  it('lets one address give only a few readings a day, whatever browsers it claims', async () => {
    const env = await makeEnv()
    for (let i = 1; i <= ADDRESS_DAILY_MAX; i++) expect((await submit(env, human(i), { 'user-agent': `browser ${i}` })).status).toBe(200)
    const more = await submit(env, human(9), { 'user-agent': 'yet another browser' })
    expect([more.status, (await more.json()).reason]).toEqual([429, 'address-limit'])
    now = new Date('2026-10-28T09:00:00Z')
    expect((await submit(env, human(10), { 'user-agent': 'browser 1' })).status).toBe(200)
  })

  it('switches to standby at the daily cap', async () => {
    const env = await makeEnv()
    await env.RECEPTION_DB!.prepare('CREATE TABLE IF NOT EXISTS reading_counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))').run()
    await env.RECEPTION_DB!.prepare('INSERT INTO reading_counts (day, key, n) VALUES (?, ?, ?)').bind('2026-10-27', 'readings', DAILY_CAP).run()
    const res = await submit(env, human())
    expect([res.status, (await res.json()).detail]).toEqual([503, 'daily-cap'])
  })

  it('keeps no address, no time of day and no hash beside the reading', async () => {
    const env = await makeEnv()
    await submit(env, human())
    const row = raw(env).prepare('SELECT * FROM reading_entries').all()[0]!
    expect(Object.keys(row).sort()).toEqual(['consent', 'day', 'estimates', 'id', 'primed', 'round', 'votes'])
    expect(JSON.stringify(row)).not.toContain('203.0.113.9')
    expect(row.day).toBe('2026-10-27')
  })

  it('keeps no order of writing that could pair a reading with its reader’s mark', async () => {
    const env = await makeEnv()
    await submit(env, human())
    for (const table of ['reading_entries', 'reading_marks', 'reading_addr']) {
      expect(() => raw(env).prepare(`SELECT rowid FROM ${table}`).all(), `${table} has a rowid`).toThrow()
    }
    expect(Object.keys(raw(env).prepare('SELECT * FROM reading_marks').all()[0]!).sort()).toEqual(['day', 'hash', 'round'])
  })
})

describe.skipIf(!(await sqliteAvailable()))('GET /api/reading/status and /record', () => {
  it('says whether the round is open and how many readings it holds', async () => {
    const env = await makeEnv()
    await submit(env, human())
    const s = await (await handleStatus(new Request(`${ORIGIN}/api/reading/status`), env, deps)).json()
    expect(s).toEqual({ ok: true, round: CURRENT_ROUND.id, open: true, standby: null, readings: 1 })
    const closed = await (await handleStatus(new Request(`${ORIGIN}/api/reading/status`), await makeEnv({ TURNSTILE_SECRET_KEY: undefined }), deps)).json()
    expect(closed).toMatchObject({ open: false, standby: 'bot-check' })
  })

  it('releases nothing of the day that is still running', async () => {
    const env = await makeEnv()
    await readingsFrom(env, BATCH_SIZE + 1)
    expect(await record(env)).toMatchObject({ ok: true, round: CURRENT_ROUND.id, batch_size: BATCH_SIZE, readings: 0, entries: [] })
  })

  it('releases a finished day in whole batches, without the day, and holds the rest back', async () => {
    const env = await makeEnv()
    await readingsFrom(env, BATCH_SIZE + 1)
    now = new Date('2026-10-28T02:35:00Z')
    const r = await record(env, `?round=${CURRENT_ROUND.id}`)
    expect(r.readings).toBe(BATCH_SIZE)
    for (const e of r.entries) {
      expect(Object.keys(e).sort()).toEqual(['batch', 'consent', 'estimates', 'id', 'primed', 'votes'])
      expect(e.batch).toBe(1)
    }
    // the held-back reading waits for four more; then a second batch is released and the first is unchanged
    await readingsFrom(env, BATCH_SIZE - 1, 50)
    now = new Date('2026-10-29T02:35:00Z')
    const next = await record(env)
    expect(next.readings).toBe(2 * BATCH_SIZE)
    expect(next.entries.filter((e: { batch: number }) => e.batch === 1)).toEqual(r.entries)
  })

  it('clears the finished day’s salt, marks and address counts when the record is read', async () => {
    const env = await makeEnv()
    await submit(env, human())
    now = new Date('2026-10-28T02:35:00Z')
    await record(env)
    for (const table of ['reading_salts', 'reading_marks', 'reading_addr']) {
      expect(raw(env).prepare(`SELECT COUNT(*) AS n FROM ${table}`).all()[0]!.n, table).toBe(0)
    }
  })

  it('refuses an unknown round', async () => {
    const env = await makeEnv()
    expect((await handleRecord(new Request(`${ORIGIN}/api/reading/record?round=nowhere`), env, deps)).status).toBe(404)
  })
})
