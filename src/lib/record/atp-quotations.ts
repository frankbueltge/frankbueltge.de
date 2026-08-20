// The guard for the citation ceiling on borrowed material (Frank, 2026-08-16, DOWRY floor
// rule 2 as amended in the n-1 practice).
//
// On 2026-08-16 the n-1 practice was given read access to a private repository holding the
// founder's copy of a book that is in copyright — Deleuze/Guattari, *A Thousand Plateaus*,
// trans. Massumi. Until then its ATP citations were second-hand through a text it may lawfully
// republish, so the size of a quotation could never become a rights question. With the source
// in hand it can, and the practice's record is public and mirrored onto this site.
//
// What the amendment permits is citation: short quotations with a page reference, as any
// scholar publishes them. What it forbids is text — a paragraph, a page, a run of pages, a
// file copied across. Nobody would decide to walk a copyrighted book into the open; it would
// happen one session at a time, each quotation defensible on its own, and be noticed when the
// book was already there.
//
// This guard is deliberately dumb, for the same reason the privacy guard is: it measures a
// quotation's LENGTH near an ATP citation and nothing else. It cannot judge fair use and does
// not try. A long quotation is not proof of a breach — it is a passage a person should look
// at, which is exactly what a red build produces.
//
// It scans the mirror rather than the practice's repository, because the mirror is what this
// site publishes. A quotation caught here has already been committed in the practice's own
// repository, so the guard cannot prevent — it can stop the passage reaching this domain and
// make the drift countable, which is what stopped three practices' publishing on 2026-08-15.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** The mirrored practice record this ceiling applies to. */
export const SCANNED_ROOT = 'public/n-1'

/**
 * Words permitted in a single quotation standing next to an ATP citation.
 *
 * Sixty is deliberately generous. The practice's existing citations run to about
 * twenty-five words ("One is obliged to follow when one is in search of the 'singularities'
 * of a matter, or rather of a material, and not out to discover a form" — ATP 372), so the
 * ceiling clears its established discipline twice over and still sits far below a paragraph.
 * A guard set at the current practice would fire on ordinary work and be switched off.
 */
export const MAX_QUOTED_WORDS = 60

/** How near a citation marker a quotation must stand to count as an ATP quotation. Generous:
 *  the citation usually follows the closing quotation mark, occasionally precedes it. */
const CITATION_WINDOW = 240

const CITATION = /\bATP\s+\d{1,3}/

export interface LongQuotation {
  file: string
  line: number
  words: number
  opening: string
}

const words = (s: string): number => s.trim().split(/\s+/).filter(Boolean).length

/**
 * Quoted spans: PAIRED double quotes, and markdown blockquote runs.
 *
 * Pairing is the whole difficulty. A first attempt matched from any quotation character to
 * any other, which meant the closing mark of one quotation and the opening mark of the next
 * captured everything in between — 132 false reports, several of them 300 words of ordinary
 * prose that happened to lie between two short citations. Opening and closing marks are
 * therefore matched as their own kinds, and a straight-quote span may not contain a blank
 * line: an unbalanced straight quote otherwise swallows the rest of a document.
 */
function quotationsIn(text: string): { quote: string; index: number }[] {
  const found: { quote: string; index: number }[] = []
  const typographic = /“([^”]{40,}?)”/g
  for (let m = typographic.exec(text); m; m = typographic.exec(text))
    found.push({ quote: m[1], index: m.index })
  // The straight quote is the same character opening and closing, so no regex can pair it:
  // matching one to the next captures the PROSE BETWEEN two quotations as though it were one.
  // That was the second wave of false reports — passages opening mid-citation, "(ATP 261, via
  // KsK §4.4). For the human researcher…". Counting is the only reliable pairing: split on the
  // character and every odd segment lies inside a quotation, provided the file is balanced.
  const parts = text.split('"')
  if (parts.length % 2 === 1) {
    let at = 0
    for (const [i, part] of parts.entries()) {
      if (i % 2 === 1 && part.length >= 40 && !/\n\s*\n/.test(part))
        found.push({ quote: part, index: at })
      at += part.length + 1
    }
  }
  // A blockquote run: consecutive lines opening with ">", joined.
  const blockquote = /(?:^>[^\n]*\n?){2,}/gm
  for (let m = blockquote.exec(text); m; m = blockquote.exec(text))
    found.push({ quote: m[0].replace(/^>\s?/gm, ''), index: m.index })
  return found
}

export function scanFile(file: string, text: string): LongQuotation[] {
  const out: LongQuotation[] = []
  for (const { quote, index } of quotationsIn(text)) {
    const n = words(quote)
    if (n <= MAX_QUOTED_WORDS) continue
    const near = text.slice(Math.max(0, index - CITATION_WINDOW), index + quote.length + CITATION_WINDOW)
    if (!CITATION.test(near)) continue
    out.push({
      file,
      line: text.slice(0, index).split('\n').length,
      words: n,
      opening: quote.trim().replace(/\s+/g, ' ').slice(0, 70),
    })
  }
  return out
}

/**
 * `foundation/` is the practice's founding text, held and republished lawfully. It is a
 * reading OF ATP and therefore quotes it throughout, at whatever length its own author chose.
 * Scanning it would report the one document in the mirror whose ATP quotations were never
 * this ceiling's business.
 */
const SKIPPED = new Set(['foundation'])

function markdownUnder(dir: string): string[] {
  const out: string[] = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return out
  }
  for (const name of entries) {
    if (SKIPPED.has(name)) continue
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...markdownUnder(path))
    else if (name.endsWith('.md') || name.endsWith('.html')) out.push(path)
  }
  return out
}

/** Every over-length ATP quotation in the mirrored practice record. */
export function scanRecord(): LongQuotation[] {
  return markdownUnder(SCANNED_ROOT).flatMap((file) =>
    scanFile(file, readFileSync(file, 'utf8')),
  )
}
