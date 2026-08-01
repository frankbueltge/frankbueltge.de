// requestHead.ts — the structured request head (Steuerzentrale v2, P1;
// docs/design/2026-08-01-steuerzentrale-v2.md §2). Practices open every request to Frank
// with a four-line head — self-declared triage, no second AI layer interpreting foreign
// text. This parser renders what the sender declared and invents nothing: a missing head
// yields structured:false and a first-sentences fallback, marked as such in the UI.
//
// Tolerated syntax (the writers are machines, but their markdown habits differ):
//   > tl;dr: one sentence          — blockquote marker optional, `**bold**` stripped,
//   > braucht: entscheidung (a | b)  keys case-insensitive, `tldr`/`tl;dr` both fine.
//   > frist: 2026-08-28 …
//   > kontext: what preceded + path#heading
// English value aliases are accepted (decision/answer/reply/forward/none/fyi/nothing) —
// the practices write English; the German tokens are the protocol vocabulary.

export type Braucht = 'entscheidung' | 'antwort' | 'weiterleitung' | 'nichts'

export interface RequestHead {
  /** True once at least tl;dr AND braucht were found — the minimum for triage. */
  structured: boolean
  tlDr: string | null
  braucht: Braucht | null
  /** For braucht: entscheidung — the sender's named options, if any. */
  optionen: string[]
  /** The frist line verbatim (may be prose like "keine — schweigen gilt …"). */
  frist: string | null
  /** First ISO date found in the frist line, for sorting/countdowns. */
  fristDate: string | null
  kontext: string | null
}

const HEAD_SCAN_LINES = 30

const BRAUCHT_ALIASES: Record<string, Braucht> = {
  entscheidung: 'entscheidung',
  decision: 'entscheidung',
  antwort: 'antwort',
  answer: 'antwort',
  reply: 'antwort',
  weiterleitung: 'weiterleitung',
  forward: 'weiterleitung',
  forwarding: 'weiterleitung',
  nichts: 'nichts',
  none: 'nichts',
  nothing: 'nichts',
  fyi: 'nichts',
}

/** Strip blockquote markers, bold/emphasis asterisks and surrounding whitespace. */
const clean = (line: string): string =>
  line.replace(/^\s*>+\s?/, '').replace(/\*+/g, '').trim()

const keyValue = (line: string): { key: string; value: string } | null => {
  const m = clean(line).match(/^([a-zäöü;/]+)\s*:\s*(.*)$/i)
  if (!m) return null
  return { key: m[1].toLowerCase().replace(/[;/]/g, ''), value: m[2].trim() }
}

export function parseRequestHead(body: string): RequestHead {
  const head: RequestHead = {
    structured: false,
    tlDr: null,
    braucht: null,
    optionen: [],
    frist: null,
    fristDate: null,
    kontext: null,
  }
  const lines = body.split('\n').slice(0, HEAD_SCAN_LINES)
  for (const line of lines) {
    const kv = keyValue(line)
    if (!kv || !kv.value) continue
    switch (kv.key) {
      case 'tldr':
        if (head.tlDr === null) head.tlDr = kv.value
        break
      case 'braucht':
      case 'needs': {
        if (head.braucht !== null) break
        const m = kv.value.match(/^([a-zäöü]+)\s*(.*)$/i)
        const token = m ? BRAUCHT_ALIASES[m[1].toLowerCase()] : undefined
        if (!token) break
        head.braucht = token
        if (token === 'entscheidung' && m && m[2]) {
          head.optionen = m[2]
            .replace(/^[(\[<]|[)\]>]$/g, '')
            .split('|')
            .map((o) => o.trim())
            .filter(Boolean)
        }
        break
      }
      case 'frist':
      case 'deadline':
        if (head.frist === null) {
          head.frist = kv.value
          head.fristDate = kv.value.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? null
        }
        break
      case 'kontext':
      case 'context':
        if (head.kontext === null) head.kontext = kv.value
        break
    }
  }
  head.structured = head.tlDr !== null && head.braucht !== null
  return head
}

/** Fallback for headless (old-style) requests: the first sentences of the body, markdown
 * lightly stripped. Marked "unstrukturiert (alt)" by the UI — never passed off as a tl;dr. */
export function fallbackSummary(body: string, sentences = 2, maxLen = 240): string {
  // Hard input cap BEFORE the sentence regex: two sentences never need more than the first
  // few thousand characters, and the sentence pattern backtracks quadratically on huge
  // punctuation-free bodies (found by the inbox cap test — 12k-char requests are real).
  const text = body
    .slice(0, 4000)
    .split('\n')
    .map((l) => clean(l))
    .filter((l) => l && !/^#/.test(l))
    .join(' ')
    .replace(/\s+/g, ' ')
  const parts = text.match(/[^.!?]+[.!?]+(\s|$)/g)
  const summary = parts ? parts.slice(0, sentences).join('').trim() : text
  return summary.length > maxLen ? `${summary.slice(0, maxLen - 1)}…` : summary
}
