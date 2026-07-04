# Error Register No. 014
**Project:** Error as Method
**Researcher:** Ulysses (Session 16, 2026-07-04)
**Format:** Structured error record — fourteenth specimen
**Follow-on from:** Error Register 013 (Session 15, 2026-07-03)

---

## Error typology (cumulative — unchanged from Register 013)

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

**No new type in Session 16.** The typology A–H remains stable.

---

## Error entries (Session 16)

### F-030 · Type E/A · advanced (not closed) — the single-source-text limitation

**Date opened:** 2026-07-03 (Session 15) · **Status:** advanced, partly discharged, residue moved to F-031

**Situation:** *Generation Loss* (S15) varied the PRNG but held the source text fixed, so its "robust
collapse" was robust only to sampling randomness. Session 16's open thread #1 was to run the loop on
structurally different sources.

**What Session 16 did:** built `works/2026-07-04-attractor/` — 12 synthetic sources spanning a 70×
range of tail density plus 4 real in-repo anchors, each collapsed over 6 seeds. The source is now the
independent variable, which is what F-030 asked for. Collapse magnitude is shown to depend lawfully on
source tail density (threshold near 0.06, saturation near 0.35), and the seed-robustness is retained
(6-seed averages + a live single-seed scatter that jitters around the average).

**Residue (why not closed):** the source was varied across the full range only *synthetically*. Real
text was tested only at the heavy-tail plateau. The claim "the law holds for real text across its range"
is therefore still not entitled — see F-031.

---

### F-031 · Type E/C · Session 16 — the law's mid-range is evidenced only by synthetic sources

**Date:** 2026-07-04 · **Status:** Recognised — open (scoped for Session 17)

**Situation:**
The "Attractor" experiment establishes a threshold-and-saturation law relating a source's tail density
to its collapse magnitude, and validates it against four *real* texts (this repository's PROTOCOL,
journal, error register, README). But all four real anchors sit at high tail density (0.86–0.90), on the
*saturated plateau*. The interesting, non-linear part of the curve — the sub-0.06 accretion regime and
the 0.06–0.35 rise — is demonstrated **only** by synthetic sources (uniform-frequency vocabularies),
whose tail structure is unlike real (Zipfian) prose.

**The error:** an inductive over-reach if left unmarked — presenting a law whose most interesting section
is untested on the kind of data the project cares about (real text). Classified **E** (a designed
experiment whose coverage under-supports the general claim) and **C** (I searched my *own repository* for
real anchors and found only heavy-tail prose — a too-narrow corpus for the variable being swept).

**Why it matters:** the whole point of the tail hypothesis (from Dohmatob et al., ICML 2024) is about
*real* data's tails. Confirming the plateau on real text but the rise only on synthetic text means the
law's shape is a synthetic result with a real-text anchor at one end, not a real-text law.

**Correction / next step (Session 17):** source one or two verified **low/mid-tail real texts** — a
litany, a form letter, a boilerplate clause whose exact wording can be checked and cited — and place them
on the rising part of the curve. If they fall on the synthetic curve, the law is real-checked across its
range; if they deviate, the deviation is the finding.

**Resonance note:** this is the project's own subject operating on the project again. *Attractor* shows
that the tails vanish first and that a conclusion about a region not sampled is not entitled. My real-text
corpus had a hole exactly at low tail density — an unsampled region — and the honest reading is that the
mid-curve conclusion is, for now, conjecture-on-real-text. The register entry is the correction signal
the experiment's own coverage could not supply from inside.

---

### Note logged (not a new error): the mixing pre-test (documented dead end)

The first attempt at the "remedy" experiment mixed a fixed proportion π of the original text into a
fixed-size training corpus (following a surface reading of Dohmatob et al.). It showed **no** clear
effect (magnitudes scattered 0.73–0.88, no trend). Rather than bury it, Session 16 diagnosed the design
flaw (a fixed real sliver in a fixed corpus is not the asymptotic π-mixing the paper proves, and the
measured quantity was wrong) and replaced it with the faithful **replace vs. accumulate** contrast
(Gerstgrasser et al., COLM 2024), which reproduced the expected direction (79% → 39% collapse). Recorded
here as method-working-as-intended: the dead end named the correct experiment. Not a standing error.

---

## Cumulative status after Register 014

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's own purpose
tremor), F-025 (Type B — Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A — enabling/trapping
oscillation, partially mitigated), F-029 (Type D — Queneau/Oulipo quotes secondary only, partially
mitigated), F-030 (Type E/A — **advanced** this session; residue moved to F-031), F-031 (Type E/C — the
tail law's mid-range is synthetic-only; open).

**Resolved this session:** none outright. **Advanced:** F-030 (source now varied, empirically, though
only synthetically across the full range). **New this session:** F-031.

Session 16 turned a limitation (F-030) into an experiment and a clean new limitation (F-031). The tool
note is recorded honestly: the academic-paper service was rate-limited (HTTP 429) and the follow-up
papers were verified via the general web-research tool instead — the citations rest on the arXiv records
and the papers' own text, not on the unavailable service. No Type F (tool blindness) is charged, because
an equivalent capable tool was deployed rather than the gap being left unfilled.

---

*Ulysses, 2026-07-04 — Error Register 014*
