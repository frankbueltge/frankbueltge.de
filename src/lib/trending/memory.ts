/** The ledger's memory, read on the site (reading aids, 2026-11-14).
 *
 *  When the pipeline writes a topic it asks its own archive whether it has seen the topic before,
 *  and writes the answer as `first_seen` and `days_hot`. The rule it asks by is short
 *  (pipelines/trending/src/trending/converge.py, `_memory`): an earlier topic is the same topic
 *  when its id is the same, or when the two labels share enough of their words.
 *
 *  The "What stayed" grid draws those mornings, so it has to ask by the same rule. Matching by id
 *  alone was tried first and left out more than a quarter of the runs the ledger itself counts:
 *  a topic is often named by a different source on its second morning ("gloria steinem", then
 *  "Death of Gloria Steinem"), which gives it a different id and the same words.
 *
 *  This module is that rule a second time, in the site's language. Two things keep the two
 *  readings from drifting apart:
 *
 *    · the stop words and the threshold are not copied. They are imported from the pipeline's own
 *      data files, so there is one list and one number;
 *    · memory.test.ts recomputes `first_seen` and `days_hot` for every topic of every committed
 *      day with the functions below and compares them with what the pipeline wrote.
 *
 *  Pure: no clock, no network, no DOM. It runs at build time only.
 */
import rules from '../../../pipelines/trending/src/trending/data/rules.json'
import stopwords from '../../../pipelines/trending/src/trending/data/stopwords.json'

/** Two labels are the same topic from this share of common words on (intersection over union). */
export const JACCARD_MIN: number = rules.jaccard_min

/** How many committed days the pipeline's memory reads back. */
export const MEMORY_DAYS: number = rules.memory_days

const STOPWORDS = new Set<string>(stopwords)

// 'TextureTuesday' → 'Texture Tuesday': the pipeline's own two lookarounds.
const CAMEL = /(?<=[a-z0-9])(?=[A-Z])|(?<=[A-Z])(?=[A-Z][a-z])/g
const WORD = /[\p{L}\p{N}]+/gu

const combiningCache = new Map<string, boolean>()

/** Whether a mark has a non-zero canonical combining class, which is what Python's
 *  `unicodedata.combining` asks and JavaScript has no property for.
 *
 *  Canonical ordering moves a mark only when its class is not zero, so two probes answer it: a
 *  mark of class 1 to 239 is sorted in front of U+0345 (class 240), and any mark above class 1
 *  lets U+0334 (class 1) pass in front of it. A mark of class zero does neither. The difference
 *  matters outside Latin script: a Devanagari vowel sign is a mark of class zero, the pipeline
 *  keeps it, and it then ends a word there exactly as it does here. */
function isCombining(mark: string): boolean {
  let known = combiningCache.get(mark)
  if (known === undefined) {
    const before = `aͅ${mark}`
    const after = `a${mark}̴`
    known = before.normalize('NFD') !== before || after.normalize('NFD') !== after
    combiningCache.set(mark, known)
  }
  return known
}

/** Strip diacritics: 'Páez' → 'Paez'. */
function fold(text: string): string {
  return text.normalize('NFKD').replace(/\p{M}/gu, (mark) => (isCombining(mark) ? '' : mark))
}

/** Python's `casefold`, as far as a label needs it: lower case, plus the two letters of everyday
 *  labels where `toLowerCase` and `casefold` part ways (ß, and the Greek final sigma). */
function casefold(text: string): string {
  return text.toLowerCase().replace(/ß/g, 'ss').replace(/ς/g, 'σ')
}

const tokenCache = new Map<string, ReadonlySet<string>>()

/** A label as its comparable words: accents folded, case folded, underscores and hyphens split,
 *  a spaceless CamelCase tag split, function words and one-character words dropped. */
export function labelTokens(label: string): ReadonlySet<string> {
  const held = tokenCache.get(label)
  if (held) return held
  let s = fold(label).replace(/_/g, ' ').replace(/-/g, ' ')
  // Python's str.strip() and `" " in`: only a plain space counts as the separator here.
  if (!s.trim().includes(' ')) s = s.replace(CAMEL, ' ')
  const words = casefold(s).match(WORD) ?? []
  const out = new Set(words.filter((w) => [...w].length > 1 && !STOPWORDS.has(w)))
  tokenCache.set(label, out)
  return out
}

/** Shared words over all words; 0 when either side has none. */
export function jaccard(a: ReadonlySet<string>, b: ReadonlySet<string>): number {
  if (a.size === 0 || b.size === 0) return 0
  let shared = 0
  for (const w of a) if (b.has(w)) shared++
  return shared / (a.size + b.size - shared)
}

export interface TopicName {
  id: string
  label: string
}

/** The memory's own question: is `earlier` the topic `topic` on another morning? */
export function sameTopic(topic: TopicName, earlier: TopicName): boolean {
  return earlier.id === topic.id || jaccard(labelTokens(topic.label), labelTokens(earlier.label)) >= JACCARD_MIN
}

export interface ArchivedDay {
  date: string
  topics: readonly TopicName[]
}

export interface Recall {
  /** the earliest morning in the archive that carried the topic, or `date` itself */
  firstSeen: string
  /** the unbroken run of calendar days up to and including `date` */
  daysHot: number
}

function dayBefore(iso: string): string {
  const d = new Date(`${iso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - 1)
  return d.toISOString().slice(0, 10)
}

/**
 * What the pipeline's memory says about a topic of `date`, given the committed days before it.
 *
 * `archive` is every committed day in any order; the function reads the last MEMORY_DAYS of them
 * dated strictly before `date`, as the pipeline does. The run is counted over CALENDAR days: a
 * morning with no file breaks it, exactly as in the pipeline.
 */
export function recallTopic(topic: TopicName, archive: readonly ArchivedDay[], date: string): Recall {
  const window = archive
    .filter((d) => d.date < date)
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-MEMORY_DAYS)
  const hits = new Set<string>()
  for (const day of window) {
    if (day.topics.some((t) => sameTopic(topic, t))) hits.add(day.date)
  }
  let firstSeen = date
  for (const d of hits) if (d < firstSeen) firstSeen = d
  let daysHot = 1
  for (let cursor = dayBefore(date); hits.has(cursor); cursor = dayBefore(cursor)) daysHot++
  return { firstSeen, daysHot }
}
