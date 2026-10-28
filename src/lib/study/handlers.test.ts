import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeD1, sqliteAvailable } from '../reception/fake-d1'
import { handleRecord, handleStatus, handleSubmit, parseRegistry, resetBurst, resetRegistryCache, type Deps, type StudyEnv } from './handlers'
import { CONSENT_VERSION } from './consent'
import { BATCH_SIZE } from './record'
import { ADDRESS_DAILY_MAX } from './store'
import { ANSWERS, MANIFEST } from './fixtures'

const ORIGIN = 'https://frankbueltge.de'
let now = new Date('2026-10-28T10:00:00Z')
const gate = vi.fn((text: string) => (/BUY NOW/.test(text) ? '{"verdict":"block","reason":"spam"}' : '{"verdict":"pass"}'))
/** What siteverify answers for each test token: solved in this study's frame on this host, or not. */
const SOLVED: Record<string, object> = {
  human: { success: true, action: 'study', cdata: MANIFEST.id, hostname: 'frankbueltge.de' },
  'from-the-reception': { success: true, action: '', cdata: '', hostname: 'frankbueltge.de' },
  'for-another-study': { success: true, action: 'study', cdata: 'studio-another', hostname: 'frankbueltge.de' },
  'on-another-host': { success: true, action: 'study', cdata: MANIFEST.id, hostname: 'elsewhere.example' },
}
const network = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
  const u = String(url)
  if (u.includes('turnstile')) return new Response(JSON.stringify(SOLVED[new URLSearchParams(String(init?.body)).get('response') ?? ''] ?? { success: false }))
  if (u.includes('generativelanguage')) {
    const body = JSON.parse(String(init?.body))
    return new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: gate(body.contents[0].parts[0].text) }] } }] }))
  }
  throw new Error(`unexpected fetch ${u}`)
})
const deps: Deps = { fetch: network as unknown as typeof fetch, now: () => now }

const REGISTRY = {
  schema: 1,
  known: [
    { id: MANIFEST.id, work: 'studio:the-remainder', href: '/studio/werke-html/the-remainder/', state: 'open', sha256: 'a'.repeat(64), manifest: MANIFEST },
    { id: 'field-changed-study', work: 'field:changed', href: '/field/werke-html/changed/', state: 'unchecked', sha256: 'b'.repeat(64), manifest: null },
    { id: 'field-refused-study', work: 'field:refused', href: '/field/werke-html/refused/', state: 'refused', sha256: 'c'.repeat(64), manifest: null },
    { id: 'studio-stopped-study', work: 'studio:stopped', href: '/studio/werke-html/stopped/', state: 'stopped', sha256: 'd'.repeat(64), manifest: null },
  ],
}

async function makeEnv(overrides: Partial<StudyEnv> = {}): Promise<StudyEnv> {
  return {
    RECEPTION_DB: await fakeD1(),
    TURNSTILE_SECRET_KEY: 'turnstile-secret-for-tests',
    GEMINI_API_KEY: 'gemini-key-for-tests',
    ASSETS: { fetch: async () => new Response(JSON.stringify(REGISTRY)) },
    ...overrides,
  }
}

const body = (patch: Record<string, unknown> = {}) => ({ study: MANIFEST.id, consent: CONSENT_VERSION, manifest: 'a'.repeat(64), answers: ANSWERS, turnstileToken: 'human', ...patch })
const submit = (env: StudyEnv, b: Record<string, unknown>, headers: Record<string, string> = {}) =>
  handleSubmit(
    new Request(`${ORIGIN}/api/study/submit`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', origin: ORIGIN, 'cf-connecting-ip': '203.0.113.7', 'user-agent': 'test-browser', ...headers },
      body: JSON.stringify(b),
    }),
    env,
    deps,
  )
const get = (handler: typeof handleRecord, env: StudyEnv, query: string) => handler(new Request(`${ORIGIN}/api/study/x${query}`), env, deps)
const raw = (env: StudyEnv) => (env.RECEPTION_DB as unknown as { raw: { prepare(sql: string): { all(): Record<string, unknown>[] } } }).raw

beforeEach(() => {
  resetBurst()
  resetRegistryCache()
  network.mockClear()
  gate.mockClear()
  now = new Date('2026-10-28T10:00:00Z')
})

describe.skipIf(!(await sqliteAvailable()))('POST /api/study/submit', () => {
  it('stores the answers of an open study, and hands the reader no id', async () => {
    const env = await makeEnv()
    const res = await submit(env, body())
    expect(await res.json()).toEqual({ ok: true, status: 'stored', study: MANIFEST.id, entries: 1 })
    const row = raw(env).prepare('SELECT * FROM study_entries').all()[0]!
    expect(Object.keys(row).sort()).toEqual(['answers', 'consent', 'day', 'id', 'manifest', 'study'])
    expect(row.id).toMatch(/^s-[0-9a-f]{16}$/)
    expect(row.manifest).toBe('a'.repeat(64))
    expect(JSON.stringify(row)).not.toContain('203.0.113.7')
  })

  it('refuses a study the house’s check has not passed, refused or stopped, or whose file changed since', async () => {
    const env = await makeEnv()
    expect((await submit(env, body({ study: 'never-proposed' }))).status).toBe(404)
    for (const study of ['field-changed-study', 'field-refused-study', 'studio-stopped-study']) {
      const res = await submit(env, body({ study }))
      expect([res.status, (await res.json()).reason], study).toEqual([403, 'not-open'])
    }
  })

  it('refuses another consent text, another version of the questions, and answers the study does not ask', async () => {
    const env = await makeEnv()
    expect((await (await submit(env, body({ consent: '2020-01-01' }))).json()).reason).toBe('consent')
    // a frame that showed an earlier version of a changed file: the answers belong to other questions
    expect((await (await submit(env, body({ manifest: 'b'.repeat(64) }))).json()).reason).toBe('version')
    expect((await (await submit(env, body({ manifest: undefined }))).json()).reason).toBe('version')
    const res = await submit(env, body({ answers: { ...ANSWERS, age: 34 } }))
    expect(await res.json()).toEqual({ ok: false, reason: 'answers', question: 'age' })
  })

  it('declares standby without the store, the bot check or the registry', async () => {
    expect((await (await submit({ TURNSTILE_SECRET_KEY: 'x' }, body())).json()).detail).toBe('store')
    expect((await (await submit(await makeEnv({ TURNSTILE_SECRET_KEY: undefined }), body())).json()).detail).toBe('bot-check')
    expect((await (await submit(await makeEnv({ ASSETS: undefined }), body())).json()).detail).toBe('registry')
  })

  it('refuses a failed bot check and another site', async () => {
    const env = await makeEnv()
    expect((await submit(env, body({ turnstileToken: 'robot' }))).status).toBe(403)
    expect((await submit(env, body(), { origin: 'https://elsewhere.example' })).status).toBe(403)
  })

  it('spends only a token solved in this study’s frame on this host', async () => {
    const env = await makeEnv()
    for (const token of ['from-the-reception', 'for-another-study', 'on-another-host']) {
      expect(await (await submit(env, body({ turnstileToken: token }))).json(), token).toEqual({ ok: false, reason: 'turnstile' })
    }
    // refused before the store is even opened
    expect(() => raw(env).prepare('SELECT COUNT(*) AS n FROM study_entries').all()).toThrow(/no such table/)
    // Cloudflare's test secret answers without an action, cData or hostname: local development only
    const local = await makeEnv({ TURNSTILE_SECRET_KEY: '1x0000000000000000000000000000000AA' })
    expect((await submit(local, body({ turnstileToken: 'from-the-reception' }))).status).toBe(200)
  })

  it('takes one answer set per reader per day, and a few per address whatever browser it claims', async () => {
    const env = await makeEnv()
    expect((await submit(env, body())).status).toBe(200)
    expect((await (await submit(env, body())).json()).reason).toBe('once-a-day')
    for (let i = 2; i <= ADDRESS_DAILY_MAX; i++) expect((await submit(env, body(), { 'user-agent': `browser ${i}` })).status).toBe(200)
    expect((await (await submit(env, body(), { 'user-agent': 'one more' })).json()).reason).toBe('address-limit')
  })

  it('refuses a set over the address limit before its text leaves for the gate', async () => {
    const env = await makeEnv()
    for (let i = 1; i <= ADDRESS_DAILY_MAX; i++) expect((await submit(env, body(), { 'user-agent': `browser ${i}` })).status).toBe(200)
    const res = await submit(env, body({ answers: { ...ANSWERS, note: 'hollow' } }), { 'user-agent': 'one more' })
    expect((await res.json()).reason).toBe('address-limit')
    expect(gate).not.toHaveBeenCalled()
  })

  it('sends written answers through the text gate, and refuses what it blocks', async () => {
    const env = await makeEnv()
    expect((await submit(env, body({ answers: { ...ANSWERS, note: 'hollow' } }))).status).toBe(200)
    expect(gate).toHaveBeenCalledTimes(1)
    const spam = await submit(env, body({ answers: { ...ANSWERS, note: 'BUY NOW' } }), { 'cf-connecting-ip': '198.51.100.2' })
    expect(await spam.json()).toEqual({ ok: false, reason: 'gate', code: 'spam' })
    const noGate = await submit(await makeEnv({ GEMINI_API_KEY: undefined }), body({ answers: { ...ANSWERS, note: 'hollow' } }))
    expect((await noGate.json()).detail).toBe('text-check')
  })
})

describe.skipIf(!(await sqliteAvailable()))('GET /api/study/status and /record', () => {
  it('says whether a study takes answers, and why not', async () => {
    const env = await makeEnv()
    await submit(env, body())
    expect(await (await get(handleStatus, env, `?study=${MANIFEST.id}`)).json()).toEqual({ ok: true, study: MANIFEST.id, open: true, standby: null, entries: 1 })
    expect(await (await get(handleStatus, env, '?study=field-changed-study')).json()).toMatchObject({ open: false, standby: 'unchecked' })
    expect(await (await get(handleStatus, env, '?study=field-refused-study')).json()).toMatchObject({ open: false, standby: 'refused' })
    expect(await (await get(handleStatus, env, '?study=studio-stopped-study')).json()).toMatchObject({ open: false, standby: 'stopped' })
    expect((await get(handleStatus, env, '?study=unknown')).status).toBe(404)
  })

  it('releases only finished days, in whole batches, without the day, and clears the finished day', async () => {
    const env = await makeEnv()
    for (let i = 1; i <= BATCH_SIZE + 1; i++) expect((await submit(env, body(), { 'cf-connecting-ip': `198.51.100.${i}` })).status).toBe(200)
    expect(await (await get(handleRecord, env, `?study=${MANIFEST.id}`)).json()).toMatchObject({ entries_count: 0, entries: [] })
    now = new Date('2026-10-29T02:50:00Z')
    const r = await (await get(handleRecord, env, `?study=${MANIFEST.id}`)).json()
    expect(r).toMatchObject({ ok: true, study: MANIFEST.id, work: 'studio:the-remainder', state: 'open', batch_size: BATCH_SIZE, entries_count: BATCH_SIZE })
    for (const e of r.entries) expect(Object.keys(e).sort()).toEqual(['answers', 'batch', 'consent', 'id', 'manifest'])
    expect(r.entries[0].manifest).toBe('a'.repeat(64))
    for (const table of ['study_salts', 'study_marks', 'study_addr']) expect(raw(env).prepare(`SELECT COUNT(*) AS n FROM ${table}`).all()[0]!.n, table).toBe(0)
  })

  it('clears a finished day on every record call, whatever it answers', async () => {
    const env = await makeEnv()
    await submit(env, body())
    now = new Date('2026-10-29T02:50:00Z')
    const marks = () => raw(env).prepare('SELECT COUNT(*) AS n FROM study_marks').all()[0]!.n
    expect(marks()).toBe(1)
    resetRegistryCache()
    expect((await get(handleRecord, { ...env, ASSETS: undefined }, `?study=${MANIFEST.id}`)).status).toBe(503)
    expect(marks()).toBe(0)
    await submit(env, body())
    now = new Date('2026-10-30T02:50:00Z')
    expect((await get(handleRecord, env, '')).status).toBe(400)
    expect(marks()).toBe(0)
  })

  it('stands by rather than guess when the registry names a study twice', () => {
    expect(parseRegistry(REGISTRY)).not.toBeNull()
    expect(parseRegistry({ ...REGISTRY, known: [...REGISTRY.known, { ...REGISTRY.known[0]!, work: 'studio:another' }] })).toBeNull()
    expect(parseRegistry({ ...REGISTRY, known: [{ ...REGISTRY.known[0]!, sha256: undefined }] })).toBeNull()
    // a registry written before 2026-10-28 named its open studies `approved`; it opens nothing now
    expect(parseRegistry({ ...REGISTRY, known: [{ ...REGISTRY.known[0]!, state: 'approved' }] })).toBeNull()
    expect(parseRegistry({ ...REGISTRY, known: [{ ...REGISTRY.known[0]!, manifest: null }] })).toBeNull()
  })

  it('keeps no order of writing that could pair an answer set with its reader', async () => {
    const env = await makeEnv()
    await submit(env, body())
    for (const table of ['study_entries', 'study_marks', 'study_addr']) expect(() => raw(env).prepare(`SELECT rowid FROM ${table}`).all(), table).toThrow()
  })
})
