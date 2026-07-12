// src/lib/studio/chronicle.ts
// The chronicle is the studio project's structured "story so far": one entry per session,
// plain-language summary, machine-readable. It is a PRESENTATION layer over the journal
// (which stays the authentic record) and a public feed at /studio/chronicle.json.
// Mirrors src/lib/field/chronicle.ts exactly (identical entry schema and merge rule) — the
// studio is the fourth instance of the same engine pattern (ns='studio').
//
// Two sources, one merge rule:
//   chronicle.curated.json  — hand-authored in this repo from the real journals (seq 1..N).
//     Authoritative for everything it covers; NEVER overwritten by sync. Starts EMPTY for
//     studio — it self-reports from session 1, so seq numbering derives cleanly from
//     upstream alone until a curated spine is ever hand-authored.
//   chronicle.upstream.json — self-report by the studio collective, synced nightly by
//     studio-integrate.yml from the engine repo (advisory; validated here so a malformed
//     upstream file fails the integrate gate instead of shipping silently).
import { z } from 'zod'
import curatedRaw from '@/data/studio/chronicle.curated.json'
import upstreamRaw from '@/data/studio/chronicle.upstream.json'

export const MOVES = ['build', 'gauntlet', 'verify', 'consolidation', 'steer', 'ship', 'other'] as const
export const VERDICTS = ['pass', 'fail', 'conditions', 'graduated', 'discarded', 'deferred'] as const
export type Move = (typeof MOVES)[number]
export type Verdict = (typeof VERDICTS)[number]

export const chronicleEntrySchema = z.object({
  /** the chronicle's own monotonic ordinal — NOT the journal's drifting session numbers */
  seq: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  /** the number the journal prose uses; null for the pre-constitution day-one sessions */
  collective_session: z.number().int().positive().nullable(),
  move: z.enum(MOVES),
  /** 1–2 plain-language sentences — the entire point of this file */
  summary: z.string().min(20),
  /** work slugs touched/shipped this session (folder names under werke/) */
  works: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  verdict: z.enum(VERDICTS).nullable(),
  /** explicit flag so the timeline can mark blocking failures without string-matching */
  fail: z.boolean(),
  /** which synced journal file carries this session's full entry */
  journal_id: z.string(),
  /** DOM id of the session's <details> on /studio (see uniqueSessionAnchor) */
  anchor: z.string(),
  source: z.enum(['curated', 'upstream']),
})
export type ChronicleEntry = z.infer<typeof chronicleEntrySchema>

/** The engine's self-report shape (see the chronicle contract in the engine repo's
 *  SITE-API.md): minimal on purpose — the site derives seq/anchor/journal_id/fail. */
export const upstreamEntrySchema = z.object({
  collective_session: z.number().int().positive(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  move: z.enum(MOVES),
  summary: z.string().min(20),
  works: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
  verdict: z.enum(VERDICTS).nullable().default(null),
})
export type UpstreamEntry = z.infer<typeof upstreamEntrySchema>

/**
 * Merge rule: curated is the spine and is never overwritten. An upstream self-report is
 * appended only when no existing entry already covers the same (collective_session, date)
 * — the engine's own numbering can drift (the sibling field-research collective hit this: two
 * days both claiming session 24), so the pair, not the number alone, identifies a session.
 * Anchors mirror the site's uniqueSessionAnchor: first claimant keeps `cs-N`, later ones get
 * a day suffix. Works with an EMPTY curated array: seq then derives cleanly from upstream
 * order alone (date, then collective_session).
 */
export function mergeChronicle(
  curated: ChronicleEntry[],
  upstream: UpstreamEntry[],
): ChronicleEntry[] {
  const merged = [...curated].sort((a, b) => a.seq - b.seq)
  const covered = new Set(merged.map((e) => `${e.collective_session}|${e.date}`))
  const anchors = new Set(merged.map((e) => e.anchor))
  let seq = merged.length ? merged[merged.length - 1].seq : 0

  const sorted = [...upstream].sort(
    (a, b) => a.date.localeCompare(b.date) || a.collective_session - b.collective_session,
  )
  for (const u of sorted) {
    if (covered.has(`${u.collective_session}|${u.date}`)) continue
    let anchor = `cs-${u.collective_session}`
    if (anchors.has(anchor)) anchor = `${anchor}-${u.date}`
    let n = 2
    while (anchors.has(anchor)) anchor = `cs-${u.collective_session}-${u.date}-${n++}`
    anchors.add(anchor)
    covered.add(`${u.collective_session}|${u.date}`)
    merged.push({
      seq: ++seq,
      date: u.date,
      collective_session: u.collective_session,
      move: u.move,
      summary: u.summary,
      works: u.works,
      verdict: u.verdict,
      fail: u.verdict === 'fail',
      journal_id: `journal/${u.date}.md`,
      anchor,
      source: 'upstream',
    })
  }
  return merged
}

/** Validated, merged chronicle — build fails loudly on malformed data (the integrate gate). */
export function loadChronicle(): ChronicleEntry[] {
  const curated = z.array(chronicleEntrySchema).parse(curatedRaw)
  const upstream = z.array(upstreamEntrySchema).parse(upstreamRaw)
  return mergeChronicle(curated, upstream)
}

export interface ChronicleStats {
  sessions: number
  works: number
  ships: number
  fails: number
  firstDate: string
  lastDate: string
}

export function chronicleStats(entries: ChronicleEntry[], workCount: number): ChronicleStats {
  const dates = entries.map((e) => e.date).sort()
  return {
    sessions: entries.length,
    works: workCount,
    ships: entries.filter((e) => e.move === 'ship' || e.verdict === 'graduated').length,
    fails: entries.filter((e) => e.fail).length,
    firstDate: dates[0] ?? '',
    lastDate: dates[dates.length - 1] ?? '',
  }
}

/** All chronicle entries that touched a work, chronological — the last one is its latest state. */
export function entriesForWork(entries: ChronicleEntry[], slug: string): ChronicleEntry[] {
  return entries.filter((e) => e.works.includes(slug)).sort((a, b) => a.seq - b.seq)
}
