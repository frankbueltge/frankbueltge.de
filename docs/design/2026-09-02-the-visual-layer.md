# The visual layer — the archive binds the data, not the rendering (2026-09-02)

**Status: RULED AND EXECUTED, Phase 0 (2026-09-02).** Frank's decisions of the same night
(wording private): figures may be rendered client-side, interactive and animated; the data
stays committed and recomputable. Islands are **React** inside Astro. The component system
for the site-wide re-skin is **shadcn/ui on the existing Tailwind v4** (Material UI was
considered and rejected: an Emotion runtime, a second theming system beside Tailwind, a
look that is not this house's). The first flagship is **the cycle as a living partitur** on
`/ecology`. The site frame stays **monochrome, but richer**; colour lives in the figures and
their cards. After the partitur, re-skin steps and flagships alternate, one evening each. The
§5 edits are executed in the PR that carries this document; the duties of §3 live as a dated
section of `.claude/rules/dataviz-figures.md`.

**Occasion.** Frank's judgement of 2026-09-02 (paraphrased, wording private): the site reads
as static and dated, every change costs a great deal, and he wants an interactive, visually
ambitious site — d3, React, richer frameworks, a proper component system — instead of
build-time SVG in a static shell. The finding of §1 is that Astro is not what produced the
static feel, and the finding of §2 is that the archive duty never required it.

---

## 1. Provenance: "build-time SVG only" was a habit, not a decision

What the tree held on the evening of 2026-09-02, read from `origin/main`:

- **No UI-framework renderer and not one island.** `astro.config.mjs` carried `sitemap()` and
  `mdx()`; `client:load|visible|idle` appeared nowhere under `src/`. Thirty-eight components
  carry a plain `<script>`, and none is a component tree with state.
- **Every figure is a pure builder returning an SVG string** (`src/lib/ecology/cycle-score.ts`,
  `middle-score.ts`, `src/lib/studio/season.ts`, `src/lib/field/strip.ts`, `src/lib/ops/*`),
  injected with `set:html` and inked by a scoped stylesheet. The builders' headers repeat one
  sentence — *same inputs ⇒ byte-identical output, no clock reads, no randomness* — and a
  few frames add *no JavaScript, no inline styles*.
- **No decision says so.** The decision log, the design records and the rule files hold no
  sentence that confines a figure to build time. The rule that does exist points the other
  way: since 2026-07-30 (`.claude/rules/dataviz-figures.md`) the practices' figures *may* be
  colourful and interactive — "Farbe, Tiefe, Interaktion (Hover/Fokus/Filter), Detailtafel".

Where the habit came from, and what in it was right:

1. **The CSP without `'unsafe-hashes'`** drops every `style=""` attribute. The honest lesson —
   *colours belong in stylesheets, dynamic styling goes through `setVars`* — hardened into
   *no client rendering at all*, which the CSP never demanded: bundled module scripts are
   hashed automatically, and thirty-eight of them already run.
2. **The archive duty** (*a finding must be recomputable from committed inputs*) hardened into
   *a figure must be a build artefact*. The duty binds the data and the geometry; it says
   nothing about where the pixels are painted.
3. **Determinism as a test strategy** — a builder that returns a string is trivially testable
   — is worth keeping. It is kept: geometry stays in pure libs (§3, duty 1), and an island's
   *server render* is tested the same way, as a string.

**Consequence: there is nothing to reverse, only something to name.** The same class of
finding as `2026-08-22-runtime-state-for-works.md`: a constraint that wore the look of a rule
without ever having been one.

## 2. What the archive keeps binding

1. **Data committed and recomputable.** Every number a figure shows comes from a committed
   file; the nightly pipelines and mirrors stay the only writers.
2. **No live third-party read inside a claim.** `connect-src 'self'` stays; an island may
   fetch a committed same-origin JSON (the archive itself), never an outside API.
3. **Geometry in pure, tested libraries.** A figure's claim — where a mark stands, what a
   length means — is derived in `src/lib/**` and tested without a browser.
4. **The server render is the floor.** Astro renders islands on the server; the figure and its
   links exist in the HTML before any script runs. Interaction is an addition.
5. **The content layer stays static** (its original reason: ranking and crawlability). Islands
   sit inside pages; the pages stay pages.

## 3. Seven duties of an interactive figure

The binding text is the German section "Interaktive Figuren (Frank, 2026-09-02)" in
`.claude/rules/dataviz-figures.md`; this is its outline.

1. Geometry and every number from a pure, tested lib in `src/lib/**`; the island mounts,
   animates, answers the pointer.
2. SSR floor: nothing reachable only through JavaScript; `TableFallback` and native `<title>`
   marks stay.
3. No `style=` attribute anywhere — drift-check rule 3 walks `.tsx` since this day; dynamic
   styling only via `setVars`, classes and data attributes; colours only in `PALETTE:`-marked
   stylesheets; no hex in `src/{components,lib}/dataviz/**`.
4. `prefers-reduced-motion` honoured: zero-duration transitions, no ambient motion.
5. Readout house rules (`src/lib/dataviz/readout.ts`): clamped to the figure box, flips at an
   edge, never a hit target.
6. A gzip budget per island in `scripts/budgets.json`, enforced by `scripts/bundle-budget.mjs`
   after every build (CI and deploy); heavy libraries lazy; d3 by submodule; one shared React
   runtime.
7. Any new hue set validated light and dark and recorded in `src/lib/dataviz/palette.ts`; at
   most four categorical slots; no status colours where the practice does not judge.

## 4. The program

| Step | Evening(s) | What Frank sees afterwards |
|---|---|---|
| 0 Foundation (this PR) | 1 | React + shadcn installed under the mono tokens; the rule in force; the cycle score hydrates as the first island on `/ecology` |
| 1 The partitur | 2 | `/ecology`: zoomable, animated score of the running cycle — three practice lanes and a house lane; artifacts, sessions, letters, encounters, presentations as marks; cards; keyboard; table floor |
| 2a Re-skin: tokens, chrome, transitions | 1–2 | type scale and radius decided, menu and footer on the shadcn recipe, page transitions without a dark flash |
| 3a Graph explorer | 1 | the house's knowledge graph as a force graph with search and provenance cards |
| 2b Re-skin: ecology templates | 1 | stations, register sheets, the Middle on one recipe |
| 3b The globe | 2 | WebGL globe on the entrance: the satellites overhead and the dark vessels of the night's records |
| 2c Re-skin: experiment sheets | 1 | every experiment page and method sheet on one recipe |
| 3c Experiments gallery | 1 | animated, filterable gallery with live thumbnails |
| 2d Re-skin: utility pages, entrance tokens | 1 | About, Contact, Seed, Post, Legal, 404; the ops room on the new tokens |
| 3d Middle score + Studio floor | 1 | both figures as islands with cards, on a shared score kit |
| 2e/3e Trending, polished (2026-09-03) | 1 | the five Common Ground surfaces on the recipe with ONE sheet stylesheet instead of three copies; the audience strip and a term's arc as islands; and `/trending`'s own claim finally drawn — the convergence matrix of topics × sources |

Every step is one PR: green checks (the permanently red Workers Build excepted), a
decision-log row and a graph rebuild, screenshots light and dark, merged under the standing
authority. Untouched throughout: the mirrored practice surfaces (`public/*/window`,
`*/werke-html`, `/attention`, `/n-1`, `/arch/works/*`), the archive JSONs, `public/_headers`.

## 5. Edits executed (Phase 0)

1. **`.claude/rules/dataviz-figures.md`** — `paths` gain `.tsx`, `src/components/ui/**`,
   `src/lib/ui/**` and the budget scripts; the section "Interaktive Figuren" with the seven
   duties and the shadcn ground rules.
2. **`CLAUDE.md`** — the paragraph "Die Sichtschicht" after the runtime-state paragraph;
   "Astro 5" corrected to "Astro 6".
3. **`docs/decision-log.md`** — one dated row; graph rebuilt.
4. **Stack** — `@astrojs/react` with React 19 (`astro.config.mjs`, `tsconfig.json` jsx
   settings); shadcn by hand: `components.json`, `src/lib/ui/cn.ts`, `src/components/ui/
   button.tsx` (the `accent` slot renamed `hover`, no `destructive` variant); the token
   bridge in `src/styles/global.css` (`@theme inline` pointing only at the site's tokens,
   `@custom-variant dark` on `[data-theme='dark']`, `tw-animate-css`; no `.dark` block, no
   radius overrides).
5. **The first island** — `src/components/ecology/CycleScoreIsland.tsx`, mounted by
   `CycleScoreFigure.astro` with `client:visible`: the built score rendered on the server, a
   hover/focus readout through the shared `Readout` shell once hydrated. Replaced by the
   partitur in Phase 1.
6. **Gates** — `scripts/drift-check.mjs` walks `.tsx` in rules 1, 2, 3, 6 and 7 (proved with
   a throwaway fixture that failed the check, then was deleted); `scripts/bundle-budget.mjs`
   + `scripts/budgets.json` run after the build in `ci.yml` and `deploy-cf.yml`;
   `vitest.config.ts` runs `.test.tsx`; `src/lib/ecology/mounted.test.ts` sees islands.
7. **Tests** — `src/components/ecology/CycleScoreIsland.test.tsx` (deterministic server
   render, no `style=`, every link present) and `src/lib/ui/tokens.test.ts` (the bridge points
   and never paints; no `.dark`; no radius).

## 6. What Frank should know

- **The CSP did not change.** Islands are bundled module scripts; Astro hashes them as it
  hashes the `.astro` script chunks. The two `is:inline` hashes in `astro.config.mjs` are
  untouched. No `wasm-unsafe-eval` was added and none is planned.
- **`accent` means ink here.** shadcn's hover surface is called `hover` in this house; every
  copied primitive is edited accordingly. Copying a registry component verbatim would repaint
  hover states with ink — `tokens.test.ts` and the rule section say so.
- **The radius scale is deliberately not bridged yet.** shadcn's `--radius-*` would silently
  re-round more than a hundred existing `rounded-*` usages; that decision is made with
  screenshots in step 2a.
- **A step can be a repair as much as an addition.** The trending step (2026-09-03) was asked
  for as polish and found a surface built beside the re-skin rather than on it: heading clamps,
  three copies of one stylesheet, and twelve of twenty source names printing as raw ids. The
  lesson for the steps still to come is that a NEW surface built while the re-skin is running
  needs the recipe's guard test on the day it ships, not a fortnight later —
  `src/lib/trending/recipe.test.ts` is that guard, written after the fact.
- **The smoke island is a placeholder.** It proves the shape on a real surface; the partitur
  replaces it in Phase 1 and deletes `cycle-score.ts` (git is the archive).
