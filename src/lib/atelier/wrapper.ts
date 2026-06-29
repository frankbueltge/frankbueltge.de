// src/lib/atelier/wrapper.ts
export function renderWrapperPage(slug: string, _meta: { title?: string; verkoerpert?: string }): string {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`unsafe slug: ${slug}`)
  return `---
import Page from '@/layouts/Page.astro'
import Work from '@/components/atelier/werke/${slug}/index.astro'
import meta from '@/components/atelier/werke/${slug}/meta.json'
const title = \`\${meta.title ?? '${slug}'} — Atelier | Frank Bültge\`
---
<Page title={title} description={meta.verkoerpert ?? meta.title ?? '${slug}'}>
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    <Work />
  </main>
</Page>
`
}
