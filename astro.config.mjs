// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'

// Bilingual DE/EN, both locales prefixed (/de, /en) for unambiguous hreflang/canonical.
// Astro ships the content layer as static HTML (top CWV, crawlable); WebGL lives in islands.
export default defineConfig({
  site: 'https://frankbueltge.de',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    // German at /, English at /en — standard, no redirect plumbing; hreflang handles parity.
    routing: { prefixDefaultLocale: false },
  },
  integrations: [sitemap(), mdx()],
  vite: {
    // @tailwindcss/vite hängt noch an Vite 6, Astro 6 nutzt Vite 7 → die Plugin-Typen
    // kollidieren (reiner Typ-Konflikt, der Build läuft). Cast, bis Tailwind auf Vite 7 zieht.
    plugins: [/** @type {any} */ (tailwindcss())],
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      // satellite.js bringt einen WASM-Build mit Top-Level-Await mit — Vites
      // Dev-Optimizer (esbuild, es2020) bricht daran; Rollup im Prod-Build nicht.
      exclude: ['satellite.js'],
    },
  },
})
