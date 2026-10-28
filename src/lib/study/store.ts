// src/lib/study/store.ts — the practices' studies in Cloudflare D1 (2026-10-27).
//
// The reception's database (RECEPTION_DB), in tables of their own, kept the way Third Reading keeps its
// readings (src/lib/reading/store.ts), because the promises are the same:
//   · study_entries — every answer set: a random id, the study, the UTC day, the consent text's
//     version, the SHA-256 of the manifest it answered (so answers to two checked versions of a study
//     never mix), the answers. No time of day, no address, no hash, no cookie. Released by the record
//     only after its day, in batches, without the day.
//   · study_salts   — one random salt per UTC day.
//   · study_marks   — "this day hash has answered this study today".
//   · study_addr    — how many answer sets one address gave a study today, capped.
//   · study_counts  — per day: answer sets stored, per study and in all, and text-gate calls.
// A finished day's salts, marks and address counts are deleted by the next submission or record call;
// the nightly snapshot makes a record call every night. Entries, marks and address counts are
// WITHOUT ROWID tables, so the order of writing cannot pair an answer set with its reader's mark.
import type { D1Like, D1Stmt } from '../reception/store'
import type { Answers } from './answers'

/** Answer sets one address may give one study per UTC day, whatever browsers it claims. */
export const ADDRESS_DAILY_MAX = 3

export interface StoredAnswers {
  id: string
  day: string
  consent: string
  /** the SHA-256 of the checked manifest the answers were given to */
  manifest: string
  answers: Answers
}

export const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS study_entries (
    id TEXT PRIMARY KEY,
    study TEXT NOT NULL,
    day TEXT NOT NULL,
    consent TEXT NOT NULL,
    manifest TEXT NOT NULL,
    answers TEXT NOT NULL
  ) WITHOUT ROWID`,
  'CREATE INDEX IF NOT EXISTS study_entries_study ON study_entries (study, day)',
  'CREATE TABLE IF NOT EXISTS study_salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)',
  `CREATE TABLE IF NOT EXISTS study_marks (
    hash TEXT NOT NULL,
    study TEXT NOT NULL,
    day TEXT NOT NULL,
    PRIMARY KEY (hash, study)
  ) WITHOUT ROWID`,
  `CREATE TABLE IF NOT EXISTS study_addr (
    hash TEXT NOT NULL,
    study TEXT NOT NULL,
    day TEXT NOT NULL,
    n INTEGER NOT NULL CHECK (n <= ${ADDRESS_DAILY_MAX}),
    PRIMARY KEY (hash, study)
  ) WITHOUT ROWID`,
  'CREATE TABLE IF NOT EXISTS study_counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))',
]

const ready = new WeakSet<object>()

export async function ensureSchema(db: D1Like): Promise<void> {
  if (ready.has(db)) return
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)))
  ready.add(db)
}

const cleanupStmts = (db: D1Like, day: string): D1Stmt[] => [
  db.prepare('DELETE FROM study_salts WHERE day < ?').bind(day),
  db.prepare('DELETE FROM study_marks WHERE day < ?').bind(day),
  db.prepare('DELETE FROM study_addr WHERE day < ?').bind(day),
]

export async function cleanup(db: D1Like, day: string): Promise<void> {
  await db.batch(cleanupStmts(db, day))
}

export async function todaysSalt(db: D1Like, day: string, freshSalt: string): Promise<string> {
  await db.batch([db.prepare('INSERT OR IGNORE INTO study_salts (day, salt) VALUES (?, ?)').bind(day, freshSalt), ...cleanupStmts(db, day)])
  const row = await db.prepare('SELECT salt FROM study_salts WHERE day = ?').bind(day).first<{ salt: string }>()
  if (!row?.salt) throw new Error('no salt for the day')
  return row.salt
}

export async function hasMark(db: D1Like, hash: string, study: string): Promise<boolean> {
  return (await db.prepare('SELECT 1 AS hit FROM study_marks WHERE hash = ? AND study = ?').bind(hash, study).first()) !== null
}

/** How many answer sets this address has given this study today. Read before the text gate, so a
 *  set the store would refuse never reaches the model; the CHECK on study_addr still decides a race. */
export async function addressCount(db: D1Like, addr: string, study: string): Promise<number> {
  const row = await db.prepare('SELECT n FROM study_addr WHERE hash = ? AND study = ?').bind(addr, study).first<{ n: number }>()
  return row?.n ?? 0
}

export async function countOf(db: D1Like, day: string, key: string): Promise<number> {
  const row = await db.prepare('SELECT n FROM study_counts WHERE day = ? AND key = ?').bind(day, key).first<{ n: number }>()
  return row?.n ?? 0
}

export async function studyTotal(db: D1Like, study: string): Promise<number> {
  const row = await db.prepare('SELECT COALESCE(SUM(n), 0) AS n FROM study_counts WHERE key = ?').bind(`study:${study}`).first<{ n: number }>()
  return Number(row?.n ?? 0)
}

const bumpStmt = (db: D1Like, day: string, key: string): D1Stmt =>
  db.prepare('INSERT INTO study_counts (day, key, n) VALUES (?, ?, 1) ON CONFLICT (day, key) DO UPDATE SET n = n + 1').bind(day, key)

export async function bump(db: D1Like, day: string, key: string): Promise<void> {
  await bumpStmt(db, day, key).run()
}

export type InsertResult = 'stored' | 'once-a-day' | 'address-limit'

/** One transaction: the answers, the day's counts, the reader's mark and the address count. */
export async function insertAnswers(
  db: D1Like,
  id: string,
  e: { study: string; consent: string; manifest: string; answers: Answers },
  opts: { hash: string; addr: string; day: string },
): Promise<InsertResult> {
  try {
    await db.batch([
      db
        .prepare('INSERT INTO study_entries (id, study, day, consent, manifest, answers) VALUES (?, ?, ?, ?, ?, ?)')
        .bind(id, e.study, opts.day, e.consent, e.manifest, JSON.stringify(e.answers)),
      bumpStmt(db, opts.day, 'entries'),
      bumpStmt(db, opts.day, `study:${e.study}`),
      db.prepare('INSERT INTO study_marks (hash, study, day) VALUES (?, ?, ?)').bind(opts.hash, e.study, opts.day),
      db
        .prepare('INSERT INTO study_addr (hash, study, day, n) VALUES (?, ?, ?, 1) ON CONFLICT (hash, study) DO UPDATE SET n = n + 1')
        .bind(opts.addr, e.study, opts.day),
    ])
    return 'stored'
  } catch (error) {
    const message = String((error as Error)?.message ?? error)
    if (/CHECK/i.test(message)) return 'address-limit'
    if (/UNIQUE|PRIMARY KEY|constraint/i.test(message)) return 'once-a-day'
    throw error
  }
}

/** Every answer set of a study stored before `today`, by day and then by its random id. */
export async function finishedEntries(db: D1Like, study: string, today: string): Promise<StoredAnswers[]> {
  const res = await db
    .prepare('SELECT id, day, consent, manifest, answers FROM study_entries WHERE study = ? AND day < ? ORDER BY day, id')
    .bind(study, today)
    .all<{ id: string; day: string; consent: string; manifest: string; answers: string }>()
  return (res.results ?? []).map((r) => ({ id: r.id, day: r.day, consent: r.consent, manifest: r.manifest, answers: JSON.parse(r.answers) as Answers }))
}
