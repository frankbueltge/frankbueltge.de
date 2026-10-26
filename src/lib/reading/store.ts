// src/lib/reading/store.ts — Third Reading's state in Cloudflare D1 (2026-10-26).
//
// The same database as the reception (bound as RECEPTION_DB, docs/design/2026-10-17-the-reception.md),
// in tables of its own. What is kept, and for how long (duty 1 of .claude/rules/runtime-and-works.md;
// the page says the same in its own words):
//   · reading_entries — every reading: a random id, the round, the UTC day, the consent text's version,
//     whether the reader had opened the page's readings before sending, the choices and the estimates
//     with how long each took. No time of day, no address, no hash, no cookie. Kept as long as the store
//     exists; the public record releases it without its day, once its day is over, in batches.
//   · reading_salts   — one random salt per UTC day.
//   · reading_marks   — "this day hash has given a reading in this round today".
//   · reading_addr    — how many readings one address (without its browser) gave today, capped.
//   · reading_counts  — per day: readings stored, per round and in all. Counts only.
// Salts, marks and address counts of a finished day are deleted by the first submission or record
// request of the next day; the nightly snapshot makes one every night.
//
// The entry, mark and address tables are WITHOUT ROWID: a rowid table keeps the order rows were written
// in, and an entry and its reader's mark are written in one transaction, so a rowid would pair them.
// Keyed by a random id and by a hash, their order says nothing about who wrote what.
//
// Created on first use, so the database needs no console step.
import type { D1Like, D1Stmt } from '../reception/store'
import type { EstimateTuple, Reading, StoredReading, VoteTuple } from './reading'

/** Readings one address may give per UTC day, whatever browsers it claims — a household, an office. */
export const ADDRESS_DAILY_MAX = 3

export const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS reading_entries (
    id TEXT PRIMARY KEY,
    round TEXT NOT NULL,
    day TEXT NOT NULL,
    consent TEXT NOT NULL,
    primed INTEGER NOT NULL DEFAULT 0,
    votes TEXT NOT NULL,
    estimates TEXT NOT NULL
  ) WITHOUT ROWID`,
  'CREATE INDEX IF NOT EXISTS reading_entries_round ON reading_entries (round, day)',
  'CREATE TABLE IF NOT EXISTS reading_salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)',
  `CREATE TABLE IF NOT EXISTS reading_marks (
    hash TEXT NOT NULL,
    round TEXT NOT NULL,
    day TEXT NOT NULL,
    PRIMARY KEY (hash, round)
  ) WITHOUT ROWID`,
  `CREATE TABLE IF NOT EXISTS reading_addr (
    hash TEXT PRIMARY KEY,
    day TEXT NOT NULL,
    n INTEGER NOT NULL CHECK (n <= ${ADDRESS_DAILY_MAX})
  ) WITHOUT ROWID`,
  'CREATE TABLE IF NOT EXISTS reading_counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))',
]

const ready = new WeakSet<object>()

export async function ensureSchema(db: D1Like): Promise<void> {
  if (ready.has(db)) return
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)))
  ready.add(db)
}

/** Everything of a finished day that could tie a reader to a reading: salts, marks, address counts. */
const cleanupStmts = (db: D1Like, day: string): D1Stmt[] => [
  db.prepare('DELETE FROM reading_salts WHERE day < ?').bind(day),
  db.prepare('DELETE FROM reading_marks WHERE day < ?').bind(day),
  db.prepare('DELETE FROM reading_addr WHERE day < ?').bind(day),
]

export async function cleanup(db: D1Like, day: string): Promise<void> {
  await db.batch(cleanupStmts(db, day))
}

/** Today's salt, created if the day has none yet; the finished days go in the same breath. */
export async function todaysSalt(db: D1Like, day: string, freshSalt: string): Promise<string> {
  await db.batch([db.prepare('INSERT OR IGNORE INTO reading_salts (day, salt) VALUES (?, ?)').bind(day, freshSalt), ...cleanupStmts(db, day)])
  const row = await db.prepare('SELECT salt FROM reading_salts WHERE day = ?').bind(day).first<{ salt: string }>()
  if (!row?.salt) throw new Error('no salt for the day')
  return row.salt
}

export async function hasMark(db: D1Like, hash: string, round: string): Promise<boolean> {
  return (await db.prepare('SELECT 1 AS hit FROM reading_marks WHERE hash = ? AND round = ?').bind(hash, round).first()) !== null
}

export async function countOf(db: D1Like, day: string, key: string): Promise<number> {
  const row = await db.prepare('SELECT n FROM reading_counts WHERE day = ? AND key = ?').bind(day, key).first<{ n: number }>()
  return row?.n ?? 0
}

/** All readings stored in a round, over every day. */
export async function roundTotal(db: D1Like, round: string): Promise<number> {
  const row = await db.prepare('SELECT COALESCE(SUM(n), 0) AS n FROM reading_counts WHERE key = ?').bind(`round:${round}`).first<{ n: number }>()
  return Number(row?.n ?? 0)
}

const bumpStmt = (db: D1Like, day: string, key: string): D1Stmt =>
  db.prepare('INSERT INTO reading_counts (day, key, n) VALUES (?, ?, 1) ON CONFLICT (day, key) DO UPDATE SET n = n + 1').bind(day, key)

export type InsertResult = 'stored' | 'once-a-day' | 'address-limit'

/**
 * Stores a reading, the day's counts, the reader's mark and the address count in one transaction. The
 * mark is inserted plainly and the address count is capped by a CHECK, so a second reading by the same
 * day hash, or one reading too many from one address, fails the whole batch — even two requests that
 * arrive together.
 */
export async function insertReading(db: D1Like, id: string, r: Reading, opts: { hash: string; addr: string; day: string }): Promise<InsertResult> {
  try {
    await db.batch([
      db
        .prepare('INSERT INTO reading_entries (id, round, day, consent, primed, votes, estimates) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(id, r.round, opts.day, r.consent, r.primed ? 1 : 0, JSON.stringify(r.votes), JSON.stringify(r.estimates)),
      bumpStmt(db, opts.day, 'readings'),
      bumpStmt(db, opts.day, `round:${r.round}`),
      db.prepare('INSERT INTO reading_marks (hash, round, day) VALUES (?, ?, ?)').bind(opts.hash, r.round, opts.day),
      db
        .prepare('INSERT INTO reading_addr (hash, day, n) VALUES (?, ?, 1) ON CONFLICT (hash) DO UPDATE SET n = n + 1')
        .bind(opts.addr, opts.day),
    ])
    return 'stored'
  } catch (error) {
    const message = String((error as Error)?.message ?? error)
    if (/CHECK/i.test(message)) return 'address-limit'
    if (/UNIQUE|PRIMARY KEY|constraint/i.test(message)) return 'once-a-day'
    throw error
  }
}

interface EntryRow {
  id: string
  day: string
  consent: string
  primed: number
  votes: string
  estimates: string
}

/** Every reading of a round stored before `today`, by day and then by its random id — never by hour. */
export async function finishedEntries(db: D1Like, round: string, today: string): Promise<StoredReading[]> {
  const res = await db
    .prepare('SELECT id, day, consent, primed, votes, estimates FROM reading_entries WHERE round = ? AND day < ? ORDER BY day, id')
    .bind(round, today)
    .all<EntryRow>()
  return (res.results ?? []).map((r) => ({
    id: r.id,
    day: r.day,
    consent: r.consent,
    primed: r.primed === 1,
    votes: JSON.parse(r.votes) as VoteTuple[],
    estimates: JSON.parse(r.estimates) as EstimateTuple[],
  }))
}
