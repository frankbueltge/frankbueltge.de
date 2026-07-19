// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import tailwindcss from '@tailwindcss/vite'
import rehypeRepoLinks from './src/lib/engines/rehype-repo-links.mjs'

// English-only (site-v2 work order §6, decisions doc 2026-07-16 §1.5: "Deutsch fliegt komplett
// raus" — Frank, 2026-07-16). The /de mirror is gone; public/_redirects sends old /de/* URLs to
// their EN pendants. Astro's i18n integration is kept (single locale) rather than removed
// outright — Astro.currentLocale, getRelativeLocaleUrl() etc. stay valid no-ops across the many
// call sites that already use them (src/i18n/ui.ts's t() dictionary keeps its unused `de` half
// too, for the same reason: smaller diff, zero behavioural difference with one locale).
// Astro ships the content layer as static HTML (top CWV, crawlable); WebGL lives in islands.
export default defineConfig({
  site: 'https://frankbueltge.de',
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
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
        // Zwei dokumentierte Ausnahmen für /saat (Design-Spec 2026-07-20-oeffentliche-
        // saat-design.md §4/§10, D2): Turnstile (Cloudflare, bot check vor dem Gate — selber
        // Anbieter wie das Hosting) und raw.githubusercontent.com (Client liest das committete
        // Register für die Status-Abfrage per Claim-Token, ohne eigenen Server). Sonst bleibt
        // connect-src 'self'.
        "connect-src 'self' https://challenges.cloudflare.com https://raw.githubusercontent.com",
        // Turnstile rendert seine Challenge in einem Iframe von derselben Domain.
        "frame-src https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
      ],
      scriptDirective: {
        // 'self' muss explizit genannt werden, wenn resources gesetzt ist (Astro ersetzt den Default).
        // Astro hasht seine gebündelten/Modul-Skripte automatisch, aber NICHT `is:inline`-Skripte
        // (die opten bewusst aus der Verarbeitung aus). Der Hash unten deckt das Anti-FOUC-Theme-
        // Skript im <head> von Base.astro ab. Bei Änderung dieses Skripts neu berechnen:
        //   build → sha256-base64 des <script>-Inhalts in dist/index.html.
        // challenges.cloudflare.com lädt das Turnstile-Widget-Script auf /saat (s. o.).
        resources: [
          "'self'",
          "'sha256-OTbzFulzUa/0o/iJq0xir83lv5aDayqRCmxs9tqjupU='",
          'https://challenges.cloudflare.com',
        ],
      },
      styleDirective: {
        // Tailwind v4 / Inline-Styles — 'unsafe-inline' ist vertretbar (kein JS-Risiko).
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },
  // Tages-Snapshots (/protokoll/<datum>) sind noindex + aus der Sitemap — dünn & wächst
  // täglich; Frische trägt die aktuelle /protokoll-Seite + das Archiv-Register.
  // /steuerzentrale ist ein privates Operator-Werkzeug (noindex, token-gated) — nie in der
  // Sitemap, unabhängig davon, ob Google robots.txt beachtet.
  integrations: [
    sitemap({
      filter: (page) => !/\/protokoll\/\d{4}-\d{2}-\d{2}\//.test(page) && !/\/steuerzentrale(\/|$)/.test(page),
    }),
    mdx(),
  ],
  // Engine README/INDEX docs (synced from the engines' own repos) carry repo-relative links;
  // rewrite them to the public repos' blob/tree URLs so they don't 404 on the site.
  markdown: { rehypePlugins: [rehypeRepoLinks] },
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
