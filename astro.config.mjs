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
    plugins: [tailwindcss()],
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
