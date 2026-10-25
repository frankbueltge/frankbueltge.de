// src/lib/reception/sources.ts — what the reception block on an Astro page needs to know (2026-10-17):
// the lab's experiments, the practices' native Astro works and the nightly line's text works, read
// at build time from the same data the pages themselves are built from. Vite-only (import.meta.glob),
// so it is read by the block and by the tests, never by the post-build step.

import { WERKE } from '@/data/werke'
import type { PageSources } from './ids'

const ASTRO_META = import.meta.glob('/src/components/*/werke/*/meta.json', { eager: true, import: 'default' }) as Record<string, { title?: unknown }>
const NIGHTLY_META = import.meta.glob('/src/data/nightly/works/*/meta.json', { eager: true, import: 'default' }) as Record<string, { title?: unknown }>
// Raw, exactly as src/pages/error-as-method/[slug].astro reads them: as Markdown modules Vite would
// try to bundle the relative figure each text names, which the mirror deliberately does not put there.
const NIGHTLY_TEXTS = import.meta.glob('/src/data/nightly/works/*/work.md', { eager: true, query: '?raw', import: 'default' }) as Record<string, string>

let cached: PageSources | null = null

export function pageSources(): PageSources {
  if (cached) return cached
  const astroWorks = new Map<string, string>()
  for (const [path, meta] of Object.entries(ASTRO_META)) {
    const m = /^\/src\/components\/([^/]+)\/werke\/([^/]+)\/meta\.json$/.exec(path)
    // every wrapper page (src/lib/atelier/wrapper.ts) imports its work's meta.json, so one stands for the other
    if (!m) continue
    astroWorks.set(`${m[1]}/${m[2]}`, typeof meta?.title === 'string' && meta.title.trim() ? meta.title.trim() : m[2]!)
  }
  const nightlyTexts = new Map<string, string>()
  for (const [path, meta] of Object.entries(NIGHTLY_META)) {
    const slug = /\/works\/([^/]+)\/meta\.json$/.exec(path)?.[1]
    if (!slug || !(`/src/data/nightly/works/${slug}/work.md` in NIGHTLY_TEXTS)) continue
    nightlyTexts.set(slug, typeof meta?.title === 'string' && meta.title.trim() ? meta.title.trim() : slug)
  }
  const experiments = WERKE.filter((w) => w.line).map((w) => ({ id: w.id, href: w.href, title: typeof w.title === 'string' ? w.title : w.title.en }))
  cached = { experiments, astroWorks, nightlyTexts }
  return cached
}
