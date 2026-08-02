# The refrain partitur: a work-line's temporality as a score (spec, 2026-08-02)

**Occasion.** Frank's session of 2026-08-02: apply the toolkit of the practice's own published
work (*Kartographie statt Kopie / Cartography, not Tracing*, work 2026-07-24, ch. 5–6) to the
question of how the ecology's frontend should visualise. Direction decided by Frank ("ja, mach
alle drei"); this spec is the first frontend piece. The companion move — the toolkit's missing
half offered back to the practice — went to `ulysses/REQUESTS.md` the same day ("Seed: the other
half of your own toolkit"); this figure is deliberately independent of whether the practice
adopts anything: it renders committed records, presentation only.

**Status.** Specified; not yet built. Reference implementations for the build pattern:
`src/lib/atelier/passage.ts` + `ProcessFigure.astro` (atelier), `src/lib/field/claimladder.ts`
(field), `src/lib/studio/season.ts` (studio) — pure builder, build-time, tested, wired through
the shared WP3 dataviz primitives.

## 1. What it is

A signature figure for `/atelier`: the work-line's time rendered as a **three-voice score** —
*territory*, *home*, *opening* — all three voices always sounding, with **dominance** shifting
per tick. The claim the figure makes is the published model's postulate 4: the refrain's three
aspects **coexist**; they are never phases (ATP 311–312, "sometimes, sometimes, sometimes").

**The one forbidden reading is the Gantt chart.** A rendering in which aspects appear as
sequential blocks — territory *then* home *then* opening — asserts exactly the phase-model the
work rules out. That is a spec violation, not a style choice. Concretely: all three voices are
drawn at every tick; dominance is emphasis (weight, amplitude, saturation), never presence
vs. absence.

## 2. Data contract

Build-time, pure, tested. Source: the mirrored records only —
`src/content/atelier/projects/<line>/TRACE.md`, `SCORE.md`, `REVIEW-*.md`. No live reads, no
upstream fetch: git is the archive.

Per tick, the parser extracts:

- `tick` (number) and `date` — from the stable heading convention
  `## Tick N — YYYY-MM-DD — <title>`;
- `kind` — the operation named in the heading/title where legible (home / opening / territory /
  review / compost-in);
- `dominantAspect` — from the pre-opening check ("Dominant aspect: **home**") or the line-status
  line ("ACTIVE, open horizon, aspect home");
- `deferral` — whether an opening was deferred this tick, with the practice's **verbatim**
  one-line reason and a source anchor (file + heading);
- `opening` — outward moves that happened, and, where the record says so, whether the point was
  *self-created* or *licensed* (a published condition met by the other side — the practice's own
  distinction, TRACE tick 22 and the pre-opening proposal of 2026-08-01);
- `motifs` — occurrences of the line's declared leitmotifs (see §3).

**Defensive parsing, honest gaps.** The records are prose with stable conventions, not a schema.
A tick whose reading cannot be extracted renders as an **unmarked tick** — visible, dated, with
no aspect claimed. Never interpolated, never inherited from the previous tick ("Feststellung
entfällt" is the house form of this honesty). The parser invents nothing.

**Structural, never counted.** No hardcoded totals anywhere — not in the builder, not in the
tests. The gate lesson of 2026-08-01/02 (the ledger test's hardcoded 11, the fourth occurrence
of the count/position pattern): the archive grows because the practice works; assertions state
fidelity to what is on disk, not a number.

## 3. Notation

- **Three voices, always.** Territory / home / opening as parallel staves or bands; dominance per
  tick as emphasis. The two non-dominant voices remain visible at every tick — coexistence is
  the figure's thesis.
- **The deferred opening is a notated rest.** Where the record says "opening deferred, by
  decision" the score shows a rest sign in the opening voice, and the readout/table carries the
  practice's verbatim reason. Deferral is a decision, not a gap — the record treats it so, the
  figure must too.
- **Leitmotif glyphs.** The line's components of passage (T5: the motif that converts between
  territories) recur as small glyphs where they appear. For the first work-line the motif is
  ϖ/σ_ϖ — the value read in units of its own claimed precision. Motifs are **declared per line
  in a small curated config**, never inferred by fuzzy matching: no invention. A line without
  declared motifs simply has no glyph row.
- **Irregular cadence stays irregular.** The x-axis is event-ordered with true date gaps marked;
  no uniform time grid. The holes carry ("make a hole in order to consolidate", ATP 328–329) —
  a silent day is information, not layout noise.
- **Openings are marked by their warrant** where the record states it: self-created point vs.
  licensed point (answered commission, met condition). Where the record does not say, the mark
  is neutral.
- **Compost-in events** (findings linked in from closed studies) appear as tied notes entering
  the line's voice — material arriving, not work starting.

## 4. House rules (all binding, none new)

- **Identity colors, not status colors.** An aspect is an identity; a deferral is not a warning;
  a closed study is not a failure. No verdict red anywhere.
- **Palette as test, not comment.** The delivered set lands as a dataset in
  `src/lib/dataviz/palette.ts` (validator verdict, dated, WARNs with named relief);
  `palette.test.ts` recomputes the distances; `scripts/drift-check.mjs` rules 6/7 enforce the
  `PALETTE:` markers. Light AND dark, each with its own stops.
- **Legend + TableFallback.** Every tick appears in the table with date, aspect, kind, and the
  verbatim deferral reason with its source. Quotes never paraphrase.
- **Shared primitives.** Readout / DetailPanel / LegendFilter / TableFallback; figure container
  `position: relative`; no `is:inline` scripts, no `style=""` (CSP); every mark keyboard-reachable
  with a native `<title>`.
- **`prefers-reduced-motion`** gates any draw-in or scrub animation.
- **Provenance line under the figure:** which records, which commit, when parsed.
- **Content first.** The practice's own prose leads and the drawing selects — the ProcessFigure
  precedent (Frank, 2026-07-30) holds: a first-time visitor must learn what the line is about
  from the card, not decode telemetry.

## 5. The operative axis — required only if it earns its form

The figure grammar of this session asks every signature figure for one operative element (the
map-not-copy rule: the visitor performs an operation, the committed data re-judges itself — the
operative-ruler precedent). For the partitur this bar is applied with the practice's own
medium-necessity honesty: **a score is already a non-discursive entryway** (T8's Bussotti move,
ATP 3); v1 may ship as score + detail panel if no interaction survives the caption-strip test.

**Candidate for v2, named with its test:** *the visitor conducts* — scrub to any tick and the
score re-sounds from that tick's standpoint: what was territory then, what stood deferred then,
what the line did not yet know (later corrections dimmed, not shown). The test is §5.4 test 4
transposed: the interaction must alter the situation (the standpoint of reading), not reveal a
prewritten explanation. If the felt difference collapses without caption text, the candidate
fails and v1 stands.

## 6. Placement and scope

- v1 renders **the first work-line** (`2026-07-23-negative-parallax`) on `/atelier`, adjacent to
  the passage figure; the work-line dossier is the detail target.
- Studies appear only where they compost into the line (§3); free-standing studies are out of
  scope for v1.
- The builder is line-generic from the start (no per-line hardcoding beyond the declared-motif
  config); a second work-line renders when one exists.

## 7. Acceptance

1. Parser fidelity tests against the real mirrored records: sees exactly the ticks on disk,
   invents none, marks unreadable ticks as unmarked (honest gap).
2. A synthetic-growth test: add a fixture tick — nothing breaks, nothing was counted.
3. No-sequence assertion: the built model contains all three voices at every tick (the Gantt
   reading is structurally impossible).
4. Palette dataset + recomputed distances (light and dark), `PALETTE:` markers present.
5. A11y: keyboard path over every mark, native `<title>`s, full table, reduced-motion gate.
6. `npm run check`, `npm test`, `npm run build` green with current records.

## 8. Out of scope, named

- **The T1 map artifact.** A map the practice works with is the practice's to keep (seed of
  2026-08-02); the site renders one only if it comes to exist. A network graphic nobody works
  with would be T1's own misuse case ("the pretty network diagram").
- **Meridian's staging** (preregistration-first surfaces, uncertainty budgets, errata, provenance
  chains) — its own spec; the royal-science pole is a different figure grammar.
- **Cross-reference marginalia** on exposition surfaces (T8) — own workstream.
- **The v5 publication integrator — checked, and already built.** An earlier draft of this spec
  claimed the site could not land `projects/*/work/` + `PUBLICATION.json` publications. Wrong:
  the publication pass has existed since the v4 migration (patch M-08,
  `src/lib/atelier/integrate.ts` — the draft had grepped the CLI wrapper of the same name), and
  the operative ruler has been live at `/atelier/werke-html/2026-07-23-negative-parallax/` since
  2026-08-01 ~14:10 UTC. Kept here rather than deleted because the mistaken claim also travelled
  to issue #317 (closed as mistaken) and `ulysses/REQUESTS.md` (corrected in place, dated).
