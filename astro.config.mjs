// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'

// Bilingual EN/DE: EN is default at root (unprefixed), DE under /de. No browser detection —
// every visitor lands on EN; /de is manual only (language toggle in TopBar).
// Astro ships the content layer as static HTML (top CWV, crawlable); WebGL lives in islands.
export default defineConfig({
  site: 'https://frankbueltge.de',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    // English at /, German at /de — hreflang handles parity; /en/* → / via public/_redirects (Cloudflare).
    routing: { prefixDefaultLocale: false },
  },
  // Content-Security-Policy: Astro 6 hasht eigene inline/gebündelte Skripte automatisch (kein
  // 'unsafe-inline' in script-src); extern nur der Cloudflare-Analytics-Beacon. API stabil unter
  // security.csp — script-src und style-src gehen NICHT in directives, sondern in scriptDirective/
  // styleDirective. frame-ancestors muss per HTTP-Header gesetzt werden (→ public/_headers).
  security: {
    csp: {
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self' data:",
        "connect-src 'self'",
        "object-src 'none'",
        "base-uri 'self'",
      ],
      scriptDirective: {
        // 'self' muss explizit genannt werden, wenn resources gesetzt ist (Astro ersetzt den Default).
        resources: ["'self'"],
      },
      styleDirective: {
        // Tailwind v4 / Inline-Styles — 'unsafe-inline' ist vertretbar (kein JS-Risiko).
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
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
