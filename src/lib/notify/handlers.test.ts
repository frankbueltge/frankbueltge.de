import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeD1, sqliteAvailable } from '../reception/fake-d1'
import { ensureSchema as ensureReception, insertEntry, type D1Like } from '../reception/store'
import { ensureSchema as ensureReading } from '../reading/store'
import { ensureSchema as ensureStudy } from '../study/store'
import { countsOf, handleDaily, handleDailyStatus, ring, ringRating, send, type Deps, type NotifyEnv } from './handlers'
import { RATING_MAILS_PER_DAY } from './operator'

const ARMED = { BREVO_API_KEY: 'key-for-tests', BREVO_SENDER_EMAIL: 'hello@example.org', BREVO_NOTIFY_TO: 'operator@example.org' }
const BREVO = 'https://api.brevo.com/v3/smtp/email'
const ACCOUNT = 'https://api.brevo.com/v3/account'

let now = new Date('2026-11-02T05:00:00Z')
let brevoStatus = 201
let accountStatus = 200
const sent: { subject: string; text: string; to: string }[] = []
const accountReads: string[] = []
const network = vi.fn(async (url: string | URL | Request, init?: RequestInit) => {
  if (String(url) === ACCOUNT) {
    accountReads.push(String(new Headers(init?.headers).get('api-key')))
    if (accountStatus === 200) return new Response('{"plan":[]}', { status: 200 })
    return new Response('{"code":"unauthorized","message":"Key not found"}', { status: accountStatus })
  }
  if (String(url) !== BREVO) throw new Error(`unexpected fetch ${String(url)}`)
  const body = JSON.parse(String(init?.body))
  sent.push({ subject: body.subject, text: body.textContent, to: body.to[0].email })
  if (brevoStatus === 201) return new Response('{"messageId":"<test>"}', { status: 201 })
  return new Response('{"code":"unauthorized","message":"a message that may quote an address"}', { status: brevoStatus })
})
const deps: Deps = { fetch: network as unknown as typeof fetch, now: () => now }

async function makeEnv(overrides: Partial<NotifyEnv> = {}): Promise<NotifyEnv & { RECEPTION_DB: D1Like }> {
  return { RECEPTION_DB: await fakeD1(), ...ARMED, ...overrides } as NotifyEnv & { RECEPTION_DB: D1Like }
}

const post = (env: NotifyEnv, body = '{}') =>
  handleDaily(new Request('https://frankbueltge.de/api/notify/daily', { method: 'POST', headers: { 'content-type': 'application/json' }, body }), env, deps)

let seq = 0
async function rating(db: D1Like, work: string, score: number, at: string, opts: { note?: string; owner?: boolean } = {}) {
  await ensureReception(db)
  await insertEntry(
    db,
    { id: `r-test-${++seq}`, work, score, text: opts.note ?? null, name: null, owner: opts.owner === true, createdAt: at },
    { hash: null, day: at.slice(0, 10) },
  )
}

async function counter(db: D1Like, table: 'reading_counts' | 'study_counts', day: string, key: string, n: number) {
  await (table === 'reading_counts' ? ensureReading(db) : ensureStudy(db))
  await db.prepare(`INSERT INTO ${table} (day, key, n) VALUES (?, ?, ?)`).bind(day, key, n).run()
}

beforeEach(() => {
  now = new Date('2026-11-02T05:00:00Z')
  brevoStatus = 201
  accountStatus = 200
  sent.length = 0
  accountReads.length = 0
  network.mockClear()
})

describe('ring', () => {
  it('sends nothing while the rail is unarmed, and says whether Brevo took a mail', async () => {
    expect(await ring({}, deps, { subject: 's', text: 't' })).toBe(false)
    expect(network).not.toHaveBeenCalled()
    expect(await ring(ARMED, deps, { subject: 's', text: 't' })).toBe(true)
    brevoStatus = 400
    expect(await ring(ARMED, deps, { subject: 's', text: 't' })).toBe(false)
    expect(sent.map((m) => m.to)).toEqual(['operator@example.org', 'operator@example.org'])
  })

  it('keeps Brevo’s status and error code on a refusal, never its message', async () => {
    brevoStatus = 401
    expect(await send(ARMED, deps, { subject: 's', text: 't' })).toEqual({ ok: false, status: 401, code: 'unauthorized' })
    const unreachable: Deps = { fetch: (async () => { throw new Error('offline') }) as unknown as typeof fetch, now: () => now }
    expect(await send(ARMED, unreachable, { subject: 's', text: 't' })).toEqual({ ok: false, status: 0, code: null })
  })
})

describe.skipIf(!(await sqliteAvailable()))('the bells against the store', () => {
  it('rings for visitors’ ratings up to the day’s limit, counting only the day’s visitors', async () => {
    const env = await makeEnv()
    await rating(env.RECEPTION_DB, 'lab:ducking', 5, '2026-11-01T23:59:00.000Z')
    await rating(env.RECEPTION_DB, 'lab:ducking', 5, '2026-11-02T08:00:00.000Z', { owner: true })
    for (let i = 1; i <= RATING_MAILS_PER_DAY + 1; i++) {
      const at = `2026-11-02T10:${String(i).padStart(2, '0')}:00.000Z`
      await rating(env.RECEPTION_DB, 'studio:tide', 3, at)
      await ringRating(env, deps, { work: 'studio:tide', score: 3, note: false, at })
    }
    expect(sent).toHaveLength(RATING_MAILS_PER_DAY)
    expect(sent.at(-1)?.text).toContain(`${RATING_MAILS_PER_DAY}. Bewertungsmail heute`)
  })

  it('counts a day’s visitors per work, round and study, and leaves the architect out', async () => {
    const env = await makeEnv()
    const db = env.RECEPTION_DB
    await rating(db, 'lab:ducking', 4, '2026-11-01T09:00:00.000Z', { note: 'a note' })
    await rating(db, 'lab:ducking', 5, '2026-11-01T19:00:00.000Z')
    await rating(db, 'lab:ducking', 1, '2026-11-01T20:00:00.000Z', { owner: true })
    await rating(db, 'studio:tide', 2, '2026-10-31T12:00:00.000Z')
    await counter(db, 'reading_counts', '2026-11-01', 'round:after-cycle-011', 2)
    await counter(db, 'reading_counts', '2026-11-01', 'readings', 2)
    await counter(db, 'study_counts', '2026-11-01', 'study:field:tempo', 1)
    await counter(db, 'study_counts', '2026-11-01', 'gate', 1)
    expect(await countsOf(db, '2026-11-01')).toEqual({
      ratings: [{ work: 'lab:ducking', n: 2, average: 4.5, notes: 1 }],
      readings: [{ round: 'after-cycle-011', n: 2 }],
      studies: [{ study: 'field:tempo', n: 1 }],
    })
  })
})

describe.skipIf(!(await sqliteAvailable()))('POST /api/notify/daily', () => {
  it('declares standby while the mail rail or the store is missing', async () => {
    expect((await post({ RECEPTION_DB: await fakeD1() })).status).toBe(503)
    expect((await post({ ...ARMED })).status).toBe(503)
    expect(network).not.toHaveBeenCalled()
  })

  it('mails the previous day once, and only once', async () => {
    const env = await makeEnv()
    await rating(env.RECEPTION_DB, 'lab:ducking', 4, '2026-11-01T09:00:00.000Z')
    const first = await post(env)
    expect(await first.json()).toEqual({ ok: true, sent: true, day: '2026-11-01' })
    expect(sent).toHaveLength(1)
    expect(sent[0].subject).toBe('frankbueltge.de am 1.11.2026: 1 Bewertung')
    now = new Date('2026-11-02T18:00:00Z')
    expect(await (await post(env)).json()).toEqual({ ok: true, sent: false, reason: 'already', day: '2026-11-01' })
    expect(sent).toHaveLength(1)
  })

  it('sends no mail on a quiet day, keeps the day done, and asks Brevo once whether the key works', async () => {
    const env = await makeEnv()
    expect(await (await post(env)).json()).toEqual({ ok: true, sent: false, reason: 'quiet', day: '2026-11-01' })
    expect(await (await post(env)).json()).toMatchObject({ sent: false, reason: 'already' })
    expect(sent).toEqual([])
    expect(accountReads).toEqual(['key-for-tests'])
  })

  it('turns a quiet day red when Brevo no longer accepts the key, and gives the day back', async () => {
    const env = await makeEnv()
    accountStatus = 401
    const dead = await post(env)
    expect(dead.status).toBe(424)
    expect(await dead.json()).toEqual({ ok: false, reason: 'rail', upstream: 401, code: 'unauthorized' })
    accountStatus = 200
    expect(await (await post(env)).json()).toMatchObject({ sent: false, reason: 'quiet' })
  })

  it('gives the day back when Brevo refuses the mail, says why, and the next call tries again', async () => {
    const env = await makeEnv()
    await rating(env.RECEPTION_DB, 'lab:ducking', 4, '2026-11-01T09:00:00.000Z')
    brevoStatus = 401
    const refused = await post(env)
    // 424, not 502: Cloudflare would put its own error page in place of a function's 502
    expect(refused.status).toBe(424)
    expect(await refused.json()).toEqual({ ok: false, reason: 'send-failed', upstream: 401, code: 'unauthorized' })
    brevoStatus = 201
    expect(await (await post(env)).json()).toMatchObject({ sent: true })
  })

  it('sends the test mail at most once a day, apart from the daily mail', async () => {
    const env = await makeEnv()
    expect(await (await post(env, '{"test":true}')).json()).toEqual({ ok: true, sent: true, day: '2026-11-02' })
    expect(await (await post(env, '{"test":true}')).json()).toMatchObject({ sent: false, reason: 'already' })
    expect(sent.map((m) => m.subject)).toEqual(['Benachrichtigungen von frankbueltge.de: Testmail'])
    expect(await (await post(env)).json()).toMatchObject({ sent: false, reason: 'quiet' })
  })

  it('refuses a body that is not JSON or too large', async () => {
    const env = await makeEnv()
    expect((await post(env, 'not json')).status).toBe(400)
    expect((await post(env, `{"pad":"${'x'.repeat(300)}"}`)).status).toBe(413)
  })
})

describe('GET /api/notify/daily', () => {
  it('names what is missing, and nothing once armed', async () => {
    expect(await handleDailyStatus({}).json()).toEqual({ ready: false, missing: ['BREVO_API_KEY', 'BREVO_SENDER_EMAIL', 'BREVO_NOTIFY_TO', 'RECEPTION_DB'] })
    expect(await handleDailyStatus({ ...ARMED, RECEPTION_DB: {} as D1Like }).json()).toEqual({ ready: true, missing: [] })
  })
})
