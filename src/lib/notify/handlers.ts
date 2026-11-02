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

const LOG_SCHEMA = 'CREATE TABLE IF NOT EXISTS notify_log (key TEXT PRIMARY KEY, at TEXT NOT NULL)'

const json = (status: number, body: unknown): Response =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  })

const standby = (detail: string): Response => json(503, { ok: false, reason: 'standby', detail })

const missingOf = (env: NotifyEnv): string[] => operatorMissing(env as Record<string, unknown>)

/** Sends one bell; true when Brevo accepted it. Never throws. */
export async function ring(env: NotifyEnv, deps: Deps, mail: OperatorMail | null): Promise<boolean> {
  if (!mail) return false
  const req = operatorRequest(env as Record<string, unknown>, mail)
  if (!req) return false
  try {
    return (await deps.fetch(req.url, req.init)).status === 201
  } catch {
    return false
  }
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

// ── POST /api/notify/daily ────────────────────────────────────────────────────────────────────────
//
// Body `{}` for the previous day's mail, `{"test": true}` for the test mail; each goes out at most once
// per UTC day. A quiet day sends nothing and stays done. A mail Brevo refuses gives its key back, so
// the next call tries again.
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
    return json(502, { ok: false, reason: 'upstream' })
  }
  try {
    const mail = test ? testMail(now) : dailyMail(day, await countsOf(db, day))
    if (!mail) return json(200, { ok: true, sent: false, reason: 'quiet', day })
    if (await ring(env, deps, mail)) return json(200, { ok: true, sent: true, day })
  } catch {
    // falls through: the key goes back
  }
  try {
    await db.prepare('DELETE FROM notify_log WHERE key = ?').bind(key).run()
  } catch {
    // the day stays claimed; tomorrow's call reports tomorrow
  }
  return json(502, { ok: false, reason: 'send-failed' })
}

/** GET: whether the bells are armed, naming what is missing (the house's standby honesty). */
export function handleDailyStatus(env: NotifyEnv): Response {
  const missing = missingOf(env)
  if (!env.RECEPTION_DB) missing.push('RECEPTION_DB')
  return json(200, { ready: missing.length === 0, missing })
}
