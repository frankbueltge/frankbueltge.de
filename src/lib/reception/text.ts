// src/lib/reception/text.ts — the mechanical check of a rating before anything else looks at it.
//
// Pure and fail-closed: anything that is not exactly what the form sends is refused with a public
// reason code. Nothing here judges content; that is the gate's (./gate.ts), and only for visitors.

import { isWorkId } from './ids'

/** A visitor's note, in characters (code points). */
export const MAX_NOTE = 600
/** The architect's notes may run longer: they are not gated, and they are quoted verbatim. */
export const MAX_OWNER_NOTE = 4000
export const MAX_NAME = 60

export type TextReason = 'unknown-work' | 'score' | 'text' | 'text-too-long' | 'name' | 'name-too-long' | 'consent'

export interface RatingInput {
  work: string
  score: 1 | 2 | 3 | 4 | 5
  /** null for a rating without a note */
  text: string | null
  /** null when no name was given, and always null for the architect (his label is fixed) */
  name: string | null
}

// Control characters other than the newline, and the invisible characters a text can use to hide
// or reorder what a reader sees (zero-width joiners, bidirectional overrides, the byte-order mark).
const CONTROL = /[\u0000-\u0009\u000B-\u001F\u007F-\u009F]/g
const INVISIBLE = /[​-‏‪-‮⁠-⁤⁦-⁩﻿]/g

const length = (s: string): number => [...s].length

/** A note as it will be stored: NFC, no control or invisible characters, no trailing blanks, at most
 *  one empty line in a row. An empty result is no note. */
export function cleanNote(raw: string): string {
  return raw
    .normalize('NFC')
    .replace(/\r\n?/g, '\n')
    .replace(/\t/g, ' ')
    .replace(CONTROL, '')
    .replace(INVISIBLE, '')
    .split('\n')
    .map((line) => line.replace(/\s+$/u, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
}

/** A name as it will be stored: one line, single spaces. */
export function cleanName(raw: string): string {
  return raw.normalize('NFC').replace(CONTROL, ' ').replace(INVISIBLE, '').replace(/\s+/gu, ' ').trim()
}

/**
 * Checks a submission. `owner` says whether it carries the architect's valid cookie: his notes may be
 * longer, need no consent box (he is the rightsholder) and carry no name of their own.
 */
export function validateRating(
  body: Record<string, unknown>,
  { owner }: { owner: boolean },
): { ok: true; value: RatingInput } | { ok: false; reason: TextReason } {
  if (!isWorkId(body.work)) return { ok: false, reason: 'unknown-work' }
  const score = body.score
  if (typeof score !== 'number' || !Number.isInteger(score) || score < 1 || score > 5) return { ok: false, reason: 'score' }

  let text: string | null = null
  if (body.text !== undefined && body.text !== null && body.text !== '') {
    if (typeof body.text !== 'string') return { ok: false, reason: 'text' }
    if (body.text.length > (owner ? MAX_OWNER_NOTE : MAX_NOTE) * 4) return { ok: false, reason: 'text-too-long' }
    const cleaned = cleanNote(body.text)
    if (length(cleaned) > (owner ? MAX_OWNER_NOTE : MAX_NOTE)) return { ok: false, reason: 'text-too-long' }
    text = cleaned || null
  }

  let name: string | null = null
  if (!owner && body.name !== undefined && body.name !== null && body.name !== '') {
    if (typeof body.name !== 'string') return { ok: false, reason: 'name' }
    if (body.name.length > MAX_NAME * 4) return { ok: false, reason: 'name-too-long' }
    const cleaned = cleanName(body.name)
    if (length(cleaned) > MAX_NAME) return { ok: false, reason: 'name-too-long' }
    name = cleaned || null
  }
  // A name only travels with a note: on a bare rating there is nothing for it to sign.
  if (text === null) name = null

  // A visitor's note is published under CC BY-NC-SA 4.0, the licence of the seed channel. The server
  // does not rely on the box being ticked in the browser.
  if (!owner && text !== null && body.consent !== true) return { ok: false, reason: 'consent' }

  return { ok: true, value: { work: body.work, score: score as RatingInput['score'], text, name } }
}
