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
    defaultLocale: 'en',
    locales: ['en', 'de'],
    // English at /, German at /de — hreflang handles parity; /en/* → / via vercel.json-Redirects.
    routing: { prefixDefaultLocale: false },
  },
  // Tages-Snapshots (/protokoll/<datum>) sind noindex + aus der Sitemap — dünn & wächst
  // täglich; Frische trägt die aktuelle /protokoll-Seite + das Archiv-Register.
  integrations: [sitemap({ filter: (page) => !/\/protokoll\/\d{4}-\d{2}-\d{2}\//.test(page) }), mdx()],
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
