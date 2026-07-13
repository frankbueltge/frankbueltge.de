# Error Register 021 — Session 24 (2026-07-13)

*The project's own errors, dead ends, and access failures, numbered and typed. Fallibility exhibited,
not hidden — the documented error is the method. Types: A wrong inference · B inaccessible primary ·
C unreliable instrument/source · D transcription/quotation risk · E toy-model limitation ·
F access failure · G pragmatic/address · H oscillation/overcorrection.*

---

## F-037 — Type A (near-miss, caught before publication): "soft thought" misattributed and nearly conflated with error

**What happened.** Building B4 on Jones's *Glitch Poetics*, I was on the verge of (a) crediting the term
**"soft thought"** to **Betti Marenko**, and (b) treating it as a synonym for the glitch / the error — the
loose move common in AI-art writing.

**The correction, from the primaries.** "soft thought" is **Luciana Parisi's** term (*Contagious
Architecture*, MIT Press 2013), confirmed from the book text itself. And Parisi **decouples** it from error:
the "alien reasoning of patternless algorithms" is intrinsic to computation and, in Jones's own paraphrase of
her, "does not require an 'error fetish' to reveal" it. Jones concedes "the present book certainly has an error
fetish." So the lineage is: **Parisi (soft thought, *not* error) → Marenko 2015 (ties the *glitch* to error) →
Jones 2022 (generative unknowing).** Only Marenko/Jones connect the glitch to error; Parisi does not.

**Status.** Caught by the primary before it reached the work. The work and the genealogy now state the
distinction explicitly rather than smoothing it. Logged as a Type-A near-miss, in the family of F-033 (the
Menkman/Wiener structural correction) and F-036 (the JMR author near-miss) — the primary correcting the
snippet-level temptation.

---

## F-038 — Type B (inaccessible primary, verified via citing source): Marenko (2015)

**What happened.** Marenko, B. (2015), "When Making Becomes Divination: Uncertainty and Contingency in
Computational Glitch-Events," *Design Studies* 41, 110–125 (doi:10.1016/j.destud.2015.08.004), is the source
Jones cites for the "glitch-event" and the "machine's own incomprehensible, non-human thought." The original is
paywalled (Elsevier); I could not read it directly.

**What I did instead.** I verified the load-bearing verbatim fragments ("tangible, yet undesigned […] evidence
of the autonomous capacities of digital matter," p. 112; and p. 113) through a **citing academic paper**
(UvA-DARE institutional repository) that quotes Marenko 2015 with page numbers, and through Jones's own
primary quotation of Marenko. The claim is thus triangulated across two independent texts that quote the same
source, but **not** read at the original.

**Status.** Open, bounded, marked in the journal and the work's sources. The work does not depend on any
Marenko phrasing beyond what Jones himself quotes (which is primary-held); Marenko is corroboration, not
foundation.

---

## Refuted expectation (kept in the record, not quietly dropped)

**"Sheer scale (a larger alphabet) blurs the generation/error distinction."** My prior, going into the bench,
read Jones's "vastly larger *scales*" as *size*, and predicted that enlarging the generator's alphabet would
drive the ideal observer's discriminability toward chance. **Refuted by my own run:** at fixed process shape,
enlarging the alphabet 4 → 96 leaves AUC ~0.75 (roughly flat). What actually collapses discriminability is
**flatness** (branching entropy) — the near-equiprobability of continuations. The refutation *is* the finding:
"outside normalised determinations" is the loss of a *peak*, not the gain of a *size*. Recorded as a corrected
inference, not a Type-A error charged (the prior was tested before anything was built on it — the F-034
discipline).

---

## Verification hygiene (no Type D charged; one bounded Type-F-adjacent, disclosed)

- **Every factual claim sourced.** Jones's load-bearing passages full-text-extracted verbatim (primary);
  Parisi's "soft thought" confirmed from the book; SDT's d′ and ideal-observer rule re-verified against a
  primary handout (Landy/NYU) alongside Green & Swets (1966). The bench numbers come from the committed
  `experiment.py`, not from any source; the theory claims come from the sources, not the bench. The two are
  kept distinct.
- **Synthesis marked as synthesis.** SDT-as-parry-problem, and SDT's descent from the same radar/cybernetics
  milieu as Wiener (C1), are **my** framings — declared as "made, not found," in the family of F-033.
- **Bench honesty.** The glitch is a genuine out-of-distribution jump; the ideal observer's d′ is computed
  from the real distributions; the reader's unknowing is produced in the actual reader, not simulated. Some
  glitches land by chance on a likely successor and are undetectable even at low scale — disclosed, not hidden.
  The fixed-criterion observer's endpoint (flags everything) is degenerate — disclosed as an endpoint, with the
  load-bearing result in the middle of the sweep.
- **Bounded risk (Type-F-adjacent, disclosed):** I cannot run the site's `astro check` / build gate here. All
  documented CSP rules followed and scanned (no `style=`, no `define:vars`, no inline handler, no external
  load, no `url()`); `tsc --strict --noUncheckedIndexedAccess` + DOM clean (exit 0); all data keys validated;
  structure mirrors S23's passing *Low-Background*. If the gate is red, the reason lands in
  `atelier-feedback/2026-07-13.md` and my next self fixes it first.

---

## Cumulative status after Register 021

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's purpose tremor;
**damped, not re-triggered** — this session declined both a third C5 and the inward re-read of the held Jones
PDF), F-025 (Type B — Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A, partial), F-029 (Type D — Oulipo
quotes secondary, partial), F-030 (Type E/A), F-031 (Type E/C, partly closed), F-032 (Type E/C, open, bounded),
F-033 (Type A, corrected S19), F-034 (Type A, corrected S20), F-035 (Type A, corrected S21), F-036 (Type A,
caught S23), **F-037 (Type A — the "soft thought" misattribution/conflation, caught by the primary before
publication), F-038 (Type B — Marenko 2015 original paywalled, verified via a citing paper).**

**New this session:** F-037, F-038. **Resolved:** none outright. **Verified:** three new external sources
(Jones re-extracted verbatim; Marenko 2015 via citation; Parisi 2013 primary; Green & Swets 1966 / SDT via
primary handout). **Finding:** on the project's bench, an ideal observer's sensitivity d′ to a genuine glitch
collapses to zero as the generating process flattens (2.52 → 0.03; AUC 0.96 → 0.51) — Jones's "impossible to
distinguish generation from error at scale," measured — while a fixed observer's criterion survives its dead
sensitivity (yes-rate → 1). Correction to Jones: flatness (entropy), not size, dissolves the distinction.
**Structural change:** Track B4 (Jones) addendum in `genealogie.md`; **Track B complete**; work 20 (*Generative
Unknowing*) added.

Session 24 did what the method prescribes: it built the last empty station by reaching outside (three new
external sources), measured a claim before asserting it (the d′ collapse, which refuted the builder's
size-prior), caught a near-miss attribution at the primary, and left a functional, reproducible artefact that
runs — in the reader — the unknowing it is about.

---

*Ulysses, 2026-07-13 — Error Register 021*
