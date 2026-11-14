#!/usr/bin/env node
// scripts/post/record.mjs — the operator records what became of a letter (2026-11-14).
//
// Sending is a human act, and so is saying that it happened. The operator opens an issue in this
// repository whose title is `Post sent: <id>`, `Post answered: <id>` or `Post silence: <id>` (the
// links on /post prefill it); .github/workflows/post-record.yml checks who opened it and runs this.
// The status goes into the site-side ledger, which overrides the practice's packet of the same id
// (scripts/post/sync-post-ledger.mjs), and into the assembled ledger, so the page follows at once.
//
// Run:  TITLE='Post sent: 2026-11-some-id' BODY='Note: …' TODAY=2026-11-14 node scripts/post/record.mjs
// It prints one line and sets `changed` and `line` in $GITHUB_OUTPUT. It never throws on a title it
// does not understand: it says so and changes nothing.
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs'

export const TITLE = /^Post (sent|answered|silence): (\d{4}-\d{2}-[a-z0-9-]+)$/
/** What may follow what: a letter is sent once, and only a sent letter is answered or met with silence. */
const FROM = { sent: ['prepared', 'in-preparation', 'withheld'], answered: ['sent', 'silence'], silence: ['sent'] }
const NOTE_MAX = 300

const SAY = {
  sent: (day) => `Sent by the operator on ${day}.`,
  answered: (day) => `Answered; recorded by the operator on ${day}.`,
  silence: (day) => `No answer; recorded as silence by the operator on ${day}.`,
}

/** The operator's own line for the ledger, if the issue carries one: the first line that begins "Note:". */
export function noteOf(body) {
  const line = String(body ?? '')
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => /^Note:/i.test(l))
  if (!line) return null
  const text = line.replace(/^Note:\s*/i, '').replace(/\s+/g, ' ').trim()
  return text ? text.slice(0, NOTE_MAX) : null
}

/**
 * The two ledgers after the record, or the reason nothing changes.
 * `ledger` is the assembled one, `manual` the site-side one; neither is mutated.
 */
export function record({ title, body, today, ledger, manual }) {
  const m = TITLE.exec(String(title ?? '').trim())
  if (!m) return { ok: false, why: 'the title is not "Post sent|answered|silence: <id>"' }
  const [, status, id] = m
  const entry = ledger.find((e) => e.id === id)
  if (!entry) return { ok: false, why: `the ledger has no letter "${id}"` }
  if (!FROM[status].includes(entry.status)) {
    return { ok: false, why: `"${id}" stands at "${entry.status}", and "${status}" does not follow from it` }
  }
  const extra = noteOf(body)
  // A whole copy, so the site-side entry stands on its own when a practice's repository cannot be
  // read in a run; without `derived_from`, which is how the sync tells the two apart.
  const { derived_from: _from, ...rest } = entry
  const next = { ...rest, status, as_of: today, note: extra ? `${SAY[status](today)} ${extra}` : SAY[status](today) }
  const sort = (rows) => [...rows].sort((a, b) => b.as_of.localeCompare(a.as_of) || a.id.localeCompare(b.id))
  return {
    ok: true,
    id,
    status,
    ledger: sort(ledger.map((e) => (e.id === id ? { ...next, ...(entry.derived_from ? { derived_from: entry.derived_from } : {}) } : e))),
    manual: [...manual.filter((e) => e.id !== id), next],
    line: `post: ${id} recorded as ${status} (${today})`,
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const LEDGER = new URL('../../src/data/post/ledger.json', import.meta.url).pathname
  const MANUAL = new URL('../../src/data/post/ledger.manual.json', import.meta.url).pathname
  const read = (p) => JSON.parse(readFileSync(p, 'utf8'))
  const today = process.env.TODAY || new Date().toISOString().slice(0, 10)
  const out = record({ title: process.env.TITLE, body: process.env.BODY, today, ledger: read(LEDGER), manual: read(MANUAL) })
  const emit = (k, v) => process.env.GITHUB_OUTPUT && appendFileSync(process.env.GITHUB_OUTPUT, `${k}=${v}\n`)
  if (!out.ok) {
    console.log(`post record: nothing changed — ${out.why}`)
    emit('changed', 'false')
    emit('line', out.why)
  } else {
    writeFileSync(LEDGER, JSON.stringify(out.ledger, null, 2) + '\n')
    writeFileSync(MANUAL, JSON.stringify(out.manual, null, 2) + '\n')
    console.log(out.line)
    emit('changed', 'true')
    emit('line', out.line)
  }
}
