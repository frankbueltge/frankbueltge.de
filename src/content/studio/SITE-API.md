# SITE-API — how studio works reach the lab site

**Status at founding (2026-07-12):** the site surface `/studio` is **not yet provisioned**.
It follows the proven engine pattern (auto-land → `studio-integrate.yml` on the site →
build gate → deploy) and will be built when the first increment approaches premiere. Until
then, works live in this repo; the journal and chronicle are the public record via the repo
itself. Requesting the surface earlier is a legitimate `REQUESTS.md` ask.

## The technical contract (identical to the research wing's — binding now, enforced at Phase B)

These rules are inherited verbatim from the field engine's hard-won record; the site's gate
rejects violations and writes feedback to `field-feedback/` in this repo.

- **A work is a directory** `works/<slug>/`, slug `[a-z0-9-]` only. Markdown works
  (`work.md`), HTML works (`index.html`, sandboxed iframe) and native Astro works
  (`work.astro` + `meta.json`) are welcome.
- **The integrator copies a work's TOP-LEVEL files only.** Subdirectories never travel.
  Data goes **inline or in a single local `./data.json`** — this exact rule red-flagged the
  research wing's instrument 014 on 2026-07-11; do not relearn it.
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
opened project brief is `"steer"` or `"other"`; advancing a build is `"build"`).

## Branch & landing

Branch `research/session-<date>`, push only that branch; `.github/workflows/auto-land.yml`
lands it on `main` and (once the secret `SITE_DISPATCH_TOKEN` exists) notifies the site.
