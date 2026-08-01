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
  // The wall text (Frank, 2026-08-01): the teaser store already holds a plain-language
  // description for nearly every work — 31 to 53 words, no protocol vocabulary — but until now
  // it appeared only in overview lists. A visitor who opened the work itself met the work cold,
  // or met `embodies`, which is written for the record and not for a reader. So the teaser now
  // stands at the head of the work, the way a wall label stands beside a picture: what it is,
  // before what it argues. It is deliberately NOT a fallback to `embodies` — a missing wall text
  // shows nothing rather than a paragraph of apparatus, so the gap stays visible (drift-check
  // counts it) instead of being papered over with the very prose this is meant to replace.
  return `---
import Page from '@/layouts/Page.astro'
import Work from '@/components/${ns}/werke/${slug}/index.astro'
import meta from '@/components/${ns}/werke/${slug}/meta.json'
import { teaserFor } from '@/lib/engines/teaser'
const m = meta as { title?: string; embodies?: string; verkoerpert?: string }
const title = \`\${m.title ?? '${slug}'} — ${label} | Frank Bültge\`
const wallText = teaserFor('${ns}', '${slug}')
---
<Page title={title} description={m.embodies ?? m.verkoerpert ?? m.title ?? '${slug}'}>
  <main id="main" class="mx-auto max-w-3xl px-4 py-14">
    {wallText && (
      <p class="mb-10 border-l-2 border-line pl-4 text-lg leading-relaxed text-fg">{wallText}</p>
    )}
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
