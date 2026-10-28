// @ts-check
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'astro/config'
import sitemap from '@astrojs/sitemap'
import mdx from '@astrojs/mdx'
import react from '@astrojs/react'
import tailwindcss from '@tailwindcss/vite'
import rehypeRepoLinks from './src/lib/engines/rehype-repo-links.mjs'
import publicationPrune from './src/lib/engines/publication-prune.mjs'

// Other sessions' checkouts of this repository, which the dev server leaves alone (vite.server).
const worktrees = fileURLToPath(new URL('./.claude/worktrees', import.meta.url))

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
  // Content-Security-Policy: Astro 6 hashes its own inline and bundled scripts automatically
  // (no 'unsafe-inline' in script-src); the one external script host is Turnstile's (below).
  // The API is stable under security.csp — script-src and style-src do NOT go into directives
  // but into scriptDirective/styleDirective. frame-ancestors has to be set as an HTTP header
  // (→ public/_headers).
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
        // `wss:` beside `https:` since 2026-09-04, the same evening and the same decision: a live
        // market reads a socket, not a poll. An exchange pushes every trade and every change of
        // its book down one connection, and a page that may only fetch would be a page that can
        // only ask "and now?" a few times a second. Scheme-wide, like the https opening beside it,
        // so a new source is a line of code and not a config change.
        "connect-src 'self' https: wss:",
        // Turnstile renders its challenge in an iframe from its own host (challenges.cloudflare.com).
        // 'self' since 2026-10-17: the reception opens its rating form (/reception/rate, the one
        // reception page that loads Turnstile) in a same-origin frame below each work, so a work page
        // needs no script host of its own (docs/design/2026-10-17-the-reception.md).
        "frame-src 'self' https://challenges.cloudflare.com",
        "object-src 'none'",
        "base-uri 'self'",
      ],
      scriptDirective: {
        // 'self' has to be named explicitly once resources is set (Astro replaces the default).
        // Astro hashes its bundled and module scripts automatically, but NOT `is:inline` scripts
        // (they opt out of processing on purpose). The two hashes below cover the two is:inline
        // scripts of Base.astro. Recompute one whenever its script changes:
        //   build → sha256-base64 of the <script> content in dist/index.html.
        // challenges.cloudflare.com serves the Turnstile widget script for the site's forms.
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
        // Tailwind v4 / inline styles — 'unsafe-inline' is acceptable here (no JS risk).
        resources: ["'self'", "'unsafe-inline'"],
      },
    },
  },
  // Daily snapshots (/protocol/<date>) are noindex and kept out of the sitemap — thin, and one
  // more every day; freshness is carried by the current /protocol page and the archive register.
  // NOTE: the work's path was renamed from /protokoll to /protocol on 2026-07-20 (see
  // public/_redirects); the regex here still matched the old German slug, which put ~35 thin
  // noindex snapshots back into the sitemap (a contradictory signal). Fix: /protocol.
  // /steuerzentrale is a private operator tool (noindex, token-gated) — never in the sitemap,
  // whether or not Google honours robots.txt.
  integrations: [
    // React islands — the visual layer (Frank, 2026-09-02; docs/design/2026-09-02-the-visual-
    // layer.md). An island's client code is a bundled module script, which Astro hashes into the
    // CSP below exactly like the .astro <script> chunks — so this integration changes nothing in
    // security.csp. Geometry stays in src/lib/** (pure, tested); islands mount and interact.
    react(),
    sitemap({
      // Until 2026-07-27 the Dataset Register had a subpage per entry and per work; the
      // sitemap filter had to exclude the derived version pages here. With the register cut
      // back to a curated list (docs/design/2026-07-27-register-rueckbau-und-scouts.md) both
      // are gone — there is only /datasets itself, and so nothing left to filter.
      // /werke is a redirect page (it 301s to /experiments), and a redirect listed in a sitemap
      // is a URL submitted for indexing that can never be indexed — Search Console reports it as
      // "Page with redirect" and it costs crawl budget for nothing. Found 2026-08-12 while
      // auditing orphans after the ecology v3 rebuild.
      // /society/room is noindex (the projection exit of Society; /society is the page to land on),
      // and so it has no place in a sitemap: a submitted URL that says noindex is a conflict.
      filter: (page) =>
        !/\/protocol\/\d{4}-\d{2}-\d{2}(\/|$)/.test(page) &&
        !/\/steuerzentrale(\/|$)/.test(page) &&
        !/\/society\/room(\/|$)/.test(page) &&
        // the reception's form opens inside a work's page; on its own it is a form, not a page to find
        !/\/reception\/rate(\/|$)/.test(page) &&
        // so does a study's consent frame (2026-10-27)
        !/\/study\/frame(\/|$)/.test(page) &&
        // the analytics opt-out is a noindex tool, not a page to find (the /society/room conflict)
        !/\/analytics-opt-out(\/|$)/.test(page) &&
        !/\/werke\/?$/.test(page),
    }),
    mdx(),
    // The publication rule (Frank's decision of 2026-10-17, wording private): the practices'
    // finished works and cycle presentations are published, their working material stays in their
    // own repositories. The integrates copy a practice's repository into public/ and trim the copy
    // to the same rule plus what the build reads (scripts/engines/trim-mirror.mjs), so the rule
    // runs again after the build and deletes from dist/ every mirrored file it does not publish
    // (src/lib/engines/publication.mjs) — the files the build reads but nobody may open. It prints
    // one summary line and never fails the build.
    publicationPrune(),
  ],
  // Engine README/INDEX docs (synced from the engines' own repos) carry repo-relative links;
  // rewrite them to the public repos' blob/tree URLs so they don't 404 on the site.
  markdown: { rehypePlugins: [rehypeRepoLinks] },
  vite: {
    // @tailwindcss/vite still depends on Vite 6 while Astro 6 uses Vite 7, so the plugin types
    // collide (a pure type conflict; the build runs). Cast until Tailwind moves to Vite 7.
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
      // satellite.js ships a WASM build with top-level await — Vite's dev optimizer
      // (esbuild, es2020) breaks on it; Rollup in the production build does not.
      exclude: ['satellite.js'],
    },
    server: {
      watch: {
        // Other sessions keep whole checkouts of this repository in .claude/worktrees/ — gitignored,
        // but Vite's watcher does not read .gitignore. `astro dev` in the main checkout followed
        // every install and build inside them: on the night of 2026-10-27 it ran at 400–460 % CPU
        // for an hour and a half, its log nothing but `[watch] .claude/worktrees/…` lines. The path
        // is anchored to this checkout, so a dev server started inside one of those worktrees still
        // watches its own files (a `**/.claude/worktrees/**` glob would blind it).
        ignored: [(file) => file === worktrees || file.startsWith(`${worktrees}/`)],
      },
    },
  },
})
