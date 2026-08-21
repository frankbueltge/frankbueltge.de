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

- **What travels** (the site integrator's allow-list, widened 2026-08-16): code and markup
  — `.html .js .mjs .css .json .svg` (plus `.astro .ts` for native Astro works) — **and the
  assets a work needs to be a work**: `.png .jpg .jpeg .webp .avif .gif`, `.woff .woff2`,
  `.mp3 .ogg .wav .m4a .flac`, `.mp4 .webm`. They travel **as files** beside the entry file,
  where the works CSP plays them; inlining as `data:` URIs is no longer required and costs a
  third of the size again. Prose, notebooks and executables are still left behind, and are
  reported back as `ignored` in the integrate report. **WASM still does not travel.**
- **Runtime is same-origin (changed 2026-08-16, Studio Protocol v3).** The works CSP now
  carries `connect-src 'self'` and `media-src 'self' data:` for `/studio/werke-html/*`: a work
  may read this domain's committed data while it runs, and may play sound and moving image.
  It still reaches **no other host** — the exfiltration guard is unchanged. Audio and video
  travel **as files beside the entry file**, like every other asset in the allow-list above;
  the sentence that stood here until 2026-08-18 said they must be inlined as `data:` URIs
  under a ~3 MB ceiling, which contradicted both the bullet above it and `PROTOCOL.md` §2
  ("no base64 inlining, which used to cost a third of the size again"). The binding limit is
  the 25 MiB per file below. Sibling practices (atelier, field, plenum) keep the stricter policy.
- **WASM is not yet servable** (the works CSP carries no `wasm-unsafe-eval`); a work that
  needs it files a REQUESTS entry first (a site-side header change Frank must make).
- **Determinism:** dependencies pinned by the committed lockfile (`src/package.json` +
  `src/package-lock.json`); the build output committed; `npm ci && npm run build`
  reproduces it byte-for-byte; generative works print their seed (unchanged law).
- **Size:** **25 MiB per file, enforced.** That is Cloudflare Pages' own per-asset limit, and
  it used to bite at *deploy* time — after this gate had passed and the mirror was committed.
  The integrator now rejects an oversized asset by name instead. The earlier "≤ ~3 MB per
  work" line was a guideline this document invented; it existed in no code and was eight
  times stricter than the platform it was guessing at. Keep a work lean because a work should
  be lean, not because a number said so.
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

---

## What the site offers back — the house's catalogues (architect, 2026-08-13)

Everything above describes one direction: what the site takes from this repository. This is
the other one, and it is new.

| feed | what it holds |
|---|---|
| `https://frankbueltge.de/atlas/werke.json` | **the atlas of data art** — neighbouring works with artist, year, venue or prize, and the decisive move each one makes |
| `https://frankbueltge.de/papers/index.json` | 1,106 papers this ecology has read or examined, **without abstracts**, whole in one fetch — for scanning |
| `https://frankbueltge.de/papers/register.json` | the same with abstracts, the register's verdicts, its rejections and its access checks — **large** (2.9 MB) |
| `https://frankbueltge.de/datasets/register.json` | 59 data sources this ecology's own pipelines actually call, with their reachability probes |

**Why they exist.** The lines of this house run with their own repository and the open web,
and none of them holds the site's repository — deliberately: you propose site changes as
files under `site-prs/` and a human merges them. So the atlas, which is this house's
"has the world already done this?" corpus and therefore the evidence base of the USP duty,
was reachable to you only as a 938 kB HTML page. Reachable the way a library is reachable if
you may only photograph the shelves. Frank asked the question on 2026-08-13, about one line,
and the answer turned out to be about all of them.

**Feeds, never copies.** Do not mirror them into this repository. A copy drifts from the
original from the first day — the argument that kept `atlas/` out of the `error-as-method`
fork. These are rebuilt from the same modules the pages import, so the scouts (atlas 05:00
UTC, catalogue 05:30 UTC) move page and feed together; they are never two states.

**The atlas is there when you look for neighbours or inspiration** — a reference collection,
not a step owed per session (the duty wording of 2026-08-13 was retracted by the architect on
2026-08-14). Where you do claim novelty for a work, checking neighbours remains part of
earning the claim: a negative result from 505 neighbours is evidence; an unchecked claim of
novelty is not.

**Two corrections to this table, 2026-08-21 (session 106), from reading the feed rather than the
documentation.** The atlas returned **519 entries** and states that number in its own `count` field;
the figure 505 stood here, and in the standing session brief, and is wrong — the count is therefore
no longer written down here at all, because a number copied out of a feed goes stale the next time
the feed is built, and the feed says what it holds. Second: the atlas **refused one fetching tool
with HTTP 403** and answered a plain direct request normally. A future session that meets a 403 has
not met an unreachable catalogue; it has met one client being turned away.

**When a feed is unreachable,** say so in the record and carry on. An unavailable catalogue
is a fact about the session, not a reason to invent what it would have said.
## The window — your own surface on the house domain (architect, 2026-08-16)

You have a page on frankbueltge.de that is entirely yours, the way the n-1 practice runs its
own: create `window/` in this repository with an `index.html`, and the integrate workflow
mirrors the whole directory **byte for byte** to the site, serving it verbatim at
`/studio/window/`. Nobody edits it; the house's only act is the mirror. the Studio's station sheet shows a
door to the window as soon as the mirror carries an `index.html`, and drops the door if you
remove the directory. Updating the page is committing to `window/` — it travels with your
next integration run.

Conditions, all standing ones, none new: the public voice keeps the underlying technology
unnamed; licenses as constituted (code Apache-2.0, works and texts CC BY 4.0, data CC0);
rights and affected people settled before any opening that touches them. The page is served
self-contained — the same sandbox as your interactive works: inline scripts and styles run,
assets load from `window/` itself, external loads are blocked by the house CSP. Whether and
how you use the window is your decision; an unused window is simply absent, not a failure.
