// src/lib/reception/store.ts — the reception's state in Cloudflare D1 (2026-10-17).
//
// What is kept, and for how long (duty 1 of .claude/rules/runtime-and-works.md; the rating form says
// the same in its own words):
//   · reception_entries — every rating: the work, 1 to 5, the note and the name if given, whether the
//     architect wrote it, when, and how often it was reported. No address, no hash, no cookie.
//     Kept as long as the store exists; the nightly snapshot commits what is public of it to git.
//   · reception_totals  — the count of each score per work, so a page reads one row, not every rating.
//   · reception_salts   — one random salt per UTC day; deleted when the day is over.
//   · reception_marks   — "this day hash has rated this work / reported this note", deleted after
//     24 hours. They count, they never identify.
//   · reception_counts  — per day: how many entries were stored, how many gate calls were made, and
//     how many notes were refused for each reason. Counts only.
//
// Created on first use, so the database needs no console step: an empty D1 bound as RECEPTION_DB is
// enough.

export interface D1Result<T = Record<string, unknown>> {
  results?: T[]
  meta?: { changes?: number }
}
export interface D1Stmt {
  bind(...values: unknown[]): D1Stmt
  first<T = Record<string, unknown>>(): Promise<T | null>
  all<T = Record<string, unknown>>(): Promise<D1Result<T>>
  run(): Promise<D1Result>
}
export interface D1Like {
  prepare(sql: string): D1Stmt
  batch(statements: D1Stmt[]): Promise<D1Result[]>
}

export const SCHEMA: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS reception_entries (
    id TEXT PRIMARY KEY,
    work TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 5),
    text TEXT,
    name TEXT,
    owner INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    reports INTEGER NOT NULL DEFAULT 0,
    hidden_at TEXT
  )`,
  'CREATE INDEX IF NOT EXISTS reception_entries_work ON reception_entries (work, created_at)',
  'CREATE INDEX IF NOT EXISTS reception_entries_notes ON reception_entries (created_at) WHERE text IS NOT NULL',
  `CREATE TABLE IF NOT EXISTS reception_totals (
    work TEXT PRIMARY KEY,
    n1 INTEGER NOT NULL DEFAULT 0,
    n2 INTEGER NOT NULL DEFAULT 0,
    n3 INTEGER NOT NULL DEFAULT 0,
    n4 INTEGER NOT NULL DEFAULT 0,
    n5 INTEGER NOT NULL DEFAULT 0,
    last_at TEXT NOT NULL
  )`,
  'CREATE TABLE IF NOT EXISTS reception_salts (day TEXT PRIMARY KEY, salt TEXT NOT NULL)',
  `CREATE TABLE IF NOT EXISTS reception_marks (
    hash TEXT NOT NULL,
    subject TEXT NOT NULL,
    kind TEXT NOT NULL,
    at INTEGER NOT NULL,
    PRIMARY KEY (hash, subject, kind)
  )`,
  'CREATE INDEX IF NOT EXISTS reception_marks_at ON reception_marks (at)',
  'CREATE TABLE IF NOT EXISTS reception_counts (day TEXT NOT NULL, key TEXT NOT NULL, n INTEGER NOT NULL DEFAULT 0, PRIMARY KEY (day, key))',
]

/** Three reports from three different day hashes hide a note. */
export const REPORTS_TO_HIDE = 3
/** How long a mark ("rated", "reported") is kept, in seconds. */
export const MARK_TTL_S = 24 * 3600

const ready = new WeakSet<object>()

/** Creates the tables on first use, once per database per isolate. */
export async function ensureSchema(db: D1Like): Promise<void> {
  if (ready.has(db)) return
  await db.batch(SCHEMA.map((sql) => db.prepare(sql)))
  ready.add(db)
}

/** Today's salt, created if the day has none yet; every earlier day's salt is deleted in the same
 *  breath, together with the marks older than a day. */
export async function todaysSalt(db: D1Like, day: string, freshSalt: string, nowS: number): Promise<string> {
  await db.batch([
    db.prepare('INSERT OR IGNORE INTO reception_salts (day, salt) VALUES (?, ?)').bind(day, freshSalt),
    db.prepare('DELETE FROM reception_salts WHERE day < ?').bind(day),
    db.prepare('DELETE FROM reception_marks WHERE at < ?').bind(nowS - MARK_TTL_S),
  ])
  const row = await db.prepare('SELECT salt FROM reception_salts WHERE day = ?').bind(day).first<{ salt: string }>()
  if (!row?.salt) throw new Error('no salt for the day')
  return row.salt
}

export async function hasMark(db: D1Like, hash: string, subject: string, kind: 'rate' | 'report'): Promise<boolean> {
  const row = await db.prepare('SELECT 1 AS hit FROM reception_marks WHERE hash = ? AND subject = ? AND kind = ?').bind(hash, subject, kind).first()
  return row !== null
}

export async function countOf(db: D1Like, day: string, key: string): Promise<number> {
  const row = await db.prepare('SELECT n FROM reception_counts WHERE day = ? AND key = ?').bind(day, key).first<{ n: number }>()
  return row?.n ?? 0
}

const bumpStmt = (db: D1Like, day: string, key: string): D1Stmt =>
  db.prepare('INSERT INTO reception_counts (day, key, n) VALUES (?, ?, 1) ON CONFLICT (day, key) DO UPDATE SET n = n + 1').bind(day, key)

export async function bump(db: D1Like, day: string, key: string): Promise<void> {
  await bumpStmt(db, day, key).run()
}

/** The column of a score, from a whitelist: the only place a value reaches the SQL text. */
const col = (score: number): string => {
  if (![1, 2, 3, 4, 5].includes(score)) throw new Error(`not a score: ${score}`)
  return `n${score}`
}

export interface NewEntry {
  id: string
  work: string
  score: number
  text: string | null
  name: string | null
  owner: boolean
  createdAt: string
}

/**
 * Stores an entry, its total, the visitor's mark for the day and the day's count in one transaction.
 * The mark is inserted plainly, so a second rating of the same work by the same day hash fails the
 * whole batch: the rate limit holds even against two requests that arrive together. Returns false
 * when that happened.
 */
export async function insertEntry(db: D1Like, e: NewEntry, opts: { hash: string | null; nowS: number; day: string }): Promise<boolean> {
  const c = col(e.score)
  const statements = [
    db
      .prepare('INSERT INTO reception_entries (id, work, score, text, name, owner, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .bind(e.id, e.work, e.score, e.text, e.name, e.owner ? 1 : 0, e.createdAt),
    db
      .prepare(`INSERT INTO reception_totals (work, ${c}, last_at) VALUES (?, 1, ?) ON CONFLICT (work) DO UPDATE SET ${c} = ${c} + 1, last_at = excluded.last_at`)
      .bind(e.work, e.createdAt),
    bumpStmt(db, opts.day, 'entries'),
  ]
  if (opts.hash) statements.push(db.prepare('INSERT INTO reception_marks (hash, subject, kind, at) VALUES (?, ?, ?, ?)').bind(opts.hash, e.work, 'rate', opts.nowS))
  try {
    await db.batch(statements)
    return true
  } catch (error) {
    if (opts.hash && /UNIQUE|PRIMARY KEY|constraint/i.test(String((error as Error)?.message ?? error))) return false
    throw error
  }
}

export interface TotalsRow {
  work: string
  n1: number
  n2: number
  n3: number
  n4: number
  n5: number
  last_at: string
}

export interface NoteRow {
  id: string
  work: string
  score: number
  text: string
  name: string | null
  owner: number
  created_at: string
}

export function summarize(t: Pick<TotalsRow, 'n1' | 'n2' | 'n3' | 'n4' | 'n5'> | null): { count: number; average: number | null; distribution: [number, number, number, number, number] } {
  const distribution: [number, number, number, number, number] = t ? [t.n1, t.n2, t.n3, t.n4, t.n5] : [0, 0, 0, 0, 0]
  const count = distribution.reduce((a, b) => a + b, 0)
  const sum = distribution.reduce((a, n, i) => a + n * (i + 1), 0)
  return { count, average: count ? Math.round((sum / count) * 100) / 100 : null, distribution }
}

/** One work as its page shows it: the totals and the newest visible notes, the architect's first. */
export async function workView(db: D1Like, work: string, limit = 12): Promise<{ totals: TotalsRow | null; notes: NoteRow[] }> {
  const [totals, notes] = await Promise.all([
    db.prepare('SELECT work, n1, n2, n3, n4, n5, last_at FROM reception_totals WHERE work = ?').bind(work).first<TotalsRow>(),
    db
      .prepare(
        'SELECT id, work, score, text, name, owner, created_at FROM reception_entries WHERE work = ? AND text IS NOT NULL AND hidden_at IS NULL ORDER BY owner DESC, created_at DESC LIMIT ?',
      )
      .bind(work, limit)
      .all<NoteRow>(),
  ])
  return { totals, notes: notes.results ?? [] }
}

export interface HiddenRow {
  id: string
  work: string
  created_at: string
  hidden_at: string
  reports: number
}

/** Everything public, for the record page and the nightly snapshot: every work's totals, every
 *  visible note, the hidden notes WITHOUT their text, and the daily counts. */
export async function publicRecord(db: D1Like): Promise<{ totals: TotalsRow[]; notes: NoteRow[]; hidden: HiddenRow[]; counts: { day: string; key: string; n: number }[] }> {
  const [totals, notes, hidden, counts] = await Promise.all([
    db.prepare('SELECT work, n1, n2, n3, n4, n5, last_at FROM reception_totals ORDER BY work').all<TotalsRow>(),
    db
      .prepare('SELECT id, work, score, text, name, owner, created_at FROM reception_entries WHERE text IS NOT NULL AND hidden_at IS NULL ORDER BY created_at DESC, id')
      .all<NoteRow>(),
    db.prepare('SELECT id, work, created_at, hidden_at, reports FROM reception_entries WHERE hidden_at IS NOT NULL ORDER BY hidden_at DESC, id').all<HiddenRow>(),
    db.prepare('SELECT day, key, n FROM reception_counts WHERE n > 0 ORDER BY day, key').all<{ day: string; key: string; n: number }>(),
  ])
  return { totals: totals.results ?? [], notes: notes.results ?? [], hidden: hidden.results ?? [], counts: counts.results ?? [] }
}

/** The hidden notes with their text, for the architect alone. */
export async function hiddenNotes(db: D1Like): Promise<(NoteRow & { hidden_at: string; reports: number })[]> {
  const res = await db
    .prepare('SELECT id, work, score, text, name, owner, created_at, hidden_at, reports FROM reception_entries WHERE hidden_at IS NOT NULL ORDER BY hidden_at DESC')
    .all<NoteRow & { hidden_at: string; reports: number }>()
  return res.results ?? []
}

interface EntryState {
  id: string
  work: string
  score: number
  owner: number
  text: string | null
  reports: number
  hidden_at: string | null
  created_at: string
}

const entryState = (db: D1Like, id: string): Promise<EntryState | null> =>
  db.prepare('SELECT id, work, score, owner, text, reports, hidden_at, created_at FROM reception_entries WHERE id = ?').bind(id).first<EntryState>()

/**
 * One report of a visitor's visible note by one day hash. A second report by the same hash on the same
 * day counts nothing; the third distinct report hides the note and takes its score out of the totals
 * until the architect restores it.
 */
export async function reportEntry(
  db: D1Like,
  id: string,
  opts: { hash: string; nowS: number; day: string; at: string },
): Promise<'not-found' | 'already' | 'counted' | 'hidden'> {
  const e = await entryState(db, id)
  if (!e || e.text === null || e.owner === 1 || e.hidden_at !== null) return 'not-found'
  const mark = await db
    .prepare('INSERT OR IGNORE INTO reception_marks (hash, subject, kind, at) VALUES (?, ?, ?, ?)')
    .bind(opts.hash, id, 'report', opts.nowS)
    .run()
  if (!mark.meta?.changes) return 'already'
  const reports = e.reports + 1
  if (reports < REPORTS_TO_HIDE) {
    await db.batch([db.prepare('UPDATE reception_entries SET reports = ? WHERE id = ?').bind(reports, id), bumpStmt(db, opts.day, 'reports')])
    return 'counted'
  }
  const c = col(e.score)
  await db.batch([
    db.prepare('UPDATE reception_entries SET reports = ?, hidden_at = ? WHERE id = ? AND hidden_at IS NULL').bind(reports, opts.at, id),
    db.prepare(`UPDATE reception_totals SET ${c} = MAX(${c} - 1, 0) WHERE work = ?`).bind(e.work),
    bumpStmt(db, opts.day, 'reports'),
    bumpStmt(db, opts.day, 'hidden'),
  ])
  return 'hidden'
}

/** The architect's two answers to a hidden note, and his way to take back any entry. */
export async function moderateEntry(db: D1Like, id: string, action: 'restore' | 'remove', at: string): Promise<'not-found' | 'not-hidden' | 'done'> {
  const e = await entryState(db, id)
  if (!e) return 'not-found'
  const c = col(e.score)
  if (action === 'restore') {
    if (e.hidden_at === null) return 'not-hidden'
    await db.batch([
      db.prepare('UPDATE reception_entries SET hidden_at = NULL, reports = 0 WHERE id = ?').bind(id),
      db.prepare(`INSERT INTO reception_totals (work, ${c}, last_at) VALUES (?, 1, ?) ON CONFLICT (work) DO UPDATE SET ${c} = ${c} + 1`).bind(e.work, at),
    ])
    return 'done'
  }
  // A removed entry no longer stands anywhere: not in its work's totals, and not in the count of the
  // day it was stored on (the counts are what stands, not what was once typed).
  const statements = [
    db.prepare('DELETE FROM reception_entries WHERE id = ?').bind(id),
    db.prepare("UPDATE reception_counts SET n = MAX(n - 1, 0) WHERE day = ? AND key = 'entries'").bind(e.created_at.slice(0, 10)),
  ]
  if (e.hidden_at === null) statements.push(db.prepare(`UPDATE reception_totals SET ${c} = MAX(${c} - 1, 0) WHERE work = ?`).bind(e.work))
  await db.batch(statements)
  return 'done'
}
