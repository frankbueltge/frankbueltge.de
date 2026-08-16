// The guard for the standing privacy rule (Frank, 2026-08-15, wording private): verbatim
// quotation from Frank's own messages never appears in repo contents. Decisions are recorded
// as dated, neutral paraphrase instead.
//
// Why a guard and not a habit: the rule was enforced by hand three times on 2026-08-15 and
// three times it missed lines. The first pass that ran a detector instead of an eye found
// seventy-five. A rule whose enforcement depends on whoever happens to open the file is not
// enforced, it is hoped for.
//
// ONE STANDING EXCEPTION, decided 2026-08-16 so that no further session has to ask.
//
// The practices' REQUESTS.md and REQUESTS-ARCHIVE.md carry Frank's seeds and steers as
// verbatim blockquotes — roughly 34 passages across the house. Those are NOT quotations of
// his messages; they ARE his messages. The channel he speaks to the practices through happens
// to be a document in a repository, and the practices must be able to read what they were
// actually asked, not a session's paraphrase of it.
//
// The rule exists because sessions were reproducing his working messages inside their own
// reports and journals. It was never a bar on him publishing his own words. So: this guard
// does not scan the channel documents as an offence, and a session that meets one leaves it
// alone. If that is ever to change, it is a decision about what the channel IS, not a
// redaction task.
//
// This module only DETECTS. What it detects is deliberately mechanical — quotation marks in
// speech-attribution range of the name — so it cannot be argued with. Legitimate quotations
// (a work's title, a constitution's own words, a UI label) are cleared one by one in
// private-quote-allowlist.json, where each exception carries a reason someone can read.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Roots that are part of the published record. */
export const SCANNED_ROOTS = ['docs', 'src', 'scripts', '.github']

const SCANNED_EXTENSIONS = ['.md', '.ts', '.tsx', '.astro', '.py', '.yml', '.yaml']
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.astro', '__pycache__', 'archive'])

/**
 * The guard's own files. Its test states the rule in examples, which necessarily look like
 * the thing being forbidden; a detector that reports its own fixtures reports noise.
 */
const SKIPPED_FILES = new Set([
  join('src', 'lib', 'record', 'private-quotes.test.ts'),
  join('src', 'lib', 'record', 'private-quotes.ts'),
])

/**
 * A quoted span of at least six characters — long enough to be a sentence fragment rather
 * than a term. Three forms are in use in this repo: German „…", ASCII "…", and the
 * guillemets «…» (the last one found on 2026-08-15 by a pass that was reading the files
 * anyway, after this detector had walked straight past it).
 */
const QUOTE = /(?:„[^"„“]{6,}?["“]|"[^"]{6,}?"|«[^»]{6,}?»|“[^”]{6,}?”)/g

/**
 * The attribution token. `Frank Bültge` is excluded on purpose: the full name is authorship
 * and branding (page titles, footers, licence lines), never the introduction of speech.
 */
const ATTRIBUTION = /Frank(?!\s+Bültge)/g

/** How far after the name a quotation still reads as attributed to it. */
const ATTRIBUTION_RANGE = 120

// KNOWN GAP, stated rather than papered over (2026-08-15). The parenthetical form
// ("…", Frank, morning session) puts the name AFTER the quotation, and this detector does not
// see it — one line escaped exactly there and was caught by hand.
//
// It was tried and reverted the same hour. Reading backwards from a quotation is
// indistinguishable, syntactically, from the far commoner habit of naming a label and
// attributing the naming: "Experiments" (Frank, 2026-07-31). The attempt produced
// twenty-five findings, of which about one was speech. Every discriminator tried — word
// count, capitalisation, sentence punctuation — either kept the noise or dropped the one
// true case with it ("wortlaute sind freigegeben" is three lowercase words, and so is half
// the noise).
//
// A guard that cries twenty-five times to be right once gets muted, and then it guards
// nothing. So this one covers the dominant form only, and the gap is written here so the
// next reader knows to check parentheticals by eye rather than assume they were checked.
//
// SECOND KNOWN GAP, same shape: this detector is LINE-LOCAL. A quotation on the line after
// the attribution is not seen, which in code comments is a common way to write one. Letting
// the window cross newlines was measured on this repo too: 124 further findings, the large
// majority of them work titles and section headings standing under an unrelated mention of
// the name. Also declined, also by hand instead — the pass of 2026-08-15 read those 124 and
// redacted the real ones.
//
// Both gaps have the same cause and the same lesson. Proximity to a name is evidence of
// attribution, not proof of it, and the further the detector reaches the more of the record
// it accuses. This guard is the cheap, reliable part of the rule; it does not replace
// reading, and it must not be mistaken for having done it.

export interface QuoteFinding {
  file: string
  line: number
  quote: string
  /** The text around the finding, for a failure message someone can act on. */
  context: string
}

function walk(dir: string, out: string[] = []): string[] {
  let entries: string[]
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const entry of entries) {
    if (SKIPPED_DIRECTORIES.has(entry)) continue
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) walk(path, out)
    else if (SCANNED_EXTENSIONS.some((ext) => entry.endsWith(ext))) out.push(path)
  }
  return out
}

export function scanFile(file: string, text: string): QuoteFinding[] {
  const findings: QuoteFinding[] = []
  if (!text.includes('Frank')) return findings

  text.split('\n').forEach((line, index) => {
    const attributions = [...line.matchAll(ATTRIBUTION)].map((m) => m.index ?? 0)
    if (attributions.length === 0) return

    for (const match of line.matchAll(QUOTE)) {
      const start = match.index ?? 0
      // An HTML/JSX attribute value is markup, not speech: title="… | Frank Bültge".
      if (start > 0 && line[start - 1] === '=') continue

      const nearest = attributions.filter((a) => a < start).pop()
      if (nearest === undefined) continue
      if (start - nearest > ATTRIBUTION_RANGE) continue

      findings.push({
        file,
        line: index + 1,
        quote: match[0],
        context: line.slice(Math.max(0, nearest - 30), start + match[0].length + 40).trim(),
      })
    }
  })

  return findings
}

export function scanRecord(roots: string[] = SCANNED_ROOTS): QuoteFinding[] {
  return roots
    .flatMap((root) => walk(root))
    .filter((file) => !SKIPPED_FILES.has(file))
    .flatMap((file) => scanFile(file, readFileSync(file, 'utf8')))
}
