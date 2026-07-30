# Apparatus — Negative parallax (the operative ruler)

Lean apparatus register for the PUBLICATION_CANDIDATE. Full disclosure register
(the voice rule's named exception): where this file records provider, model or
version it records them as accurately as the project's own trace allows, and marks
what the trace did not log rather than inventing it (inviolable §2.1).

## The candidate artefact

`sketch-operative-ruler-v3.html` (since 2026-07-30) — a single self-contained
interactive HTML page. The measured parallax φ = −0.40 mas is locked and cannot be
touched; the participant moves only the *claimed precision* σφ (and, separately, the
−17 μas zero-point offset). The same number changes scientific category as φ/σφ
crosses limits the discipline published. No external resource is loaded, no data is
downloaded, nothing is transmitted; it runs entirely client-side on values already
read at their primaries and on record in `TRACE.md` (ticks 2, 8, 15, 16) and
`FIGURE-NOTE.md`.

**Superseded state, preserved unedited:** `sketch-operative-ruler-v2.html` — the
state that passed the caption-strip test (TRACE tick 6) and the state in which the
fault disclosed on 2026-07-30 was found. It is kept beside the candidate, not
replaced, so that the fault and its repair are both inspectable. What v3 changes:
the border's own author's qualification is quoted on the axis; a second published
limit in the same unit (Rybizki's > 4.5σ) is drawn beside Fabricius' −5; the region
name is quoted and attributed rather than asserted; and the precision slider steps
finely enough (0.005 mas) that a value can rest between the two published limits, a
zone v2's step size made unreachable. Full account: `EXPOSITION.md` (correction and
revision entries) and `TRACE.md` ticks 15–16.

**Declared arrangement.** The two limits serve different purposes in their sources
(an illustrative selection limit; a training-set ground truth) and neither paper
draws the other's line. Placing both on one axis is this practice's own
juxtaposition, and the artefact states this in its own page note.

## Agents and roles

| Agent | Role | Human oversight |
|---|---|---|
| Frank Bültge | direction; responsible human; publication decision | — |
| The practice's scheduled model runtime | read the five primaries (Expose, tick 2); drew the consolidation figure (tick 4); built and revised the operative-ruler sketch (ticks 5–6); assembled this candidate (2026-07-25); found and disclosed the border fault (tick 15, 2026-07-30); built the qualified v3 (tick 16, 2026-07-30) | all records human-reviewable; auto-land paths only |

**Model version — disclosed to the limit of the record.** The candidate-assembly
run (2026-07-25) ran on the runtime's Opus 4.8 model. The reading and sketch-building
ticks (2026-07-23/24) were performed by the same scheduled dispatcher runtime; the
project's own trace did not log a per-tick model version, and none is reconstructed
here. The 2026-07-30 ticks (15, fault found; 16, v3 built) ran on the same scheduled
dispatcher runtime under a later model generation; its version identifier is
deliberately not written into this repository record, and this is marked as a
withheld disclosure rather than a gap in the trace. No claim in this project depends
on it (SCORE §6). Model identity is not conceptually relevant to any claim (SCORE §6): the
operation is source-reading, judgement and a hand-built HTML mechanism, not
generation whose provenance is the work's subject.

## Tools

| Tool (generic) | Delegated role | Output use |
|---|---|---|
| web research / web search | retrieve and verify the primary papers and ESA pages; short quotation | sourced facts, verbatim passages |
| academic-paper tool | locate/read the cited methodological primaries (Bailer-Jones, Fabricius, Rybizki, Lindegren, Luri) | citations, values-as-read |

No paid service, no new external cost, no bulk catalogue download (SCORE §6 hard limits held).

## Sources (all read at primaries, TRACE tick 2)

| Reference | Contribution | Authority | Caveat |
|---|---|---|---|
| Luri, X., et al. 2018, *A&A* 616, A9 (arXiv 1804.09376) | the discipline's own "keep the negatives; deletion biases" instruction (§3.1, §4.2) | open access | quoted verbatim, §-located; not reproduced beyond short quotation |
| Bailer-Jones, C.A.L. 2015, *PASP* 127, 994 (arXiv 1507.02105) | "r > 0 by definition"; a negative parallax is not a negative distance; negatives informative under a prior | open access | value-level claim carried verbatim |
| Fabricius, C., et al. 2021, *A&A* 649, A5 | 3.04M EDR3 sources with parallax_over_error < −5 "clearly spurious"; 192.21M with > +5; ≈1.6% spurious estimate; matched-negative-sample method | open access | figures as read at source, not rounded beyond the source's wording |
| Rybizki, J., et al. 2021, *MNRAS* (DOI 10.1093/mnras/stab3588) | fidelity classifier trained on solutions "negative at > 4.5 sigma" (the excised residue as ground-truth) | published | — |
| Lindegren, L., et al. 2021, *A&A* 649, A4 | zero-point offset: quasar median −17 μas, weighted mean −21 μas; correction "at the researcher's discretion" | open access | the scale-level, discretionary value |

Supporting facts (ESA, web research this project): Gaia end-of-observations 15 Jan
2025; passivation/retirement 27 Mar 2025; DR4 scheduled 2 Dec 2026
(https://www.cosmos.esa.int/web/gaia/end-of-observations). Carried in the record as
context; the temporal layer is explicitly **not** leaned on as a meaning-making event
(SCORE §2).

## Values-as-read register

Every number in the artefact is one already read at a primary and on record in TRACE
tick 2 / FIGURE-NOTE: φ/σφ = −5 boundary (Fabricius; Rybizki's > 4.5σ); 3.04M spurious
/ 192.21M positive / ≈1.6% (Fabricius); −17 / −21 μas offset (Lindegren); the Luri
quasar worked case (observed mean −10 μas → biased +0.8 mas on deletion). None is
inferred, fabricated or rounded beyond its source's own wording.

**Added to the artefact at v3 (2026-07-30), both re-verified at their primaries that
run rather than carried on this record's word:**

- Fabricius et al. 2021, §3.2, verbatim: *"We use the limit of five as an illustrative
  example and not as a recommendation."* — the qualification the border's own author
  attached to it, now quoted on the axis. (This record's earlier locator "§3" is
  refined to §3.2; no claim depends on it.)
- Rybizki et al. 2021, abstract, verbatim: *"We devise an extensive sample of manifestly
  bad astrometric solutions, with parallax that is negative at > 4.5 sigma"* — the
  second published limit, drawn beside the first.
- Fabricius et al. 2021, §3.2, verbatim, carried in the page note because the paragraph
  that reaches the "clearly spurious" verdict disqualifies the axis's own unit on the
  way: *"Formal uncertainties can, however, be misleading. They are based on the
  assumption that the source is undisturbed…"* The tension is left standing, unresolved.

The one quantity in v3 that is neither read nor cited is the slider's step size
(0.005 mas). It is an interface parameter, chosen because at v2's 0.01 mas step the
band between the two published limits (σφ = 0.0800 to 0.0889 at the locked φ) contained
no reachable value. Computed, not sourced, and recorded as such (TRACE tick 16 §2.4).

## Public credit line

> Ulysses / Atelier — a situated artistic research practice by Frank Bültge,
> developed through documented human–machine operations.
