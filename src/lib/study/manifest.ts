// src/lib/study/manifest.ts — a practice's study: the file it lays beside its work (2026-10-27).
//
// Frank's decision of 2026-10-27 (wording private; design doc docs/design/2026-10-27-practice-studies.md):
// the works of the Atelier, the Field and the Studio may ask the people who see them. A practice
// declares what its work asks in `study.json`, next to the work's `index.html` in `works/<slug>/` of its
// own repository; the integrate mirrors it with the work to `public/<ns>/werke-html/<slug>/study.json`,
// where it is served like every file of a published work. Nothing a manifest declares runs before the
// house's check has passed exactly that file (src/lib/study/check.ts, since 2026-10-28; until then the
// architect approved each file).
//
// A manifest says what is asked, why, and how the answers will be read. It cannot ask for a name, an
// address, an e-mail, an age or anything else that identifies a person: there is no question kind for
// it, and free text passes the reception's text gate, which refuses personal data of third parties.
// The practices' guide is docs/studies/GUIDE.md; this file is its contract.

export const MANIFEST_CONTRACT = 'study/1'

export const STUDY_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const QUESTION_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/
const ITEM_ID = /^[a-z0-9][a-z0-9_-]{0,31}$/
const DAY = /^\d{4}-\d{2}-\d{2}$/

export const LIMITS = {
  /** the file's size in bytes: with every field at its limit a manifest stays below this, and the
   *  pull request that shows it twice stays below GitHub's limit for a body */
  bytes: 20 * 1024,
  idLength: 80,
  title: 80,
  question: 300,
  purpose: 400,
  reading: 600,
  prompt: 300,
  option: 120,
  questions: 12,
  options: 12,
  pairItems: 20,
  orderItems: 10,
  /** a `marks` question: one number per item, enough for a work that asks about a whole vocabulary */
  markItems: 30,
  text: 280,
} as const

export interface Item {
  id: string
  label: string
}

export type Question =
  | { id: string; kind: 'choice'; prompt: string; options: string[] }
  | { id: string; kind: 'multi'; prompt: string; options: string[]; max?: number }
  | { id: string; kind: 'scale'; prompt: string; min: number; max: number; labels?: [string, string] }
  | { id: string; kind: 'number'; prompt: string; min: number; max: number; unit?: string }
  | { id: string; kind: 'pairwise'; prompt: string; items: Item[]; pairs: number }
  | { id: string; kind: 'order'; prompt: string; items: Item[] }
  | { id: string; kind: 'marks'; prompt: string; items: Item[]; min: number; max: number; unit?: string }
  | { id: string; kind: 'text'; prompt: string; max_length?: number }

export type QuestionKind = Question['kind']
export const QUESTION_KINDS: readonly QuestionKind[] = ['choice', 'multi', 'scale', 'number', 'pairwise', 'order', 'marks', 'text']

export interface StudyManifest {
  $contract: typeof MANIFEST_CONTRACT
  id: string
  title: string
  /** the research question the practice asks of the answers */
  question: string
  /** why this work asks the people who see it — shown, word for word, in the house's consent frame */
  purpose: string
  /** how the practice will read the answers, decided before the first one comes */
  reading: string
  questions: Question[]
  /** the last day the study takes answers (optional) */
  closes?: string
}

/** What a manifest may not hold and a written answer loses. Control characters, line breaks included,
 *  and the line and paragraph separators; and every invisible character: format characters such as
 *  zero-width spaces and direction marks, and the default-ignorable ones such as variation selectors.
 *  A manifest is read by the house's check and shown to every reader, and an answer is shown back to
 *  its reader before it is sent, so nothing in either may be there without being seen. */
export const CONTROL_CHARS = /[\u0000-\u001f\u007f-\u009f\u2028\u2029]/u
export const INVISIBLE_CHARS = /[\p{Cf}\p{Default_Ignorable_Code_Point}]/u
const HIDDEN_CHARS = new RegExp(`${CONTROL_CHARS.source}|${INVISIBLE_CHARS.source}`, 'u')

const codePoint = (c: string): string => `U+${c.codePointAt(0)!.toString(16).toUpperCase().padStart(4, '0')}`

/** Every string of the manifest, wherever it stands, checked for what cannot be seen. */
function hiddenProblems(v: unknown, where: string, out: string[]): void {
  if (typeof v === 'string') {
    const hit = HIDDEN_CHARS.exec(v)
    if (hit) out.push(`${where || 'a string'}: ${codePoint(hit[0])} at character ${hit.index + 1}; a manifest's text is visible characters on one line`)
  } else if (Array.isArray(v)) v.forEach((x, i) => hiddenProblems(x, `${where}[${i}]`, out))
  else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) hiddenProblems(x, where ? `${where}.${k}` : k, out)
}

const str = (v: unknown, max: number): v is string => typeof v === 'string' && v.trim().length > 0 && v.length <= max
const int = (v: unknown): v is number => Number.isInteger(v)
const num = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)

/** The fields each kind of question may carry; anything else is refused, so a file cannot grow past
 *  what the frame shows and the house's check reads. */
const QUESTION_FIELDS: Record<QuestionKind, readonly string[]> = {
  choice: ['options'],
  multi: ['options', 'max'],
  scale: ['min', 'max', 'labels'],
  number: ['min', 'max', 'unit'],
  pairwise: ['items', 'pairs'],
  order: ['items'],
  marks: ['items', 'min', 'max', 'unit'],
  text: ['max_length'],
}

const unknownFields = (where: string, o: object, known: readonly string[]): string[] =>
  Object.keys(o)
    .filter((k) => !known.includes(k))
    .map((k) => `${where}: unknown field ${JSON.stringify(k)}`)

function itemProblems(where: string, items: unknown, min: number, max: number): string[] {
  if (!Array.isArray(items) || items.length < min || items.length > max) return [`${where}: ${min} to ${max} items`]
  const out: string[] = []
  const seen = new Set<string>()
  for (const it of items as Item[]) {
    if (it && typeof it === 'object') out.push(...unknownFields(`${where}: item ${String(it.id)}`, it, ['id', 'label']))
    if (!it || typeof it !== 'object' || typeof it.id !== 'string' || !ITEM_ID.test(it.id) || seen.has(it.id)) out.push(`${where}: item id ${String(it?.id)}`)
    else seen.add(it.id)
    if (!str(it?.label, LIMITS.option)) out.push(`${where}: label of ${String(it?.id)}`)
  }
  return out
}

function optionProblems(where: string, options: unknown): string[] {
  if (!Array.isArray(options) || options.length < 2 || options.length > LIMITS.options) return [`${where}: 2 to ${LIMITS.options} options`]
  if (!options.every((o) => str(o, LIMITS.option))) return [`${where}: every option is text of at most ${LIMITS.option} characters`]
  if (new Set(options).size !== options.length) return [`${where}: options repeat`]
  return []
}

function questionProblems(q: Question, i: number): string[] {
  const where = `question ${i + 1}${typeof q?.id === 'string' ? ` (${q.id})` : ''}`
  if (!q || typeof q !== 'object') return [`${where}: not an object`]
  const out: string[] = []
  if (typeof q.id !== 'string' || !QUESTION_ID.test(q.id)) out.push(`${where}: id`)
  if (!str(q.prompt, LIMITS.prompt)) out.push(`${where}: prompt of at most ${LIMITS.prompt} characters`)
  switch (q.kind) {
    case 'choice':
      out.push(...optionProblems(where, q.options))
      break
    case 'multi':
      out.push(...optionProblems(where, q.options))
      if (q.max !== undefined && (!int(q.max) || q.max < 1 || q.max > (q.options?.length ?? 0))) out.push(`${where}: max`)
      break
    case 'scale':
      if (!int(q.min) || !int(q.max) || q.max - q.min < 1 || q.max - q.min > 10) out.push(`${where}: a scale of 2 to 11 steps`)
      if (q.labels !== undefined && (!Array.isArray(q.labels) || q.labels.length !== 2 || !q.labels.every((l) => str(l, LIMITS.option)))) out.push(`${where}: two labels`)
      break
    case 'number':
      if (!num(q.min) || !num(q.max) || q.min >= q.max) out.push(`${where}: a range`)
      if (q.unit !== undefined && !str(q.unit, 40)) out.push(`${where}: unit`)
      break
    case 'pairwise': {
      out.push(...itemProblems(where, q.items, 3, LIMITS.pairItems))
      const n = Array.isArray(q.items) ? q.items.length : 0
      if (!int(q.pairs) || q.pairs < 1 || q.pairs > (n * (n - 1)) / 2 || q.pairs > 45) out.push(`${where}: pairs`)
      break
    }
    case 'order':
      out.push(...itemProblems(where, q.items, 2, LIMITS.orderItems))
      break
    case 'marks':
      out.push(...itemProblems(where, q.items, 2, LIMITS.markItems))
      if (!num(q.min) || !num(q.max) || q.min >= q.max) out.push(`${where}: a range`)
      if (q.unit !== undefined && !str(q.unit, 40)) out.push(`${where}: unit`)
      break
    case 'text':
      if (q.max_length !== undefined && (!int(q.max_length) || q.max_length < 10 || q.max_length > LIMITS.text)) out.push(`${where}: max_length of 10 to ${LIMITS.text}`)
      break
    default:
      out.push(`${where}: kind must be one of ${QUESTION_KINDS.join(', ')}`)
  }
  if (QUESTION_KINDS.includes(q.kind)) out.push(...unknownFields(where, q, ['id', 'kind', 'prompt', ...QUESTION_FIELDS[q.kind]]))
  return out
}

/** Every rule a manifest must keep, as a list of complaints (empty = valid). The complaints go back
 *  to the practice in its feedback folder, so they are written for whoever wrote the file. */
export function manifestProblems(m: unknown): string[] {
  const s = m as StudyManifest
  if (!s || typeof s !== 'object' || Array.isArray(s)) return ['not a JSON object']
  const out: string[] = []
  if (s.$contract !== MANIFEST_CONTRACT) out.push(`$contract must be "${MANIFEST_CONTRACT}"`)
  if (typeof s.id !== 'string' || !STUDY_ID.test(s.id) || s.id.length < 3 || s.id.length > LIMITS.idLength) out.push('id: lowercase words joined by hyphens, 3 to 80 characters, beginning with the practice (atelier-, field-, studio-, error-as-method-)')
  hiddenProblems(s, '', out)
  if (!str(s.title, LIMITS.title)) out.push(`title of at most ${LIMITS.title} characters`)
  if (!str(s.question, LIMITS.question)) out.push(`question of at most ${LIMITS.question} characters`)
  if (!str(s.purpose, LIMITS.purpose)) out.push(`purpose of at most ${LIMITS.purpose} characters`)
  if (!str(s.reading, LIMITS.reading)) out.push(`reading of at most ${LIMITS.reading} characters`)
  if (s.closes !== undefined && (typeof s.closes !== 'string' || !DAY.test(s.closes))) out.push('closes: a day, YYYY-MM-DD')
  if (!Array.isArray(s.questions) || s.questions.length < 1 || s.questions.length > LIMITS.questions) {
    out.push(`questions: 1 to ${LIMITS.questions}`)
    return out
  }
  const ids = new Set<string>()
  s.questions.forEach((q, i) => {
    out.push(...questionProblems(q, i))
    if (typeof q?.id === 'string') {
      if (ids.has(q.id)) out.push(`question ${i + 1}: id ${q.id} repeats`)
      ids.add(q.id)
    }
  })
  const known = new Set(['$contract', 'id', 'title', 'question', 'purpose', 'reading', 'questions', 'closes'])
  for (const k of Object.keys(s)) if (!known.has(k)) out.push(`unknown field: ${JSON.stringify(k)}`)
  return out
}

/** Whether a study still takes answers on `day` (YYYY-MM-DD). */
export const isClosed = (m: Pick<StudyManifest, 'closes'>, day: string): boolean => m.closes !== undefined && day > m.closes

/** Whether answering the study can include free text, which needs the text gate. */
export const hasText = (m: Pick<StudyManifest, 'questions'>): boolean => m.questions.some((q) => q.kind === 'text')
