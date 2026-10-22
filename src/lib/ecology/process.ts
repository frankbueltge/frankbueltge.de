// The process of a work: every state a session left it in (Frank's decision of 2026-10-22,
// wording private, paraphrased: a work should be shown as it grew, session by session, and not
// only as it stands now).
//
// From cycle 010 the three practices' constitutions (amendment of 2026-10-22, point 5) have every
// session that changes a work add one entry to PROCESS.json in the work's folder, with a
// screenshot at process/<n>.png. The site reads that file from the mirror and shows the states
// beside the work. Nothing here is typed by the house: a work without the file has no process to
// show, and an entry the file gets wrong is left out rather than mended.
import fs from 'node:fs'
import path from 'node:path'

export const PROCESS_FILE = 'PROCESS.json'

export interface ProcessState {
  /** the state's number, from 1, in the order the sessions left it */
  n: number
  /** YYYY-MM-DD */
  date: string
  /** the session as the practice's journal names it */
  session: string
  /** one sentence: what a visitor meets now that they did not before */
  changed: string
  /** the screenshot, relative to the work's folder (`process/1.png`), or null without one */
  shot: string | null
}

const DAY = /^\d{4}-\d{2}-\d{2}$/
/** a screenshot stays inside the work's own process/ folder */
const SHOT = /^process\/[A-Za-z0-9._-]+\.(png|jpg|jpeg|webp)$/

const text = (value: unknown): string | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return String(value)
  if (typeof value !== 'string') return null
  const trimmed = value.replace(/\s+/g, ' ').trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * The states a PROCESS.json declares, in order. An entry without a whole positive number, a date,
 * a session or a sentence is left out, as is a second entry under a number already taken (the
 * first stands: entries are never rewritten). A screenshot path that leaves process/ is dropped
 * and the state kept.
 */
export function parseProcess(raw: unknown): ProcessState[] {
  if (!raw || typeof raw !== 'object') return []
  const states = (raw as { states?: unknown }).states
  if (!Array.isArray(states)) return []
  const seen = new Set<number>()
  const out: ProcessState[] = []
  for (const entry of states) {
    if (!entry || typeof entry !== 'object') continue
    const e = entry as Record<string, unknown>
    const n = e.n
    const date = text(e.date)
    const session = text(e.session)
    const changed = text(e.changed)
    if (typeof n !== 'number' || !Number.isInteger(n) || n < 1 || seen.has(n)) continue
    if (!date || !DAY.test(date) || !session || !changed) continue
    seen.add(n)
    const shot = typeof e.shot === 'string' && SHOT.test(e.shot) ? e.shot : null
    out.push({ n, date, session, changed, shot })
  }
  return out.sort((a, b) => a.n - b.n)
}

/**
 * The process of the work served at `href` (`/studio/werke-html/<slug>/`), read from the mirror
 * under public/. Each screenshot is turned into its address on the site, and kept only where the
 * file is there: a state never points at a picture the site cannot serve.
 */
export function loadProcess(href: string, root: string = process.cwd()): ProcessState[] {
  if (!href.startsWith('/') || !href.endsWith('/') || href.includes('..')) return []
  const folder = path.join(root, 'public', href)
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(path.join(folder, PROCESS_FILE), 'utf8'))
  } catch {
    return []
  }
  return parseProcess(raw).map((s) => ({
    ...s,
    shot: s.shot && fs.existsSync(path.join(folder, s.shot)) ? `${href}${s.shot}` : null,
  }))
}
