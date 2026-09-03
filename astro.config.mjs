// @ts-check
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
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
        // connect-src is OPEN to any HTTPS host since 2026-09-04 (Frank's decision, wording
        // private, paraphrased: live and real-time experiments must be startable here, without a
        // second site and without asking first; citability is not the point, the work is).
        //
        // What this changes: a page in this repo may now talk to any HTTPS API or event stream
        // from the browser — no allowlist entry, no session that has to notice, no config change
        // per experiment. What it deliberately does NOT change: script-src and style-src stay
        // closed ('self' plus pinned hashes), so nothing foreign may EXECUTE here. Reading data
        // from the world is now free; running the world's code is still not.
        //
        // The two hosts this line used to name are covered by the same opening: Turnstile on
        // /saat and raw.githubusercontent.com for the seed register's status lookup.
        "connect-src 'self' https:",
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
          // The anti-FOUC theme resolver (Base.astro, is:inline). Re-pinned 2026-09-02: the hash
          // pinned on 2026-07-07 no longer matched the script — it had been edited since — so
          // the resolver was CSP-blocked on every page in production and a light-theme reader
          // saw the static dark default until the module script caught up. Found while wiring
          // the ClientRouter; src/layouts/base.test.ts now recomputes both hashes and fails
          // the moment either script changes without its constant.
          "'sha256-sTVkn3xdmeVKVAdr0N+Hx9qKNNaDDSdRSaxZ2TkjJPk='",
          // The zoom-state script (Base.astro, is:inline — iOS pinch-zoom fix of 2026-08-27).
          // Missing since that fix landed: the script was CSP-blocked on every page in
          // production, so the viewport handler never ran. Found 2026-08-30 while verifying
          // the v3 entrance. Recompute on any change to the script (same rule as above).
          "'sha256-iW9RirIJ16AhxxeAPjC6QbM2WpsRfW6vcUNZbsouEbY='",
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
    // React islands — the visual layer (Frank, 2026-09-02; docs/design/2026-09-02-the-visual-
    // layer.md). An island's client code is a bundled module script, which Astro hashes into the
    // CSP below exactly like the .astro <script> chunks — so this integration changes nothing in
    // security.csp. Geometry stays in src/lib/** (pure, tested); islands mount and interact.
    react(),
    sitemap({
      // Das Dataset Register hatte bis 2026-07-27 eine Unterseite je Eintrag bzw. je
      // Werk; der Sitemap-Filter musste die abgeleiteten Fassungsseiten hier wieder
      // ausschließen. Mit dem Rückbau auf eine kuratierte Liste (docs/design/
      // 2026-07-27-register-rueckbau-und-scouts.md) entfallen beide — es gibt nur noch
      // /datasets selbst, und damit nichts mehr zu filtern.
      // /werke is a redirect page (it 301s to /experiments), and a redirect listed in a sitemap
      // is a URL submitted for indexing that can never be indexed — Search Console reports it as
      // "Page with redirect" and it costs crawl budget for nothing. Found 2026-08-12 while
      // auditing orphans after the ecology v3 rebuild.
      filter: (page) =>
        !/\/protocol\/\d{4}-\d{2}-\d{2}(\/|$)/.test(page) &&
        !/\/steuerzentrale(\/|$)/.test(page) &&
        !/\/werke\/?$/.test(page),
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
    build: {
      // Every script stays an external module file, none is inlined (re-skin 2a, 2026-09-02).
      // Vite would otherwise inline any chunk under 4 KB as `<script type="module">…</script>`
      // — the top bar's disclosure script, the experiments shelf filter — and Astro's
      // ClientRouter, finding an inline module script it has to wait for after a swap, inserts
      // a sentinel `<script type="module" src="data:application/javascript,">`. This site's CSP
      // allows no `data:` scripts (rightly), so the sentinel was refused with a console error
      // on every client-side navigation. With nothing inlined the router never needs the
      // sentinel, and the CSP hash list shrinks to the two `is:inline` scripts plus Astro's own.
      assetsInlineLimit: 0,
    },
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
