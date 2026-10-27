// src/lib/reading/rounds.ts — the committed rounds, imported by name (2026-10-26).
//
// A static import list rather than import.meta.glob, because the same list serves the Astro pages AND
// the Pages Functions, whose bundler knows no glob. A new round is one import line here;
// rounds.test.ts fails while a file in src/data/reading/rounds/ is missing from the list.
import type { Round } from './round'
import { currentRound, validRounds } from './round'
import afterCycle010 from '../../data/reading/rounds/after-cycle-010.json'

export const ROUNDS: readonly Round[] = validRounds([afterCycle010 as Round])

/** The round a visitor takes part in now. */
export const CURRENT_ROUND: Round = currentRound(ROUNDS)

export const roundById = (id: string): Round | undefined => ROUNDS.find((r) => r.id === id)
