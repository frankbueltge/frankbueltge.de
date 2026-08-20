# Trace — Negative parallax

*Append-only, one entry per decision. Rotated three times under §8's floor: ticks 1–56 on 2026-08-11 (tick 58) into `archive/trace/2026-07-23-negative-parallax-1.md`, tick 57 on 2026-08-12 (tick 60) into `…-2.md`, tick 58 on 2026-08-12 (tick 64) into `…-3.md`. The first two moves were pull requests, because `archive/` was protected, and both are now merged and live on main; the third lands directly, the path having become eligible on 2026-08-12. Nothing is rewritten and nothing is deleted.*

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

## Tick 62 — 2026-08-12 — every accident there is, and the word that was never printed

**Cascade (a): the line's live clause awaiting its test** (§8), fixed at the close of tick 61 in
`PREREGISTRATION-tick62.md` and adversarially read there, in the earlier session. **Aspect:
territory. OUTWARD.** Inward counter: **0 in the last 4** (59–62). No corpus, no network: two
landed fragments, the shipped sieve 0.8 unmodified, every input hashed in the output.

### The move

`the-gap/typographic-tick62.py` enumerates **every purely typographic single mutation** of two
pinned tick-56 fragments — at each position a space, a newline, a blank line, the reader's own
`<<CITE:x>>` marker, or the deletion of the character standing there; at each space a newline, a
tab or a deletion — and runs the shipped instrument over all of them. **866 mutants**: 399 over
`a single COCO-style AP (IoU 0.50 : 0.05 : 0.95 …)` (C1, the extreme case) and 467 over
`… at IoU threshold 0.5` (C2, the control). Insertions were enumerated at N+1 points where §2
implies N; the executed set is a **superset** of the pre-registered one, which can only refute a
clause and never hold it falsely. Both counts are recorded per fragment.

### C1 and C2 both held — and not by one site

**Zero mutants recover the printed threshold. Zero mutants return a site at all.** Not a
near miss, not an off-target match: across 866 typographic accidents the instrument stays silent.
D-E held (generated == implied), D-F held (the unmutated fragments return nothing, reproducing
tick 61), D-G held (only new files under `the-gap/`).

### The control, and what it actually found

The tick-61 adversarial read called C1 "close to unfalsifiable by construction" — the enumeration
excludes the one thing that could work. So the run carries a **harness control**, outside the
clause and excluded from it by §2: insert **one word** into each fragment. `IoU **of** 0.50` and
`IoU threshold **of** 0.5` both recover the printed value, with the same shipped profile, first
try. The zero is a fact about the fragments, not about the script.

That is the finding, and it is sharper than the clause asked for: the distance between a
threshold my instrument cannot see and one it reads correctly is **one relation word** — and a
word is exactly what the pre-registration forbids as a typographic accident. The gap the work is
about is measured in characters; the fault is measured in vocabulary.

**Weight, as fixed before the run:** one measurement over two fragments, not two independent
results (§4.4). **Five topoi: not used**, logged as unused; nothing was judged tonight.

**Pre-opening check — it fired, and the answer changed.** The team's decision on the Episode 6/7
candidate landed today (`c4d2377`, *"Entscheidung: veröffentlichen"*), so an opening is now **owed
and unperformed** — §5.1's named failure, an owed opening ageing while the practice builds
instruments. It is not performable from here: the packet is on unmerged PR #12 and a published
work writes to protected `works/`. Recorded with both blockers named in `REQUESTS.md`, and the
five-topoi deliberation is the next tick's first operation whether or not the merges have
happened. Without the check this would have gone unnoticed for a third tick — estimate, but a
well-founded one: it went unnoticed for the previous two.

The clause for tick 63 is fixed tonight in `PREREGISTRATION-tick63.md`, adversarially read
tonight, executed in a later session.

## Tick 63 — 2026-08-12 — one slot, thirty-two words, and none of them has to mean it

**Operation:** execute `PREREGISTRATION-tick63.md`, fixed and adversarially read at the close of
tick 62, in an earlier session. `the-gap/relationreach-tick63.py` → `relationreach-tick63.json`.
Landed inputs only; the shipped instrument (0.8) unmodified; no profile copied or moved; no
mutant string enters any rate.

### The move

For every relation alternative the profile itself declares — read out of
`profiles/iou-0.5.json`'s `rel` by the script and expanded back into literal tokens, never typed
into it — insert that token at every inter-word position of each of the **four `B-SITE`
fragments**, the class fixed at tick 60 as the papers that print a threshold the sieve cannot
see. **1,856 mutants.** Space-padded insertion at word boundaries joins and splits no word, so
the failure mode §4.2 named cannot occur, and every mutant string is recorded so a reader can
check that without re-running.

**A deviation, stated because its direction matters.** §2's parenthetical lists 22 tokens; the
profile yields **32** — the parenthetical omits the `thresholds? (of|at|is|was|set to)` family.
Unlike tick 62's superset, a larger token set can only push C1's count **up**, so it could make a
point band hold that the narrower set would refute. C1 is therefore scored on the 22 a reader of
the pre-registration would check against. **The two sets give the same answer**, which is why
this paragraph costs nothing but had to be written before the number was known.

### C1 refuted, C2 refuted, C3 held

**4 of 4, not 3.** Every fragment recovers. The paper C2 named as the one that would not —
`2608.02980v1`, where the relation is already printed and the 0.5 stands second in a parenthesis
— recovers like the rest: the match runs 56 characters from `IoU)` across `(0.25,` to `< 0.5`.
The parenthesis was never the obstacle. Two failed forecasts, booked.

**C3 held, and in a stronger form than it asked for.** Of 1,856 mutants, exactly **128 recover**
and **not one returns an off-target site**. Every recovery in all four papers sits at a **single
position** — immediately before the printed number — and at that one position **all 32 tokens
work**. D-H, D-I, D-J, D-K all held; no defeat condition fired.

### What the vocabulary turns out to be

Not a vocabulary. A **slot**. The four fragments differ typographically in every way the class
was built to represent — a hyphenated sweep, a colon-separated sweep, an apposition, a
parenthetical list — and behave identically. And `below`, `less than`, `lower than` and
`smaller than` recover the threshold exactly as `above` does: the instrument tests that a
comparison-shaped word **is present in one slot**, never what it says. A sieve reading for
warrants cannot tell "IoU above 0.5" from "IoU below 0.5". The loose tokens §4.3 warned about
(`of`, `from`) are not carrying the result — all 32 carry it equally, which is the same finding
from the other side.

**What it decides.** Tick 62's change of subject stands and is strengthened: the reader's
relation rule is the axis. But the edge I forecast is gone — there is no interesting boundary at
the parenthesis — and the honest reading is that the work's edge is somewhere I have not looked.
The direction-blindness is the candidate, and it is not the edge of the vocabulary's reach; it
is a hole in the middle of it.

**Weight, as fixed before the run (§4.4):** one measurement, one profile, one literature's
four-paper class. It measures **reach** and says nothing about **cost** — what a widened
vocabulary would do to the 205-paper frame is a corpus question and is not answered here.
**Five topoi: not used**, logged as unused; nothing was judged. **Pre-opening check: ran, touched
no decision** — this tick made no outward move; without it nothing would have changed (estimate);
its failure criterion did not fire.

The clause for tick 64 is fixed in `PREREGISTRATION-tick64.md`, written and adversarially read at
the close of this tick, to be executed in a later session.

## Tick 64 — 2026-08-12 — the hole I forecast is real, and one twentieth the size

**Operation:** execute `PREREGISTRATION-tick64.md`, fixed and adversarially read at the close of
tick 63, in an earlier session. `the-gap/directioncost-tick64.py` → `directioncost-tick64.json`.
Landed inputs only — the tick-57 site dump, sha `2cfc0d5d…`, 97 blocks and 292 sites as §1 read
them; the shipped instrument (0.8) unmodified; no profile copied or moved; no rate restated.
**Cascade (a): the line's open clause awaiting its test** (§8, architect 2026-08-12). **Aspect:
territory. OUTWARD** — the object is how one literature writes a threshold. Inward counter:
**0 in the last 4** (61–64).

### The three clauses

**C1 — refuted, low.** `UPPER` sites are **10 of 286 classified — 3.5 %**, against a band of
5–20 %. §3 fixed what that decides before the run and it is executed: the direction-blindness is
real in the fragments and **rare in the corpus**; it is recorded as an instrument property with
its measured size, and it is **not** the second work's edge. Robust to the one parse choice the
pre-registration left open (R1, below): 3.56 % under the alternative, the same ten sites.

**C2 — held.** Two paper blocks have every site classified `UPPER`: `2606.03748v1`, whose single
site is `IoU < 0.5`, and `2605.05616v1`, whose single site is `overlap DSC values … fall below
60%`. The carriers exist. Read as §3 wrote them and not to taste: **C1 refuted low with C2
holding is a pair §3 did not enumerate**, and the sentence that governs the work decision is
C1's. Two exhibits do not make an edge, and only one of them is even at the criterion's value.

**C3 — held, and not by the word §4.2 suspected.** `NEUTRAL` 223 · `LOWER` 53 · `UPPER` 10. The
adversarial read worried the plurality would be a fact about `of`. It is a fact about **`=`**:
95 of the 223, 42.6 % of the class, and 31 of those matches carry a LaTeX backslash —
`mIoU = \frac 1 N \sum_ i=1`, `xtick= 1`. The sieve is reading formulae, not flat statements.

### What the run found that no clause asked for

The dump is **0.6-era output** (rates-tick57: instrument 0.6), and two later repairs bear on
exactly this class: the profile's mean-form reject (P-C, tick 58) would drop **50 of the 292**
sites, 46 of them `NEUTRAL`; and **E6** (0.7, tick 58) was specified against `\sum_ i=1` and
`Algorithms & N =1` — strings still standing here. C3's plurality rests substantially on sites
the shipped instrument would no longer produce. Recorded, not absorbed: the pre-registration
fixed this dump as the source and the clause is scored on it.

And the share is **not** a cost to the published rate. The dump holds sites at every value; the
48.3 % / 33.8 % pair counts the focus value. Of the 128 sites at `0.5`, **five** are `UPPER` —
3.9 %. §3's "refuted high" branch, which would have opened a correction note against those two
figures, does not apply and no correction is owed.

### Two parse rules the pre-registration did not fix

Fixed in the script's docstring before the run and reported with the figure that shows their
cost. **R1**: where a value literal occurs more than once in a match, the last standalone
occurrence is the site's; the first-occurrence reading is computed beside it and changes the
class of **5 sites of 292**, none of them `UPPER`. **R2**: where every relation token stands
*after* the value, §2's rule yields `NONE` — **0 sites**, so the rule cost nothing here. Six
`NONE` sites remain, all of the shape `75 at single IoU threshold`: a criterion noun with no
comparison word at all.

**Weight (§4.5):** one literature, one profile, one landed dump. This measures what the
**instrument** counted, not what the papers say; a site the sieve never found cannot appear
here, and tick 63's four `B-SITE` papers are by definition absent. Nothing here is a
false-negative figure. **Five topoi: not used**, logged as unused. **Pre-opening check: ran,
touched no decision** — no outward move; without it nothing would have changed (estimate); its
failure criterion did not fire.

**No clause is written at the close of this tick.** The line's candidate edge is gone and it has
none awaiting test, so under §8 it does not hold the next session by right — a line at 64 worked
sessions against a bound of twelve, renewable once, does not get to renew itself by writing one
more forecast. The open question the run raised (what an `=`-heavy site set does to the
site-bearing denominator) is named here for whoever takes it up; the bound and the disposition
are the monthly review's under the symmetry rule, not a tick's.
