// src/lib/atelier/wrapper.ts
export function renderWrapperPage(slug: string, _meta: { title?: string; embodies?: string; verkoerpert?: string }, ns = 'atelier'): string {
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error(`unsafe slug: ${slug}`)
  const label = ns.charAt(0).toUpperCase() + ns.slice(1)
  // Scope-broadcast: many works build their chart in JS (createElementNS). Those nodes never
  // receive the component's `data-astro-cid-*` scope attribute, so the work's scoped <style>
  // (compiled to `.foo[data-astro-cid-xxxx]`) never matches them — the SVG falls back to browser
  // defaults (black fill / no stroke): a black box in light, invisible in dark. We mirror each
  // node's nearest scoped ancestor's cid onto it, on load AND as the work's deferred script appends
  // nodes (MutationObserver, so ordering between the two module scripts doesn't matter). This lives
  // in the GENERATED wrapper — rewritten on every integrate — so it survives the nightly re-mirror
  // that keeps reverting per-work `:global` fixes. One durable fix for all JS-built-SVG works.
  return `---
import Page from '@/layouts/Page.astro'
import Work from '@/components/${ns}/werke/${slug}/index.astro'
import meta from '@/components/${ns}/werke/${slug}/meta.json'
const m = meta as { title?: string; embodies?: string; verkoerpert?: string }
const title = \`\${m.title ?? '${slug}'} — ${label} | Frank Bültge\`
---
<Page title={title} description={m.embodies ?? m.verkoerpert ?? m.title ?? '${slug}'}>
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    <Work />
  </main>
</Page>

<script>
  // See wrapper.ts: give JS-built SVG nodes the component scope attribute so scoped styles reach them.
  const main = document.getElementById('main')
  if (main) {
    const cidOf = (el: Element): string | null => {
      for (const a of Array.from(el.attributes)) if (a.name.startsWith('data-astro-cid-')) return a.name
      return null
    }
    const scopeOf = (el: Element): string | null => {
      let a: Element | null = el.parentElement
      while (a) { const c = cidOf(a); if (c) return c; a = a.parentElement }
      return null
    }
    const one = (el: Element): void => {
      const cid = cidOf(el) ?? scopeOf(el)
      if (cid && !el.hasAttribute(cid)) el.setAttribute(cid, '')
    }
    const stamp = (node: Node): void => {
      if (!(node instanceof Element)) return
      one(node)
      node.querySelectorAll('*').forEach(one)
    }
    stamp(main) // catch nodes a work script may have built before this module ran
    new MutationObserver((muts) => { for (const m of muts) m.addedNodes.forEach(stamp) })
      .observe(main, { childList: true, subtree: true })
  }
</script>
`
}
