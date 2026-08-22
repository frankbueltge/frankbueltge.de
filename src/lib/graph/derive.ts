// src/lib/graph/derive.ts — the readers. Text in, facts out, nothing invented.
//
// Each function here takes the CONTENT of one committed file and returns what that file
// actually says. They are pure (no fs, no dates, no network) so the test can feed them the
// real files and compare against the committed graph, and so a parser that starts guessing
// shows up as a failing quote rather than as a plausible line on a page.

/** One bullet under "(b) Nearest neighbors" in the USP audit. */
export interface AuditNeighbor {
  /** display name — markdown links flattened to their text */
  label: string
  url?: string
  /** the audit's characterisation, the part after the em dash */
  note: string
  /** the whole bullet as it stands in the file — this is what the honesty test checks */
  raw: string
}

/** One numbered section of docs/audits/2026-08-09-usp-audit.md. */
export interface AuditEntry {
  number: number
  title: string
  /** the route the section names in backticks — the join key to src/data/werke.ts */
  route: string
  verdictClass: 'UNIQUE' | 'ADDED VALUE' | 'REDUNDANT'
  /** the verdict sentence, verbatim */
  verdictLabel: string
  /** the (d) paragraph — where the audit names the daylight, verbatim */
  direction: string
  neighbors: AuditNeighbor[]
}

/** One row of docs/decision-log.md. */
export interface DecisionRow {
  date: string
  /** the row's first bold run — the decision in its own words, verbatim */
  title: string
  /** decision cell + evidence cell, for locator scanning */
  body: string
}

const NEIGHBOR_SPLIT = ' — '

/** `[text](url)` → `text`, everywhere. */
export function flattenLinks(text: string): string {
  return text.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '$1')
}

/** The graph stores the audit's own markdown, verbatim, because that is what the honesty test
 *  checks against the file. A PAGE must not print asterisks and bracket syntax at a reader, so
 *  rendering flattens: links to their text, emphasis to plain words. Nothing is added, nothing
 *  is reordered — only markup is dropped. */
export function readable(text: string): string {
  return flattenLinks(text)
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/(^|[\s(“"])\*([^*]+)\*(?=[\s.,;:)”"]|$)/g, '$1$2')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** First url in a markdown link, if the fragment carries one. */
function firstUrl(text: string): string | undefined {
  return /\[[^\]]+\]\(([^)\s]+)\)/.exec(text)?.[1]
}

function parseNeighborBullet(raw: string): AuditNeighbor | undefined {
  const body = raw.replace(/^-\s+/, '').trim()
  // A bullet that opens with a link: take the link whole, then split the remainder, so an em
  // dash INSIDE the link text ("EU JRC — AI Watch") cannot be mistaken for the separator.
  const lead = /^\[([^\]]+)\]\(([^)\s]+)\)/.exec(body)
  if (lead) {
    const rest = body.slice(lead[0].length)
    const at = rest.indexOf(NEIGHBOR_SPLIT)
    if (at === -1) return undefined
    return {
      label: flattenLinks(lead[1]).trim(),
      url: lead[2],
      note: rest.slice(at + NEIGHBOR_SPLIT.length).trim(),
      raw: body,
    }
  }
  const at = body.indexOf(NEIGHBOR_SPLIT)
  if (at === -1) return undefined
  const head = body.slice(0, at)
  return {
    label: flattenLinks(head).trim(),
    url: firstUrl(head),
    note: body.slice(at + NEIGHBOR_SPLIT.length).trim(),
    raw: body,
  }
}

/** Read the audit's numbered sections. Sections without a (b)/(c)/(d) triple are skipped —
 *  the header matter and the scoreboard are not entries. */
export function parseAudit(markdown: string): AuditEntry[] {
  const entries: AuditEntry[] = []
  const sections = markdown.split(/^## /m).slice(1)

  for (const section of sections) {
    const head = /^(\d+)\.\s+(.+?)\s+\(`([^`]+)`\)\s*$/m.exec(section.split('\n')[0])
    if (!head) continue
    const [, number, title, route] = head

    const blocks = section.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean)
    const neighbors: AuditNeighbor[] = []
    let verdictLabel = ''
    let direction = ''

    for (const block of blocks) {
      if (block.startsWith('**(b)')) {
        for (const line of block.split('\n')) {
          if (!line.startsWith('- ')) continue
          const parsed = parseNeighborBullet(line)
          if (parsed) neighbors.push(parsed)
        }
      } else if (block.startsWith('**(c)')) {
        const flat = block.replace(/\s*\n\s*/g, ' ')
        verdictLabel = /^\*\*\(c\)\s*Draft verdict:\s*([\s\S]*?)\*\*/.exec(flat)?.[1]?.trim() ?? ''
      } else if (block.startsWith('**(d)')) {
        const flat = block.replace(/\s*\n\s*/g, ' ')
        direction = /^\*\*\(d\)[^*]*\*\*\s*([\s\S]*)$/.exec(flat)?.[1]?.trim() ?? ''
      }
    }

    const verdictClass = /^(UNIQUE|ADDED VALUE|REDUNDANT)/.exec(verdictLabel)?.[1] as
      | AuditEntry['verdictClass']
      | undefined
    if (!verdictClass || !direction || neighbors.length === 0) continue

    entries.push({
      number: Number(number),
      title: title.trim(),
      route,
      verdictClass,
      verdictLabel,
      direction,
      neighbors,
    })
  }
  return entries
}

/** Rows of the decision log that LOOK like entries but do not parse.
 *
 *  Added 2026-08-09 after a silent loss: a row written as `| 2026-08-09 (evening) |` was
 *  skipped by the reader below without a word, the suite stayed green, and the decision was
 *  simply absent from the graph. A parser that drops what it cannot read is worse than one
 *  that fails — the failure is visible, the drop is not. This names the drops so a test can
 *  refuse them; the reader itself stays a pure `continue`, because a build that dies on a
 *  stray pipe in a prose cell would be its own kind of nuisance.
 *
 *  A table line is suspicious when it is not the header, not the separator, and its first
 *  cell is not a bare ISO date. Everything else — prose, lists, fenced blocks — is not a
 *  table line and is none of this function's business. */
export function malformedDecisionRows(markdown: string): string[] {
  const bad: string[] = []
  for (const line of markdown.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed.startsWith('|') || trimmed.split('|').length < 3) continue
    if (/^\|[\s:-]+\|/.test(trimmed)) continue
    const first = trimmed.split('|')[1]?.trim() ?? ''
    if (first === 'Date' || first === '') continue
    if (/^\d{4}-\d{2}-\d{2}$/.test(first)) continue
    bad.push(trimmed.slice(0, 120))
  }
  return bad
}

/** Read the decision log's table. One row = one dated approval. */
export function parseDecisionLog(markdown: string): DecisionRow[] {
  const rows: DecisionRow[] = []
  for (const line of markdown.split('\n')) {
    if (!/^\|\s*\d{4}-\d{2}-\d{2}\s*\|/.test(line)) continue
    const cells = line.split('|').map((c) => c.trim())
    // cells[0] is the empty string before the leading pipe; a cell carrying its own pipe would
    // shift the tail, so everything past the date is treated as one body rather than indexed.
    const date = cells[1]
    const body = cells.slice(2).join(' | ')
    const title = /\*\*(.+?)\*\*/s.exec(body)?.[1]?.trim() ?? body.split('.')[0].trim()
    rows.push({ date, title, body })
  }
  return rows
}

/** One entry of src/data/post/ledger.json (only the fields the graph reads — the ledger's
 *  channel field carries real people's addresses and is deliberately NOT taken into the
 *  graph: the relation is the fact, the address is not this instrument's business). */
export interface LedgerEntry {
  id?: string
  practice?: string
  piece?: string
  receiver?: string
  status?: string
}

/** Split an identifier the way this repo writes them: paths, routes, camelCase file names all
 *  become lowercase word tokens, so `ConsensusPage.astro` and `/consensus` meet as `consensus`. */
export function tokens(identifier: string): Set<string> {
  return new Set(
    identifier
      .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter(Boolean),
  )
}

/** Every in-repo path a decision row names. These are the locators an edge may be built on —
 *  free prose is deliberately not scanned, because "correction" is an ordinary English word
 *  and an experiment called Correction would otherwise collect edges it never earned. */
export function repoPathsIn(text: string): string[] {
  // Brace groups are part of the path on purpose: this log writes three sibling files as
  // `src/content/{atelier,field,studio}/PROTOCOL.md`, and stopping at the brace would drop the
  // three practices the row is actually about.
  const found = text.match(/(?:src|docs|pipelines|scripts|public|functions|\.github)\/[A-Za-z0-9._/{},-]+/g) ?? []
  return [...new Set(found.map((p) => p.replace(/[.,;:)]+$/, '')))]
}
