# Rotated trace — Negative parallax, part 2

*Tick 57, moved here unchanged on 2026-08-12 (tick 60) under the §8 floor. It stood in
`projects/2026-07-23-negative-parallax/TRACE.md` from 2026-08-11 until that file reached the
floor of 6,000 words; nothing is rewritten and nothing is deleted. Ticks 1–56 are part 1
(`2026-07-23-negative-parallax-1.md`, pending PR #15). The live file keeps ticks 58 onward.*

---

## Tick 57 — 2026-08-11 — the third end of the fraction, read whole

**Cascade (a): the work-line's next operation**, named in one sentence by the tick that
created it — *"The 97 unread site-bearing papers are the next operation this line has."*
**Aspect: territory. OUTWARD** — 160 e-prints in one literature, read at source. Inward
counter: **1 in the last 4** (54–57). Forecast written first, and the frame generated
before it: `PREREGISTRATION-tick57.md`, `cv-siteclass-tick57.py frame --seed 57`.

### What tick 56 left, and why it could not be left

Tick 56 set out to read both ends of a rate and found a third end while reading the
second: of 24 sampled site-bearing papers, **7 carried no threshold statement at all** —
the sieve had matched a reported mIoU value, an inter-annotator agreement, or run its gap
from the term into `\sum_{i=1}`. Three of those seven were invokers, so the numerator had
lost them. Extrapolated: **15.1 papers, 95 % [5.3, 37.5]**; the rate with them returned,
**39.2 % [32.1, 55.1]**. An interval 23 points wide over 24 papers is why tick 56 wrote
its own headline down as *a lower bound, not an answer*.

That sentence is the whole reason for this tick. A line whose published figure rests on a
correction measured to ±23 points has not measured the correction.

### Controls

**160 e-prints fetched today** — the 97 of the frame, the 24 of tick 56's stratum B
re-read for the comparability check below, and 39 of stratum A for the name check. **160
of 160 byte-identical** to the manifests that first read them (D0 silent), exactly one
record per id (D7 silent), **0 unreadable sources** (D9 silent).

**D10, new in this tick's registration and the reason it exists.** The `windows` step
reuses tick 56's extractor rather than copying its rules. The first version of that reuse
swapped `frame-tick56.csv` on disk and renamed the output afterwards — which is exactly
the defect tick 56 found in `drift-tick53.py`, a later tick writing over an earlier tick's
landed record, rebuilt from scratch two days later. It was replaced before it ran: the
module-level `rows` is monkeypatched for the duration of one call and this tick's frame
rows carry the stratum name `B-tick57`, so the output filename the extractor derives
cannot collide. `git status` shows no landed file modified.

### The evidence changed, and it was declared before any label existed

Tick 56 answered *is the site a threshold statement?* from windows cut around **term**
matches — at most three per paper, spread over the paper, chosen for the invoker question.
The site is a *subset* of the term matches, so on a long paper the thing being judged need
not be among the windows judging it. This tick reads the **sites themselves**
(`sites-dump-tick57.py`, calling the same `sites()` the measure tables count). The invoker
label keeps tick 56's evidence unchanged, so that half of the census stays comparable.

Because the site evidence is *stronger* here, the two halves are not comparable on the
site question until the earlier half is checked at the same standard. Declared in
`PREREGISTRATION-tick57.md` §2 before any label, and performed: tick 56's **24 papers were
re-read from their own sites**. `recheck-tick56-sites.txt`. **24 of 24 site states
confirmed. Zero disagreements.** Tick 56 judged that question through a keyhole and got
every one of them right; the census is one measurement, not two.

### The census

| | count |
|---|---|
| mentioning papers `I` | 205 |
| candidates `C` — mentions the term, states no threshold at all | 84 |
| site-bearing `S` | 121 |
| stratum A non-invokers `X_A` (census, tick 56, one correction) | **38** |
| stratum B non-invokers `X_B` (census, 121 of 121) | **25** |
| class B — the sieve missed a real threshold | 5 |
| invented-site invokers returned to the numerator `R` | **7** |

**`X_B` = 25 of 121 — 20.7 %.** Tick 56's sample said 20.8 %, Wilson [9.2, 40.5], point
estimate 25.2 papers. The census lands **a fifth of a paper** from the extrapolation. On
this quantity the 24-paper draw was as good as a census, and the interval it carried was
the honest description of a thing that happened to be exact.

| | tick 56 (sample) | tick 57 (census) |
|---|---|---|
| rate as landed | 41.0 % | 41.0 % |
| denominator corrected | 32.0 % [29.1, 38.5] | **32.4 %** |
| both ends, class B removed | 28.4 % [25.8, 34.2] | **28.9 %** |
| invented sites returned | 39.2 % [32.1, 55.1] *(post-hoc)* | **33.8 %** |

Every figure in the right column is a count over a count. There is no interval in this
tick, because there is nothing left in the arithmetic to be uncertain about.

### The forecasts — four hold, two fire, and the two that fire are the point

- **P1** (non-invokers among the 97: 20, band [12, 30]): **21**. Holds, D1 silent.
- **P2** (both-ends-strict rate: 28.4 %, band [26.5, 30.8]): **28.9 %**. Holds, D2 silent.
  Declared in advance as an arithmetic image of P1.
- **P3** (invented sites among the 97: 28, band [19, 39]): **20**. Holds **by one paper**,
  and is recorded as a near miss, not a confirmation — the same way tick 51 recorded P3
  holding by 0.04 of a point.
- **P4** (invented-and-invoker among the 97: 12, band [5, 22]): **4**. **D4 FIRES.**
- **P5** (rate with them returned: 39.0 %, band [35.5, 43.5]): **33.8 %**. **D5 FIRES.**
- **P6** (at least half of the invented-and-invoker papers are `I-NAME`): **3 of 4** in
  this half, **7 of 8** across the census. Holds, D6 silent — and this is the one forecast
  here about a mechanism rather than a count: the paper whose threshold is absorbed into a
  metric name is also the paper most likely to report a bare mIoU number the sieve reads
  as a rule.

**What D4 and D5 say.** Tick 56 extrapolated 3 of 24 to **15.1 papers**; the census over
121 finds **7**. Three of those seven were tick 56's own — so the 97 unread papers
contributed **4**, where the sample predicted about twelve. That is not a marginal miss:
it is the sample's own 95 % interval [5.3, 37.5] failing to contain the truth, from a draw
that was random and was simply unlucky. The consequence is the tick's finding:

> **28.4 % was called a lower bound, and it is one — but the gap between the floor and
> the answer is 4.9 points, not 10.8.** The correction that ran against this line's claim
> is real, it is measured, and it is about four times smaller than the tick that found it
> could tell.

### The site question, over the whole class

| | n | share |
|---|---|---|
| a real threshold at the focus value | 80 | 66.1 % |
| a real threshold, some other value | 14 | 11.6 % |
| **no threshold statement at all** | **27** | **22.3 %** |

The 27 split 7 (tick 56) / 20 (tick 57), so the sample's 29.2 % overstated a census of
22.3 % — inside its interval, and in the same direction as the alarm it raised. Of the 27,
**8 are invokers** and **7 return to the numerator**.

**The eighth does not, and it is why this tick added a column.** Tick 56's rule returns an
invented-site paper to the class *states no threshold at all* if the paper invokes the
criterion. `2607.05311v1` breaks that rule: both its sites are invented — `IoU values range
from 0` and a `\sum` — **and the paper states the threshold in the very sentence the sieve
broke**: *"IoU values range from 0 (no overlap) to 1 (perfect overlap), with a threshold of
0.5 typically adopted for positive detection assignment in sperm detection benchmarks."*
Returning it would file a paper that states a threshold under *states no threshold*.
`states_threshold` is now a column in the hand table, and tick 56's three were checked
against it rather than assumed: all three are `I-NAME`, which means by definition that the
number is stated nowhere, and the corrected fourth was tested the same way — 0
threshold-shaped sentences.

### Three labels wrong in one direction, and the test that found them

A paper can report `AP_50` / `mAP@50` in live text and never write the term at a threshold.
It **is** an invoker — its criterion lives wholly in a metric's name — and windows cut
around the term cannot see it, because the name is not the term.

- `2604.01907v2` writes the term **once in the whole paper**, as `overlap of 50 frames`
  between video clips, and reports `AP_25` / `AP_50` tables. First read here as
  `X-ENGLISH`; it is `I-NAME`, and its single invented site puts it among the papers the
  numerator loses.
- `2604.19609v1`'s two sites are **pgfplots axis options** (`ylabel= mIoU (%) , xmode=log,
  log basis x=10`), and its text reads `82.7 mAP50 on the ScanNet test set`. First read
  here as `X-SCORE`; it is `I-NAME`.

Both were caught before landing. The test was then turned on tick 56's landed table, where
it found the same error twice more:

- `2607.27585v1` (stratum B, landed `X-SCORE`): 15 live AP@50-family hits including
  `Method & Backbone & Params & $mAP$ & $AP_{50}$ & $AP_{75}$`. `X_B` falls 5 → 4, and the
  paper joins the returning class.
- `2606.22439v1` (**stratum A**, landed `X-OTHER`): its two IoU sentences are SAM's
  `the highest-IoU mask is selected`, which is what the landed reading saw; its results are
  `mAP@50(B) ≈0.95, mAP@50-95(B) ≈0.90`. **`X_A` falls 39 → 38**, and because the paper
  stays a candidate, numerator and denominator both rise by one — which is the half-point
  in 28.4 → 28.9 %.

**Nothing landed is rewritten.** `handread-tick56.csv` is byte-identical; the corrections
sit in `correction-tick56-labels.csv` with the evidence that produced each one, and
`cv-siteclass-tick57.py corrections()` is the only place they enter an arithmetic.

**Against this tick, on its own instrument.** The name check is **one-directional**: it can
only move a paper from non-invoker to invoker, so the reverse error — an `I-NAME` that is
not one — is untested, and stratum A's 45 invokers were not tested at all. Its flag rate
was 3 of 44 site-bearing readings (6.8 %) against 1 of 39 candidates (2.6 %); whether that
difference is real, this tick cannot say from two classes. And the check is not free of the
corpus's own noise: `2605.20436v2` carries five `mAP50` rows, **every one inside a
`%`-commented table**, and a version that ignored comments would have promoted a withdrawn
table to a metric. The comment test is load-bearing, which is the same lesson tick 55's E4
recorded from the other side.

### One paper worth its own line

`2605.20436v2` produces **31 sites**, and not one of them is a threshold statement: reported
IoU values from 0.007 to 0.821, and hyperparameter sweeps where the gap ran from `mIoU` into
`\lambda_{\text{cons}}=0.1`. A single paper contributing thirty-one invented sites is the
clearest case this line has of why a *site* count and a *paper* count are different
measurements — and the rates here are paper counts, which is the only reason it costs one.

### What this tick did not do

The sieve is **not repaired**, for tick 56's reason, unchanged and not re-argued: a tick
that repairs the instrument it is measuring leaves no version in which the measurement
holds. Gaia and mcmc are not re-read. The cross-literature comparison **stays withdrawn**.
The shipped work, the exposition and `the-gap/` are untouched. **Five topoi: not used**,
logged as unused — nothing was judged. **Pre-opening check** ran and found no outward move
owed or available: the one packet is `prepared` and awaiting the architect, and the archive
move went out as PR #14 this morning.

### Named remainder, and the next operation

This reading is a repair specification, pinned to verbatim fragments in
`handread-tick57.csv`, and it is not the same list tick 53 produced:

1. **The apposition with no relation token** — `mAP at IoU 0.50`, `at IoU 0.3` in a table
   header. Tick 56 named it; `2607.02371v1` is a fresh case where it costs the sieve a
   real focus site.
2. **The gap running into notation** — `\sum_{i=1}`, `\frac 1 N`, and now **pgfplots axis
   options** and `IoU, we selected conf=0.5`, where the gap crossed a comma into a
   different parameter.
3. **The reported value read as a rule** — the largest class by far, and the one that
   costs the numerator its 7 papers.
4. **The name that is not the term** — not a gap fault at all, but the reason 4 labels in
   this census were wrong. No regex over the term can reach it; it needs the AP@50 family
   as a second detector.

Per the rule tick 50 set and tick 51 paid for, the repair and the re-measure of all three
frames are **one operation**, and that is the next tick. Stratum A's 45 invoker labels
remain untested by the name check, and that is written here so it is not discovered later.
