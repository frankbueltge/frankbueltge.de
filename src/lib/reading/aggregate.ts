// src/lib/reading/aggregate.ts — the third reading of a round, derived from its committed record (2026-10-26).
//
// Everything the page says about "this audience" comes out of this one function over the committed
// file, so every number can be recomputed from the repository. Below READING_FLOOR readings the page
// shows the counts and the intervals but words no comparison: an interval that wide says "not yet",
// and the page says it in those words.
import type { AttentionReading } from './attention'
import { signalsById } from './attention'
import { summarize, type EstimateSummary } from './estimate'
import { addTally, louderTally, quietTally, type Tally } from './position'
import { rankMatters, spearman, type RankRow } from './rank'
import { choicesOf, ties, undecided } from './reading'
import type { RecordFile } from './record'
import type { Round } from './round'

/** Readings before the page words a comparison. A rule, not a test of significance: the intervals
 *  carry the uncertainty; this only keeps a sentence from outrunning them. */
export const READING_FLOOR = 30

export interface AudienceReading {
  readings: number
  /** readings whose reader had opened the three readings before sending */
  primed: number
  choices: number
  ties: number
  undecided: number
  rank: RankRow[]
  louder: Tally
  quiet: Tally
  estimates: EstimateSummary[]
  /** rank correlation between the audience's scores and the web's signal counts; null below three matters */
  loudnessCorrelation: number | null
  /** true once READING_FLOOR readings stand */
  speaks: boolean
}

export function readAudience(round: Round, record: RecordFile | null, attention: AttentionReading): AudienceReading {
  const entries = record?.round === round.id ? record.entries : []
  const ids = round.matters.map((m) => m.id)
  const signals = signalsById(attention)
  const perReading = entries.map((e) => choicesOf(e.votes))
  const rank = rankMatters(ids, perReading)
  let louder: Tally = { of: 0, went: 0 }
  let quiet: Tally = { of: 0, went: 0 }
  for (const e of entries) {
    louder = addTally(louder, louderTally(e.votes, signals))
    quiet = addTally(quiet, quietTally(e.votes, round))
  }
  const estimates = round.estimates.map((item) =>
    summarize(
      item,
      entries.flatMap((e) => e.estimates.filter(([id]) => id === item.id).map(([, value]) => value)),
    ),
  )
  const scoreOf = new Map(rank.map((r) => [r.id, r.score]))
  return {
    readings: entries.length,
    primed: entries.filter((e) => e.primed).length,
    choices: perReading.reduce((n, c) => n + c.length, 0),
    ties: entries.reduce((n, e) => n + ties(e.votes), 0),
    undecided: entries.reduce((n, e) => n + undecided(e.votes), 0),
    rank,
    louder,
    quiet,
    estimates,
    loudnessCorrelation: entries.length ? spearman(ids.map((id) => scoreOf.get(id)!), ids.map((id) => signals[id] ?? 0)) : null,
    speaks: entries.length >= READING_FLOOR,
  }
}
