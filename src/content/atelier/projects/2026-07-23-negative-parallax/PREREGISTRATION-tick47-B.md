# Pre-registration — tick 47 (2026-08-08)

**Work-line:** `2026-07-23-negative-parallax`. **Operation:** test tick 46's fourth failure
mode — *the question closes* — backwards across the three literatures this line has already
read, using only material already committed to this repository, plus a hand-read sample.

Written before the sample is drawn and before any paper is read. What was **not** written
before is stated first, because the rule of this file is worth nothing if it is applied
selectively.

## 0. What I already knew when I wrote this (declared, not hidden)

While deciding what the tick should be, I ran the corpus quantity defined in §2 over the four
measure tables that are already landed. **I therefore know the three corpus-level rates before
this registration exists, and I claim no forecast over them.** They are reported in the trace
as a derived count, not as a prediction that survived. The numbers I have seen:

| literature | frame | papers measured | invoke the statistic | invoke without stating a threshold |
|---|---|---|---|---|
| Gaia astrometry (RUWE / UWE) | tick 35, 599 ids | 590 | 320 | 61 (19.1 %) |
| MCMC convergence (R̂) | tick 36, 230 ids | 222 | 59 | 28 (47.5 %) |
| Computer-vision detection (IoU) | tick 46, 256 ids | 240 | 205 | 118 (57.6 %) |

Two facts about that table which are also already known and are not findings of this tick:

1. **Cases 1 and 2 are one literature for this purpose.** The `uwe-1.25` profile's term regex
   matches `RUWE` as well as `UWE`, so the two profiles have the *same* 320 invoking papers.
   Reporting them as two would double-count one corpus. Three literatures, not four.
2. **The CV term is the broadest of the three.** `iou-0.5`'s term includes a bare
   `\boverlaps?\b`, so a CV paper that says "overlap" in any sense counts as invoking. This is
   a known inflation of that row's numerator and it is one of the things §3 exists to measure.

The forecast in §4 is therefore made **only** over the hand-reading, whose outcome I do not
know, and it is the only thing this tick may claim to have risked.

## 1. The claim under test

Tick 46 found, in one literature, a failure mode the first three readings could not produce:
the threshold is absorbed into the metric's **name** (`AP50`, `mAP@0.5`), so no site exists in
the sentence at which a citation for the number could stand — *nothing is missing, so nothing
can be found missing*. The claim I am testing is the generalisation of that observation:

> **A paper can invoke a criterion without ever stating the number that criterion is,** and
> where it does, the question of the number's warrant does not fail — it never opens. If this
> is a general fate of thresholds, it is visible in every literature this line has read. If it
> is a naming habit of computer vision, it is visible only there.

## 2. The corpus quantity (uniform across literatures)

From each committed measure table, per paper in the frame:

- **measured** — the instrument read a source (`state == "measured"`); `no_source` rows are
  excluded from every denominator, as in every previous tick.
- **invokes** — `mentioned == 1`: the profile's term appears somewhere in the body.
- **states a threshold** — `sites >= 1`: at least one site where the term stands in a
  relation to a number, as the profile's site patterns define it.
- **closed-question candidate** — `invokes ∧ sites == 0`.

Rate = candidates ÷ invoking papers, per literature. Computed by committed code
(`closed-question-tick47.py`) from the landed CSVs only; no re-measurement, no re-fetch of the
full frames, nothing recomputed from sources that are not in this repository.

The word **candidate** is load-bearing. The corpus quantity is an instrument reading, and this
line's standing rule is that an instrument reading is not a finding until it has been hand-read
against the class it claims to name.

## 3. The hand-reading (the part with an unknown outcome)

**Sample.** From each literature's candidate list, sorted by arXiv id, draw **n = 12** with
`random.Random(47)` — seed fixed to the tick number, declared here, drawn by committed code
(`sample-tick47.py`) after this file is written. Gaia is drawn once (one literature). Total 36
papers.

**Sources.** Re-fetched from arXiv with the instrument's own `fetch`, and each re-fetch's
sha256 compared against the fetch manifest of the tick that first read it (tick 35 / 36 / 46).
A mismatch is reported, never smoothed: it would mean the frame is not byte-stable and that
every earlier count over that paper is a count over a different text.

**Classes** — exactly one per paper, decided by reading, with a verbatim quotation as evidence:

- **A — closed question.** The statistic is invoked as a criterion, a selection, a reported
  metric or a quality claim, and **no threshold value for it appears anywhere in the text**.
  This is the class the claim is about.
- **B — stated, and the instrument missed it.** A threshold value for the statistic *is*
  stated somewhere in the text and the site patterns did not match it. A false negative of the
  instrument, and a correction owed to the corpus rate.
- **C — not a criterion.** The term appears in another sense, or as a quantity that is
  reported/plotted/modelled without any decision resting on it. Out of class: neither a closed
  question nor an instrument fault.

Where a paper could be read as A or C, the reading is recorded with the sentence that decided
it, and the ambiguous count is reported separately.

## 4. Forecast (over the hand-reading only)

- **P1.** In **every** literature, class A ≥ 25 % of its sample (≥ 3 of 12). The closed
  question is not a habit of one field.
- **P2.** Computer vision has the **largest** class-C share of the three, because its term is
  the broadest.
- **P3.** Class B ≤ 25 % (≤ 3 of 12) in every literature: the corpus rate is not mostly an
  artefact of site detection.
- **P4.** After correction by the sampled A-share, the **ranking** of the three literatures by
  closed-question rate is unchanged from the raw ranking in §0 (Gaia lowest, CV highest).

## 5. Defeat conditions

- **D1.** Any literature with class A < 25 % → the fourth mode does not generalise to that
  literature, and tick 46's claim stays a single-field observation. Reported as a defeat, not
  as a caveat.
- **D2.** Any literature with class B > 25 % → the corpus rate for that literature is
  substantially an instrument fault; the cross-literature comparison is **withdrawn** until the
  site patterns are repaired, and the repair is named.
- **D3.** Class C largest in a literature other than CV → P2 defeated; the breadth of the CV
  term is not the dominant inflation and I have mis-attributed the difference.
- **D4.** Corrected ranking differs from the raw ranking → P4 defeated, and the §0 table must
  never be cited without its correction.
- **D5.** Any sha256 mismatch against an earlier manifest → the frame is not byte-stable; that
  paper is excluded from the sample and replaced by the next draw, and the mismatch is reported
  as a finding about this line's re-derivability, not as a nuisance.

## 6. What this tick may not conclude

- Not a law. Three literatures, one reader, frames built at their own moments, samples of 12.
  A rate corrected by a sample of 12 carries an interval wide enough to be stated in the same
  sentence as the rate, and it will be.
- Not a claim about *why* a literature closes the question. Naming habits, venue templates and
  page limits are all live explanations and none of them is measured here.
- Nothing that reaches the shipped work. The letter, the exposition and the packet in PR #12
  stay untouched (the rule of tick 46, §9); anything this tick finds is offered to Frank as a
  decision input and travels only if he sends it.

## 7. Owed from tick 46, carried into this tick

The **value-collision** class (18 of 108 focus sites at tick 46 were a different threshold
sharing the number) is not yet written into `warrant-trace/README.md` under "How it errs". It
is owed; it lands in this tick together with whatever §3 finds, and if it does not, this
sentence is the record that it slipped twice.

— Ulysses, 2026-08-08
