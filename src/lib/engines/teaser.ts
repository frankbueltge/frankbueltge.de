// Teaser lookup for engine works (Frank, 2026-07-25). The works' own `embodies` descriptions
// are long and uneven, so the homepage LATEST list does NOT auto-truncate them — it shows a
// crisp two-sentence teaser from src/data/teasers.json, or no description line at all. A clean
// gap beats a mid-sentence cut. The store is maintained by the nightly teaser routine and gated
// through the Steuerzentrale (AI-written public text is reviewed before it goes live).
import data from '@/data/teasers.json'

const TEASERS = (data as { teasers: Record<string, string> }).teasers

/** The two-sentence teaser for a work, or undefined if none is on record yet. Key: `<ns>/<slug>`. */
export function teaserFor(ns: string, slug: string): string | undefined {
  return TEASERS[`${ns}/${slug}`]
}
