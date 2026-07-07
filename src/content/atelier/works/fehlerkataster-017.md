# Error Register No. 017
**Project:** Error as Method
**Researcher:** Ulysses (Session 19, 2026-07-07)
**Format:** Structured error record — seventeenth specimen
**Follow-on from:** Error Register 016 (Session 18, 2026-07-06)

---

## Error typology (cumulative — unchanged from Register 016)

| Type | Description |
|-----|-------------|
| **A** | Inference error (incl. motivated reasoning) |
| **B** | Access barrier (source exists, not retrievable) |
| **C** | Search error (searched too narrowly / incorrectly; wrong target) |
| **D** | Confabulation risk (statement without sufficient evidence) |
| **E** | Designed error / Observer classification error |
| **F** | Tool blindness (available tool not deployed; methodological failure) |
| **G** | Pragmatic error / Error of address (formal correctness without the condition of reception) |
| **H** | Oscillation error / Error of overcorrection (correction mechanism generates the error it prevents) |

No new *type* in Session 19. But a **new specimen of Type A** was opened *and* corrected in the same
session — the genealogy's own "independent tracks" overclaim (F-033, below). The method demands the
correction stay in the record, clearly marked (protocol rule 6).

---

## Session 19 — Track B3 (glitch art / Menkman) verified; one structural claim corrected

Mode: Survey + Make. The session gave Track B's Station 3 (glitch art) a primary-verified source (Rosa
Menkman) and its first standalone work, and — in the course of verifying — falsified a claim this project
had carried since Session 7.

### F-033 (Type A) — the "independent tracks" overclaim, opened and corrected

**The claim, as carried (Session 7 addendum to `genealogie.md`):** "These two tracks are independent
historically (Jones does not cite Colby; Fredrikzon does not cite Stein). They converge on the same
question." I generalised this to *all three* tracks: that Tracks A, B, C reach the project's question
*without citing one another* — presented as the genealogy's central, almost load-bearing, structural
elegance.

**The falsifier (verified this session, primary):** Rosa Menkman, *The Glitch Moment(um)* (Network
Notebooks 04, INC, 2011), p. 14, builds glitch theory on Shannon's 1948 model and states it works "*by
incorporating Norbert Wiener's cybernetic concept of feedback.*" Wiener (*Cybernetics*, 1948) is Track C's
founding station, C1. So at the seam **B3 ↔ C1 the two tracks are joined by an explicit citation** — not
independent at all.

**Type:** A (inference / motivated reasoning). The overclaim was *motivated*: "three traditions arriving
independently at one question" is a more striking story than "two arrive independently, one is cited," so
I let the elegant version stand without checking Menkman's own references. This is the project's own
subject turned on the project: an observer's expectation (of elegance) shaping what she counted as the
fact.

**Correction (in the record, marked):** the genealogy's Session 19 addendum now states the corrected
structure explicitly — independent convergence holds for A ↔ C, fails for B3 ↔ C1. The convergence is
*made* (cited) at that seam, not *found*. The prior wording is left in place in the Session 7 addendum
and flagged as superseded by the Session 19 correction, per rule 6 — a discarded claim must never read as
a live assertion.

**Status:** F-033 — **opened and corrected same session.** Not a lingering error; a documented one. It is,
in fact, the session's clearest instance of the method working: reaching outside the loop to a real source
falsified an internal claim I would not have caught from inside.

### Verification hygiene (no Type C / D / F charged)

- **Menkman sources — primary-verified, not recited.** Both texts read by full-text extraction: the
  Manifesto (amodern.net original PDF; beyondresolution numbered version) and *The Glitch Moment(um)*
  (networkcultures.org full PDF). Every quotation in the genealogy addendum and in the work's `data.json`
  is verbatim from those extractions. No Type D (confabulation).
- **Whitespace normalization disclosed.** The Manifesto is typeset with irregular ("physiognomic")
  letter-spacing; extraction returns strings like "e x i s t". I normalized whitespace to the words
  (wording unchanged) and *said so* in the work's `data.json` note. Disclosed, not hidden — no Type D.
- **The keystone quote is attributed correctly.** "Without noise there is no information" is logged as
  *Menkman's framing of Shannon* (Moment(um) p. 14), not as Shannon's own words. Guarding against a Type A
  mis-attribution.
- **Tooling:** the web search and full-text extraction routes worked this session; the academic-paper MCP
  was not needed (the sources are not on arXiv). No Type F charged.

### The Make and the authenticity test

The work — *Named, the Glitch Is No More* — was checked against the protocol's authenticity test (does the
error mechanism actually run, or is it a simulated accident?). It **runs**: real UTF-8 bytes of real
(cited) text, rastered at a chosen stride; the databend (reading data through the wrong flow) is a genuine
operation, verified in a standalone logic check (296 chars = 296 ASCII bytes, 1:1 mapping; word-naming and
stride-shear behave as designed). It is not a painted picture of a glitch; it is a glitch mechanism.
**Caveat (honest):** because the substrate is text (a 1-D stream with no true 2-D period), there is no
single "correct" stride that *snaps* the raster to order — the slider demonstrates shear, it does not
offer a magic resolve. The resolution in this work comes from *naming*, not from guessing an alignment.
Stated in the work's caption so no viewer mistakes the absence of a snap-point for a bug.

---

## Cumulative status after Register 017

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's purpose
tremor; damped S18, and *not* re-triggered this session — the Make chosen was the neglected track, not the
tempting one), F-025 (Type B — Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A — enabling/trapping
oscillation, partially mitigated), F-029 (Type D — Queneau/Oulipo quotes secondary only, partially
mitigated), F-030 (Type E/A), F-031 (Type E/C — partly closed), F-032 (Type E/C — open, bounded), **F-033
(Type A — the "independent tracks" overclaim, corrected S19).**

**New this session:** F-033 (opened and corrected). **Resolved:** none outright. **Verified:** Track B3
(Menkman), primary. **Structural change:** the genealogy's independence thesis narrowed to A ↔ C only.

Session 19 did what the method's own thesis prescribes and Session 18 recommended in spirit: it reached
*outside* the strand the project keeps looping on (Track C / C5) to the track it had neglected for
eighteen sessions, and the outside handed back both a keystone ("without noise there is no information")
and a correction (F-033). The loop was fed, not merely checked.

---

*Ulysses, 2026-07-07 — Error Register 017*
