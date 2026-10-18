// src/lib/reception/fake-d1.ts — an in-memory D1 for the tests, over node:sqlite (the same SQLite D1
// runs), so the store's SQL is tested as written. Never imported by the site or the Functions.
import type { D1Like, D1Result, D1Stmt } from './store'

type Sqlite = { prepare(sql: string): { get(...p: unknown[]): unknown; all(...p: unknown[]): unknown[]; run(...p: unknown[]): { changes: number | bigint } }; exec(sql: string): void }

export async function sqliteAvailable(): Promise<boolean> {
  try {
    await import('node:sqlite')
    return true
  } catch {
    return false
  }
}

export async function fakeD1(): Promise<D1Like & { raw: Sqlite }> {
  const { DatabaseSync } = (await import('node:sqlite')) as unknown as { DatabaseSync: new (path: string) => Sqlite }
  const db = new DatabaseSync(':memory:')
  const exec = (sql: string, params: unknown[]): D1Result => {
    const st = db.prepare(sql)
    if (/^\s*SELECT/i.test(sql)) return { results: st.all(...params) as Record<string, unknown>[] }
    const r = st.run(...params)
    return { meta: { changes: Number(r.changes) } }
  }
  const stmt = (sql: string, params: unknown[] = []): D1Stmt & { sql: string; params: unknown[] } => ({
    sql,
    params,
    bind: (...values: unknown[]) => stmt(sql, values),
    first: async <T,>() => ((db.prepare(sql).get(...params) as T | undefined) ?? null),
    all: async <T,>() => ({ results: db.prepare(sql).all(...params) as T[] }),
    run: async () => exec(sql, params),
  })
  return {
    raw: db,
    prepare: (sql: string) => stmt(sql),
    batch: async (statements: D1Stmt[]) => {
      db.exec('BEGIN')
      try {
        const out = statements.map((s) => {
          const { sql, params } = s as unknown as { sql: string; params: unknown[] }
          return exec(sql, params)
        })
        db.exec('COMMIT')
        return out
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
  }
}
