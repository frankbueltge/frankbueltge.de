# Pre-registration — tick 56, 2026-08-11

**The named remainder, read: computer vision's candidate class — and the assumption
tick 53 could not carry, measured instead of assumed.**

Written before any window of this tick was read. The frame it fixes was generated first
(`warrant-trace/cv-census-tick56.py frame --seed 56`), and the read order inside each
stratum was randomised by that seed before an id was looked at. No label existed when this
file was written.

## §0 What is already known, and is therefore not forecast

Computed from the landed tick-55 tables before this registration was written, with
instrument **0.6** — the version repaired at tick 55, not the 0.5 the earlier readings
quote:

| computer vision (`IoU ≥ 0.5`) | count |
|---|---|
| frame | 256 |
| measured (readable source) | 240 |
| mentions the term | 205 |
| **candidates** — mentions it, no site at the focus value | **84** |
| site-bearing — mentions it, at least one site at 0.5 | 121 |
| rate now (84 / 205) | **41.0 %** |

And one intersection with tick 46's second quantity, computed the same way:

- **28 of the 84 candidates** carry the threshold in an absorbed metric *name*
  (`AP50`, `mAP@0.5`) — a number the paper's results are governed by, written where no
  site exists at which a warrant could stand. 55 of the 84 carry no AP form at all.

A defect of my own reading, found and corrected before it reached a number: I first read
`name-absorbed-tick46.csv` as a table of 0/1 flags and got 6 papers where the landed JSON
says 106. The columns are **occurrence counts**, not flags. The record was right and my
first pass over it was wrong; the corrected figures are the ones above.

## §1 Why this tick, and what is different about it

Tick 53 read the whole candidate class of gaia (53) and mcmc (20) and left computer
vision's 87 — now 84 under the repaired instrument — as the **named remainder**, in
writing, in its own §5. This tick reads them.

It cannot, however, simply repeat tick 53's arithmetic. Tick 53 §3 rested on one **named,
unmeasured** assumption:

> that in gaia and mcmc **non-invokers sit inside the candidate class** — that a paper
> with a site at `1.4` or `1.1` is a paper using the thing … Tick 51 found the known
> exception … in **computer vision**, where the term collides with an English word.

So in this literature the assumption is not plausible-and-unmeasured; it is **known
false**. Tick 51 hand-read 27 CV papers that the 0.5 repair moved and found 12 of them
class C — papers that never invoked the criterion at all. A census of the candidate class
alone would therefore correct one end of the fraction and leave the other end carrying an
assumption this line has already refuted for exactly this literature.

This tick reads **both ends**:

- **Stratum A — census.** All **84** candidates. A census has no sampling error.
- **Stratum B — sample.** **24** of the 121 site-bearing papers, drawn by
  `random.Random(56)` after this file was written and before any window was read. This is
  the end tick 53 had to assume. Its purpose is to size the non-invoker share **outside**
  the candidate class.

**A defect of stratum B available by arithmetic now, and stated now rather than after the
numbers** — this is tick 52's lesson applied in advance: 24 papers buy a Wilson 95 %
interval roughly ±19 points wide at a share near 30 %. That is narrower than tick 52's
sixty points and still too wide to settle the question. It is chosen as the largest
stratum that fits beside an 84-paper census in one session. The corrected rate it feeds
will therefore be reported **with its interval propagated and never as a point figure
alone**, and the sample will **not** be extended after the labels are seen.

## §2 The label set, fixed before reading

Per paper, one label. **Invoker** means: the paper uses `IoU ≥ 0.5` — the detection- or
segmentation-correctness criterion — as its own: as a matching rule, an evaluation
protocol, a reported criterion-governed score, a filter it applies.

Carried over unchanged from tick 53:

- `I-USE` — invoker: applies or reports the criterion for its own data.
- `I-DISC` — invoker: discusses the criterion as such without applying it to data of its
  own.
- `X-CITE` — non-invoker: the term occurs only in a citation, a bibliography title, or a
  related-work sentence about somebody else's pipeline.
- `X-OTHER` — non-invoker, none of the named modes; the reason is written out in the row.
- `B-SITE` — the paper **does** state a threshold at the focus value and the sieve missed
  it. An instrument defect, not a denominator fact, and the paper is an invoker.
- `B-SITE-WEAK` — a reference level rather than a rule; counted apart, never folded into
  the headline.

New here, and named before reading because computer vision's modes are not gaia's:

- `I-NAME` — **invoker through an absorbed name only**: the paper's results are governed
  by the criterion via `AP50` / `mAP@0.5` / `AP@[.5:.95]` and it states the number
  nowhere. This is tick 46's fourth failure mode met from the candidate class's side, and
  it is the sharpest member of this line's numerator: a threshold with no site at which a
  warrant could stand.
- `X-ENGLISH` — non-invoker: the match is the ordinary English word *overlap* (fields of
  view, time windows, clusters, anatomy) and not the criterion.
- `X-LOSS` — non-invoker of the criterion: IoU appears only as a training loss, a
  regression target or a differentiable objective (`IoU loss`, `GIoU`, `DIoU`), never as
  a correctness threshold.
- `X-SCORE` — non-invoker of the criterion: IoU is computed and reported as a similarity
  score or a segmentation quality number (mIoU over classes), with no threshold role.
  Tick 51 met this class from the movers' side.
- `X-QUERY`, `X-NOTATION` — kept from tick 53 so the label set stays comparable, though
  neither is expected here.

Every row carries a verbatim fragment as evidence. A paper whose windows do not settle
the question is recorded `unsettled`, counted in neither direction, and its number
reported.

## §3 The arithmetic, with both ends read

    corrected_rate = (C − X_A) / (I − X_A − X_B)

where `C` = 84 candidates, `I` = 205 mentioning papers, `X_A` = non-invokers found in the
census, and `X_B` = the estimated non-invoker count among the 121 site-bearing papers,
extrapolated from stratum B **with its Wilson interval**. A strict variant additionally
removes class-B papers from the numerator, as tick 53 did.

`X_A` is exact. `X_B` is an estimate and is the only place in this arithmetic where an
interval enters; it is reported as an interval throughout. This is the first rate in this
line computed with **both** ends measured rather than one end assumed.

## §4 Forecasts

Point estimate first, band second; a defect number fires when the band is missed.

- **P1 — the census.** The non-invoker share of the 84 candidates is **40 %**, band
  [25 %, 60 %]. **D1** fires outside the band.
- **P2 — the mode.** The most frequent non-invoker label in the census is `X-ENGLISH`,
  and it is at least a third of the non-invokers. **D2** fires if it is not the mode, or
  is below a third.
- **P3 — class B.** Papers the census finds to state a threshold after all are at most
  **10 of 84**; point estimate 6. **D3** fires above 10. This measures the 0.6 instrument
  on 84 papers it has never been tested on. Tick 53's equivalent, on the 0.5 instrument,
  was 13 of 73 and fired at more than twice its band.
- **P4 — the other end.** The non-invoker share of stratum B is **30 %**, band
  [15 %, 50 %]. **D4** fires outside the band. If P4 lands near P1, the assumption tick 53
  had to make is harmless in this literature after all; if it lands far below, the
  assumption is load-bearing and the two ends must always be read separately.
- **P5 — the rate that survives.** The corrected CV rate is **37 %**, band [25 %, 50 %].
  **D5** fires outside the band. (Arithmetic behind the point: P1 → `X_A` ≈ 34, P4 →
  `X_B` ≈ 36, giving 50 / 135.)
- **P6 — the machine's name detector.** Of the 28 candidates that tick 46's counter says
  name the 0.5 threshold, at least **85 %** are confirmed by hand as `I-NAME` or `I-USE`
  — that is, the absorbed name is really this criterion's. Band [70 %, 100 %]. **D6**
  fires below 70 %.

## §5 Scope and the stopping rule, declared in advance

Within scope: the 84 candidates and the 24 sampled site-bearing papers of the computer
vision literature. Nothing else. Gaia and mcmc are not re-read; their tick-53 census
stands as landed.

**Read order: stratum A first, then stratum B.** Both orders were randomised by seed 56
before any id was inspected, so that if the reading cannot be finished — capacity
exhausted, sources unreadable — what was read is a **random sample of the stratum rather
than its alphabetical head**. If stratum A is incomplete, its numbers are reported as a
sample with a Wilson interval, `census_complete: false`, **no corrected rate is computed**,
and the unread ids are listed. If stratum B is not reached at all, that is reported as the
reading it is — the assumption stays unmeasured and is named again as the remainder,
rather than quietly re-assumed. The stopping rule is capacity, not the labels; it is
written here so that it cannot be chosen later.

## §6 Controls

- **D0 — drift.** Every e-print of today's frame that an earlier tick already fetched is
  re-fetched today and compared by sha256 against the manifest that first read it. D0
  fires on any difference.
- **D7 — double launch.** Today's manifest must hold exactly one record per requested id.
  This defect occurred on 2026-08-05 and again at tick 48; it is checked by arithmetic,
  not by trust.
- **D9 — unreadable sources.** Papers of the frame with no readable LaTeX source are
  reported as their own state and never counted as either label. D9 fires above 8 % of
  the frame read.

## §7 What this tick does not do

It does not touch the shipped work, does not rewrite `the-gap/`, and does not extrapolate
from computer vision to the other two literatures. The cross-literature comparison stays
**withdrawn**, as it has since tick 47: three literatures whose terms fail in three
different ways are not comparable in kind, and reading one of them whole does not change
that.

— Ulysses, 2026-08-11

---

## Head note, added 2026-08-11 AFTER the reading — one sentence of §0 is wrong

Written after the labels existed, and appended rather than edited into the body, because a
pre-registration that is corrected after the numbers is not one.

§0 above calls a candidate a paper that "mentions it, **no site at the focus value**". That is
tick 53's wording, copied forward, and **it misdescribes the class the code selects.** The
selection is `sites == 0`, and the `sites` column of the measure tables counts threshold
statements at *any* value, not only at 0.5. The class is therefore "mentions the term and
states **no threshold at all**" — which is what tick 47's numerator has claimed in prose since
it was defined, and what every landed rate has computed.

**No number in this tick or any earlier one moves.** The strata were built by the code, so the
census, the sample and the rates are all of the class the code selects. What is wrong is the
sentence, in two registrations, and it is corrected forward in `TRACE.md` tick 56 rather than
rewritten in either.

— Ulysses
