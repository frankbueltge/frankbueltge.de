# Method and deviations — a loop that finds things

**Session 150 · cycle 002 · 2026-09-03.** Read with `PREREGISTRATION.md`, which was committed
(75de9a4) before the first datum was fetched.

## What ran, in order

| Stage | File | What it did | Wall clock |
|---|---|---|---|
| DATA | `tools/autoloop/fetch.py` | 24 requests to the arXiv Atom API (8 categories × 3 pages of 100), ≥ 3 s apart | 88 s |
| QUESTION | `tools/autoloop/loop.py` | enumerated the 66 admissible pairs by rule | < 1 s |
| EXPERIMENT + ANALYSIS | `tools/autoloop/loop.py` | 66 tests on the corpus, 66 on each split half, 33,000 in the null world | 12 s |
| WRITE | `tools/autoloop/loop.py` | one claim sentence per surviving finding, from a template | < 1 s |
| REVIEW | `tools/autoloop/review.py` | 476 re-derivations by a second implementation | 2 s |

Reproduce:

```
python3 tools/autoloop/fetch.py  --out data/corpus.json --breaks data/breaks-data.json --per-cat 300
python3 tools/autoloop/loop.py   --corpus data/corpus.json --out data/results.json --replicates 500 --seed 20260903
python3 tools/autoloop/review.py --corpus data/corpus.json --results data/results.json --out data/review.json
python3 tools/autoloop/make_page.py --check      # rebuilds index.html and fails on a one-byte difference
```

The DATA stage is the only stage that touches the network, and it is the only stage that cannot
be reproduced exactly: arXiv's most recent 300 per category is a different set tomorrow. Everything
downstream of `data/corpus.json` is deterministic and seeded.

## Corpus

2,400 entries requested, **2,034 after deduplication** — 366 records were returned by more than
one of the eight category queries. Fetched 2026-09-03 22:40 UTC. Kill condition K1 (fewer than
1,500) did not fire.

**Committed:** identifier, version, primary category, category count, weekday, hour, title length
in words, abstract length in words, author count, DOI flag, journal-reference flag, comment flag,
stated page count, revision flag. **Not committed:** any title, abstract, author name or comment
string. The features are measurements of that text; the text itself stays out of this repository.

## Deviations and implementation decisions

1. **The `comment_pages` parse rule was not fixed in the pre-registration.** Implemented as the
   first match of `(\d+)\s*pages?` in the author comment, accepted only in 1–500. It matters:
   this outcome is missing for most of the corpus and its eight pairings were all killed at
   review under c4, which is the largest single block of kills.
2. **No continuity correction** on either test, in both the real and the null world. Since the
   null world is measured with the same uncorrected tests, the calibration figure (M3) already
   contains whatever this costs; it comes out at 4.88 %.
3. **Wilson interval** for the null-world per-test rate. The pre-registration said "its interval"
   without naming a method; named here.
4. **c4 is evaluated against the record list of the battery being run**, so on a split half it
   asks whether the outcome is present for half of *that half*. Consistent, and stated.
5. **The redundancy audit in `review.py` was NOT pre-registered.** It is exploratory, and it was
   added *after* the first results table was read, because two findings carried the identical
   p-value 3.27e-140 to every printed digit. What it found is in the artifact, but it is a
   post-hoc analysis and is labelled as one everywhere it appears.
6. **A degenerate test.** `has_comment | comment_pages` has an empty comparison group: a stated
   page count can only be parsed out of a comment, so every record with the outcome is in the
   same group. The loop logged it as a break and carried on, in all three batteries.

7. **The multiplicity denominator was wrong, and a convened adversary found it.** The
   pre-registration says Benjamini-Hochberg "across all 66 tests" and Bonferroni at "α/66"; the
   code applied both over the 51 tests that had survived the pre-conditions. Both denominators
   are now computed and both are published: **registered** (65 tests with a p-value) → 12 BH, 9
   Bonferroni; **as run** (51 claimable) → 10 BH, 7 Bonferroni. The claim set is identical, because
   the two tests the registered rule promotes are killed at review under c4 and never became
   claims. Full disposition in `VERIFICATION.md` §2 A1.
8. **The review pass was strengthened after the same adversary showed it was not as independent
   as claimed** — it had been taking the loop's `z` on trust for every numeric claim, and had
   never re-applied the pre-conditions itself. Both are now done in `review.py` from its own
   re-derivations; checks rose 476 → 586, disagreements 0.
9. **`tools/autoloop/stratify.py` is post-hoc and outside the loop.** It stratifies one finding on
   primary category to test the adversary's composition argument. It is not part of the pipeline
   and never will be: the pipeline does not know that its corpus was assembled.
10. **`M6_same_sign_both_halves` was added after the adversary observed that "7 of 14 replicate"
   invites a wrong reading.** 13 of 14 keep the same sign in both halves; one flips. The
   registered replication rule is unchanged.

## Kill condition K3 fired, and the disagreement is published

K3: *if the independent review pass disagrees with any number in a claim card, the disagreement
is published as the finding, not repaired silently.*

The first run of `review.py` reported **five disagreements**, all of one kind: the number
`0.0001` appearing in a claim sentence could not be re-derived from the data. Inspection showed
the fault was in the reviewer, not in the WRITE stage — `p = <0.0001` is a threshold notation,
and the reviewer's tokeniser read the threshold as a measured quantity.

That first run is committed unchanged at `data/review-run1-unrepaired.json`. The repair is a
commented four-line change in `review.py`, dated in the file. The second run reports 476 checks
and 0 disagreements.

**The first thing this loop's review stage found wrong was its review stage.** That is not a
joke at our own expense; it is the ordinary experience of building verification and the reason
K3 was written as "publish it" rather than "fix it".

## What the review pass cannot catch

`review.py` shares no code with `loop.py` or `stats.py`: it re-derives group sizes, medians,
event counts and percentages from the corpus, computes Mann-Whitney U by direct pairwise
counting instead of by rank sums, and takes the normal tail from a rational approximation
instead of the C library's `erfc`. It cannot catch:

- an error in the **corpus** itself — both files read the same `corpus.json`, so a mis-parsed
  feature is invisible to it;
- an error in the **hypothesis space** — it audits redundancy but does not ask whether the space
  is the right one;
- an error of **interpretation** — every number can be correct and every claim still be empty.
  That is what M7 is for, and M7 is judgment, coded by the same hand that wrote the prediction
  it tests, with no blind second coder.
