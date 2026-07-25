// Teaser lookup for engine works (Frank, 2026-07-25). The works' own `embodies` descriptions
// are long and uneven, so the homepage LATEST list does NOT auto-truncate them. It shows, in
// order of preference (descFor): the crisp two-sentence teaser from src/data/teasers.json; else
// a clean first-sentence fallback from the work's own description (so a brand-new work is never
// blank); else nothing — never a mid-word "…" cut. The teaser store is maintained by the nightly
// teaser routine and gated through the Steuerzentrale (AI-written public text is reviewed before
// it goes live); the fallback is what fills the gap until that teaser lands.
import data from '@/data/teasers.json'

const TEASERS = (data as { teasers: Record<string, string> }).teasers

/** The two-sentence teaser for a work, or undefined if none is on record yet. Key: `<ns>/<slug>`. */
export function teaserFor(ns: string, slug: string): string | undefined {
  return TEASERS[`${ns}/${slug}`]
}

/** Clean provisional description from a work's own `embodies`: its first sentence, but only
 * when that sentence is short enough to sit on two lines (≤ 170 chars). A brand-new work has
 * no teaser until the nightly routine writes one, so this fills the gap immediately instead of
 * leaving a blank — without ever showing a mid-word "…" cut (a too-long first sentence returns
 * undefined rather than a clamped fragment). Frank, 2026-07-25. */
export function firstSentence(text?: string): string | undefined {
  if (!text) return undefined
  const s = text.trim()
  if (!s) return undefined
  const first = (s.match(/^.*?[.!?](?=\s|$)/)?.[0] ?? s).trim()
  return first.length <= 170 ? first : undefined
}

/** What the LATEST list shows under a work: the crisp teaser if on record, else a clean
 * first-sentence fallback from the work's own description, else nothing. */
export function descFor(ns: string, slug: string, embodies?: string): string | undefined {
  return teaserFor(ns, slug) ?? firstSentence(embodies)
}
