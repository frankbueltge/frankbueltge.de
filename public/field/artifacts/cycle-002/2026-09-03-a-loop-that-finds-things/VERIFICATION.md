# Verification — a loop that finds things

**Session 150 · 2026-09-03.** Two layers: the loop's own review stage, and an adversary convened
against the finished measurement and told to break it. Both are reported here, including what
they found against us.

---

## 1. The loop's own review stage

`tools/autoloop/review.py`, a second implementation sharing no code with the loop: it re-derives
group sizes, medians, event counts and percentages from the corpus; computes Mann-Whitney U by
direct pairwise counting; takes the normal tail from a rational approximation instead of the C
library's `erfc`; re-applies the four review pre-conditions itself; and checks every number
printed in a written claim sentence against its own re-derivation.

**Final run: 586 checks, 0 disagreements.** The first run is a story of its own and is in
`METHOD.md` — it reported five disagreements, all of them the threshold notation `p = <0.0001`
read as a measured number, and the fault was the reviewer's. That run is committed unrepaired at
`data/review-run1-unrepaired.json`.

## 2. The convened adversary

An adversary was convened on an efficient tier of the same web-research apparatus this practice
uses for its dispatched work, given the pre-registration, all four source files, the three data
files and the eight headline numbers, and told to attack eight named points and report defects,
weaknesses and failed attacks. It returned twelve items. Nothing it found was withheld.

### What it broke, and what was done

**A1 — DEFECT, and the most consequential: the multiplicity correction used the wrong
denominator.** The pre-registration says Benjamini-Hochberg "across all 66 tests" and Bonferroni
at "α/66". The code applied both only over the 51 tests that had already survived the
pre-conditions. The adversary recomputed the registered rule and got **12 BH survivors, not 10**,
and **9 Bonferroni survivors, not 7**.

*Verified here and confirmed exactly.* `loop.py` now computes **both** denominators and reports
both. Registered denominator (65 tests with a p-value): **12 BH, 9 Bonferroni**. As-run
denominator (51 claimable tests): **10 BH, 7 Bonferroni**. **The claim set is identical either
way**: the two extra tests the registered rule promotes are `cross_listed | comment_pages` and
`has_doi | comment_pages`, and both are killed at review under c4, so neither ever became a
claim. The deviation is now stated in `METHOD.md` and the page carries both numbers.

**A2 — DEFECT: the pre-registered deliverable did not exist.** True when the adversary looked:
it read the artifact while the page generator was still being written. `make_page.py` and
`index.html` now exist and `make_page.py --check` rebuilds the page from the data files and
fails on a one-byte difference. Recorded rather than dropped, because the adversary was right
about what it saw.

**A3 — DEFECT: the review pass was less independent than claimed.** For every numeric claim it
took the loop's own `z` and only re-ran the tail, so a fault in the shared tie-corrected variance
would have passed unnoticed; and it never re-applied the pre-conditions itself, so a mistyped
threshold in `preconditions()` would have sailed through 476 checks.

*Both fixed.* `review.py` now derives `z` from its own pairwise U and its own tie count taken
from a frequency table, and re-applies c1–c4 from the numbers it re-derived, comparing its verdict
with the loop's. The check count rose from 476 to 586; disagreements remain 0. What it still
cannot catch is unchanged and stated in `METHOD.md`: both files read the same `corpus.json`, so a
fetch-side feature bug is invisible to it.

**A4 — WEAKNESS, and it is a real limit on our largest non-mechanical finding.** The adversary
argued that *cross-listed papers have fewer authors* is substantially a composition effect of a
corpus built from eight category queries.

*Recomputed here, in our own code, rather than taken on the adversary's word*
(`tools/autoloop/stratify.py`, `data/stratify.json`): pooled rank-biserial **−0.220**; stratified
on primary category, **only 1 of 7 testable strata reaches p < 0.05** (cs.AI, −0.246), and the
pooled effect is larger than every stratum but that one. Three categories — stat.ML, cs.CR,
cs.HC — are **100 % cross-listed** in this corpus and sit wholly on one side of the grouping.
The finding is published with this attached, in `data/judgment.json` and on the page.

**A5 — WEAKNESS: "7 of 14 replicate" invites a wrong reading.** Of the seven that fail, six keep
the same sign in both halves and fail only because halving the corpus costs the power to clear
p < 0.05 in one half. Only one finding actually flips sign.

*Measured and added:* `M6_same_sign_both_halves` = **13 of 14**. Both numbers are now on the page.
The registered rule stands as registered; what changed is that the page no longer lets 50 % be
read as "half of these point the wrong way".

**A6 — the headline invited a subtraction it does not license.** "Finds 14, would find 3 in an
empty world" tempts a reader to conclude that 11 are real. The null-world mean is the average
yield under total non-association; it does not identify which findings are real.
*The page now says so explicitly, in the sentence next to the number.*

### What it attacked and could not break

- **The core statistics are textbook-correct.** The tie-corrected Mann-Whitney variance matches
  the standard formula; the pooled two-proportion z is standard; the Benjamini-Hochberg
  implementation is a correct step-up procedure, verified against a hand-built non-monotonic
  p-value sequence in which an intermediate rank fails its own threshold and later ranks pass.
  Reimplemented independently, it reproduced both survivor counts exactly.
- **The null world is correctly implemented.** The same permutation is applied to every grouping
  column in a replicate, so dependence among groupings is preserved and every grouping-outcome
  association is destroyed. Precomputing the outcome ranks once is valid, because the outcome
  multiset never changes across replicates.
- **The split half is not structured.** Parity of the last digit of an arXiv identifier is a
  deterministic function of a sequentially issued number, so it is not a random split in
  principle; empirically the two halves (1,050 and 984) differ on none of nine features, all
  p > 0.14.
- **The missing continuity correction changes nothing here.** Applied by hand to the most
  marginal finding, p moves from 0.043619 to 0.043623.
- **The arithmetic of the report is faithful.** 8 × 9 − 6 = 66, the four pre-conditions match
  their registered thresholds line by line, and M1 = 14, M4 = 15, M6 = 7 of 14 and the
  2,400 → 2,034 deduplication all reproduce from the committed files.
- **The null-world confidence interval is the wrong estimator and it does not matter here.** The
  Wilson interval treats 33,000 clustered tests as independent. The adversary built a
  cluster-robust interval from the 500 replicate-level rates: mean 0.04885, CI 0.0464–0.0513
  against our 0.0466–0.0512. Its own caution is worth carrying: the adequacy is incidental to
  this variable set, not guaranteed.

## 3. What no verification here reached

- **The corpus.** Every check above reads the same `corpus.json`. A feature parsed wrongly by
  `fetch.py` would be consistent everywhere and invisible to all of it.
- **The hypothesis space.** Both layers audit the questions as asked. Neither can ask whether
  these are the questions worth asking, and the redundancy audit that found 66 questions resting
  on 51 variable pairs was itself written by a person after noticing two identical p-values.
- **The judgment column.** `data/judgment.json` is coded by the same practice that wrote the
  prediction it tests, with no blind second coder. Every code carries its reasoning so that a
  reader can re-code it against us; independent re-coding would still be worth having.
