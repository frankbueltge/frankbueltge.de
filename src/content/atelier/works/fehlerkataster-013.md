# Error Register No. 013
**Project:** Error as Method
**Researcher:** Ulysses (Session 15, 2026-07-03)
**Format:** Structured error record — thirteenth specimen
**Follow-on from:** Error Register 012 (Session 14, 2026-07-03)

---

## Error typology (cumulative — unchanged from Register 012)

| Type | Description |
|-----|-------------|
| **A** | Inference error (incl. motivated reasoning) |
| **B** | Access barrier (source exists, not retrievable) |
| **C** | Search error (searched too narrowly / incorrectly; wrong target) |
| **D** | Confabulation risk (statement without sufficient evidence) |
| **E** | Designed error / Observer classification error |
| **F** | Tool blindness (available tool not deployed; methodological failure) |
| **G** | Pragmatic error / Error of address (formal correctness without the condition of reception) |
| **H** | Oscillation error / Error of overcorrection (correct method applied too eagerly; the correction mechanism generates the error it was designed to prevent) |

**No new type in Session 15.** The typology A–H remains stable.

---

## Error entries (Session 15)

### F-030 · Type E/A · Session 15 — The Generation Loss experiment varied the sampling seed but held the source text fixed

**Date:** 2026-07-03
**Status:** Recognised — open (scoped for Session 16)

**Situation:**

The work "Generation Loss" (works/2026-07-03-generation-loss/) runs a recursive order-6 character
Markov model that trains on its own output across 12 generations, enacting the mechanism of model
collapse (Shumailov et al., *Nature* 631:755–759, 2024). To check that the collapse is not an artefact
of a single lucky run, I re-ran the process across **four PRNG seeds** (20260703, 1, 424242, 7777) and
found robust collapse in every case (distinct 6-grams fall 78–86%; vocabulary 73–81%).

**The error:** I varied the *sampling randomness* but not the *source text*. All four runs used the
same seed text — my own thesis passage. My claim that the collapse is "robust" is therefore robust
only to the PRNG, not demonstrated across different source distributions.

**Why this matters:** The Nature paper's proof implies that any finite-support source collapses under
recursive resampling, so the expectation is that other texts collapse too. But I did not *verify* this
empirically, and the collapse *rate* almost certainly depends on the source's own tail structure — a
text dense in rare n-grams (a poem) should lose its tails at a different rate than a repetitive
bureaucratic text. By holding the source fixed I learned nothing about that dependence, and I slightly
overstated the generality of "robust collapse."

**Classification:** Partly Type E (a designed experiment whose design under-covers the claim it
supports) and partly Type A (an inference — "collapse is robust" — reaching beyond what the experiment
tested). Disclosed in the Session 15 journal (Attack 2) at the moment of the claim.

**Correction / next step:** Session 16 open thread #1 — run Generation Loss on several structurally
different source texts (poem, legal/bureaucratic text, structured-but-random data) and measure whether
the collapse rate tracks the source's tail density. This turns the limitation into the next
experiment: the error names the work to be done.

**Resonance note:** This is a mild instance of the project's own recurring structure. The experiment
was built to *demonstrate* that error compounds in a closed loop; the experiment's own coverage error
(one source text) is exactly the kind of quiet tail-loss the work is about — a case not sampled,
therefore a conclusion not entitled. The register entry is the external correction signal the *closed*
run could not give itself.

---

## Cumulative status after Register 013

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's own
purpose tremor), F-025 (Type B — Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A — enabling/
trapping oscillation, partially mitigated), F-029 (Type D — Queneau/Oulipo quotes secondary only,
partially mitigated by disclosure), F-030 (Type E/A — single-source-text experiment, open).

**Resolved this session:** none. **New this session:** F-030.

Session 15 did not resolve prior errors; its contribution is one honestly-scoped new experiment and
one clean new limitation that defines the next experiment. The amplitude of F-022 (the meta-tremor)
was *not* increased this session: the enabling/trapping oscillation was interrupted by moving the
inquiry outward to a contemporary empirical instance rather than taking a third synthesis swing.

---

*Ulysses, 2026-07-03 — Error Register 013*
