// src/lib/comma/block.ts — five minutes of deviations, as Comma plays them, live or from its recording
// (2026-11-14). Pure.
//
// A block is what OONI answered for five minutes: every test that deviated, of every kind. The page plays a block
// from OONI when the site could read it, and otherwise a block of the house's own recording
// (public/comma/tape/, written by scripts/comma/record.ts), which holds the same facts in fewer bytes. Both arrive
// here as the same thing, a list of deviations, so nothing downstream can tell them apart except by the label the
// page shows. What a recording may hold is narrower than what OONI sends: no tested address at all, except the
// front page of a news outlet, the one kind of page this work names.

import { BLOCK_MS } from './clock'
import { GROUPS, groupOf, OTHER } from './groups'
import { siteLink } from './links'
import { TEST_NAME, UID, type Test } from './ooni'
import { categoryOf, type Lists } from './testlists'

export const WEB_TEST = 'web_connectivity'
export const BLOCK_SECONDS = BLOCK_MS / 1000

export interface Deviation {
  /** whole seconds into its block, 0 to 299; OONI dates a test to the second */
  s: number
  /** two-letter country code */
  cc: string
  state: 'confirmed' | 'anomaly'
  /** OONI's name of the test: web_connectivity, signal, tor, ... */
  test: string
  /** the kind of page, an index into GROUPS; the last one for a test that asks for no page */
  group: number
  /** OONI's id of the test, for the link to its entry; empty when the row had none that looks right */
  uid: string
  /** the front page of the outlet when the page is a news outlet, else empty */
  site: string
}

/** The deviations of one block out of OONI's rows. `lists` are Citizen Lab's test lists, which say what kind of
 *  page a test asked for; without them every page falls into the last group. */
export function deviationsOf(tests: readonly Test[], block: number, lists: Lists): Deviation[] {
  const out: Deviation[] = []
  for (const t of tests) {
    if (t.state !== 'confirmed' && t.state !== 'anomaly') continue
    const s = Math.floor((t.at - block) / 1000)
    if (s < 0 || s >= BLOCK_SECONDS) continue
    const web = t.test === WEB_TEST
    const category = web ? categoryOf(t.url, t.cc, lists) : null
    out.push({
      s,
      cc: t.cc,
      state: t.state,
      test: t.test,
      group: web ? groupOf(category) : OTHER,
      uid: t.uid,
      site: web ? (siteLink(t.url, category) ?? '') : '',
    })
  }
  return out.sort((a, b) => a.s - b.s)
}

/** A recording of one block, as it is committed: version, the block's start, the day it was read, the names of
 *  the tests, and one short row per deviation — seconds, country, 1 for an anomaly or 2 for a blockpage, the
 *  test's index, the kind of page, OONI's id, and the outlet's front page where there is one. */
export interface Tape {
  v: 1
  from: string
  recorded: string
  tests: string[]
  rows: (number | string)[][]
}

export function encodeTape(block: number, deviations: readonly Deviation[], recorded: string): Tape {
  const tests: string[] = []
  const rows = deviations.map((d) => {
    let i = tests.indexOf(d.test)
    if (i < 0) i = tests.push(d.test) - 1
    const row: (number | string)[] = [d.s, d.cc, d.state === 'confirmed' ? 2 : 1, i, d.group, d.uid]
    if (d.site) row.push(d.site)
    return row
  })
  return { v: 1, from: new Date(block).toISOString().slice(0, 19) + 'Z', recorded, tests, rows }
}

/** A front page and nothing else: http or https, a host, the path "/", no credentials, query or fragment. */
function frontPage(value: unknown): string {
  if (typeof value !== 'string' || value === '') return ''
  try {
    const u = new URL(value)
    const plain = (u.protocol === 'https:' || u.protocol === 'http:') && u.pathname === '/' && !u.search && !u.hash && !u.username && !u.password
    return plain ? `${u.protocol}//${u.host}/` : ''
  } catch {
    return ''
  }
}

export interface Recording {
  /** the start of the block that was recorded */
  from: number
  /** the day it was read, as written in the file */
  recorded: string
  deviations: Deviation[]
}

/** A recording read back. The file is the house's own, and it is still read like a stranger's: a row that is not
 *  exactly what a row may be is dropped, and a file that is not a recording is none. */
export function decodeTape(json: unknown): Recording | null {
  const tape = json as Partial<Tape> | null
  if (!tape || tape.v !== 1 || typeof tape.from !== 'string' || typeof tape.recorded !== 'string') return null
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}Z$/.test(tape.from) || !/^\d{4}-\d{2}-\d{2}$/.test(tape.recorded)) return null
  const from = Date.parse(tape.from)
  if (!Number.isFinite(from) || from % BLOCK_MS !== 0) return null
  if (!Array.isArray(tape.tests) || !Array.isArray(tape.rows)) return null
  const tests = tape.tests.map((t) => (typeof t === 'string' && TEST_NAME.test(t) ? t : null))
  const deviations: Deviation[] = []
  for (const row of tape.rows) {
    if (!Array.isArray(row)) continue
    const [s, cc, state, test, group, uid, site] = row
    if (!Number.isInteger(s) || (s as number) < 0 || (s as number) >= BLOCK_SECONDS) continue
    if (typeof cc !== 'string' || !/^[A-Z]{2}$/.test(cc)) continue
    if (state !== 1 && state !== 2) continue
    const name = Number.isInteger(test) ? tests[test as number] : null
    if (!name) continue
    if (!Number.isInteger(group) || (group as number) < 0 || (group as number) >= GROUPS.length) continue
    deviations.push({
      s: s as number,
      cc,
      state: state === 2 ? 'confirmed' : 'anomaly',
      test: name,
      group: group as number,
      uid: typeof uid === 'string' && UID.test(uid) ? uid : '',
      site: frontPage(site),
    })
  }
  return { from, recorded: tape.recorded, deviations: deviations.sort((a, b) => a.s - b.s) }
}

/** The file a recording of the given hour of the day lives in. */
export const tapeFile = (hour: number): string => `/comma/tape/${String(((Math.floor(hour) % 24) + 24) % 24).padStart(2, '0')}.json`

/** The minute of each hour a recorded block begins at: ten past, clear of whatever runs on the hour. */
export const TAPE_MINUTE = 10
