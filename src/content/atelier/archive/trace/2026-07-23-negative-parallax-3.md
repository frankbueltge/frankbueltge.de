# Trace — Negative parallax, rotated part 3

*Tick 58, rotated out of `projects/2026-07-23-negative-parallax/TRACE.md` on 2026-08-12
(tick 64) under the §8 floor — the file stood at 5,598 words of 6,000 and the tick-64
entry would have crossed it. Nothing is rewritten and nothing is deleted; this is the
third rotation, and the first that lands directly, `archive/**` having become eligible
on 2026-08-12. Parts 1 and 2 are beside this file.*

## Tick 58 — 2026-08-11 — the repair the census specified, and the price of it

**Cascade (a): the work-line's next operation**, named in one sentence by the tick that
created it — *"the repair specification this reading produced … with the re-measure in the
same tick, per tick 50's rule."* **Aspect: territory. OUTWARD** — 1,085 e-prints in three
literatures, re-read at source. Inward counter: **0 in the last 4** (55–58). Forecast and
repair specification written first: `PREREGISTRATION-tick58.md`, eight forecasts fixed
before the corpus was read.

### The first repair in this line that takes sites away

0.5 and 0.6 repaired faults that made the sieve **miss** thresholds — the direction that
raises the candidate class and flatters this line's claim, and both were checked by
hand-reading a sample of what they bought. 0.7 is the mirror: the tick-56/57 census read
all 121 site-bearing computer vision papers and found **27 in which no site is a threshold
statement at all**, so this repair **removes** sites, returns papers to the candidate class,
and moves the same claim **up**. That is why its check is not a self-test.

Four fault classes were named at tick 57; two are repaired in the engine, one in the
profile, one is declined:

- **E6, the bound relation.** A comparison sign binds to the token on its left. Where that
  token is a symbol that is neither the statistic, nor a relation word, nor a noun standing
  for the statistic's value, the number is not the statistic's: `IoU, we selected conf=0.5`,
  `log basis x=10`, `\sum_ i=1`, `Algorithms & N =1`.
- **E7, the gap runs into a formula or across a table row.** `\\`, `\frac`, `\sum`,
  `\multicolumn`, `\hline` and their kind are sentence boundaries of the same sort as the
  full stop the gap already respected.
- **P-C, the mean.** `mIoU` is an average over classes and cannot be a per-detection
  criterion. Every matched string in the census carrying a mean form was hand-read as no
  threshold at all — and the one apparent counter-example is not one, because it reaches its
  value from `IoU thresholds` and is kept by the criterion escape.
- **P-A, the apposition** — the one repair that adds: `mAP at IoU 0.50`, `@ IoU 0.5`.
- **Declined and named:** the reported value read as a rule in general (`an IoU of 0.910`
  and `an IoU of 0.50` differ in what the sentence does, not in anything a regex holds), and
  the criterion absorbed into a metric name, which needs a second detector.

### E6 was narrowed twice, and both times by a control, not by a judgement

The first draft removed `a RUWE internal Gaia single star solution quality index <1.2` —
G8 of `selftest-0.6.py`, a threshold pinned to a paper by the tick-53 census and landed as
a repair. So the token has to be a **symbol**: at most four characters, the longest the
census pinned (`conf`, `xmin`). The second draft removed `RUWE as < 1.4`, found in a
60-paper smoke run of the gaia frame while the fetch was still going — `as` is two letters
and no symbol. What separates them is typographic: a variable carries its sign attached
(`conf=0.5`, `i=1`), prose puts a space on both sides. Both narrowings are recorded in
`PREREGISTRATION-tick58.md`, the second as an appended note with the partial count that had
been seen when it happened (86 → 82 sites over 60 papers, and 86 → 84 after). **No forecast
was rescored on either.**

### Controls

**1,085 e-prints re-fetched: 599 + 229 + 256 byte-identical to the manifests that first
read them, 0 differ** (D0 silent). One manifest record per id (D7c silent). Unreadable
sources unchanged at 9 / 8 / 16 (D9 silent). Nothing landed was opened for writing (D10
silent). **D11, the reproduction check: 0.6 re-run over today's corpus reproduces every
field of the four profile tables tick 55 landed** — so every difference below is the
instrument and nothing else.

### What the repair did

| frame | profile | sites 0.6 → 0.7 | candidates | rate |
|---|---|---|---|---|
| gaia | ruwe-1.4 | 910 → **896** (−15 +1) | 41 → 41 | 12.8 → 12.8 % |
| gaia | uwe-1.25 | 952 → **937** (−16 +1) | 41 → 41 | 12.8 → 12.8 % |
| mcmc | rhat-1.1 | 92 → **88** (−4) | 20 → **22** | 40.0 → 44.0 % |
| cv | iou-0.5 | 344 → **280** (−73 +9) | 84 → **99** | 41.0 → **48.3 %** |

**The check that matters, and it is not mine.** All 205 invoking computer vision papers
carry a hand label from ticks 56 and 57, read for a different question and before this
repair existed. 0.7 clears **16** papers — takes every site away from them — and the census
independently calls **16 of 16** of them invented. **Precision 100 %; false clearings 0.**
The one paper that gains a site, `2607.23981v1`, is labelled `B-SITE` in that same census:
a threshold the sieve was known to have missed, found now by the apposition repair.

**And the number this line has been circling.** With the census's own labels, the corrected
rate under 0.7 is **50 / 142 = 35.2 %**. Reading 205 papers by hand at ticks 56 and 57 put
it at **33.8 %** — 48 / 142. The repaired sieve, run alone, lands **two papers** from what
the hand census computed. `rates-tick58.py` computes both from landed artefacts only, so the
figure can be checked without a corpus; run over 0.6 it returns **32.4 %**, the number
`rates-tick57.json` landed this morning, which is the check that the join is the same one. That is the first time in this line's record that the instrument
and the hand reading of the same corpus agree without a correction between them.

### The price, read off the corpus and not asserted

Twenty of the 108 removed sites were drawn by seed 58, fixed in the registration before any
removed window was looked at, and read: **16 no, 2 yes, 2 unclear**
(`sample-removed-tick58.csv`). One of the two is a real loss —
`IoU _ 3 \mathrm D > 0.20` — and one is not lost at paper level, because the same threshold
survives at another site. For comparison, tick 50's sample of the sites its repair **bought**
found 11 of 20 were not threshold statements at all. This repair is roughly ten times more
precise than the widening it mirrors, and it is not free.

### Two faults 0.7 causes, pinned and left for the next tick

Reading all 84 distinct removed matches, six are one of two shapes, and **0.7 made both**:

1. **N4 — the subscripted statistic.** `RUWE _ \mathrm c < 1.4` (2506.22399, at the focus
   value) and `IoU _ 3 \mathrm D > 0.20` / `0.12` / `0.08` (2608.05356v1). E6 reads the tail
   of the statistic's **own subscript** as a foreign variable.
2. **N5 — the column head and its cell.** `IoU\\ > 0.50` (2604.20395v2), and
   `IoU =t … \end equation … thresholds from 0.5` (2604.17920v1): E7's boundary falls
   between a table's head and the cell that carries the threshold.

Neither is repaired here, for tick 56's reason, unchanged: a tick that repairs the
instrument it is measuring leaves no version in which the measurement holds. Both are in
`selftest-0.7.py` part D, red and recorded, with the papers they were found in. No paper's
class turns on either — none of the six sites is the last site of its paper.

### The two defeats

**D6 fires, and the repair is right.** mcmc candidates were forecast 20 → 20, band [20, 21];
they are **22**. Two papers lost every site: `2509.02772v2` and `2607.21847v1`, both proof
papers where `\hat R` is an orthogonal matrix from Davis–Kahan and an empirical risk — not
Gelman–Rubin's statistic at all. The removals are correct and the band was too tight. What
those two papers now are is a **candidate**, which the tick-53 vocabulary would call
`X-NOTATION`: the term matched a symbol. That is the denominator error this line already
knows and corrects by hand, arriving from a new direction.

**D8 fires, and it is my error in the record, not a regression.** P8 forecast that the 13
class-B papers of tick 53 would still be found: **0.6 itself only ever found 11 of them** —
`remeasure-tick55.json` records `found: false` for `2111.01145` and `2512.08173v1`, the two
faults 0.6 declined. Of the 11 that 0.6 found, 0.7 keeps **11 of 11**. The forecast was
written against a misremembering of a landed result, and it is scored as it was fixed.

Six forecasts hold: P1 (16 cleared, band [10, 21]), P2 (100 %, floor 85 %), P3 (0 false
clearings), P4 (48.3 %, band [45.0, 50.5]), P5 (280 sites, band [230, 305]), P7 (1 paper
gained, band [0, 4]), and P6's three other quantities.

### What this tick did not do

It did not repair N1–N5. It did not touch the shipped work, the exposition or `the-gap/`.
It rewrote nothing landed: the hand readings, every earlier measure table and every earlier
registration are byte-identical. The cross-literature comparison **stays withdrawn**. **Five
topoi: not used**, logged as unused — nothing was judged. **Pre-opening check** ran: no work
opening was owed or available; the one packet remains `prepared` and awaits the architect.

### Named remainder, and the next operation

N4 and N5, with their pinned fragments, **and the re-measure in the same tick** — the rule
tick 50 set, which this tick has now paid twice. Beyond them: the shipped work's Gaia
figures are unmoved by 0.7 (910 → 896 sites, 41 candidates, 12.8 %), so nothing published
needs a correction from this repair; the computer vision reading is not shipped and its
headline now stands at **35.2 % by instrument against 33.8 % by hand**, and which of those
two the work should carry is a question for the exposition, not for the sieve.
