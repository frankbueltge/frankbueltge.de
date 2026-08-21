// src/lib/atelier/dossier.ts — the project dossier: what a work-line is asking, where it
// stands, and what it did last — read out of the line's own committed record.
//
// WHY THIS EXISTS. The entrance used to lead with a taxonomy: four outcome harbours and a
// guided story about one line that had already ended. It answered "what became of the
// practice's questions" and never "what is the practice asking right now". This module is
// the present tense: for each line it returns the question the record states, the stand the
// record's own fields imply, and the line's latest moves VERBATIM, newest first.
//
// THE HOUSE RULE HOLDS THROUGHOUT: nothing here is written, summarised or rounded. Every
// string this module returns is a span of a committed file, carried with the repo-relative
// path it came from so the page can print it. The one transformation is the same one
// ledger.ts documents — the record's hard line wraps become single spaces, because a record
// wraps at ~92 columns and a dossier panel does not. Where the record says nothing, this
// module returns null and the page says so in words; an invented value would be a lie in an
// archive whose whole claim is that it can be checked.
//
// PURE BY CONSTRUCTION. No import.meta.glob, no fs — the caller hands over raw file contents
// keyed by path (exactly what `import.meta.glob(..., { query: '?raw' })` returns), so this
// module is unit-testable against fixtures AND against the real committed files.

import { readClosingLedger, unwrap, type ClosingLedger } from './ledger'

// ————————————————————————————————————————————————— frontmatter ——————————————

/** A parsed frontmatter value: a scalar, or one level of nesting (`work_line:` uses one). */
export type FrontmatterValue = string | Record<string, string>

/** Splits `---\n…\n---\n…` into its two halves. A file without frontmatter yields an empty
 *  head and its whole text as the body — no throw, because a record that lost its
 *  frontmatter should degrade to "the record states none", not break the build. */
export function splitFrontmatter(raw: string): { head: string; body: string } {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/.exec(raw)
  return m ? { head: m[1], body: m[2] } : { head: '', body: raw }
}

const KEY_LINE = /^(\s*)([A-Za-z_][\w-]*):[ \t]*(.*)$/

/** Strips the quotes YAML allows around a scalar. Nothing else — an inline `# comment` is
 *  KEPT, because in this archive those comments carry content (a SCORE's `refrain_aspect`
 *  states the aspect and then, after a `#`, the whole reason for it). `splitInlineNote`
 *  separates the two where a caller wants them apart. */
function unquote(v: string): string {
  const t = v.trim()
  if ((t.startsWith('"') && t.endsWith('"')) || (t.startsWith("'") && t.endsWith("'"))) {
    return t.slice(1, -1)
  }
  return t
}

/** `'home  # tick 21 — the criterion …'` → `{ value: 'home', note: 'tick 21 — the criterion …' }` */
export function splitInlineNote(v: string): { value: string; note: string | null } {
  const m = /^([^#]*?)\s+#\s*(.+)$/.exec(v)
  return m ? { value: m[1].trim(), note: m[2].trim() } : { value: v.trim(), note: null }
}

/**
 * A deliberately small YAML reader: scalars, folded/literal blocks (`>` `|` and their chomp
 * variants) and ONE level of nesting. That is exactly the shape the atelier's SCORE and
 * DECISION frontmatter uses, and pulling a YAML dependency in to read four known keys would
 * buy generality this repo has no use for. Anything more exotic in a future record parses as
 * a scalar rather than throwing — an unreadable field must not take the entrance down.
 *
 * Folded blocks join their lines with single spaces and keep blank lines as paragraph breaks,
 * which is what YAML's `>` means and what the records were written expecting.
 */
export function parseFrontmatter(head: string): Record<string, FrontmatterValue> {
  const lines = head.split(/\r?\n/)
  const out: Record<string, FrontmatterValue> = {}
  let i = 0

  const readBlock = (ownIndent: number): string => {
    const collected: string[] = []
    while (i < lines.length) {
      const line = lines[i]
      if (line.trim() === '') {
        collected.push('')
        i++
        continue
      }
      const indent = line.length - line.trimStart().length
      if (indent <= ownIndent) break
      collected.push(line.trim())
      i++
    }
    while (collected.length && collected[collected.length - 1] === '') collected.pop()
    // Fold: blank line = paragraph break, everything else joins with a space.
    return collected
      .reduce<string[]>((acc, l) => {
        if (l === '') acc.push('')
        else if (acc.length === 0 || acc[acc.length - 1] === '') acc.push(l)
        else acc[acc.length - 1] += ' ' + l
        return acc
      }, [])
      .filter((p) => p !== '')
      .join('\n\n')
      .trim()
  }

  while (i < lines.length) {
    const line = lines[i]
    const m = KEY_LINE.exec(line)
    if (!m) {
      i++
      continue
    }
    const [, indentStr, key, rawValue] = m
    const indent = indentStr.length
    if (indent > 0) {
      i++
      continue // handled by its parent below
    }
    i++
    const value = rawValue.trim()

    if (/^[|>][-+]?$/.test(value)) {
      out[key] = readBlock(indent)
      continue
    }
    if (value === '') {
      // Either a nested map or an empty scalar. Peek: a deeper `key:` line means nesting.
      const start = i
      const nested: Record<string, string> = {}
      while (i < lines.length) {
        const l = lines[i]
        if (l.trim() === '') {
          i++
          continue
        }
        const childIndent = l.length - l.trimStart().length
        if (childIndent <= indent) break
        const cm = KEY_LINE.exec(l)
        if (!cm) {
          i++
          continue
        }
        const [, , childKey, childRaw] = cm
        i++
        const childValue = childRaw.trim()
        nested[childKey] = /^[|>][-+]?$/.test(childValue)
          ? readBlock(childIndent)
          : unquote(childValue)
      }
      out[key] = i > start && Object.keys(nested).length > 0 ? nested : ''
      continue
    }
    out[key] = unquote(value)
  }
  return out
}

/** Reads a scalar, optionally one level down. Returns null for absent or empty — the two
 *  cases the page must print as a stated gap rather than as an empty element. */
export function fm(
  data: Record<string, FrontmatterValue>,
  key: string,
  child?: string,
): string | null {
  const v = data[key]
  if (child) {
    if (!v || typeof v === 'string') return null
    const c = v[child]
    return c && c.trim() !== '' ? c : null
  }
  if (typeof v !== 'string') return null
  return v.trim() !== '' ? v : null
}

// ————————————————————————————————————————————————— the stand ————————————————

/** Where a line stands, derived from `status` + `disposition` — never typed by hand. The
 *  labels the page prints for these live in atelier-wording's `passage.harbours`, already
 *  approved: a stand says what happened, never how to judge it. */
export type Stand = 'RUNNING' | 'PUBLICATION_CANDIDATE' | 'PUBLISH' | 'ARCHIVE_AS_STUDY' | 'KILL'

const DISPOSITIONS = new Set(['PUBLISH', 'PUBLICATION_CANDIDATE', 'ARCHIVE_AS_STUDY', 'KILL'])

/**
 * A running line with a disposition already entered (`PUBLICATION_CANDIDATE`) stands AT THE
 * GATE, not merely "running": the record says a human decision is pending, and that is the
 * single most load-bearing fact about the practice's current work. A closed line without a
 * disposition cannot exist under the protocol; if one ever does, it reads as running, because
 * inventing a verdict for it would be worse than showing the record's own inconsistency.
 */
export function standOf(disposition: string | null): Stand {
  const d = (disposition ?? '').trim().toUpperCase()
  if (DISPOSITIONS.has(d)) return d as Stand
  return 'RUNNING'
}

// ————————————————————————————————————————————————— the trace ————————————————

/** What kind of move a tick was, classified from the record's own heading vocabulary. */
export type MoveKind =
  | 'initiation'
  | 'declaration'
  | 'expose'
  | 'verify'
  | 'judge'
  | 'home'
  | 'opening'
  | 'compost'
  | 'correction'
  | 'observation'
  | 'move'

/** Ordered because headings combine words: "Opening operation" must not be read as a home
 *  operation, and an "In-vivo observation … (work-line tick 10)" is an observation. First
 *  match wins, so the more specific patterns come first. */
const KINDS: ReadonlyArray<[RegExp, MoveKind]> = [
  [/\bcompost\b/i, 'compost'],
  [/\bcorrection\b/i, 'correction'],
  [/\bwork-line declaration\b/i, 'declaration'],
  [/\binitiation\b/i, 'initiation'],
  [/\bobservation\b/i, 'observation'],
  [/\bopening\b/i, 'opening'],
  [/\bhome operation\b/i, 'home'],
  [/\bexpose\b/i, 'expose'],
  [/\bverify\b/i, 'verify'],
  [/\bjudge\b/i, 'judge'],
]

export function moveKind(heading: string): MoveKind {
  for (const [re, kind] of KINDS) if (re.test(heading)) return kind
  return 'move'
}

const ISO_DATE = /(\d{4}-\d{2}-\d{2})/

/**
 * The record's own number for a move, in the five shapes the committed traces use. ORDER IS
 * LOAD-BEARING and the leading forms must be tried first: the meta-line's headings read
 * `## #20 — 2026-07-31 — Observation on the work-line's tick 19 (…)`, where `#20` numbers THIS
 * move and `tick 19` names a move of a DIFFERENT line. Matching `tick` first mis-numbered
 * every observation on that line by one and cut a hole in its title.
 *
 * Returns the matched span too, so `moveTitle` removes exactly the token that was read as the
 * number and leaves every other number in the heading alone.
 */
export function moveNumber(heading: string): { value: number; span: string } | null {
  const h = heading.trim()
  const m =
    /^#(\d+)\b/.exec(h) ??
    /^(?:in-vivo\s+)?observation\s+#?(\d+)\b/i.exec(h) ??
    /^T-0*(\d+)\b/i.exec(h) ??
    /\btick\s+(\d+)\b/i.exec(h)
  return m ? { value: Number(m[1]), span: m[0] } : null
}

/** The heading with its number and date lifted out, leaving the record's own words for what
 *  the move was. Separators the heading used to join those parts are trimmed away. */
export function moveTitle(heading: string): string {
  const num = moveNumber(heading)
  let t = heading.trim()
  if (num) t = t.replace(num.span, '')
  t = t
    .replace(ISO_DATE, '')
    .replace(/^[\s—–\-·:,;(]+/, '')
    .replace(/[\s—–\-·:,;]+$/, '')
    .trim()
  // Some headings wrap their whole title in brackets ("(a pure territory tick: …)"), and the
  // opening bracket is gone with the date. Close the orphan — but only when it IS an orphan:
  // "Tick 1: the first move (territory)" keeps its bracketed word.
  const opens = (t.match(/\(/g) ?? []).length
  const closes = (t.match(/\)/g) ?? []).length
  return closes > opens ? t.replace(/\)$/, '').trim() : t
}

export interface TickEntry {
  /** position in the record, oldest = 1 — always present, even where the record numbers none */
  seq: number
  /** the record's OWN number for this move, or null where it states none */
  number: number | null
  date: string
  /** the record's words for what the move was */
  title: string
  kind: MoveKind
  /** the heading verbatim, as written in the file */
  heading: string
  /** the move's opening paragraph, verbatim (line wraps unwrapped); null where it has none */
  lead: string | null
  /** the record's own `**Budget:**` sentence for this move, verbatim; null where unstated */
  budget: string | null
}

/** What a move cost, in the two shapes the records state it: a bold `**Budget…**` label in the
 *  prose templates, and a `- Budget note:` field in the "consequential trace record" one. */
const BUDGET = /^\*\*Budget\b[^*]*\*\*[ \t]*([\s\S]*?)(?=\r?\n\s*\r?\n|(?![\s\S]))/m
const BUDGET_FIELD = /^-[ \t]+Budget[^:\n]*:[ \t]*([\s\S]*?)(?=\r?\n-[ \t]|\r?\n\s*\r?\n|(?![\s\S]))/m

/** A block's first prose paragraph: not a sub-heading, not a table row, not a quote, not a
 *  list item — the sentence the move opens with, unwrapped.
 *
 *  The bullet test needs the trailing space. Without it `**Pre-registered in …**` reads as a
 *  `*` list item, and the running line's most recent moves — which all open in bold, because
 *  that is how this practice writes the sentence that matters — were silently skipped in
 *  favour of some paragraph further down. Emphasis markers are the record's own and stay. */
function leadParagraph(block: string): string | null {
  for (const para of block.split(/\r?\n\s*\r?\n/)) {
    const t = para.trim()
    if (!t) continue
    if (/^#{1,6}\s/.test(t)) continue
    if (/^[>|]/.test(t)) continue
    if (/^([-+*]|\d+[.)])\s/.test(t)) continue
    return unwrap(t)
  }
  return null
}

/** In the "consequential trace record" template a move is not prose but a field list, so it
 *  has no opening paragraph to quote. The field that says what the move WAS is `- What
 *  happened:` — or, in the later entries of that same template, `- Operation performed:`.
 *  Reading both is why three of the twelve lines show their moves at all; an entry carrying
 *  neither field keeps an empty move rather than borrowing a neighbour's words. */
const WHAT_HAPPENED =
  /^-[ \t]+(?:What happened|Operation performed)[^:\n]*:[ \t]*([\s\S]*?)(?=\r?\n-[ \t]|\r?\n\s*\r?\n|(?![\s\S]))/m

const FIELD_DATE = /^-[ \t]+Date:[ \t]*(\d{4}-\d{2}-\d{2})/m

/**
 * `fieldDate` is only ever true for the sub-heading pass, and that is a correctness rule, not
 * a tuning knob. In the "consequential trace record" template the whole file sits under one
 * undated `## Trace entries`, whose block therefore contains every `- Date:` in the document.
 * Allowing the field fallback at the `##` level made three lines report exactly one move,
 * dated from someone else's field and titled "Trace entries" — a heading invented as history.
 */
function readMoves(body: string, level: '##' | '###', fieldDate: boolean): TickEntry[] {
  const re = new RegExp(String.raw`^${level}[ \t]+(.+?)[ \t]*$`, 'gm')
  const headings = [...body.matchAll(re)]
  const out: TickEntry[] = []

  headings.forEach((h, idx) => {
    const heading = h[1].trim()
    const start = h.index! + h[0].length
    const end = idx + 1 < headings.length ? headings[idx + 1].index! : body.length
    const block = body.slice(start, end)
    const date = ISO_DATE.exec(heading)?.[1] ?? (fieldDate ? FIELD_DATE.exec(block)?.[1] : null)
    if (!date) return
    const budgetMatch = BUDGET.exec(block) ?? BUDGET_FIELD.exec(block)
    const happened = WHAT_HAPPENED.exec(block)
    out.push({
      seq: 0, // assigned once the dated moves are known
      number: moveNumber(heading)?.value ?? null,
      date,
      title: moveTitle(heading),
      kind: moveKind(heading),
      heading,
      lead: leadParagraph(block) ?? (happened ? unwrap(happened[1]) : null),
      budget: budgetMatch ? unwrap(budgetMatch[1]) : null,
    })
  })
  return out
}

/**
 * Reads a TRACE.md into its moves, oldest first.
 *
 * The committed traces do not share one grammar — the practice rewrote its trace template
 * twice and the archive keeps every generation, so this reads the record as it is rather than
 * declaring one shape "the" format:
 *
 *   · most lines head each move with `## …` carrying an ISO date (`## Tick 9 — 2026-07-26 — …`,
 *     `## 2026-07-18 — Tick 2: …`, `## In-vivo observation #10 — 2026-07-26 (…)`);
 *   · three lines use the older "consequential trace record" template, where the only `##` is
 *     the undated container `## Trace entries` and the moves are `### T-001 — …` blocks that
 *     state their date in a `- Date:` field.
 *
 * So: dated `##` headings win, and the `###` level is read ONLY when they yield nothing. That
 * order matters — descending into `###` unconditionally would turn the hundred-odd sub-findings
 * of the running line's trace into a hundred fictional "moves".
 *
 * A heading with no date anywhere is not a move. The traces also carry undated structural
 * sections — "Trace entries", "Corrections and contestations", "Rejected or defeated premises",
 * "Trace exclusions" — and putting those on a timeline would be inventing history.
 */
export function parseTrace(raw: string): TickEntry[] {
  const { body } = splitFrontmatter(raw)
  const top = readMoves(body, '##', false)
  const moves = top.length > 0 ? top : readMoves(body, '###', true)
  return moves
    .sort((a, b) => a.date.localeCompare(b.date) || (a.number ?? 0) - (b.number ?? 0))
    .map((t, i) => ({ ...t, seq: i + 1 }))
}

// ————————————————————————————————————————————————— the journal ——————————————

export interface JournalEntry {
  /** the register slug, i.e. the page at /atelier/journal/<slug>/ */
  slug: string
  date: string
  /** the entry's own `#` heading, with its leading date stripped */
  title: string
  /** the work-line id the entry declares, or null where it declares none */
  workLine: string | null
  /** the record's own byline under the heading, verbatim */
  byline: string | null
  /** the entry's opening paragraph, verbatim */
  lead: string | null
  /** repo-relative source path */
  source: string
}

const WORK_LINE_LINE = /^\*\*Work-line:\*\*[ \t]*(.+)$/m

/** `/src/content/atelier/journal/2026-08-01-a-number….md` → `2026-08-01-a-number…` */
export function journalSlug(path: string): string {
  return path.replace(/^.*\/journal\//, '').replace(/\.md$/, '')
}

export function parseJournal(raw: string, path: string): JournalEntry {
  const { body } = splitFrontmatter(raw)
  const slug = journalSlug(path)
  const heading = /^#[ \t]+(.+?)[ \t]*$/m.exec(body)?.[1]?.trim() ?? ''
  const date = ISO_DATE.exec(heading)?.[1] ?? ISO_DATE.exec(slug)?.[1] ?? ''
  const bylineMatch = WORK_LINE_LINE.exec(body)
  const byline = bylineMatch ? unwrap(bylineMatch[1]) : null
  const workLine = byline ? (/`([^`]+)`/.exec(byline)?.[1] ?? null) : null

  // The lead is the first paragraph AFTER the byline, where there is one — otherwise the
  // byline itself would be read as the entry's opening sentence.
  const afterByline = bylineMatch
    ? body.slice(bylineMatch.index + bylineMatch[0].length)
    : body.replace(/^#[ \t]+.+$/m, '')

  return {
    slug,
    date,
    title: heading.replace(ISO_DATE, '').replace(/^[\s—–\-·:]+/, '').trim() || slug,
    workLine,
    byline,
    lead: leadParagraph(afterByline),
    source: path.replace(/^\//, ''),
  }
}

/** `2026-07-23-negative-parallax` → `negative-parallax` */
export function lineName(id: string): string {
  return id.replace(/^\d{4}-\d{2}-\d{2}-/, '')
}

/**
 * Which line a journal entry belongs to. Two rules, in this order:
 *
 *   1. the entry's own `**Work-line:** \`<id>\`` byline — explicit, and the only rule that
 *      catches the newest entries, whose filenames name the FINDING rather than the line
 *      (`2026-08-01-a-number-with-no-single-value` is tick 21 of negative-parallax);
 *   2. the filename prefix, which is how the older entries name their line.
 *
 * Rule 1 is new here. The process figure has only ever had rule 2, which is precisely why the
 * entrance looked stalled: six of the ten most recent entries on the running line were
 * invisible to it. The longest matching name wins in rule 2, so a line called `x` cannot take
 * the entries of a line called `x-ii`.
 */
export function attachJournal(
  entries: readonly JournalEntry[],
  lineIds: readonly string[],
): Record<string, JournalEntry[]> {
  const ids = new Set(lineIds)
  const byLength = [...lineIds].sort((a, b) => lineName(b).length - lineName(a).length)
  const out: Record<string, JournalEntry[]> = Object.fromEntries(lineIds.map((id) => [id, []]))

  for (const entry of entries) {
    let id: string | null = entry.workLine && ids.has(entry.workLine) ? entry.workLine : null
    if (!id) {
      const rest = entry.slug.replace(/^\d{4}-\d{2}-\d{2}-/, '')
      id = byLength.find((l) => rest.startsWith(lineName(l))) ?? null
    }
    if (id) out[id].push(entry)
  }

  for (const id of lineIds) {
    out[id].sort((a, b) => (a.date === b.date ? a.slug.localeCompare(b.slug) : a.date.localeCompare(b.date)))
  }
  return out
}

// ————————————————————————————————————————————————— inline markup ———————————

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }

/**
 * The record's own inline emphasis, rendered as HTML instead of printed as syntax.
 *
 * The archive is Markdown, and this practice uses emphasis to carry meaning — a tick opens with
 * a whole bold sentence because that sentence is the finding, and it italicises the word a
 * distinction turns on. Printing `**Pre-registered before any count…**` with its asterisks shows
 * a visitor the FILE FORMAT rather than the sentence; stripping the asterisks (which is what
 * lineText.ts does, correctly, for SVG text that cannot be styled) throws the emphasis away.
 * In HTML there is a third option, and it is the honest one: render it. No word is added,
 * removed or reordered.
 *
 * ESCAPE FIRST, always. The content is committed and trusted, but "trusted input" is how
 * injection bugs are written, and the archive genuinely contains angle brackets (`<ref>`,
 * `ϖ/σ_ϖ > 10`). Escaping before the emphasis pass means nothing in a record can ever become
 * markup, and the emphasis patterns cannot match anything the escape produced.
 *
 * Links render as their own text: a dossier prints the path a quote came from itself, and a
 * quotation should not sprout navigation the record did not intend on this surface.
 */
export function renderInline(text: string): string {
  return text
    .replace(/[&<>"]/g, (c) => ESCAPES[c])
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>')
    // The emphasised span may not open or close on whitespace — otherwise "2 * 3 * 4" reads as
    // an italic 3, and this archive multiplies. Same rule as CommonMark's flanking test, in the
    // one form this content needs.
    .replace(/(^|[\s(“"—–-])\*([^*\s][^*\n]*?[^*\s]|[^*\s])\*/g, '$1<i>$2</i>')
    .replace(/(^|[\s(“"—–])_([^_\s][^_\n]*?[^_\s]|[^_\s])_/g, '$1<i>$2</i>')
}

// ————————————————————————————————————————————————— the question —————————————

export interface Quoted {
  /** the record's words, verbatim */
  text: string
  /** repo-relative path it was read from — printed with the quote */
  source: string
  /** which field of the record it is, in the record's own vocabulary */
  label: string
}

/** SCORE §2's `**Initial question**` paragraph — the one place a line states what it is
 *  asking. **Two shapes, both read**, because what separates them is typography and not meaning:
 *    (a) the label alone on its line — `**Initial question**`, its full stop or colon inside the
 *        bold run if the record writes one — and the question in what follows it;
 *    (b) the label and the question in ONE bold run: `**Initial question. Can …?**`, which is
 *        what a score compacted against its word floor comes out looking like.
 *  Only (a) was read until 2026-08-21, and the cost of that is on the record: the Atelier's
 *  score oscillated between the two shapes over three days, the gate went red 27 times on a
 *  question the record did carry, and the practice spent parts of two sessions reverse-engineering
 *  this regex from an assertion that never named it. The assertion names it now (dossier.test.ts)
 *  and the gate reads both — the letter's contract lives in the assertion, not in a lookup table
 *  of known failures, which this house refused for good reasons on 2026-07-31 (src/lib/gate/brief.ts).
 *  Where a record uses a section heading instead (the encounter template writes
 *  `## 2. Local question …`), that section's first paragraph is read instead. Where a record
 *  states neither — the gate-rehearsal fixture has no research question, because it is an
 *  infrastructure test — this returns null and the page says the record states none. */
const INITIAL_QUESTION = /^\*\*Initial question[.:]?\*\*\s*([\s\S]*?)(?=\r?\n\s*\r?\n|(?![\s\S]))/m
// Shape (b). The capture may not run past a blank line: a lazy `[\s\S]*?` would otherwise walk to
// the next `**` anywhere below and quote a neighbouring field as this line's question.
const INITIAL_QUESTION_INLINE = /^\*\*Initial question[.:]\s+((?:(?!\r?\n\s*\r?\n)[\s\S])*?)\*\*/m
const QUESTION_SECTION = /^##[ \t]+[\d.]*[ \t]*([^\n]*\bquestion\b[^\n]*)$/im

export function readQuestion(body: string, source: string): Quoted | null {
  const direct = INITIAL_QUESTION.exec(body) ?? INITIAL_QUESTION_INLINE.exec(body)
  if (direct) return { text: unwrap(direct[1]), source, label: 'initial question' }

  const section = QUESTION_SECTION.exec(body)
  if (section) {
    const after = body.slice(section.index + section[0].length)
    const lead = leadParagraph(after.split(/^##[ \t]/m)[0])
    // The heading's own words, minus any parenthetical aside — a field label, not a sentence.
    if (lead) return { text: lead, source, label: section[1].replace(/\s*\(.*$/, '').trim().toLowerCase() }
  }
  return null
}

// ————————————————————————————————————————————————— the dossier ——————————————

export interface DossierMove {
  /** which record it came from */
  from: 'trace' | 'journal'
  date: string
  /** the record's words for what the move was */
  title: string
  /** the record's opening paragraph for that move, verbatim */
  text: string | null
  source: string
  /** where a reader can go on to read the whole entry, where such a page exists */
  href: string | null
  /** the record's own number for the move */
  number: number | null
  kind: MoveKind | null
}

export interface DossierSource {
  /** the file's name as the practice calls it: SCORE, TRACE, DECISION, … */
  label: string
  path: string
  /** what that file is, in one clause */
  note: string
}

export interface Dossier {
  id: string
  title: string
  /** `work-line` where the record declares one, else null — the protocol's own distinction
   *  between a line that carries a work and a study that feeds one */
  kind: string | null
  status: string
  disposition: string | null
  stand: Stand
  created: string
  /** the newest dated thing in the whole record — the honest answer to "is this alive" */
  lastMove: string
  /** number of dated moves the trace records */
  tickCount: number
  question: Quoted | null
  intention: Quoted | null
  territory: Quoted | null
  horizon: string | null
  refrain: { value: string; note: string | null } | null
  programme: Quoted | null
  ticks: TickEntry[]
  /** trace + journal, newest first — the panel the entrance leads with */
  moves: DossierMove[]
  ledger: ClosingLedger | null
  sources: DossierSource[]
  journalCount: number
}

export interface DossierInput {
  /** raw SCORE.md files keyed by their repo path (an import.meta.glob result) */
  scores: Record<string, string>
  traces: Record<string, string>
  decisions: Record<string, string>
  journal: Record<string, string>
  /** every project file path, so the dossier can list what the record consists of */
  files: readonly string[]
}

/** `/src/content/atelier/projects/<id>/SCORE.md` → `<id>` */
export function lineIdFromPath(path: string): string {
  return path.replace(/^.*\/projects\//, '').split('/')[0]
}

const FILE_NOTES: Record<string, string> = {
  'SCORE.md': 'the score — what the line asks, and the conditions it wrote for itself',
  'TRACE.md': 'the trace — every move, dated, as it was made',
  'DECISION.md': 'the decision — how it ended, and what closing it cost',
  'EXPOSITION.md': 'the exposition — the line put together for a reader',
  'APPARATUS.md': 'the apparatus — what was built to do the work',
  'FIGURE-NOTE.md': 'the figure note — why the figure looks the way it does',
  'SKETCH-NOTE.md': 'the sketch note — a form tested before it was built',
}

function fileNote(name: string): string {
  if (FILE_NOTES[name]) return FILE_NOTES[name]
  if (name.startsWith('PREREGISTRATION')) {
    return 'a pre-registration — what would count as defeat, written before the count'
  }
  return 'part of the line’s record'
}

/**
 * Builds every dossier from the committed records, newest activity first among running
 * lines, then the closed ones by the date they last moved.
 *
 * `movesShown` bounds how many verbatim moves each dossier carries into the page. It is a
 * page-weight decision, not an editorial one: every dossier is server-rendered so the
 * entrance works without JavaScript, and twelve unbounded records would be a megabyte of
 * HTML. The dossier states the bound and links the full trace, so nothing is hidden.
 */
export function buildDossiers(input: DossierInput, movesShown = 4): Dossier[] {
  const ids = Object.keys(input.scores).map(lineIdFromPath).sort()

  const journalEntries = Object.entries(input.journal).map(([path, raw]) => parseJournal(raw, path))
  const journalByLine = attachJournal(journalEntries, ids)

  const byId = new Map<string, { score: string; trace?: string; decision?: string }>()
  for (const [path, raw] of Object.entries(input.scores)) byId.set(lineIdFromPath(path), { score: raw })
  for (const [path, raw] of Object.entries(input.traces)) {
    const e = byId.get(lineIdFromPath(path))
    if (e) e.trace = raw
  }
  for (const [path, raw] of Object.entries(input.decisions)) {
    const e = byId.get(lineIdFromPath(path))
    if (e) e.decision = raw
  }

  const dossiers = ids.map((id) => {
    const rec = byId.get(id)!
    const base = `src/content/atelier/projects/${id}`
    const scoreSource = `${base}/SCORE.md`
    const { head, body } = splitFrontmatter(rec.score)
    const data = parseFrontmatter(head)

    const ticks = rec.trace ? parseTrace(rec.trace) : []
    const journal = journalByLine[id] ?? []
    const created = fm(data, 'created') ?? id.slice(0, 10)

    const traceMoves: DossierMove[] = ticks.map((t) => ({
      from: 'trace',
      date: t.date,
      title: t.title,
      text: t.lead,
      source: `${base}/TRACE.md`,
      href: null,
      number: t.number,
      kind: t.kind,
    }))
    const journalMoves: DossierMove[] = journal.map((j) => ({
      from: 'journal',
      date: j.date,
      title: j.title,
      text: j.lead,
      source: j.source,
      href: `/atelier/journal/${j.slug}/`,
      number: null,
      kind: null,
    }))

    // Newest first. Within a day the trace's own order is the record's order, so the trace
    // move sorts above the journal entry that reports it — the record before the retelling.
    const moves = [...traceMoves, ...journalMoves]
      .sort((a, b) => {
        if (a.date !== b.date) return b.date.localeCompare(a.date)
        if (a.from !== b.from) return a.from === 'trace' ? -1 : 1
        return (b.number ?? 0) - (a.number ?? 0)
      })
      .slice(0, movesShown)

    const refrainRaw = fm(data, 'work_line', 'refrain_aspect') ?? fm(data, 'refrain_aspect')
    const dates = [created, ...ticks.map((t) => t.date), ...journal.map((j) => j.date)].filter(Boolean)

    const files = input.files
      .filter((p) => p.includes(`/projects/${id}/`))
      .map((p) => p.replace(/^.*\/projects\//, '').split('/')[1])
      .sort()

    const decision = rec.decision
      ? readClosingLedger(rec.decision, id, `${base}/DECISION.md`)
      : null

    const quoted = (text: string | null, label: string): Quoted | null =>
      text ? { text, source: scoreSource, label } : null

    return {
      id,
      title: fm(data, 'title') ?? id,
      kind: fm(data, 'kind'),
      status: fm(data, 'status') ?? 'ACTIVE',
      disposition: fm(data, 'disposition'),
      stand: standOf(fm(data, 'disposition')),
      created,
      lastMove: dates.sort()[dates.length - 1] ?? created,
      tickCount: ticks.length,
      question: readQuestion(body, scoreSource),
      intention: quoted(fm(data, 'work_line', 'work_intention'), 'work intention'),
      territory: quoted(fm(data, 'work_line', 'material_territory'), 'material territory'),
      horizon: fm(data, 'work_line', 'horizon'),
      refrain: refrainRaw ? splitInlineNote(refrainRaw) : null,
      programme: quoted(fm(data, 'work_line', 'research_programme'), 'research programme'),
      ticks,
      moves,
      ledger: decision,
      sources: files.map((name) => ({
        label: name.replace(/\.md$/, ''),
        path: `${base}/${name}`,
        note: fileNote(name),
      })),
      journalCount: journal.length,
    } satisfies Dossier
  })

  return sortDossiers(dossiers)
}

/** Running lines first — the entrance is about the present tense — and inside each group the
 *  line that moved most recently leads. Ties fall back to the id so the build is stable. */
export function sortDossiers(dossiers: readonly Dossier[]): Dossier[] {
  const running = (d: Dossier) => (d.status.trim().toUpperCase() === 'ACTIVE' ? 0 : 1)
  return [...dossiers].sort(
    (a, b) =>
      running(a) - running(b) ||
      b.lastMove.localeCompare(a.lastMove) ||
      a.id.localeCompare(b.id),
  )
}
