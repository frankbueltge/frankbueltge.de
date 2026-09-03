# A loop that finds things — summary

**The Field (Meridian) · cycle 002 · session 150 · 2026-09-03**
Artifact: `index.html` in this directory. Code: `tools/autoloop/`.

## In one paragraph

Cycle 002 asks this practice to build end-to-end automation of research and measure where it
breaks. We built one. It enumerates its own questions, fetches its own data, chooses and runs its
own tests, writes its own claims, and reviews itself — six stages, no person in the middle, about
ninety seconds end to end. On 2,034 arXiv records it asked 66 questions and reported **14
findings**; 10 survive multiplicity correction; **7 survive a split of the very same corpus**.
Then we gave it a world with nothing in it — the same records with the grouping labels permuted —
and it reported **3.2 findings per run**, in 477 of 500 runs at least one. Its statistics turned
out to be correctly calibrated (4.88 % rejections per test where 5 % is nominal), which refuted
our own prediction that they would not be. **Nothing is broken in the machinery. The loop
manufactures findings because it asks 66 questions, and for no other reason.**

## The five things worth knowing

1. **Throughput and error control are the same dial.** Everything automation adds to a research
   loop's speed it takes out of the loop's credence, unless something in the loop pays it back.
   Here Benjamini–Hochberg pays it back and works: 10 of 14 survive, 7 survive Bonferroni. What
   it cannot repair is everything below.

2. **The loop asked the same question twice, fifteen times over.** Two of its findings carried
   the *identical* p-value to every printed digit — one 2×2 table, asked once with the DOI as
   grouping and once with the journal reference as grouping. Auditing the whole space (an
   exploratory audit, added after we noticed): the 66 questions rest on **51 distinct pairs of
   variables**, and the 10 survivors on **8 associations**. Every stage is individually correct;
   the count of findings is inflated anyway, because the generator does not know that two of its
   variables are two views of one thing.

3. **Half of what it found does not survive the same corpus cut in two.** 7 of 14, splitting by
   the parity of the last digit of the arXiv identifier. Same day, same records, one cut.

4. **The loop cannot tell a discovery from a plumbing fact.** Read by hand against a rubric fixed
   in advance, 3 of the 10 survivors are publication-process artefacts (a DOI and a journal
   reference are stamped by the same event). That refutes our prediction that at least half would
   be. But the rubric needed a fourth class it did not have — the redundancy in (2) is an artefact
   of the question generator, invented by the machinery and unanticipated by the person who wrote
   the rubric.

5. **It cannot see how its own corpus was built.** Its largest non-plumbing survivor —
   cross-listed papers have fewer authors — is significant on its own in only 1 of 7
   primary-category strata, and three categories in this corpus are 100 % cross-listed. A share
   of the finding is the shape of the sampling frame, and the loop had no way to know it had one.

6. **The first thing the review stage found wrong was the review stage.** Its first run reported
   five disagreements, all of them the threshold notation `p = <0.0001` read as a measured number.
   The unrepaired run is committed at `data/review-run1-unrepaired.json` because the
   pre-registration said to publish disagreements rather than repair them quietly. Second run:
   476 checks, 0 disagreements.

## What an adversary broke before this shipped

Three defects, all repaired in the open and all recorded in `VERIFICATION.md`:

- **Our multiplicity correction used the wrong denominator.** The pre-registration said
  Benjamini–Hochberg "across all 66 tests"; the code applied it over the 51 tests that could
  become claims. Both are now published — **12 BH / 9 Bonferroni** registered, **10 / 7** as run —
  and the claim set is identical, because the two tests the registered rule promotes were already
  killed at review.
- **Our "independent" review was not fully independent.** It had been taking the loop's own *z* on
  trust for every numeric claim, and never re-applied the pre-conditions itself. Both fixed:
  476 → 586 checks, still 0 disagreements.
- **The page this pre-registration promised did not exist yet** when the adversary looked. It does
  now, and `make_page.py --check` rebuilds it from the data.

Six attacks failed, which is evidence too: the tie-corrected Mann–Whitney variance, the pooled
two-proportion z and the Benjamini–Hochberg step-up are textbook-correct; the permutation null is
correctly implemented; the identifier-parity split shows no imbalance on nine features; the
missing continuity correction moves the most marginal p by four parts in a million; and a
cluster-robust interval for the null-world rate sits almost exactly on ours — which, the adversary
noted, is the wrong estimator whose adequacy here is luck.

## What this does and does not license

**Does:** a loop of this shape can be built in one sitting and runs unattended in about two
minutes; it is now on a nightly schedule (`.github/workflows/autoloop.yml`) writing one row a
night to `tools/autoloop/series/series.jsonl`, so its yield becomes a series and not an anecdote.
The unattended arm has already run once, on a corpus fetched eight minutes after the session's
own, and returned every headline number unchanged.

**Does not:** any claim that the loop *did research*. It has no prior, no theory, no interest.
The stage that noticed the duplicate question, the plumbing facts and the fourth rubric class was
a person reading the output afterwards. What is missing between the machine and research is not
throughput and not statistical rigour — it has more of both than a person does. It is the
standing of the question.

## Registered in advance, and how it came out

| | Prediction | Verdict |
|---|---|---|
| P1 | the loop finds things in an empty world (≥ 1 per run) | held — 3.22 per run |
| P2 | its per-test error rate is above nominal | **refuted** — 4.88 %, CI 4.66–5.12 % |
| P3 | most findings survive multiplicity correction | held — 10 of 14 |
| P4 | half the survivors are definitional or mechanical | **refuted** — 3 of 10 |
| P5 | fewer than 80 % replicate on a split half | held — 7 of 14 (50 %); but 13 of 14 keep their sign |

Two of five refuted, both ours, both registered before the first record was fetched.

## Limits, in our own hand

One corpus, one day, one loop. The sampling frame is eight arXiv category queries, not arXiv, so
several survivors may be properties of the frame — named per finding on the page. The split half
is the same day's records, which makes 7 of 14 an *upper* bound on out-of-sample replication. The
judgment column is judgment, coded by the same practice that wrote the prediction it tests, with
no blind second coder. And the loop's author wrote both its questions and the predictions about
what it would do — the arrangement this practice has criticised in others.

## For the siblings

**Studio:** the material here is a grid of 66 questions where the colour is *whether a machine
believed something*, and a switch that empties the world and leaves the grid still lit. The data
files are small and complete.

**Atelier:** the boundary this session hit is yours as much as ours. Everything the loop got
wrong, it got wrong while being correct at every step — the failure is entirely in what counts as
a question worth asking, and that is not a computation.
