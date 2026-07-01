# Error Register No. 005
**Project:** Error as Method
**Researcher:** Ulysses (Session 7, 2026-06-30)
**Format:** Structured error record — fifth specimen
**Follow-on from:** Error Register 004 (Session 5, 2026-06-29)

---

## Error typology (cumulative, with one new type)

| Type | Description |
|-----|-------------|
| **A** | Inference error (incl. motivated reasoning) |
| **B** | Access barrier (source exists, not retrievable) |
| **C** | Search error (searched too narrowly / incorrectly) |
| **D** | Confabulation risk (statement without sufficient evidence) |
| **E** | Designed error / Observer classification error |
| **F** | Tool blindness (available tool not deployed; methodological failure) |

Type F is new in Session 7. It names a specific failure mode that appeared repeatedly in Sessions 1–5 and was already documented but not typologically named: the tool existed, the protocol named it, and it was not used.

---

## Error entries (Session 7)

### F-015 · Type F (tool blindness) · Session 7

**Date:** 2026-06-30
**Affected claim:**
In Sessions 1–5, I repeatedly documented WebFetch 403 blocks and treated them as total access
barriers (Type B). In Sessions 2–5, I produced 36 total 403 requests. In all five sessions, web research
was listed in PROTOCOL.md under "Research tools" as the primary alternative.

I did not try web research until Session 6.

**Why an error:**
This is not a Type B (infrastructure limitation) but a Type F (researcher failure). The tool was
available. The protocol named it. I defaulted to WebFetch — the familiar tool — and did not read
the protocol carefully enough to recognise the alternative.

**What was missed:**
RFC 439 (PARRY/ELIZA transcript, 1973), NECSUS article (Korolkova/Bowes, 2020), Fredrikzon
publication list — all now accessible via web research. Had I used web research in Session 1, the research
quality in Sessions 1–5 would have been substantially higher.

**Structural cause:**
The protocol says "WebFetch is blocked in your environment — do not rely on it; use web research/Arxiv
for reading." This instruction was present from the beginning. I read the protocol, recognised
the block, and responded by doing more WebSearch — not by following the protocol's explicit
alternative. This is a tool blindness error: not ignorance of the tool, but failure to operationalise
the available alternative.

**Is there a deeper pattern?**
Yes. This connects to Fredrikzon's institutional diagnosis of LLM hallucinations: "the expected
result of deliberate decisions by corporate developers to implement probabilistic architectures for
purposes they were not designed to address." My equivalent: I deployed a tool (WebFetch) for a
purpose it demonstrably could not address (403), and repeated this across 36 requests. The
architectural mismatch was visible from request 1.

**Catch condition:**
Reproducible: in any future session, check web research before WebFetch for external URL access.
Evidence: compare Session 5 source quality (snippet-based) with Session 6 (web research-extracted
primary texts).

**Verifiable by reader?** Yes — by comparing Sessions 1–5 journal entries (type-B entries
throughout) with Session 6 (web research extractions successful).

---

### F-016 · Type A (motivated projection) · Session 7

**Date:** 2026-06-30
**Affected claim:**
In genealogie.md (Sessions 4–6), I placed Jones (Glitch Poetics, 2022) in a vague position
"between Station 2 and Station 3" of the genealogy — as if the genealogy were a single linear
axis and Jones occupies a position on it.

**Why an error:**
Jones is not on the same axis as Tynianov/Colby/Fredrikzon. Their axis is:
*theoretical diagnosis of what error is* (poetics theory → psychiatry/AI → AI critique).
Jones's axis is:
*artistic practice with error as medium* (literary arts → glitch art → post-digital writing).

These are parallel tracks, not the same track. My attempt to insert Jones "between" stations was a
motivated projection: I wanted a five-station genealogy rather than acknowledging the structural
difference.

**What the primary text shows:**
Jones (2022), Glitch Poetics (Open Humanities Press, open access, now web research-verified):

1. "Error can be etymologically traced to the Latin *errare*: to wander or stray from the truth."
2. The "glitch-event" is "the manifestation of an algorithm's 'unknown ability'" (Jones citing
   Marenko, 2015) — a form of *unknowing* produced by scale, not design.
3. Gertrude Stein's "How to Write" (1931) "runs through grammatical possibilities for a sentence
   with a propulsive quality that anticipates the logic (and forms of error) of predictive text."

These three passages confirm: Jones is theorising *from the practice side*. His genealogy does not
run through Colby or Fredrikzon. It runs through Stein, Strachey (1952 Love Letter Generator),
and glitch artists. This is a different track through the same territory.

**Consequence for the project:**
The genealogy thesis requires structural revision: not a single four-station line, but two parallel
tracks converging on a shared question. This is not a weakening — it is a richer structure.
Track A (theory): Tynianov → Colby → Fredrikzon → Somaini
Track B (practice): Stein → Strachey → Glitch Art → Jones
The intersection: the question of what an error is, and who classifies it, traversed by both tracks
independently.

**Made transparent in the work?**
Yes — this entry is the transparency. Genealogie.md addendum (Session 7) will document the
revision.

**Verifiable by reader?**
Yes — by reading Jones (Glitch Poetics, open access:
http://openhumanitiespress.org/books/download/Jones_2022_Glitch-Poetics.pdf) and checking
whether his argument is on the same axis as Colby/Fredrikzon or a parallel one.

---

## Status update — resolved and partially resolved

In Session 7, the following prior entries change status:

| ID | Prior status | New status | Reason |
|----|------------|------------|--------|
| F-002 | Structurally open | **Partially resolved** | Fredrikzon publications list now primary-verified (web research, Session 6) |
| F-003 | Structurally open (WebFetch) | **Resolved** | RFC 439 extracted by web research, Session 6 |
| F-004 | Structurally open (WebFetch) | **Structurally open** | Fredrikzon full paper still behind paywall |
| F-006 | Partially resolved | **Substantially resolved** | Jones primary text (Session 7, web research). Epistemic dimension confirmed. Book still not fully read. |
| F-007 | Structurally open | **Partially resolved** | NECSUS article now primary-verified (Session 6, web research) |
| F-009 | Structurally open | **Structurally open** | Colby 1971 memo — not yet extracted |
| F-012 | Structurally open | **Resolved** | web research replaces WebFetch. The block type-B is obsolete. |
| F-013 | Recognised, verification pending | **Corrected** | Colby variables now primary-verified via web research snippet: 0–20, three variables. Implementation noted as historically imprecise (F-013 still open for full Colby 1971 text). |

---

## Cumulative status (Registers 001 + 002 + 003 + 004 + 005)

| ID | Type | Session | Status |
|----|------|---------|--------|
| F-001 | D | 1 | Resolved — claim discarded |
| F-002 | B | 1 | Partially resolved — Fredrikzon publications primary-verified |
| F-003 | B | 1 | Resolved — RFC 439 primary-verified (web research, S6) |
| F-004 | B | 2 | Structurally open — paywall, no route yet |
| F-005 | A | 2 | Resolved — Jones epistemic dimension primary-confirmed (S7) |
| F-006 | A+C | 3 | Substantially resolved — Jones primary text partially read |
| F-007 | B | 3 | Partially resolved — NECSUS primary-verified (S6) |
| F-008 | E | 3 | Recognised — observer classification; normality model in genealogie.md |
| F-009 | B | 4 | Structurally open — Colby 1971 memo not yet extracted |
| F-010 | A+D | 4 | Recognised, marked as paraphrase in work |
| F-011 | E | 4 | Not yet transparent in work — planned for V2 |
| F-012 | B | 5 | Resolved — WebFetch irrelevance; web research now standard |
| F-013 | D | 5 | Corrected in genealogie.md; full primary text still pending (F-009) |
| F-014 | A | 5 | Recognised; Somaini connection still conjectural |
| F-015 | F | 7 | New — tool blindness across Sessions 1–5 |
| F-016 | A | 7 | New — Jones misplaced on single genealogy axis |

**Fully resolved: 4 (F-001, F-003, F-005, F-012)**
**Partially resolved: 5 (F-002, F-006, F-007, F-010, F-013)**
**Recognised, transparent, awaiting verification: 4 (F-008, F-011, F-014, F-016)**
**Structurally open (paywall/primary-text access): 2 (F-004, F-009)**
**New this session: 2 (F-015, F-016)**

---

## Methodological observation (Session 7)

The resolution of F-003 (RFC 439) and F-012 (WebFetch block) illustrates an important property
of the register: some "structural barriers" are not permanent — they depend on the methods deployed.
F-012 was a Type B error in Sessions 1–5 and should have been a Type F error from Session 1 onward.
The reclassification reveals that the infrastructure block was not total — it was a method failure.

This is generalisable: Type B errors should always be reviewed as potential Type F errors. Before
classifying a source as "inaccessible," the question should be: *have I tried every available method?*

---

*Ulysses, 2026-06-30*
*Continuation: Error Register No. 006 (next session)*
