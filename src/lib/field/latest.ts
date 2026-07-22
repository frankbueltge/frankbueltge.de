// The featured instrument on /field is derived, never hand-set. This module is the single
// source of that derivation so the rule lives in one tested place instead of inline in the
// page — a hardcoded pointer (FIELD_NARRATIVE.currentInstrumentSlug) once froze the header at
// "Instrument 001" while Meridian had already shipped further, and nothing caught it. Now the
// page calls latestInstrument(); latest.test.ts pins the behaviour so the freeze can't return.

export interface InstrumentMeta {
  title?: string
  date?: string
  medium?: string
  embodies?: string
}

/**
 * Total order over the instruments: by committed date ascending, ties broken by slug. This is
 * the order the /field entry uses both to number instruments (position in the list) and to pick
 * the featured one (the last = newest).
 */
export function orderInstruments(
  entries: [string, InstrumentMeta][],
): [string, InstrumentMeta][] {
  return [...entries].sort(([sa, a], [sb, b]) =>
    (a.date ?? '') === (b.date ?? '')
      ? sa.localeCompare(sb)
      : (a.date ?? '').localeCompare(b.date ?? ''),
  )
}

export interface LatestInstrument {
  slug: string
  /** The date is definite here: latestInstrument() throws on a dateless newest instrument. */
  meta: InstrumentMeta & { date: string }
  /** 1-based position of the newest instrument in the ordered list, zero-padded to 3 digits. */
  instrumentNo: string
}

/**
 * Meridian's newest committed instrument, derived live from the synced mirror. Fails loud on an
 * empty mirror or a work without a committed date rather than fall back to a stale default — a
 * silent fallback is exactly the failure this replaced.
 */
export function latestInstrument(entries: [string, InstrumentMeta][]): LatestInstrument {
  const ordered = orderInstruments(entries)
  const newest = ordered.at(-1)
  if (!newest) throw new Error('field/latest: no committed instruments in the mirror')
  const [slug, meta] = newest
  const { date } = meta
  if (!date) throw new Error(`field/latest: instrument ${slug} has no committed meta date`)
  return { slug, meta: { ...meta, date }, instrumentNo: String(ordered.length).padStart(3, '0') }
}
