# Engine works: gate honesty + site presentation — design

Design spec · 2026-07-02 · Status: approved (Frank, 2026-07-02, remote session)

## Problem

Three related failures surfaced after the collective's first production cycle:

1. **The gate silently suppresses vetted works.** The integrate run of 2026-07-02T07:38Z
   (green) rejected `2026-07-02-standing-docket` ("disallowed file type: README.md" — the
   gauntlet's own rework added a citations README to the work directory) and
   `2026-07-01-fairness-trap` ("external resource: …" — the engine added **citation
   hyperlinks**, which the scanner treats like loadable resources). Because the workflow
   mirrors the engine exactly, fairness-trap — live the day before — was **removed** from
   the site. This is a values conflict: the constitutions *require* retrievable source
   URLs; the gate *punishes* them.
2. **Engines never learn of rejections.** `field-feedback/` / `atelier-feedback/` are only
   written on red builds. Rejection inside a green build is invisible; the collective
   believes it shipped.
3. **Presentation is unstructured.** The homepage never surfaces individual engine works
   (only the hand-curated experiment strip in `src/data/werke.ts`). The engine pages
   (`FieldPage.astro`, `AtelierPage.astro` — byte-level clones) render each journal day as
   ONE continuous markdown blob (2026-07-01: 1,685 lines, 9 sessions) with no per-session
   structure; synced docs (PROTOCOL/REQUESTS) are never rendered.

## Decisions (clarified with Frank)

- One design for all three packages; one implementation plan.
- Redesign applies to **both** engine pages via a shared component.
- Journal renders as **session cards** (newest open, older collapsed).
- Homepage gets **both**: a "From the machines" strip **and** a latest-work line in the
  existing engine cards.
- Docs: render **constitution + team channel** as subpages per engine; FIELD.md stays
  repo-only.

## Part 1 — Gate fixes (`scripts/atelier/`, workflow)

**Principle: links yes, loads no.**

- `forbidden.ts`: flag external URLs **only in resource-loading contexts** — `src=`,
  `srcset=`, `poster=`, `<link … href=`, `@import`, `url(…)`, `fetch(`, `import(`,
  `new Worker(`, `new WebSocket(`, `XMLHttpRequest`/`.open(`. Plain `<a href="https://…">`
  citation links and URLs in text/comments are allowed. The schema.org allowlist becomes
  unnecessary for anchors (still applies to loading contexts); keep the existing
  host-anchoring fix. The gate's *other* rules (no `fs`/`process`, no `window.location`
  navigation, slug charset, no `@/layouts/Page.astro` import) are untouched.
- `integrate.ts`: per-work **copy-allowlisted-files-only** instead of reject-on-any-
  disallowed-file. Allowed into the site: `work.astro`/`index.astro`, `meta.json`,
  `data.json` (and the existing HTML-work file set). Everything else in a work directory
  (README.md, `*.py`, raw data dirs) is **ignored, not fatal**, and listed per work in the
  report (`"ignored": [...]`) — silent truncation is not allowed. A work is still
  *rejected* when a copied file violates the forbidden-pattern scan or required files are
  missing/invalid (meta.json unparseable, bad slug).
- **Rejection feedback:** in both integrate workflows, when `report.rejected` is non-empty
  (even on green), write `<ns>-feedback/<date>.md` into the engine repo (BOT_TOKEN path,
  non-fatal, same mechanics as red-build feedback): slug + reason per rejected work, one
  line on where the full report lives. Engines read their feedback dir at orient time —
  the loop closes.
- **Tests:** extend the existing gate test suite, never weaken it. New cases: citation
  anchor passes; `<script src>`/`fetch(`/external `<img src>`/`url()` still rejected;
  work with README+py copies only the allowlisted files and reports them as ignored;
  rejected work produces a feedback file (workflow-level: assert the step's script logic
  via a unit-testable helper where practical).
- Expected immediate effect: fairness-trap and standing-docket integrate on the next run
  with no engine-side changes.

## Part 2 — Homepage

- New `MachinesStrip.astro` ("Aus den Maschinen" / "From the machines", i18n de/en):
  the **4 newest works across both engines**, built at build time from the integrated
  collections (works meta.json + markdown works). Card: title, engine label
  (FIELD/ATELIER), ISO date, one-liner (`embodies` ?? `verkoerpert` ?? title), link to
  the work page. Placed in `Home.astro` between `WerkeStrip` and "Eigene Projekte".
- `WerkeStrip.astro`: the `field` and `atelier` entries additionally render a
  `latest: <title> · <date>` line from the same data.
- Shared helper `src/lib/engines/latest.ts` — `getLatestEngineWorks(limit)`: collects
  `{ns, slug, title, date, blurb, href, kind}` from both namespaces, sorted date-desc
  (date from meta.json `date`, fallback slug prefix). Unit-tested (sorting, fallbacks,
  missing meta fields).

## Part 3 — Shared EnginePage (/field + /atelier)

- `src/components/pages/EnginePage.astro` replaces the two clones; per-engine config
  object: namespace, route prefix, title/lede/eyebrow, repo URL, prose class, i18n mode
  (atelier: bilingual via existing `t()`/ternary pattern; field: English-only — the
  engine's own texts are always shown verbatim).
- Section order: header (adds doc links "Constitution · Team channel") → works gallery
  (existing card pattern + kind badge + date) → texts & notes (md works) → **journal as
  session cards**.
- **Session cards:** at build time, split each journal entry's raw markdown (`entry.body`)
  on `^# Session \d+` headings. Each session renders as its own collapsible card
  (`<details>`, no client JS): newest session of the newest day open by default, all
  others collapsed. Card header: session number + date + optional badges parsed
  tolerantly from the session text — move badge from a `**Move:**` line (fallback: none),
  voices from a `**Convened:**` line. Sessions without recognizable structure render as a
  plain card (whole pre-collective back-catalog stays readable). A journal file without
  session headings renders as one card (fallback = current behavior).
- **Markdown rendering of fragments:** `markdown-it` (CommonMark-faithful, build-time
  only) wrapped in `src/lib/engines/journal.ts`
  (`splitSessions(body)`, `renderSession(md)`), because `astro:content` renders whole
  entries only. Output styled by the existing `*-prose` scoped CSS (moved to a shared
  stylesheet/class). Unit tests: splitting (multi-session file, single-session file,
  no-heading file), badge/voices extraction, and a sanitization check (renderer emits no
  script tags; content is our own committed markdown, but the check is cheap).
- **Deliberation styling (restrained, mono skin):** verdict lines/blocks and the
  Interlocutor-critique section get panel-raised highlight blocks; voices line renders as
  the established mono-eyebrow style. No colors beyond the skin tokens.
- The existing sort helpers (`src/lib/atelier/sort.ts`) move to `src/lib/engines/` (import
  paths updated); `/field/werke/<slug>` and `/atelier/werke/<slug>` pages unchanged apart
  from a back-to-gallery link in the shell.

## Part 4 — Doc subpages

- Routes: `/field/protocol`, `/field/requests`, `/atelier/protocol`, `/atelier/requests`
  rendering the synced PROTOCOL.md / REQUESTS.md from each namespace's collection in the
  shared prose style, with the header note "Written and maintained by the machine ·
  unedited" (atelier chrome bilingual, doc text verbatim). Linked from the EnginePage
  header. FIELD.md and SITE-API.md stay unrendered.

## Testing / acceptance

- `npm run check`, `npm test` (incl. new gate + journal-split + latest-works tests),
  `npm run build` green.
- After deploy + next integrate: standing-docket and fairness-trap visible on /field;
  homepage shows the machines strip with the docket first; /field journal shows session
  cards (S01–S09 for 2026-07-01 individually collapsible); /field/protocol renders the
  constitution; rejection feedback is verified by unit-testing the feedback-generation
  helper (a live rejection observation is a bonus, not the gate).

## Not in scope

- No redesign of the works themselves (engines own their form).
- No change to drafts/memory/WORKBOARD privacy or the mirror semantics (a rejected work
  still disappears — but now with feedback).
- No engine-repo changes (constitutions, prompts, tools untouched).
- No touch on the parallel `beifang` branch/stream.
