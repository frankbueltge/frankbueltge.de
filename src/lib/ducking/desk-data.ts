// src/lib/ducking/desk-data.ts — the desk read from the committed files, once per build (2026-11-01).
// Server only: it pulls in the whole ledger, which is why it is not part of mix.ts, which the island imports.
import { readAttention, type AttentionReading } from '@/lib/reading/attention'
import { getTrendingDays } from '@/lib/trending/data'
import { CURRENT_ROUND, type Round } from './round'
import { countLedger, spanOf, trailingShares, WINDOW_DAYS, type Ledger } from './mix'

/** How many counted signals the page shows for a channel. */
const RECEIPTS = 8
/** Enough digits for the quietest step a week can hold. */
const round6 = (n: number): number => Math.round(n * 1e6) / 1e6

export interface DeskRecord {
  round: Round
  ledger: Ledger
  /** day → share per channel, everything else last, rounded for the page */
  shares: number[][]
  /** day → all signals in the trailing window */
  totals: number[]
  /** the newest day */
  latest: string
  /** how many charts and platforms the ledger read on the newest day */
  sources: number
  week: { counts: number[]; total: number; named: number; share: number; silent: number }
  whole: { counts: number[]; total: number; named: number; share: number; silent: number }
  /** every counted signal, for the receipts */
  attention: AttentionReading
  receiptsShown: number
}

let cached: DeskRecord | null = null

function reading(span: { counts: number[]; total: number }) {
  const named = span.counts.reduce((a, b) => a + b, 0)
  return { ...span, named, share: span.total ? named / span.total : 0, silent: span.counts.filter((n) => n === 0).length }
}

export function readDesk(): DeskRecord {
  if (cached) return cached
  const round = CURRENT_ROUND
  const days = getTrendingDays()
  const ledger = countLedger(round.channels, days)
  const last = ledger.days.length - 1
  const newest = days[0]!
  cached = {
    round,
    ledger,
    shares: trailingShares(ledger).map((row) => row.map(round6)),
    totals: ledger.days.map((_, d) => spanOf(ledger, d, WINDOW_DAYS).total),
    latest: ledger.days[last]!,
    sources: newest.sources.length,
    week: reading(spanOf(ledger, last, WINDOW_DAYS)),
    whole: reading(spanOf(ledger, last, ledger.days.length)),
    attention: readAttention(
      { matters: round.channels, attention_window: { from: ledger.days[0]!, to: ledger.days[last]! } },
      days,
    ),
    receiptsShown: RECEIPTS,
  }
  return cached
}
