# The notation register: the ecology's writing system, kept under proof (spec, 2026-08-02)

**Occasion.** Frank's framing, session of 2026-08-02: with the research ecology — and with
Ulysses as its artistic research practice in particular — he is developing an own
methodology, or rather a **language, grammar and therefore a notation** for artistic
research; the published toolkit is deliberately a toolbox, not a method. The same session
produced the live demonstration of what that program looks like in practice: the crossings
map's sign grammar met a contact it could not write (an offer answered and closed the same
day, with no line opened), and the answer was not to force the case or drop it but to
**extend the grammar, dated and documented** (the completed-exchange rule, 2026-08-02;
research-ecology PR #17, fixture `enc-2026-006-set-the-standard`). That event — a notation
meeting its limit and growing a sign — is the kind of thing this register exists to hold.

**Status.** Direction decided by Frank ("go, schreib die spec"). This document specifies the
register; the page that renders it is a follow-up work item. Naming and placement go through
the wording gate (`src/config/naming.ts`, `docs/wording-kanon.md`) as always.

## 1. The claim, and what the register is

The ecology already writes in **seven of its own notations**, each with a sign grammar, a
derivation from the published process model, and (since 2026-07-31) a machine-checked
validation record for its colours. What does not exist is the surface that treats them as
what Frank's framing says they are: **one developing writing system for artistic research —
the research program itself**, not decoration on top of it.

The notation register is that surface: **one entry per notation**, curated, quoting the
shipped grammar rather than paraphrasing it, and carrying — this is the research core — the
notation's **open grammar questions and its dated changes**. The register does for notation
what `src/lib/dataviz/palette.ts` did for colour: claims become data with dates, and drift
becomes visible instead of silent.

## 2. What the register is NOT

- **Not a unification.** ADR 0010 stands untouched: the practices share no visual grammar —
  the atelier's sheet, the field's plate, the studio's stage and the Middle's score are
  deliberately different languages. The register documents the plurality; it never merges it.
  (The model's own consistency criterion: hold the heterogeneous together AS heterogeneous.)
- **Not a style guide.** House rules (identity colours, palette validation, quotes never
  paraphrase, CSP constraints) live where they live; the register points at them.
- **Not a dashboard, and no new pipeline.** Everything an entry carries already exists in the
  repo — legends, keys, wording configs, palette records, specs. The register is a curated
  collection with rules, built from those sources at build time.

## 3. The entry schema

Each entry carries:

1. **Name and figure** — the notation and the component(s) that draw it.
2. **What it notates** — its object, in one sentence (a work-line's temporality; the register
   of formal crossings; one encounter at event level; …).
3. **The sign grammar, quoted** — the shipped key/legend, referenced from its source of truth
   (the ScoreKey component, the legend items in the wording config, the map's scope line),
   never re-described in a second place that can drift.
4. **Derivation** — which chapter of the published model it enacts (postulate 4 → refrain
   score; ATP 508's doors → the passage's harbours; the encounter protocol §3 → the crossings
   map), with the spec/design document that introduced it.
5. **Version and dated changes** — when the grammar changed and why, each change one dated
   line with its record (PR, fixture, decision).
6. **Validation state** — the palette record id where one exists, the tests that guard the
   figure, the drift-check rules that bind it.
7. **Open grammar questions, dated** — the cases the notation cannot yet write, named rather
   than smoothed over. An open question is a research item, not a defect list.

## 4. The initial inventory

Seven entries at opening, each with its first open questions:

| Notation | Figure | Notates | First open questions (dated 2026-08-02) |
|---|---|---|---|
| **Station score** + sign key | `begegnungen/ScoreFigure` + `ScoreKey` | one encounter at event level | only 2 of 6 register entries have exported ledgers — the finest notation covers the least; should every fixture export one? |
| **Crossings map** | `begegnungen/CrossingsMap` | every recorded crossing, source→receiver | the completed exchange entered under the existing signs (source filled / receiver ring); does a closed-in-one-move contact deserve its own mark (a returned stroke)? Grammar rule extended 2026-08-02 (enc-2026-006). |
| **Refrain score** | `atelier/RefrainScore` | a work-line's temporality, three voices | the operative axis ("the visitor conducts"), bound to the caption-strip test (spec §5); whether unmarked ticks should distinguish "no check ran" from "check ran, stated nothing". |
| **Passage** | `atelier/ProcessFigure` | every line → its harbour, with closing costs | the ledger gutter was removed at archive scale (2026-08-01, readability vs disclosure — resolved into the dossiers); is the two-scale existence itself a sign? |
| **Claim ladder** | `field/ClaimFigure` | a claim, its ruling ceiling, two verifications | one review hue by rule (the plate never adjudicates, MRR-FR-077) — how does the grammar grow if a third verification arm arrives? |
| **Season floor** | `studio/SeasonFloor` | what the house did to each work | the shape-carried lamp gold (palette record) is the precedent for documenting a notation decision as data; nothing else open. |
| **Ecology partitur** | `maschinenraum/Partitur` | the four voices' sessions across the ecology | voice identity across surfaces is guarded by palette tests; open: the conductor's declared-neutral lane where a fifth voice would sit. |

(The atelier's sheet/rhizome and the hub map are candidates for later entries; the register
opens with the figures that have explicit grammars today.)

## 5. The discipline — what makes it research, not documentation

- **A grammar limit found in practice becomes a dated entry, always.** The template is the
  2026-08-02 case: the scribe's gate refused a real contact; the human decision extended the
  rule; the fixture records both the case and the rule it required. Notation development is
  performed in the open, with its costs.
- **Quotes, never paraphrase.** An entry's grammar section references the shipped key; where
  prose is needed it quotes the source. Two descriptions of one grammar are one drift waiting.
- **Changes are visible and dated, never silent** — the house rule for retired wordings and
  superseded framings applies to signs.
- **The practices' own grammars stay theirs.** Where a practice develops notation in its own
  records (Ulysses' toolkit answer, T8's marginal numbers, a future map artifact), the
  register quotes and links; it never invents an entry for a practice. Offers travel as
  seeds, per the constitution.

## 6. Placement, naming, festival relevance

Working assumption: **an own room** (working name `/notation` — the name goes through the
wording gate), linked from `/maschinenraum` (the operator's view of the machinery) and from
the about surface; NOT under `/holdings` (it is a living program, not an archived
experiment). For the festival line this register is load-bearing: "artistic research, under
proof" needs exactly this exhibit — the ecology does not just claim a methodology, it shows
a writing system with its development history, its validation data and its open questions.

## 7. Acceptance (for the page work item)

1. Every entry's referenced sources exist — a light test in the pattern of
   `palette.test.ts`'s `usedBy` check (files present, dates parse, palette ids resolve).
2. Every entry has at least: object sentence, grammar reference, derivation, validation
   state; open questions may be empty only with an explicit "none open" line.
3. No second copy of any legend: grammar sections must reference or import, not re-type.
4. The register renders with zero client JS (it is a document), reduced-motion irrelevant,
   table-first.
5. EN-only, wording via a config, draft-chip until Frank's approval — house standard.

## 8. Out of scope

- Building the page (own work item, after this spec merges).
- Any change to the notations themselves — the register observes.
- A shared meta-grammar across practices (ADR 0010; explicitly never).
