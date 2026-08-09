# USP audit — the ecology's own works

**Date:** 2026-08-09. **Ordered by:** Frank, afternoon session, extending the USP obligation of
the same morning from the Holdings shelf to the practices' own production ("und die research
ecology werke sind hier noch gar nicht abgebildet, aber bilden auch eine eigene 'machine-run'
ökologie").

**Rule under audit, verbatim (Frank, 2026-08-09):** *"jedes experiment auf frankbueltge.de was
keinen nachweisbaren mehrwert hat oder nicht einzigartig ist … kann eigentlich weg bzw. müsste
überarbeitet werden"* — provable added value or uniqueness, checkable by web research.

**This document is a set of DRAFTS, not decisions**, exactly like the Holdings audit it
extends. Keep / rework / archive calls are Frank's.

## Scope, and what is deliberately not here yet

The three practices hold **59 works with committed metadata** in this repository. Auditing all
59 with real neighbour research is a programme, not a session, and pretending otherwise would
produce the one thing this house forbids: verdicts nobody actually checked.

So the first batch is chosen by a criterion the records themselves supply — **the works that
have already been put in front of someone outside the house.** Those are the ones where prior
art is not academic: a packet lying addressed to a named receiver, or a work that travelled
through an encounter, is a claim already made outward.

| # | Work | Practice | Why in this batch |
|---|---|---|---|
| 1 | Calibration Certificate | Meridian / field | packet prepared for ENAI (post ledger, `2026-08-calibration-certificate`) |
| 2 | Native Speaker | Ensemble / studio | travelled in encounter `enc-2026-001` |
| 3 | No Way of Knowing | Ensemble / studio | travelled in encounter `enc-2026-002` |
| 4 | NO PART | Ensemble / studio | packet prepared for the MacArthur Justice Center (post ledger, `2026-08-no-part`) |

**The remainder: 55 works, unaudited as of 2026-08-09.** Named here rather than left as a silent
gap. They are not thereby judged — an unaudited work is unexamined, not cleared. Next batches
should follow the same criterion outward: works cited by another practice, then works a gate
passed, then the rest. Ulysses' `sixty-cases-decision` (encounter `enc-2026-006`) is not in this
repository at all and can only be audited from the `ulysses` repo.

**Method.** Same as the Holdings audit: each work's own committed `meta.json` read for its
claim, then web searches hunting the **strongest** existing neighbours — the ones that would
embarrass the claim, not flatter it. Searches run 2026-08-09.

---

## 1. Calibration Certificate (`src/components/field/werke/2026-07-01-calibration-gap`)

**(a) Claim.** *"Audits AI text detection tools against their own specifications using
independent benchmarks — the calibration certificate form enacts the failure it documents"*
(`meta.json`). A packet built on this work lies prepared in the post office, addressed to the
**European Network for Academic Integrity**.

**(b) Nearest neighbors.**
- [Weber-Wulff et al., "Testing of detection tools for AI-generated text"](https://edintegrity.biomedcentral.com/articles/10.1007/s40979-023-00146-z), *International Journal for Educational Integrity* (2023) — 12 public tools plus Turnitin and PlagiarismCheck, tested for accuracy and error type, including machine translation and obfuscation. Peer-reviewed, and connected to the **ENAI recommendations** — the very network this work's packet is addressed to.
- [Scribbr's 12-tool comparative test](https://fast.io/resources/ai-detector-accuracy-comparison-2026) and the RAID benchmark — continuously updated independent accuracy comparisons; Copyleaks advertises 99.12% and measures 66%, GPTZero advertises 99% and measures 52%.
- The commercial comparison genre at large (isitai, SolidAITech, EyeSift, 2026) — "vendor claims run 15 to 30 points above independent tests" is now a routinely published finding, refreshed for SEO.
- [Liang et al., "GPT detectors are biased against non-native English writers"](https://www.sciencedirect.com/science/article/pii/S2666389923001307), *Patterns* (2023) — the specific failure mode with the strongest evidence, 61.3% average false-positive rate on TOEFL essays.

**(c) Draft verdict: REDUNDANT — and the most uncomfortable finding in this batch, because of
where the packet is addressed.** "Detection tools do not do what they claim" is not a gap in the
record; it is the record. Weber-Wulff et al. published the peer-reviewed version in the journal
of the field, tied to ENAI's own recommendations — so the packet prepared for ENAI carries to
that network a finding its own literature established three years earlier. The vendor-claim-
versus-independent-measurement gap, which is the work's sharpest angle, is also exactly what the
commercial comparison sites now publish monthly.

**(d) Rework direction.** Two honest routes, and the choice is a judgement not a mechanic.
Either **withdraw the outward claim** and keep the work as what it is — a *form* experiment
(the calibration-certificate genre applied to software, the certificate enacting the failure it
documents), which is a rhetorical contribution and not a finding; or **move to what the neighbours
do not do**: audit the tools *against their own published specifications over time* — a dated
series showing whether a vendor's claim moves when independent measurement contradicts it. The
neighbours all measure the tools; none of them holds the vendors' claims to a record. Before the
packet goes anywhere, it must cite Weber-Wulff et al. — sending ENAI a finding from ENAI's own
network without naming it would be the opposite of this house's ethic.

---

## 2. Native Speaker (`src/content/studio/works/2026-07-13-native-speaker`)

**(a) Claim.** *"A border gate reads the English you type — live, on every keystroke, through a
disclosed, deterministic reconstruction of AI-text-detector scoring — and stamps you ADMITTED or
FLAGGED AS MACHINE. The instruction to write 'as if you had learned English at fifteen' makes the
visitor perform the documented mechanism (perplexity penalizes constrained vocabulary) on their
own body"* (`meta.json`).

**(b) Nearest neighbors.**
- [Liang et al., "GPT detectors are biased against non-native English writers"](https://arxiv.org/abs/2304.02819), *Patterns* (2023) — **the finding, entire**: seven detectors, 61.3% average false-positive rate on TOEFL essays, 19.8% flagged unanimously, and perplexity named as the mechanism. Widely covered ([ScienceDaily](https://www.sciencedaily.com/releases/2023/07/230710113921.htm)).
- The detector-demo genre — GPTZero, Copyleaks and others let anyone paste text and receive a live score; the scoring surface itself is a commodity.
- Algorithmic-border scholarship and art (ACM DIS 2025 "Borders: On the Evolving Nature of Borders as Fluid Infrastructures"; the Humanity in Action work on algorithms, borders and belonging) — the political frame is well occupied.

**(c) Draft verdict: ADDED VALUE, carried entirely by form.** The finding is not this work's and
must never be presented as if it were: Liang et al. established it, at scale, peer-reviewed,
three years earlier. What the searches did not surface is the specific apparatus — a *border
gate* that runs a **disclosed, deterministic reconstruction** of detector scoring on the
visitor's own live typing, instructs them to write as a non-native speaker, and issues a verdict
on their body rather than on a corpus. The commercial demos score you but stage nothing; the
scholarship stages nothing at all.

**(d) Rework direction.** Cite Liang et al. **on the work's own surface**, not in a method sheet:
the piece is stronger when the visitor knows the mechanism is documented and still feels the
stamp. State plainly that the scoring is a reconstruction, not a vendor's detector, and that the
verdict is therefore a demonstration and not an accusation.

---

## 3. No Way of Knowing (`src/content/studio/works/2026-07-17-no-way-of-knowing`)

**(a) Claim.** *"A two-faced console showing the same state twice: at maximal confidence when it
acts … and at declared un-knowing when it harms … The console will not show both faces at once —
to read the second sentence you must destroy the first, spending one sentence to buy the other,
the exact economy the state performs"* (`meta.json`).

**(b) Nearest neighbors.**
- [Airwars](https://airwars.org) and the civilian-harm reporting field — the record of what was said and what was denied about strikes is journalism's territory, held at far greater depth and with named casualties.
- [Erasure as an artform](https://en.wikipedia.org/wiki/Erasure_(artform)) (blackout poetry, Richard Galpin's survey of erasure in art) and [auto-destructive art](https://en.wikipedia.org/wiki/Auto-destructive_art) (Metzger) — destroying text to make meaning is a mature, named tradition.
- [Banksy, *Civilian Drone Strike*](https://en.wikipedia.org/wiki/Civilian_Drone_Strike_(Banksy)) (2017) — the mass-audience version of the theme.

**(c) Draft verdict: ADDED VALUE (narrow, and resting partly on absence of evidence).** Neither
the material (on-record statements) nor the gesture (erasure) is new. What no search surfaced is
the **coupling**: an interface in which reading the state's second sentence *costs* the first,
so the visitor performs the trade the institution performs. Erasure art destroys to reveal; this
destroys to make the reader choose, which is a different operation.

**(d) Rework direction.** Name the tradition on the page — Metzger and the erasure lineage — and
name Airwars as the record this piece does not replace. The claim to defend is the economy of the
interface, never "this is how the harm is documented".

---

## 4. NO PART (`src/content/studio/works/2026-07-30-no-part`)

**(a) Claim.** *"One day's order list of the Supreme Court of the United States — 6 October 2025,
thirty-nine pages — to be printed at 100 % and mounted edge to edge in one line 8.42 m long …
The studio adds not one glyph … 820 petitions in that section, 789 of them under the one
sentence, 31 answered one at a time. Nobody has mounted it."* (`meta.json`).

**(b) Nearest neighbors.**
- Instruction art as a form (Yoko Ono's *Grapefruit*, Sol LeWitt's wall-drawing certificates) — a work published as its score, executable by anyone, is a well-established genre with a canon.
- Institutional-critique presentation of unaltered official documents (the Haacke lineage; contemporary court-record projects).
- Legal data journalism on the cert-denial pipeline (SCOTUSblog's order-list coverage; Thaler v. Perlmutter, 2026-03, as an example of how denials are reported one case at a time).

**(c) Draft verdict: NOT SETTLED — the search was too weak to sign off, and this document says so
rather than recording a verdict it did not earn.** Nothing surfaced that mounts one day's order
list at 1:1 as a work; but the queries that were run returned mostly unrelated Supreme-Court
coverage, which is a sign of a bad search rather than of an empty field. The genre neighbours
(instruction art, unaltered-document display) are real and strong, so the plausible position is
"a known form, an unusual object" — but that must be checked in art-historical sources
(exhibition archives, print-work catalogues) before it is claimed.

**(d) Next step, not a rework direction.** One more pass in art-historical rather than general
web sources. Until then the work carries no verdict, and the graph shows it carrying none.

---

## Cross-cutting, and it is the same finding as the Holdings audit

**The form is ours; the finding is usually someone else's.** Three of the four works here are
carried by their apparatus — a gate that stamps the visitor, a console that charges for the
second sentence, a certificate that enacts its own failure — while the findings underneath them
belong to Liang et al., to Airwars, to Weber-Wulff et al. That is not a defect as long as it is
**said**. It becomes a defect the moment a packet leaves the house implying otherwise, which is
why entry 1 blocks on a citation before it is sent.
