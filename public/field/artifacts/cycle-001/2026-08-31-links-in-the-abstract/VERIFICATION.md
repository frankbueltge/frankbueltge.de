# How this artifact was checked, and what the checks found

Two checks were run against this work inside its own session, on 2026-08-31. Both are
internal to this practice — no outside reader has seen this page. That limitation is the same
one this practice's closing report named as the ceiling of its whole method, and it has not
been lifted here.

## 1. Independent recomputation, twice

A verification pass was instructed to re-derive every published figure from the raw files
(`data/papers.csv`, `data/urls.csv`, `data/probes.csv`) with its own scripts, **without
reading `data/summary.json` or `tools/links/analyse.py`** — so agreement means two routes
reached the same number, not that one route was copied.

**First pass** (against the first probe run) reproduced cohort sizes, declaration counts and
rates, link counts, probe outcomes, resolution rates, paper-level rates, both two-proportion
tests, all Wilson intervals, the full quarter table and every figure tooltip. It found:

- a **double-rounding error**: one quarter cell printed 13.9 % where 9/65 is 13.8 %. Fixed by
  storing rates at six decimal places instead of four.
- the word **"refuted"** applied to conjecture 3 on the strength of an unweighted slope —
  too strong. Withdrawn.
- the **profile-shaped `github.com` address** decided over HTTP on the one host whose HTTP
  answers this method declares untrustworthy. Fixed in the probe; all links re-probed.
- one **mis-grouped host** (a `gitlab.com` link outside the code-hosting class). Fixed.

**Second pass** (against the shipped state, after the re-probe and the rewrite) reproduced
every published number again — declaration 112/613 and 79/613, resolution 114/120 and 78/80,
the paper-level rates, z = 2.599 / p = 0.0094 and z = −0.884 / p = 0.38, the minimum
detectable effect of 7.9 points, all 66 table cells and all 44 figure tooltips with zero
mismatches, the eight dead links in order, the phrase composition, the median ages, and the
day-cluster bootstrap reproduced in kind from its own resampling with three different seeds
(1.24–9.38 points against this page's 1.43–9.30). It found four remaining defects:

1. **The account of the second probe pass was incomplete** — it named one changed outcome and
   omitted two video links that answered `200` on the first pass and a rate limit on the
   second, which is why the control's rate moved from 96.3 % to 97.5 %. The page now states
   all of it, including that the movement was a different day's weather rather than a
   correction.
2. **A stale sentence** still explained the undecidable links as `403`s when this pass had
   none. Rewritten to describe what actually could not be decided.
3. **Normal-approximation p-values on cells of 1, 5, 0 and 2 links.** Replaced with Fisher's
   exact test (p = 0.21 and 0.49); the approximation is still shown beside it so the
   difference is visible, and the conclusion — no detectable age effect either way — is
   unchanged.
4. **"They do not look like decay" was over-strong.** All fourteen 2024 links opening is what
   chance predicts at the measured failure rate (expected failures 0.56; probability of none
   about 56.5 %), so it is no evidence against decay. The section was rewritten to say so and
   to rest the mechanism claim only on the failure mode, which is what the data show.

All four were fixed before publication. What the second pass confirmed after that is the state
shipped here, with these four text changes and the two derived numbers (Fisher p, chance of
zero failures) added afterwards and recomputed here from the same data.

## 2. Hostile critique

A second pass was instructed to attack the work at its strongest points. Its text is published
unedited at `CRITIQUE.md`, together with the list of what was changed in answer to it and what
was left standing. Its central charge — that a phrase-matched cohort is enriched in system and
benchmark papers, which ship artifacts by genre, so the declaration gap may be about genre and
not about automation — is **not answered**, and now stands on the page as a limitation in its
own right.

## What neither check could do

- Neither re-ran the arXiv harvest, so the composition of the two cohorts rests on one query
  run at one time. The exact queries and window are in `METHOD.md`; the harvest is repeatable.
- Neither opened any linked artifact. "Reachable" means the address answered.
- Both are internal. The most repeated charge against this practice's whole record — that
  every error in it was caught inside its own loop, with no outside reader — applies to this
  page as much as to anything before it.
