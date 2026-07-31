// src/lib/post/incoming.ts
// The post office's INCOMING register — the counterpart the page was missing (Frank,
// 2026-07-31: "there is a lot going in and out, not only letters from the practices").
//
// The outgoing ledger already treats every delivery as a matter of record: who, to whom, what
// became of it, silence published as silence. Everything arriving got no such treatment, even
// though far more arrives than leaves: seeds, responses to works, reviews, corrections. It was
// readable only by knowing which of four surfaces to visit.
//
// This module invents no data. It DERIVES the register from what is already committed —
// src/data/saat/register.json and src/data/reception/register.json — so the overview can never
// drift from the surfaces holding the detail, and nothing here has to be maintained by hand.
// A row that appears here exists elsewhere in full; every row says where.
//
// What is deliberately NOT in here: the letters in the letterbox queue. They are mail, not
// publications — private until reviewed, and published only with the writer's explicit
// permission (src/lib/reception/register.ts). The page says that in words rather than showing
// a count nobody can check from the outside.
import registerJson from '@/data/saat/register.json'
import { loadReception } from '@/lib/reception/register'

/** What kind of thing arrived. The vocabulary of the doors, not of the storage. */
export type IncomingKind = 'seed' | 'reception'

export interface IncomingEntry {
  /** YYYY-MM-DD — the day it arrived, not the day it was answered */
  date: string
  kind: IncomingKind
  /** plain words for what came in, e.g. 'a question' — never the content itself */
  what: string
  /** the author's own mark, as it is already public on the detail surface */
  from: string
  /** what became of it, in the practices' own vocabulary (taken · adapted · declined …) */
  outcome: string
  /** where the full record lives */
  href: string
}

type SaatResponse = { practice: string; decision: string }
type SaatSeed = {
  kind: string
  author_mark?: string
  ts: string
  status: string
  responses?: SaatResponse[]
}

/** Seed kinds are German in the register (the intake form's own vocabulary); the site is
 * English-only since 2026-07-16, so they are named here rather than shown raw. */
const SEED_KIND: Record<string, string> = {
  quelle: 'a source',
  wort: 'a word',
  frage: 'a question',
  richtung: 'a direction',
}

/** A seed's outcome is what the practices decided, each in its own words — not a verdict this
 * module computes. Several practices may answer the same seed differently, and that
 * disagreement is the interesting part, so all of them are listed. */
function seedOutcome(seed: SaatSeed): string {
  const answers = seed.responses ?? []
  if (answers.length === 0) return 'waiting on the practices'
  return answers.map((r) => `${r.practice}: ${r.decision}`).join(' · ')
}

export function loadIncoming(): IncomingEntry[] {
  const seeds = (registerJson as { seeds?: SaatSeed[] }).seeds ?? []
  const out: IncomingEntry[] = seeds.map((s) => ({
    date: s.ts.slice(0, 10),
    kind: 'seed' as const,
    what: SEED_KIND[s.kind] ?? 'a seed',
    from: s.author_mark?.trim() || 'anonymous',
    outcome: seedOutcome(s),
    href: '/seed',
  }))

  for (const e of loadReception()) {
    out.push({
      date: e.date,
      kind: 'reception',
      // A visitor's response and a critic's piece arrive by different routes and are worth
      // distinguishing: one came through the letterbox, the other was commissioned.
      what: e.role === 'visitor' ? 'a response to a work' : 'a critique',
      from: e.author_mark,
      outcome: 'published in Reception',
      href: `/reception#${e.work.ns}-${e.work.slug}`,
    })
  }

  return out.sort((a, b) => b.date.localeCompare(a.date) || a.what.localeCompare(b.what))
}

/** Counts per kind, for the page's own summary line. Numbers are rendered from the data, never
 * written into prose — they age nightly (wording-kanon.md). */
export function countByKind(entries: IncomingEntry[]): Record<IncomingKind, number> {
  return entries.reduce(
    (acc, e) => ({ ...acc, [e.kind]: acc[e.kind] + 1 }),
    { seed: 0, reception: 0 } as Record<IncomingKind, number>,
  )
}
