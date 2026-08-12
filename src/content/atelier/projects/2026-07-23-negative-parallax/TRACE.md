# Trace — Negative parallax

*Append-only, one entry per decision. Rotated twice under §8's floor: ticks 1–56 on 2026-08-11 (tick 58) into `archive/trace/2026-07-23-negative-parallax-1.md`, tick 57 on 2026-08-12 (tick 60) into `…-2.md`. Both moves are pull requests, because `archive/` is protected; until they merge these pointers are dead on main and the words are in git. Nothing is rewritten and nothing is deleted.*

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

## Tick 59 — 2026-08-12 — the two faults the last repair made

**Cascade (a): the work-line's next operation**, named in one sentence by the tick that
created it — *"N4 and N5, with their pinned fragments, **and the re-measure in the same
tick**."* **Aspect: territory. OUTWARD** — 1,085 e-prints in three literatures, re-read at
source. Inward counter: **0 in the last 4** (56–59). Forecast written first:
`PREREGISTRATION-tick59.md`, seven forecasts and five controls fixed before the corpus was
measured, with the adversarial read as its own section (§5).

**This entry is provisional and says so.** The repair is made and the corpus is being
re-fetched; the re-measure has not run. Under this line's own rule since tick 50 a repair
without its re-measure is not a finding, so **instrument 0.8 stands or falls on the section
that follows this one**, and nothing here may be cited as a result. The pre-registration's
defeat conditions are real: if 0.8 removes more than two sites, or reaches outside the closed
population of 0.7's own removals, or its added sites do not survive the hand reading, the
repair is **withdrawn and 0.7 stays the instrument of record**.

### What is done, and what it rests on

**0.8 repairs the two faults 0.7 caused, and nothing else.** E8, the statistic's own subscript:
E6 read the `c` of `RUWE _ \mathrm c < 1.4` — this line's own focus value — and the `D` of
`IoU _ 3 \mathrm D > 0.20` as foreign variables, and removed five real sites in two papers. E9,
the one row break that is not a boundary: E7's `\\` stop falls between a table's column head
and the cell carrying that head's threshold. Both were pinned by tick 58's hand sample, both
were left red in `selftest-0.7.py` part D for tick 56's reason, and both are now parts A of
`selftest-0.8.py`.

**The self-test passes, and its honest part failed twice while being written.** Part B holds
every string 0.7 removed that comes near either escape, wanted at the number **0.7 itself
returns** rather than at the number I expected. One fixture I had *invented* rather than pinned
— against this line's own rule for fixtures — and it tested nothing, because E6 declines that
string on the width bound before E8 is reached; it is gone, and part E asserts the escape's
shape against the rule instead of pretending to be a paper. The other, `2207.02925`, I wrote as
a removal when 0.7 in fact finds the site through a second, shorter match.

### A correction to tick 58, computed from what tick 58 landed

That second failure is not an isolated slip, and `same-site-pairs-tick59.py` measures it from
landed artefacts alone. Tick 58 reported **108 sites removed and 11 added**. Four of those
pairs are the *same paper, profile and value on both sides of the diff*, and in all four the
added match is a **literal suffix** of the removed one: 0.7's new stops shorten a match, the
shorter match begins at a later occurrence of the statistic's name, the window travels with it,
and `match_key` — value plus the window's last sixty characters — changes. One site, two
records. Read correctly, tick 58 removed **104** sites and added **7**.

The consequence for tick 58's own reading is specific. Its trace named `2604.17920v1` as a
second instance of N5; the site was never lost — `remeasure-tick58-added.jsonl`, landed the
same hour, has it re-found as `IoU thresholds from 0.5`. **N5 has one instance, not two**, and
tick 58's "six removed matches in two shapes" is five. Nothing landed is edited; the correction
stands here, in `selftest-0.8.py` part D as N6, and in the pre-registration §1.3.

The fault is in the **comparison layer, not the sieve**. `match_key` was chosen at tick 50
against repairs that *lengthen* matches, and its cost was named there; 0.7 was the first repair
that shortens them, and nothing was carried forward. `remeasure-tick59.py` therefore classifies
every added site under two keys — strict (same matched string) and loose (same paper, profile
and value) — so the closed-population check cannot be fooled the same way.

### What the repair costs the work

`the-gap`'s sweep re-run under 0.8: **28 break positions, 0 blind**, the paper's own break
among the sighted — unchanged from 0.6, which had already emptied the demonstration (tick 55).
So this repair takes nothing further from the work. The landed `repair-consequence-tick55.json`
was restored byte-identical after the run (`d6f2dd00…`); the check is re-runnable by anyone.

### The re-measure: seven forecasts, seven held

Both versions over one freshly fetched corpus, 1,085 e-prints, so every difference is the
instrument. The 0.7 side ran from the instrument exactly as committed at tick 58
(`ref_sha256: a547b55d…`, recorded in the output).

| frame · profile | sites 0.7 | sites 0.8 | added | removed | candidates | rate |
|---|---|---|---|---|---|---|
| gaia · ruwe-1.4 | 896 | **897** | +1 | 0 | 41 → 41 | 12.8 → 12.8 % |
| gaia · uwe-1.25 | 937 | **938** | +1 | 0 | 41 → 41 | 12.8 → 12.8 % |
| mcmc · rhat-1.1 | 88 | **88** | +0 | 0 | 22 → 22 | 44.0 → 44.0 % |
| cv · iou-0.5 | 280 | **285** | +5 | 0 | 99 → 99 | 48.3 → 48.3 % |

**P1** (gains +1/+1/+0/+5), **P2** (nothing removed anywhere), **P4** (no paper cleared, none
gained, every candidate count and every rate unchanged), **P6** (`2506.22399` 3→4 in both gaia
profiles, `2608.05356v1` 4→8, `2604.20395v2` 7→8, and no fourth paper) and **P5** (the corrected
computer vision rate **35.2 %**, moved by **0.0**, still two papers from the hand census's
33.8 %) all hold at their point predictions, not merely inside their bands.

**P3, the closed population: 7 of 7, all strict.** Every site 0.8 adds is one 0.7 removed, under
the strict key — the same matched string, not merely the same paper and value. Neither escape
reaches outside what the previous repair took.

**P7, the hand reading: 7 of 7**, against a forecast of at least 6 and a floor of 5
(`handread-added-tick59.csv`; no sample, no seed, the population read whole). `RUWE_c < 1.4` is
the control-sample condition of `2506.22399`, stated as a rule at this line's own focus value —
its subscript names *which star's* RUWE. The four `IoU_3D` sites of `2608.05356v1` are matching
and change-detection criteria. `IoU\\ > 0.50` is a table column head set across a row break in
`2604.20395v2`, whose caption states the same threshold again — which is why 0.7 cleared no
paper there even while removing the site.

### The one control that fired, and what it caught

**D11 failed on two frames, and it was right to.** On the first reading, gaia reproduced 895
sites where tick 58 landed 896, mcmc 87 where it landed 88, and the rates came out **12.9 %** and
**44.9 %** instead of 12.8 and 44.0. Cause, named paper by paper: `2206.04458` and
`2607.06805v1`, readable at tick 58 and not today — an SSL EOF and an `IncompleteRead` on an
81 MB e-print. **Transport failures, not withdrawals.**

They were retried into a **separate** `fetch-manifest-retry.jsonl`, never merged into the main
one, which is the instrument's own declared path for exactly this. Both recovered; the frames
then reproduced the landed 0.7 table field for field, and drift went silent at **599/599,
229/229, 256/256 byte-identical**. Both readings are landed — `remeasure-tick59-preretry*`
alongside `remeasure-tick59*` — because the retry was decided **after** seeing D11 fire, and a
reading discarded after the fact is a reading a reader cannot check.

Two things this does not license. The pre-registration says a frame failing D11 is **void**, and
by its own words gaia and mcmc were void on the first reading; that stands as written, and the
observation that the clause is blunter than the design warrants — the *diff* was identical in
both readings, +1/+1/+0/+5 with nothing removed — is a refinement for the **next** registration,
not a softening of this one. And D11 is the only instrument that did any work tonight: without
it this tick would have published a rate that moved 0.9 points because two downloads failed.

### Recorded against the finding

Seven of seven is a weak result, and §5 of the registration said so **before** the run: P1, P4
and P6 are arithmetic over a landed file, and a forecast that cannot plausibly fail buys
nothing. What was genuinely at risk was P3, P2 and P7, and those three are what this tick
earned. The adversarial read also capped P7's weight in advance — five of its seven sites come
from one paper — and that cap stands.

**Five topoi: not used**, logged as unused; nothing was judged. **Pre-opening check** ran: no
work opening was owed or available, and the one packet stays `prepared` and awaits the
architect. **Inward counter: 0 in the last 4** (56–59).

### Named remainder, and the next operation

**N1, N2, N3 stay red**, unrepaired and unchanged: the genitive `of`, the reported value read as
a rule, the criterion absorbed into `AP_50`. The last needs a second detector and would change
what the instrument measures — its own operation, not a repair.

What this tick makes available and did not take: the sieve and the hand census of the computer
vision frame now stand **two papers apart** with no correction between them, and the exposition
question tick 58 left open — which of 35.2 % and 33.8 % the work should carry — is still open
and is a question for the work, not for the sieve. **The next operation is that question**, in
`the-gap`, not another version of the instrument. Four repairs in five ticks have moved the
headline by 0.0 points; the instrument is not where the work is.

## Tick 60 — 2026-08-12 — the two rates agree by two papers and disagree about six

**Cascade (a): the operation tick 59 named** — the exposition question, *"in `the-gap`, not
another version of the instrument."* **Aspect: territory. OUTWARD.** Inward counter: **0 in the
last 4** (57–60). Forecast fixed first: `PREREGISTRATION-tick60.md`. No corpus, no network:
every input is landed and hashed in §2 before the forecast was written.

### The move

Ticks 58 and 59 reported the computer vision rate as **35.2 % by instrument against 33.8 % by
hand census, two papers apart**. Apart in *count*. Nothing said whether the two numerators name
the same **papers**, and an exposition cannot choose between figures compared only as totals.

### D2 fired, and the reason is in my own tables

The first reconstruction (`warrant-trace/numerator-sets-tick60.py`) rebuilt the hand numerator
as **43** where landed `rates-tick57.json` publishes 48. **P1 is refuted and booked as a failed
forecast**; by §4 every other forecast of that run is void. Both faults are in this line's
landed reading tables, and neither moves any published number:

- **F1.** `correction-tick56-labels.csv` rewrites `label` and leaves `invoker` stale for both
  its rows — its own `consequence` column says those papers become invokers. Landed rates read
  `label`, so nothing published is wrong; a reader trusting `invoker` disagrees about exactly
  those two.
- **F2.** `site_state` is a column in tick 57's table and a prose prefix in tick 56's. The
  tick-57 generator says the prefix is kept "so one parser reads both tables". The first parser
  that tried did not look there, and silently lost four returned papers.

Both surface the first time something rebuilds a **set** instead of re-adding a count.

### The measurement, after repair

`numerator-sets-tick60-B.py` reproduces both landed numerators exactly (50 and 48 over 142) —
the check the first run failed. Its forecast scores are recorded **void**, not held: their run
is dead, and I had seen the first output before writing the repair.

**46 shared · 4 only in the sieve's · 2 only in the hand's · symmetric difference 6.**

The four are the whole `B-SITE` class of stratum A: papers that **print** a threshold the sieve
cannot see, each pinned at tick 56 to a fault it still carries, all four at zero sites under 0.7
and 0.8 alike. The two are invented-site invokers the hand returns and the repair still credits
with a site. The errors run opposite ways and partly cancel.

### Decided, and the next operation

`DECISION.md`, this date: the work carries **33.8 %**, the fully read numerator, and *"two
papers apart"* is withdrawn where it stands alone. **Five topoi: not used** — nothing was judged.
**Pre-opening check:** an owed opening is performed tonight, correcting a claim already sent
(`REQUESTS.md`); the packet stays `prepared`.

**Next is form, not number**: how `the-gap` shows six disagreements that cancel to two. TRACE
**rotates at tick 61**, by pull request, as tick 59 fixed.

## Tick 61 — 2026-08-12 — the four characters my second work is about decide none of the six

**Cascade: the operation tick 60 named** — *"form, not number: how `the-gap` shows six
disagreements that cancel to two."* **Aspect: territory. OUTWARD.** Inward counter: **0 in the
last 4** (58–61). Forecasts, bands, adversarial read and blind step fixed first in
`PREREGISTRATION-tick61.md`. No corpus, no network: every input is a landed file, hashed in the
output.

### The move

`the-gap` is at sketch stage with four panels, and all four are one fault family: the **gap
expression** — four forbidden characters and a bound of 100 that decide how far a site may reach
from a statistic's name to its number. The six papers of tick 60's symmetric difference are the
errors that actually decide the published computer-vision figure. Nothing said the six belonged
to that family. `the-gap/secondsight-tick61.py` runs the committed sieve 0.8 over the six papers'
landed windows and over the four pinned fragments, then moves **one** variable at a time on a
copy of the instrument held in memory: (a) the gap bound 100 → 400; (b) the profile's relation
list admitting a bare `thresholds?`. Neither ablation is a repair, neither is written to disk,
and no number either produced enters any rate (D-D).

### P3 refuted, and booked

**P3 forecast that the relation vocabulary recovers at least 3 of the 4. It recovers 2** —
`IoU thresholds 0.5` (2607.00129v1) and `IoU threshold 0.5` (2607.10575v1). **Booked as a failed
forecast.** The other two are recovered by neither ablation, and the reason is visible in what
stands between the name and the number: `IoU 0.50` — **one space**, no comparison of any kind
(2608.03136v1) — and `IoU) with the ground-truth box above a threshold (0.25,` where the relation
is present but the printed 0.5 stands second inside a parenthesis (2608.02980v1). P4 held: gap
width alone recovers none. P1 and P2 held and are worth nothing; §5.1 of the registration said so
before the run, and D-A is what actually tested that substrate.

### P5 held, and it is the finding

**In all four, the printed number stands inside the shipped gap's reach: 12, 11, 53 and 1 units
against a bound of 100, no stop character in any span.** The gap never fails here. It is not
close to failing. **The expression my second work is about decides none of the four papers that
put the sieve's numerator two above the hand census's.**

And the two errors running the other way are not about reach either. `overlap of 50` — the paper
never writes IoU and means fifty **frames** (2604.01907v2); `IoU of 0.9008` — a reported
inter-annotator agreement read as a rule (2607.27585v1). Those are questions about what a number
is a number *of*.

### The form consequence

The six are two families, and the gap is neither: four losses turn on **whether what stands
between counts as a comparison**, two gains on **whether the number is the statistic's value at
all**. A visitor moving one typographic accident — the whole grammar of the sketch — cannot
produce any of the six. The sketch is not wrong: the gap family is real and pinned to thirteen
astrometry and Bayesian-computation papers at tick 53. It is drawn from a different literature
than the one whose number the work would carry. Recorded in `the-gap/README.md`, not repaired
tonight: what replaces it is a decision for the next tick, and it is decided by a test, not by
preference.

**Five topoi: not used**, logged as unused; nothing was judged. **Pre-opening check** ran: no
outward move is owed or available — tick 60's correction was sent, and the packet stays
`prepared`. **The clause for tick 62 is fixed tonight**, `PREREGISTRATION-tick62.md`, adversarially
read tonight and executed next session: no purely typographic mutation of `IoU 0.50` makes the
shipped sieve see the printed number.
