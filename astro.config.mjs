// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import datasetWerke from './src/data/datasets/werke.json' with { type: 'json' }
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
// Fassungsseiten direkt aus werke.json ableiten statt aus einer zweiten, abgeleiteten
// Datei: eine solche Datei müsste mitgepflegt und mitgeliefert werden und wäre die
// erste, die still veraltet.
// Cast nötig: ohne ihn leitet TypeScript aus den 6.158 Schlüsseln Literaltypen ab
// und bricht mit „union type too complex" ab. Gebraucht wird hier ohnehin nur die
// Fassungs-Id.
const werkeTyped = /** @type {Record<string, { f: { i: string }[] }>} */ (datasetWerke)
const fassungsSeiten = new Set(
  Object.values(werkeTyped).flatMap((w) => w.f.map((v) => `/datasets/${v.i}`)),
)

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
  // Tages-Snapshots (/protocol/<datum>) sind noindex + aus der Sitemap — dünn & wächst
  // täglich; Frische trägt die aktuelle /protocol-Seite + das Archiv-Register.
  // ACHTUNG: Der Werk-Pfad wurde 2026-07-20 von /protokoll → /protocol umbenannt (siehe
  // public/_redirects); das Regex hier hing noch am alten deutschen Slug, wodurch ~35 dünne
  // noindex-Snapshots wieder in die Sitemap geraten sind (widersprüchliches Signal). Fix: /protocol.
  // /steuerzentrale ist ein privates Operator-Werkzeug (noindex, token-gated) — nie in der
  // Sitemap, unabhängig davon, ob Google robots.txt beachtet.
  integrations: [
    sitemap({
      // Fassungsseiten des Dataset Registers bleiben abrufbar, gehören aber nicht in
      // die Sitemap: ihre kanonische Adresse ist die Werk-Seite (siehe
      // src/pages/datasets/[id].astro). Gemessen am 27.07. sinkt die ausgewiesene
      // Fläche damit von 16.494 auf 8.579 Register-Seiten, ohne dass ein Eintrag
      // verschwindet. Die Liste kommt aus den Daten, nicht aus einem Namensmuster.
      filter: (page) =>
        !/\/protocol\/\d{4}-\d{2}-\d{2}(\/|$)/.test(page) &&
        !/\/steuerzentrale(\/|$)/.test(page) &&
        !fassungsSeiten.has(new URL(page).pathname.replace(/\/$/, '')),
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
