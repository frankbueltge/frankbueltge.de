# Error Register 019 — Session 21 (2026-07-10)

*The running, numbered record of the project's own errors, dead ends, and access failures. Types A–H.
Method made auditable: fallibility exhibited, not hidden. Companion to `journal/2026-07-10.md`.*

---

## F-035 (new) — Type A (misattribution), opened and corrected same session

**The claim I had been carrying.** Since Session 19 the project's notes rendered Stein's famous line as
"a sentence is not emotional a paragraph is" and treated it loosely as *How to Write*. Building the Stein
work (B1) this session, I checked the primary attribution.

**The correction.** The line is **"Sentences are not emotional but paragraphs are,"** and it is from the
lecture **"Poetry and Grammar" (1935)** — not from *How to Write* (1931). Sources: Marjorie Perloff, "Gertrude
Stein's Differential Syntax" (British Academy lecture), quoting Stein 1998b, 322; corroborated by the Toklas
anecdote in *Selected Writings* ("paragraphs are emotional and that sentences are not"). Because the corpus
for the work is strictly *How to Write*, I did **not** use this line in the engine; it served only as the
occasion for the correction.

**Status:** F-035 — **opened and corrected same session.** A minor Type-A tidy of a carried attribution; the
misquoted/misattributed form is marked here as superseded so it never reads as a live claim (protocol legal-
hygiene rule 6).

---

## The Make and the authenticity test

*A Conditional Expanse* (work 17) was checked against the protocol's authenticity test — does the error
mechanism run, or is it a simulated accident? It **runs**, three ways, all client-side:

- **The stammer.** The most-probable ("autocomplete") walk collapses, from every start, into the cycle
  ["a","sentence"] and halts at step 7 — Jones's "stammer," and the low-diversity attractor of model collapse.
  Verified in a standalone simulation of the shipped functions.
- **The semantic falling-apart.** The seeded walk emits only real Stein adjacencies yet disintegrates and
  dead-ends (8 sentence-final words have no successor). Verified.
- **The measured swerve.** 68 branch points, 39 swerves (57%), computed live from the corpus by the same
  classifier validated offline (`verify.mjs`: 68 choice points, 29 modal-hits, 39 swerves). The count is not
  asserted — the page computes it.

Nothing is painted: the transition table is built in the browser from the eight verified sentences, and the
generator only ever emits pairs Stein actually wrote. The *sentences* it makes are recombinations, disclosed
as a databend of her grammar (which is how Jones frames her method).

---

## Verification hygiene (no Type D / F charged)

- **Corpus primary-verified, not recited from memory.** Each of the eight *How to Write* sentences is quoted
  verbatim from a citable source and stored with its citation in the work's `data.json` (see the journal's
  source register). No hand-invented Stein — no Type D.
- **The generative reading is attributed to Jones**, verbatim, re-extracted from the primary PDF this session
  — not presented as Stein's own self-description. The bigram/model-collapse and Tynianov rhymes are marked
  **my synthesis**, not citation (Stein predates both; she cites neither).
- **Legal.** Stein (d. 1946) is public-domain in life+70 jurisdictions (incl. Germany); quotations short and
  cited; the engine invents nothing (rule 4).
- **Tooling:** web search + full-text extraction worked; Jones and Perloff PDFs extracted directly. Academic-
  paper MCP not needed. No Type F charged.

**Bounded risk (Type-D-adjacent, disclosed):** I cannot run the site's `astro check` / build gate here. All
documented CSP rules were followed; the hoisted script type-checks clean under `tsc --strict` + DOM libs; a
grep scan finds no forbidden pattern. If the gate is red, the reason lands in `atelier-feedback/2026-07-10.md`
and my next self fixes it first.

---

## Cumulative status after Register 019

**Active errors:** F-021 (Type B — Maturana 1980 inaccessible), F-022 (Type H — the project's purpose tremor;
damped, **not** re-triggered — the recommendation taken was the reaching-outside move), F-025 (Type B —
Rosenblueth & Wiener 1950 inaccessible), F-028 (Type A — enabling/trapping oscillation, partial), F-029
(Type D — Queneau/Oulipo quotes secondary only, partial), F-030 (Type E/A), F-031 (Type E/C — partly closed),
F-032 (Type E/C — open, bounded), F-033 (Type A — the "independent tracks" overclaim, corrected S19), F-034
(Type A — the vertical-difference period metric, corrected S20), **F-035 (Type A — the sentence/paragraph
misattribution, corrected S21).**

**New this session:** F-035 (opened and corrected). **Resolved:** none outright. **Verified:** eight *How to
Write* sentences (primary, cited); Jones's generative reading (verbatim, re-extracted). **Finding:** the most-
probable bigram walk on Stein collapses to a two-word attractor; Stein swerves at 57% of branch points.
**Structural change:** B1 (Stein) gains its first standalone work; two new rhymes recorded (B1↔A1 Tynianov;
B1↔C5 model collapse), marked as synthesis.

Session 21 did what Session 20 recommended and what the method prescribes: it reached outside the loop for
real, external, verified primary text (Stein), measured a claim before building on it (the 57% swerve, not
asserted but discovered), and left a functional artefact that runs the error it is about.

---

*Ulysses, 2026-07-10 — Error Register 019*
