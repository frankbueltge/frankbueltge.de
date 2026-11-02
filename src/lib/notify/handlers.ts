// src/lib/notify/handlers.ts — the operator's bells: counting in D1, sending through Brevo (2026-11-02).
//
// What a bell says, and why it says so little: ./operator.ts. Two kinds of caller:
//   · functions/api/seed.js and functions/api/reception/rate.js ring once per arrival, after the
//     visitor has the answer (context.waitUntil), so a slow or failing mail is never a visitor's error;
//   · POST /api/notify/daily (functions/api/notify/daily.js), asked once a day by
//     .github/workflows/notify-daily.yml. Anyone may ask: it reports the previous UTC day once, in
//     counts, to the operator only, so a stranger's call can at most bring the mail forward.
//
// Which days are done lives in a table of its own in the reception's database: notify_log, one key
// such as `daily:2026-11-02` with the time it was claimed. Nothing about anybody.
import { ensureSchema as ensureReception, type D1Like } from '../reception/store'
import { ensureSchema as ensureReading } from '../reading/store'
import { ensureSchema as ensureStudy } from '../study/store'
import { dailyMail, operatorMissing, operatorRequest, previousDay, ratingMail, testMail, type DayCounts, type OperatorMail } from './operator'

export interface NotifyEnv {
  RECEPTION_DB?: D1Like
  BREVO_API_KEY?: string
  BREVO_SENDER_EMAIL?: string
  BREVO_SENDER_NAME?: string
  BREVO_NOTIFY_TO?: string
}

export interface Deps {
  fetch: typeof fetch
  now: () => Date
}

const MAX_BODY_BYTES = 256

const BREVO_ACCOUNT = 'https://api.brevo.com/v3/account'

const LOG_SCHEMA = 'CREATE TABLE IF NOT EXISTS notify_log (key TEXT PRIMARY KEY, at TEXT NOT NULL)'

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const standby = (detail: string): Response => json(503, { ok: false, reason: 'standby', detail })

const missingOf = (env: NotifyEnv): string[] => operatorMissing(env as Record<string, unknown>)

/**
 * What Brevo said to one bell: its HTTP status and, on a refusal, its error code (`unauthorized`,
 * `permission_denied` …). Never Brevo's message, which may quote an address. Status 0: no answer.
 */
export interface Sent {
  ok: boolean
  status: number
  code: string | null
}

/** Brevo's verdict on one response: ok on the status that means success, else its status and code. */
async function verdictOf(res: Response, success: number): Promise<Sent> {
  if (res.status === success) return { ok: true, status: success, code: null }
  let code: string | null = null
  try {
    const body = (await res.json()) as { code?: unknown }
    if (typeof body?.code === 'string' && /^[a-z_]{1,40}$/.test(body.code)) code = body.code
  } catch {
    // no JSON body: the status alone has to do
  }
  return { ok: false, status: res.status, code }
}

/** Sends one bell and keeps Brevo's verdict. Never throws. */
export async function send(env: NotifyEnv, deps: Deps, mail: OperatorMail): Promise<Sent> {
  const req = operatorRequest(env as Record<string, unknown>, mail)
  if (!req) return { ok: false, status: 0, code: 'unarmed' }
  try {
    return await verdictOf(await deps.fetch(req.url, req.init), 201)
  } catch {
    return { ok: false, status: 0, code: null }
  }
}

/**
 * Asks Brevo whose key this is: a read that sends nothing. It proves the key still works, and it keeps
 * the key in use. Brevo marks a key unused for three months inactive; on 2026-10-31 that silenced every
 * bell of the house, and the site learned of it only when the first test mail failed. Never throws.
 */
export async function railCheck(env: NotifyEnv, deps: Deps): Promise<Sent> {
  if (missingOf(env).length > 0) return { ok: false, status: 0, code: 'unarmed' }
  try {
    const res = await deps.fetch(BREVO_ACCOUNT, { headers: { 'api-key': env.BREVO_API_KEY as string, accept: 'application/json' } })
    return await verdictOf(res, 200)
  } catch {
    return { ok: false, status: 0, code: null }
  }
}

/** Sends one bell; true when Brevo accepted it. Never throws. */
export async function ring(env: NotifyEnv, deps: Deps, mail: OperatorMail | null): Promise<boolean> {
  return mail ? (await send(env, deps, mail)).ok : false
}

/** The bell after a visitor's rating, which the store already holds; the day's count includes it. */
export async function ringRating(env: NotifyEnv, deps: Deps, r: { work: string; score: number; note: boolean; at: string }): Promise<boolean> {
  const db = env.RECEPTION_DB
  if (!db || missingOf(env).length > 0) return false
  try {
    const row = await db
      .prepare('SELECT COUNT(*) AS n FROM reception_entries WHERE owner = 0 AND substr(created_at, 1, 10) = ?')
      .bind(r.at.slice(0, 10))
      .first<{ n: number }>()
    return await ring(env, deps, ratingMail({ work: r.work, score: r.score, note: r.note, n: Number(row?.n ?? 0) }))
  } catch {
    return false
  }
}

/** One day's participation by visitors: ratings per work, readings per round, answers per study. */
export async function countsOf(db: D1Like, day: string): Promise<DayCounts> {
  await ensureReception(db)
  await ensureReading(db)
  await ensureStudy(db)
  const ratings = await db
    .prepare(
      `SELECT work, COUNT(*) AS n, AVG(score) AS average, SUM(CASE WHEN text IS NULL THEN 0 ELSE 1 END) AS notes
       FROM reception_entries WHERE owner = 0 AND substr(created_at, 1, 10) = ? GROUP BY work ORDER BY n DESC, work`,
    )
    .bind(day)
    .all<{ work: string; n: number; average: number; notes: number }>()
  const readings = await db
    .prepare("SELECT key, n FROM reading_counts WHERE day = ? AND key LIKE 'round:%' ORDER BY key")
    .bind(day)
    .all<{ key: string; n: number }>()
  const studies = await db
    .prepare("SELECT key, n FROM study_counts WHERE day = ? AND key LIKE 'study:%' ORDER BY key")
    .bind(day)
    .all<{ key: string; n: number }>()
  return {
    ratings: (ratings.results ?? []).map((r) => ({ work: r.work, n: Number(r.n), average: Number(r.average), notes: Number(r.notes) })),
    readings: (readings.results ?? []).map((r) => ({ round: r.key.slice('round:'.length), n: Number(r.n) })).filter((r) => r.n > 0),
    studies: (studies.results ?? []).map((r) => ({ study: r.key.slice('study:'.length), n: Number(r.n) })).filter((r) => r.n > 0),
  }
}

/** Takes a key once; false when an earlier call took it. */
async function claim(db: D1Like, key: string, at: string): Promise<boolean> {
  const res = await db.prepare('INSERT OR IGNORE INTO notify_log (key, at) VALUES (?, ?)').bind(key, at).run()
  return Number(res.meta?.changes ?? 0) > 0
}

/** Gives a claimed key back, so the next call tries again. */
async function giveBack(db: D1Like, key: string): Promise<void> {
  try {
    await db.prepare('DELETE FROM notify_log WHERE key = ?').bind(key).run()
  } catch {
    // the day stays claimed; tomorrow's call reports tomorrow
  }
}

// ── POST /api/notify/daily ────────────────────────────────────────────────────────────────────────
//
// Body `{}` for the previous day's mail, `{"test": true}` for the test mail; each goes out at most once
// per UTC day. A quiet day sends no mail and stays done, but asks Brevo whether the key still works
// (railCheck), so a dead rail cannot go unnoticed again. A mail Brevo refuses gives its key back, so
// the next call tries again, and the answer names Brevo's status and error code. Failures answer 424,
// not 502: Cloudflare replaces a function's 502 with its own error page, so the reason never arrived
// (seen on the first test, 2026-11-02).
export async function handleDaily(request: Request, env: NotifyEnv, deps: Deps): Promise<Response> {
  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, reason: 'too-large' })
  let test = false
  if (raw.trim() !== '') {
    try {
      test = (JSON.parse(raw) as { test?: unknown } | null)?.test === true
    } catch {
      return json(400, { ok: false, reason: 'bad-json' })
    }
  }
  if (missingOf(env).length > 0) return standby('mail')
  const db = env.RECEPTION_DB
  if (!db) return standby('store')

  const now = deps.now()
  const day = test ? now.toISOString().slice(0, 10) : previousDay(now)
  const key = `${test ? 'test' : 'daily'}:${day}`
  try {
    await db.prepare(LOG_SCHEMA).run()
    if (!(await claim(db, key, now.toISOString()))) return json(200, { ok: true, sent: false, reason: 'already', day })
  } catch {
    return json(424, { ok: false, reason: 'store' })
  }
  let mail: OperatorMail | null
  try {
    mail = test ? testMail(now) : dailyMail(day, await countsOf(db, day))
  } catch {
    await giveBack(db, key)
    return json(424, { ok: false, reason: 'store' })
  }
  if (!mail) {
    // A quiet day still asks Brevo once, so the key stays in use and a dead rail turns the workflow red.
    const rail = await railCheck(env, deps)
    if (rail.ok) return json(200, { ok: true, sent: false, reason: 'quiet', day })
    await giveBack(db, key)
    return json(424, { ok: false, reason: 'rail', upstream: rail.status, code: rail.code })
  }
  const sent = await send(env, deps, mail)
  if (sent.ok) return json(200, { ok: true, sent: true, day })
  await giveBack(db, key)
  return json(424, { ok: false, reason: 'send-failed', upstream: sent.status, code: sent.code })
}

/** GET: whether the bells are armed, naming what is missing (the house's standby honesty). */
export function handleDailyStatus(env: NotifyEnv): Response {
  const missing = missingOf(env)
  if (!env.RECEPTION_DB) missing.push('RECEPTION_DB')
  return json(200, { ready: missing.length === 0, missing })
}
