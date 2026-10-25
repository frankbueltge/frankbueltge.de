// src/lib/reading/store.ts — Third Reading's state in Cloudflare D1 (2026-10-26).
//
// The same database as the reception (bound as RECEPTION_DB, docs/design/2026-10-17-the-reception.md),
// in tables of its own. What is kept, and for how long (duty 1 of .claude/rules/runtime-and-works.md;
// the page says the same in its own words):
//   · reading_entries — every reading: the round, the UTC day, the consent text's version, whether the
//     reader had opened the three readings before sending, the choices and the estimates with how long
//     each took. No time of day, no address, no hash, no cookie. Kept as
//     long as the store exists; the nightly snapshot commits all of it to git as open data.
//   · reading_salts   — one random salt per UTC day; deleted when the day is over.
//   · reading_marks   — "this day hash has given a reading in this round", deleted after 24 hours, so
//     a reader can take part once a day. It counts, it never identifies.
//   · reading_counts  — per day: readings stored, per round and in all. Counts only.
//
// Created on first use, so the database needs no console step.
import type { D1Like, D1Stmt } from '../reception/store'
import type { EstimateTuple, Reading, StoredReading, VoteTuple } from './reading'

export const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS reading_entries (
    id TEXT PRIMARY KEY,
    round TEXT NOT NULL,
    day TEXT NOT NULL,
    consent TEXT NOT NULL,
    primed INTEGER NOT NULL DEFAULT 0,
    votes TEXT NOT NULL,
    estimates TEXT NOT NULL
  )`,
  'CREATE INDEX IF NOT EXISTS reading_entries_round ON reading_entries (round, id)',
  'CREATE TABLE IF NOT EXISTS reading_salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)',
  `CREATE TABLE IF NOT EXISTS reading_marks (
    hash TEXT NOT NULL,
    round TEXT NOT NULL,
    at INTEGER NOT NULL,
    PRIMARY KEY (hash, round)
  )`,
  'CREATE INDEX IF NOT EXISTS reading_marks_at ON reading_marks (at)',
  'CREATE TABLE IF NOT EXISTS reading_counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))',
]

/** How long the "has taken part today" mark is kept, in seconds. */
export const MARK_TTL_S = 24 * 3600

const ready = new WeakSet<object>()

export async function ensureSchema(db: D1Like): Promise<void> {
  if (ready.has(db)) return
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)))
  ready.add(db)
}

/** Today's salt, created if the day has none yet; older salts and marks go in the same breath. */
export async function todaysSalt(db: D1Like, day: string, freshSalt: string, nowS: number): Promise<string> {
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO reading_salts (day, salt) VALUES (?, ?)').bind(day, freshSalt),
    db.prepare('DELETE FROM reading_salts WHERE day < ?').bind(day),
    db.prepare('DELETE FROM reading_marks WHERE at < ?').bind(nowS - MARK_TTL_S),
  ])
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

/**
 * Stores a reading, the day's counts and the reader's mark in one transaction. The mark is inserted
 * plainly, so a second reading by the same day hash in the same round fails the whole batch: the limit
 * holds even against two requests that arrive together. Returns false when that happened.
 */
export async function insertReading(db: D1Like, id: string, r: Reading, opts: { hash: string; nowS: number; day: string }): Promise<boolean> {
  try {
    await db.batch([
      db
        .prepare('INSERT INTO reading_entries (id, round, day, consent, primed, votes, estimates) VALUES (?, ?, ?, ?, ?, ?, ?)')
        .bind(id, r.round, opts.day, r.consent, r.primed ? 1 : 0, JSON.stringify(r.votes), JSON.stringify(r.estimates)),
      bumpStmt(db, opts.day, 'readings'),
      bumpStmt(db, opts.day, `round:${r.round}`),
      db.prepare('INSERT INTO reading_marks (hash, round, at) VALUES (?, ?, ?)').bind(opts.hash, r.round, opts.nowS),
    ])
    return true
  } catch (error) {
    if (/UNIQUE|PRIMARY KEY|constraint/i.test(String((error as Error)?.message ?? error))) return false
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

/** Every reading of a round, ordered by id — which sorts by day and then by chance, never by hour. */
export async function roundEntries(db: D1Like, round: string): Promise<StoredReading[]> {
  const res = await db.prepare('SELECT id, day, consent, primed, votes, estimates FROM reading_entries WHERE round = ? ORDER BY id').bind(round).all<EntryRow>()
  return (res.results ?? []).map((r) => ({
    id: r.id,
    day: r.day,
    consent: r.consent,
    primed: r.primed === 1,
    votes: JSON.parse(r.votes) as VoteTuple[],
    estimates: JSON.parse(r.estimates) as EstimateTuple[],
  }))
}
