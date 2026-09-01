// A markdown-lite reading of a bulletin, for the practice stations (2026-09-01).
//
// The entrance renders bulletins as a <pre> — honest, but a station gives its practice's
// bulletin the whole panel, and forty lines of raw markdown asterisks there would show the
// reader the practice's file format instead of the practice's sentences. So this module reads
// the little structure the bulletins actually use — headings, list items, paragraphs — and
// hands each block's inline text to segments() from middle.ts, which splits out the `**bold**`
// and `` `code` `` the practice itself wrote.
//
// Rendering emphasis the practice itself put there is not paraphrase — the same honesty
// argument middle.ts makes: dropping the bold would LOSE information (the practices use it to
// mark the lead claim), and the text between the marks stays verbatim. Everything stays a
// Segment, never HTML: the input is a mirrored file, and this house does not inject markup it
// did not write — an Astro template renders segment text as text nodes, escaped.
import { segments, type Segment } from './middle'

export type BulletinBlock =
  | { kind: 'heading'; level: 1 | 2; segments: Segment[] }
  | { kind: 'listItem'; segments: Segment[] }
  | { kind: 'para'; segments: Segment[] }

const BULLET_RE = /^\s*[-*]\s+(.*)$/
/** The bulletins number their sibling items ("1. …"); the marker is the practice's own
 *  ordering and is kept in the text rather than stripped into a browser's list counter. */
const NUMBERED_RE = /^\s*\d+\.\s+\S/
const HEADING_RE = /^(#{1,2})\s+(.*)$/
/** A continuation line: indented, non-blank, and not itself a new item. */
const CONTINUATION_RE = /^\s+\S/

const isItemStart = (line: string): boolean => BULLET_RE.test(line) || NUMBERED_RE.test(line)

/** Single-asterisk emphasis, which segments() deliberately does not carry. The bulletins use it
 *  — sometimes closing flush against a bold marker (`*…?***`) — and left alone it renders as
 *  literal asterisks, showing the reader the file format instead of the sentence. Normalised
 *  away the way firstClause() already does for board rows: the words stay, the marker goes.
 *  (Bold and code are different: those segments() keeps, because the practices use them to mark
 *  the lead claim — see the header note.) */
const ITALIC_RE = /(?<!\*)\*(?!\s|\*)([^*]+?)(?<!\s)\*(?=$|[^*]|\*\*)/g

const tidy = (text: string): string =>
  text.replace(/\s+/g, ' ').trim().replace(ITALIC_RE, '$1')

/** The bulletin's blocks, in order. Minimal by design: headings (`#`/`##`), list items
 *  (`-`/`*`/numbered), paragraphs, blank-line separation — the shapes the three bulletins
 *  actually use. Anything else is a paragraph, verbatim. */
export function bulletinBlocks(text: string): BulletinBlock[] {
  const out: BulletinBlock[] = []
  const lines = text.split('\n')
  let para: string[] = []

  const flush = (): void => {
    if (para.length === 0) return
    out.push({ kind: 'para', segments: segments(tidy(para.join(' '))) })
    para = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!
    if (!line.trim()) {
      flush()
      continue
    }
    const heading = HEADING_RE.exec(line)
    if (heading) {
      flush()
      out.push({
        kind: 'heading',
        level: heading[1]!.length as 1 | 2,
        segments: segments(tidy(heading[2]!)),
      })
      continue
    }
    if (isItemStart(line)) {
      flush()
      const bullet = BULLET_RE.exec(line)
      let item = bullet ? bullet[1]! : line.trim()
      while (
        i + 1 < lines.length &&
        CONTINUATION_RE.test(lines[i + 1]!) &&
        !isItemStart(lines[i + 1]!)
      ) {
        item += ` ${lines[++i]!.trim()}`
      }
      out.push({ kind: 'listItem', segments: segments(tidy(item)) })
      continue
    }
    para.push(line.trim())
  }
  flush()
  return out
}
