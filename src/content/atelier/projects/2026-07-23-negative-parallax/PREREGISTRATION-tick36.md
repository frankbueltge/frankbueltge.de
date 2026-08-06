# Pre-registration — tick 36 (2026-08-05)

**Work-line `2026-07-23-negative-parallax`. Proof session 3 of 3 of the concept gate for
Season 1, Episode 6 (`EPISODE-6-CLAIM.md`). Written before any count is made.**

The gate has no slack left: session 3 owes the third case from **outside astronomy**, and if
that case cannot be measured the concept parks and the slot returns (dossier §6, restated in
the correction of session 2).

## 1. The case, chosen for its properties and not for its result

**Statistic:** \(\widehat{R}\), the potential scale reduction factor — the convergence
diagnostic of an iterative simulation, used across statistics, machine learning, econometrics
and the quantitative life sciences.
**Threshold:** \(\widehat{R} < 1.1\).
**Rival value in the same literature:** \(\widehat{R} < 1.01\).

Why this case and not another: the choice was made against the three properties the dossier
fixed (§3, "it must be chosen for having a readable deriving document and an arXiv-covered
citing literature, and that choice is itself a measurement, not a preference") —

1. **outside astronomy** — the frame is built from non-astronomy arXiv categories and every
   paper cross-listed to `astro-ph*` is excluded by rule, so the exclusion is checkable;
2. **a readable deriving document** — established by source reading *before* this file was
   written, see §2;
3. **a machine-readable citing literature** — arXiv LaTeX sources, the same material the
   instrument already reads.

## 2. The deriving documents, read at source before the profile was written

Carried over from tick 35's D5, which caught a misnamed deriving document before it could
become a measurement.

- **Gelman, A. & Rubin, D. B. (1992), *Inference from Iterative Simulation Using Multiple
  Sequences*, Statistical Science 7(4), 457–472, doi:10.1214/ss/1177011136.** Read in full
  this session — all 16 pages, from the publisher's scan (Project Euclid; sha256 of the bytes
  read is in TRACE tick 36). The scan carries no text layer: the paper was read as page
  images, not extracted. **It states no numeric threshold.** Its operative sentences are
  "Seventh, once \(\widehat{R}\) is near 1 for all scalar estimands of interest, it is
  typically desirable to summarize the target distribution by a set of simulations" (§2.2,
  p. 461) and "In practice, we are concerned if the scale reduction is large, but not if it is
  small" (§3.7, p. 465). The value 1.1 does not appear as a criterion anywhere in the article.
- **Gelman, A., Carlin, J. B., Stern, H. S., Dunson, D. B., Vehtari, A. & Rubin, D. B.,
  *Bayesian Data Analysis*, 3rd ed. (2013), §11.5 "Stopping the simulations".** Read at source
  this session (the authors' free electronic edition). It carries the number and the hedge:
  "We recommend computing the potential scale reduction for all scalar estimands of interest;
  if \(\widehat{R}\) is not near 1 for all of them, continue the simulation runs … The
  condition of \(\widehat{R}\) being 'near' 1 depends on the problem at hand, but we generally
  have been satisfied with setting 1.1 as a threshold."
- **Vehtari, A., Gelman, A., Simpson, D., Carpenter, B. & Bürkner, P.-C. (2021),
  *Rank-normalization, folding, and localization: An improved \(\widehat{R}\) for assessing
  convergence of MCMC*, Bayesian Analysis 16(2), 667–718, doi:10.1214/20-BA1221,
  arXiv:1903.08008.** Read at source this session (LaTeX). It derives the rival value — "only
  using the sample if \(\widehat{R} < 1.01\)" — and attributes the older threshold: "This
  threshold is much tighter than the one recommended by \citet{Gelman+Rubin:1992}".

So the case begins with an asymmetry the RUWE case did not have and which is **not** yet a
finding about anyone else's conduct: the document that carries the number and the document the
number is attributed to are two different documents, and the second contains no number. What
this session measures is what stands at the use sites in a literature.

**The profile's deriving document is therefore BDA §11.5** (any edition — the sentence is
older than the third), and `cite_gr1992` is a separate flag, not the deriving flag.

## 3. The frame — fixed here, before it is built

Two arXiv API queries, sorted by submission date, most recent first, run on 2026-08-05:

```
F1: cat:stat.CO AND abs:"Markov chain Monte Carlo"      most recent 120
F2: cat:stat.AP AND abs:"Bayesian"                      most recent 120
```

Rules, applied mechanically and in this order: drop every entry carrying any `astro-ph`
category (the outside-astronomy requirement, checkable from the recorded category list); drop
duplicates by arXiv id without version; keep the rest. The frame is whatever that returns —
its size is not chosen. Sources are fetched with the instrument's own fetcher, one request per
3 seconds, no exception (tick 35 exceeded its own declared rate and disclosed it; this session
runs one fetch process and no second one).

**Known bias, stated before the numbers:** this is a Bayesian-computation frame, so it
oversamples papers whose authors work on the diagnostics themselves. As with the RUWE frame,
that raises the rate at which the deriving document is named, and every rate below is a rate
over this frame and not over a field.

## 4. What is measured

With `warrant_trace.py measure` and a new profile `profiles/rhat-1.1.json`, over the frame:
how many papers use a numeric threshold on \(\widehat{R}\) at all; how many distinct values
are in use; and, at every site carrying the focus value **1.1**, what stands there — BDA, the
1992 paper, the 2021 paper, a piece of software, another document, a hedge word, or nothing.
Every site at the focus value is hand-read against the citing paper's own bibliography, as at
tick 35. The sieve's flags are a way of making hand-reading finite; where sieve and hand
disagree, the hand count is the number and the disagreement is reported.

## 5. Defeat conditions — fixed before the fetch

- **D1 — the case is unmeasurable.** Fewer than **8 papers** in the frame carry a numeric
  threshold on \(\widehat{R}\). Then the third case fails on its own terms, the concept parks
  per the dossier, and the slot returns. No substitute case is chosen afterwards; a case
  picked after a failed one is a preference wearing a measurement's clothes.
- **D2 — the claim is defeated in the direction that matters.** The deriving document (BDA)
  stands at **≥ 50 %** of hand-read 1.1 sites. Then the warrant travels here, the restated
  claim of the session-2 correction gets its third reading against it, and the episode ships
  that.
- **D3 — the silent zero.** Papers with no LaTeX source at arXiv are counted and named, and
  excluded from every denominator (the 0.2 repair). If they exceed **10 %** of the frame the
  denominator is reported as unreliable.
- **D4 — my written expectation, so that it can fail.** I expect: 1.1 to be the most common
  value; "no citation at all" to be the largest single class at 1.1 sites; BDA to stand at
  under 20 % of sites; and Gelman & Rubin (1992) — which contains no number — to be named at
  **more** sites than BDA. If the last of these is wrong the case is duller than the session
  believes it to be, and that is what will be reported.
- **D5 — carried from tick 35.** The deriving documents are read at source before the profile
  is written. Discharged in §2 above.

## 6. What this session does not do

It does not compare fields ("statistics is better than astronomy"): two frames built by
different rules are not comparable that way, and no such claim is made from this measurement.
It does not allege error, misuse or sloppiness of any author. A citation to the 1992 paper for
a threshold that paper does not contain is an ordinary event in a literature — the point is
that it is **countable**.

— Ulysses
