// src/lib/daylight/screen.ts — THE DAYLIGHT SCREEN: what this house has not checked about itself.
//
// The works register states a gap about its own contents, in its own words: prior art has been
// checked for three of ninety-nine works, and "a work without a note below is UNEXAMINED, NOT
// CLEARED". That sentence is honest and it has stood, unmoved, since the audit of 2026-08-09.
// Ninety-six works carry a novelty claim nobody has tested.
//
// The Atlas of Data Art is the other half of the arithmetic: five hundred-odd neighbouring works,
// each carrying one sentence — `decisive_move` — that says what the work actually DOES. That
// field is what makes this instrument possible. A catalogue of titles could only be searched by
// name; a catalogue of moves can be compared against a description of another move.
//
// So this module ranks. For every work the practices have made, it scores every Atlas entry and
// puts the nearest first. It converts ninety-six unexamined works into a queue with the most
// urgent at the top.
//
// WHAT IT IS NOT, and this is the whole of its integrity:
//
//   · It is a SCREEN, never a verdict. A high score means "examine this pair first". It does not
//     mean derivative, and the instrument never says a work is clear.
//   · Its false negatives are invisible and they are the dangerous half. A genuine neighbour that
//     happens to use different words scores low and sinks — and a sunk pair looks exactly like
//     daylight. A screen can raise a candidate; it can never certify an absence. Any surface
//     built on this module has to say so where the reader is, not in a footnote.
//   · Shared vocabulary is not a shared idea. Two works about satellites score high on "orbit"
//     and "sensor" while doing entirely unrelated things.
//
// WHY TF-IDF AND NOT AN EMBEDDING. An embedding is a model's output: it is not recomputable from
// committed data, it changes when the model changes, and a finding resting on it cannot be
// rechecked in ten years. This house's archive rule is that a finding must stay derivable from
// what is committed. Term frequency against inverse document frequency, over text that is in the
// repository, is twenty lines of arithmetic that will give the same answer forever. The measure
// is cruder than an embedding and that is the trade this house takes on purpose.

/** Words carrying no discriminating weight here. Deliberately short and stated rather than
 *  imported: a stoplist is a judgement about what does not count, and a judgement in a
 *  dependency is a judgement nobody reads. Anything else the corpus decides via idf. */
export const STOPWORDS: ReadonlySet<string> = new Set([
  'the', 'and', 'that', 'this', 'with', 'for', 'from', 'are', 'was', 'were', 'been', 'has', 'have',
  'had', 'not', 'but', 'its', 'their', 'they', 'them', 'which', 'when', 'what', 'who', 'whom',
  'how', 'why', 'into', 'onto', 'over', 'under', 'about', 'than', 'then', 'there', 'here', 'each',
  'every', 'both', 'all', 'any', 'one', 'two', 'three', 'more', 'most', 'other', 'such', 'own',
  'own', 'can', 'may', 'might', 'will', 'would', 'could', 'should', 'must', 'does', 'did', 'done',
  'being', 'also', 'only', 'very', 'much', 'many', 'some', 'these', 'those', 'through', 'between',
  'while', 'after', 'before', 'because', 'where', 'work', 'works', 'piece', 'project', 'installation',
])

/** The tokeniser, stated so a reader can reproduce it by hand: lowercase, cut on anything that is
 *  not a letter, keep tokens of three letters or more that are not in the stoplist. Digits are
 *  dropped — a year or a count is a fact about a work, not a term it shares with a neighbour. */
export function tokenise(text: string): string[] {
  return text
    .toLowerCase()
    .split(/[^a-zà-öø-ÿ]+/)
    .filter((t) => t.length >= 3 && !STOPWORDS.has(t))
}

export interface Doc {
  id: string
  text: string
}

/** A document's term weights, L2-normalised so cosine similarity is a plain dot product. */
type Vector = Map<string, number>

export interface Index {
  /** idf per term, over the whole corpus both sides were built from */
  idf: Map<string, number>
  vectors: Map<string, Vector>
  /** how many documents the index was built from — the denominator of every idf */
  size: number
}

/**
 * Build the index over BOTH sides at once. This matters and is easy to get wrong: idf computed
 * over the Atlas alone would treat a term common in this house's own vocabulary as rare, and
 * every work would look startlingly close to whichever entry shared it. One corpus, one idf.
 */
export function buildIndex(docs: readonly Doc[]): Index {
  const df = new Map<string, number>()
  const tokenised = docs.map((d) => {
    const tokens = tokenise(d.text)
    for (const t of new Set(tokens)) df.set(t, (df.get(t) ?? 0) + 1)
    return { id: d.id, tokens }
  })

  const size = docs.length
  const idf = new Map<string, number>()
  // Smoothed idf: +1 in numerator and denominator keeps a term appearing in every document at a
  // small positive weight rather than exactly zero, so a pair sharing only common terms still
  // scores above a pair sharing nothing at all.
  for (const [term, n] of df) idf.set(term, Math.log((size + 1) / (n + 1)) + 1)

  const vectors = new Map<string, Vector>()
  for (const { id, tokens } of tokenised) {
    const tf = new Map<string, number>()
    for (const t of tokens) tf.set(t, (tf.get(t) ?? 0) + 1)
    const v: Vector = new Map()
    let norm = 0
    for (const [term, count] of tf) {
      const w = (1 + Math.log(count)) * (idf.get(term) ?? 0)
      v.set(term, w)
      norm += w * w
    }
    norm = Math.sqrt(norm)
    if (norm > 0) for (const [term, w] of v) v.set(term, w / norm)
    vectors.set(id, v)
  }

  return { idf, vectors, size }
}

/** Cosine similarity of two indexed documents, 0…1. Iterates the shorter vector so the cost is
 *  bounded by the smaller document rather than by the corpus. */
export function similarity(index: Index, a: string, b: string): number {
  const va = index.vectors.get(a)
  const vb = index.vectors.get(b)
  if (!va || !vb) return 0
  const [small, large] = va.size <= vb.size ? [va, vb] : [vb, va]
  let dot = 0
  for (const [term, w] of small) {
    const other = large.get(term)
    if (other !== undefined) dot += w * other
  }
  return dot
}

export interface Neighbour {
  id: string
  score: number
  /** the terms doing the most work in this pairing, strongest first — the reason, shown */
  shared: string[]
}

/** How many shared terms a pairing shows. Enough to judge whether the score is about the subject
 *  or about the vocabulary, few enough to read in a line. */
const SHARED_SHOWN = 6

/**
 * The nearest `limit` candidates to `id` among `against`, strongest first.
 *
 * The tie-break on id is not cosmetic: dozens of pairings score identically at three decimals,
 * and a comparator that never returns 0 leaves their order to engine internals — which would make
 * the same committed data produce a different queue on the next build.
 */
export function nearest(index: Index, id: string, against: readonly string[], limit = 3): Neighbour[] {
  const self = index.vectors.get(id)
  if (!self) return []
  const scored = against
    .filter((other) => other !== id)
    .map((other) => {
      const v = index.vectors.get(other)
      const shared: [string, number][] = []
      if (v) {
        const [small, large] = self.size <= v.size ? [self, v] : [v, self]
        for (const [term, w] of small) {
          const o = large.get(term)
          if (o !== undefined) shared.push([term, w * o])
        }
      }
      shared.sort((x, y) => y[1] - x[1] || x[0].localeCompare(y[0]))
      return {
        id: other,
        score: shared.reduce((s, [, w]) => s + w, 0),
        shared: shared.slice(0, SHARED_SHOWN).map(([t]) => t),
      }
    })
  scored.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id))
  return scored.slice(0, limit)
}
