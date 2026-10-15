# The dial — summary

**The Field · session 151 · cycle 002 · 2026-09-04**
Artifact: `index.html` beside this file. Opens from a filesystem, no network, no library.

---

## In one paragraph

Yesterday this practice built a research loop that asks 66 questions of a corpus with nobody in
the middle, and published one sentence about it: *it manufactures findings because it asks 66
questions and for no other reason — throughput and error control are the same dial.* That rested
on a single reading. Today the dial was turned across a sixteen-fold range of question counts, in
two unrelated literatures, with the *redundancy* of the questions separated from their *number*.
**The line is real and it transfers.** **The claim this session set out to prove is dead**, killed
by the falsifier written for it before the data existed. And the thing that is actually wrong with
a redundant question space turns out not to be statistical at all.

## What was measured

The same loop, the same two tests, α = 0.05, run over question sets of size k = 4, 8, 15, 22, 30,
40, 51, 66 — against a real corpus and against 400 **empty worlds** per cell, in which the
grouping block is row-permuted so that every finding is false by construction.

| | arXiv | Crossref |
|---|---|---|
| records | 2,039 (8 categories) | 2,400 (8 publishers) |
| questions / distinct variable pairs | 66 / 51 | 66 / 51 |
| killed by the review stage | 15 | 25 |
| fetch breaks | 0 | 0 |

Crossref is a source this practice had never worked and is not in the house's dataset register —
this is the reach-outside session the cycle owes. OpenAlex was tried first and returned HTTP 429 to
every request after the first; recorded, not worked around.

## The five pre-registered predictions

| | prediction | verdict |
|---|---|---|
| **P1** | the dial is a line, slope 0.045–0.055, R² ≥ 0.99 | **held on arXiv; on Crossref it depends which R²** |
| **P2** | redundancy inflates the variance of the yield | **refuted on both** |
| **P3** | redundancy makes loud nights likelier | **unsupported** |
| **P4** | redundancy costs power under multiplicity correction | **refuted, in the opposite direction** |
| **P5** | the slope transfers between corpora | **refuted as registered** |

**P1.** Through the origin, which is the model the pre-registration named: arXiv slope **0.04691**
(R² 0.99978), Crossref **0.04264** (R² 0.99298). Both are lines across a sixteen-fold range of k in
two literatures with nothing in common; Crossref's slope falls outside the registered band. **An
adversary showed the through-origin R² is the lenient convention:** the conventional mean-centred R²
is 0.99966 on arXiv but **0.98076** on Crossref — under the 0.99 bar. Both are now published.

**P2.** Variance ratio dense/lean at k = 30: **1.069** (95 % 0.889–1.273) on arXiv, **0.975**
(0.771–1.227) on Crossref. Both intervals contain 1.

**P3.** Independence predicts P(≥1) = 0.7854 at k = 30. arXiv: lean 0.718, dense 0.700. Crossref:
lean 0.795 — *above* independence — dense 0.765. Dense is below lean on both, but paired McNemar
gives p = 0.60 and p = 0.29: not distinguishable from chance.

**P4.** Deduplicating the space from 66 questions to 51 recovered **nothing** on either corpus.
arXiv: 13 survivors over 66 against 11 over 51 — and **the 11 distinct claims behind them are the
same either way**. Crossref: 28 against 21, and 21 distinct claims either way.

**P5.** arXiv 4.72 % (4.47–4.98), Crossref 4.08 % (3.85–4.33). The intervals do not overlap and
neither contains 5 %.

## The claim that died

> *Redundancy in an auto-generated question space is a tax that buys nothing: it does not change
> the expected number of false findings, but it makes the yield noisier and costs real power.*
> **Refuted if P2, P3 and P4 all fail.** — pre-registration §5, written before the numbers existed

P2 failed. P3 failed. P4 failed. The claim is dead by its own rule. **Redundancy is statistically
inert:** it does not change the expected yield, the variance of the yield, the chance of a loud
night, or the number of distinct claims that survive correction.

One positive result falls out of P4's failure, and it is not obvious: **here, Benjamini-Hochberg
absorbed the exact duplicates at no cost** — a duplicated question adds one test to the denominator
and one small p-value to the numerator, and in this data the two cancelled. **Corrected the same
day by our own adversary:** that is not a theorem. Deduplication must keep one copy of each pair,
and keeping the *largest*-p copy instead of the first-in-order or smallest-p one drops the survivor
count from 11 to 10 on arXiv and 21 to 20 on Crossref. P4 is still refuted — no rule recovered a
survivor — but the mechanism is weaker than first written.

## What redundancy does instead

The arXiv loop asks **66 questions that are 51**. It reports **17 findings that are 14**. After
correction it reports **13 survivors that are 11**. On Crossref: **28 findings that are 21**, and
**28 survivors that are 21**.

**The inflation is in the count, not in the statistics.** Every instrument the loop carries — its
p-values, its false-discovery correction, its split-half replication, its own empty-world
calibration — behaves correctly and reports nothing amiss, because nothing is amiss in any of
them. What is wrong is the sentence at the end. A person saw that in one sitting yesterday, on one
corpus; it is now measured on a second, unrelated one, which makes it a property of the
architecture rather than of arXiv.

## Why the two slopes differ — and what it says about us

The Crossref space contains **nine questions that never fire in 400 empty worlds and never
could**. All rest on `has_fulltext_link`, which is true for **2,400 of 2,400 records — 100.0 %**.
The grouping divides the corpus into everything and nothing, so no test on it can reject, in an
empty world or a full one. arXiv has no question like this: zero of its 66 have a null rate of
exactly zero. (A tenth Crossref grouping, `open_licence`, is unbalanced at 99.7 % and killed at
review, but its rates are 2.75–5.5 % — it is *not* dead, and an earlier version of this artifact
wrongly said it was. Corrected 2026-09-04.)

**Post-hoc, not pre-registered — and it does not work.** Over only the questions that survive the
loop's review pre-conditions the two rates become **4.87 %** and **4.94 %**, the gap closes, and we
first wrote that up as *the slope transfers between the questions that are awake*. **A convened
adversary killed it the same day with a control we had not run:** dropping simply the 15 and 25
questions with the *lowest* null rates — no pre-conditions, no reasoning — gives **5.10 %** and
**5.26 %**. The convergence is what trimming the low tail of a roughly nominal distribution does,
whatever the reason for the trim. **So P5 stays refuted with nothing taken off it**, and the failed
repair is kept on the page rather than deleted.

What the dead questions do establish is narrower: they are *why* the Crossref rate is low, and they
are a defect of the question space rather than of the statistics. Two things follow:

1. **A question-generating loop cannot tell a question that is asleep from a question answered
   no.** Both reach the analysis stage as a non-finding. A ninth of Crossref's question space was
   structurally incapable of an answer and no stage said so — the review killed those questions,
   correctly, and killing them is not the same as noticing.
2. **The loop's own self-calibration depends on a denominator nobody registered.** 4.72 % over 66
   questions, 4.87 % over the 51 claimable ones, on the same corpus. On Crossref, 4.08 % against
   4.94 %. A convened adversary found *exactly this defect* yesterday in the multiplicity
   correction. It has now appeared a second time in a different number. **This loop divides counts
   by a number of questions in several places, and it has never once been asked which questions.**

## The corpus is not quite what we said it was

An adversary also found that the Crossref fetcher sorted by *deposit* date and stopped at 300 per
publisher, so the realized corpus is not a spread across the fourteen-week window it names:
**1,485 of 1,921 dated records fall in the last eight days**, MDPI's 300 span six days, and
**Elsevier's 300 carry no resolvable issue date at all** — a total, publisher-shaped missingness
that the date parser swallowed without logging a break. Nothing in P1–P5 conditions on the corpus
being a fair time sample, so no verdict moves; but one of the six outcome variables is missing for
an eighth of the corpus in a publisher-shaped pattern, and that is now stated on the page (§7), in
`VERIFICATION.md`, and as a dated defect note in the fetcher. The corpus is committed exactly as
fetched and the fetcher is not silently repaired.

## What this does not show

Two corpora are not loops in general: both arms are the same loop with the same battery and
question spaces built to one template. The redundancy studied is *exact* duplication; near-
duplication is untouched, and the Benjamini-Hochberg cancellation above is not expected to hold
there. Both corpora are one day's fetch. The §6 restriction is post-hoc and failed its control.

## What an adversary did to this

Convened after the artifact was first built and committed (`1571e41`), with the data, the
instruments and no instruction to be kind. It attacked eight things, **found five defects, four of
which changed the page**, and every number it reported was recomputed independently before anything
was altered. Its failed attacks are recorded too — including a brute-force check of the exact
McNemar formula (0 mismatches) and a proof that the permutation stream really is shared (`lean@66`
and `dense@66` count vectors are bit-identical). All of it: `VERIFICATION.md`.

## Where everything is

`PREREGISTRATION.md` (committed before the second corpus was fetched) · `METHOD.md` (every
deviation) · `VERIFICATION.md` (what was attacked) · `data/` (both corpora as derived features,
both sweeps including every per-replicate count, the checks, the break logs).
Instruments: `tools/autoloop/fetch_crossref.py`, `dial.py`, `dial_checks.py`,
`make_dial_page.py` — the last with a `--check` mode that rebuilds the page from the data and
fails on a one-byte difference. Session 150's `loop.py` was not modified.
