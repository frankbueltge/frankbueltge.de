// src/lib/study/answers.ts — one reader's answers to a study, checked against its manifest (2026-10-27).
//
// The same check runs in the consent frame, before the reader sees the summary of what will be sent,
// and at the endpoint, before anything is stored: a refusal is never a surprise after the button.
// Every question may be left out (null); at least one must be answered.
//
//   choice    one of the options, as written
//   multi     a list of distinct options, at most `max`; kept in the manifest's order
//   scale     an integer from min to max
//   number    a number from min to max, with at most two decimals (more would be digits the reader
//             may not notice in the summary)
//   pairwise  [left, right, pick] per pair: pick 0 left, 1 right, 2 equally, null can't say. No time:
//             a time the work measures is a number the reader cannot check, so it could carry anything.
//             Kept with each pair's items in id order and the pairs sorted, so neither the side an item
//             was shown on nor the order of the pairs is kept: both are invisible to the reader
//   order     every item id, once, most important first
//   text      at most max_length characters, checked by the text gate before it is stored; control and
//             invisible characters are removed first, so what is stored is what the reader saw
import { CONTROL_CHARS, INVISIBLE_CHARS, LIMITS, type Question, type StudyManifest } from './manifest'

export type PairTuple = [string, string, 0 | 1 | 2 | null]
export type Answer = string | string[] | number | PairTuple[] | null
export type Answers = Record<string, Answer>

const CONTROL_ALL = new RegExp(CONTROL_CHARS.source, 'gu')
const INVISIBLE_ALL = new RegExp(INVISIBLE_CHARS.source, 'gu')
/** A written answer as it is kept: line breaks and control characters become spaces, invisible
 *  characters go, the rest is composed (NFC) and trimmed. */
export const cleanText = (s: string): string => s.replace(CONTROL_ALL, ' ').replace(INVISIBLE_ALL, '').normalize('NFC').replace(/ {2,}/g, ' ').trim()

const pairKey = (a: string, b: string): string => (a < b ? `${a}|${b}` : `${b}|${a}`)
const flip = (pick: PairTuple[2]): PairTuple[2] => (pick === 0 ? 1 : pick === 1 ? 0 : pick)

/** An answer as it is kept and shown back: nothing in it the reader could not see. */
function canonical(q: Question, a: Answer): Answer {
  if (a === null) return null
  switch (q.kind) {
    case 'text':
      return cleanText(a as string)
    case 'multi':
      return [...(a as string[])].sort((x, y) => q.options.indexOf(x) - q.options.indexOf(y))
    case 'pairwise':
      return (a as PairTuple[])
        .map(([l, r, pick]): PairTuple => (l < r ? [l, r, pick] : [r, l, flip(pick)]))
        .sort((x, y) => {
          const a = pairKey(x[0], x[1])
          const b = pairKey(y[0], y[1])
          return a < b ? -1 : a > b ? 1 : 0
        })
    default:
      return a
  }
}

function answerOk(q: Question, a: Answer): boolean {
  if (a === null) return true
  switch (q.kind) {
    case 'choice':
      return typeof a === 'string' && q.options.includes(a)
    case 'multi': {
      if (!Array.isArray(a) || a.length < 1 || a.length > (q.max ?? q.options.length)) return false
      return a.every((o) => typeof o === 'string' && q.options.includes(o)) && new Set(a as string[]).size === a.length
    }
    case 'scale':
      return Number.isInteger(a) && (a as number) >= q.min && (a as number) <= q.max
    case 'number':
      return typeof a === 'number' && Number.isFinite(a) && a >= q.min && a <= q.max && Math.abs(a * 100 - Math.round(a * 100)) < 1e-6
    case 'pairwise': {
      if (!Array.isArray(a) || a.length < 1 || a.length > q.pairs) return false
      const ids = new Set(q.items.map((i) => i.id))
      const seen = new Set<string>()
      for (const p of a as unknown[]) {
        if (!Array.isArray(p) || p.length !== 3) return false
        const [l, r, pick] = p as unknown[]
        if (typeof l !== 'string' || typeof r !== 'string' || l === r || !ids.has(l) || !ids.has(r)) return false
        if (!(pick === 0 || pick === 1 || pick === 2 || pick === null)) return false
        const k = pairKey(l, r)
        if (seen.has(k)) return false
        seen.add(k)
      }
      return true
    }
    case 'order': {
      if (!Array.isArray(a) || a.length !== q.items.length) return false
      const ids = q.items.map((i) => i.id)
      return new Set(a as string[]).size === ids.length && (a as unknown[]).every((x) => typeof x === 'string' && ids.includes(x))
    }
    case 'text':
      return typeof a === 'string' && cleanText(a).length > 0 && cleanText(a).length <= (q.max_length ?? LIMITS.text)
  }
}

export type AnswerCheck = { ok: true; value: Answers } | { ok: false; reason: 'answers'; question?: string }

/** Refuses, never repairs: an unknown question, a malformed answer, or nothing answered at all. */
export function checkAnswers(m: Pick<StudyManifest, 'questions'>, raw: unknown): AnswerCheck {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { ok: false, reason: 'answers' }
  const given = raw as Record<string, unknown>
  const byId = new Map(m.questions.map((q) => [q.id, q]))
  for (const k of Object.keys(given)) if (!byId.has(k)) return { ok: false, reason: 'answers', question: k }
  const out: Answers = {}
  let answered = 0
  for (const q of m.questions) {
    const a = (Object.hasOwn(given, q.id) ? (given[q.id] ?? null) : null) as Answer
    if (!answerOk(q, a)) return { ok: false, reason: 'answers', question: q.id }
    out[q.id] = canonical(q, a)
    if (a !== null) answered++
  }
  if (answered === 0) return { ok: false, reason: 'answers' }
  return { ok: true, value: out }
}

/** The free text of a set of answers, joined, for the one call to the text gate. Null when none. */
export function textOf(m: Pick<StudyManifest, 'questions'>, answers: Answers): string | null {
  const texts = m.questions.filter((q) => q.kind === 'text').map((q) => answers[q.id]).filter((a): a is string => typeof a === 'string' && a.length > 0)
  return texts.length ? texts.join('\n\n') : null
}

/** An answer as the consent frame shows it back before anything is sent. */
export function describeAnswer(q: Question, a: Answer): string {
  if (a === null) return 'left out'
  switch (q.kind) {
    case 'choice':
    case 'text':
      return String(a)
    case 'multi':
      return (a as string[]).join('; ')
    case 'scale':
    case 'number':
      return `${a}${q.kind === 'number' && q.unit ? ` ${q.unit}` : ''}`
    case 'pairwise': {
      // every pair, with its pick: the reader sees all that is sent
      const label = new Map(q.items.map((i) => [i.id, i.label]))
      return (a as PairTuple[])
        .map(([l, r, pick]) => {
          const L = label.get(l)
          const R = label.get(r)
          return pick === 0 ? `${L} over ${R}` : pick === 1 ? `${R} over ${L}` : pick === 2 ? `${L} and ${R} equally` : `${L} or ${R}: can’t say`
        })
        .join('; ')
    }
    case 'order': {
      const label = new Map(q.items.map((i) => [i.id, i.label]))
      return (a as string[]).map((id) => label.get(id)).join(' › ')
    }
  }
}
