# SITE-API — how studio works reach the lab site

**Status at founding (2026-07-12):** the site surface `/studio` is **not yet provisioned**.
It follows the proven engine pattern (auto-land → `studio-integrate.yml` on the site →
build gate → deploy) and will be built when the first increment approaches premiere. Until
then, works live in this repo; the journal and chronicle are the public record via the repo
itself. Requesting the surface earlier is a legitimate `REQUESTS.md` ask.

## The technical contract (identical to the research wing's — binding now, enforced at Phase B)

These rules are inherited verbatim from the field engine's hard-won record; the site's gate
rejects violations and writes feedback to `studio-feedback/` in this repo (renamed
2026-07-16 — the old name `field-feedback/` was a copy-paste from the field engine's
contract and never materialized here).

- **A work is a directory** `works/<slug>/`, slug `[a-z0-9-]` only. Markdown works
  (`work.md`), HTML works (`index.html`, sandboxed iframe) and native Astro works
  (`work.astro` + `meta.json`) are welcome.
- **The integrator copies a work's TOP-LEVEL files only.** Subdirectories never travel.
  Data goes **inline or in a single local `./data.json`** — this exact rule red-flagged the
  research wing's instrument 014 on 2026-07-11; do not relearn it. This same rule is what
  makes **built works** possible: the build workspace lives in `src/` (never travels), the
  committed build output lives at top level — see "Built works" below.
- **Forbidden in Astro works** (build-gate rejects): `fs`/`process`, external script/fetch
  URLs, `window.location` navigation, `@/layouts/Page.astro` imports.
- **CSP pitfalls the gate does NOT catch** (they compile, then silently break in the
  browser): no `define:vars` on `<script>` (forces inline; blocked by CSP); no inline event
  handlers (`onclick=` — use `addEventListener`); no inline `style=` attributes (markup or
  innerHTML — use scoped classes or `element.style.x`); pass data via a
  `<script type="application/json">` island read with `JSON.parse`; scope all styles under a
  wrapping container class (no bare `body{}`/`*{}`).
- **Physical works** integrate as their documented record: a work page carrying what was
  built, where, and the fabrication files; the body exists in the world.
- Generative works are **seeded** (same seed, same work — git is the archive).

## Built works — the workshop contract (architect, 2026-07-21)

The constitution's workshop section (PROTOCOL.md) lifts the hand-written single-file
ceiling: a work may be built with a real toolchain (`projects/<slug>/src/` as the
workspace; a pinned starter in `toolchain/template/`). **The integrator is unchanged** —
these are the duties that make a built work pass it:

- **What travels** (the site integrator's allow-list today): `.html .js .mjs .css .json
  .svg` (plus `.astro .ts` for native Astro works). Any other top-level file is silently
  IGNORED, not rejected — raster images, fonts, audio, wasm do **not** travel. The build
  must **inline** such assets as `data:` URIs (the works CSP allows `img-src data:` and
  `font-src data:`; scripts must be local files or inline).
- **Runtime is offline.** The works CSP has no connect/fetch allowance — everything a work
  needs ships in its committed files. No external requests, ever (this was already the
  law; a bundler makes it easy to honor).
- **WASM is not yet servable** (the works CSP carries no `wasm-unsafe-eval`); a work that
  needs it files a REQUESTS entry first (a site-side header change Frank must make).
- **Determinism:** dependencies pinned by the committed lockfile (`src/package.json` +
  `src/package-lock.json`); the build output committed; `npm ci && npm run build`
  reproduces it byte-for-byte; generative works print their seed (unchanged law).
- **Size discipline:** keep a work's shipped top-level total lean — guideline ≤ ~3 MB.
  The bundle is a work, not an app.
- **The island practice is unchanged:** the data island in the built HTML stays
  byte-identical to the committed `./data.json`, and the Verifier checks it as before.
- **Licenses:** permissive dependencies only (MIT/BSD/ISC/Apache-2.0/public domain — the
  works ship under noncommercial licenses and must remain distributable); every dependency
  and its license named in the work's README.

## The chronicle self-report

`chronicle.json` at the repo root, one entry per session, appended at session close —
the site validates strictly at Phase B (Zod; malformed entries fail integration):

```json
{ "collective_session": 1, "date": "YYYY-MM-DD",
  "move": "build|gauntlet|verify|consolidation|steer|ship|other",
  "summary": "One or two plain sentences — honest about a FAIL as much as a premiere.",
  "works": ["slug-if-any"], "verdict": "pass|fail|conditions|graduated|discarded|deferred|null" }
```

The site's move enum is fixed; map studio moves onto it (a **premiere** is `"ship"`; an
opened project brief, a concept-phase session or a season opening/closing is `"steer"` or
`"other"`; advancing a build is `"build"`).

## Branch & landing

Branch `research/session-<date>`, push only that branch; `.github/workflows/auto-land.yml`
lands it on `main` and (once the secret `SITE_DISPATCH_TOKEN` exists) notifies the site.

---

## Site PRs — proposing changes to the site itself

You can propose changes to the site's own source — the pages, the atelier library,
the cockpit — not just works. The channel mirrors how a human teammate works: you
author the change, the gate validates it, a human reviews and merges. You cannot
merge — nothing you propose goes live without review.

### Format

```
site-prs/<slug>/PR.md              ← first `# heading` = PR title; rest = PR body (your rationale)
site-prs/<slug>/files/<path>       ← FULL replacement file for <path> in the site repo
```

- `<path>` is repo-relative in the site repo, e.g. `files/src/lib/atelier/sheet.ts`
  → `src/lib/atelier/sheet.ts`.
- Full files only (no diffs). Additions and modifications only — no deletions (v1).
- **Boundary:** only `src/**` is accepted. Never accepted: `src/content/protokoll/**`
  (the archive is immutable), anything outside `src/` (workflows, pipelines, configs).
  One refused path refuses the whole slug (all-or-nothing, like the works gate).
- Allowed types: `.astro .ts .js .mjs .json .css .svg .html .md .txt` · ≤ 2 MB per file · ≤ 50 files.
- Slug: `[a-z0-9-]`, as with works.

### Reading the current source

The site repo is public — read it directly:
`git clone --depth 1 https://github.com/frankbueltge/frankbueltge.de /tmp/site`
Base your full files on the current state of its `main`.

### Lifecycle

After each of your landings (and as a nightly safety net) the gate (`engine-site-pr`)
picks up `site-prs/`, enforces the boundary and runs the site's own checks
(`astro check` + vitest + build) on the proposal:

- **green** → a PR is opened in your name (and updated when you change the files while
  it is open);
- **red or refused** → no PR; a letter lands in `studio-feedback/<date>-site-pr.md`
  with the reasons / a log excerpt;
- **closed** (by a human) → final; a closed PR is never revived — a new attempt needs
  a new slug;
- **merged** → your change is on `main` and live after the next deploy; you can then
  delete `site-prs/<slug>/` in a later session.

Tests are part of the proposal: when you change behaviour that is under test,
change the tests in the same slug — the gate runs the full suite, and a red
suite means no PR.
