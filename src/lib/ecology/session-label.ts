// src/lib/ecology/session-label.ts — what a session's own note says it was (2026-10-17).
//
// WHY THIS EXISTS. Until this day the house counted a practice's sessions per cycle by the
// calendar: a session belonged to the cycle whose days it fell in. The calendar cannot tell the
// sessions of a cycle from the sessions of the convening that follows it, nor the sessions of two
// cycles that turned on one day: cycle 007's days (2026-10-10 to 2026-10-14) held nine sessions of
// the Field, and the Field's own notes call three of them sessions of cycle 007 (s193–s195) and
// the other six sessions of the convening after cycles 006 and 007. /ecology printed 9 · 9 · 9.
//
// Every practice writes the label itself. The Atelier and the Studio put it in the note's heading
// ("The Hinge (cycle 007, session 1)", "Underneath (the convening after cycle 007, session 1)");
// all three record, at the session's open, the state of `cycle.json` they read ("`cycle.json`
// (cycle 7, working)", "`cycle.json`: cycle 7, phase convening"). This module reads those labels
// and nothing else: it never infers a cycle the note does not name, and where a note names none
// the caller falls back to the calendar, as before.
//
// It also reads the two other things a note says about itself that the score needs: the number
// the practice gives the session (so a day of several sessions stands in their own order, not in
// the order of their file names), and the paths of the pieces the note names (so a piece can be
// tied to the session that made it). Pure: strings in, values out.

/** A session's place in the house clock, as its own note states it. */
export interface SessionCycleLabel {
  /** the cycle the note names — for a convening session, the cycle the convening follows; null
   *  only for a convening session whose note names no number at all */
  cycle: number | null
  /** a session of the convening after `cycle`, not a session of the cycle itself */
  convening: boolean
  /** where the note carries the label: its heading, its read of `cycle.json`, or its opening */
  from: 'heading' | 'cycle.json' | 'body'
}

const CONVENING_AFTER = /\bconvening\s+after\s+cycle\s+0*(\d+)\b/i
const CYCLE_IN_HEADING = /\bcycle\s+0*(\d+)\b/i
const CONVENING_WORD = /\bconvening\b/i

/** The read of `cycle.json` a note records at its open, in the shapes the three practices write
 *  it: "`cycle.json` (cycle 7, working", "`cycle.json`: cycle **3**, `working`", "`cycle.json`
 *  still reads cycle 3", "`cycle.json` turned to cycle 002 today". The number must follow the
 *  file's name directly — a later "cycle 005" in the same sentence is usually a sibling's. */
const READ = /`cycle\.json`\s*(?:live|(?:still\s+)?reads|turned\s+to)?\s*[:(]?\s*\**\s*cycle\s+\**\s*0*(\d+)\b/i
/** The Field's short form of the same read, from 2026-10-07: "`cycle.json` (6, working)". */
const READ_SHORT = /`cycle\.json`\s*\(\s*(\d+)\s*,\s*(working|convening|closing|presenting)\b/i
const PHASE = /\b(working|convening|closing|presenting)\b/i
/** "source *convening*" names where a question came from, not the phase the house is in. */
const SOURCE_WORD = /\bsource\s+[`*"_]*\w+[`*"_]*/gi
/** The opening's own label where the note writes one: "Cycle 003, session 2", "Cycle 6 working". */
const BODY = /\bCycle\s+0*(\d+)\b/
const OPENING = 1500

/** The phase a read names: the first phase word after the number, up to the read's end. */
function readPhase(tail: string): string | null {
  const end = tail.search(/\)|;|\.\s/)
  const clause = (end >= 0 ? tail.slice(0, end) : tail.slice(0, 120)).replace(SOURCE_WORD, ' ')
  return PHASE.exec(clause)?.[1]?.toLowerCase() ?? null
}

function fromRead(text: string): { cycle: number; convening: boolean } | null {
  const short = READ_SHORT.exec(text)
  const long = READ.exec(text)
  // whichever read stands first in the note is the one taken at its open
  if (short && (!long || short.index <= long.index)) {
    return { cycle: Number(short[1]), convening: short[2]!.toLowerCase() === 'convening' }
  }
  if (!long) return null
  const phase = readPhase(text.slice(long.index + long[0].length))
  return { cycle: Number(long[1]), convening: phase === 'convening' }
}

/**
 * The cycle a session's note says it belongs to, or null where the note says nothing.
 *
 * In this order, because the practice's own name for the session outranks the state of a file
 * it read: the heading's "convening after cycle N"; the heading's "cycle N" (the Field's s141 is
 * headed "first working session of cycle 001" while the file it read still said cycle 0); a
 * heading that says only "convening" takes its number from the read; then the read of
 * `cycle.json`; then a "Cycle N" in the note's opening lines.
 */
export function sessionCycleLabel(heading: string, text: string): SessionCycleLabel | null {
  const after = CONVENING_AFTER.exec(heading)
  if (after) return { cycle: Number(after[1]), convening: true, from: 'heading' }
  const named = CYCLE_IN_HEADING.exec(heading)
  if (named) return { cycle: Number(named[1]), convening: false, from: 'heading' }
  const read = fromRead(text)
  if (CONVENING_WORD.test(heading)) return { cycle: read?.cycle ?? null, convening: true, from: 'heading' }
  if (read) return { ...read, from: 'cycle.json' }
  const body = BODY.exec(text.slice(0, OPENING))
  return body ? { cycle: Number(body[1]), convening: false, from: 'body' } : null
}

const ORDINAL_WORDS: Record<string, number> = {
  first: 1, second: 2, third: 3, fourth: 4, fifth: 5, sixth: 6, seventh: 7, eighth: 8, ninth: 9, tenth: 10,
}

/**
 * The number a practice gives a session in its heading: the Field's and the Studio's running
 * count ("Session 204 — …", "2026-09-18 — session 163: …"), the Atelier's count within a cycle
 * ("cycle 008, session 4: …", "convening after cycle 006, first session"), or the Atelier's count
 * of a day's notes ("2026-10-08 (3) — …"). The first the heading carries; null where it carries
 * none. Used to stand a day's sessions in their own order, never as an identity.
 */
export function sessionNumber(heading: string): number | null {
  const n = /\bsession\s+(\d+)\b/i.exec(heading)
  if (n) return Number(n[1])
  const word = /\b(first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)\s+(?:working\s+)?session\b/i.exec(heading)
  if (word) return ORDINAL_WORDS[word[1]!.toLowerCase()]!
  const day = /^\d{4}-\d{2}-\d{2}\s*\((\d+)\)/.exec(heading.trim())
  return day ? Number(day[1]) : null
}

/** The paths of pieces a note names, as the practice's own repository spells them: an artifact
 *  (`artifacts/2026-10-16-the-clock-and-the-record`, `artifacts/cycle-003/2026-09-08-…`), a
 *  window (`window/cycle-008-session-3`), a work (`works/2026-10-16-filed-under`). Without a
 *  trailing slash, each once, in the order the note names them. */
export function namedPieces(text: string): string[] {
  const out = new Set<string>()
  const re = /\b(artifacts\/(?:cycle-\d+\/)?\d{4}-\d{2}-\d{2}-[a-z0-9-]*[a-z0-9]|window\/cycle-\d+(?:-[a-z0-9]+)*|works\/\d{4}-\d{2}-\d{2}-[a-z0-9-]*[a-z0-9])(?![a-z0-9-])/g
  for (const m of text.matchAll(re)) out.add(m[1]!)
  return [...out]
}

/** A site address's path in the practice's own repository, where it is one a note can name:
 *  `/field/artifacts/X/` is `artifacts/X`, `/atelier/window/X/` is `window/X`, a work's stage
 *  `/studio/werke-html/X/` is `works/X`. Null for anything else. */
export function repoPathOf(href: string): string | null {
  const m = /^\/(?:field|atelier|studio)\/(artifacts|window|werke-html)\/(.+?)\/?$/.exec(href)
  if (!m) return null
  return `${m[1] === 'werke-html' ? 'works' : m[1]}/${m[2]}`
}
