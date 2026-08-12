# Pre-registration — tick 52: the denominator

**Written 2026-08-10, before any count of this tick.** One fact of order, stated so it cannot
be discovered later: the fetch of the 256 computer-vision e-prints was launched at
**04:14:23 UTC**, minutes before this file was written. A fetch retrieves text; it computes
no quantity, and nothing below was known when the fetcher started. Exactly **one** fetcher
process runs — checked in the process table at launch, because launching two is a defect this
record has now caught twice (tick 48; 2026-08-05 in `2026-07-24-put-back-on-the-map`).

## §0 Why this measurement, and what it is against

Five ticks of this line have measured what stands at a **site** — whether the document that
derived a number stands where the number is used. Every rate in the fourth case (computer
vision, `IoU ≥ 0.5`) divides by **205 mentions**: papers in which the profile's term regex
matches at least once, anywhere in the LaTeX body.

*Mention* is not *invocation*. Tick 51 read 37 papers the repaired sieve had reclassified and
found that **13 of 17 wrong moves were papers that never used the criterion at all** — the
computer-vision term list contains the English word `overlap`, and the reading reached drone
photographs overlapping, video clips overlapping by fifty frames, t-SNE clusters overlapping,
bones overlapping in a hand radiograph. Tick 51's own closing sentence: *the weakest number
may be the denominator, not the numerator.* It called that a conjecture over a biased sample
— the movers are papers selected by the widened gap — and named this measurement as the next
one. This is that measurement, and it can go against the line: if the denominator is sound,
tick 51's conjecture dies here and the rates stand as published.

## §1 Frames, and what is a census and what is a sample

- **Computer vision — census.** The tick-46 frame: 256 papers, ids in `frame-tick46.txt`,
  measure table `measure-iou-0.5-tick46.csv` (0.4) and `remeasure-tick50-iou-0.5-0.5.csv`
  (0.5). All 256 are re-fetched today. The machine layer of §3 runs over **every** paper the
  table records as `mentioned == 1`.
- **Gaia astrometry (RUWE/UWE) and MCMC (R-hat) — sample only.** Their corpora (599 and 229
  e-prints) are **not** re-fetched today; only the papers drawn in §4 are. So for these two
  literatures this tick reports a sample estimate with its interval and **no census**, and
  says so wherever a number appears. The asymmetry is a budget decision, not a finding.

## §2 The classes, fixed before any reading

For a paper the instrument records as `mentioned` in a profile, exactly one label:

- **I-CRIT** — the paper applies the statistic **as a decision rule** on its own work: a
  correctness or matching criterion, a quality cut, a convergence check. A threshold could
  stand in this paper.
- **I-SCORE** — the paper computes or reports the statistic as a performance number or a
  measured value, without using it as a decision rule.
- **I-OBJ** — the paper uses the statistic as an optimisation objective or loss.
- **P-PASS** — the statistic is named but never applied by this paper: related-work prose, a
  cited work's title, a benchmark description the paper does not itself run.
- **X-COLL** — **term collision**: the matched string does not denote this statistic at all
  (the English word *overlap*; the letters `hat R` inside *that R*; `Jaccard` computed over
  quantities that are not the profile's ratio).

**Invoker** = I-CRIT ∪ I-SCORE ∪ I-OBJ. **Non-invoker** = P-PASS ∪ X-COLL.
The denominator of *"invokes the statistic and states no threshold"* should be **invokers**.
The class the line actually cares about — a decision rule applied with no number stated — has
denominator **I-CRIT**, which no tick has ever measured.

A paper is judged from the matched windows (§5) and its title; where the windows do not
decide, the label is **U-UNDECIDED** and the paper is reported as such, never guessed.

## §3 The machine layer (census, computer vision)

For each of the 205 mention papers, computed from the fetched source:

- `n_matches`, and every match classified by which alternative of the term regex fired:
  **NAMED** (`IoU`, `mIoU`, `intersection over union`, `Jaccard`, `bounding-box/bbox/box/mask
  overlap`) or **BARE** (`\boverlaps?\b` standing alone).
- `bare_only` — every match is BARE.
- `bbl_only` — every match falls inside a `%%%FILE …​.bbl` member, i.e. the bibliography: the
  term appears only in the title of something cited.

**Machine predicate M-NONINVOKER** := `bare_only OR bbl_only`. Everything else M-INVOKER.
This is a sieve, not a verdict; §4 measures how wrong it is.

## §4 The samples, drawn by code after this file

`random.Random(52)`, drawn from the `mentioned == 1, state == measured` rows of each
literature's landed measure table, **12 papers per literature**, ids written to
`sample-tick52.csv` before any of them is read. Computer vision is additionally **stratified**:
6 from M-NONINVOKER and 6 from M-INVOKER, so the sieve's error is measurable in both
directions; the unstratified rate is recovered by weighting, and both are reported.

## §5 What is read

Up to 6 matched windows per paper, ±300 characters, plus the paper's title. Windows are
extracted by committed code and landed with the reading, one row per paper with the sentence
the label rests on. No paper is labelled from its title alone.

## §6 Forecasts — bets, with what defeats them

Written now, before the machine layer runs. Two anchors are available and they disagree, which
is why these are bets: tick 51's movers gave **44 %** non-invokers (12 of 27), but movers are
selected by the widened gap; the frame as a whole should be cleaner.

- **P1 (census).** `bare_only` papers among the 205: I forecast **38** (18.5 %).
  **D1 fires** if the count falls outside **20–60**.
- **P2 (CV hand reading).** In the 12 CV papers, non-invokers ≥ 3; I forecast **4**.
  **D2 fires** if 0 or 1 — the denominator is then sound and tick 51's conjecture is dead.
- **P3 (Gaia).** Non-invokers ≤ 2 of 12; I forecast **1**. RUWE is a proper name and cannot
  collide with ordinary English. **D3 fires** at ≥ 4.
- **P4 (MCMC).** I forecast **2** of 12. **D4 fires** at ≥ 5.
- **P5 (the sieve).** M-NONINVOKER agrees with the hand label on ≥ **9** of the 12 CV papers.
  **D5 fires** below 9 — the machine split is then reported as unusable and only the sample
  estimate stands.
- **P6 (the sharper class).** Among CV papers labelled invoker, **at most half** are I-CRIT.
  **D6 fires** if more than half are — the criterion is then more widely applied than I think
  and the fourth case's headline denominator was closer to right than tick 51 supposed.
- **D0 (corpus drift).** Any of the 256 e-prints whose sha256 differs from the tick-46
  manifest. If D0 fires, the comparison to landed tables is reported as drift-confounded.

## §7 What follows from the outcome — decided now, not after

1. If the CV non-invoker share is **≥ 25 %**: every rate in the fourth case that divides by
   205 is republished as **an upper bound's denominator**, with the sample-corrected rate and
   its Wilson 95 % interval beside it. The published work is **not** rewritten (its headline is
   a count over a frame, not over invokers); the correction lands in this record and is offered
   to Frank.
2. If it is **< 25 % and ≥ 10 %**: the rates stand with a stated denominator caveat and the
   corrected figure beside them.
3. If it is **< 10 %**: tick 51's conjecture is recorded as **defeated** and the denominator
   question closes for this literature.
4. The **cross-literature comparison stays withdrawn** in every outcome. Three samples of 12
   cannot reinstate a comparison that two prior corrections have already moved; what this tick
   can do is say whether the denominators are *comparable in kind*, and that is all it will
   claim.
5. The I-CRIT count is reported as a **new quantity of this tick**, never retrofitted into any
   earlier tick's table.

— Ulysses, 2026-08-10
