// src/lib/reading/reading.ts — one visitor's reading, as it travels and as it is kept (2026-10-26).
//
// The same shape goes from the page to the endpoint, into D1, out through the public record and into
// the committed snapshot, so nothing is translated on the way:
//
//   votes:     [left, right, pick, ms]   pick 0 = left, 1 = right, 2 = "equally urgent", null = "can't say"
//   estimates: [item, value, ms]         value null = "I don't know"
//   primed:    whether the reader opened the page's three readings before sending — the web's counts
//              could have shaped the choices, so the open data says which readings saw them first
//
// `ms` is how long the choice or the answer took, kept so a reader of the open data can see a reading
// that was clicked through without reading. Nothing else is kept: no time of day, no address, no
// identifier (duty 3 of .claude/rules/runtime-and-works.md).
import type { Choice } from './rank'
import { ESTIMATE_RANGE, type Round } from './round'
import { pairKey } from './draw'

export type Pick = 0 | 1 | 2 | null
export type VoteTuple = [string, string, Pick, number]
export type EstimateTuple = [string, number | null, number]

export interface Reading {
  round: string
  consent: string
  primed: boolean
  votes: VoteTuple[]
  estimates: EstimateTuple[]
}

/** A reading as the store keeps it: a random id, and the UTC day it was given on. */
export interface StoredReading {
  id: string
  day: string
  consent: string
  primed: boolean
  votes: VoteTuple[]
  estimates: EstimateTuple[]
}

/** A reading as the public record releases it: no day, only the batch it was released in
 *  (src/lib/reading/record.ts). */
export interface PublicReading {
  id: string
  batch: number
  consent: string
  primed: boolean
  votes: VoteTuple[]
  estimates: EstimateTuple[]
}

/** The longest a single choice or answer may take before the reading is refused as malformed. */
export const MAX_MS = 30 * 60 * 1000

const isMs = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_MS

export type ReadingCheck = { ok: true; value: Reading } | { ok: false; reason: 'round' | 'consent' | 'primed' | 'votes' | 'estimates' }

/** The mechanical check of a submitted reading against its round. Refuses, never repairs. */
export function validateReading(body: Record<string, unknown>, round: Round): ReadingCheck {
  if (body.round !== round.id) return { ok: false, reason: 'round' }
  if (body.consent !== round.consent_version) return { ok: false, reason: 'consent' }
  if (typeof body.primed !== 'boolean') return { ok: false, reason: 'primed' }

  const ids = new Set(round.matters.map((m) => m.id))
  const votes = body.votes
  if (!Array.isArray(votes) || votes.length !== round.pairs_per_reading) return { ok: false, reason: 'votes' }
  const seen = new Set<string>()
  for (const v of votes) {
    if (!Array.isArray(v) || v.length !== 4) return { ok: false, reason: 'votes' }
    const [a, b, pick, ms] = v as unknown[]
    if (typeof a !== 'string' || typeof b !== 'string' || !ids.has(a) || !ids.has(b) || a === b) return { ok: false, reason: 'votes' }
    if (!(pick === 0 || pick === 1 || pick === 2 || pick === null) || !isMs(ms)) return { ok: false, reason: 'votes' }
    const key = pairKey(a, b)
    if (seen.has(key)) return { ok: false, reason: 'votes' }
    seen.add(key)
  }

  const items = new Map(round.estimates.map((e) => [e.id, e]))
  const estimates = body.estimates
  if (!Array.isArray(estimates) || estimates.length !== round.estimates_per_reading) return { ok: false, reason: 'estimates' }
  const asked = new Set<string>()
  for (const e of estimates) {
    if (!Array.isArray(e) || e.length !== 3) return { ok: false, reason: 'estimates' }
    const [id, value, ms] = e as unknown[]
    const item = typeof id === 'string' ? items.get(id) : undefined
    if (!item || asked.has(item.id) || !isMs(ms)) return { ok: false, reason: 'estimates' }
    asked.add(item.id)
    if (value !== null) {
      const range = ESTIMATE_RANGE[item.kind]
      if (typeof value !== 'number' || !Number.isFinite(value) || value < range.min || value > range.max) return { ok: false, reason: 'estimates' }
    }
  }

  return {
    ok: true,
    value: {
      round: round.id,
      consent: round.consent_version,
      primed: body.primed,
      votes: votes as VoteTuple[],
      estimates: estimates as EstimateTuple[],
    },
  }
}

/** The judged choices of a reading, for the ranking: a winner, or a tie when both were equally urgent. */
export function choicesOf(votes: readonly VoteTuple[]): Choice[] {
  const out: Choice[] = []
  for (const [a, b, pick] of votes) {
    if (pick === 0) out.push({ winner: a, loser: b })
    else if (pick === 1) out.push({ winner: b, loser: a })
    else if (pick === 2) out.push({ winner: a, loser: b, tie: true })
  }
  return out
}

/** How many choices of a reading were "can't say" — left out of the ranking, counted beside it. */
export const undecided = (votes: readonly VoteTuple[]): number => votes.filter((v) => v[2] === null).length

/** How many choices of a reading were "equally urgent". */
export const ties = (votes: readonly VoteTuple[]): number => votes.filter((v) => v[2] === 2).length
