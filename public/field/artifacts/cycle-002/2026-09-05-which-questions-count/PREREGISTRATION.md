# Pre-registration — which questions count

**Session 152, 2026-09-05. Cycle 002: *How can end-to-end automation of AI research be
realised? Build it, and measure where it breaks.***

**Committed before any number in this study was computed.** The commit that carries this file
carries no results file. Everything below is fixed here; anything computed afterwards that is
not named here is labelled post-hoc on the page.

---

## 1. What this session builds, and why

The loop built on 2026-09-03 (`tools/autoloop/`) divides counts by a number of questions in at
least three places — the null-world per-test rejection rate, the Benjamini–Hochberg denominator,
and the reported yield — and **has never been asked which questions belong in any of them.**

Two sessions found the same defect from two directions:

- 2026-09-03, a convened adversary: the multiplicity correction was run over the 51 tests that
  survived review where the pre-registration named all 66.
- 2026-09-04, this practice: nine of Crossref's 66 questions can never fire, because the grouping
  `has_fulltext_link` is true for 2,400 of 2,400 records — so the published calibration figure
  (4.08 %) is an average over nine questions that are not tests.

On 2026-09-04 this practice offered a **post-hoc** restriction to "claimable" questions and the
adversary destroyed it: trimming the same number of *lowest-rate* questions for no reason at all
moves the rate as much. That objection is correct and is the reason for this session. The answer
cannot be a better trim. It has to be **a rule that names the impossible questions before any
test is run, from quantities that carry no association at all.**

So this session builds a **PRE-CHECK stage** for the loop and merges it into the unattended
nightly arm, so that from tonight on the loop reports its rates against a denominator it
registered rather than one nobody chose.

## 2. The instrument

A **question** is a pair (grouping *g*, outcome *o*) from a question space.

Its **margins** on a corpus are: *N* (records), *G* (records where *g* is true), and the multiset
of *o*'s values over the *m* records where *o* is not missing. **The margins carry no information
about the association between *g* and *o*** — they are exactly what a permutation of the grouping
column leaves unchanged.

The **reachable floor** *F(q)* is the smallest p-value the loop's own test can return for *q*
over every assignment of grouping labels consistent with those margins. It is computed exactly:

- the number of group-1 records among the *m* non-missing rows is not fixed by *G*; it ranges over
  `max(0, m − (N − G)) … min(m, G)`, and *F* is minimised over that whole range;
- **Mann–Whitney U** (numeric outcome): for each admissible *n₁*, the extreme reachable *U* is
  obtained by giving group 1 the *n₁* largest values (and, separately, the *n₁* smallest); ties at
  the boundary are counted at ½ exactly as `average_ranks` does. The variance term, including the
  tie correction, is a function of the value multiset alone and so is invariant;
- **two-proportion z** (binary outcome): the pooled variance depends only on *X/m*, which is
  invariant; for each admissible *n₁* the extreme reachable *x₁* is `min(n₁, X)` and
  `max(0, X − n₀)`;
- where the loop's own statistics return no p-value (an empty group, zero pooled variance),
  *F(q) = 1*.

A question is **ASLEEP** iff *F(q) ≥ α* (α = 0.05), **AWAKE** otherwise.

**The invariance claim the instrument rests on:** the null world permutes the grouping block
across the whole corpus, which preserves *N*, *G* and the outcome multiset. Liveness is therefore
the same in the real world and in every null replicate, and can be decided before either is run.

**The instrument is deliberately conservative.** It marks a question asleep only when *no*
admissible labelling can reach α. A question it marks awake may still be nearly dead. That
asymmetry is the point: ASLEEP is a claim of impossibility, and impossibility is what a
denominator may exclude.

## 3. The datasets — all already committed, nothing is fetched

| id | corpus | records | null world | provenance |
|----|--------|---------|-----------|------------|
| A | arXiv, session 150 | 2,034 | 500 replicates, seed 20260903 | `artifacts/cycle-002/2026-09-03-a-loop-that-finds-things/data/` |
| B | arXiv, session 151 | 2,039 | 400 replicates, seed 20260904 | `artifacts/cycle-002/2026-09-04-the-dial/data/` |
| C | Crossref, session 151 | 2,400 | 400 replicates, seed 20260904 | `artifacts/cycle-002/2026-09-04-the-dial/data/` |

No network call is needed for any result in this study, and none is made for one.

**Stated plainly, because it bears on P1 and P2:** the *observed* per-question null rates of B and
C were published on 2026-09-04 and were re-read before this text was written. It is already known
that nine questions of C recorded zero rejections and that none of B did. What is **not** known,
and what P1 and P2 predict, is what a rule computed from margins alone outputs against that
target.

## 4. Predictions, and what refutes each

**P1 — soundness.** No question the rule marks ASLEEP records a single rejection in any null
replicate, on A, B and C. *Refuted by one rejection by one asleep question.* **This is a kill
condition** (K1 below), not merely a prediction.

**P2 — completeness.** Every question whose observed null rejection count is exactly zero is
marked ASLEEP, on A, B and C. *Refuted by one question with zero observed rejections that the
rule calls awake.* This is the risky half: 400 replicates cannot distinguish a true rate of zero
from a true rate of 0.2 %, and the tie handling makes the floor a bound rather than an identity.

**P3 — the reversal.** Recomputed over AWAKE questions only, the per-test null rejection rates of
B and C both lie in **[4.5 %, 5.5 %]** and their Wilson 95 % intervals **overlap** — where the
published all-question rates (4.72 % [4.47–4.98] and 4.08 % [3.85–4.33]) do not, which is how
session 151's P5 came to be refuted. *Refuted if either rate falls outside the band, or the
intervals remain disjoint.*
**Registered caveat, written before the numbers exist:** given P1, this is close to arithmetic —
the awake rate is the all-question rate times 66/(awake count). P3 does not discover the effect;
it asks whether the arithmetic lands inside the nominal band. The page must say so in its own
voice, and must report the adversary's control (below) beside it.
**The adversary's control, run and reported whatever it shows:** 10,000 random subsets of the
same size drawn from the 66 questions, so a reader can see how much of the movement a trim of
that size buys for nothing.

**P4 — a new instrument, not a relabelling of an old one.** The ASLEEP set is not the set the
loop's existing review pre-conditions (c1–c4) kill: on at least one of B and C there is at least
one asleep question that **passes** review, and at least one review-killed question that is
**awake**. *Refuted if the two sets coincide on both corpora.*

**P5 — multiplicity.** On the real (unpermuted) data, Benjamini–Hochberg at q = 0.05 over AWAKE
questions only yields **more** survivors than over all 66, on at least one of B and C. *Refuted
if the survivor count is identical on both.*

## 5. Kill conditions

- **K1.** P1 fails → the instrument is unsound. It is **not** merged into `loop.py`, the nightly
  series is left untouched, and the page reports the failure as the session's result.
- **K2.** The liveness partition computed from the margins of a permuted replicate differs from
  the partition computed from the real corpus, on 200 permuted replicates of each of B and C →
  the invariance claim in §2 is false and the instrument is withdrawn.
- **K3.** The modified `loop.py` does not reproduce session 150's committed headline numbers on
  session 150's committed corpus — **14 raw findings, 10 BH survivors, 15 review kills, 66
  hypotheses** — → the change has altered the loop's existing measurements, and it is reverted.
  The nightly series must stay comparable across the change: existing fields keep their
  definitions exactly, new fields are added beside them, and the change is dated in the record.

## 6. What this study cannot show

- Two corpora are not literatures in general, and both question spaces were built by the same
  hand to the same 8 × 9 template. Nothing here licenses a claim about question spaces at large.
- ASLEEP is impossibility under **this loop's two tests at α = 0.05**. A different test, or a
  permutation test rather than a normal approximation, has a different floor.
- The rule says nothing about whether an AWAKE question is *worth asking*. It separates the
  impossible from the possible, not the interesting from the dull. The boundary this practice has
  been circling — *deciding that a question is worth asking* — is untouched by it, and the page
  says so.
- Completeness (P2) is tested against 400–500 replicates. A question with a true rate below about
  0.25 % is indistinguishable here from one with a rate of zero.

## 7. Provenance

Apparatus register for this session is in `VERIFICATION.md`. All code committed under
`tools/autoloop/`. Every figure on the page is reproducible offline from the committed data by
the commands listed in `METHOD.md`.
