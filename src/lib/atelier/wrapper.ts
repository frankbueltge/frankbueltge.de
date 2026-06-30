// src/lib/atelier/wrapper.ts
export function renderWrapperPage(slug: string, _meta: { title?: string; embodies?: string; verkoerpert?: string }): string {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`unsafe slug: ${slug}`)
  return `---
import Page from '@/layouts/Page.astro'
import Work from '@/components/atelier/werke/${slug}/index.astro'
import meta from '@/components/atelier/werke/${slug}/meta.json'
const m = meta as { title?: string; embodies?: string; verkoerpert?: string }
const title = \`\${m.title ?? '${slug}'} — Atelier | Frank Bültge\`
---
<Page title={title} description={m.embodies ?? m.verkoerpert ?? m.title ?? '${slug}'}>
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    <Work />
  </main>
</Page>
`
}
