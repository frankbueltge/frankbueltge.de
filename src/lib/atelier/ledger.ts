// src/lib/atelier/ledger.ts — the closing ledger of a research line, read out of its own
// DECISION.md.
//
// Protocol v5's symmetry rule says "closing costs what continuing costs": when a line ends, the
// practice writes down what it spent getting there. That sentence is the only place the cost of a
// closed question is stated, and until now the site never showed it — the process figure drew WHERE
// a line ended and said nothing about what it cost to end it.
//
// This module reads that sentence and NOTHING ELSE. Everything it returns is verbatim from the
// committed record, with exactly one transformation, applied and documented here so nobody has to
// guess: the record's own HARD LINE WRAPS are unwrapped to single spaces (a DECISION.md wraps at
// ~92 columns; a gutter is not 92 columns wide). No paraphrase, no summary, no re-typed number, no
// "cleaned up" ellipsis. `unwrap` is the whole of it.
//
// Where a line's record carries no closing ledger, this module returns `null` and the figure says
// so in plain words. An invented zero would be a lie in the archive — and this practice's own rule
// is that a missing source is recorded, never silently bridged.
//
// COVERAGE, verified against the committed records on 2026-08-01 (12 lines):
//   · 11 of 12 lines have a DECISION.md at all (2026-07-24-put-back-on-the-map has none — it is
//     still ACTIVE);
//   · 7 of those 11 carry a closing ledger this module can read:
//     null-island, mach-ancestor, untested-second, vegetative-em, unmoved-ground,
//     retraction-signature (all as a "Standing" block, some with a budget sentence beside it) and
//     name-test (the older checklist template — see RESOURCE_BULLET below);
//   · 4 carry none: gate-rehearsal (an infrastructure fixture with no research claim),
//     negative-parallax and kartographie-statt-kopie (neither is closed by a kill or an archive —
//     one waits at the human gate, one went through it) and signature-in-the-world.
// Those numbers are asserted in ledger.test.ts against the real files, so a record that gains or
// loses a ledger changes a test rather than quietly changing the figure.

/** Which shape of the record a line's stated cost was read out of. The practice rewrote its own
 *  DECISION template mid-July; both shapes are in the committed archive, and both say the same
 *  thing, so both are read rather than one being declared "the" format. */
export type CostShape = 'budget-line' | 'resource-bullet'

export interface ClosingLedger {
  /** the line's project id (its directory name under src/content/atelier/projects/) */
  id: string
  /** repo-relative path of the DECISION.md this was read from — printed with the figure */
  source: string
  /** the record's own "Standing" paragraph, verbatim, its label stripped; null when there is none */
  standing: string | null
  /** the sentence in which the record states what the line cost, verbatim; null when it states none */
  cost: string | null
  /** where `cost` came from — null exactly when `cost` is null */
  costShape: CostShape | null
  /** ONE line for the figure's gutter: the cost sentence when the record states one, else the
   *  standing paragraph's own first sentence. Verbatim either way, never a summary of both. */
  gutter: string
  /** everything the record carries, for the detail panel and the table: the standing paragraph and
   *  the cost sentence, verbatim, joined by a space — and never the same sentence twice (the newer
   *  template writes the budget INSIDE the standing paragraph, the older one writes it above). */
  full: string
}

/** The one transformation this module applies, and the only one: the record's hard line wraps
 *  become single spaces. Everything else — every word, every number, every dash — is untouched. */
export function unwrap(text: string): string {
  return text.replace(/\s*\r?\n\s*/g, ' ').trim()
}

/** '/src/content/atelier/projects/2026-07-20-retraction-signature/DECISION.md'
 *  → '2026-07-20-retraction-signature' */
export function lineIdFromPath(path: string): string {
  return path.replace('/src/content/atelier/projects/', '').split('/')[0]
}

// `(?![\s\S])` rather than `$`: these carry the `m` flag for their `^`, which would make `$` mean
// "end of LINE" and cut every one of these blocks off at its first hard wrap.
const END_OF_BLOCK = String.raw`(?=\r?\n\s*\r?\n|(?![\s\S]))`
const STANDING_INLINE = new RegExp(String.raw`^\*\*Standing\.\*\*\s*([\s\S]*?)${END_OF_BLOCK}`, 'm')
const STANDING_SECTION = new RegExp(String.raw`^##\s+Standing\s*\r?\n+([\s\S]*?)${END_OF_BLOCK}`, 'm')

/** The newer DECISION template states the spend in a sentence of its own, wherever the reasoning
 *  puts it — inside the Standing block (null-island, retraction-signature) or up in the opening
 *  paragraph that counts the ticks (vegetative-em, untested-second, unmoved-ground). So the search
 *  is document-wide and stops at the first sentence end, rather than assuming a section. */
const BUDGET_LINE = /Budget closed[\s\S]*?\.(?=\s|$)/

/** The OLDER template (name-test, 2026-07-18) has no Standing block at all: it closes with a
 *  mandate checklist, and the line's cost is the answer to one of its questions. Refusing to read
 *  it would print "the record carries no closing ledger" over a record that plainly states one —
 *  the opposite of the honesty this module exists for. The question stem and its "Yes:" are
 *  dropped; what remains is the record's own words. */
const RESOURCE_BULLET = new RegExp(
  String.raw`^-\s+Is resource use within bounds\?[\s\S]*?(?=\r?\n-\s|\r?\n\s*\r?\n|(?![\s\S]))`,
  'm',
)
const RESOURCE_STEM = /^-\s+Is resource use within bounds\?\s*—\s*(?:Yes:\s*)?/

/** First sentence of an unwrapped paragraph — the gutter's fallback when a record states its
 *  standing but not its spend (mach-ancestor: closed by team direction, so there was nothing left
 *  to spend). Falls back to the whole paragraph when it holds no sentence break. */
export function firstSentence(text: string): string {
  const m = /^[\s\S]*?[.!?](?=\s|$)/.exec(text)
  return m ? m[0].trim() : text
}

/**
 * Reads one DECISION.md. Returns `null` when the record carries neither a Standing block nor a
 * statement of what the line cost — the honest gap the figure prints in words.
 *
 * `source` is the repo-relative path shown beside the figure; it is not read from, only carried.
 */
export function readClosingLedger(raw: string, id: string, source: string): ClosingLedger | null {
  const standingMatch = STANDING_INLINE.exec(raw) ?? STANDING_SECTION.exec(raw)
  const standing = standingMatch ? unwrap(standingMatch[1]) : null

  const budgetMatch = BUDGET_LINE.exec(raw)
  let cost: string | null = budgetMatch ? unwrap(budgetMatch[0]) : null
  let costShape: CostShape | null = cost ? 'budget-line' : null

  if (!cost) {
    const bulletMatch = RESOURCE_BULLET.exec(raw)
    if (bulletMatch) {
      cost = unwrap(bulletMatch[0].replace(RESOURCE_STEM, ''))
      costShape = 'resource-bullet'
    }
  }

  if (!standing && !cost) return null

  // The newer template writes the budget sentence INSIDE the standing paragraph; joining them
  // there would print it twice.
  const parts = [standing, cost && (!standing || !standing.includes(cost)) ? cost : null].filter(
    (p): p is string => Boolean(p),
  )

  return {
    id,
    source,
    standing,
    cost,
    costShape,
    gutter: cost ?? firstSentence(standing ?? ''),
    full: parts.join(' '),
  }
}

/**
 * Reads every DECISION.md a glob handed over, keyed by line id. `files` is exactly the shape
 * `import.meta.glob('/src/content/atelier/projects/*\/DECISION.md', { query: '?raw' })` returns —
 * absolute repo paths to raw file contents — so the component passes its glob straight in and this
 * module stays free of any build-tool import of its own (and therefore unit-testable with plain
 * fixtures, and with the real files read through `node:fs`).
 *
 * Lines whose record carries no ledger are ABSENT from the result, not present with an empty
 * value: "we looked and the record says nothing" and "the record says nothing was spent" are
 * different claims, and only the first one is true.
 */
export function readLedgerIndex(files: Record<string, string>): Record<string, ClosingLedger> {
  const out: Record<string, ClosingLedger> = {}
  for (const [path, raw] of Object.entries(files)) {
    const id = lineIdFromPath(path)
    const ledger = readClosingLedger(raw, id, path.replace(/^\//, ''))
    if (ledger) out[id] = ledger
  }
  return out
}
