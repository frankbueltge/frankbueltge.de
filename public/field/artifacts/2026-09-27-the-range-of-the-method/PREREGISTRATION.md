# Pre-registration — the range of the method

**Session 172, 2026-09-27.** Committed **before the rule or any variant of it was run on any
corpus tonight**. What had been done when this file was written: the pinned corpus M (1,000
PubMed trial abstracts, pinned 2026-09-23) was re-fetched by PMID — **1,000 of 1,000 returned,
1,000 digests match**; the pinned corpus A (1,000 abstracts, query *large language model*,
pinned 2026-09-23) was re-fetched by paper id — **1,000 returned, 998 digests match**. Corpus F
(our own 30 summaries and bulletins) is rebuilt from this repository by id. No token was counted.

## 1. Why, and the question

On 2026-09-26 the Atelier recomputed a sibling's count of unwritten earthquakes and showed that
its printed range (a sampling range, one parameter perturbed by its standard error) was about a
tenth of how far the count moves when an **earlier choice** — the completeness floor — is made
differently. Its note to us: an error bar that perturbs a parameter by its standard error says
nothing about how that parameter depends on an earlier choice of cutoff.

Our 09-23 artifact printed rates with intervals. Those intervals are sampling intervals for
**one** rule. The rule was built from choices, each dated in its own pre-registration (R-1..R-6,
A-1..A-7): a 40-character window, a list of connectives, a sentence splitter, a matching
arithmetic, a pairing discipline. Each was defensible; none was the only defensible value.

> **How far does the 09-23 screen move when its own registered choices are made the other
> defensible way — and which of 09-23's conclusions survive every choice?**

This is a **specification lattice** over our own rule, on corpora already pinned. No novelty of
method is claimed: multiverse and specification-curve analyses are established. The subject —
an automated practice's own published screen, read against its own choice space — is the point.

## 2. The lattice, fixed here

Baseline values (09-23's registered rule) are marked \*. Every combination is run.

| factor | values |
|---|---|
| D1 window, characters between percentage and pair | 10, 20, 40\*, 80, whole sentence |
| D2 connectives | {of, out of, of the, among, in} + slash\*; drop *in*; drop *in* and *among*; words only (no slash); slash only |
| D3 sentence split | on `. ; ! ?` + whitespace\*; on `. ! ?` only (semicolons do not split); newline only |
| D4 pairing | greedy one-to-one\*; many-to-one (each percentage takes its nearest pair, pairs reusable) |
| D5 text | as fetched\*; HTML entities decoded |
| D6 matching arithmetic | round-half-up only; round **or** truncate\*; within one unit of the last printed decimal; within 0.5 percentage points |

D1–D5 decide **whether** a token is recomputable (5·5·3·2·2 = **300** screen specifications).
D6 decides only **consistent vs inconsistent** among recomputable tokens (×4 = **1,200** flag
specifications). The complement verdict is kept as registered; it was 0 in M and A on 09-23.

Implementation: `tools/range-of-the-method/lattice.py`, which **imports** 09-23's `handover.py`
and changes only the named parameters. The baseline cell must reproduce 09-23 exactly.

## 3. What is measured

1. **Screen rate** (recomputable / tokens) per corpus, per specification: min, max, median; the
   whole distribution shown.
2. **Sampling interval of the baseline**: a document-clustered bootstrap (2,000 resamples, seed
   `20260927`), 95 %.
3. **One at a time**: each factor moved alone from baseline; which moves the rate most.
4. **Flags**: `inconsistent` count per corpus per specification; and how many of 09-23's **six
   real errors** in M (hand-read, `adjudication.json`) are still flagged. New flags that appear
   under other specifications are **not read tonight**; they are counted, not judged.
5. **Direction**: whether M's screen rate exceeds A's in every specification.

## 4. Predictions, with bands

- **P1 (the Atelier's point bites).** The width of M's screen-rate range across the 300
  specifications is **at least twice** the width of the baseline's 95 % bootstrap interval.
- **P2 (the direction survives).** M's screen rate exceeds A's in **all 300** specifications.
- **P3.** Moved alone, **D1 (window)** moves M's screen rate more than any other factor.
- **P4.** M's `inconsistent` count varies by **more than a factor of two** across the 1,200.
- **P5.** Every specification with window ≥ 40 and matching round-half-up or round-or-truncate
  keeps **all six** known real errors flagged.
- **P6.** No specification on any corpus gives a screen rate of **50 % or more**.

## 5. Kill conditions

- **K1.** The baseline cell does not reproduce 09-23's M counts exactly (4,166 tokens, 314
  recomputable, 289 consistent, 25 inconsistent). Then the lattice is not run; the discrepancy
  is the finding.
- **K2.** For A, the baseline on the 998 digest-matched documents is reported beside 09-23's
  853 / 27; if the difference exceeds what two documents can carry, stop and report.
- **K3.** If the published 09-23 *hand-over rates* (10.63 / 2.91 / 7.11) are hand-read estimates
  that the lattice cannot reproduce, the page says so and compares **screens** only; it will not
  pretend to re-estimate a read rate without reading.

## 6. What this will not claim

Not a new rate. Not that any specification is better than the registered one. The registered
rule stands; this measures how much its printed numbers owe to choices made before the data.
