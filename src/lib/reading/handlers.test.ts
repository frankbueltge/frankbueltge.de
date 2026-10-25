import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeD1, sqliteAvailable } from '../reception/fake-d1'
import { DAILY_CAP, handleRecord, handleStatus, handleSubmit, resetBurst, type Deps, type ReadingEnv } from './handlers'
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
    expect(body).toMatchObject({ ok: true, status: 'stored', round: CURRENT_ROUND.id, readings: 1 })
    expect(body.id).toMatch(/^t-20261027-[0-9a-f]{12}$/)
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
    const res = await submit(env, { ...human(), website: 'http://spam.example' })
    expect(res.status).toBe(200)
    const record = await (await handleRecord(new Request(`${ORIGIN}/api/reading/record`), env)).json()
    expect(record.readings).toBe(0)
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
    const db = (env.RECEPTION_DB as unknown as { raw: { prepare(sql: string): { all(): Record<string, unknown>[] } } }).raw
    const row = db.prepare('SELECT * FROM reading_entries').all()[0]!
    expect(Object.keys(row).sort()).toEqual(['consent', 'day', 'estimates', 'id', 'primed', 'round', 'votes'])
    expect(JSON.stringify(row)).not.toContain('203.0.113.9')
    expect(row.day).toBe('2026-10-27')
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

  it('publishes every reading of a round as stored, and refuses an unknown round', async () => {
    const env = await makeEnv()
    const sent = human()
    await submit(env, sent)
    const r = await (await handleRecord(new Request(`${ORIGIN}/api/reading/record?round=${CURRENT_ROUND.id}`), env)).json()
    expect(r).toMatchObject({ ok: true, schema: 1, round: CURRENT_ROUND.id, readings: 1 })
    expect(r.entries[0]).toMatchObject({ day: '2026-10-27', consent: CURRENT_ROUND.consent_version, votes: sent.votes, estimates: sent.estimates })
    expect((await handleRecord(new Request(`${ORIGIN}/api/reading/record?round=nowhere`), env)).status).toBe(404)
  })
})
