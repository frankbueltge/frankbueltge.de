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
//
// WIDENED ON 2026-10-05, after a pass that read past the guard found about fifty residues in
// current files — every one of them in a place or a shape the guard did not look at: in
// stylesheets, a Python docstring, the Pages redirect file, the root CLAUDE.md; between single
// quotes; and above all across a line break. The roots, the file kinds and the shapes below are
// what that pass taught. What each widening costs on this repository is measured and written
// next to it, the way the two old gaps were.

import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'

/** Roots that are part of the published record, walked recursively. */
export const SCANNED_ROOTS = ['docs', 'src', 'scripts', '.github', 'pipelines', 'functions', 'public', '.claude', '.githooks']

/** Hand-written files at the repository root. The root itself is not walked (node_modules). */
export const SCANNED_ROOT_FILES = ['CLAUDE.md', 'README.md', 'LICENSE.md', 'astro.config.mjs', 'vitest.config.ts']

/**
 * The file kinds the house writes. `.css`, `.mjs`, `.js`, `.sh`, `.toml` and `.txt` joined on
 * 2026-10-05 (six of that night's residues sat in stylesheets, one in the drift script). JSON
 * stays out on purpose: the JSON in this repository is pipeline archive — untouchable, and full
 * of other people's names, which is the Frankreich lesson below — or mirror, and neither is the
 * house's prose.
 */
const SCANNED_EXTENSIONS = ['.md', '.mdx', '.ts', '.tsx', '.astro', '.py', '.yml', '.yaml', '.css', '.mjs', '.cjs', '.js', '.sh', '.toml', '.txt']

/** Extensionless hand-written files: the Pages routing and header rules, the git hook. */
const SCANNED_FILENAMES = new Set(['_redirects', '_headers', 'pre-commit'])

/** `build` holds a generated copy of a pipeline package (pipelines/trending/build/lib). */
const SKIPPED_DIRECTORIES = new Set(['node_modules', 'dist', '.astro', '__pycache__', 'archive', '.venv', 'build', '.pytest_cache'])

/**
 * The practices' surfaces under public/: byte copies of other repositories — works, windows,
 * artifacts, a whole practice's record — that the integrate workflows mirror verbatim and the
 * house never edits. A finding there could not be repaired here, only quarantined, and an
 * allowlist entry for a real quotation is the one thing this guard must never hold. They are
 * read at their source instead (the read-only pass over the practice repositories of
 * 2026-10-05 reported what it found there by path and line). The practices' records mirrored
 * into src/content stay scanned, as they always were: that is the gate their integrate
 * workflows already answer to.
 */
const SKIPPED_PATHS = ['arch', 'atelier', 'attention', 'error-as-method', 'field', 'n-1', 'studio'].map((d) =>
  join('public', d),
)

/**
 * The channel documents of the standing exception above. Named in code since 2026-10-05: the
 * line-local detector happened never to meet their blockquotes, so the exception held without
 * being written down here; the wider shapes below do meet them (two spans in the Plenum's
 * channel on the day they were added).
 */
const CHANNEL_DOCUMENTS = new Set(['REQUESTS.md', 'REQUESTS-ARCHIVE.md'])

/**
 * The guard's own files. Its test states the rule in examples, which necessarily look like
 * the thing being forbidden; a detector that reports its own fixtures reports noise.
 */
const SKIPPED_FILES = new Set([
  join('src', 'lib', 'record', 'private-quotes.test.ts'),
  join('src', 'lib', 'record', 'private-quotes.ts'),
])

/**
 * Where the ASCII single quote may open: at the start, after a space or an opening bracket,
 * colon or dash — never after a letter, a digit or a backtick, where it is an apostrophe
 * (Frank's, `/ecology`'s) — and only in front of a non-space.
 */
const SINGLE_OPENS = /(?<![^\s([{:—–])'(?=\S)/

/**
 * A quoted span of at least six characters — long enough to be a sentence fragment rather
 * than a term. The forms in use in this repo: German „…", ASCII "…", the guillemets «…» (the
 * one found on 2026-08-15 by a pass that was reading the files anyway, after this detector had
 * walked straight past it) and English “…”. Since 2026-10-05 also the German »…«, the single
 * forms ‚…‘ and ‘…’, and the ASCII single quote '…' — because a workflow comment had quoted
 * Frank between single quotes and nothing in the guard could see it.
 *
 * The ASCII single quote is the expensive form: it is also the apostrophe and the string
 * delimiter of half the code here. It opens only where SINGLE_OPENS allows, closes only where
 * no letter or digit follows, and must run to MIN_WORDS words (below), because a string literal
 * beside a comment that names him ('instrument', a path) is code, not speech.
 */
const QUOTE = new RegExp(
  `„[^"„“]{6,}?["“]|"[^"]{6,}?"|«[^»]{6,}?»|“[^”]{6,}?”|»[^«]{6,}?«|‚[^‚‘’]{6,}?[‘’]|‘[^‘’]{6,}?’|${SINGLE_OPENS.source}[^']{6,}?'(?![\\p{L}\\p{N}])`,
  'gu',
)

/** Every pair of marks, however short („go" included) — used only to tell which mark is left open. */
const ANY_QUOTE = new RegExp(
  `„[^"„“]*?["“]|"[^"]*?"|«[^»]*?»|“[^”]*?”|»[^«]*?«|‚[^‚‘’]*?[‘’]|‘[^‘’]*?’|${SINGLE_OPENS.source}[^']*?'(?![\\p{L}\\p{N}])`,
  'gu',
)

/** Opening marks, each with the marks that close it. */
const CLOSERS: Record<string, string> = {
  '„': '"“',
  '"': '"',
  '«': '»',
  '“': '”',
  '»': '«',
  '‚': '‘’',
  '‘': '’',
  "'": "'",
}

/**
 * The attribution token. `Frank Bültge` is excluded on purpose: the full name is authorship
 * and branding (page titles, footers, licence lines), never the introduction of speech — in
 * the transliterated spelling too since 2026-10-05, which the legal page uses for its address
 * block and which the single-quote form would otherwise have read as ten quotations.
 *
 * Word-bounded since 2026-08-16, because it was not: the bare `Frank` matched **Frankreich**
 * and **Frankrike** — France, in German and Swedish — and produced twelve false findings in
 * the state-before-interface repo's TED procurement snapshots, where a country name sits a few
 * characters before a quoted notice title. A guard that accuses an untouchable archive of
 * leaking its owner's private speech is worse than no guard. `Franks` (the German genitive)
 * still matches.
 */
const ATTRIBUTION = /\bFranks?\b(?!\s+B(?:ü|ue)ltge)/g
const NAMED = /\bFranks?\b(?!\s+B(?:ü|ue)ltge)/

/**
 * A pronoun phrase that introduces his speech — "his objection landed: …" — found on 2026-10-05
 * in a component comment that named him two lines higher and quoted him under "his". It counts
 * only where Frank is named on its line or one of the PRONOUN_REACH lines above, so a reading
 * note about Mersch's objection stays Mersch's.
 */
const SPEECH_PRONOUN =
  /\b(?:his|seine[mnrs]?)\s+(?:objection|correction|complaint|charge|verdict|question|words|answer|reply|ask|Einwand|Kritik|Frage|Worte|Antwort|Korrektur)\b/g
const PRONOUN_REACH = 3

/** How far after the name a quotation still reads as attributed to it. */
const ATTRIBUTION_RANGE = 120

/**
 * How many continued lines a quotation that crosses a line break is followed through to its
 * closing mark. Three: the longest residue of 2026-10-05 opened beside the name and closed
 * three comment lines further down.
 */
const CONTINUATION_LINES = 3

/**
 * Words a quotation must run to in the shapes that cost the most: across a line break, and
 * between ASCII single quotes. A label wrapped onto the next line („two houses", „standing
 * themes") is a term, and so is a string literal; every quotation of his found across a line
 * break on 2026-10-05 ran to three words or more.
 */
const MIN_WORDS = 3

/** A comment or blockquote marker at the start of a continued line. */
const CONTINUATION_MARKER = /^\s*(?:\/\/+|#+|\*+(?!\/)|\/\*+|\{\/\*|<!--|>+)?\s?/

/** What ends an attribution line that hands over to a quotation on the next one. */
const INTRODUCER = /[:(—–]\s*(?:\*\/\}?|-->)?\s*$/

// FIRST KNOWN GAP, still open: THE PARENTHETICAL FORM. ("…", Frank, morning session) puts the
// name AFTER the quotation, and this detector does not see it — one line escaped exactly there
// on 2026-08-15, and on 2026-10-05 a question run over a line break before "(Frank, …)" did
// the same; both were caught by reading.
//
// It was tried and reverted on 2026-08-15. Reading backwards from a quotation is
// indistinguishable, syntactically, from the far commoner habit of naming a label and
// attributing the naming: "Experiments" (Frank, 2026-07-31). The attempt produced
// twenty-five findings, of which about one was speech. Every discriminator tried — word
// count, capitalisation, sentence punctuation — either kept the noise or dropped the one
// true case with it (that one was three lowercase words of his, and so is half
// the noise). Re-measured on 2026-10-05 against the cleaned repository, over the wider roots:
// ten findings, five of them at three words or more, not one of them speech — labels and
// framings named and then attributed („Global + Tagesfall" (Frank, …)). The one parenthetical
// residue of that night ran over a line break, so even the adopted form would have missed it.
//
// A guard that cries ten times and is right none of them gets muted, and then it guards
// nothing. So the gap stays written here, so the next reader knows to check parentheticals by
// eye rather than assume they were checked.
//
// SECOND KNOWN GAP, narrowed on 2026-10-05: THE LINE BREAK. Until that day the detector was
// line-local, and the night's pass found that the line break was where most residues lived — a
// quotation opened beside the name and closed a line or three further down, in comments and
// docstrings wrapped at 100 columns. Letting the window simply cross newlines had been measured
// on 2026-08-15: 124 further findings, the large majority of them work titles and section
// headings standing under an unrelated mention of the name. So the guard still does not cross
// lines in general. It follows exactly two shapes, both of which start from what the
// attribution's own line does:
//
//   · a SPAN — the quotation OPENS on the attribution's line, in range, and does not close
//     there; it is followed through up to CONTINUATION_LINES continued lines (comment markers
//     stripped, never across a blank line) to its closing mark;
//   · the NEXT LINE — the attribution's line ENDS by handing over (a colon, a dash, an open
//     parenthesis) and the very next line opens with a quotation mark.
//
// A heading that merely stands under a mention of the name qualifies for neither. Measured on
// 2026-10-05 against this repository: before the night's paraphrases, the two shapes found 40
// real quotations (36 spans, 4 next lines) at the price of nine false findings — labels, a
// document's rule text, a practice's own sentence — each cleared in the allowlist with its
// reason. The general crossing was measured the same night on the cleaned repository and
// declined again: a quotation opening ANYWHERE on the line after the name, within range,
// produced 72 findings (42 of them at three words or more), and not one was speech.
//
// What still passes, and was found that night only by reading: a quotation that opens in the
// middle of the line below a plain mention of the name; one under "user" instead of the name;
// a parenthetical run over a line break; and verbatim speech without quotation marks, which
// no detector of marks can see — "in his words" followed by his words. About fifteen of the
// night's residues were of these kinds.
//
// Proximity to a name is evidence of attribution, not proof of it, and the further the
// detector reaches the more of the record it accuses. This guard is the cheap, reliable part
// of the rule; it does not replace reading, and it must not be mistaken for having done it.

export interface QuoteFinding {
  file: string
  line: number
  /** The quotation as matched; a quotation over several lines is joined with single spaces. */
  quote: string
  /** Which shape found it: on the attribution's line, a span over a line break, or the next line. */
  form: 'line' | 'span' | 'next-line'
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
    if (SKIPPED_PATHS.includes(path)) continue
    if (statSync(path).isDirectory()) walk(path, out)
    else if (isScanned(entry)) out.push(path)
  }
  return out
}

function isScanned(name: string): boolean {
  if (CHANNEL_DOCUMENTS.has(name)) return false
  return SCANNED_FILENAMES.has(name) || SCANNED_EXTENSIONS.some((ext) => name.endsWith(ext))
}

const wordCount = (quote: string): number => quote.slice(1, -1).trim().split(/\s+/).filter(Boolean).length

/** A continued line without its comment or blockquote marker; null where the paragraph ends. */
function continuation(line: string | undefined): string | null {
  if (line === undefined) return null
  const body = line.replace(CONTINUATION_MARKER, '')
  return body.trim() === '' ? null : body
}

/** Whether the mark at `i` can open a quotation (an apostrophe cannot; see SINGLE_OPENS). */
function opensAt(line: string, i: number): boolean {
  if (CLOSERS[line[i]] === undefined) return false
  if (line[i] !== "'") return true
  return /[\s([{:—–]/.test(i === 0 ? ' ' : line[i - 1]) && /\S/.test(line[i + 1] ?? '')
}

/** Whether the mark at `i` closes a quotation opened by `opener`. */
function closesAt(text: string, i: number, opener: string): boolean {
  if (!CLOSERS[opener].includes(text[i])) return false
  return opener !== "'" || !/[\p{L}\p{N}]/u.test(text[i + 1] ?? '')
}

/**
 * The first mark at or after `searchFrom` that opens a quotation nothing on the line closes, or
 * null. Marks are paired from `pairFrom` — the start of the line's own text — so the closing
 * mark of a quotation that merely contains the name is not taken for an opening one.
 */
function danglingOpener(line: string, pairFrom: number, searchFrom = pairFrom): number | null {
  const paired = [...line.slice(pairFrom).matchAll(ANY_QUOTE)].map((m) => {
    const start = pairFrom + (m.index ?? 0)
    return [start, start + m[0].length]
  })
  for (let i = searchFrom; i < line.length; i++) {
    if (paired.some(([s, e]) => i >= s && i < e)) continue
    if (opensAt(line, i)) return i
  }
  return null
}

/**
 * Where each line's own text begins: after the tail of a quotation carried in open from the
 * lines above. Without it, the mark that CLOSES a quotation begun on the previous line reads as
 * one that opens a new one — and the "span" that follows runs from a closing mark to whatever
 * quotation the next line happens to hold.
 */
function ownTextStarts(lines: string[]): number[] {
  const starts = new Array<number>(lines.length).fill(0)
  let carried: string | null = null
  let age = 0
  lines.forEach((line, index) => {
    const body = continuation(line)
    if (body === null) {
      carried = null
      return
    }
    let from = line.length - body.length
    if (carried !== null) {
      let end = -1
      for (let i = from; i < line.length && end < 0; i++) if (closesAt(line, i, carried)) end = i
      if (end < 0) {
        starts[index] = line.length
        if (++age > CONTINUATION_LINES) carried = null
        return
      }
      from = end + 1
      starts[index] = from
      carried = null
    }
    const open = danglingOpener(line, from)
    if (open !== null) {
      carried = line[open]
      age = 0
    }
  })
  return starts
}

/**
 * Follow a quotation that opens at the start of `head` through up to CONTINUATION_LINES
 * continued lines below line `index` to its closing mark. Returns the joined quotation, or
 * null when it does not close in reach or is shorter than six characters.
 */
function followSpan(head: string, lines: string[], index: number): string | null {
  const opener = head[0]
  let joined = head
  let searched = 1
  for (let k = 0; k <= CONTINUATION_LINES; k++) {
    if (k > 0) {
      const next = continuation(lines[index + k])
      if (next === null) return null
      joined += ` ${next.trim()}`
    }
    for (let i = searched; i < joined.length; i++) {
      if (closesAt(joined, i, opener)) return i - 1 >= 6 ? joined.slice(0, i + 1) : null
    }
    searched = joined.length
  }
  return null
}

/** Positions on line `index` where the name, or a speech pronoun in reach of it, introduces what follows. */
function attributionsOn(lines: string[], index: number, from: number): number[] {
  const line = lines[index]
  const positions = [...line.matchAll(ATTRIBUTION)].map((m) => m.index ?? 0)
  const pronouns = [...line.matchAll(SPEECH_PRONOUN)].map((m) => m.index ?? 0)
  if (pronouns.length > 0 && NAMED.test(lines.slice(Math.max(0, index - PRONOUN_REACH), index + 1).join('\n'))) {
    positions.push(...pronouns)
  }
  return positions.filter((p) => p >= from).sort((a, b) => a - b)
}

export function scanFile(file: string, text: string): QuoteFinding[] {
  if (!text.includes('Frank')) return []

  const lines = text.split('\n')
  const starts = ownTextStarts(lines)
  const findings = new Map<string, QuoteFinding>()
  const add = (finding: QuoteFinding, col: number) => {
    const key = `${finding.line}:${col}`
    if (!findings.has(key)) findings.set(key, finding)
  }

  lines.forEach((line, index) => {
    const own = starts[index]
    const attributions = attributionsOn(lines, index, own)
    if (attributions.length === 0) return
    const nearestBefore = (at: number) => attributions.filter((a) => a < at).pop()

    // 1. On the attribution's own line — the original form.
    for (const match of line.slice(own).matchAll(QUOTE)) {
      const start = own + (match.index ?? 0)
      // An HTML/JSX attribute value is markup, not speech: title="… | Frank Bültge".
      if (start > 0 && line[start - 1] === '=') continue
      if (match[0][0] === "'" && wordCount(match[0]) < MIN_WORDS) continue

      const nearest = nearestBefore(start)
      if (nearest === undefined || start - nearest > ATTRIBUTION_RANGE) continue

      const context = line.slice(Math.max(0, nearest - 30), start + match[0].length + 40).trim()
      add({ file, line: index + 1, quote: match[0], form: 'line', context }, start)
    }

    // 2. A SPAN — opened on this line, in range of the name, closed on a continued line.
    const open = danglingOpener(line, own, attributions[0])
    if (open !== null && line[open - 1] !== '=') {
      const nearest = nearestBefore(open)
      if (nearest !== undefined && open - nearest <= ATTRIBUTION_RANGE) {
        const quote = followSpan(line.slice(open), lines, index)
        if (quote !== null && wordCount(quote) >= MIN_WORDS) {
          const context = `${line.slice(Math.max(0, nearest - 30), open).trim()} ${quote}`
          add({ file, line: index + 1, quote, form: 'span', context }, open)
        }
      }
    }

    // 3. The NEXT LINE — this line hands over near its end, the next one opens with the quotation.
    const last = attributions[attributions.length - 1]
    if (INTRODUCER.test(line) && line.trimEnd().length - last <= ATTRIBUTION_RANGE) {
      const next = lines[index + 1] ?? ''
      const body = continuation(next)
      if (body !== null) {
        const lead = body.match(/^\s*[*_]*/)?.[0].length ?? 0
        const col = next.length - body.length + lead
        if (opensAt(next, col)) {
          const quote = followSpan(next.slice(col), lines, index + 1)
          if (quote !== null && wordCount(quote) >= MIN_WORDS) {
            add({ file, line: index + 2, quote, form: 'next-line', context: `${line.trim().slice(-60)} ${quote}` }, col)
          }
        }
      }
    }
  })

  return [...findings.values()].sort((a, b) => a.line - b.line)
}

export function scanRecord(roots: string[] = SCANNED_ROOTS, rootFiles: string[] = SCANNED_ROOT_FILES): QuoteFinding[] {
  const files = [...roots.flatMap((root) => walk(root)), ...rootFiles.filter(isFile)]
  return files
    .filter((file) => !SKIPPED_FILES.has(file))
    .flatMap((file) => scanFile(file, readFileSync(file, 'utf8')))
}

function isFile(path: string): boolean {
  try {
    return statSync(path).isFile()
  } catch {
    return false
  }
}
