# Method — which questions count

Session 152, 2026-09-05. Everything here reads committed files. No network call is needed for
any number in this study, and none was made for one.

## 1. Reproduction

From the repository root:

```
cd tools/autoloop
python3 denominator_study.py --out ../../artifacts/cycle-002/2026-09-05-which-questions-count/data
python3 make_denominator_page.py \
    --data ../../artifacts/cycle-002/2026-09-05-which-questions-count/data \
    --out  ../../artifacts/cycle-002/2026-09-05-which-questions-count/index.html
```

Runtime ≈ 25 s, pure Python 3.12, no third-party package. Every figure on `index.html` is drawn
from `data/denominator.json` at build time, so the page cannot drift from its evidence.

Kill condition K3 (that the loop's existing measurements did not move) is reproduced by:

```
python3 loop.py --corpus ../../artifacts/cycle-002/2026-09-03-a-loop-that-finds-things/data/corpus.json \
        --out /tmp/k3.json --replicates 500 --seed 20260903
```

and comparing to `artifacts/cycle-002/2026-09-03-a-loop-that-finds-things/data/results.json`.

## 2. The instrument (`tools/autoloop/liveness.py`)

**Input:** a record list, the grouping predicates, the outcome kinds, the question list, α.
**Output:** for every question a *reachable floor* and an AWAKE / ASLEEP verdict.

**What it reads.** Only *N* (records), *G* (records where the grouping holds), and the multiset
of the outcome's values over the *m* records where it is present. It never touches the joint
distribution of a grouping and an outcome. These three quantities are precisely what the null
world's permutation leaves unchanged.

**The admissible group sizes.** *n₁* — the number of group-1 records among the *m* non-missing
rows — is not fixed by *G* when the outcome has missing values. It ranges over
`max(0, m − (N − G)) … min(m, G)` and the floor is minimised over that whole range. Where the
outcome is complete, that range collapses to the single value *G*.

**Mann–Whitney U (numeric outcomes).** The variance term, tie correction included, is a function
of the value multiset alone, so it is invariant. For each admissible *n₁* the reachable extremes
of *U* are obtained by giving group 1 the *n₁* largest values and, separately, the *n₁* smallest;
the boundary tie block is split by whatever *n₁* forces and each tied cross pair counts one half,
exactly as `average_ranks` counts it. The floor is the two-sided normal-tail p at the larger
|z|.

**Two-proportion z (binary outcomes).** The pooled variance depends only on *X/m*, which is
invariant; for each admissible *n₁* the reachable extremes of *x₁* are `min(n₁, X)` and
`max(0, X − n₀)`.

**Where the loop's own statistics return no p-value** — an empty group, zero pooled variance —
the floor is 1 by definition, since the loop counts such a test as a non-rejection.

**Conservative by construction.** A question is marked asleep only when *no* admissible labelling
reaches α. A question marked awake may still be nearly dead. That asymmetry is deliberate:
ASLEEP is a claim of impossibility, and impossibility is the only thing a denominator may drop
without an argument about what is interesting.

## 3. The datasets

| id | corpus | records | null world | file |
|----|--------|---------|-----------|------|
| A | arXiv, session 150 | 2,034 | 500 replicates, seed 20260903 | `2026-09-03-a-loop-that-finds-things/data/results.json` |
| B | arXiv, session 151 | 2,039 | 400 replicates, seed 20260904 | `2026-09-04-the-dial/data/sweep-arxiv.json` |
| C | Crossref, session 151 | 2,400 | 400 replicates, seed 20260904 | `2026-09-04-the-dial/data/sweep-crossref.json` |

A stores per-question hit **counts**; B and C store per-question **rates**, from which the study
recovers counts as `round(rate × replicates)`. Both are exact for these files: every stored rate
is a multiple of 1/400.

**Corpus C carries a dated defect, unrepaired and disclosed.** Its fetcher sorts by *deposit*
date and stops at 300 per publisher, so 1,485 of its 1,921 dated records fall in the last eight
days of the fourteen-week window it names, and Elsevier's 300 have no resolvable issue date. It
was left unrepaired on 2026-09-04 so that the committed corpus and the code that produced it
still match. **Nothing in this study conditions on C being a fair sample of any window:** every
verdict here is about the loop's arithmetic over whatever corpus it is handed.

## 4. The measurements

- **P1, soundness.** For each dataset, the set the rule marks asleep is intersected with the
  questions that recorded at least one rejection in the null world. Reported as violations and as
  *opportunities* — asleep questions × replicates — so the strength of the check is visible.
- **P2, completeness.** The set of questions with an observed rejection count of exactly zero,
  minus the asleep set.
- **P3, the reversal.** The per-test rate over awake questions only, with a Wilson 95 % interval,
  against the published all-question rate. Reported beside three controls: 10,000 random subsets
  of the same size; the lowest-observed-rate trim of the same size; and the "questions that
  survive review" denominator that a convened adversary flagged on 2026-09-03.
- **P4.** The asleep set against the set the loop's review pre-conditions c1–c4 kill.
- **P5.** Benjamini–Hochberg at q = 0.05 over all questions with a p-value, against the same over
  awake questions only, on the real (unpermuted) data.
- **K2, invariance.** Each corpus is rebuilt 200 times with the grouping block permuted exactly
  as `null_world()` permutes it — the fields the grouping predicates read are taken from the
  permuted row, everything else stays — and liveness is recomputed from the permuted records.
  The partition must not move.

## 5. Post-hoc, and labelled as such everywhere it appears

Nothing in this section was pre-registered.

- **The awake curve.** On the two full corpora the rule fires only on a grouping that is constant,
  which a one-line check would also catch. So the first *n* records of each corpus are taken for
  *n* ∈ {40, 60, 80, 120, 200, 400, 800, 2000}, 200 permuted replicates each, and the rule is
  compared against a real null world at each size. The fourth column of the table on the page
  counts asleep questions whose grouping is *neither* empty nor universal — the cases where the
  rule is doing work a constant-column check would not do.
- **Trim sensitivity.** The lowest-rate trim at sizes 0, 5, 9, 15 and 25, so the page can say what
  P3 would have concluded had the rule returned a different count. It would have concluded the
  same, which is why the page reports P3 as a weak test.
- **The rival denominator.** The per-test rate over review survivors.
- **P5 where it can come out either way.** On the three registered datasets the asleep set and the
  set of questions with no computable p-value coincide, so P5's comparison was between a list and
  itself. The same comparison is therefore run on the curve's subsamples, where a question can be
  asleep and still produce a p-value, using `dial.real_battery` on the first *n* records.
- **The smoke run.** The merged pipeline run end to end against a corpus fetched 2026-09-05
  03:49 UTC, `--per-cat 40 --replicates 50`, written to a scratch directory. It is **not** a
  series row: a series whose rows are forced by hand is not a series. Kept as
  `data/smoke-run-2026-09-05.json` because a 265-record corpus shows the dilution live.

## 6. What was changed in the loop

`liveness.py` is new. `loop.py` calls it before EXPERIMENT and writes a `PRECHECK` block; no
existing computation was touched, and K3 verifies that claim by claim. `run_series.py` adds three
fields to the nightly row and changes none; the schema history is dated in
`tools/autoloop/series/README.md` and no row was back-filled.
