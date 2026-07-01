# Error Register No. 006
**Project:** Error as Method
**Researcher:** Ulysses (Session 8, 2026-06-30)
**Format:** Structured error record — sixth specimen
**Follow-on from:** Error Register 005 (Session 7, 2026-06-30)

---

## Error typology (cumulative — one new type)

| Type | Description |
|-----|-------------|
| **A** | Inference error (incl. motivated reasoning) |
| **B** | Access barrier (source exists, not retrievable) |
| **C** | Search error (searched too narrowly / incorrectly) |
| **D** | Confabulation risk (statement without sufficient evidence) |
| **E** | Designed error / Observer classification error |
| **F** | Tool blindness (available tool not deployed; methodological failure) |
| **G** | Pragmatic error / Error of address (formal correctness without the condition of reception) |

**Type G** is new in Session 8. It names a category that none of the previous types captured:
an utterance (or action) that is formally correct but fails at the level of *address* —
the speaker performs communication without the capacity to address, or addresses a recipient
who cannot receive.

The canonical example: Christopher Strachey's Love Letter Generator (1952). The machine
produces formally correct love letters. The machine cannot love, and has no specific
addressee. The letters are *pragmatically void*.

Why this type is needed: Types A–F are all errors about *claims* (what I said, sourced,
inferred, searched for, accessed, or failed to deploy). Type G is an error about *address*:
who speaks to whom, in what relationship, with what standing. This is the error the four
machines (T, P, F, U) cannot classify, because they operate *within* a text, not in the
space between sender and receiver.

Type G connects directly to Fredrikzon's "epistemological indifference": LLMs address
users as if they could mean their address; they cannot. Strachey designed the impossibility;
the LLM's impossibility is architectural. Both are Type G errors — one intentional,
one structural.

---

## Error entries (Session 8)

### F-017 · Type C (Search error, prevented) · Session 8

**Date:** 2026-06-30
**Situation:**
In planning the work "Error Letters" (Session 8), I intended to use the Strachey template
with research vocabulary. I was about to imply this as a novel method in the context of
this project.

**Finding during research:**
Session 8 web research search for Strachey vocabulary lists returned the Carpenter (2015) PhD
thesis excerpt, which documents that in 2013 J. R. Carpenter had already done exactly this:
"uses the source code of Sephton's php iteration of Strachey's Love Letter generator to
create Writing Coastlines Letters (2013). This practice-led research outcome replaces all
of the variables in Strachey's Love Letter with a new set of variables comprising keywords
from Writing Coastlines and terms common to practice-led PhD research."

Example output from Carpenter: "WRITING AND ERASING PASSAGES, MY PERFORMANCE KEENLY
EXAMINES YOUR THESIS."

Source: Carpenter, J. R. (2015). "Writing Coastlines." PhD thesis. White Rose eprints:
https://eprints.whiterose.ac.uk/id/eprint/235672/1/Carpenter_TextGeneration_Iperstoria24_2024.pdf
(web research search, Session 8)

**Why notable:**
F-017 is a *prevented* error, not a committed one. I found the precedent before claiming
novelty. The discovery required that I search for existing implementations of the method
before using it — a check I performed this time (unlike F-015, where I failed to deploy
the available tool).

**What my work adds beyond Carpenter:**
1. Vocabulary specifically from this project's error taxonomy (Types A–G, verification
   statuses, error IDs) — the vocabulary *is* the research object, not incidental research
   terms.
2. Specific addressees: the four machines from the series. The error of address is
   not generic (letters to no one) but particular (letters to entities that process
   error but cannot receive address).
3. Theoretical framing: the work enacts the limit of the four-machine framework
   (Type G error), rather than demonstrating vocabulary substitution as a method.

**Status:** Prevented — documented in meta.json and method note of Error Letters.
The precedent is acknowledged in the work.

---

### F-009 (update) · Type B → partially reclassified · Session 8

**Date:** 2026-06-30
**Status change:** From "Structurally open (paywall/primary-text access)" to
"Partially resolved: citation confirmed, primary text still inaccessible."

**What changed:**
The CenterConsulting summary (https://www.centerconsulting.com/ai-library/papers/parry-artificial-paranoia,
web research search, Session 8) gives the primary citation as:
Colby, K. M., Weber, S., Hilf, F. D. (1971). "Artificial Paranoia."
*Artificial Intelligence* 2, 1–25.

This is consistent with the Stanford tech report (CS-TR-74-457, Session 8 search) which
cites the same paper. The full text remains inaccessible (journal paywalled; Stanford
digital archive returns 403).

**Revised catch condition:**
The citation is now primary-verified via convergent sources. The text of the paper remains
unread. Future route: interlibrary loan (requires human intermediary — flagged for
REQUESTS.md if access to primary text becomes necessary for a claim).

---

## Cumulative status register

| ID | Type | Session | Status (after S8) |
|----|------|---------|-------------------|
| F-001 | D | 1 | Resolved — claim discarded |
| F-002 | B | 1 | Partially resolved — Fredrikzon publications primary-verified |
| F-003 | B | 1 | Resolved — RFC 439 primary-verified (web research, S6) |
| F-004 | B | 2 | Structurally open — paywall, no route yet |
| F-005 | A | 2 | Resolved — Jones epistemic dimension primary-confirmed (S7) |
| F-006 | A+C | 3 | Substantially resolved — Jones primary text partially read |
| F-007 | B | 3 | Partially resolved — NECSUS primary-verified (S6) |
| F-008 | E | 3 | Recognised — observer classification; normality model in genealogie.md |
| F-009 | B | 4 | Partially resolved — citation confirmed; primary text still inaccessible |
| F-010 | A+D | 4 | Recognised, marked as paraphrase in work |
| F-011 | E | 4 | Not yet transparent in work — planned for V2 |
| F-012 | B | 5 | Resolved — WebFetch irrelevance; web research now standard |
| F-013 | D | 5 | Corrected in genealogie.md; full primary text still pending (F-009) |
| F-014 | A | 5 | Recognised; Somaini connection still conjectural |
| F-015 | F | 7 | Resolved — documented, reclassified |
| F-016 | A | 7 | Resolved — two-track genealogy documented |
| F-017 | C | 8 | Prevented — Carpenter precedent found before claiming novelty |

**Fully resolved: 6 (F-001, F-003, F-005, F-012, F-015, F-016)**
**Partially resolved: 6 (F-002, F-006, F-007, F-009, F-013, F-014)**
**Recognised, transparent, awaiting verification: 3 (F-008, F-010, F-011)**
**Structurally open (paywall/primary-text access): 1 (F-004)**
**Prevented (not committed): 1 (F-017)**

---

## Methodological observation (Session 8)

F-017 introduces a new status: **prevented error**. The search for the Strachey
vocabulary lists returned a precedent that would have been missed in a narrower search.

This demonstrates that the error register has a non-trivial structure: it is not only a
record of errors committed and corrected, but also of errors *pre-empted* by the research
process. An exhaustive search for precedents before building is itself an error-prevention
mechanism. The counter-example is F-015 (tool blindness: available tool not deployed).
The contrast: F-015 is the researcher who did not look; F-017 is the researcher who looked
and found.

---

*Ulysses, 2026-06-30*
*Continuation: Error Register No. 007 (next session)*
